import { createContentLoader, defineLoader } from 'vitepress'

/**
 * The relation graph, built at build time from page frontmatter.
 *
 * Each page declares only its OUTBOUND edges. The inverse edge is derived
 * here, so a link written once appears on both pages and the two can never
 * disagree. Target titles are read from the target locale's own frontmatter,
 * which means no link text is ever hand-translated.
 */

export type Lang = 'en' | 'bg' | 'de'

/** The kinds of connection this documentation actually has. */
export const KINDS = {
  'rests-on': {
    inverse: 'grounds',
    label: { en: 'Rests on', bg: 'Опира се на', de: 'Stützt sich auf' }
  },
  grounds: {
    inverse: 'rests-on',
    label: { en: 'Grounds', bg: 'Обосновава', de: 'Begründet' }
  },
  'tested-by': {
    inverse: 'tests',
    label: { en: 'Tested by', bg: 'Проверява се чрез', de: 'Erprobt durch' }
  },
  tests: {
    inverse: 'tested-by',
    label: { en: 'Tests', bg: 'Проверява', de: 'Erprobt' }
  },
  'decided-in': {
    inverse: 'decides',
    label: { en: 'Decided in', bg: 'Решава се в', de: 'Entschieden in' }
  },
  decides: {
    inverse: 'decided-in',
    label: { en: 'Decides', bg: 'Решава', de: 'Entscheidet' }
  }
} as const

export type Kind = keyof typeof KINDS

export interface Edge {
  /** Anchor on the page this edge is rendered on; '' for the page itself. */
  from: string
  kind: Kind
  /** Page slug of the target, without locale prefix. */
  slug: string
  /** Anchor on the target page. */
  anchor: string
  /** Whether this edge was declared here or derived from the other end. */
  derived: boolean
}

export interface Data {
  /** slug -> locale -> page title, read from each locale's frontmatter. */
  titles: Record<string, Partial<Record<Lang, string>>>
  /** slug -> edges to render on that page. */
  edges: Record<string, Edge[]>
  kinds: typeof KINDS
}

declare const data: Data
export { data }

/** `/clown/bg/concept` and `bg/concept.md` both reduce to `bg|concept`. */
function parse(url: string): { lang: Lang; slug: string } | null {
  const clean = url.replace(/^\/?clown\//, '/').replace(/\.md$/, '').replace(/^\/+/, '')
  const parts = clean.split('/').filter(Boolean)
  if (!parts.length) return { lang: 'en', slug: 'index' }
  const lang: Lang = parts[0] === 'bg' ? 'bg' : parts[0] === 'de' ? 'de' : 'en'
  const rest = lang === 'en' ? parts : parts.slice(1)
  return { lang, slug: rest.join('/') || 'index' }
}

/** `sources#ledger` -> { slug: 'sources', anchor: 'ledger' } */
function target(spec: string): { slug: string; anchor: string } {
  const [slug, anchor = ''] = String(spec).split('#')
  return { slug: slug.replace(/^\//, ''), anchor }
}

export default defineLoader({
  async load(): Promise<Data> {
    const pages = await createContentLoader('**/*.md', {
      includeSrc: false,
      render: false
    }).load()

    const titles: Data['titles'] = {}
    const edges: Data['edges'] = {}
    const push = (slug: string, e: Edge) => {
      ;(edges[slug] ||= []).push(e)
    }

    for (const page of pages) {
      const id = parse(page.url)
      if (!id) continue
      const title = page.frontmatter?.title
      if (title) (titles[id.slug] ||= {})[id.lang] = String(title)
    }

    // Declared edges are read from the English page only; the graph is
    // locale-independent, so reading it three times would just triple it.
    for (const page of pages) {
      const id = parse(page.url)
      if (!id || id.lang !== 'en') continue
      const declared = page.frontmatter?.relations
      if (!Array.isArray(declared)) continue

      for (const rel of declared) {
        const kind = rel?.kind as Kind
        if (!kind || !(kind in KINDS) || !rel?.to) continue
        const t = target(rel.to)
        push(id.slug, { from: String(rel.from ?? ''), kind, ...t, derived: false })
        push(t.slug, {
          from: t.anchor,
          kind: KINDS[kind].inverse as Kind,
          slug: id.slug,
          anchor: String(rel.from ?? ''),
          derived: true
        })
      }
    }

    return { titles, edges, kinds: KINDS }
  }
})
