import { readFile, readdir, writeFile, mkdir, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';

const docsDirectory = path.resolve('content/docs');
const publicDirectory = path.resolve('public/images/wordpress');
const wordpressBase = 'https://ayudasinai.siempre.net.co/wp-content/uploads/';
const imagePattern = /https:\/\/ayudasinai\.siempre\.net\.co\/wp-content\/uploads\/[^\s"')]+/g;
const concurrency = 8;

async function getMdxFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return getMdxFiles(entryPath);
    return entry.isFile() && entry.name.endsWith('.mdx') ? [entryPath] : [];
  }));
  return files.flat();
}

function getLocalPath(remoteUrl) {
  const remotePath = decodeURIComponent(new URL(remoteUrl).pathname);
  const relativePath = remotePath.replace('/wp-content/uploads/', '');
  const normalized = path.posix.normalize(relativePath);

  if (normalized.startsWith('../') || path.posix.isAbsolute(normalized)) {
    throw new Error(`Ruta remota no válida: ${remoteUrl}`);
  }

  return {
    filePath: path.join(publicDirectory, ...normalized.split('/')),
    publicUrl: `/images/wordpress/${normalized.split('/').map(encodeURIComponent).join('/')}`,
  };
}

async function exists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function download(remoteUrl) {
  const destination = getLocalPath(remoteUrl);
  if (await exists(destination.filePath)) return destination.publicUrl;

  await mkdir(path.dirname(destination.filePath), { recursive: true });
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(remoteUrl, { signal: AbortSignal.timeout(30_000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      await writeFile(destination.filePath, Buffer.from(await response.arrayBuffer()));
      return destination.publicUrl;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

async function runPool(items, worker) {
  const results = new Map();
  let nextIndex = 0;

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      const item = items[index];
      try {
        results.set(item, { value: await worker(item) });
      } catch (error) {
        results.set(item, { error });
      }
    }
  }));

  return results;
}

const files = await getMdxFiles(docsDirectory);
const contentByFile = new Map(await Promise.all(files.map(async (file) => [file, await readFile(file, 'utf8')])));
const urls = [...new Set([...contentByFile.values()].flatMap((content) => content.match(imagePattern) ?? []))];

console.log(`Descargando ${urls.length} imágenes únicas...`);
const downloads = await runPool(urls, download);
const failed = [...downloads].filter(([, result]) => result.error);

let updatedFiles = 0;
for (const [file, original] of contentByFile) {
  let updated = original;
  for (const [remoteUrl, result] of downloads) {
    if (result.value) updated = updated.replaceAll(remoteUrl, result.value);
  }
  if (updated !== original) {
    await writeFile(file, updated, 'utf8');
    updatedFiles++;
  }
}

console.log(`Imágenes locales: ${urls.length - failed.length}/${urls.length}`);
console.log(`Guías actualizadas: ${updatedFiles}`);
if (failed.length > 0) {
  console.error(`No fue posible descargar ${failed.length} imágenes:`);
  for (const [url, result] of failed) console.error(`- ${url}: ${result.error.message}`);
  process.exitCode = 1;
}
