import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';
import type { SortedResult } from 'fumadocs-core/search';
import { getLLMText } from '@/lib/get-llm-text';
import {
  expandSearchQueries,
  meaningfulTokens,
  normalizeSearchQuery,
  scoreTitleAgainstQueries,
  tokenMatchesText,
} from '@/lib/search-query';

export type DocsRole = 'administrativo' | 'docente' | 'estudiante';

export interface GuideDocument {
  title: string;
  description: string;
  url: string;
  content: string;
}

export {
  expandSearchQueries,
  meaningfulTokens,
  normalizeSearchQuery,
  scoreTitleAgainstQueries,
  tokenMatchesText,
} from '@/lib/search-query';

const ROLE_TAGS = new Set<DocsRole>(['administrativo', 'docente', 'estudiante']);

/**
 * Índice Orama compartido por la búsqueda UI y el asistente.
 * Español para morfología básica; el chat añade expansión y ranking por título.
 */
export const docsSearch = createFromSource(source, {
  language: 'spanish',
  async buildIndex(page) {
    const structuredData = await Promise.resolve(page.data.structuredData);
    const role = page.url.split('/').filter(Boolean)[1];
    const roleTag = ROLE_TAGS.has(role as DocsRole) ? (role as DocsRole) : undefined;

    return {
      id: page.url,
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      structuredData,
      tag: roleTag ? ['todos', roleTag] : 'todos',
    };
  },
});

const guideCache = createGuideCache();

export function getRoleFromPath(path: string): DocsRole | null {
  if (path.includes('/administrativo/')) return 'administrativo';
  if (path.includes('/docente/')) return 'docente';
  if (path.includes('/estudiante/')) return 'estudiante';
  return null;
}

/**
 * Recupera guías completas para el asistente:
 * Orama (español) + expansión de paráfrasis + ranking por título/descripción.
 */
export async function retrieveGuidesForChat(options: {
  query: string;
  queries?: string[];
  limit?: number;
  activeRole?: DocsRole | null;
}): Promise<{
  query: string;
  queries: string[];
  guides: GuideDocument[];
  matchCount: number;
}> {
  const limit = options.limit ?? 4;
  const activeRole = options.activeRole ?? null;
  const allQueries = expandSearchQueries([
    options.query,
    ...(options.queries ?? []),
  ]);

  // Orama: pocas variantes discriminativas para no diluir el ranking ni la latencia.
  const oramaQueries = prioritizeQueriesForOrama(allQueries).slice(0, 5);

  const scores = new Map<string, number>();

  // 1) Señal fuerte: overlap con título/descripción (tolera paráfrasis del título).
  for (const page of source.getPages()) {
    if (!('getText' in page.data)) continue;

    let best = scoreTitleAgainstQueries(
      page.data.title,
      page.data.description ?? '',
      page.url,
      allQueries,
    );

    if (best <= 0) continue;

    const role = getRoleFromPath(page.url);
    if (activeRole && role === activeRole) best += 45;
    else if (!role) best += 25;

    scores.set(page.url, (scores.get(page.url) ?? 0) + best);
  }

  // 2) Señal amplia: Orama full-text por cada variante prioritaria.
  const snippetLimit = Math.max(limit * 5, 20);
  const hits: SortedResult[] = [];

  for (const searchQuery of oramaQueries) {
    if (activeRole) {
      hits.push(
        ...(await docsSearch.search(searchQuery, {
          tag: activeRole,
          limit: snippetLimit,
        })),
      );
    }

    hits.push(
      ...(await docsSearch.search(searchQuery, {
        tag: 'todos',
        limit: snippetLimit,
      })),
    );
  }

  for (const [index, result] of hits.entries()) {
    const pageUrl = result.url.split('#')[0] ?? result.url;
    let score = scores.get(pageUrl) ?? 0;

    score += Math.max(snippetLimit - (index % snippetLimit), 1);
    if (result.type === 'page') score += 35;
    if (result.type === 'heading') score += 16;
    if (result.type === 'text') score += 5;

    const role = getRoleFromPath(pageUrl);
    if (activeRole && role === activeRole) score += 20;
    if (!role) score += 10;

    const content = normalizeSearchQuery(String(result.content ?? ''));
    for (const searchQuery of oramaQueries) {
      const tokens = meaningfulTokens(searchQuery);
      const overlap = tokens.filter((token) => tokenMatchesText(content, token)).length;
      score += overlap * 12;
    }

    scores.set(pageUrl, score);
  }

  const rankedUrls = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([url]) => url)
    .slice(0, limit);

  const guides = (
    await Promise.all(rankedUrls.map((url) => guideCache.get(url)))
  ).filter((guide): guide is GuideDocument => guide !== null);

  return {
    query: options.query,
    queries: allQueries,
    guides,
    matchCount: hits.length + scores.size,
  };
}

function prioritizeQueriesForOrama(queries: string[]): string[] {
  return [...queries].sort((a, b) => {
    const score = (value: string) => {
      const tokens = meaningfulTokens(value);
      const hasSinai = value.includes('sinai') ? 3 : 0;
      return hasSinai + tokens.length * 2 + (value.split(' ').length <= 4 ? 2 : 0);
    };
    return score(b) - score(a);
  });
}

function createGuideCache() {
  const cache = new Map<string, Promise<GuideDocument | null>>();

  return {
    get(url: string): Promise<GuideDocument | null> {
      const cached = cache.get(url);
      if (cached) return cached;

      const promise = (async () => {
        const page = source.getPages().find((item) => item.url === url);
        if (!page || !('getText' in page.data)) return null;

        return {
          title: page.data.title,
          description: page.data.description ?? '',
          url: page.url,
          content: await getLLMText(page),
        } satisfies GuideDocument;
      })();

      cache.set(url, promise);
      return promise;
    },
  };
}
