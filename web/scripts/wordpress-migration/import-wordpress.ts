import { readFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { XMLParser } from 'fast-xml-parser';
import TurndownService from 'turndown';

type UnknownRecord = Record<string, unknown>;

const DEFAULT_SOURCE = path.resolve(
  process.cwd(),
  '..',
  'migration',
  'wordpress',
  'source',
  'basedeconocimientosinai.WordPress.2026-07-15.xml',
);

const args = new Map<string, string | true>();
for (let index = 2; index < process.argv.length; index++) {
  const argument = process.argv[index];
  if (!argument.startsWith('--')) continue;
  const [key, inlineValue] = argument.slice(2).split('=', 2);
  const next = process.argv[index + 1];
  if (inlineValue) args.set(key, inlineValue);
  else if (next && !next.startsWith('--')) {
    args.set(key, next);
    index++;
  } else args.set(key, true);
}

const sourcePath = path.resolve(String(args.get('source') ?? DEFAULT_SOURCE));
const slug = String(args.get('slug') ?? 'proceso-de-inicio-de-calendario');
const targetDirectory = path.resolve(
  String(
    args.get('target') ??
      path.join(
        process.cwd(),
        'content',
        'docs',
        'administrativo',
        'procesos-de-temporada',
        'inicio-de-calendario',
      ),
  ),
);
const dryRun = args.has('dry-run');

function array<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function scalar(value: unknown): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'object') {
    const record = value as UnknownRecord;
    return scalar(record['#text'] ?? record['__cdata'] ?? record['#cdata']);
  }
  return '';
}

function yaml(value: string): string {
  return JSON.stringify(value);
}

function youtubeId(url: string): string | undefined {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/,
  );
  return match?.[1];
}

function walkElementor(value: unknown, result: { html: string[]; videos: string[] }) {
  if (Array.isArray(value)) {
    for (const child of value) walkElementor(child, result);
    return;
  }
  if (!value || typeof value !== 'object') return;

  const node = value as UnknownRecord;
  const settings = (node.settings ?? {}) as UnknownRecord;
  if (node.widgetType === 'text-editor' && typeof settings.editor === 'string') {
    result.html.push(settings.editor);
  }
  for (const key of ['youtube_url', 'vimeo_url', 'dailymotion_url', 'videopress_url']) {
    if (typeof settings[key] === 'string') result.videos.push(settings[key]);
  }
  walkElementor(node.elements, result);
}

async function main() {
const xml = await readFile(sourcePath, 'utf8');
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  trimValues: false,
  parseTagValue: false,
});
const parsed = parser.parse(xml) as UnknownRecord;
const rss = parsed.rss as UnknownRecord;
const channel = rss.channel as UnknownRecord;
const items = array(channel.item as UnknownRecord | UnknownRecord[]);

const document = items.find(
  (item) =>
    scalar(item['wp:post_type']).trim() === 'docs' &&
    scalar(item['wp:post_name']).trim() === slug,
);
if (!document) throw new Error(`No se encontró el documento de WordPress: ${slug}`);

const status = scalar(document['wp:status']).trim();
if (status !== 'publish') throw new Error(`El documento ${slug} no está publicado (${status}).`);

const title = scalar(document.title).trim();
const link = scalar(document.link).trim();
const wordpressId = Number(scalar(document['wp:post_id']).trim());
const modified = scalar(document['wp:post_date']).trim();
const encoded = scalar(document['content:encoded']).trim();
const postMeta = array(document['wp:postmeta'] as UnknownRecord | UnknownRecord[]);
const elementorMeta = postMeta.find(
  (meta) => scalar(meta['wp:meta_key']).trim() === '_elementor_data',
);

const elementor = { html: [] as string[], videos: [] as string[] };
if (elementorMeta) {
  const raw = scalar(elementorMeta['wp:meta_value']).trim();
  if (raw) walkElementor(JSON.parse(raw), elementor);
}

const turndown = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-' });
const rawText = encoded || elementor.html.join('\n');
const markdown = (rawText.includes('<') ? turndown.turndown(rawText) : rawText)
  .split('\n')
  .filter((line) => !/^https?:\/\/(?:www\.)?(?:youtu\.be|youtube\.com)\//.test(line.trim()))
  .join('\n')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

const videoUrl = [...elementor.videos, ...encoded.match(/https?:\/\/[^\s]+/g) ?? []]
  .find((url) => youtubeId(url));
const videoId = videoUrl ? youtubeId(videoUrl) : undefined;
const description = markdown.replace(/[*_`#>]/g, '').replace(/\s+/g, ' ').slice(0, 160);

const mdx = `---
title: ${yaml(title)}
description: ${yaml(description)}
wordpressId: ${wordpressId}
legacyUrl: ${yaml(link)}
lastModified: ${yaml(modified)}
---

${markdown}
${videoId ? `\n<YouTube id=${yaml(videoId)} title=${yaml(title)} />\n` : ''}`;

const categoryMeta = `${JSON.stringify(
  {
    title: 'Inicio de calendario',
    defaultOpen: true,
    pages: [slug],
    icon: 'CalendarClock',
  },
  null,
  2,
)}\n`;

const report = {
  mode: dryRun ? 'dry-run' : 'pilot',
  source: sourcePath,
  wordpressId,
  slug,
  status,
  role: 'Administrativo',
  category: 'Inicio de calendario',
  sourceFormat: encoded ? 'content:encoded' : 'elementor',
  youtubeVideo: videoId ?? null,
  target: path.join(targetDirectory, `${slug}.mdx`),
  generatedAt: new Date().toISOString(),
};

if (!dryRun) {
  const oldPlaceholder = `${targetDirectory}.mdx`;
  if (existsSync(oldPlaceholder)) {
    const existing = await readFile(oldPlaceholder, 'utf8');
    if (!existing.includes('El contenido detallado se añadirá en la siguiente etapa.')) {
      throw new Error(`Se evitó sobrescribir contenido manual: ${oldPlaceholder}`);
    }
    await rm(oldPlaceholder);
  }

  await mkdir(targetDirectory, { recursive: true });
  const target = path.join(targetDirectory, `${slug}.mdx`);
  if (existsSync(target) && !(await readFile(target, 'utf8')).includes(`wordpressId: ${wordpressId}`)) {
    throw new Error(`Se evitó sobrescribir un documento diferente: ${target}`);
  }
  await writeFile(path.join(targetDirectory, 'meta.json'), categoryMeta, 'utf8');
  await writeFile(target, mdx, 'utf8');

  const reportDirectory = path.resolve(process.cwd(), '..', 'migration', 'wordpress', 'reports');
  await mkdir(reportDirectory, { recursive: true });
  await writeFile(
    path.join(reportDirectory, 'latest-pilot.json'),
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8',
  );
}

console.log(JSON.stringify(report, null, 2));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
