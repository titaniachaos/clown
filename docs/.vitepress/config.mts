import { defineConfig, type DefaultTheme } from 'vitepress'
import {
  BASE,
  GOOGLE_SITE_VERIFICATION,
  HOSTNAME,
  buildHead,
  localeAlternateTags
} from './seo.ts'
import { runBuildHooks, runSitemapHooks } from './generators.ts'

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
    // VitePress enumerates the pages and writes the XML; the integrations only
    // enrich each item. See generators.ts.
    transformItems: runSitemapHooks
  },

  async buildEnd(siteConfig) {
    await runBuildHooks(siteConfig)
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
