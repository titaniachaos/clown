<script setup lang="ts">
import { computed } from 'vue'
import { data } from '../media.data'
import { useLang } from './useLang.ts'

/**
 * A photograph from the main site, set into the text of a blog entry.
 *
 * The picture is named rather than searched for: a blog entry is about one
 * thing, and the photograph beside it was chosen for those words. `id` is a
 * frame on `titaniachaos.github.io`, which is where the archive, the alt text
 * and the record of who is in the frame all live. Nothing is copied here.
 *
 * The home page keeps its own hero of paradoxes -- text, not photographs, and
 * deliberately so. Pictures belong in the prose of the blog, not in front
 * of the argument.
 */

const props = defineProps<{ id: string }>()
const { lang } = useLang()

const frame = computed(() => data.frames.find((f) => f.id === props.id) ?? null)
const t = computed(() => data.ui[lang.value])
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
</script>

<template>
  <figure v-if="frame" class="figure">
    <video
      v-if="frame.film"
      class="figure__media"
      :src="frame.film"
      :poster="frame.url"
      :aria-label="frame.alt[lang]"
      controls
      playsinline
      preload="none"
    />
    <img
      v-else
      class="figure__media"
      :src="frame.url"
      :alt="frame.alt[lang]"
      loading="lazy"
      decoding="async"
    />
    <figcaption class="figure__caption">
      <span class="figure__kind">
        {{ frame.kind === 'video' ? t.video : t.photo
        }}<template v-if="frame.seconds"> · {{ clock(frame.seconds) }}</template>
      </span>
      {{ frame.caption[lang] }}
      <a v-if="frame.source" class="figure__source" :href="frame.source" rel="noopener" target="_blank">
        {{ t.source }}
      </a>
    </figcaption>
  </figure>
</template>

<style scoped>
.figure {
  float: right;
  width: min(19rem, 44%);
  margin: 0.4rem 0 1.2rem 1.6rem;
}
.figure__media {
  display: block;
  width: 100%;
  height: auto;
  margin: 0;
  max-height: none;
  object-fit: contain;
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}
.figure__caption {
  margin-top: 0.5rem;
  color: var(--vp-c-text-2);
  font-size: 0.8125rem;
  line-height: 1.55;
  text-wrap: pretty;
}
.figure__kind {
  display: block;
  margin-bottom: 0.15rem;
  color: var(--vp-c-text-3);
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.figure__source { display: block; margin-top: 0.25rem; font-size: 0.75rem; }

/* A picture beside a 40-character line is two columns of neither. */
@media (max-width: 720px) {
  .figure { float: none; width: 100%; margin: 1.5rem 0; }
}
</style>
