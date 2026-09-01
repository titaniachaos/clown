import type { Lang } from './locale.ts'

/**
 * What a blog post is about, and what kind of thing it is.
 *
 * Every post already carried a `tags:` list and nothing read it, so nothing
 * could tell that the same post was filed under different tags in each
 * language -- `twenty-solitudes` was an `exercise` about the `audience` in
 * English and a `field-note` that was not in German. Dead metadata does not
 * stay correct; it only stays quiet.
 *
 * Two axes, one list, because a reader browsing wants both: *what it is about*
 * (solitude, failure, the audience) and *what it is* (an exercise, a reading
 * note). Kept closed so a typo is a failed build rather than a category page
 * with one post on it.
 *
 * Dropped from the old lists: the language, which is already the URL prefix,
 * and the project name, which was on every post and so distinguished nothing.
 */
export const TOPICS = [
  'solitude',
  'audience',
  'failure',
  'object-play',
  'studio-practice',
  'performance',
  'clowning',
  'sources',
  'exercise',
  'reading-note',
  'question'
] as const

export type Topic = (typeof TOPICS)[number]

/** What each is called, in each language. The single place it is written. */
export const TOPIC_NAMES: Record<Lang, Record<Topic, string>> = {
  en: {
    solitude: 'solitude',
    audience: 'audience',
    failure: 'failure',
    'object-play': 'object play',
    'studio-practice': 'studio practice',
    performance: 'performance',
    clowning: 'clowning',
    sources: 'sources',
    exercise: 'exercise',
    'reading-note': 'reading note',
    question: 'question'
  },
  bg: {
    solitude: 'уединение',
    audience: 'публика',
    failure: 'провал',
    'object-play': 'игра с предмети',
    'studio-practice': 'студийна практика',
    performance: 'представление',
    clowning: 'клоунада',
    sources: 'източници',
    exercise: 'упражнение',
    'reading-note': 'бележка от четене',
    question: 'въпрос'
  },
  de: {
    solitude: 'Alleinsein',
    audience: 'Publikum',
    failure: 'Scheitern',
    'object-play': 'Objektspiel',
    'studio-practice': 'Studiopraxis',
    performance: 'Auftritt',
    clowning: 'Clownerie',
    sources: 'Quellen',
    exercise: 'Übung',
    'reading-note': 'Lesenotiz',
    question: 'Frage'
  }
}

/**
 * The copy a generated topic page needs.
 *
 * No singular/plural pair: the counts sit beside their section headings as
 * numerals, which is one fewer thing to get wrong in three languages and
 * reads the same in all of them.
 */
export const TOPIC_UI: Record<Lang, {
  /** `%1` is the topic name. */
  title: string
  description: string
  /** Headings for the two kinds of thing a topic collects. */
  posts: string
  pages: string
  /** The link back to the whole blog. */
  all: string
  /** Before the chips at the foot of a page. */
  about: string
  /** The link into a post from a listing. */
  read: string
}> = {
  en: {
    title: '%1',
    description: 'Everything in the Solo Titania Chaos workspace on %1: blog posts and pages.',
    posts: 'Posts',
    pages: 'Pages',
    all: 'All posts',
    about: 'This page is about',
    read: 'Read article →'
  },
  bg: {
    title: '%1',
    description: 'Всичко в работното пространство на Соло Титания Хаос на тема %1: публикации и страници.',
    posts: 'Публикации',
    pages: 'Страници',
    all: 'Всички публикации',
    about: 'Тази страница е за',
    read: 'Прочетете статията →'
  },
  de: {
    title: '%1',
    description: 'Alles im Arbeitsraum von Solo Titania Chaos zum Thema %1: Beiträge und Seiten.',
    posts: 'Beiträge',
    pages: 'Seiten',
    all: 'Alle Beiträge',
    about: 'Diese Seite handelt von',
    read: 'Artikel lesen →'
  }
}

/**
 * What an address that answers nothing should say.
 *
 * A path here is a question, so a path with no answer is a question this
 * workspace cannot answer yet -- which is worth saying in the reader's own
 * language, with the questions it *can* answer offered beside it.
 */
/** The words around the filing machine. */
export const FILING_UI: Record<Lang, {
  /** `%1` is how many filings there are. */
  of: string
  turn: string
  back: string
  address: string
  /** Turning one line here can move others. Said, not hidden. */
  bound: string
  share: string
  copied: string
}> = {
  en: {
    of: 'One of %1 complete filings',
    turn: 'File this question elsewhere',
    back: 'File this question back',
    address: 'Filing',
    bound: 'Every piece is used exactly once, so giving one question a different piece takes that piece from wherever it was. Turning one line can move another.',
    share: 'Copy this filing',
    copied: 'Copied'
  },
  bg: {
    of: 'Едно от %1 пълни подредби',
    turn: 'Подреди този въпрос другаде',
    back: 'Върни този въпрос',
    address: 'Подредба',
    bound: 'Всяка част се използва точно веднъж, така че да дадеш на един въпрос друга част означава да я вземеш оттам, където е била. Завъртането на един ред може да премести друг.',
    share: 'Копирай подредбата',
    copied: 'Копирано'
  },
  de: {
    of: 'Eine von %1 vollständigen Ablagen',
    turn: 'Diese Frage anders ablegen',
    back: 'Diese Frage zurücklegen',
    address: 'Ablage',
    bound: 'Jedes Stück wird genau einmal verwendet: gibt man einer Frage ein anderes Stück, nimmt man es dort weg, wo es war. Eine Zeile zu drehen kann eine andere bewegen.',
    share: 'Ablage kopieren',
    copied: 'Kopiert'
  }
}

export const MISSING: Record<Lang, {
  /** `%1` is the question as it was asked. */
  asked: string
  /** Nothing carries all of those words together. */
  empty: string
  /** A word the workspace does not use. */
  unknown: string
  /** Before the questions that do have answers. */
  instead: string
  /** Not a topic address at all. */
  plain: string
}> = {
  en: {
    asked: 'Nothing here answers %1.',
    empty: 'Those topics exist, but nothing carries all of them at once.',
    unknown: 'This workspace does not use that word.',
    instead: 'Questions with answers',
    plain: 'That page does not exist.'
  },
  bg: {
    asked: 'Тук нищо не отговаря на %1.',
    empty: 'Тези теми съществуват, но нищо не носи всички наведнъж.',
    unknown: 'Това работно пространство не използва тази дума.',
    instead: 'Въпроси с отговори',
    plain: 'Тази страница не съществува.'
  },
  de: {
    asked: 'Hier beantwortet nichts %1.',
    empty: 'Diese Themen gibt es, aber nichts trägt sie alle zugleich.',
    unknown: 'Dieser Arbeitsraum verwendet dieses Wort nicht.',
    instead: 'Fragen mit Antworten',
    plain: 'Diese Seite existiert nicht.'
  }
}

export const fill = (template: string, value: string | number) => template.replace('%1', String(value))

/**
 * A question's page, per language.
 *
 * One word or several, and no `/topic/` in front of them: the segment said
 * nothing that the words after it did not already say. `/clown/audience` and
 * `/clown/audience/solitude` are the same kind of address, which is the point
 * -- the path is the question, so nothing else belongs in it.
 *
 * The words are sorted here rather than at each call site, because `/a/b` and
 * `/b/a` are one question and only one of them is a page.
 */
export const topicPath = (lang: Lang, ...topics: string[]) =>
  `${lang === 'en' ? '' : `/${lang}`}/${[...new Set(topics.flat())].sort().join('/')}`

/**
 * A post's page, per language.
 *
 * Rooted, not relative. `./slug` and `../blog/slug` happen to resolve from the
 * pages that used them and quietly stop resolving the moment a listing is
 * rendered from anywhere else; every caller then has to know how deep it sits.
 * Pair this with `withBase()`, which is the only thing that knows the site is
 * served from /clown/.
 */
export const postPath = (lang: Lang, slug: string) =>
  `${lang === 'en' ? '' : `/${lang}`}/blog/${slug}`

/** The blog index, per language. */
export const blogPath = (lang: Lang) => `${lang === 'en' ? '' : `/${lang}`}/blog/`

/**
 * A written page, per language. `index` is the home page, not `/index`.
 *
 * Rooted for the reason the others are, and this one has already been proved:
 * the listing used `../${slug}`, which resolved from `/topic/solitude` and
 * broke the moment the same component rendered at `/topic/audience/solitude`,
 * one level deeper. 96 dead links from one relative path.
 */
export const pagePath = (lang: Lang, slug: string) =>
  `${lang === 'en' ? '' : `/${lang}`}/${slug === 'index' ? '' : slug}`
