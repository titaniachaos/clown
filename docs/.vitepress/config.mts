import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { defineConfig, type DefaultTheme } from 'vitepress'
import {
  BASE,
  GOOGLE_SITE_VERIFICATION,
  HOSTNAME,
  LOCALES,
  buildHead,
  localeAlternateTags,
  splitLocale
} from './seo.ts'
import { WORKS, apaText } from './bibliography.ts'

/** The main Titania Chaos site, of which this project is a part. */
const MAIN_SITE = (prefix: string) => `${HOSTNAME}${prefix}/`

/**
 * The main site shares this host, so a link to it is a same-site navigation:
 * no new tab, no external-link icon, and the referrer is worth keeping.
 */
const SAME_SITE = { target: '_self', rel: '', noIcon: true } as const

/** Where the legal notice lives: it belongs to the main site, one per locale. */
const LEGAL = (prefix: string) => `${HOSTNAME}${prefix}/legal-data`

/**
 * Four pages carry the whole project, and each one carries several of the
 * former pages as sections with stable ids. The ids are written into the
 * Markdown by hand (`{#dramaturgy}`), so they are identical in every locale
 * and a cross-link never has to guess a slugified translation.
 */
type Column = 1 | 2 | 3

const HOME = ['Project Home', 'Начало на проекта', 'Projekt-Startseite'] as const

const SECTIONS = [
  {
    slug: 'concept',
    anchor: 'concept',
    label: ['The Work', 'Работата', 'Die Arbeit'],
    items: [
      ['concept', 'Artistic concept', 'Художествена концепция', 'Künstlerisches Konzept'],
      ['modes', 'Nine modes of solitude', 'Девет режима на уединението', 'Neun Spielarten'],
      ['dramaturgy', 'Seven movements', 'Седем движения', 'Sieben Bewegungen'],
      ['audience', 'Audience relationship', 'Отношение с публиката', 'Beziehung zum Publikum']
    ]
  },
  {
    slug: 'studio-process',
    anchor: 'process',
    label: ['The Studio', 'Студиото', 'Das Studio'],
    items: [
      ['process', 'Twelve-week process', 'Дванадесетседмичен процес', 'Zwölfwöchiger Prozess'],
      ['toolkit', 'Rehearsal toolkit', 'Репетиционен инструментариум', 'Probenwerkzeuge'],
      ['flop-scale', 'The flop scale', 'Скалата на флоповете', 'Die Flop-Skala'],
      ['material', 'Material research', 'Изследване на материала', 'Materialrecherche'],
      ['two-and-two', 'Two and two make five', 'Две и две правят пет', 'Zwei und zwei macht fünf']
    ]
  },
  {
    slug: 'sources',
    anchor: 'ledger',
    label: ['Sources', 'Източници', 'Quellen'],
    items: [
      ['ledger', 'The ledger', 'Регистърът', 'Das Verzeichnis'],
      ['land', 'Where these land', 'Къде се появяват', 'Wo sie auftauchen']
    ]
  },
  {
    slug: 'production',
    anchor: 'decisions',
    label: ['Production & Support', 'Продукция и подкрепа', 'Produktion & Unterstützung'],
    items: [
      ['decisions', 'Decision gates', 'Решаващи точки', 'Entscheidungspunkte'],
      ['production', 'Production approach', 'Подход към продукцията', 'Produktionsansatz'],
      ['about', 'About the project', 'За проекта', 'Über das Projekt'],
      ['work', 'Work with the project', 'Работа с проекта', 'Mit dem Projekt arbeiten']
    ]
  }
] as const

function sidebar(prefix: string, groupText: string, column: Column): DefaultTheme.SidebarItem[] {
  return [
    {
      text: groupText,
      items: [
        { text: HOME[column - 1], link: `${prefix}/` },
        ...SECTIONS.map((section) => ({
          text: section.label[column - 1],
          link: `${prefix}/${section.slug}#${section.anchor}`,
          collapsed: false,
          items: section.items.map(([anchor, ...labels]) => ({
            text: labels[column - 1],
            link: `${prefix}/${section.slug}#${anchor}`
          }))
        }))
      ]
    }
  ]
}

function nav(prefix: string, column: Column, mainSiteLabel: string): DefaultTheme.NavItem[] {
  return [
    { text: HOME[column - 1], link: `${prefix}/` },
    ...SECTIONS.map((section) => ({
      text: section.label[column - 1],
      link: `${prefix}/${section.slug}#${section.anchor}`,
      activeMatch: `${prefix}/${section.slug}`
    })),
    // Same domain, different repository: keep the reader in their own language
    // and in the same tab.
    { text: mainSiteLabel, link: MAIN_SITE(prefix), ...SAME_SITE }
  ]
}

export default defineConfig({
  base: BASE,
  title: 'Solo Titania Chaos',
  titleTemplate: ':title | Solo Titania Chaos',
  description:
    'Research, dramaturgy, rehearsal and production for the wordless Solo Titania Chaos clown project.',
  cleanUrls: true,

  // Stated rather than left to the default, so nobody reaches for it to
  // make a red build green. It covers links to pages; fragments are not
  // checked by VitePress at all, which is what scripts/check-build.mjs is
  // for -- this site navigates almost entirely by written section ids.
  ignoreDeadLinks: false,

  markdown: {
    // `markdown.externalLinks` is global, and these two sites share a host:
    // a link between them is a same-site navigation, while revolut.me really
    // should open a new tab. So strip the new-tab attributes per host.
    config: (md) => {
      const renderLink =
        md.renderer.rules.link_open ??
        ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))

      md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
        const href = tokens[idx].attrGet('href') ?? ''
        if (!href.startsWith(HOSTNAME)) return renderLink(tokens, idx, options, env, self)

        // The theme also draws the arrow from `a[href*="://"]` in CSS, so the
        // class is needed as well as dropping the new-tab attributes.
        tokens[idx].attrJoin('class', 'no-icon')
        return renderLink(tokens, idx, options, env, self)
          .replace(' target="_blank"', '')
          .replace(' rel="noreferrer"', '')
      }
    }
  },

  head: [
    ['meta', { name: 'theme-color', content: '#d62246' }],
    // The bibliography is a feed, so say so in the head: a reference manager
    // that autodiscovers it gets every citation without scraping the page.
    ['link', {
      rel: 'alternate',
      type: 'application/atom+xml',
      title: 'Solo Titania Chaos 2026 — source bibliography',
      href: `${HOSTNAME}${BASE}citations.atom`
    }],
    ...(GOOGLE_SITE_VERIFICATION
      ? [['meta', { name: 'google-site-verification', content: GOOGLE_SITE_VERIFICATION }] as const]
      : [])
  ],

  transformHead: (ctx) => buildHead(ctx, ctx.siteConfig),

  transformHtml: (code, _id, ctx) => {
    const tags = localeAlternateTags(ctx.page)
    return tags ? code.replace('</head>', `${tags}</head>`) : code
  },

  sitemap: {
    hostname: `${HOSTNAME}${BASE}`,
    transformItems: (items) => {
      const known = new Set(items.map((i) => (i.url.startsWith('/') ? i.url : `/${i.url}`)))
      const absolute = (path: string) => `${HOSTNAME}${BASE}${path.replace(/^\//, '')}`
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
        return { ...item, links, changefreq: 'monthly' as const, priority: slug === '/' ? 1.0 : 0.8 }
      })
    }
  },

  async buildEnd(siteConfig) {
    // Scoped to this sub-path: robots.txt at the domain root belongs to the
    // main site, so this file is advisory for anything reading it directly.
    const robots = ['User-agent: *', 'Allow: /', '', `Sitemap: ${HOSTNAME}${BASE}sitemap.xml`, ''].join('\n')
    await writeFile(join(siteConfig.outDir, 'robots.txt'), robots, 'utf-8')

    // The bibliography as an Atom feed: one entry per work, the reference
    // rendered from the structured record rather than typed twice.
    const xml = (t: string) =>
      t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    const stamp = new Date().toISOString()
    const self = `${HOSTNAME}${BASE}citations.atom`
    const entries = WORKS.map((w) => {
      const cites = w.records.map((r) => `${HOSTNAME}${BASE}sources#${r}`)
      return [
        '  <entry>',
        `    <id>tag:titaniachaos.github.io,2026:clown/work/${xml(w.id)}</id>`,
        `    <title>${xml(w.title)}</title>`,
        `    <updated>${stamp}</updated>`,
        ...w.authors.map((a) => `    <author><name>${xml(a)}</name></author>`),
        `    <link rel="alternate" href="${xml(cites[0] ?? `${HOSTNAME}${BASE}sources`)}"/>`,
        w.doi ? `    <link rel="related" href="https://doi.org/${xml(w.doi)}"/>` : '',
        !w.doi && w.url ? `    <link rel="related" href="${xml(w.url)}"/>` : '',
        `    <category term="${xml(w.type)}" label="work type"/>`,
        `    <category term="${xml(w.read)}" label="how far this project read it"/>`,
        ...w.records.map((r) => `    <category term="${xml(r)}" label="ledger record"/>`),
        '    <content type="html">',
        `      ${xml(`<p>${apaText(w)}</p>`)}`,
        w.note ? `      ${xml(`<p>${w.note}</p>`)}` : '',
        `      ${xml(`<p>Cited by: ${cites.map((c) => `<a href="${c}">${c}</a>`).join(', ')}</p>`)}`,
        '    </content>',
        '  </entry>'
      ].filter(Boolean).join('\n')
    })
    const feed = [
      '<?xml version="1.0" encoding="utf-8"?>',
      '<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">',
      `  <id>tag:titaniachaos.github.io,2026:clown/citations</id>`,
      '  <title>Solo Titania Chaos 2026 — source bibliography</title>',
      '  <subtitle>Every work the project cites, in APA form, one entry per work.</subtitle>',
      `  <updated>${stamp}</updated>`,
      `  <link rel="self" type="application/atom+xml" href="${self}"/>`,
      `  <link rel="alternate" type="text/html" href="${HOSTNAME}${BASE}sources"/>`,
      '  <author><name>Titania Chaos</name></author>',
      `  <generator uri="${HOSTNAME}${BASE}">Solo Titania Chaos source ledger</generator>`,
      ...entries,
      '</feed>',
      ''
    ].join('\n')
    await writeFile(join(siteConfig.outDir, 'citations.atom'), feed, 'utf-8')
  },

  themeConfig: {
    socialLinks: [{ icon: 'instagram', link: 'https://www.instagram.com/titaniachaos' }],
    search: {
      provider: 'local',
      options: {
        locales: {
          bg: {
            translations: {
              button: { buttonText: 'Търсене', buttonAriaLabel: 'Търсене' },
              modal: {
                displayDetails: 'Подробен изглед',
                resetButtonTitle: 'Изчисти търсенето',
                backButtonTitle: 'Затвори търсенето',
                noResultsText: 'Няма резултати за',
                footer: {
                  selectText: 'избор',
                  selectKeyAriaLabel: 'enter',
                  navigateText: 'навигация',
                  navigateUpKeyAriaLabel: 'стрелка нагоре',
                  navigateDownKeyAriaLabel: 'стрелка надолу',
                  closeText: 'затваряне',
                  closeKeyAriaLabel: 'esc'
                }
              }
            }
          },
          de: {
            translations: {
              button: { buttonText: 'Suchen', buttonAriaLabel: 'Suchen' },
              modal: {
                displayDetails: 'Detailansicht anzeigen',
                resetButtonTitle: 'Suche zurücksetzen',
                backButtonTitle: 'Suche schließen',
                noResultsText: 'Keine Ergebnisse für',
                footer: {
                  selectText: 'auswählen',
                  selectKeyAriaLabel: 'Eingabetaste',
                  navigateText: 'navigieren',
                  navigateUpKeyAriaLabel: 'Pfeil nach oben',
                  navigateDownKeyAriaLabel: 'Pfeil nach unten',
                  closeText: 'schließen',
                  closeKeyAriaLabel: 'esc'
                }
              }
            }
          }
        }
      }
    }
  },

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: nav('', 1, 'Titania Chaos'),
        sidebar: sidebar('', 'Solo Titania Chaos', 1),
        outline: { level: [2, 3], label: 'On this page' },
        docFooter: { prev: 'Previous page', next: 'Next page' },
        footer: {
          message: `Part of <a href="${MAIN_SITE('')}">Titania Chaos</a>. · <a href="${LEGAL('')}">Legal notice &amp; privacy</a>`,
          copyright: '© 2026 Titania Chaos'
        },
        notFound: {
          title: 'PAGE NOT FOUND',
          quote: 'The clown looked everywhere. This page is not here.',
          linkLabel: 'go to home',
          linkText: 'Take me home'
        }
      }
    },

    bg: {
      label: 'Български',
      lang: 'bg',
      title: 'Соло Титания Хаос',
      titleTemplate: ':title | Соло Титания Хаос',
      description:
        'Изследване, драматургия, репетиции и продукция за безсловесния клоунски проект „Соло Титания Хаос“.',
      themeConfig: {
        nav: nav('/bg', 2, 'Титания Хаос'),
        sidebar: sidebar('/bg', 'Соло Титания Хаос', 2),
        outline: { level: [2, 3], label: 'На тази страница' },
        docFooter: { prev: 'Предишна страница', next: 'Следваща страница' },
        footer: {
          message: `Част от <a href="${MAIN_SITE('/bg')}">Титания Хаос</a>. · <a href="${LEGAL('/bg')}">Правна информация и поверителност</a>`,
          copyright: '© 2026 Титания Хаос'
        },
        darkModeSwitchLabel: 'Изглед',
        lightModeSwitchTitle: 'Към светлата тема',
        darkModeSwitchTitle: 'Към тъмната тема',
        sidebarMenuLabel: 'Меню',
        returnToTopLabel: 'Към началото',
        langMenuLabel: 'Смяна на езика',
        skipToContentLabel: 'Към съдържанието',
        notFound: {
          title: 'СТРАНИЦАТА НЕ Е НАМЕРЕНА',
          quote: 'Клоунът търси навсякъде. Тази страница я няма.',
          linkLabel: 'към началната страница',
          linkText: 'Към началото'
        }
      }
    },

    de: {
      label: 'Deutsch',
      lang: 'de-AT',
      titleTemplate: ':title | Solo Titania Chaos',
      description:
        'Recherche, Dramaturgie, Proben und Produktion für das wortlose Clown-Projekt Solo Titania Chaos.',
      themeConfig: {
        nav: nav('/de', 3, 'Titania Chaos'),
        sidebar: sidebar('/de', 'Solo Titania Chaos', 3),
        outline: { level: [2, 3], label: 'Auf dieser Seite' },
        docFooter: { prev: 'Vorherige Seite', next: 'Nächste Seite' },
        footer: {
          message: `Teil von <a href="${MAIN_SITE('/de')}">Titania Chaos</a>. · <a href="${LEGAL('/de')}">Impressum &amp; Datenschutz</a>`,
          copyright: '© 2026 Titania Chaos'
        },
        darkModeSwitchLabel: 'Darstellung',
        lightModeSwitchTitle: 'Zum hellen Design wechseln',
        darkModeSwitchTitle: 'Zum dunklen Design wechseln',
        sidebarMenuLabel: 'Menü',
        returnToTopLabel: 'Nach oben',
        langMenuLabel: 'Sprache wechseln',
        skipToContentLabel: 'Zum Inhalt springen',
        notFound: {
          title: 'SEITE NICHT GEFUNDEN',
          quote: 'Der Clown hat überall gesucht. Diese Seite ist nicht hier.',
          linkLabel: 'zur Startseite',
          linkText: 'Zur Startseite'
        }
      }
    }
  }
})
