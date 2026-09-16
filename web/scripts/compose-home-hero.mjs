import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const brand = path.join(root, 'public/images/brand');
const out = path.join(root, 'public/images/home/sinai-knowledge-base.png');

const W = 1080;
const H = 1440;

async function punchBlackToAlpha(inputPath, threshold = 28) {
  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
    if (lum < threshold) data[i + 3] = 0;
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

async function circularizeIso(buffer, size) {
  const resized = await sharp(buffer)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = resized;
  const cx = info.width / 2;
  const cy = info.height / 2;
  const radius = Math.min(cx, cy) - 1;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      if (dx * dx + dy * dy > radius * radius) {
        data[(y * info.width + x) * 4 + 3] = 0;
      }
    }
  }

  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

function sceneSvg() {
  const nodes = [
    [120, 140], [260, 90], [410, 150], [560, 70], [710, 130], [880, 95], [980, 180],
    [160, 280], [320, 340], [480, 270], [650, 330], [820, 260], [960, 360],
    [100, 460], [280, 500], [780, 470], [940, 520],
    [180, 620], [860, 600], [240, 760], [820, 740],
  ];
  const links = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
    [0, 7], [1, 8], [2, 9], [4, 10], [5, 11], [6, 12],
    [7, 8], [8, 9], [9, 10], [10, 11], [11, 12],
    [7, 13], [8, 14], [10, 15], [11, 16],
    [13, 17], [15, 18], [17, 19], [18, 20],
  ];

  const lines = links
    .map(([a, b]) => {
      const [x1, y1] = nodes[a];
      const [x2, y2] = nodes[b];
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(130,175,255,0.20)" stroke-width="1.35"/>`;
    })
    .join('');

  const dots = nodes
    .map(([x, y], i) => {
      const green = i % 5 === 0;
      return `<circle cx="${x}" cy="${y}" r="${green ? 3.4 : 2.2}" fill="${green ? 'rgba(57,255,20,0.62)' : 'rgba(186,210,255,0.48)'}"/>`;
    })
    .join('');

  // Soft education glyphs as tiny line icons near some nodes
  const glyphs = `
    <g fill="none" stroke="rgba(186,210,255,0.28)" stroke-width="1.4" stroke-linecap="round">
      <path d="M250 78 h22 M261 78 v16 M254 94 h14"/>
      <circle cx="715" cy="122" r="8"/><path d="M715 118 v5 M712 123 h6"/>
      <path d="M150 268 h18 v14 h-18 z M154 272 h10 M154 276 h8"/>
      <path d="M940 350 c6-8 18-8 24 0 v12 h-24 z"/>
    </g>`;

  return `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.15" y2="1">
      <stop offset="0%" stop-color="#071325"/>
      <stop offset="48%" stop-color="#0b1a33"/>
      <stop offset="100%" stop-color="#050d1a"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="34%" r="42%">
      <stop offset="0%" stop-color="rgba(57,255,20,0.18)"/>
      <stop offset="45%" stop-color="rgba(73,118,255,0.12)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>
    <linearGradient id="card" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.09)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0.035)"/>
    </linearGradient>
    <linearGradient id="bottom" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(5,13,26,0)"/>
      <stop offset="100%" stop-color="rgba(5,13,26,0.55)"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <g>${lines}${dots}</g>
  ${glyphs}

  <circle cx="540" cy="390" r="238" fill="none" stroke="rgba(57,255,20,0.26)" stroke-width="2"/>
  <circle cx="540" cy="390" r="260" fill="none" stroke="rgba(120,170,255,0.12)" stroke-width="1.2"/>

  <g transform="translate(0,1000)">
    <line x1="540" y1="-42" x2="190" y2="30" stroke="rgba(57,255,20,0.38)" stroke-width="1.6"/>
    <line x1="540" y1="-42" x2="365" y2="30" stroke="rgba(57,255,20,0.38)" stroke-width="1.6"/>
    <line x1="540" y1="-42" x2="540" y2="30" stroke="rgba(57,255,20,0.55)" stroke-width="2"/>
    <line x1="540" y1="-42" x2="715" y2="30" stroke="rgba(57,255,20,0.38)" stroke-width="1.6"/>
    <line x1="540" y1="-42" x2="890" y2="30" stroke="rgba(57,255,20,0.38)" stroke-width="1.6"/>
    <circle cx="540" cy="-42" r="6" fill="#39ff14"/>
    ${card(190, 42, 'Guías')}
    ${card(365, 42, 'Rutas')}
    ${card(540, 42, 'Docs')}
    ${card(715, 42, 'FAQ')}
    ${card(890, 42, 'Ayuda')}
  </g>

  <rect x="0" y="1200" width="${W}" height="240" fill="url(#bottom)"/>
</svg>`;
}

function card(cx, y, label) {
  const w = 148;
  const h = 108;
  const x = cx - w / 2;
  return `
  <g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="url(#card)" stroke="rgba(255,255,255,0.16)" stroke-width="1.2"/>
    <rect x="${x + 16}" y="${y + 18}" width="34" height="26" rx="7" fill="rgba(57,255,20,0.12)" stroke="rgba(57,255,20,0.48)"/>
    <circle cx="${x + 33}" cy="${y + 31}" r="4" fill="#39ff14"/>
    <text x="${x + 16}" y="${y + 68}" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700">${label}</text>
    <rect x="${x + 16}" y="${y + 82}" width="86" height="5" rx="2.5" fill="rgba(255,255,255,0.15)"/>
  </g>`;
}

const iso = await circularizeIso(
  await punchBlackToAlpha(path.join(brand, 'sinai-iso.png'), 22),
  430,
);

const word = await sharp(await punchBlackToAlpha(path.join(brand, 'sinai-wordmark-mono.png'), 30))
  .resize(540, null, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

const wordMeta = await sharp(word).metadata();
const wordW = wordMeta.width ?? 540;
const wordH = wordMeta.height ?? 150;

const isoLeft = Math.round((W - 430) / 2);
const isoTop = 175;
const wordLeft = Math.round((W - wordW) / 2);
const wordTop = isoTop + 400;

const label = Buffer.from(`
<svg width="${W}" height="86" xmlns="http://www.w3.org/2000/svg">
  <text x="50%" y="32" text-anchor="middle" fill="#39ff14" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="5">BASE DE CONOCIMIENTO</text>
  <text x="50%" y="64" text-anchor="middle" fill="rgba(186,208,255,0.82)" font-family="Segoe UI, Arial, sans-serif" font-size="17" letter-spacing="1.2">Centro de ayuda oficial de SINAI</text>
</svg>`);

const result = await sharp(Buffer.from(sceneSvg()))
  .png()
  .composite([
    { input: iso, top: isoTop, left: isoLeft },
    { input: word, top: wordTop, left: wordLeft },
    { input: label, top: wordTop + wordH + 6, left: 0 },
  ])
  .png({ compressionLevel: 8 })
  .toFile(out);

console.log('Wrote', out, result);
