import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { SiteConfig } from 'vitepress'
import { BASE, HOSTNAME, LOCALES, splitLocale } from './seo.ts'
import { WORKS, apaText } from './bibliography.ts'
import { atom, type FeedItem } from './feed.ts'
import { fold, workLeaf, RECEIPT_SCHEME } from './receipt.ts'

/**
 * Build-time integrations, in Astro's shape: a named object with a `hooks` map.
 *
 * The shape is borrowed; the hooks are VitePress's own. Nothing here replaces a
 * VitePress mechanism — `sitemap` still enumerates pages and writes the XML,
 * and this only enriches each item through the documented `transformItems`.
 * Outputs VitePress does not produce at all are written from `buildEnd`, the
 * hook meant for that.
 *
 * Adding an integration is one array entry. The runners fan out over whichever
 * hooks each declares, so config.mts keeps two lines however many there are.
 */

const esc = (t: string) =>
  t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const absolute = (path: string) => `${HOSTNAME}${BASE}${path.replace(/^\//, '')}`

/**
 * A real information hierarchy for sitemap consumers that still use these
 * optional hints. Google ignores priority/changefreq; titles, links and
 * content remain the signals that matter there.
 */
function sitemapMeta(slug: string): Pick<SitemapItem, 'changefreq' | 'priority'> {
  if (slug === '/') return { changefreq: 'weekly', priority: 1.0 }
  if (slug === '/concept') return { changefreq: 'monthly', priority: 0.9 }
  if (slug === '/studio-process' || slug === '/production') {
    return { changefreq: 'monthly', priority: 0.85 }
  }
  if (slug === '/sources') return { changefreq: 'monthly', priority: 0.8 }
  if (slug === '/blog/') return { changefreq: 'weekly', priority: 0.75 }
  if (slug.startsWith('/blog/')) return { changefreq: 'yearly', priority: 0.65 }
  if (slug.startsWith('/topic/')) return { changefreq: 'monthly', priority: 0.6 }
  return { changefreq: 'monthly', priority: 0.5 }
}

// ---------------------------------------------------------------------------

export interface SitemapItem {
  url: string
  links?: { lang: string; url: string }[]
  changefreq?: string
  priority?: number
  [k: string]: unknown
}

export interface EmitContext {
  /** Page sources relative to the docs root, 404 already removed. */
  pages: string[]
  /** One timestamp for the whole build, so outputs agree with each other. */
  stamp: string
  /** Prefixed reporter, so a build log says which integration spoke. */
  logger: { info: (msg: string) => void }
}

/** A file to write into the output directory. */
export interface Emitted {
  file: string
  body: string
}

export interface Integration {
  name: string
  hooks: {
    /** Enrich VitePress's sitemap items. Runs inside `sitemap.transformItems`. */
    'sitemap:transform'?: (items: SitemapItem[]) => SitemapItem[]
    /** Produce files VitePress does not generate. Runs inside `buildEnd`. */
    'build:done'?: (ctx: EmitContext) => Emitted[]
  }
}

// ---------------------------------------------------------------------------
// hreflang — extends VitePress's sitemap rather than replacing it.
// ---------------------------------------------------------------------------

const hreflang: Integration = {
  name: 'hreflang',
  hooks: {
    'sitemap:transform': (items) => {
      const known = new Set(items.map((i) => (i.url.startsWith('/') ? i.url : `/${i.url}`)))
      return items.map((item) => {
        const urlPath = item.url.startsWith('/') ? item.url : `/${item.url}`
        const { slug } = splitLocale(urlPath)
        const links = LOCALES.flatMap((locale) => {
          const alt = slug === '/' ? `${locale.prefix}/` : `${locale.prefix}${slug}`
          return known.has(alt) ? [{ lang: locale.hreflang, url: absolute(alt) }] : []
        })
        // Search Console reads x-default from the sitemap as well as the head.
        const english = slug === '/' ? '/' : slug
        if (known.has(english)) links.push({ lang: 'x-default', url: absolute(english) })
        return { ...item, links, ...sitemapMeta(slug) }
      })
    }
  }
}

// ---------------------------------------------------------------------------
// robots.txt
// ---------------------------------------------------------------------------

const robots: Integration = {
  name: 'robots',
  hooks: {
    'build:done': () => [
      {
        file: 'robots.txt',
        // Crawlers read robots.txt only at the domain root, so this copy is
        // advisory for anything that fetches it directly.
        body: ['User-agent: *', 'Allow: /', '', `Sitemap: ${HOSTNAME}${BASE}sitemap.xml`, ''].join('\n')
      }
    ]
  }
}

// ---------------------------------------------------------------------------
// The bibliography, as an Atom feed with a stylesheet so a browser can read it.
// ---------------------------------------------------------------------------

const citations: Integration = {
  name: 'citations',
  hooks: {
    'build:done': ({ stamp, logger }) => {
      const items: FeedItem[] = WORKS.map((w) => {
        const cites = w.records.map(() => `${HOSTNAME}${BASE}sources#the-source-ledger`)
        return {
          id: `tag:titaniachaos.github.io,2026:clown/work/${w.id}`,
          title: w.title,
          authors: w.authors,
          links: [
            { rel: 'alternate', href: cites[0] ?? `${HOSTNAME}${BASE}sources` },
            ...(w.doi ? [{ rel: 'related' as const, href: `https://doi.org/${w.doi}` }] : []),
            ...(!w.doi && w.url ? [{ rel: 'related' as const, href: w.url }] : [])
          ],
          categories: [
            { term: w.type, label: 'work type' },
            { term: w.read, label: 'how far this project read it' },
            ...w.records.map((r) => ({ term: r, label: 'ledger record' }))
          ],
          content: [
            `<p>${apaText(w)}</p>`,
            w.note ? `<p>${w.note}</p>` : '',
            `<p>Cited by: ${cites.map((c) => `<a href="${c}">${c}</a>`).join(', ')}</p>`
          ]
            .filter(Boolean)
            .join('')
        }
      })

      const unread = items.filter((i) => i.categories?.some((c) => c.term === 'not-read')).length
      logger.info(`${items.length} works, ${items.length - unread} read at first hand`)

      const receipt = fold(WORKS.map(workLeaf))
      logger.info(`receipt ${receipt.term} over ${receipt.leaves} works`)

      return [
        {
          file: 'citations.atom',
          body: atom({
            id: 'tag:titaniachaos.github.io,2026:clown/citations',
            title: 'Solo Titania Chaos 2026 — source bibliography',
            subtitle: 'Every work the project cites, in APA form, one entry per work.',
            self: `${HOSTNAME}${BASE}citations.atom`,
            alternate: `${HOSTNAME}${BASE}sources`,
            author: 'Titania Chaos',
            generator: { uri: `${HOSTNAME}${BASE}`, text: 'Solo Titania Chaos source ledger' },
            stylesheet: `${BASE}citations.xsl`,
            updated: stamp,
            categories: [
              { term: receipt.term, scheme: RECEIPT_SCHEME, label: 'ledger receipt' }
            ],
            items
          })
        },
        { file: 'citations.xsl', body: STYLESHEET },
        {
          // The receipt on its own, for anyone checking the feed without
          // parsing it. Deliberately not timestamped: it must move when the
          // bibliography moves and at no other time, so two builds of the same
          // ledger produce the same bytes.
          file: 'citations-receipt.json',
          body: `${JSON.stringify(
            {
              algorithm: 'sha256',
              leaves: receipt.leaves,
              receipt: receipt.term,
              covers: `${HOSTNAME}${BASE}citations.atom`,
              recompute:
                'sha256 each work as id/title/authors/type/read/records joined on U+001F, ' +
                'sort the hex addresses, sha256 them joined on newline'
            },
            null,
            2
          )}\n`
        }
      ]
    }
  }
}

/**
 * Without this a browser offers the feed as a download. Astro's rss() takes the
 * same option for the same reason: a bibliography should be readable by a human
 * who follows the link, not only by a reference manager.
 */
const STYLESHEET = `<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" encoding="utf-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title><xsl:value-of select="atom:feed/atom:title"/></title>
        <style>
          :root { color-scheme: light dark; --ink:#1b1315; --soft:#6d5c60; --edge:#e6dcde; --accent:#d62246; --bg:#fbf9f9 }
          @media (prefers-color-scheme: dark) {
            :root { --ink:#f2eaec; --soft:#a8979b; --edge:#322a2c; --accent:#f2637f; --bg:#141011 }
          }
          body { margin:0; background:var(--bg); color:var(--ink); line-height:1.6;
                 font-family: Georgia, "Times New Roman", serif; }
          .wrap { max-width:48rem; margin:0 auto; padding:3rem 1.25rem 5rem }
          h1 { font-size:2rem; line-height:1.15; margin:0 0 .5rem }
          .sub { color:var(--soft); margin:0 0 2rem }
          .ref { padding:1.1rem 0; border-top:1px solid var(--edge) }
          .ref p { margin:0 0 .4rem }
          .meta { font-family: ui-monospace, Menlo, monospace; font-size:.72rem;
                  letter-spacing:.05em; text-transform:uppercase; color:var(--soft) }
          a { color:var(--accent) }
        </style>
      </head>
      <body>
        <div class="wrap">
          <h1><xsl:value-of select="atom:feed/atom:title"/></h1>
          <p class="sub"><xsl:value-of select="atom:feed/atom:subtitle"/></p>
          <xsl:for-each select="atom:feed/atom:entry">
            <div class="ref">
              <p><xsl:value-of select="atom:content" disable-output-escaping="yes"/></p>
              <p class="meta">
                <xsl:for-each select="atom:category">
                  <xsl:value-of select="@term"/>
                  <xsl:if test="position() != last()"> · </xsl:if>
                </xsl:for-each>
              </p>
            </div>
          </xsl:for-each>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
`

// ---------------------------------------------------------------------------

export const INTEGRATIONS: Integration[] = [hreflang, robots, citations]

/** Wire into `sitemap.transformItems`. Each integration refines in turn. */
export function runSitemapHooks(items: SitemapItem[]): SitemapItem[] {
  return INTEGRATIONS.reduce(
    (acc, i) => (i.hooks['sitemap:transform'] ? i.hooks['sitemap:transform'](acc) : acc),
    items
  )
}

/** Wire into `buildEnd`. Writes every emitted file and reports each one. */
export async function runBuildHooks(siteConfig: SiteConfig): Promise<void> {
  const stamp = new Date().toISOString()
  const pages = siteConfig.pages.filter((p) => p !== '404.md')

  for (const integration of INTEGRATIONS) {
    const hook = integration.hooks['build:done']
    if (!hook) continue
    const logger = { info: (msg: string) => console.log(`  [${integration.name}] ${msg}`) }
    const files = hook({ pages, stamp, logger })
    await Promise.all(files.map((f) => writeFile(join(siteConfig.outDir, f.file), f.body, 'utf-8')))
    logger.info(files.map((f) => `${f.file} (${(f.body.length / 1024).toFixed(1)} KB)`).join(', '))
  }
}
