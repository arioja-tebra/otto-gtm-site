import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';

const pages = JSON.parse(readFileSync('src/data/pages.json', 'utf8'));

test.beforeEach(async ({ context }) => {
  // Keep browser fixtures out of the live analytics property.
  await context.route(/^https:\/\/(?:[^/]+\.)?(?:googletagmanager|google-analytics)\.com\//,
    route => route.abort());
});

test('all routes render without script errors, broken images, or page overflow', async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const route of Object.keys(pages)) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('h1')).toBeVisible();
    const problems = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth + 2,
      broken: [...document.images].filter(img => img.complete && img.naturalWidth === 0).map(img => img.src),
    }));
    expect(problems, route).toEqual({ overflow: false, broken: [] });
  }
  expect(errors).toEqual([]);
});

test('navigation opens and closes by keyboard', async ({ page }, testInfo) => {
  await page.goto('/mental-health-ehr/');
  if (testInfo.project.name === 'mobile') await page.locator('.menu-toggle').click();
  await page.locator('#nav-platform > summary').click();
  await expect(page.locator('#mega-platform')).toBeVisible();
  await page.locator('#nav-platform > summary').press('Escape');
  await expect(page.locator('#mega-platform')).toBeHidden();
});

test('demo signup is email first and conditionally asks for the existing EHR', async ({ page }) => {
  const submissions: string[] = [];
  page.on('request', request => { if (request.method() === 'POST') submissions.push(request.url()); });
  await page.goto('/waitlist/');
  await expect(page.locator('#email-step')).toBeVisible();
  await expect(page.locator('#practice-step')).toBeHidden();
  await page.locator('#waitlist-demo-fill').click();
  await page.locator('#waitlist-email-form button[type=submit]').click();
  await expect(page.locator('#practice-step')).toBeVisible();
  await expect(page.locator('#system-field')).toBeVisible();
  await page.locator('input[name=ehr][value="First EHR"]').check();
  await expect(page.locator('#system-field')).toBeHidden();
  await page.locator('input[name=ehr][value=Switching]').check();
  await page.locator('select[name=system]').selectOption('Other');
  await expect(page.locator('#other-system-field')).toBeVisible();
  await page.locator('input[name=otherSystem]').fill('Fictional EHR');
  await page.locator('#waitlist-practice-form button[type=submit]').click();
  await expect(page.locator('#complete-copy')).toHaveText('Preview complete. Nothing was submitted or saved.');
  expect(submissions).toEqual([]);
});

for (const tool of ['session-rate-calculator', 'superbill', 'good-faith-estimate']) {
  test(`${tool} demo generates a branded downloadable document`, async ({ page }) => {
    await page.goto(`/tools/${tool}/`);
    await page.locator('#fill-demo').click();
    await expect(page.locator('#demo-status')).toContainText('Example filled');
    const pending = page.waitForEvent('download');
    await page.locator('#download').click();
    const download = await pending;
    const content = await readFile((await download.path())!, 'utf8');
    expect(content).toContain('Otto');
    expect(content).toContain('<html');
    expect(content).not.toContain('/otto-previews/');
  });
}

for (const format of ['soap', 'dap']) {
  test(`${format} note demo and download work`, async ({ page }) => {
    await page.goto(`/templates/${format}-notes/`);
    await page.locator('#note-demo').click();
    await expect(page.locator('#note-form textarea').first()).not.toHaveValue('');
    const pending = page.waitForEvent('download');
    await page.locator('#note-download').click();
    const download = await pending;
    expect(await readFile((await download.path())!, 'utf8')).toContain('fictional');
  });
}

test('video loads and unknown routes return 404', async ({ page, request }) => {
  await page.goto('/demo/');
  await page.locator('video').evaluate((video: HTMLVideoElement) => video.load());
  await expect.poll(() => page.locator('video').evaluate((video: HTMLVideoElement) => video.duration)).toBeGreaterThan(130);
  expect((await request.get('/not-a-real-page/')).status()).toBe(404);
});

test('article share links use the current article URL without query parameters or fragments', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const articles = Object.keys(pages).filter(path => path.startsWith('/blog/') && path !== '/blog/');
  expect(articles).toHaveLength(4);
  for (const route of articles) {
    await page.goto(`${route}?campaign=preview#main`);
    const share = page.getByRole('region', { name: 'Share this article' });
    await expect(share).toBeVisible();
    const cleanURL = new URL(route, page.url()).href;
    const linkedin = new URL((await share.locator('[data-share-linkedin]').getAttribute('href'))!);
    const facebook = new URL((await share.locator('[data-share-facebook]').getAttribute('href'))!);
    const email = new URL((await share.locator('[data-share-email]').getAttribute('href'))!);
    expect(linkedin.searchParams.get('url')).toBe(cleanURL);
    expect(facebook.searchParams.get('u')).toBe(cleanURL);
    expect(email.searchParams.get('body')).toBe(cleanURL);
    expect(email.searchParams.get('subject')).toBe((await page.locator('h1').textContent())!.trim());
    await share.getByRole('button', { name: 'Copy link', exact: true }).click();
    await expect(share.getByRole('status')).toHaveText('Link copied.');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(cleanURL);
  }
});

test('article sharing offers a selectable link when clipboard access fails', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: async () => { throw new Error('Clipboard unavailable'); } },
      configurable: true,
    });
  });
  await page.goto('/blog/soap-vs-dap-notes/?campaign=preview#main');
  const share = page.getByRole('region', { name: 'Share this article' });
  await share.getByRole('button', { name: 'Copy link', exact: true }).click();
  const field = share.getByRole('textbox', { name: 'Article link' });
  await expect(field).toHaveValue(new URL('/blog/soap-vs-dap-notes/', page.url()).href);
  await expect(field).toBeFocused();
});
