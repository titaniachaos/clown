<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { data } from '../media.data'
import { TOPIC_NAMES, TOPIC_UI, topicPath } from '../topics.ts'
import type { Topic } from '../topics.ts'
import { useLang } from './useLang.ts'

/**
 * The chips under any page, linking to everything else about the same thing.
 *
 * Rendered from the layout rather than written into the Markdown: the tags are
 * already in each file's frontmatter, so asking thirty-three files to also
 * carry a component call would be the same fact written twice and free to
 * drift -- which is exactly how the tags themselves ended up disagreeing
 * across languages.
 *
 * The home page is the exception and writes it out by hand, because the home
 * layout has no slot after its content: VPHome renders <Content /> last.
 *
 * Renders nothing on a page with no tags, so it is safe everywhere.
 */

const { page } = useData()
const { lang } = useLang()

/** `de/blog/gaulier-complicite.md` -> `blog/gaulier-complicite`; `bg/concept.md` -> `concept`. */
const here = computed(() => page.value.relativePath.replace(/^(?:bg|de)\//, '').replace(/\.md$/, ''))

const topics = computed(() => {
  const [, blogSlug] = /^blog\/(.+)$/.exec(here.value) ?? []
  const entry = blogSlug
    ? data.posts[lang.value].find((p) => p.slug === blogSlug)
    : data.pages[lang.value].find((p) => p.slug === here.value)
  return (entry?.topics ?? []).filter((t) => t in TOPIC_NAMES[lang.value])
})
</script>

<template>
  <nav v-if="topics.length" class="post-topics ui-separator" :aria-label="TOPIC_UI[lang].about">
    <span class="ui-label post-topics__lead">{{ TOPIC_UI[lang].about }}</span>
    <UiBadge
      v-for="topic in topics"
      :key="topic"
      :href="withBase(topicPath(lang, topic))"
    >{{ TOPIC_NAMES[lang][topic as Topic] }}</UiBadge>
  </nav>
</template>

<style scoped>
/* Chips are `.ui-badge`, the lead is `.ui-label`, the rule and its air are
   `.ui-separator`. What is left is how they sit together. */
.post-topics { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: baseline; }
.post-topics__lead { margin-right: 0.25rem; }
</style>
