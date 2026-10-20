# Otto GTM development

- Edit Astro source in `src/` and assets in `public/`. The HTML snapshots at the repository root support existing GitHub Pages review URLs and are not the Astro source.
- Preserve the selected editorial design, Otto logo, local fonts, accessibility, and tool download styling.
- Keep this repository independent of the clinical application. Changes here do not authorize changes to `ai-native-next`, auth, API routes, DNS, or application releases.
- Run `pnpm validate` and the relevant browser tests before a PR. Visually inspect desktop and mobile output after layout changes; HTML assertions do not establish visual correctness.
- Use a feature branch and PR against `main`. Share the PR and a preview URL when a preview is deployed. Do not merge or deploy without the applicable user authorization.
- Waitlist collection is demo-only until an approved backend is implemented. Never copy credentials, lead data, local databases, or internal handoff material into this repository.
- Keep previews noindex. Production indexing and the shared-domain route contract require explicit release configuration.
- Do not publish unsupported product, security, pricing, or comparative claims.
- Use natural, complete sentences. Avoid generic marketing filler and rhetorical “X, not Y” contrasts.
