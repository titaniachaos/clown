<script setup lang="ts">
import { computed } from 'vue'
import { data } from '../media.data'
import { useLang } from './useLang.ts'

/**
 * The blog as pictures, above the written index.
 *
 * The entries below are twelve hand-written summaries and they are the better
 * read. What they cannot show is that each post carries a photograph, so a
 * list of twelve titles arrived as twelve lines of text.
 *
 * Nothing here chooses a picture: the posts already did, by naming a frame,
 * and this reads that. The square thumbnail comes from the main site, so
 * twelve of them cost this page about 70 KB and nothing is stored twice.
 */

const { lang } = useLang()

const posts = computed(() =>
  data.posts[lang.value]
    .map((post) => ({ ...post, frame: data.frames.find((f) => f.id === post.id) }))
    .filter((p) => p.frame)
)
</script>

<template>
  <ul v-if="posts.length" class="posts">
    <li v-for="post in posts" :key="post.slug">
      <a class="posts__card" :href="`./${post.slug}`">
        <img :src="post.frame!.tile" :alt="post.frame!.alt[lang]" width="160" height="160" loading="lazy" decoding="async" />
        <span class="posts__title">{{ post.title }}</span>
      </a>
    </li>
  </ul>
</template>

<style scoped>
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
@media (prefers-reduced-motion: reduce) {
  .posts__card img, .posts__card:hover img { transition: none; transform: none; }
}
</style>
