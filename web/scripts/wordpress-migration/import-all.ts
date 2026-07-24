import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { XMLParser } from 'fast-xml-parser';
import TurndownService from 'turndown';

type Value = Record<string, unknown>;
type Term = { slug: string; title: string; parent: string };

const dryRun = process.argv.includes('--dry-run');
const refresh = process.argv.includes('--refresh');
const webRoot = process.cwd();
const projectRoot = path.resolve(webRoot, '..');
const source = path.join(projectRoot, 'migration', 'wordpress', 'source', 'basedeconocimientosinai.WordPress.2026-07-15.xml');
const docsRoot = path.join(webRoot, 'content', 'docs');
const roleFolders: Record<string, string> = { administrativos: 'administrativo', docentes: 'docente', estudiantes: 'estudiante' };
const turndown = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-' });

function list<T>(value: T | T[] | undefined): T[] {
  return value === undefined ? [] : Array.isArray(value) ? value : [value];
}

function plain(value: unknown): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  const item = value as Value;
  return plain(item['#text'] ?? item['__cdata'] ?? item['#cdata']);
}

function normalized(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\*/g, '').replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();
}

function yaml(value: string): string {
  return JSON.stringify(value);
}

function youtubeId(url: string): string | undefined {
  return url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/)?.[1];
}

function collectElementor(value: unknown, output: { editors: string[]; videos: string[] }) {
  if (Array.isArray(value)) {
    value.forEach((child) => collectElementor(child, output));
    return;
  }
  if (!value || typeof value !== 'object') return;
  const node = value as Value;
  const settings = (node.settings ?? {}) as Value;
  if (node.widgetType === 'text-editor' && typeof settings.editor === 'string') output.editors.push(settings.editor);
  if (typeof settings.youtube_url === 'string') output.videos.push(settings.youtube_url);
  collectElementor(node.elements, output);
}

function documentContent(document: Value) {
  const encoded = plain(document['content:encoded']).trim();
  const meta = list(document['wp:postmeta'] as Value | Value[]);
  const rawElementor = meta.find((item) => plain(item['wp:meta_key']).trim() === '_elementor_data');
  const elementor = { editors: [] as string[], videos: [] as string[] };
  if (rawElementor) {
    const raw = plain(rawElementor['wp:meta_value']).trim();
    if (raw) collectElementor(JSON.parse(raw), elementor);
  }
  const raw = encoded || elementor.editors.join('\n');
  let markdown = (raw.includes('<') ? turndown.turndown(raw) : raw)
    .split('\n')
    .filter((line) => !/^https?:\/\/(?:www\.)?(?:youtu\.be|youtube\.com)\//.test(line.trim()))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  markdown = markdown
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" />')
    .replace(/[{}]/g, '\\$&');
  const urls = elementor.videos.concat(encoded.match(/https?:\/\/[^\s]+/g) ?? []);
  return { markdown, videos: [...new Set(urls.map(youtubeId).filter(Boolean))] as string[] };
}

async function fileTitle(file: string): Promise<string | undefined> {
  const content = await readFile(file, 'utf8');
  return content.match(/^---\s*[\s\S]*?^title:\s*["']?(.+?)["']?\s*$/m)?.[1];
}

async function resolveSegment(parent: string, term: Term): Promise<{ name: string; placeholder?: string }> {
  const exactFolder = path.join(parent, term.slug);
  if (existsSync(exactFolder)) return { name: term.slug };
  const exactPage = exactFolder + '.mdx';
  if (existsSync(exactPage)) return { name: term.slug, placeholder: exactPage };
  if (!existsSync(parent)) return { name: term.slug };
  for (const entry of await readdir(parent, { withFileTypes: true })) {
    const target = path.join(parent, entry.name);
    if (entry.isDirectory() && existsSync(path.join(target, 'meta.json'))) {
      const meta = JSON.parse(await readFile(path.join(target, 'meta.json'), 'utf8')) as { title?: string };
      if (meta.title && normalized(meta.title) === normalized(term.title)) return { name: entry.name };
    }
    if (entry.isFile() && entry.name.endsWith('.mdx')) {
      const title = await fileTitle(target);
      if (title && normalized(title) === normalized(term.title)) return { name: entry.name.slice(0, -4), placeholder: target };
    }
  }
  return { name: term.slug };
}

function categoryIcon(term: Term, depth: number): string | undefined {
  if (depth > 2) return undefined;
  const icons: Record<string, string> = {
    'capacitacion-documentada': 'BookOpenCheck',
    'procesos-de-temporada': 'CalendarClock',
    inicio: 'House', establecimiento: 'School', personal: 'Users', matricula: 'ClipboardPenLine',
    seguimiento: 'ChartNoAxesCombined', planeacion: 'NotebookPen', evaluacion: 'ClipboardCheck',
    promocion: 'Award', herramientas: 'Wrench',
  };
  return icons[term.slug] ?? 'Folder';
}

async function setMeta(directory: string, title: string, page?: string, icon?: string) {
  const metaPath = path.join(directory, 'meta.json');
  let meta: { title: string; pages: string[]; defaultOpen?: boolean; icon?: string } = { title, pages: [] };
  if (existsSync(metaPath)) meta = JSON.parse(await readFile(metaPath, 'utf8'));
  meta.title ||= title;
  meta.pages ||= [];
  if (page && !meta.pages.includes(page)) meta.pages.push(page);
  if (icon && !meta.icon) meta.icon = icon;
  if (!dryRun) {
    await mkdir(directory, { recursive: true });
    await writeFile(metaPath, JSON.stringify(meta, null, 2) + '\n', 'utf8');
  }
}

async function destination(roleDirectory: string, category: Term | undefined, terms: Map<string, Term>) {
  if (!category) {
    const fallback = { slug: 'contenido-sin-clasificar', title: 'Contenido sin clasificar', parent: '' };
    await setMeta(roleDirectory, path.basename(roleDirectory), fallback.slug);
    const folder = path.join(roleDirectory, fallback.slug);
    await setMeta(folder, fallback.title, undefined, 'Folder');
    return folder;
  }
  const lineage: Term[] = [];
  const seen = new Set<string>();
  let current: Term | undefined = category;
  while (current && !seen.has(current.slug)) {
    lineage.unshift(current);
    seen.add(current.slug);
    current = current.parent ? terms.get(current.parent) : undefined;
  }
  let directory = roleDirectory;
  for (let index = 0; index < lineage.length; index++) {
    const term = lineage[index];
    const resolved = await resolveSegment(directory, term);
    if (resolved.placeholder && existsSync(resolved.placeholder)) {
      const existing = await readFile(resolved.placeholder, 'utf8');
      if (!existing.includes('El contenido detallado se añadirá en la siguiente etapa.')) {
        throw new Error('No se puede convertir una página con contenido manual: ' + resolved.placeholder);
      }
      if (!dryRun) await rm(resolved.placeholder);
    }
    await setMeta(directory, path.basename(directory), resolved.name);
    directory = path.join(directory, resolved.name);
    await setMeta(directory, term.title.replace(/\*+$/, '').trim(), undefined, categoryIcon(term, index + 1));
  }
  return directory;
}

async function main() {
  const xml = await readFile(source, 'utf8');
  const parsed = new XMLParser({ ignoreAttributes: false, trimValues: false, parseTagValue: false }).parse(xml) as Value;
  const channel = (parsed.rss as Value).channel as Value;
  const terms = new Map<string, Term>();
  for (const item of list(channel['wp:term'] as Value | Value[])) {
    if (plain(item['wp:term_taxonomy']).trim() !== 'doc_category') continue;
    const slug = plain(item['wp:term_slug']).trim();
    if (slug) terms.set(slug, { slug, title: plain(item['wp:term_name']).trim(), parent: plain(item['wp:term_parent']).trim() });
  }
  const documents = list(channel.item as Value | Value[]).filter((item) =>
    plain(item['wp:post_type']).trim() === 'docs' && plain(item['wp:status']).trim() === 'publish',
  );
  const result = {
    imported: [] as string[],
    alreadyImported: [] as string[],
    conflicts: [] as { slug: string; reason: string }[],
    unclassified: [] as string[],
    multipleCategories: [] as { slug: string; selected: string; additional: string[] }[],
  };
  for (const document of documents) {
    const slug = plain(document['wp:post_name']).trim();
    const title = plain(document.title).trim();
    const wordpressId = Number(plain(document['wp:post_id']).trim());
    const categories = list(document.category as Value | Value[]);
    const roleSlug = categories.find((item) => item['@_domain'] === 'knowledge_base')?.['@_nicename'];
    const role = typeof roleSlug === 'string' ? roleFolders[roleSlug] : undefined;
    if (!role) {
      result.conflicts.push({ slug, reason: 'No se encontró un rol válido.' });
      continue;
    }
    const categorySlugs = categories.filter((item) => item['@_domain'] === 'doc_category').map((item) => String(item['@_nicename']));
    const selected = categorySlugs[0] ? terms.get(categorySlugs[0]) : undefined;
    if (!selected) result.unclassified.push(slug);
    if (categorySlugs.length > 1) result.multipleCategories.push({ slug, selected: categorySlugs[0], additional: categorySlugs.slice(1) });
    try {
      const folder = await destination(path.join(docsRoot, role), selected, terms);
      const target = path.join(folder, slug + '.mdx');
      if (existsSync(target)) {
        const existing = await readFile(target, 'utf8');
        const belongsToDocument = existing.includes('wordpressId: ' + wordpressId);
        if (belongsToDocument && !refresh) {
          result.alreadyImported.push(slug);
          continue;
        }
        if (!belongsToDocument && !existing.includes('El contenido detallado se añadirá en la siguiente etapa.')) {
          result.conflicts.push({ slug, reason: 'Ya existe un archivo diferente: ' + target });
          continue;
        }
      }
      const converted = documentContent(document);
      const description = converted.markdown.replace(/[*_#>]/g, '').replace(/\s+/g, ' ').slice(0, 160);
      const videos = converted.videos.map((id) => '<YouTube id=' + yaml(id) + ' title=' + yaml(title) + ' />').join('\n\n');
      const mdx = [
        '---',
        'title: ' + yaml(title),
        'description: ' + yaml(description),
        'wordpressId: ' + wordpressId,
        'legacyUrl: ' + yaml(plain(document.link).trim()),
        'lastModified: ' + yaml(plain(document['wp:post_date']).trim()),
        '---',
        '',
        converted.markdown,
        videos ? '\n' + videos : '',
        '',
      ].join('\n');
      await setMeta(folder, selected?.title ?? 'Contenido sin clasificar', slug);
      if (!dryRun) await writeFile(target, mdx, 'utf8');
      result.imported.push(slug);
    } catch (error) {
      result.conflicts.push({ slug, reason: error instanceof Error ? error.message : String(error) });
    }
  }
  const report = {
    mode: dryRun ? 'dry-run' : refresh ? 'mass-refresh' : 'mass-import',
    source,
    totals: {
      publishedDocuments: documents.length,
      imported: result.imported.length,
      alreadyImported: result.alreadyImported.length,
      conflicts: result.conflicts.length,
      unclassified: result.unclassified.length,
      multipleCategories: result.multipleCategories.length,
    },
    result,
    generatedAt: new Date().toISOString(),
  };
  if (!dryRun) {
    const reportFolder = path.join(projectRoot, 'migration', 'wordpress', 'reports');
    await mkdir(reportFolder, { recursive: true });
    await writeFile(path.join(reportFolder, 'latest-mass-import.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
  }
  console.log(JSON.stringify(report.totals, null, 2));
  if (result.conflicts.length) console.log(JSON.stringify(result.conflicts, null, 2));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
