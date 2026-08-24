# Clown

Working source for the *Solo Titania Chaos 2026* project pages.

> **This repository is no longer published.** The Clown pages are deployed from
> [titaniachaos/titaniachaos.github.io](https://github.com/titaniachaos/titaniachaos.github.io)
> (`docs/clown/`) and live at <https://titaniachaos.github.io/clown/>. Edit them there.
>
> GitHub Pages must stay **disabled** on this repository: a repo named `clown` otherwise
> claims the `titaniachaos.github.io/clown/` path and shadows the main site's pages.

## Local preview

Requires Node.js 26.

```sh
npm ci
npm run docs:dev
```

`npm run docs:build` produces a production build in `docs/.vitepress/dist`, and
`npm run docs:preview` serves it.
