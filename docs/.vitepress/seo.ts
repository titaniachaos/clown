import type { HeadConfig, SiteConfig, TransformContext } from 'vitepress'

/**
 * Every canonical URL, hreflang, sitemap entry and schema.org @id is built from
 * this. It is the one thing a move to a custom domain has to change, so it
 * reads from the environment with today's value as the default: a migration is
 * `SITE_ORIGIN=https://example.at npm run docs:build`, not a search and replace.
 */
export const WRITTEN_HOST = 'https://titaniachaos.github.io'

export const HOSTNAME = (process.env.SITE_ORIGIN ?? WRITTEN_HOST).replace(/\/$/, '')

/** Project Pages are served from a sub-path, so every absolute URL carries it. */
export const BASE = '/clown/'

/**
 * Token from Search Console's "HTML tag" verification method (the `content`
 * value only). Leave empty and no tag is emitted. Note that Search Console
 * treats `titaniachaos.github.io/clown/` as part of the parent property --
 * verifying the domain once covers this sub-path too.
 */
export const GOOGLE_SITE_VERIFICATION = ''

export interface LocaleMeta {
  prefix: string
  hreflang: string
  ogLocale: string
}

export const LOCALES: LocaleMeta[] = [
  { prefix: '', hreflang: 'en', ogLocale: 'en_GB' },
  { prefix: '/bg', hreflang: 'bg', ogLocale: 'bg_BG' },
  { prefix: '/de', hreflang: 'de-AT', ogLocale: 'de_AT' }
]

const SITE_NAME = 'Solo Titania Chaos'
const SITE_DESCRIPTION =
  'Research, dramaturgy, rehearsal and production for the wordless Solo Titania Chaos clown project.'

// Hosted by the main site. A landscape crop, because every platform that
// renders a social card crops to roughly 1.91:1.
const OG_IMAGE = `${HOSTNAME}${BASE}images/shadow-card.jpg`
const OG_IMAGE_SIZE = { w: 1200, h: 630, alt: "The clown's shadow on a wall, hat and nose in profile" }

/** `index.md` -> `/`, `bg/concept.md` -> `/bg/concept` (cleanUrls is on). */
export function toUrlPath(page: string): string {
  const p = page.replace(/\.md$/, '')
  if (p === 'index') return '/'
  if (p.endsWith('/index')) return `/${p.slice(0, -'/index'.length)}/`
  return `/${p}`
}

export function splitLocale(urlPath: string): { locale: LocaleMeta; slug: string } {
  for (const locale of LOCALES) {
    if (!locale.prefix) continue
    if (urlPath === `${locale.prefix}/`) return { locale, slug: '/' }
    if (urlPath.startsWith(`${locale.prefix}/`)) {
      return { locale, slug: urlPath.slice(locale.prefix.length) }
    }
  }
  return { locale: LOCALES[0], slug: urlPath }
}

/** Absolute URL for a locale-relative path, including the `/clown/` base. */
function absolute(urlPath: string): string {
  return `${HOSTNAME}${BASE}${urlPath.replace(/^\//, '')}`
}

function existingAlternates(slug: string, pages: string[]) {
  const sources = new Set(pages)
  return LOCALES.flatMap((locale) => {
    const urlPath = slug === '/' ? `${locale.prefix}/` : `${locale.prefix}${slug}`
    const source =
      urlPath === '/' ? 'index.md' : `${urlPath.replace(/^\//, '').replace(/\/$/, '/index')}.md`
    return sources.has(source) ? [{ locale, url: absolute(urlPath) }] : []
  })
}

const PERSON_ID = `${HOSTNAME}/#titania`
const PROJECT_ID = `${HOSTNAME}${BASE}#project`
const WEBSITE_ID = `${HOSTNAME}${BASE}#website`

export function buildHead(ctx: TransformContext, siteConfig: SiteConfig): HeadConfig[] {
  const urlPath = toUrlPath(ctx.page)

  if (ctx.page === '404.md') {
    return [['meta', { name: 'robots', content: 'noindex, follow' }]]
  }

  const { locale, slug } = splitLocale(urlPath)
  const canonical = absolute(urlPath)
  const alternates = existingAlternates(slug, siteConfig.pages)
  const title = ctx.pageData.title || ctx.title
  const description = ctx.description || ctx.siteData.description

  const head: HeadConfig[] = [
    ['link', { rel: 'canonical', href: canonical }],

    ['meta', { property: 'og:type', content: slug === '/' ? 'website' : 'article' }],
    ['meta', { property: 'og:site_name', content: SITE_NAME }],
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:url', content: canonical }],
    ['meta', { property: 'og:locale', content: locale.ogLocale }],
    ['meta', { property: 'og:image', content: OG_IMAGE }],
    ['meta', { property: 'og:image:width', content: String(OG_IMAGE_SIZE.w) }],
    ['meta', { property: 'og:image:height', content: String(OG_IMAGE_SIZE.h) }],
    ['meta', { property: 'og:image:alt', content: OG_IMAGE_SIZE.alt }],

    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: title }],
    ['meta', { name: 'twitter:description', content: description }],
    ['meta', { name: 'twitter:image', content: OG_IMAGE }],
    ['meta', { name: 'twitter:image:alt', content: OG_IMAGE_SIZE.alt }]
  ]

  for (const alt of alternates) {
    head.push(['link', { rel: 'alternate', hreflang: alt.locale.hreflang, href: alt.url }])
  }
  const fallback = alternates.find((a) => a.locale.prefix === '')
  if (fallback) {
    head.push(['link', { rel: 'alternate', hreflang: 'x-default', href: fallback.url }])
  }

  head.push([
    'script',
    { type: 'application/ld+json' },
    JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Person',
          '@id': PERSON_ID,
          name: 'Tatiana Petkova',
          alternateName: 'Titania Chaos',
          url: `${HOSTNAME}/`,
          sameAs: [
            'https://www.instagram.com/titaniachaos',
            'https://www.facebook.com/titaniachaos'
          ]
        },
        {
          // A work still in creation: TheaterEvent would assert dates and a
          // venue that do not exist yet.
          '@type': 'CreativeWork',
          '@id': PROJECT_ID,
          name: SITE_NAME,
          description: SITE_DESCRIPTION,
          genre: ['Clown', 'Physical theatre'],
          creator: { '@id': PERSON_ID },
          inLanguage: LOCALES.map((l) => l.hreflang),
          creativeWorkStatus: 'In development'
        },
        {
          '@type': 'WebSite',
          '@id': WEBSITE_ID,
          url: `${HOSTNAME}${BASE}`,
          name: SITE_NAME,
          description: SITE_DESCRIPTION,
          inLanguage: LOCALES.map((l) => l.hreflang),
          publisher: { '@id': PERSON_ID }
        },
        {
          '@type': 'WebPage',
          '@id': `${canonical}#webpage`,
          url: canonical,
          name: title,
          description,
          inLanguage: locale.hreflang,
          isPartOf: { '@id': WEBSITE_ID },
          about: { '@id': PROJECT_ID }
        }
      ]
    })
  ])

  return head
}

export function localeAlternateTags(page: string): string {
  if (page === '404.md') return ''
  const { locale } = splitLocale(toUrlPath(page))
  return LOCALES.filter((l) => l.ogLocale !== locale.ogLocale)
    .map((l) => `<meta property="og:locale:alternate" content="${l.ogLocale}">`)
    .join('')
}
