import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'cheerio';

const root = '.pages';
const base = '/otto-gtm-site';
const origin = process.env.SITE_URL || 'https://arioja-tebra.github.io';
const pages = JSON.parse(readFileSync('src/data/pages.json', 'utf8'));
const fileFor = path => join(root, path.endsWith('/') ? `${path}index.html` : path);

test('Pages artifact has working links, assets, anchors and preview metadata for every Astro route', () => {
  for (const [route, metadata] of Object.entries(pages)) {
    const $ = load(readFileSync(fileFor(base + route), 'utf8'));
    assert.equal($('title').text(), metadata.title, route);
    assert.match($('meta[name=robots]').attr('content'), /^noindex,/, route);
    if (!metadata.noindex) assert.equal($('link[rel=canonical]').attr('href'), `${origin}${base}${route}`, route);
    $('[href],[src],[poster]').each((_, element) => {
      for (const attribute of ['href', 'src', 'poster']) {
        const value = $(element).attr(attribute);
        if (!value || !value.startsWith('/') && !value.startsWith('#') || value.startsWith('//')) continue;
        const url = new URL(value, `${origin}${base}${route}`);
        assert.ok(url.pathname.startsWith(`${base}/`), `${route}: unprefixed ${value}`);
        const file = fileFor(decodeURI(url.pathname));
        assert.ok(existsSync(file), `${route}: missing ${value}`);
        if (url.hash && file.endsWith('.html')) {
          const target = load(readFileSync(file, 'utf8'));
          assert.ok(target('[id]').toArray().some(el => target(el).attr('id') === decodeURIComponent(url.hash.slice(1))), `${route}: missing ${value}`);
        }
      }
    });
    const isArticle = route.startsWith('/blog/') && route !== '/blog/';
    const isTool = route.startsWith('/tools/') && route !== '/tools/';
    assert.equal($('.content-disclaimer').length, isArticle || isTool ? 1 : 0, route);
    if (isArticle || isTool) assert.equal($('.content-disclaimer a').attr('href'), 'https://www.tebra.com/terms-conditions');
  }
});

test('Pages packaging excludes legacy previews and prefixes runtime signup URLs', () => {
  for (const directory of ['friendly', 'previous', 'gtm-seo-play']) {
    assert.ok(!existsSync(`.pages/otto-gtm-site/${directory}`), directory);
  }
  assert.doesNotMatch(readFileSync(fileFor(`${base}/`), 'utf8'), /Compare Otto design versions/);
  const script = readFileSync(fileFor(`${base}/assets/site.js`), 'utf8');
  assert.ok(script.includes(`new URL('${base}/waitlist/'`));
  assert.ok(script.includes(`a[href="${base}/waitlist/"]`));
});
