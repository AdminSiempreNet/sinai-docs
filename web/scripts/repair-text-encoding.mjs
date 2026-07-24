import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const roots = ['app', 'components', 'content', 'lib', 'scripts'];
const extensions = new Set(['.css', '.json', '.md', '.mdx', '.ts', '.tsx']);
const apply = process.argv.includes('--apply');

const windows1252 = new Map([
  [0x20ac, 0x80], [0x201a, 0x82], [0x192, 0x83], [0x201e, 0x84], [0x2026, 0x85],
  [0x2020, 0x86], [0x2021, 0x87], [0x2c6, 0x88], [0x2030, 0x89], [0x160, 0x8a],
  [0x2039, 0x8b], [0x152, 0x8c], [0x17d, 0x8e], [0x2018, 0x91], [0x2019, 0x92],
  [0x201c, 0x93], [0x201d, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
  [0x2dc, 0x98], [0x2122, 0x99], [0x161, 0x9a], [0x203a, 0x9b], [0x153, 0x9c], [0x17e, 0x9e],
  [0x178, 0x9f],
]);

function scoreMojibake(text) {
  return (text.match(/\u00c3[\u0080-\u00bf]|\u00c2[\u0080-\u00bf]|\u00e2[\u0080-\u00bf\u20ac\u201a\u0192\u201e\u2026\u2020\u2021\u02c6\u2030\u0160\u2039\u0152\u017d\u2018\u2019\u201c\u201d\u2022\u2013\u2014\u02dc\u2122\u0161\u203a\u0153\u017e\u0178]{1,2}/g) ?? []).length;
}

function recoverSegment(segment) {
  const bytes = [];
  for (const character of segment) {
    const code = character.codePointAt(0);
    if (code <= 0xff) bytes.push(code);
    else if (windows1252.has(code)) bytes.push(windows1252.get(code));
    else return segment;
  }

  const recovered = Buffer.from(bytes).toString('utf8');
  if (recovered.includes('\ufffd') || scoreMojibake(recovered) >= scoreMojibake(segment)) return segment;
  return recovered;
}

function recoverUtf8(text) {
  let result = '';
  let segment = '';

  function flushSegment() {
    if (!segment) return;
    result += recoverSegment(segment);
    segment = '';
  }

  for (const character of text) {
    const code = character.codePointAt(0);
    if (code <= 0xff || windows1252.has(code)) {
      segment += character;
    } else {
      flushSegment();
      result += character;
    }
  }
  flushSegment();
  return result;
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectFiles(entryPath);
    return extensions.has(path.extname(entry.name)) ? [entryPath] : [];
  }));
  return groups.flat();
}

const files = (await Promise.all(roots.map((root) => collectFiles(path.resolve(root))))).flat();
const repaired = [];

for (const file of files) {
  const original = await readFile(file, 'utf8');
  const originalScore = scoreMojibake(original);
  if (originalScore === 0) continue;

  const recovered = recoverUtf8(original);
  const recoveredScore = scoreMojibake(recovered);
  if (recovered.includes('\ufffd') || recoveredScore >= originalScore) continue;

  repaired.push({ file: path.relative(process.cwd(), file), originalScore, recoveredScore });
  if (apply) await writeFile(file, recovered, 'utf8');
}

console.log(`${apply ? 'Archivos reparados' : 'Archivos reparables'}: ${repaired.length}`);
for (const item of repaired) console.log(`- ${item.file} (${item.originalScore} -> ${item.recoveredScore})`);
