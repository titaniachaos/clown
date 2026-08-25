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
npm run check           # locale parity, ledger integrity, build, section ids, images, page weight
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
| `check-claims.mjs` | an authority the pages lean on that no record cites. It looks for the shapes a cited person actually appears in — a possessive, a given name before the surname, a title or year after it — rather than for capitalisation, which on these pages is mostly list markers. Run against the revision before Purcell Gates, Laughery, Grock and Orwell were recorded, it names all four. It reports and never fails: a new name is a decision, not an error |
| `check-build.mjs` | a dead `#section-id`, which VitePress does not check; images without alt text; duplicate ids |
| `check-external.mjs` | link rot in the citations. It tells a dead link apart from a publisher refusing an automated request and from an incomplete certificate chain, and fails only on the first. DOIs are checked at Crossref rather than through `doi.org`, which publishers block |
| `check-images.mjs` | an image over the weight budget, pixel dimensions far past any slot on the page, a picture that costs too many bytes per pixel, and — the one no diff shows — `seo.ts` declaring dimensions the file does not have, which is what a social platform reads before it fetches anything. Unreferenced images are reported, not failed: a file may be linked from somewhere this repository cannot see |
| `check-page-weight.mjs` | a page that costs too much to open. It sums what a browser fetches before it can paint — the HTML, the stylesheets, the module preload chain, the preloaded fonts, every image — counting text compressed, because that is how it is served. The file check and this one come apart: an image well inside its own budget can still be why a page is the heaviest on the site |
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

## Moving to a custom domain

A `github.io` address is a real cost on a business card and in search results,
and nothing in this setup prevents the move. Four things change, in this order.

1. **The origin.** `HOSTNAME` in `docs/.vitepress/seo.ts` reads
   `SITE_ORIGIN` and falls back to today's value, so the build takes it from the
   environment. Verify before committing anything:

   ```sh
   SITE_ORIGIN=https://example.at npm run docs:build
   ```

   Canonicals, `hreflang`, the sitemap and every schema.org `@id` follow it.
   Set the same variable in both deploy workflows.

2. **The DNS and the Pages setting**, on the **main** repository only. The
   Clown site follows automatically at `example.at/clown/`.

3. **The three absolute links** from `docs/production.md` and its two
   translations to the main site. They cannot read the config, so they are
   edited by hand — and `npm run check:links` fails on the old domain once it
   stops resolving, which is the safety net.

4. **Search Console**: add the new property and use the change-of-address tool.
   The old `github.io` URLs keep working, so nothing 404s during the move.

What does **not** change: the `tag:` identifiers in the citations feed. Those
are permanent by design — a tag URI is not a URL and must survive a move, which
is the whole reason the feed uses them.

## Deployment

Pushing to `main` builds the site and deploys it to GitHub Pages.

> **Do not set a custom domain on *this* repository.** The Clown site is a
> project site served from the `/clown/` sub-path, and `base` in
> `docs/.vitepress/config.mts` assumes it. A custom domain here would move it to
> the root of that domain and every internal path would be wrong.
>
> A custom domain on the **main** repository is a different matter, and is
> supported: GitHub serves project sites from the user site's custom domain with
> the repository name appended, so `example.at/clown/` would keep working. See
> [About custom domains and GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages).
> What does need changing is listed under Moving to a custom domain below.
