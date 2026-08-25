<script setup lang="ts">
import { computed } from 'vue'
import { data } from '../sources.data'
import type { Status } from '../sources.data'
import { useLang } from './useLang.ts'

/**
 * Renders the source ledger for whichever locale the page is in. The entries
 * live in the build-time loader, so all three locales read the same records.
 */

const { lang } = useLang()

const ui = computed(() => data.ui[lang.value])

const ORDER: Status[] = ['verified', 'chosen', 'probable', 'open']

const tally = computed(() =>
  ORDER.map((status) => {
    const n = data.entries.filter((e) => e.status === status).length
    const count = ui.value.counts[status]
    return { status, n, label: n === 1 ? count.one : count.many }
  })
)

/** The glosses carry `*emphasis*`; split it out rather than injecting HTML. */
function parts(text: string) {
  return text
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .map((chunk) =>
      chunk.length > 2 && chunk.startsWith('*') && chunk.endsWith('*')
        ? { em: true, text: chunk.slice(1, -1) }
        : { em: false, text: chunk }
    )
}
</script>

<template>
  <div class="ledger">
    <ul class="tally">
      <li v-for="t in tally" :key="t.status" :class="t.status">
        <b>{{ t.n }}</b><span>{{ t.label }}</span>
      </li>
    </ul>

    <div v-for="entry in data.entries" :key="entry.id" :id="entry.id" class="entry">
      <div class="side">
        <p class="phrase">{{ entry.phrase[lang] }}</p>
        <p class="locus">{{ entry.locus }}</p>
        <span class="badge" :class="entry.status">{{ ui.status[entry.status] }}</span>
      </div>

      <div class="body">
        <p class="work">
          <span class="label">{{ ui.source }}</span>
          <cite>{{ entry.work }}</cite>
        </p>
        <p class="gloss">
          <template v-for="(part, i) in parts(entry.gloss[lang])" :key="i">
            <em v-if="part.em">{{ part.text }}</em>
            <template v-else>{{ part.text }}</template>
          </template>
        </p>
        <p v-if="entry.ref" class="ref">doi:{{ entry.ref }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ledger {
  margin: 2rem 0 2.5rem;
}

/* ---- tally ---- */

.tally {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  margin: 0 0 2rem;
  padding: 0;
}

.tally li {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
}

.tally b {
  font-size: 1.15rem;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.tally span {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

.tally .verified b { color: var(--vp-c-brand-1); }
.tally .chosen b { color: var(--vp-c-brand-1); }
.tally .probable b { color: var(--vp-c-text-2); }
.tally .open b { color: var(--vp-c-warning-1); }

/* ---- entries ---- */

.entry {
  display: grid;
  grid-template-columns: minmax(0, 13rem) minmax(0, 1fr);
  gap: 0.9rem 2rem;
  padding: 1.5rem 0;
  border-top: 1px solid var(--vp-c-divider);
  align-items: start;
  scroll-margin-top: var(--vp-nav-height);
}

.entry:last-child {
  border-bottom: 1px solid var(--vp-c-divider);
}

.side {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.phrase {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--vp-c-brand-1);
  text-wrap: balance;
}

.locus {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.5;
  color: var(--vp-c-text-3);
  font-variant-numeric: tabular-nums;
}

.badge {
  align-self: flex-start;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
}

.badge.verified { background: var(--vp-c-brand-soft); color: var(--vp-c-brand-1); }
.badge.chosen { background: var(--vp-c-brand-soft); color: var(--vp-c-brand-1); }
.badge.open { background: var(--vp-c-warning-soft); color: var(--vp-c-warning-1); }

.body > :first-child { margin-top: 0; }
.body > :last-child { margin-bottom: 0; }

.work {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  line-height: 1.55;
  color: var(--vp-c-text-2);
}

.work .label {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
  margin-bottom: 0.15rem;
}

.work cite { font-style: italic; }

.gloss {
  margin: 0;
  line-height: 1.7;
  max-width: 62ch;
  text-wrap: pretty;
}

.ref {
  margin: 0.55rem 0 0;
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
}

@media (max-width: 720px) {
  .entry {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.7rem;
  }
}
</style>
