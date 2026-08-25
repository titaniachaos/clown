<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { data } from '../sources.data'
import type { Lang, Relation, Status } from '../sources.data'

/**
 * One matrix, one page, one record shape.
 *
 * Everything here is read from the loader: the citation, the statement the
 * work makes, the paradox that follows, where it lands in the documentation,
 * its place in the reading order, and how it stands to the other records.
 * Nothing is maintained twice, and nothing is maintained in Markdown -- the
 * three languages come from the same record, so a row cannot exist in English
 * and quietly not in German.
 *
 * The rows carry schema.org microdata, so the citations are readable by a
 * machine without a second copy of them in JSON-LD.
 */

/** One component, four combinations. Every one reads the same records. */
const props = withDefaults(
  defineProps<{ view?: 'matrix' | 'paradoxes' | 'statements' | 'order' }>(),
  { view: 'matrix' }
)

const { localeIndex } = useData()

/** `root` is the English locale; the others match their directory name. */
const lang = computed<Lang>(() =>
  localeIndex.value === 'bg' ? 'bg' : localeIndex.value === 'de' ? 'de' : 'en'
)

const ui = computed(() => data.ui[lang.value])

const ORDER: Status[] = ['verified', 'chosen', 'probable', 'open']

const tally = computed(() =>
  ORDER.map((status) => {
    const n = data.entries.filter((e) => e.status === status).length
    const count = ui.value.counts[status]
    return { status, n, label: n === 1 ? count.one : count.many }
  })
)

const byId = computed(() => new Map(data.entries.map((entry) => [entry.id, entry])))

/** Which seat a record holds, so the matrix row can show it. */
const seatOf = computed(() => {
  const seats = new Map<string, number>()
  for (const seat of data.reading) for (const id of seat.records) seats.set(id, seat.seat)
  return seats
})

const withParadox = computed(() => data.entries.filter((e) => e.paradox))
const withStatement = computed(() => data.entries.filter((e) => e.statement))

/** The short form of a citation: everything before the first comma. */
const shortWork = (work: string) => work.split(',')[0]

const phraseOf = (id: string) => byId.value.get(id)?.phrase[lang.value] ?? id

/**
 * The glosses carry `*emphasis*` and `[[record-id]]`; split both out rather
 * than injecting HTML. A `[[link]]` renders as that record's phrase in the
 * current language, pointing at its row.
 */
function parts(text: string) {
  return text
    .split(/(\*[^*]+\*|\[\[[a-z0-9-]+\]\])/g)
    .filter(Boolean)
    .map((chunk) => {
      if (chunk.startsWith('[[') && chunk.endsWith(']]')) {
        const id = chunk.slice(2, -2)
        return { link: id, text: phraseOf(id), em: false }
      }
      if (chunk.length > 2 && chunk.startsWith('*') && chunk.endsWith('*')) {
        return { em: true, text: chunk.slice(1, -1), link: '' }
      }
      return { em: false, text: chunk, link: '' }
    })
}
</script>


<template>
  <!-- the whole record, every facet -->
  <div v-if="props.view === 'matrix'" class="ledger" itemscope itemtype="https://schema.org/WebPage">
    <ul class="tally">
      <li v-for="t in tally" :key="t.status" :class="t.status">
        <b>{{ t.n }}</b><span>{{ t.label }}</span>
      </li>
    </ul>

    <div
      v-for="entry in data.entries"
      :key="entry.id"
      :id="entry.id"
      class="entry"
      itemprop="citation"
      itemscope
      itemtype="https://schema.org/CreativeWork"
    >
      <div class="side">
        <p class="phrase">{{ entry.phrase[lang] }}</p>
        <p class="locus">{{ entry.locus }}</p>
        <span class="badge" :class="entry.status">{{ ui.status[entry.status] }}</span>
        <p v-if="seatOf.get(entry.id)" class="seat">{{ ui.order }} · {{ seatOf.get(entry.id) }}</p>
      </div>

      <div class="body">
        <p class="work">
          <span class="label">{{ ui.source }}</span>
          <cite itemprop="name">{{ entry.work }}</cite>
        </p>

        <p class="gloss">
          <template v-for="(part, i) in parts(entry.gloss[lang])" :key="i">
            <a v-if="part.link" :href="`#${part.link}`" class="xref">{{ part.text }}</a>
            <em v-else-if="part.em">{{ part.text }}</em>
            <template v-else>{{ part.text }}</template>
          </template>
        </p>

        <p v-if="entry.statement" class="facet" itemprop="abstract">
          <span class="label">{{ ui.statement }}</span>
          <template v-for="(part, i) in parts(entry.statement[lang])" :key="i">
            <em v-if="part.em">{{ part.text }}</em>
            <template v-else>{{ part.text }}</template>
          </template>
        </p>

        <p v-if="entry.paradox" class="facet paradox">
          <span class="label">{{ ui.paradox }}</span>
          {{ entry.paradox[lang] }}
        </p>

        <p v-if="entry.out.length || entry.in.length" class="facet relations">
          <span class="label">{{ ui.relations }}</span>
          <span v-for="edge in entry.out" :key="`o${edge.to}${edge.kind}`" class="edge">
            <span :class="['kind', edge.kind]">{{ ui.kinds[edge.kind] }}</span>
            <a :href="`#${edge.to}`">{{ phraseOf(edge.to) }}</a>
          </span>
          <span v-for="edge in entry.in" :key="`i${edge.from}${edge.kind}`" class="edge inbound">
            <a :href="`#${edge.from}`">{{ phraseOf(edge.from) }}</a>
            <span :class="['kind', edge.kind]">{{ ui.kinds[edge.kind] }}</span>
          </span>
        </p>

        <p v-if="entry.ref" class="ref">
          doi:<span itemprop="identifier">{{ entry.ref }}</span>
        </p>
        <p class="address"><span itemprop="identifier">{{ entry.address }}</span></p>
      </div>
    </div>

    <p class="receipt">{{ ui.receipt }} · <span class="mono">{{ data.receipt }}</span></p>
  </div>

  <!-- the claim each record generates, and the ones the project owns -->
  <div v-else-if="props.view === 'paradoxes'" class="grid">
    <div v-for="entry in withParadox" :key="entry.id" class="cell">
      <p class="claim">{{ entry.paradox[lang] }}</p>
      <p class="from"><a :href="`#${entry.id}`">{{ shortWork(entry.work) }}</a></p>
    </div>
    <div v-for="(paradox, i) in data.own" :key="`own${i}`" class="cell own">
      <p class="claim">{{ paradox.claim[lang] }}</p>
      <p class="from">{{ paradox.where[lang] }}</p>
    </div>
  </div>

  <!-- what each book states, in its own terms -->
  <div v-else-if="props.view === 'statements'" class="grid">
    <div v-for="entry in withStatement" :key="entry.id" class="cell">
      <p class="from"><a :href="`#${entry.id}`">{{ shortWork(entry.work) }}</a></p>
      <p class="claim">
        <template v-for="(part, i) in parts(entry.statement[lang])" :key="i">
          <em v-if="part.em">{{ part.text }}</em>
          <template v-else>{{ part.text }}</template>
        </template>
      </p>
    </div>
  </div>

  <!-- the order, with the reason for each seat, linked to the records it names -->
  <ol v-else class="order">
    <li v-for="seat in data.reading" :key="seat.seat">
      <span class="note">
        <template v-for="(part, i) in parts(seat.note[lang])" :key="i">
          <em v-if="part.em">{{ part.text }}</em>
          <template v-else>{{ part.text }}</template>
        </template>
      </span>
      <span class="seats">
        <template v-for="(id, i) in seat.records" :key="id">
          <span v-if="i" class="and"> · </span>
          <a :href="`#${id}`">{{ phraseOf(id) }}</a>
        </template>
      </span>
    </li>
  </ol>
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

/* ---- rows ---- */

.entry {
  display: grid;
  grid-template-columns: minmax(0, 13rem) minmax(0, 1fr);
  gap: 0.9rem 2rem;
  padding: 1.5rem 0;
  border-top: 1px solid var(--vp-c-divider);
  align-items: start;
  scroll-margin-top: var(--vp-nav-height);
}

.entry:last-of-type {
  border-bottom: 1px solid var(--vp-c-divider);
}

.entry.own .phrase {
  color: var(--vp-c-text-2);
  font-size: 0.92rem;
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

.locus,
.seat {
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

.label {
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

.gloss .xref {
  color: var(--vp-c-brand-1);
  font-weight: 500;
  text-decoration: underline;
  text-decoration-thickness: 0.06em;
  text-underline-offset: 0.16em;
}

.facet {
  margin: 0.9rem 0 0;
  max-width: 62ch;
  font-size: 0.93rem;
  line-height: 1.65;
  color: var(--vp-c-text-2);
}

.facet.paradox {
  border-left: 2px solid var(--vp-c-brand-soft);
  padding-left: 0.85rem;
  color: var(--vp-c-text-1);
}

.relations {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.9rem;
  align-items: baseline;
}

.relations .label { flex: 1 0 100%; }

.edge {
  display: inline-flex;
  align-items: baseline;
  gap: 0.35rem;
  font-size: 0.82rem;
}

.kind {
  font-size: 0.66rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--vp-c-text-3);
}

.kind.contests { color: var(--vp-c-warning-1); }
.kind.supports,
.kind.converges { color: var(--vp-c-brand-1); }

.edge.inbound { opacity: 0.75; }

.ref,
.address,
.receipt {
  margin: 0.55rem 0 0;
  font-size: 0.74rem;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
}

.address { opacity: 0.55; }

.grid {
  display: grid;
  gap: 1px;
  background: var(--vp-c-divider);
  border: 1px solid var(--vp-c-divider);
  margin: 1.5rem 0 2rem;
}

.cell {
  background: var(--vp-c-bg);
  padding: 1rem 1.2rem;
}

.cell.own { background: var(--vp-c-bg-soft); }

.claim {
  margin: 0 0 0.4rem;
  line-height: 1.6;
  max-width: 68ch;
}

.from {
  margin: 0;
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}

.statements .cell .from { margin-bottom: 0.4rem; }

.order {
  margin: 1.5rem 0 0;
  padding-left: 1.4rem;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.order li { margin-bottom: 0.7rem; }

.order .note { display: block; color: var(--vp-c-text-1); line-height: 1.6; }

.order .seats {
  display: block;
  font-size: 0.8rem;
  margin-top: 0.15rem;
}
.order .and { color: var(--vp-c-text-3); }

.receipt {
  margin-top: 1.6rem;
  padding-top: 0.9rem;
  border-top: 1px solid var(--vp-c-divider);
}

.mono { color: var(--vp-c-text-2); }

@media (max-width: 720px) {
  .entry {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.7rem;
  }
}
</style>
