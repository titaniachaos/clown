/**
 * The locale vocabulary, shared by the build-time loaders and the components.
 *
 * Kept free of Vue and VitePress imports so the `.data.ts` loaders, which run
 * in Node, can use it too. The Vue side is in `theme/useLang.ts`.
 */

export type Lang = 'en' | 'bg' | 'de'

export const LANGS: readonly Lang[] = ['en', 'bg', 'de'] as const

/** A value written once per language. */
export type Localised<T = string> = Record<Lang, T>

/** VitePress calls the English locale `root`; the others match their directory. */
export function toLang(localeIndex: string | undefined): Lang {
  return localeIndex === 'bg' ? 'bg' : localeIndex === 'de' ? 'de' : 'en'
}

/** URL prefix for a locale: '' for English, '/bg' and '/de' for the others. */
export function localePrefix(lang: Lang): string {
  return lang === 'en' ? '' : `/${lang}`
}

/**
 * Reduce any form of a page reference to its locale and its slug.
 * `/clown/bg/concept`, `bg/concept.md` and `/bg/concept` all give
 * `{ lang: 'bg', slug: 'concept' }`.
 */
export function parsePage(ref: string): { lang: Lang; slug: string } {
  const parts = ref
    .replace(/^\/?clown\//, '/')
    .replace(/\.md$/, '')
    .split('/')
    .filter(Boolean)

  if (!parts.length) return { lang: 'en', slug: 'index' }
  const lang = toLang(parts[0])
  const rest = parts[0] === 'bg' || parts[0] === 'de' ? parts.slice(1) : parts
  return { lang, slug: rest.join('/') || 'index' }
}

/** Pick a localised value, falling back to English rather than to nothing. */
export function pick<T>(value: Partial<Localised<T>> | undefined, lang: Lang): T | undefined {
  return value?.[lang] ?? value?.en
}
