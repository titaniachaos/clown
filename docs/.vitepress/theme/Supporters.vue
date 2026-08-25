<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import {
  awards,
  disclaimer,
  EU_EMBLEM,
  STATEMENT,
  SUPPORTED_BY,
  type Lang
} from '../supporters.ts'

const { lang } = useData()

// `lang` carries region subtags such as de-AT; match on the base language.
const l = computed<Lang>(() => {
  const base = lang.value.split('-')[0]
  return (['en', 'bg', 'de'] as const).includes(base as Lang) ? (base as Lang) : 'en'
})

const eu = computed(() => awards.find((a) => a.kind === 'eu'))
const national = computed(() => awards.filter((a) => a.kind === 'national'))
</script>

<template>
  <!-- Renders nothing until a grant is signed. Claiming EU funding without an
       award would be a false statement, not an empty placeholder. -->
  <section v-if="awards.length" class="supporters" aria-labelledby="supporters-title">
    <p id="supporters-title" class="supporters__title">{{ SUPPORTED_BY[l] }}</p>

    <div class="supporters__row">
      <!-- The emblem is never combined with another mark, and sets the height
           every other logo inherits, so none can out-scale it. -->
      <div v-if="eu && eu.statement" class="supporters__eu">
        <svg
          class="supporters__emblem"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 300 200"
          role="img"
          :aria-label="STATEMENT[eu.statement!][l]"
          v-html="EU_EMBLEM"
        />
        <p class="supporters__statement">{{ STATEMENT[eu.statement!][l] }}</p>
      </div>

      <p v-for="a in national" :key="a.funder" class="supporters__credit">
        {{ a.credit?.[l] ?? a.funder }}
      </p>
    </div>

    <p v-if="eu && eu.statement" class="supporters__disclaimer">{{ disclaimer(eu.statement!, l) }}</p>
  </section>
</template>

<style scoped>
.supporters {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--vp-c-divider);
}
.supporters__title {
  margin: 0 0 12px;
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.supporters__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24px;
}
/* The emblem and its statement are one unit, kept clear of other marks. */
.supporters__eu {
  display: flex;
  align-items: center;
  gap: 12px;
}
.supporters__emblem {
  /* The floor for every logo beside it: nothing may be shown more prominently. */
  height: var(--supporters-logo-height, 48px);
  width: auto;
  flex-shrink: 0;
}
.supporters__statement {
  margin: 0;
  max-width: 22ch;
  color: var(--vp-c-text-1);
  font-size: 13px;
  line-height: 1.35;
}
.supporters__credit {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.35;
}
.supporters__disclaimer {
  margin: 16px 0 0;
  max-width: 90ch;
  color: var(--vp-c-text-2);
  font-size: 12px;
  line-height: 1.5;
}
@media (max-width: 640px) {
  .supporters__row { gap: 16px; }
  .supporters__eu { gap: 10px; }
}
</style>
