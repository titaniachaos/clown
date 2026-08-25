<script setup lang="ts">
import { computed } from 'vue'
import { data } from '../relations.data'
import type { Kind } from '../relations.data'
import { useLang } from './useLang.ts'

/**
 * Renders how this page connects to the rest of the documentation, from the
 * graph built out of frontmatter. Both directions are shown: what this page
 * declared, and what other pages declared about it.
 */

const { lang, prefix, slug } = useLang()

const HEADING = {
  en: 'How this connects',
  bg: 'Как се свързва това',
  de: 'Wie das zusammenhängt'
}

const groups = computed(() => {
  const mine = data.edges[slug.value] ?? []
  const byKind = new Map<Kind, { href: string; text: string }[]>()

  for (const e of mine) {
    const title = data.titles[e.slug]?.[lang.value] ?? data.titles[e.slug]?.en ?? e.slug
    const href = `${prefix.value}/${e.slug}${e.anchor ? `#${e.anchor}` : ''}`
    const list = byKind.get(e.kind) ?? []
    if (!list.some((l) => l.href === href)) list.push({ href, text: title })
    byKind.set(e.kind, list)
  }

  return [...byKind].map(([kind, links]) => ({
    kind,
    label: data.kinds[kind].label[lang.value],
    links
  }))
})
</script>

<template>
  <nav v-if="groups.length" class="relations" :aria-label="HEADING[lang]">
    <p class="heading">{{ HEADING[lang] }}</p>
    <dl>
      <template v-for="g in groups" :key="g.kind">
        <dt>{{ g.label }}</dt>
        <dd>
          <a v-for="l in g.links" :key="l.href" :href="l.href">{{ l.text }}</a>
        </dd>
      </template>
    </dl>
  </nav>
</template>

<style scoped>
.relations {
  margin: 2.5rem 0 0;
  padding: 1.1rem 1.25rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.heading {
  margin: 0 0 0.75rem;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
}

dl {
  display: grid;
  grid-template-columns: minmax(0, auto) minmax(0, 1fr);
  gap: 0.5rem 1.25rem;
  margin: 0;
  align-items: baseline;
}

dt {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  white-space: nowrap;
}

dd {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1rem;
  margin: 0;
}

dd a {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  border-bottom: 1px solid transparent;
}

dd a:hover { border-bottom-color: var(--vp-c-brand-1); }
dd a:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 2px; }

@media (max-width: 560px) {
  dl { grid-template-columns: minmax(0, 1fr); gap: 0.15rem; }
  dt { margin-top: 0.6rem; }
}
</style>
