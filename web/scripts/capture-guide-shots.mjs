import { createInterface } from 'node:readline/promises';
import { access, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { stdin as input, stdout as output } from 'node:process';

const webRoot = process.cwd();

function arg(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function usage() {
  console.error('Uso: pnpm capture:guide -- --role <admin|docente|super|estudiante> --manifest <shots.json> [--url <direccion-de-sinai>]');
  console.error('La sesión queda en web/.local/ y no se sube al repositorio.');
}

async function loadEnv() {
  try {
    const text = await readFile(path.resolve(webRoot, '..', '.env'), 'utf8');
    return Object.fromEntries(
      text
        .split(/\r?\n/)
        .filter((line) => /^\s*[A-Z0-9_]+\s*=/.test(line))
        .map((line) => {
          const i = line.indexOf('=');
          const value = line.slice(i + 1).replace(/\s+#.*$/, '').trim().replace(/^["']|["']$/g, '');
          return [line.slice(0, i).trim(), value];
        }),
    );
  } catch {
    return {};
  }
}

const env = await loadEnv();
const role = arg('--role');
const baseUrl = arg('--url') ?? env.SINAI_URL;
const manifestPath = arg('--manifest');
const forceLogin = process.argv.includes('--login');
const loginWaitFor = arg('--login-wait-for');
const storagePath = path.join(webRoot, '.local', role ? `sinai-session-${role}.json` : 'sinai-capture-session.json');
const credentials = role
  ? { user: env[`SINAI_USUARIO_${role.toUpperCase()}`], password: env[`SINAI_PASSWORD_${role.toUpperCase()}`] }
  : undefined;

if (role && (!credentials.user || !credentials.password)) {
  console.error(`Faltan SINAI_USUARIO_${role.toUpperCase()} o SINAI_PASSWORD_${role.toUpperCase()} en sinai-docs/.env.`);
  process.exit(1);
}

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

async function settle(page) {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
}

async function runSteps(page, steps) {
  for (const step of steps) {
    if (step.click || step.clickSelector) {
      const target = step.click
        ? page.getByText(step.click, { exact: step.exact ?? false }).first()
        : page.locator(step.clickSelector).first();
      // El menú del encabezado de SINAI puede tapar botones de la página; dispatch envía el clic directo al elemento.
      if (step.dispatch) await target.dispatchEvent('click');
      else await target.click();
    } else if (step.select) {
      const option = step.label !== undefined ? { label: step.label } : { index: step.index ?? 0 };
      await page.locator(step.select).first().selectOption(option);
    } else if (step.waitFor) {
      await page.getByText(step.waitFor, { exact: false }).first().waitFor({ state: 'visible', timeout: 30000 });
    }
    await settle(page);
    if (step.wait) await page.waitForTimeout(step.wait);
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

const browser = await chromium.launch({ headless: Boolean(role) });
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
    if (credentials) {
      await page.fill('#UsernameTxt', credentials.user);
      await page.fill('#PasswordTxt', credentials.password);
      await page.click('#Entrar');
      await page.waitForURL((url) => !url.pathname.toLowerCase().includes('default.aspx'), { timeout: 60000 }).catch(() => {});
      await settle(page);
      if (page.url().toLowerCase().includes('default.aspx')) {
        throw new Error(`No se pudo iniciar sesión con el usuario ${role} de sinai-docs/.env.`);
      }
    } else if (loginWaitFor) {
      console.log(`Inicie sesión en la ventana de SINAI y entre a la institución. Se espera el texto "${loginWaitFor}" (hasta 10 minutos).`);
      await page.getByText(loginWaitFor, { exact: false }).first().waitFor({ state: 'visible', timeout: 600000 });
    } else {
      await waitForEnter('Inicie sesión en la ventana de SINAI, entre a la institución y presione Enter aquí para guardar la sesión y tomar las capturas. ');
    }
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
    try {
      if (shot.waitFor) {
        await page.getByText(shot.waitFor, { exact: false }).first().waitFor({ state: 'visible', timeout: 30000 });
      }
      await settle(page);
      if (Array.isArray(shot.steps)) await runSteps(page, shot.steps);

      const file = path.join(outDir, shot.file);
      const options = { path: file, type: 'jpeg', quality: 90, animations: 'disabled' };
      if (shot.selector) await page.locator(shot.selector).screenshot(options);
      else await page.screenshot(options);
      console.log(`Captura lista: ${file}`);
    } catch (error) {
      console.error(`No se pudo tomar ${shot.file}: ${error.message.split('\n')[0]}`);
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
}
