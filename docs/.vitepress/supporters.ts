// Awarded funding, and the acknowledgment each award obliges.
//
// EMPTY BY DESIGN. The component renders nothing while `awards` is empty, and
// that is the correct state until a grant is actually awarded: displaying
// "Funded by the European Union" without an award would be a false claim of EU
// funding, not a placeholder.
//
// Add an award only when the grant agreement is signed.
//
// EU obligations, from the Commission emblem rules and EACEA visual identity:
//   - the emblem, unmodified and distinct from any other mark
//   - the funding statement spelled out in full beside it
//   - the official disclaimer, in the reader's language
//   - the emblem at least as prominent as any logo shown with it
// The last one is enforced in CSS: every logo inherits the emblem's height.

export type Lang = 'en' | 'bg' | 'de'

export interface Award {
  /** Funder name, as it should appear. */
  funder: string
  /** 'eu' pulls the emblem, statement and disclaimer. 'national' is a plain credit. */
  kind: 'eu' | 'national'
  /** Which statement the grant agreement specifies. */
  statement?: 'funded' | 'co-funded'
  programme?: string
  /** Optional line of credit for national funders, per language. */
  credit?: Record<Lang, string>
}

/** Signed grants only. Empty until then. */
export const awards: Award[] = []

/** Spelled out in full, never abbreviated. */
export const STATEMENT: Record<'funded' | 'co-funded', Record<Lang, string>> = {
  funded: {
    en: 'Funded by the European Union',
    bg: 'Финансирано от Европейския съюз',
    de: 'Von der Europäischen Union finanziert'
  },
  'co-funded': {
    en: 'Co-funded by the European Union',
    bg: 'Съфинансирано от Европейския съюз',
    de: 'Kofinanziert von der Europäischen Union'
  }
}

/**
 * Official EACEA wording, split at the opening clause.
 *
 * The disclaimer opens with the same statement the grant uses: a co-funded
 * award must not carry a disclaimer beginning "Funded by the European Union".
 * The body is quoted verbatim -- it is a legal text, not copy.
 */
export const DISCLAIMER_BODY: Record<Lang, string> = {
  en: 'Views and opinions expressed are however those of the author(s) only and do not necessarily reflect those of the European Union or the European Education and Culture Executive Agency (EACEA). Neither the European Union nor EACEA can be held responsible for them.',
  bg: 'Изразените възгледи и мнения обаче принадлежат изцяло на техния(ите) автор(и) и не отразяват непременно възгледите и мненията на Европейския съюз или на Европейската изпълнителна агенция за образование и култура (EACEA). За тях не носи отговорност нито Европейският съюз, нито EACEA.',
  de: 'Die geäußerten Ansichten und Meinungen entsprechen jedoch ausschließlich denen des Autors bzw. der Autoren und spiegeln nicht zwingend die der Europäischen Union oder der Europäischen Exekutivagentur für Bildung und Kultur (EACEA) wider. Weder die Europäische Union noch die EACEA können dafür verantwortlich gemacht werden.'
}

export function disclaimer(variant: 'funded' | 'co-funded', lang: Lang): string {
  return `${STATEMENT[variant][lang]}. ${DISCLAIMER_BODY[lang]}`
}

export const SUPPORTED_BY: Record<Lang, string> = {
  en: 'Supported by',
  bg: 'С подкрепата на',
  de: 'Gefördert von'
}

/** Official geometry: 3:2, star centres on a circle of radius H/3, each star H/18. */
export const EU_EMBLEM = `<rect width="300" height="200" fill="#039"/><g fill="#FC0"><polygon points="150.00,22.22 152.49,29.90 160.57,29.90 154.04,34.64 156.53,42.32 150.00,37.58 143.47,42.32 145.96,34.64 139.43,29.90 147.51,29.90"/><polygon points="183.33,31.15 185.83,38.83 193.90,38.83 187.37,43.58 189.86,51.25 183.33,46.51 176.80,51.25 179.30,43.58 172.77,38.83 180.84,38.83"/><polygon points="207.74,55.56 210.23,63.23 218.30,63.23 211.77,67.98 214.27,75.66 207.74,70.91 201.20,75.66 203.70,67.98 197.17,63.23 205.24,63.23"/><polygon points="216.67,88.89 219.16,96.57 227.23,96.57 220.70,101.31 223.20,108.99 216.67,104.24 210.14,108.99 212.63,101.31 206.10,96.57 214.17,96.57"/><polygon points="207.74,122.22 210.23,129.90 218.30,129.90 211.77,134.64 214.27,142.32 207.74,137.58 201.20,142.32 203.70,134.64 197.17,129.90 205.24,129.90"/><polygon points="183.33,146.62 185.83,154.30 193.90,154.30 187.37,159.05 189.86,166.72 183.33,161.98 176.80,166.72 179.30,159.05 172.77,154.30 180.84,154.30"/><polygon points="150.00,155.56 152.49,163.23 160.57,163.23 154.04,167.98 156.53,175.66 150.00,170.91 143.47,175.66 145.96,167.98 139.43,163.23 147.51,163.23"/><polygon points="116.67,146.62 119.16,154.30 127.23,154.30 120.70,159.05 123.20,166.72 116.67,161.98 110.14,166.72 112.63,159.05 106.10,154.30 114.17,154.30"/><polygon points="92.26,122.22 94.76,129.90 102.83,129.90 96.30,134.64 98.80,142.32 92.26,137.58 85.73,142.32 88.23,134.64 81.70,129.90 89.77,129.90"/><polygon points="83.33,88.89 85.83,96.57 93.90,96.57 87.37,101.31 89.86,108.99 83.33,104.24 76.80,108.99 79.30,101.31 72.77,96.57 80.84,96.57"/><polygon points="92.26,55.56 94.76,63.23 102.83,63.23 96.30,67.98 98.80,75.66 92.26,70.91 85.73,75.66 88.23,67.98 81.70,63.23 89.77,63.23"/><polygon points="116.67,31.15 119.16,38.83 127.23,38.83 120.70,43.58 123.20,51.25 116.67,46.51 110.14,51.25 112.63,43.58 106.10,38.83 114.17,38.83"/></g>`
