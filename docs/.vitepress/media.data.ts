import { defineLoader } from 'vitepress'
import { readFile, readdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Lang } from './locale.ts'

/**
 * The photographs, borrowed from the main site rather than copied.
 *
 * `titaniachaos.github.io` is the origin for every published frame: it holds
 * the archive, the derivation, the alt text in three languages and the record
 * of who is in each picture. This site shows some of them and stores none of
 * them. A picture replaced there is replaced here, and there is one place
 * where a withdrawal request has to be acted on rather than two.
 *
 * What is stored here is the index -- `media-index.json`, a copy of what that
 * site publishes at `/media.json`. It is committed rather than fetched so this
 * repository still builds with no network and no sibling checkout, which is
 * what CI and a fresh clone both need. Refresh it with:
 *
 *     npm run media:sync
 *
 * The images themselves are served from the main site's URLs. Same domain, so
 * a reader never leaves it, and the bytes are already in their cache if they
 * arrived from there.
 */

const HERE = dirname(fileURLToPath(import.meta.url))

export interface Frame {
  id: string
  kind: 'photo' | 'video'
  tags: string[]
  seconds?: number
  /** Alt text and caption, in all three languages, written on the main site. */
  alt: Record<Lang, string>
  caption: Record<Lang, string>
  /** Absolute URLs on the origin. */
  url: string
  tile: string
  film?: string
  source?: string
  /** Who else is in the frame, when somebody is. */
  othersInFrame?: string
}

/** A blog post, as its index and its topic pages need it. */
export interface Post {
  slug: string
  title: string
  /** The frame the post names, if it names one. */
  id?: string
  /** What it is about and what kind of thing it is. See topics.ts. */
  topics: string[]
  /** The first line of it, for a topic page that has to say what a post is. */
  summary: string
}

export interface Data {
  origin: string
  frames: Frame[]
  /** The blog, per language, in the order the index lists it. */
  posts: Record<Lang, Post[]>
  /** `Watch on YouTube` and the like, per language. */
  ui: Record<Lang, { photo: string; video: string; source: string }>
}

declare const data: Data
export { data }

const ui: Data['ui'] = {
  en: { photo: 'Photo', video: 'Film', source: 'Watch on YouTube' },
  bg: { photo: 'Снимка', video: 'Филм', source: 'Гледайте в YouTube' },
  de: { photo: 'Foto', video: 'Film', source: 'Auf YouTube ansehen' }
}

const LANGS: Lang[] = ['en', 'bg', 'de']
const DOCS = join(HERE, '..')

/**
 * The blog, read off the posts themselves.
 *
 * The index page could list the posts by hand, and did; what it could not do
 * is know which photograph each one carries, because the post decides that.
 * Reading it here means the index and the posts cannot disagree, and a post
 * that changes its picture changes the index without anybody remembering the
 * index exists.
 */
async function blog(): Promise<Data['posts']> {
  const out = { en: [] as Post[], bg: [] as Post[], de: [] as Post[] }
  for (const lang of LANGS) {
    const dir = join(DOCS, lang === 'en' ? 'blog' : `${lang}/blog`)
    const names = (await readdir(dir).catch(() => [])).filter((n) => n.endsWith('.md') && n !== 'index.md')
    for (const name of names.sort()) {
      const source = await readFile(join(dir, name), 'utf8')
      const title = /^# +(.+)$/m.exec(source)?.[1]?.trim()
      if (!title) continue
      const body = source.replace(/^---\n[\s\S]*?\n---\n/, '')
      const summary = body
        .split('\n')
        .find((line) => /^[A-Za-zА-Яа-яÄÖÜäöü*]/.test(line.trim()) && !line.startsWith('#'))
        ?.replace(/\*\*/g, '')
        .trim()

      out[lang].push({
        slug: name.replace(/\.md$/, ''),
        title,
        id: /<MediaFigure[^>]*\bid="([^"]+)"/.exec(source)?.[1],
        topics: [...(/^tags: \[(.*)\]$/m.exec(source)?.[1] ?? '').matchAll(/"([a-z-]+)"/g)].map((m) => m[1]),
        summary: summary ?? ''
      })
    }
  }
  return out
}

export default defineLoader({
  watch: ['./media-index.json', '../blog/*.md', '../bg/blog/*.md', '../de/blog/*.md'],
  async load(): Promise<Data> {
    const posts = await blog()
    let index: { origin?: string; media?: Frame[] }
    try {
      index = JSON.parse(await readFile(join(HERE, 'media-index.json'), 'utf8'))
    } catch {
      // No index is not an error: the blog simply renders without pictures,
      // which is better than a build that fails on a file this repository does
      // not own.
      return { origin: '', frames: [], posts, ui }
    }
    return { origin: index.origin ?? '', frames: index.media ?? [], posts, ui }
  }
})
