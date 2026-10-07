import { createInterface } from 'node:readline/promises';
import { access, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { stdin as input, stdout as output } from 'node:process';

const webRoot = process.cwd();
const storagePath = path.join(webRoot, '.local', 'sinai-capture-session.json');

function arg(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function usage() {
  console.error('Uso: pnpm capture:guide -- --url <direccion-de-sinai> --manifest <shots.json>');
  console.error('La sesión queda en web/.local/ y no se sube al repositorio.');
}

const baseUrl = arg('--url');
const manifestPath = arg('--manifest');
const forceLogin = process.argv.includes('--login');

if (!baseUrl || !manifestPath) {
  usage();
  process.exit(1);
}

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('Falta Playwright. En sinai-docs/web ejecute: pnpm add -D playwright && pnpm exec playwright install chromium');
  process.exit(1);
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function waitForEnter(message) {
  const prompt = createInterface({ input, output });
  try {
    await prompt.question(message);
  } finally {
    prompt.close();
  }
}

const manifest = JSON.parse(await readFile(path.resolve(manifestPath), 'utf8'));
const shots = Array.isArray(manifest.shots) ? manifest.shots : [];
if (shots.length === 0) {
  console.error('El manifiesto no tiene capturas.');
  process.exit(1);
}

const outDir = path.resolve(webRoot, manifest.outDir ?? 'public/images/guides');
await mkdir(outDir, { recursive: true });
await mkdir(path.dirname(storagePath), { recursive: true });

const browser = await chromium.launch({ headless: false });
const hasSession = !forceLogin && await exists(storagePath);
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  locale: 'es-CO',
  storageState: hasSession ? storagePath : undefined,
});

try {
  if (!hasSession) {
    const page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await waitForEnter('Inicie sesión en la ventana de SINAI, entre a la institución y presione Enter aquí para guardar la sesión y tomar las capturas. ');
    await context.storageState({ path: storagePath });
    await page.close();
    console.log('Sesión guardada solo en este equipo.');
  }

  for (const shot of shots) {
    if (!shot.file || !shot.path) {
      throw new Error('Cada captura necesita file y path.');
    }
    if (!shot.file.endsWith('.jpg')) {
      throw new Error(`La captura ${shot.file} debe ser .jpg`);
    }

    const page = await context.newPage();
    const target = new URL(shot.path, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);
    await page.goto(target.href, { waitUntil: 'domcontentloaded', timeout: 60000 });
    if (shot.waitFor) {
      await page.getByText(shot.waitFor, { exact: false }).first().waitFor({ state: 'visible', timeout: 30000 });
    }

    const file = path.join(outDir, shot.file);
    const options = { path: file, type: 'jpeg', quality: 90, animations: 'disabled' };
    if (shot.selector) await page.locator(shot.selector).screenshot(options);
    else await page.screenshot(options);
    await page.close();
    console.log(`Captura lista: ${file}`);
  }
} finally {
  await browser.close();
}
