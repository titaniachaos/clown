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

## Checks

```sh
npm run check           # locale parity, ledger integrity, build, section ids
npm run check:links     # every outward link and DOI still resolves (network)
npm run watch:research  # what has been published since (network)
```

`npm run check` runs on every pull request. The two network-dependent scripts
run on a schedule in `.github/workflows/maintenance.yml` — links weekly, the
research watch monthly — and either can be started by hand from the Actions tab.
The research watch reports into the run's job summary and never fails a build.

Each script exists because something got past a human once:

| Script | What it catches |
| --- | --- |
| `check-locales.mjs` | a missing translation; heading structures that have drifted apart; a section id present in one language and not another; a page that is half-translated |
| `check-ledger.mjs` | an entry missing a language, an unknown status, a malformed DOI, or a gloss that has fallen behind the English — which is how the German `flop` gloss went stale |
| `check-build.mjs` | a dead `#section-id`, which VitePress does not check; images without alt text; duplicate ids |
| `check-external.mjs` | link rot in the citations. It tells a dead link apart from a publisher refusing an automated request and from an incomplete certificate chain, and fails only on the first. DOIs are checked at Crossref rather than through `doi.org`, which publishers block |
| `watch-research.mjs` | new articles in the journals the ledger cites, filtered on the project's own vocabulary |

## The observer test

```sh
npm run flop:score -- results.csv
```

`scripts/flop-test.mjs` scores the forced-choice run of the observer test: can
a room tell a flop played from genuine not-knowing from one played as rehearsed
craft? It is the studio answer to the `authenticity-effect` entry in the source
ledger, where Davison argues that what an audience reads as spontaneity is a
learnable technique — while the material research stakes the comedy on the
conviction being real. Both cannot be load-bearing.

The CSV needs one row per judgement and nothing else:

```
observer,pair,correct
A,1,1
A,2,0
```

Twelve observers judging six pairs is 72 judgements: above chance at 44 (61%),
convincingly so at 47 (65%). A flat 36 is not a failed test — it bounds the
claim, ruling out any true discriminability above 60%. The script reports the
pooled exact binomial, the per-observer spread, and the result with the two
strongest observers removed, because judgements made in one room over one set
of material are not independent.

It tests both directions. A result significantly *below* chance is not noise:
it means the room named the crafted flop as the genuine one, which is the
objection in its strongest form — not that the difference is invisible, but
that craft out-reads the real thing. Testing only for above-chance would file
that under “no difference”.

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
