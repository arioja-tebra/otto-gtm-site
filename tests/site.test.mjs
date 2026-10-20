import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { load } from 'cheerio';

const root = resolve('dist');
const pages = JSON.parse(readFileSync('src/data/pages.json', 'utf8'));
const indexable = process.env.SEO_PRODUCTION === '1';
const origin = process.env.SITE_URL || 'https://otto.tebra.com';
const outputPath = path => join(root, path.endsWith('/') ? `${path}index.html` : path);
const files = dir => readdirSync(dir).flatMap(name => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? files(path) : [path];
});

test('all migrated routes retain their content, metadata, and real navigation', () => {
  assert.equal(Object.keys(pages).length, 35);
  for (const [path, metadata] of Object.entries(pages)) {
    const html = readFileSync(outputPath(path), 'utf8');
    const $ = load(html);
    assert.equal($('h1').length, 1, path);
    assert.equal($('main').length, 1, path);
    assert.equal($('title').text(), metadata.title, path);
    assert.equal($('meta[name=description]').attr('content'), metadata.description, path);
    assert.equal($('meta[name=robots]').attr('content'),
      indexable && !metadata.noindex ? 'index,follow' : 'noindex,follow', path);
    if (!metadata.noindex) {
      assert.equal($('link[rel=canonical]').attr('href'), new URL(path, origin).href, path);
    }
    const graph = JSON.parse($('script[type="application/ld+json"]').text());
    assert.ok(graph['@graph'].length >= 3, path);
    assert.ok($('header.site-header a[href]').length > 20, path);
    assert.doesNotMatch(html, /\/otto-previews\/|\/gtm-seo-play\/|Product illustration with sample patient information/);
    assert.equal($('a[href="/pricing/"]').length, 0, path);
  }
});

test('every local URL, asset and anchor resolves', () => {
  for (const path of Object.keys(pages)) {
    const $ = load(readFileSync(outputPath(path), 'utf8'));
    $('[href],[src],[poster]').each((_, node) => {
      for (const attribute of ['href', 'src', 'poster']) {
        const value = $(node).attr(attribute);
        if (!value || !value.startsWith('/') && !value.startsWith('#')) continue;
        const url = new URL(value, new URL(path, origin));
        const file = outputPath(decodeURI(url.pathname));
        assert.ok(existsSync(file), `${path}: ${value}`);
        if (url.hash && file.endsWith('.html')) {
          const target = load(readFileSync(file, 'utf8'));
          const id = decodeURIComponent(url.hash.slice(1));
          assert.ok(target('[id]').toArray().some(el => target(el).attr('id') === id), `${path}: missing ${value}`);
        }
      }
    });
  }
});

test('Cloudflare output has no private files or oversized assets', () => {
  for (const file of files(root)) {
    assert.ok(statSync(file).size <= 25 * 1024 * 1024, `Cloudflare asset limit: ${file}`);
    assert.doesNotMatch(file, /(?:\.sqlite|\.env|\.private|server\.py|handoff)/);
  }
  assert.ok(existsSync(join(root, '404.html')));
  assert.ok(!existsSync(join(root, 'pricing')));
  assert.ok(!existsSync(join(root, 'api')));
  const config = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
  assert.equal(config.assets.not_found_handling, '404-page');
});

test('preview and production indexing rules match the configured origin', () => {
  const robots = readFileSync(join(root, 'robots.txt'), 'utf8');
  const sitemap = readFileSync(join(root, 'sitemap.xml'), 'utf8');
  if (indexable) {
    assert.match(robots, /Allow: \//);
    const $ = load(sitemap, { xmlMode: true });
    assert.equal($('url').length, Object.values(pages).filter(p => !p.noindex).length);
    $('loc').each((_, el) => assert.equal(new URL($(el).text()).origin, new URL(origin).origin));
    assert.doesNotMatch(sitemap, /\/waitlist\/|\/404.html|\/pricing\//);
  } else {
    assert.match(robots, /Disallow: \//);
    assert.doesNotMatch(sitemap, /<url>/);
  }
});

test('waitlist stays an explicit demo without network submission', () => {
  const script = readFileSync(join(root, 'assets/waitlist.js'), 'utf8');
  assert.doesNotMatch(script, /\bfetch\s*\(|XMLHttpRequest|sendBeacon/);
  assert.match(script, /let demo=true/);
  const $ = load(readFileSync(outputPath('/waitlist/'), 'utf8'));
  assert.match($('main').text(), /Nothing (?:is|was|will be) (?:submitted|sent|saved)|demo/i);
});
