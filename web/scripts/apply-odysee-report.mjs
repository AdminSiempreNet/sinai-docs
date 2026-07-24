import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const docsDirectory = path.resolve('content/docs');
const reportFile = path.resolve('reports/odysee-pending.csv');

function parseCsv(content) {
  const rows = [];
  let cell = '';
  let row = [];
  let quoted = false;

  for (let index = 0; index < content.length; index++) {
    const character = content[index];
    const nextCharacter = content[index + 1];

    if (character === '"' && quoted && nextCharacter === '"') {
      cell += '"';
      index++;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && nextCharacter === '\n') index++;
      row.push(cell);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += character;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  const [headers, ...values] = rows;
  return values.map((value) => Object.fromEntries(headers.map((header, index) => [header, value[index] ?? ''])));
}

function isOdyseeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (url.hostname === 'odysee.com' || url.hostname.endsWith('.odysee.com'));
  } catch {
    return false;
  }
}

const report = parseCsv(await readFile(reportFile, 'utf8'));
const videos = report.filter((video) => video.odyseeUrl.trim());
let updated = 0;

for (const video of videos) {
  if (!isOdyseeUrl(video.odyseeUrl)) {
    throw new Error(`Enlace de Odysee no válido para ${video.path}: ${video.odyseeUrl}`);
  }

  const file = path.resolve(docsDirectory, video.path);
  if (!file.startsWith(docsDirectory)) throw new Error(`Ruta inválida: ${video.path}`);

  const original = await readFile(file, 'utf8');
  let foundVideo = false;
  const next = original.replace(/<YouTube\b[\s\S]*?\/>/g, (component) => {
    const id = /\bid\s*=\s*["']([^"']*)["']/.exec(component)?.[1];
    if (id !== video.youtubeId || /\bodyseeUrl\s*=/.test(component)) return component;

    foundVideo = true;
    return component.replace(/\s*\/>$/, `\n  odyseeUrl="${video.odyseeUrl}"\n/>`);
  });

  if (!foundVideo) throw new Error(`No se encontró el video ${video.youtubeId} en ${video.path}`);
  if (next !== original) {
    await writeFile(file, next, 'utf8');
    updated++;
  }
}

console.log(`Videos actualizados con Odysee: ${updated}`);
