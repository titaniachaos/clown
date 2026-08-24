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

/** The main Titania Chaos site, of which this project is a part. */
const MAIN_SITE = `${HOSTNAME}/`

/**
 * Slugs are identical in every locale so the language switcher can map a page
 * to its counterpart by swapping the path prefix. Only the labels differ.
 */
const PAGES = [
  ['', 'Project Home', 'Начало на проекта', 'Projekt-Startseite'],
  ['concept', 'Artistic Concept', 'Художествена концепция', 'Künstlerisches Konzept'],
  ['audience', 'Audience Relationship', 'Отношение с публиката', 'Beziehung zum Publikum'],
  ['dramaturgy', 'Dramaturgy', 'Драматургия', 'Dramaturgie'],
  ['studio-process', 'Studio Process', 'Студиен процес', 'Studioprozess'],
  ['rehearsal-toolkit', 'Rehearsal Toolkit', 'Репетиционен инструментариум', 'Probenwerkzeuge'],
  ['material-research', 'Material Research', 'Изследване на материала', 'Materialrecherche'],
  ['decisions', 'Decision Gates', 'Решаващи точки', 'Entscheidungspunkte'],
  ['sources', 'Sources and Lineages', 'Източници и традиции', 'Quellen und Linien'],
  ['production', 'Production', 'Продукция', 'Produktion'],
  ['about', 'About the Project', 'За проекта', 'Über das Projekt']
] as const

function sidebar(prefix: string, groupText: string, column: 1 | 2 | 3): DefaultTheme.SidebarItem[] {
  return [
    {
      text: groupText,
      items: PAGES.map(([slug, ...labels]) => ({
        text: labels[column - 1],
        link: `${prefix}/${slug}`
      }))
    }
  ]
}

export default defineConfig({
  base: BASE,
  title: 'Solo Titania Chaos 2026',
  titleTemplate: ':title | Solo Titania Chaos 2026',
  description:
    'Research, dramaturgy, rehearsal and production for the wordless Solo Titania Chaos 2026 clown project.',
  cleanUrls: true,

  head: [
    ['meta', { name: 'theme-color', content: '#d62246' }],
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
    transformItems: (items) =>
      items.map((item) => {
        const urlPath = item.url.startsWith('/') ? item.url : `/${item.url}`
        const { slug } = splitLocale(urlPath)
        const known = new Set(items.map((i) => (i.url.startsWith('/') ? i.url : `/${i.url}`)))
        const links = LOCALES.flatMap((locale) => {
          const alt = slug === '/' ? `${locale.prefix}/` : `${locale.prefix}${slug}`
          return known.has(alt)
            ? [{ lang: locale.hreflang, url: `${HOSTNAME}${BASE}${alt.replace(/^\//, '')}` }]
            : []
        })
        return { ...item, links, changefreq: 'monthly' as const, priority: slug === '/' ? 1.0 : 0.7 }
      })
  },

  async buildEnd(siteConfig) {
    // Scoped to this sub-path: robots.txt at the domain root belongs to the
    // main site, so this file is advisory for anything reading it directly.
    const robots = ['User-agent: *', 'Allow: /', '', `Sitemap: ${HOSTNAME}${BASE}sitemap.xml`, ''].join('\n')
    await writeFile(join(siteConfig.outDir, 'robots.txt'), robots, 'utf-8')
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
        nav: [
          { text: 'Home', link: '/' },
          { text: 'Concept', link: '/concept' },
          { text: 'Dramaturgy', link: '/dramaturgy' },
          { text: 'Studio', link: '/studio-process' },
          { text: 'Titania Chaos', link: MAIN_SITE }
        ],
        sidebar: sidebar('', 'Solo Titania Chaos 2026', 1),
        outline: { level: [2, 3], label: 'On this page' },
        docFooter: { prev: 'Previous page', next: 'Next page' },
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
      title: 'Соло Титания Хаос 2026',
      titleTemplate: ':title | Соло Титания Хаос 2026',
      description:
        'Изследване, драматургия, репетиции и продукция за безсловесния клоунски проект „Соло Титания Хаос 2026“.',
      themeConfig: {
        nav: [
          { text: 'Начало', link: '/bg/' },
          { text: 'Концепция', link: '/bg/concept' },
          { text: 'Драматургия', link: '/bg/dramaturgy' },
          { text: 'Студио', link: '/bg/studio-process' },
          { text: 'Титания Хаос', link: MAIN_SITE }
        ],
        sidebar: sidebar('/bg', 'Соло Титания Хаос 2026', 2),
        outline: { level: [2, 3], label: 'На тази страница' },
        docFooter: { prev: 'Предишна страница', next: 'Следваща страница' },
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
      titleTemplate: ':title | Solo Titania Chaos 2026',
      description:
        'Recherche, Dramaturgie, Proben und Produktion für das wortlose Clown-Projekt Solo Titania Chaos 2026.',
      themeConfig: {
        nav: [
          { text: 'Start', link: '/de/' },
          { text: 'Konzept', link: '/de/concept' },
          { text: 'Dramaturgie', link: '/de/dramaturgy' },
          { text: 'Studio', link: '/de/studio-process' },
          { text: 'Titania Chaos', link: MAIN_SITE }
        ],
        sidebar: sidebar('/de', 'Solo Titania Chaos 2026', 3),
        outline: { level: [2, 3], label: 'Auf dieser Seite' },
        docFooter: { prev: 'Vorherige Seite', next: 'Nächste Seite' },
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
