# Otto GTM site

Otto’s standalone marketing and editorial site, built with Astro and prepared for Cloudflare Workers Static Assets. It uses the selected `gtm-seo-play` design and includes 41 pages: product pages, comparisons, switching guides, four articles, free tools, note templates, a demo, a waitlist preview, and a product teaser and practice tour.

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

The product teaser starts at `/your-practice/`. Watch the overview and billing videos, explore session prep, notes, and payment workflows, then choose **See Otto for my practice** for a short tour based on your priorities. The confirmation at `/your-practice/preview/` shows an illustrative 2027 launch and demo spot #234, with invite copying, email composition, and a simulated referral. Signup and queue positions are demo-only; nothing is stored. All six routes remain noindex in production builds as well as previews.

The supplied videos are compressed for web playback in `public/media/`. They use native controls, poster images, and no automatic download until playback. Copy lives in `src/data/practice.ts`; the pages are in `src/pages/your-practice/`.

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

The root-level `gtm-seo-play/`, `friendly/`, `previous/`, `index.html`, and other historical HTML files are frozen GitHub Pages snapshots. They remain in Git as historical references and are excluded from deployment. Astro builds only `src/` and `public/` into `dist/`; it does not publish those snapshots. Edit `src/` for all new work.

## GitHub Pages deployment

Merges to `main` deploy automatically after Astro validation, the existing browser suite, and checks of the packaged Pages site pass. The workflow can also be run manually from GitHub Actions.

The live site is at https://arioja-tebra.github.io/otto-gtm-site/. Only the current Astro build is deployed, including blog and tool disclaimers. `scripts/prepare-pages.mjs` prefixes the build’s links, assets, metadata, and runtime signup URLs for the repository path. It leaves `dist/` unchanged for Cloudflare. The design chooser and historical HTML snapshots are excluded from the deployed artifact.

To verify the deployment artifact locally:

```sh
SITE_URL=https://arioja-tebra.github.io SEO_PRODUCTION=0 pnpm build:pages
pnpm test:pages
pnpm exec playwright test --config playwright.pages.config.ts
```

Pages stays a noindex preview, and signup stays demo-only. In repository Settings → Pages, the publishing source must be GitHub Actions.

## Cloudflare setup

The configuration in `wrangler.jsonc` publishes only `dist/`. It serves static HTML with trailing slashes and returns the custom 404 page for unknown paths. No application server or Astro Cloudflare adapter is required for this static build.

Once the Cloudflare account is ready:

```sh
pnpm exec wrangler login
pnpm deploy
```

`pnpm deploy` runs validation before uploading. Wrangler will ask which account to use if needed. Start with the assigned `workers.dev` URL. No account ID, credentials, or custom-domain routes are committed.

For Cloudflare’s Git integration, connect this repository, choose the approved branch, use `pnpm build` as the build command and `pnpm exec wrangler deploy` as the deploy command. Keep `SEO_PRODUCTION=0` for the first review deployment. The GitHub workflow validates pull requests and deploys the verified site to GitHub Pages after changes reach `main`. Cloudflare deployment remains a separate option.

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
