<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { data } from '../media.data'
import { TOPIC_NAMES, topicPath } from '../topics.ts'
import type { Topic } from '../topics.ts'
import { useLang } from './useLang.ts'

/**
 * The chips under a blog post, linking to everything else about the same thing.
 *
 * Rendered from the layout rather than written into the Markdown: the tags are
 * already in each post's frontmatter, so asking eighteen files to also carry a
 * component call would be the same fact written twice and free to drift -- which
 * is exactly how the tags themselves ended up disagreeing across languages.
 *
 * Renders nothing anywhere but a post, so it is safe on every page.
 */

const { page } = useData()
const { lang } = useLang()

const slug = computed(() => {
  const path = page.value.relativePath
  const m = /^(?:bg\/|de\/)?blog\/([^/]+)\.md$/.exec(path)
  return m && m[1] !== 'index' ? m[1] : null
})

const topics = computed(() => {
  if (!slug.value) return []
  const post = data.posts[lang.value].find((p) => p.slug === slug.value)
  return (post?.topics ?? []).filter((t) => t in TOPIC_NAMES[lang.value])
})
</script>

<template>
  <nav v-if="topics.length" class="post-topics">
    <a v-for="topic in topics" :key="topic" :href="topicPath(lang, topic)">
      {{ TOPIC_NAMES[lang][topic as Topic] }}
    </a>
  </nav>
</template>

<style scoped>
.post-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 2.5rem 0 0;
  padding-top: 1.5rem;
  border-top: 1px solid var(--vp-c-divider);
}
.post-topics a {
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
.post-topics a:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
</style>
