<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { data } from '../sources.data'
import type { Lang } from '../sources.data'
import { useLang } from './useLang.ts'

/**
 * The hero, as the project's own paradoxes rather than a photograph.
 *
 * Every card is real text, not an image of text: it is selectable, searchable,
 * readable by a screen reader, and it costs nothing to ship. The three
 * languages come from the same ledger records the sources page uses, so a card
 * cannot exist in English and quietly not in German.
 *
 * Motion is opt-out by the reader's own setting: with prefers-reduced-motion
 * the cards do not advance on their own, and the controls still work.
 */

const { lang: l } = useLang()

const cards = computed(() => {
  const fromWorks = data.entries
    .filter((e) => e.paradox)
    .map((e) => ({ text: e.paradox![l.value], source: e.work.split(',')[0] }))
  const fromProject = data.own.map((o) => ({ text: o.claim[l.value], source: o.where[l.value] }))
  return [...fromWorks, ...fromProject].filter((c) => c.text)
})

const LABEL: Record<Lang, { region: string; prev: string; next: string; go: string; of: string }> = {
  en: { region: 'The paradoxes the work runs on', prev: 'Previous paradox', next: 'Next paradox', go: 'Show paradox', of: 'of' },
  bg: { region: 'Парадоксите, върху които стои работата', prev: 'Предишен парадокс', next: 'Следващ парадокс', go: 'Покажи парадокс', of: 'от' },
  de: { region: 'Die Paradoxien, auf denen die Arbeit läuft', prev: 'Vorherige Paradoxie', next: 'Nächste Paradoxie', go: 'Paradoxie zeigen', of: 'von' }
}
const t = computed(() => LABEL[l.value])

const i = ref(0)
const paused = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

const go = (n: number) => {
  const len = cards.value.length
  i.value = ((n % len) + len) % len
}

onMounted(() => {
  const still = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (still.matches) return // the reader asked for no motion; controls still work
  timer = setInterval(() => {
    if (!paused.value) go(i.value + 1)
  }, 7000)
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <section
    v-if="cards.length"
    class="hero-slider"
    aria-roledescription="carousel"
    :aria-label="t.region"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
    @focusin="paused = true"
    @focusout="paused = false"
  >
    <div class="hero-slider__stage" aria-live="polite">
      <blockquote class="hero-slider__card" :key="i">
        <p class="hero-slider__text">{{ cards[i].text }}</p>
        <footer class="hero-slider__source">{{ cards[i].source }}</footer>
      </blockquote>
    </div>

    <div class="hero-slider__controls">
      <button class="hero-slider__arrow" type="button" :aria-label="t.prev" @click="go(i - 1)">←</button>
      <div class="hero-slider__dots" role="group" :aria-label="t.region">
        <button
          v-for="(c, n) in cards"
          :key="n"
          type="button"
          class="hero-slider__dot"
          :class="{ 'is-on': n === i }"
          :aria-current="n === i ? 'true' : undefined"
          :aria-label="`${t.go} ${n + 1} ${t.of} ${cards.length}`"
          @click="go(n)"
        />
      </div>
      <button class="hero-slider__arrow" type="button" :aria-label="t.next" @click="go(i + 1)">→</button>
    </div>
  </section>
</template>

<style scoped>
.hero-slider {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 460px;
}
.hero-slider__stage {
  /* The proportions of a social card, so the hero reads as one. */
  aspect-ratio: 40 / 21;
  display: grid;
  padding: 28px;
  border: 1px solid var(--vp-c-brand-soft);
  border-radius: 16px;
  background: linear-gradient(150deg, var(--vp-c-brand-soft), var(--vp-c-bg-soft) 72%);
}
.hero-slider__card {
  margin: 0;
  border: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  animation: hero-slider-in 0.5s ease;
}
.hero-slider__text {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: clamp(15px, 2.1vw, 20px);
  font-weight: 600;
  letter-spacing: -0.015em;
  line-height: 1.32;
  text-wrap: balance;
}
.hero-slider__source {
  margin-top: 14px;
  color: var(--vp-c-text-2);
  font-size: 12px;
  letter-spacing: 0.03em;
}
.hero-slider__controls {
  display: flex;
  align-items: center;
  gap: 12px;
}
.hero-slider__arrow {
  padding: 4px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.4;
  transition: border-color 0.2s, color 0.2s;
}
.hero-slider__arrow:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.hero-slider__dots { display: flex; flex-wrap: wrap; gap: 6px; flex: 1; }
.hero-slider__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--vp-c-divider);
  transition: background 0.2s, transform 0.2s;
}
.hero-slider__dot.is-on { background: var(--vp-c-brand-1); transform: scale(1.35); }
@keyframes hero-slider-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .hero-slider__card { animation: none; }
  .hero-slider__dot { transition: none; }
}
</style>
