import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const docsDirectory = path.resolve('content/docs');
const apply = process.argv.includes('--apply');

async function getMdxFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return getMdxFiles(entryPath);
    return entry.isFile() && entry.name.endsWith('.mdx') ? [entryPath] : [];
  }));
  return files.flat();
}

function normalizeHeadingDepth(content) {
  const headings = [...content.matchAll(/^(#{2,6})\s+/gm)];
  if (headings.length === 0) return content;

  const minimumDepth = Math.min(...headings.map((heading) => heading[1].length));
  const offset = Math.max(0, minimumDepth - 2);
  let previousDepth = 1;

  return content.replace(/^(#{2,6})(\s+)/gm, (_, hashes, spacing) => {
    const normalizedDepth = Math.max(2, hashes.length - offset);
    // A heading may only descend one level at a time. This produces a valid
    // tree for the right-side navigation even in imported WordPress content.
    const nextDepth = Math.min(normalizedDepth, previousDepth + 1);
    previousDepth = nextDepth;
    return '#'.repeat(nextDepth) + spacing;
  });
}

function splitFrontmatter(content) {
  const frontmatter = /\uFEFF?---\r?\n[\s\S]*?\r?\n---\r?\n?/.exec(content);
  if (!frontmatter || frontmatter.index === undefined) return { frontmatter: '', body: content };

  return {
    frontmatter: frontmatter[0],
    // This also repairs files processed by the previous version of this script,
    // which accidentally placed the tutorial before the frontmatter.
    body: `${content.slice(0, frontmatter.index)}${content.slice(frontmatter.index + frontmatter[0].length)}`,
  };
}

function markAsGuide(frontmatter, body) {
  if (!/<GuideVideos(?:\s+compact)?>/.test(body) || /^guide:\s*true\s*$/m.test(frontmatter)) {
    return frontmatter;
  }

  // Keep the guide declaration close to the public page metadata. Legacy
  // identifiers remain untouched below it for traceability to WordPress.
  if (/^description:.*$/m.test(frontmatter)) {
    return frontmatter.replace(/^(description:.*)$/m, '$1\n' + 'guide: true');
  }

  return frontmatter.replace(/^(---\r?\n)/, '$1guide: true\n');
}

function removeWordPressStyleArtifacts(content) {
  // The WordPress export occasionally embedded Elementor CSS next to a
  // capture. It is prose in MDX, not a stylesheet, so it becomes visible to
  // readers. This expression removes only a complete Elementor declaration
  // and deliberately leaves the adjacent image or paragraph untouched.
  return content
    .replace(/\/\\\*!\s*elementor[\s\S]*?\\\}(?=\s*(?:\[?<img|<img|<br\s*\/?>|\r?\n|$))/gi, '')
    .replace(/<br\s*\/?>\s*(?=(?:\[?<img|<img|\r?\n|$))/gi, '');
}

function getImageAlternativeText(src) {
  const imageName = decodeURIComponent(src.split('/').at(-1)?.split('?')[0] ?? '')
    .replace(/\.(avif|gif|jpe?g|png|svg|webp)$/i, '')
    .replace(/-\d{2,4}x\d{2,4}$/i, '')
    .replace(/^\d+[-_\s]*/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (/placeholder|captura no disponible/i.test(imageName)) return 'Captura no disponible';
  return imageName ? `Captura de ${imageName}` : 'Captura de pantalla de SINAI';
}

function addImageAlternativeText(content) {
  return content.replace(/<img\b[^\r\n>]*>/gi, (tag) => {
    const src = /\bsrc\s*=\s*(["'])(.*?)\1/i.exec(tag)?.[2];
    if (!src) return tag;

    const alternatives = [...tag.matchAll(/\balt\s*=\s*(["'])(.*?)\1/gi)].map((match) => match[2].trim());
    const alt = alternatives.find(Boolean) ?? getImageAlternativeText(src);
    const withoutAlternativeText = tag.replace(/\s+\balt\s*=\s*(["'])(.*?)\1/gi, '');

    return withoutAlternativeText.replace(/<img\b/i, `<img alt="${alt}"`);
  });
}

function addWrittenGuideSection(content) {
  if (!/<GuideVideos(?:\s+compact)?>/.test(content) || /<GuideStep\b/.test(content)) return content;

  const closingTag = '</GuideVideos>';
  const videoEnd = content.indexOf(closingTag);
  if (videoEnd === -1) return content;

  const beforeWrittenGuide = content.slice(0, videoEnd + closingTag.length);
  let writtenGuide = content.slice(videoEnd + closingTag.length).trimStart();
  if (!writtenGuide) return content;
  if (/^##\s+Gu.{0,5}paso a paso\s*$/im.test(writtenGuide)) return content;

  // DocsPage already renders the frontmatter title as the page H1. WordPress
  // often repeated it immediately after the tutorial; remove that duplicate.
  writtenGuide = writtenGuide.replace(/^#\s+.+\r?\n+/, '');

  // The written material becomes a child of the common guide section. This
  // creates a stable Video -> Guide -> topic hierarchy for the right sidebar.
  writtenGuide = writtenGuide.replace(/^(#{2,5})(\s+)/gm, (_, hashes, spacing) => {
    return '#'.repeat(hashes.length + 1) + spacing;
  });

  return `${beforeWrittenGuide}\n\n## Guía paso a paso\n\n${writtenGuide}`;
}

function placeTutorialsFirst(content) {
  const guideVideoBlocks = [...content.matchAll(/<GuideVideos(?:\s+compact)?>([\s\S]*?)<\/GuideVideos>\s*/g)];
  let remaining = content.replace(/<GuideVideos(?:\s+compact)?>[\s\S]*?<\/GuideVideos>\s*/g, '');
  const standaloneVideos = [...remaining.matchAll(/<YouTube\b[\s\S]*?\/>\s*/g)];

  if (guideVideoBlocks.length === 0 && standaloneVideos.length === 0) return content;

  remaining = remaining.replace(/<YouTube\b[\s\S]*?\/>\s*/g, '');
  remaining = remaining.replace(/^## Video tutorial\s*\n+/m, '');

  const videos = [
    ...guideVideoBlocks.map((block) => block[1].trim()),
    ...standaloneVideos.map((video) => video[0].trim()),
  ].filter(Boolean).join('\n\n');

  const tutorialSection = `## Video tutorial\n\n<GuideVideos>\n${videos}\n</GuideVideos>\n\n`;
  const summaryEnd = remaining.search(/<\/GuideSummary>\s*/);
  if (summaryEnd === -1) return tutorialSection + remaining.trimStart();

  const insertAt = summaryEnd + remaining.slice(summaryEnd).match(/^<\/GuideSummary>\s*/)[0].length;
  return `${remaining.slice(0, insertAt).trimEnd()}\n\n${tutorialSection}${remaining.slice(insertAt).trimStart()}`;
}

const files = await getMdxFiles(docsDirectory);
let tutorialsMoved = 0;
let headingsNormalized = 0;
let guidesMarked = 0;
let wordpressArtifactsRemoved = 0;
let writtenGuideSectionsAdded = 0;
let imageAlternativeTextsAdded = 0;

for (const file of files) {
  const original = await readFile(file, 'utf8');
  const { frontmatter, body } = splitFrontmatter(original);
  const withoutWordPressArtifacts = removeWordPressStyleArtifacts(body);
  const withTutorialsFirst = placeTutorialsFirst(withoutWordPressArtifacts);
  const withWrittenGuideSection = addWrittenGuideSection(withTutorialsFirst);
  const withImageAlternativeText = addImageAlternativeText(withWrittenGuideSection);
  const normalizedBody = normalizeHeadingDepth(withImageAlternativeText);
  const normalizedFrontmatter = markAsGuide(frontmatter, normalizedBody);
  const updated = `${normalizedFrontmatter}${normalizedBody}`;

  if (withTutorialsFirst !== withoutWordPressArtifacts) tutorialsMoved++;
  if (normalizedBody !== withImageAlternativeText) headingsNormalized++;
  if (normalizedFrontmatter !== frontmatter) guidesMarked++;
  if (withoutWordPressArtifacts !== body) wordpressArtifactsRemoved++;
  if (withWrittenGuideSection !== withTutorialsFirst) writtenGuideSectionsAdded++;
  if (withImageAlternativeText !== withWrittenGuideSection) imageAlternativeTextsAdded++;
  if (apply && updated !== original) await writeFile(file, updated, 'utf8');
}

console.log(`${apply ? 'Guías actualizadas' : 'Guías por actualizar'}: tutoriales=${tutorialsMoved}, secciones=${writtenGuideSectionsAdded}, jerarquías=${headingsNormalized}, guías=${guidesMarked}, residuosWordPress=${wordpressArtifactsRemoved}, textosAlternativos=${imageAlternativeTextsAdded}`);
