# Clown

VitePress source for **Solo Titania Chaos 2026**, published at
<https://titaniachaos.github.io/clown/>.

## Development

Requires Node.js 26.

```sh
npm ci
npm run docs:dev
```

`npm run docs:build` writes a production build to `docs/.vitepress/dist`, and
`npm run docs:preview` serves it.

## Structure

Five pages carry the project in each language:

| File | Holds |
| --- | --- |
| `index.md` | Home |
| `concept.md` | Artistic concept · seven movements · audience relationship |
| `studio-process.md` | Twelve-week process · rehearsal toolkit · material research |
| `sources.md` | The source ledger, rendered from `docs/.vitepress/sources.data.ts` |
| `production.md` | Decision gates · production approach · about · work with the project |

Each former page is now a section with a **hand-written id** — `## Artistic
concept {#concept}` — and the same id is used in all three languages. Cross-links
therefore point at `/studio-process#toolkit` rather than at a slugified
translation of a heading, and they keep working when a heading is reworded.
`SECTIONS` in `docs/.vitepress/config.mts` lists those ids with a label per
language, and builds both the navbar and the sidebar from them: adding a section
means adding a heading with an id and one row to that array.

## Languages

The site is published in English (root), Bulgarian (`/bg/`) and German (`/de/`).
Page slugs are identical in every language so the language switcher can map a
page to its counterpart by swapping the path prefix — add a translation as
`docs/bg/<slug>.md` and `docs/de/<slug>.md`, then add the labels to `SECTIONS` in
`docs/.vitepress/config.mts`.

## SEO

`docs/.vitepress/seo.ts` generates, per page: a canonical URL, the full Open
Graph and Twitter card set, `hreflang` alternates for every language that
actually has the page, and schema.org JSON-LD. `robots.txt` and a `sitemap.xml`
carrying `xhtml:link` alternates are emitted at build time.

To verify the site in Google Search Console, paste the token from the **HTML
tag** method into `GOOGLE_SITE_VERIFICATION` in that file. The HTML-file method
cannot be used, because the main site's deploy workflow rejects `.html` sources.

## Deployment

Pushing to `main` builds the site and deploys it to GitHub Pages.

> **Pages → Custom domain must stay empty.** The repository is served from the
> `/clown/` sub-path of `titaniachaos.github.io`, which is what `base` in
> `docs/.vitepress/config.mts` and every canonical URL assume. Setting a custom
> domain redirects the sub-path away and breaks those URLs.
