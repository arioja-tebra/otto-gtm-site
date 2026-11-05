import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
const base = '/otto-gtm-site/gtm-seo-play';
const pages = JSON.parse(readFileSync('src/data/pages.json', 'utf8'));

test.beforeEach(async ({ context }) => {
  await context.route(/^https:\/\/(?:[^/]+\.)?(?:googletagmanager|google-analytics)\.com\//, route => route.abort());
});

test('deployed routes render with working scripts and images under the Pages path', async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const route of Object.keys(pages)) {
    await page.goto(base + route);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('h1')).toBeVisible();
    expect(await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth + 2,
      broken: [...document.images].filter(img => img.complete && img.naturalWidth === 0).map(img => img.src),
    })), route).toEqual({ overflow: false, broken: [] });
  }
  expect(errors).toEqual([]);
});

test('preview navigation and signup retain the Pages path and campaign tags', async ({ page }) => {
  await page.goto('/otto-gtm-site/');
  await page.getByRole('link', { name: 'Open the team preview' }).click();
  await expect(page).toHaveURL(new RegExp(`${base}/mental-health-ehr/`));
  await page.goto(`${base}/mental-health-ehr/?utm_source=pages-check`);
  const signup = page.locator(`main a[href^="${base}/waitlist/"]`).first();
  const target = new URL((await signup.getAttribute('href'))!, page.url());
  expect(target.searchParams.get('from')).toBe(`${base}/mental-health-ehr/`);
  expect(target.searchParams.get('utm_source')).toBe('pages-check');
  await signup.click();
  await expect(page.locator('#email-step')).toBeVisible();
});

for (const tool of ['session-rate-calculator', 'superbill', 'good-faith-estimate']) {
  test(`deployed ${tool} generates a branded document`, async ({ page }) => {
    await page.goto(`${base}/tools/${tool}/`);
    await expect(page.getByRole('complementary', { name: 'Tool disclaimer', exact: true })).toBeVisible();
    await page.locator('#fill-demo').click();
    const pending = page.waitForEvent('download');
    await page.locator('#download').click();
    const download = await pending;
    expect(await readFile((await download.path())!, 'utf8')).toContain('Otto');
  });
}

test('deployed article shares its prefixed public URL and displays the disclaimer', async ({ page }) => {
  await page.goto(`${base}/blog/how-much-to-charge-for-therapy/?campaign=preview#main`);
  const share = page.getByRole('region', { name: 'Share this article' });
  const linkedin = new URL((await share.locator('[data-share-linkedin]').getAttribute('href'))!);
  expect(linkedin.searchParams.get('url')).toBe(new URL(`${base}/blog/how-much-to-charge-for-therapy/`, page.url()).href);
  await expect(page.getByRole('complementary', { name: 'Article disclaimer', exact: true })).toContainText('This article is for general informational purposes only.');
});
