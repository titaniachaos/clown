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
  /**
   * The written pages -- concept, production, sources, the studio, the home
   * page -- under the same vocabulary as the blog.
   *
   * They are not posts and are not listed as posts: a page is the standing
   * account of something and a post is one day's thinking about it. But a
   * reader who follows `solitude` off a post wants the concept page as much
   * as the other four posts, and until now a topic page could not offer it.
   */
  pages: Record<Lang, Post[]>
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
async function read(where: (lang: Lang) => string, skip: string[]): Promise<Data['posts']> {
  const out = { en: [] as Post[], bg: [] as Post[], de: [] as Post[] }
  for (const lang of LANGS) {
    const dir = join(DOCS, where(lang))
    const names = (await readdir(dir).catch(() => [])).filter((n) => n.endsWith('.md') && !skip.includes(n))
    for (const name of names.sort()) {
      const source = await readFile(join(dir, name), 'utf8')
      // The home page has no h1 -- its name is in the hero -- so fall back to
      // the front-matter title, which is what a link to it should say anyway.
      const title =
        /^# +(.+)$/m.exec(source)?.[1]?.trim() ??
        /^title:\s*(.+)$/m.exec(source)?.[1]?.trim().replace(/^['"]|['"]$/g, '')
      if (!title) continue
      const body = source.replace(/^---\n[\s\S]*?\n---\n/, '')
      // The first line that is a sentence rather than a label.
      //
      // The reading notes open with `**Status:** Verified`, and taking the
      // first prose line meant three of the six posts introduced themselves
      // on the topic pages as "Status: Verified" -- true, and no use to
      // anybody deciding whether to read them. Six words is the shortest
      // thing here that says something; it clears the labels and keeps
      // "Observe solitary behaviour without assigning motives."
      const summary = body
        .split('\n')
        .map((line) => line.replace(/\*\*/g, '').trim())
        .find(
          (line) =>
            // A letter or an opening quotation mark. The hand-written class this
            // replaces had no `„`, so the Bulgarian concept page skipped its
            // own first sentence and introduced itself with its second.
            /^[\p{L}„“«"']/u.test(line) &&
            !line.startsWith('#') &&
            line.split(/\s+/).length >= 6
        )

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

/** The blog. Its index page is a listing, not a post. */
const blog = () => read((lang) => (lang === 'en' ? 'blog' : `${lang}/blog`), ['index.md'])

/**
 * The written pages. Only this directory: the blog is read separately and the
 * generated topic routes live in `topic/`, which is not a page anybody wrote.
 */
const written = () => read((lang) => (lang === 'en' ? '.' : lang), [])

export default defineLoader({
  watch: [
    './media-index.json',
    '../*.md', '../bg/*.md', '../de/*.md',
    '../blog/*.md', '../bg/blog/*.md', '../de/blog/*.md'
  ],
  async load(): Promise<Data> {
    const posts = await blog()
    const pages = await written()
    let index: { origin?: string; media?: Frame[] }
    try {
      index = JSON.parse(await readFile(join(HERE, 'media-index.json'), 'utf8'))
    } catch {
      // No index is not an error: the blog simply renders without pictures,
      // which is better than a build that fails on a file this repository does
      // not own.
      return { origin: '', frames: [], posts, pages, ui }
    }
    return { origin: index.origin ?? '', frames: index.media ?? [], posts, pages, ui }
  }
})
