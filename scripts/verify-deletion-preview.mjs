// Optional browser check of the unconfigured public preview. No Firebase/AI calls.
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage();
const errors = [], external = [];
page.on('pageerror', error => errors.push(error.message));
await page.route('**/*', route => {
  if (new URL(route.request().url()).hostname !== '127.0.0.1') {
    external.push(route.request().url()); return route.abort();
  }
  return route.continue();
});
await mkdir('../deletion-uat-previews', { recursive: true });
try {
  await page.goto('http://127.0.0.1:4321/delete-account/');
  assert.equal(await page.locator('#deletion-app').getAttribute('data-ready'), 'false');
  assert.equal(await page.getByRole('button', { name: 'Verify with email and password' }).isDisabled(), true);
  assert.equal(await page.locator('#deletion-confirm').isVisible(), false);
  for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => document.fonts.ready);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal overflow');
    await page.screenshot({ path: `../deletion-uat-previews/public-deletion-${name}.png`, fullPage: true });
  }
  assert.deepEqual(external, []); assert.deepEqual(errors, []);
  console.log('PASS: public preview, disabled unconfigured verification, responsive layouts, no external/Firebase/AI calls.');
} finally { await browser.close(); }
