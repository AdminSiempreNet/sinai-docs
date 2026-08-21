import { chromium, devices } from 'playwright';

const url = process.argv[2] || 'http://localhost:3000';
const device = devices['iPhone 13'];

const browser = await chromium.launch({
  headless: false,
  args: [
    '--window-size=430,900',
    '--window-position=60,30',
    '--disable-infobars',
  ],
});

const context = await browser.newContext({
  ...device,
  locale: 'es-CO',
});

const page = await context.newPage();
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.bringToFront();

console.log(`Mobile simulator ready: ${url}`);
console.log(`Device: iPhone 13 (${device.viewport.width}x${device.viewport.height})`);
console.log('Keep this process running to leave the window open. Ctrl+C to close.');

// Keep the window open until the user closes it or stops the process.
await new Promise((resolve) => {
  browser.on('disconnected', resolve);
  process.on('SIGINT', async () => {
    await browser.close().catch(() => {});
    resolve();
  });
});
