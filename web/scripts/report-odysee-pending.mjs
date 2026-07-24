import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const docsDirectory = path.resolve('content/docs');
const outputFile = path.resolve('reports/odysee-pending.csv');
const writeReport = process.argv.includes('--write');

async function getMdxFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return getMdxFiles(entryPath);
    return entry.isFile() && entry.name.endsWith('.mdx') ? [entryPath] : [];
  }));
  return files.flat();
}

function readAttribute(component, name) {
  return new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`).exec(component)?.[1] ?? '';
}

function csvCell(value) {
  return `"${value.replaceAll('"', '""')}"`;
}

const files = await getMdxFiles(docsDirectory);
const pendingVideos = [];

for (const file of files) {
  const content = await readFile(file, 'utf8');
  const relativePath = path.relative(docsDirectory, file).replaceAll('\\', '/');

  for (const match of content.matchAll(/<YouTube\b[\s\S]*?\/>/g)) {
    const component = match[0];
    if (readAttribute(component, 'odyseeUrl')) continue;

    pendingVideos.push({
      path: relativePath,
      youtubeId: readAttribute(component, 'id'),
      title: readAttribute(component, 'title'),
      odyseeUrl: '',
    });
  }
}

const csv = [
  'path,youtubeId,title,odyseeUrl',
  ...pendingVideos.map((video) => [video.path, video.youtubeId, video.title, video.odyseeUrl].map(csvCell).join(',')),
  '',
].join('\n');

if (writeReport) {
  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, csv, 'utf8');
  console.log(`Inventario creado: ${path.relative(process.cwd(), outputFile)} (${pendingVideos.length} videos)`);
} else {
  console.log(`Videos pendientes de Odysee: ${pendingVideos.length}`);
  console.log('Ejecuta con --write para crear el archivo CSV editable.');
}
