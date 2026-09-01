<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { data } from '../media.data'
import { TOPIC_NAMES, TOPIC_UI, topicPath, postPath, blogPath, pagePath } from '../topics.ts'
import type { Topic } from '../topics.ts'
import { useLang } from './useLang.ts'

/**
 * Everything about one thing: the blog posts, then the written pages.
 *
 * They are kept apart rather than merged into one list because they are
 * different in kind -- a page is the standing account of something, a post is
 * one day's thinking about it -- and a reader looking for the concept page
 * should not have to find it among four diary entries.
 *
 * The heading is here rather than in the Markdown because `# {{ $params.name }}`
 * renders the right words and then hangs a permalink off them built from the
 * raw expression -- every page ends up with the same id and a link reading
 * "Permalink to {{ $params.name }}". A heading that comes from data belongs in
 * the component that has the data.
 */

/**
 * The question can arrive two ways: from the route, on the 55 pages built for
 * it, or as a prop, when an address nobody pre-generated turns out to be a
 * question this workspace can answer anyway. Same component either way, so a
 * computed collection is not a lesser page with a different look -- it is the
 * page.
 */
const props = defineProps<{ topics?: string[]; name?: string }>()

const { params } = useData()
const { lang } = useLang()

/**
 * The question this page was asked.
 *
 * One topic or several: `/topic/solitude` and `/topic/audience/solitude` are
 * the same kind of page, so they are the same component. `topics` is written
 * by the route rather than re-derived from t1/t2/t3 here, so exactly one place
 * decides what was asked.
 */
const asked = computed<Topic[]>(() => {
  if (props.topics?.length) return props.topics as Topic[]
  const many = String(params.value?.topics ?? '').split(' ').filter(Boolean)
  if (many.length) return many as Topic[]
  const one = params.value?.topic
  return one ? [one as Topic] : []
})
const topic = computed(() => asked.value[0] ?? ('' as Topic))
const name = computed(
  () => props.name ?? ((params.value?.name ?? '') as string)
)
const carries = (topics: string[]) => asked.value.every((w) => topics.includes(w))
const t = computed(() => TOPIC_UI[lang.value])
const names = computed(() => TOPIC_NAMES[lang.value])

const posts = computed(() =>
  data.posts[lang.value]
    .filter((post) => carries(post.topics))
    .map((post) => ({ ...post, frame: data.frames.find((f) => f.id === post.id) }))
)

const pages = computed(() => data.pages[lang.value].filter((page) => carries(page.topics)))

/**
 * One more word, where that still finds something.
 *
 * From `/topic/solitude` these lead to `/topic/audience/solitude` rather than
 * sideways to `/topic/audience`: a reader narrowing a question wants the
 * question narrowed, not replaced. At three words it stops, which is where the
 * collection stops having anything to say.
 */
const here = computed(() => [...posts.value, ...pages.value])

const siblings = computed(() => {
  if (asked.value.length >= 3) return []
  return Object.keys(names.value)
    .filter((other) => !asked.value.includes(other as Topic))
    .map((other) => ({
      topic: other,
      name: names.value[other as Topic],
      n: here.value.filter((p) => p.topics.includes(other)).length,
      path: withBase(topicPath(lang.value, ...asked.value, other))
    }))
    .filter((s) => s.n >= 2)
    .sort((a, b) => b.n - a.n || a.name.localeCompare(b.name))
})

</script>

<template>
  <section class="topic">
    <h1 class="topic__title">{{ name }}</h1>

    <h2 v-if="posts.length" class="topic__section">
      {{ t.posts }}<span class="topic__count">{{ posts.length }}</span>
    </h2>
    <ul v-if="posts.length" class="topic__list">
      <li v-for="post in posts" :key="post.slug" class="topic__item">
        <a class="topic__link" :href="withBase(postPath(lang, post.slug))">
          <img
            v-if="post.frame"
            class="topic__tile"
            :src="post.frame.tile"
            :alt="post.frame.alt[lang]"
            width="160"
            height="160"
            loading="lazy"
            decoding="async"
          />
          <span class="topic__words">
            <span class="topic__name">{{ post.title }}</span>
            <span class="topic__summary">{{ post.summary }}</span>
          </span>
        </a>
        <p class="topic__tags">
          <a
            v-for="other in post.topics"
            :key="other"
            :href="withBase(topicPath(lang, other))"
            :class="{ 'topic__tag--here': other === topic }"
          >{{ names[other as Topic] }}</a>
        </p>
      </li>
    </ul>

    <h2 v-if="pages.length" class="topic__section">
      {{ t.pages }}<span class="topic__count">{{ pages.length }}</span>
    </h2>
    <ul v-if="pages.length" class="topic__list topic__list--pages">
      <li v-for="page in pages" :key="page.slug" class="topic__item">
        <a class="topic__page" :href="withBase(pagePath(lang, page.slug))">
          <span class="topic__name">{{ page.title }}</span>
          <span class="topic__summary">{{ page.summary }}</span>
        </a>
        <p class="topic__tags topic__tags--flush">
          <a
            v-for="other in page.topics"
            :key="other"
            :href="withBase(topicPath(lang, other))"
            :class="{ 'topic__tag--here': other === topic }"
          >{{ names[other as Topic] }}</a>
        </p>
      </li>
    </ul>

    <nav v-if="siblings.length" class="topic__siblings">
      <a :href="withBase(blogPath(lang))">{{ t.all }}</a>
      <UiBadge v-for="other in siblings" :key="other.topic" :href="other.path" :count="other.n">{{ other.name }}</UiBadge>
    </nav>
  </section>
</template>

<style scoped>
.topic { margin: 0; }
.topic__title {
  margin: 0 0 0.5rem;
  font-size: 32px;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.1;
}
.topic__section {
  margin: 2rem 0 1rem;
  padding: 0;
  border: 0;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.topic__count {
  margin-left: 0.5rem;
  color: var(--vp-c-text-3);
  font-variant-numeric: tabular-nums;
}
.topic__list { margin: 0; padding: 0; list-style: none; }
.topic__item {
  margin: 0 0 1.6rem;
  padding-bottom: 1.6rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.topic__item:last-child { border-bottom: 0; }
.topic__link { display: grid; grid-template-columns: 5rem minmax(0, 1fr); gap: 1rem; text-decoration: none; }
.topic__tile {
  width: 100%;
  height: auto;
  margin: 0;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}
.topic__words { min-width: 0; }
.topic__name { display: block; color: var(--vp-c-text-1); font-weight: 600; line-height: 1.35; }
.topic__summary {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  margin-top: 0.2rem;
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
  line-height: 1.5;
}
.topic__page { display: block; text-decoration: none; }
.topic__tags { display: flex; flex-wrap: wrap; gap: 0.2rem 0.6rem; margin: 0.5rem 0 0 6rem; }
.topic__tags--flush { margin-left: 0; }
.topic__tags a {
  color: var(--vp-c-text-3);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  text-decoration: none;
}
.topic__tags a:hover { color: var(--vp-c-brand-1); }
.topic__tag--here { color: var(--vp-c-brand-1) !important; }

.topic__siblings {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--vp-c-divider);
}
/* Chips are `.ui-badge`. */

@media (max-width: 560px) {
  .topic__link { grid-template-columns: 4rem minmax(0, 1fr); gap: 0.8rem; }
  .topic__tags { margin-left: 4.8rem; }
  .topic__tags--flush { margin-left: 0; }
}
</style>
