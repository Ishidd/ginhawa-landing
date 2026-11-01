import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, join, extname } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve('dist');
async function files(dir) {
  const paths = await Promise.all((await readdir(dir, { withFileTypes: true })).map(entry => entry.isDirectory() ? files(join(dir, entry.name)) : join(dir, entry.name)));
  return paths.flat();
}
const built = await files(root);
const pages = built.filter(path => path.endsWith('.html'));
let checked = 0;
for (const page of pages) {
  const html = await readFile(page, 'utf8');
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${page}: expected one h1`);
  assert.match(html, /name="description"/);
  assert.doesNotMatch(html, /<script\b(?![^>]*\bsrc=)[^>]*>\s*[^<\s]/i, 'Inline scripts would be blocked by the Vercel CSP');
  assert.doesNotMatch(html, /href="[^"]*(?:apps\.apple|play\.google)/, 'Unconfigured app-store CTAs must remain hidden');
  for (const match of html.matchAll(/href="(mailto:[^"]+)"/g)) assert.equal(match[1], 'mailto:ginhawa.support@gmail.com', 'Only the app support email is approved');
  for (const match of html.matchAll(/\b(?:src|href|poster)="([^"<>]+)"/g)) {
    const url = new URL(match[1].replaceAll('&amp;', '&'), `https://build.local/${page.slice(root.length + 1).replaceAll('\\', '/')}`);
    if (url.origin !== 'https://build.local') continue;
    let target = resolve(root, '.' + decodeURIComponent(url.pathname));
    assert.ok(target.startsWith(root), 'Asset outside build');
    if (url.pathname.endsWith('/')) target = join(target, 'index.html');
    await stat(target).catch(() => { throw new Error(`Broken reference in ${page}: ${match[1]}`); });
    if (url.hash && extname(target) === '.html') {
      const linked = await readFile(target, 'utf8');
      assert.ok(linked.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `Missing anchor ${match[1]}`);
    }
    checked++;
  }
}
for (const path of built.filter(file => ['.js', '.html', '.css', '.json'].includes(extname(file)))) {
  const text = await readFile(path, 'utf8');
  assert.doesNotMatch(text, /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/);
  if (path.endsWith('.html') && !path.includes('delete-account')) assert.doesNotMatch(text, /AIza[0-9A-Za-z_-]{30,}|firebaseConfig|firebaseapp\.com|collection\(db,/);
}
const scripts = built.filter(path => path.endsWith('.js'));
const scriptBytes = (await Promise.all(scripts.map(path => stat(path)))).reduce((sum, item) => sum + item.size, 0);
const marketingScripts = new Set();
for (const page of pages.filter(path => !path.includes('delete-account'))) {
  for (const match of (await readFile(page, 'utf8')).matchAll(/<script[^>]+src="([^"]+)"/g)) if (match[1].startsWith('/')) marketingScripts.add(resolve(root, '.' + match[1]));
}
const marketingBytes = (await Promise.all([...marketingScripts].map(path => stat(path)))).reduce((sum, item) => sum + item.size, 0);
assert.ok(marketingBytes < 20000, 'Marketing entry scripts budget exceeded');
// The requested R3F/Three/GSAP renderer is a separate, near-viewport dynamic import.
const orbScripts = scripts.filter(path => /[\\/]AdaptiveGuidanceOrb\.[^\\/]+\.js$/.test(path));
const orbBytes = (await Promise.all(orbScripts.map(path => stat(path)))).reduce((sum, item) => sum + item.size, 0);
assert.ok(scriptBytes - orbBytes < 850000, 'Non-orb browser scripts budget exceeded');
assert.ok(orbBytes < 1400000, 'Lazy 3D renderer budget exceeded');
console.log(`PASS: ${pages.length} pages; ${checked} local references; no missing anchors/assets; deployment CSP compatible; no private keys or unconfigured store links; approved support email only; Firebase clients limited to the deletion surface. Initial marketing JS: ${marketingBytes.toLocaleString()} bytes; lazy 3D renderer: ${orbBytes.toLocaleString()} bytes; total browser JS: ${scriptBytes.toLocaleString()} bytes.`);
