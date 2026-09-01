<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { data } from '../media.data'
import { MISSING, TOPIC_NAMES, TOPIC_UI, topicPath, blogPath, fill } from '../topics.ts'
import type { Topic } from '../topics.ts'
import { useLang } from './useLang.ts'
import BlogTopic from './BlogTopic.vue'

/**
 * An address nobody built, answered anyway.
 *
 * A path here is a question — `/audience/solitude` asks for everything
 * carrying both — and 55 of them are built as real pages because they have at
 * least two things in them. That threshold is a decision about which pages are
 * worth pre-rendering, not about which questions are real, and this is where
 * the rest are answered:
 *
 *   A question with an answer is rendered by the same component the built
 *   pages use, with the same heading, the same two lists and the same narrower
 *   links. There is nothing to tell a reader that this one was computed on
 *   arrival, because in every way that matters it was not different.
 *
 *   A question whose page does exist under another address — the words in
 *   another order, or the old `/topic/` prefix — is a redirect to it. Two
 *   URLs for one question is the thing the alphabetical order exists to
 *   prevent, so this must not answer in place.
 *
 *   Only an address with a word the workspace does not use gets the
 *   not-found treatment, and even that says which word and offers the
 *   questions that do have answers.
 *
 * The status stays 404 on a static host — only a file can be 200 — so what is
 * fixed here is what the reader gets, not what the header says.
 */

const { lang } = useLang()
const t = computed(() => MISSING[lang.value])
const ui = computed(() => TOPIC_UI[lang.value])
const names = computed(() => TOPIC_NAMES[lang.value])

/** Everything the workspace holds, in the reader's language. */
const everything = computed(() => [...data.posts[lang.value], ...data.pages[lang.value]])
const vocabulary = computed(() => Object.keys(names.value))

const asked = ref<string[]>([])
const ready = ref(false)

onMounted(() => {
  // `/clown/bg/a/b` -> ['a','b']. Everything before the question is ours: the
  // base, and the language prefix when there is one. `/topic/` is stripped too
  // -- these pages lived under it until the segment was recognised as saying
  // nothing, and the addresses that were published still have to arrive.
  const path = window.location.pathname.replace(/\/+$/, '')
  const parts = path.split('/').filter(Boolean)
  while (parts.length && ['clown', 'bg', 'de', 'topic'].includes(parts[0])) parts.shift()
  asked.value = parts

  // Same question, canonical order: send them to the page that exists.
  if (asked.value.length >= 1 && asked.value.every((w) => vocabulary.value.includes(w))) {
    const canonical = [...new Set(asked.value)].sort()
    const carried = everything.value.filter((i) => canonical.every((w) => i.topics.includes(w)))
    // Either the words were in another order, or the address still had
    // `/topic/` in it. Both are the same question as one that has a page.
    const differs = canonical.join('/') !== asked.value.join('/') || /\/topic\//.test(path)
    if (differs && carried.length >= 2) {
      window.location.replace(withBase(topicPath(lang.value, ...canonical)))
      return
    }
  }
  ready.value = true

  // The document was 404.html, so without this the tab reads "404" over a page
  // that is in every other respect the collection. Set after the redirect
  // check, so a question that is about to move does not retitle on the way.
  if (answerable.value) {
    const site = document.title.split('|').slice(1).join('|').trim()
    document.title = site ? `${spoken.value} | ${site}` : spoken.value
  }
})

const unknown = computed(() => asked.value.filter((w) => !vocabulary.value.includes(w)))

/**
 * A question this workspace can answer: every word known, and something
 * carrying all of them. One item is enough — a page with one thing on it is
 * not worth pre-rendering, which is a different claim from not worth showing
 * to somebody who asked for it by name.
 */
const answerable = computed(
  () =>
    asked.value.length > 0 &&
    unknown.value.length === 0 &&
    everything.value.some((i) => asked.value.every((w) => i.topics.includes(w)))
)

const spoken = computed(() =>
  asked.value.map((w) => names.value[w as Topic] ?? w).join(' · ')
)

/**
 * The questions worth offering instead: every one word shorter that still has
 * something in it, then the single topics if that leaves nothing.
 */
const instead = computed(() => {
  const known = asked.value.filter((w) => vocabulary.value.includes(w))
  const shorter = known
    .map((drop) => known.filter((w) => w !== drop))
    .filter((words) => words.length > 0)
    .map((words) => [...new Set(words)].sort())

  const candidates = shorter.length ? shorter : vocabulary.value.map((w) => [w])
  const seen = new Set<string>()
  return candidates
    .map((words) => ({
      words,
      n: everything.value.filter((i) => words.every((w) => i.topics.includes(w))).length
    }))
    .filter((c) => c.n >= 2 && !seen.has(c.words.join('/')) && seen.add(c.words.join('/')))
    .sort((a, b) => b.n - a.n)
    .slice(0, 8)
    .map((c) => ({
      name: c.words.map((w) => names.value[w as Topic]).join(' · '),
      n: c.n,
      path: withBase(topicPath(lang.value, ...c.words))
    }))
})
</script>

<template>
  <!-- Answerable: the collection, by the component that renders the built
       ones. Same template, same page. -->
  <div v-if="ready && answerable" class="vp-doc missing__found">
    <BlogTopic :topics="asked" :name="spoken" />
  </div>

  <div v-else-if="ready" class="missing">
    <p class="ui-label missing__code">404</p>

    <template v-if="asked.length">
      <h1 class="missing__title">{{ fill(t.asked, spoken) }}</h1>
      <p class="missing__lead">{{ unknown.length ? t.unknown : t.empty }}</p>
    </template>
    <template v-else>
      <h1 class="missing__title">{{ t.plain }}</h1>
    </template>

    <nav v-if="instead.length" class="missing__instead">
      <span class="ui-label missing__lead-in">{{ t.instead }}</span>
      <UiBadge v-for="one in instead" :key="one.path" :href="one.path" :count="one.n">{{ one.name }}</UiBadge>
    </nav>

    <p class="missing__home">
      <a :href="withBase(blogPath(lang))">{{ ui.all }}</a>
    </p>
  </div>
</template>

<style scoped>
.missing__found { max-width: 48rem; margin: 0 auto; padding: 3rem 1.5rem 6rem; }
.missing { max-width: 44rem; margin: 0 auto; padding: 6rem 1.5rem 8rem; }
.missing__code {
  margin: 0 0 0.75rem;
  color: var(--vp-c-text-3);
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.12em;
}
.missing__title {
  margin: 0 0 0.75rem;
  font-size: 32px;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.15;
  text-wrap: balance;
}
.missing__lead { margin: 0 0 2rem; color: var(--vp-c-text-2); line-height: 1.6; text-wrap: pretty; }
.missing__instead {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: baseline;
  padding-top: 1.5rem;
  border-top: 1px solid var(--vp-c-divider);
}
.missing__lead-in {
  width: 100%;
  margin-bottom: 0.25rem;
  color: var(--vp-c-text-3);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
/* Chips are `.ui-badge`. */
.missing__home { margin: 2.5rem 0 0; }
</style>
