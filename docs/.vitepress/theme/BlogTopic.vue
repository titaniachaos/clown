<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { data } from '../media.data'
import { TOPIC_NAMES, TOPIC_UI, fill, topicPath } from '../topics.ts'
import type { Topic } from '../topics.ts'
import { useLang } from './useLang.ts'

/**
 * Every post about one thing.
 *
 * The heading is here rather than in the Markdown because `# {{ $params.name }}`
 * renders the right words and then hangs a permalink off them built from the
 * raw expression -- every page ends up with the same id and a link reading
 * "Permalink to {{ $params.name }}". A heading that comes from data belongs in
 * the component that has the data.
 */

const { params } = useData()
const { lang } = useLang()

const topic = computed(() => (params.value?.topic ?? '') as Topic)
const name = computed(() => (params.value?.name ?? '') as string)
const t = computed(() => TOPIC_UI[lang.value])
const names = computed(() => TOPIC_NAMES[lang.value])

const posts = computed(() =>
  data.posts[lang.value]
    .filter((post) => post.topics.includes(topic.value))
    .map((post) => ({ ...post, frame: data.frames.find((f) => f.id === post.id) }))
)

/** The other topics that actually have something in them. */
const siblings = computed(() =>
  Object.keys(names.value)
    .filter((other) => other !== topic.value && data.posts[lang.value].some((p) => p.topics.includes(other)))
    .map((other) => ({ topic: other, name: names.value[other as Topic], path: withBase(topicPath(lang.value, other)) }))
)

const countOf = (n: number) => (n === 1 ? t.value.one : fill(t.value.many, n))
</script>

<template>
  <section class="topic">
    <h1 class="topic__title">{{ name }}</h1>
    <p class="topic__count">{{ countOf(posts.length) }}</p>

    <ul class="topic__list">
      <li v-for="post in posts" :key="post.slug" class="topic__item">
        <a class="topic__link" :href="`../blog/${post.slug}`">
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

    <nav v-if="siblings.length" class="topic__siblings">
      <a :href="`../blog/`">{{ t.all }}</a>
      <a v-for="other in siblings" :key="other.topic" :href="other.path">{{ other.name }}</a>
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
.topic__count {
  margin: 0 0 1.6rem;
  color: var(--vp-c-text-3);
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.08em;
  text-transform: uppercase;
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
.topic__tags { display: flex; flex-wrap: wrap; gap: 0.2rem 0.6rem; margin: 0.5rem 0 0 6rem; }
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
.topic__siblings a {
  padding: 0.3rem 0.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  color: var(--vp-c-text-2);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
}
.topic__siblings a:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }

@media (max-width: 560px) {
  .topic__link { grid-template-columns: 4rem minmax(0, 1fr); gap: 0.8rem; }
  .topic__tags { margin-left: 4.8rem; }
}
</style>
