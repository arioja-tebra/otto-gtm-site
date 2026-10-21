# Otto GTM site

Otto’s standalone marketing and editorial site, built with Astro and prepared for Cloudflare Workers Static Assets. It uses the selected `gtm-seo-play` design and includes 35 pages: product pages, comparisons, switching guides, four articles, free tools, note templates, a demo, and a waitlist preview.

This repository owns its content, styles, tests, and deployment. It has no dependency on `ai-native-next`, its authentication, or its release pipeline.

## Local development

Use Node 24 and pnpm 11.25.0 (recorded in `package.json`).

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open the URL printed by Astro. To inspect the static build locally:

```sh
pnpm validate
pnpm preview
```

`pnpm validate` checks Astro types, builds the site, and validates routes, links, anchors, metadata, indexing rules, and Cloudflare asset sizes.

Browser checks cover desktop and mobile layouts, navigation, the demo signup, downloadable documents, note templates, video loading, and missing-page responses:

```sh
pnpm exec playwright install chromium
pnpm exec playwright test
```

## Editing the site

| Location | Purpose |
| --- | --- |
| `src/pages/**/*.astro` | Editable pages with their original URLs and markup |
| `src/components/Header.astro` | Shared navigation |
| `src/components/Footer.astro` | Shared footer |
| `src/components/ArticleDemoCallout.astro` | Shared blog demo promotion |
| `src/layouts/SiteLayout.astro` | Document shell, metadata, fonts and styles |
| `src/data/pages.json` | Page titles, descriptions and structured data |
| `src/lib/seo.ts` | Indexing switch and structured-data URL handling |
| `public/assets/` | Otto branding, local fonts, CSS and interactive tool scripts |
| `public/media/otto-demo.mp4` | Optimized 720p demo video, about 6 MB |

The migration preserves the reviewed page markup as readable Astro files. To edit a blog post, edit its file under `src/pages/blog/`; there is no Python generator or separate content service involved in the build. The CSS remains global to preserve the existing layout and printed-document design.

For a new page, add its `.astro` file and metadata entry, use `SiteLayout`, and link it from the relevant navigation or related content. Keep schema URLs site-relative; the layout resolves them against `SITE_URL`.

The root-level `gtm-seo-play/`, `friendly/`, `previous/`, `index.html`, and other historical HTML files are frozen GitHub Pages snapshots. They remain in place so existing review links keep working. Astro builds only `src/` and `public/` into `dist/`; it does not publish those snapshots. Edit `src/` for all new work.

## Cloudflare setup

The configuration in `wrangler.jsonc` publishes only `dist/`. It serves static HTML with trailing slashes and returns the custom 404 page for unknown paths. No application server or Astro Cloudflare adapter is required for this static build.

Once the Cloudflare account is ready:

```sh
pnpm exec wrangler login
pnpm deploy
```

`pnpm deploy` runs validation before uploading. Wrangler will ask which account to use if needed. Start with the assigned `workers.dev` URL. No account ID, credentials, or custom-domain routes are committed.

For Cloudflare’s Git integration, connect this repository, choose the approved branch, use `pnpm build` as the build command and `pnpm exec wrangler deploy` as the deploy command. Keep `SEO_PRODUCTION=0` for the first review deployment. The GitHub workflow in this repo only validates; it does not deploy.

Record the deployed commit and Worker version for releases. Marketing rollbacks should use the previous GTM Worker version independently of application releases.

## Indexing and production routes

Preview builds default to `noindex,follow`, disallow crawling in `robots.txt`, and publish an empty sitemap. Pricing remains hidden and has no generated route.

After content approval and agreement on the public route ownership, configure:

```sh
SITE_URL=https://otto.tebra.com SEO_PRODUCTION=1 pnpm build
```

`SITE_URL` must be an origin without a path. It controls canonicals, social URLs, schema, and the sitemap. `SEO_PRODUCTION=1` opts approved pages into indexing. The demo waitlist and 404 remain excluded.

The current URL paths are preserved for review. Vincent and the networking team still need to agree on the production route contract. The standalone resource homepage at `/` does not imply replacing the application’s homepage. Keep `/api/*`, authentication and application routes with their application owner. When both apps share a hostname, coordinate the root sitemap and robots response; this site’s generated sitemap covers only GTM pages.

## Waitlist and data

The waitlist is a clearly labeled demo with a fictional email. It makes no submission requests and does not save leads. The local Python/Google Sheets adapter, credentials, private lead database, and internal handoff files were excluded from this repository.

A real signup requires a separately approved backend and destination, including a failure state that avoids claiming an email was saved when it was not. Do not enable real collection by changing the demo message alone.

The free tools run in the visitor’s browser. Downloads retain Otto styling and fictional-demo labels.

## Deployment references

- [Astro on Cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare/)
- [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Cloudflare HTML routing](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/)
