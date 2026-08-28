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

/** The copy a generated topic page needs. */
export const TOPIC_UI: Record<Lang, { title: string; description: string; one: string; many: string; all: string }> = {
  en: {
    title: 'Blog: %1',
    description: 'Blog posts from the Solo Titania Chaos studio on %1.',
    one: '1 post',
    many: '%1 posts',
    all: 'All posts'
  },
  bg: {
    title: 'Блог: %1',
    description: 'Публикации от студиото на Соло Титания Хаос на тема %1.',
    one: '1 публикация',
    many: '%1 публикации',
    all: 'Всички публикации'
  },
  de: {
    title: 'Blog: %1',
    description: 'Beiträge aus dem Studio von Solo Titania Chaos zum Thema %1.',
    one: '1 Beitrag',
    many: '%1 Beiträge',
    all: 'Alle Beiträge'
  }
}

export const fill = (template: string, value: string | number) => template.replace('%1', String(value))

/** A topic's page, per language. */
export const topicPath = (lang: Lang, topic: string) =>
  `${lang === 'en' ? '' : `/${lang}`}/blog/topic/${topic}`
