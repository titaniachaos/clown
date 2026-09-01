<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { data } from '../media.data'
import { TOPICS, TOPIC_NAMES, TOPIC_UI, topicPath, postPath } from '../topics.ts'
import type { Topic } from '../topics.ts'
import { useLang } from './useLang.ts'

/**
 * The blog index: every post, with its picture, its summary and its topics.
 *
 * It used to render the pictures only, above a hand-maintained list of the
 * same posts written out in Markdown -- so every post appeared on the page
 * twice, and the copy that carried the summaries carried its topic chips in
 * English on all three languages: `Solitude` and `Studio Practice` under a
 * Bulgarian heading. A duplicate of generated content is a translation waiting
 * to go stale, and this one had.
 *
 * So the summaries come from the same place the titles do. Nothing here
 * chooses a picture either: the posts already did, by naming a frame.
 */

const { lang } = useLang()

const t = computed(() => TOPIC_UI[lang.value])

const posts = computed(() =>
  data.posts[lang.value]
    .map((post) => ({
      ...post,
      frame: data.frames.find((f) => f.id === post.id),
      href: withBase(postPath(lang.value, post.slug)),
      chips: post.topics
        .map((topic) => TOPIC_NAMES[lang.value][topic as Topic])
        .filter(Boolean)
    }))
    .filter((p) => p.frame)
)

/**
 * The topics that have something in them, with how much, most-written-about
 * first. A topic page for a subject nobody has written about yet would be an
 * empty room with a sign on it, so it is not offered here.
 */
const topics = computed(() => {
  const all = data.posts[lang.value]
  return TOPICS.map((topic) => ({
    topic,
    name: TOPIC_NAMES[lang.value][topic as Topic],
    path: withBase(topicPath(lang.value, topic)),
    count: all.filter((p) => p.topics.includes(topic)).length
  }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
})
</script>

<template>
  <nav v-if="topics.length" class="topics">
    <a v-for="topic in topics" :key="topic.topic" :href="topic.path">
      {{ topic.name }}<span class="topics__count">{{ topic.count }}</span>
    </a>
  </nav>

  <ul v-if="posts.length" class="posts">
    <li v-for="post in posts" :key="post.slug" class="posts__item">
      <a class="posts__card" :href="post.href">
        <img :src="post.frame!.tile" :alt="post.frame!.alt[lang]" width="160" height="160" loading="lazy" decoding="async" />
        <span class="posts__title">{{ post.title }}</span>
      </a>
      <p v-if="post.summary" class="posts__summary">{{ post.summary }}</p>
      <p v-if="post.chips.length" class="posts__chips">
        <span v-for="chip in post.chips" :key="chip">{{ chip }}</span>
      </p>
      <a class="posts__read" :href="post.href">{{ t.read }}</a>
    </li>
  </ul>
</template>

<style scoped>
.topics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1.5rem 0 0;
}
.topics a {
  display: inline-flex;
  gap: 0.4rem;
  align-items: baseline;
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
.topics a:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.topics__count { color: var(--vp-c-text-3); font-variant-numeric: tabular-nums; }

.posts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(8.5rem, 1fr));
  gap: 1.2rem 1rem;
  margin: 2rem 0 3rem;
  padding: 0;
  list-style: none;
}
.posts li { margin: 0; }
.posts__card { display: block; text-decoration: none; }
.posts__card img {
  width: 100%;
  height: auto;
  margin: 0 0 0.45rem;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  transition: transform 0.3s ease;
}
.posts__card:hover img { transform: scale(1.04); }
.posts__title {
  display: block;
  color: var(--vp-c-text-1);
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.35;
  text-wrap: pretty;
}
.posts__card:hover .posts__title { color: var(--vp-c-brand-1); }
.posts__summary {
  margin: 0.5rem 0 0;
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
  line-height: 1.6;
  text-wrap: pretty;
}
.posts__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0.6rem 0 0;
}
.posts__chips span {
  padding: 0.15rem 0.55rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  color: var(--vp-c-text-3);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}
.posts__read {
  display: inline-block;
  margin-top: 0.6rem;
  color: var(--vp-c-brand-1);
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
}
.posts__read:hover { text-decoration: underline; }
@media (prefers-reduced-motion: reduce) {
  .posts__card img, .posts__card:hover img { transition: none; transform: none; }
}
</style>
