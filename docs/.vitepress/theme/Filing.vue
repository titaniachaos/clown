<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import { data as workspace } from '../media.data'
import { data as board } from '../filing.data'
import { FILING_UI, TOPIC_NAMES, postPath, pagePath, fill } from '../topics.ts'
import type { Topic } from '../topics.ts'
import { useLang } from './useLang.ts'
import { filings, at, nearest, turn, reachAt } from '../../../scripts/lib/filing.mjs'

/**
 * Every way this workspace could file itself.
 *
 * The archive next door is bound like Queneau's sonnets: nineteen positions,
 * dozens of photographs able to fill each, and turning one line leaves the
 * other eighteen exactly where they were. That works because the positions are
 * independent — using a frame at one does not stop it being used at another.
 *
 * Here they are not, and the difference is the whole interest of it. Eleven
 * pieces of writing, eleven questions, and a filing gives each question one
 * piece and uses every piece exactly once: a complete account of the workspace
 * with nothing said twice and nothing left out. There are 1482 of them.
 *
 * So turning one line here can move another. It has to — take the piece
 * answering `solitude` and give it to `audience`, and something else must come
 * to `solitude`. The page says so rather than letting it look like a glitch.
 *
 * What it will not do is pair a claim with a source it does not belong to.
 * That is why this arranges the writing and not the ledger: the ledger's whole
 * apparatus exists to keep a phrase attached to what it draws on, and a
 * machine that shuffled those would be inventing scholarship.
 */

const { lang } = useLang()
const t = computed(() => FILING_UI[lang.value])
const names = computed(() => TOPIC_NAMES[lang.value])

const positions = board.positions
const all = filings(positions)

const ordinal = ref(0)
const ready = ref(false)

/** Every piece of writing, by the key the board files it under. */
const pieces = computed(() => {
  const found = new Map<string, { title: string; summary: string; href: string }>()
  for (const post of workspace.posts[lang.value]) {
    found.set(`blog/${post.slug}`, {
      title: post.title,
      summary: post.summary,
      href: withBase(postPath(lang.value, post.slug))
    })
  }
  for (const page of workspace.pages[lang.value]) {
    found.set(page.slug, {
      title: page.title,
      summary: page.summary,
      href: withBase(pagePath(lang.value, page.slug))
    })
  }
  return found
})

function readFragment(): number | null {
  const raw = decodeURIComponent(window.location.hash.replace(/^#/, '')).trim()
  return /^\d+$/.test(raw) ? Number(raw) : null
}

onMounted(() => {
  ordinal.value = nearest(readFragment() ?? 0, all) ?? 0
  ready.value = true
  window.addEventListener('hashchange', () => {
    ordinal.value = nearest(readFragment() ?? 0, all) ?? 0
  })
})

watch(ordinal, (now) => {
  if (!ready.value) return
  window.history.replaceState(null, '', `#${now}`)
})

const lines = computed(() => {
  const filing = at(ordinal.value, all)
  if (!filing) return []
  return filing.map((key: string, position: number) => ({
    position,
    topic: positions[position].topic,
    name: names.value[positions[position].topic as Topic],
    /** How many different pieces ever answer this question. */
    reach: reachAt(all, position),
    piece: pieces.value.get(key)
  }))
})

/** Which lines moved when the last one was turned, so the page can show it. */
const moved = ref<number[]>([])

function turnLine(position: number, by: number) {
  const before = at(ordinal.value, all) ?? []
  const next = turn(ordinal.value, all, position, by)
  const after = at(next, all) ?? []
  moved.value = after.map((key: string, i: number) => (key === before[i] ? -1 : i)).filter((i: number) => i >= 0)
  ordinal.value = next
}

const copied = ref(false)
async function share() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <section v-if="ready" class="filing">
    <p class="ui-label filing__size">{{ fill(t.of, all.length) }}</p>

    <ol class="filing__lines">
      <li
        v-for="line in lines"
        :key="line.position"
        class="filing__line"
        :class="{ 'filing__line--moved': moved.includes(line.position) }"
      >
        <div class="filing__question">
          <UiBadge variant="muted">{{ line.name }}</UiBadge>
        </div>

        <div class="filing__answer">
          <a v-if="line.piece" class="filing__title" :href="line.piece.href">{{ line.piece.title }}</a>
          <p v-if="line.piece?.summary" class="filing__summary">{{ line.piece.summary }}</p>
        </div>

        <div class="filing__turn">
          <UiButton
            variant="ghost"
            size="icon"
            :disabled="line.reach < 2"
            :aria-label="`${t.back}: ${line.name}`"
            @click="turnLine(line.position, -1)"
            >↑</UiButton
          >
          <UiButton
            variant="ghost"
            size="icon"
            :disabled="line.reach < 2"
            :aria-label="`${t.turn}: ${line.name}`"
            @click="turnLine(line.position, 1)"
            >↓</UiButton
          >
        </div>
      </li>
    </ol>

    <footer class="filing__foot ui-separator">
      <p class="filing__address">
        <span class="ui-label">{{ t.address }}</span>
        <code>{{ ordinal }}</code>
      </p>
      <p class="filing__note">{{ t.bound }}</p>
      <UiButton variant="alt" size="sm" @click="share">{{ copied ? t.copied : t.share }}</UiButton>
    </footer>
  </section>
</template>

<style scoped>
.filing { margin: 0; }
.filing__size { margin: 0 0 1.6rem; }
.filing__lines { margin: 0; padding: 0; list-style: none; }
.filing__line {
  display: grid;
  grid-template-columns: 9rem minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: start;
  padding: 0.9rem 0;
  border-bottom: 1px solid var(--vp-c-divider);
}
.filing__line:last-child { border-bottom: 0; }
/* A line that moved because another was turned. It fades rather than flashes,
   so the answer to "why did that change?" is on the page for a moment. */
.filing__line--moved { background: var(--vp-c-brand-soft); transition: background 0.9s ease-out; }
.filing__question { padding-top: 0.15rem; }
.filing__answer { min-width: 0; }
.filing__title {
  display: block;
  color: var(--vp-c-text-1);
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.3;
  text-decoration: none;
  text-wrap: pretty;
}
.filing__title:hover { color: var(--vp-c-brand-1); }
.filing__summary {
  margin: 0.25rem 0 0;
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
  line-height: 1.55;
  text-wrap: pretty;
}
.filing__turn { display: flex; flex-direction: column; gap: 0.25rem; }
.filing__foot { margin-top: 2rem; }
.filing__address { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: baseline; margin: 0 0 0.4rem; }
.filing__address code { font-size: 12px; }
.filing__note { margin: 0 0 1rem; color: var(--vp-c-text-3); font-size: 12px; line-height: 1.5; max-width: 60ch; }

@media (max-width: 560px) {
  .filing__line { grid-template-columns: minmax(0, 1fr) auto; gap: 0.6rem; }
  .filing__question { grid-column: 1 / -1; }
}
</style>
