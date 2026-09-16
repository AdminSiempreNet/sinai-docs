import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const docsRoot = path.resolve('content/docs');
const triggerPattern = /<GuideImageTrigger\b[\s\S]*?<\/GuideImageTrigger>/g;

async function getMdxFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return getMdxFiles(entryPath);
    return entry.isFile() && entry.name.endsWith('.mdx') ? [entryPath] : [];
  }));
  return nested.flat();
}

function wrapConsecutiveTriggers(source) {
  const matches = [...source.matchAll(triggerPattern)];
  if (matches.length < 2) return { source, rows: 0 };

  const groups = [];
  const isInsideExistingRow = (match) => {
    const start = match.index ?? 0;
    return source.lastIndexOf('<GuideImageRow>', start) > source.lastIndexOf('</GuideImageRow>', start);
  };
  let group = [matches[0]];
  for (let index = 1; index < matches.length; index += 1) {
    const previous = matches[index - 1];
    const current = matches[index];
    const between = source.slice((previous.index ?? 0) + previous[0].length, current.index ?? 0);
    if (between.trim() === '') group.push(current);
    else {
      if (group.length > 1 && !isInsideExistingRow(group[0])) groups.push(group);
      group = [current];
    }
  }
  if (group.length > 1 && !isInsideExistingRow(group[0])) groups.push(group);
  if (groups.length === 0) return { source, rows: 0 };

  let result = '';
  let cursor = 0;
  for (const row of groups) {
    const first = row[0];
    const last = row.at(-1);
    const start = first.index ?? 0;
    const end = (last.index ?? 0) + last[0].length;
    result += source.slice(cursor, start);
    result += `<GuideImageRow>\n${row.map((trigger) => trigger[0]).join('\n')}\n</GuideImageRow>`;
    cursor = end;
  }
  result += source.slice(cursor);
  return { source: result, rows: groups.length };
}

const files = await getMdxFiles(docsRoot);
let changedFiles = 0;
let rows = 0;
for (const file of files) {
  const source = await readFile(file, 'utf8');
  const grouped = wrapConsecutiveTriggers(source);
  if (grouped.source === source) continue;
  await writeFile(file, grouped.source, 'utf8');
  changedFiles += 1;
  rows += grouped.rows;
}

console.log(`Grouped ${rows} consecutive screenshot rows across ${changedFiles} guide files.`);
