<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { data } from '../fairpay.data.ts'

const { lang } = useData()
type Lang = 'en' | 'bg' | 'de'
const l = computed<Lang>(() => {
  const base = lang.value.split('-')[0]
  return (['en', 'bg', 'de'] as const).includes(base as Lang) ? (base as Lang) : 'en'
})

const eur = (n: number) => `€${n.toLocaleString('de-AT')}`

const COPY = {
  en: {
    lead: 'Austrian independent performing arts has a published fee floor, the Honoraruntergrenze, and a higher Fair Pay level above it. Both are recommendations, not law.',
    budgeted: (f: string, d: number) =>
      `This project budgets artistic work at the floor: ${f} a day, the experienced rehearsal rate, across ${d} rehearsal days.`,
    gapLabel: 'The gap to Fair Pay',
    gapNote: (fp: string) => `Fair Pay is ${fp} a day. Across rehearsal and the outside eye, the difference is:`,
    what: 'That gap is what a contribution closes. It buys no ticket and no thank-you. It pays the difference between the minimum a funder will accept and what the sector says the work is worth.',
    cta: 'Contribute toward fair pay',
    caveat: 'Figures from IG Freie Theaterarbeit, applicable from 2025, gross. The project is in creation and not yet funded — these are the rates it is budgeted at, not wages already paid.'
  },
  bg: {
    lead: 'Свободната сцена в Австрия има публикуван долен праг на хонорара — Honoraruntergrenze — и по-високо ниво Fair Pay над него. И двете са препоръки, не закон.',
    budgeted: (f: string, d: number) =>
      `Този проект залага художествения труд на прага: ${f} на ден, ставката за опитен изпълнител, за ${d} репетиционни дни.`,
    gapLabel: 'Разликата до Fair Pay',
    gapNote: (fp: string) => `Fair Pay е ${fp} на ден. За репетициите и външното око разликата е:`,
    what: 'Тази разлика е онова, което покрива един принос. Той не купува билет, нито благодарност. Плаща разстоянието между минимума, който финансиращият приема, и онова, което секторът смята, че трудът струва.',
    cta: 'Подкрепете справедливото заплащане',
    caveat: 'Данни от IG Freie Theaterarbeit, в сила от 2025 г., бруто. Проектът е в процес на създаване и все още не е финансиран — това са ставките, по които е калкулиран, а не вече изплатени възнаграждения.'
  },
  de: {
    lead: 'Die freie darstellende Kunst in Österreich hat eine veröffentlichte Honoraruntergrenze und darüber ein höheres Fair-Pay-Niveau. Beides sind Empfehlungen, kein Gesetz.',
    budgeted: (f: string, d: number) =>
      `Dieses Projekt kalkuliert die künstlerische Arbeit an der Untergrenze: ${f} pro Tag, der Probensatz für Erfahrene, über ${d} Probentage.`,
    gapLabel: 'Die Lücke zu Fair Pay',
    gapNote: (fp: string) => `Fair Pay liegt bei ${fp} pro Tag. Über Proben und Blick von außen beträgt die Differenz:`,
    what: 'Diese Lücke schließt ein Beitrag. Er kauft kein Ticket und kein Dankeschön. Er zahlt den Abstand zwischen dem Minimum, das eine Förderstelle akzeptiert, und dem, was die Branche für angemessen hält.',
    cta: 'Zu fairer Bezahlung beitragen',
    caveat: 'Zahlen der IG Freie Theaterarbeit, gültig ab 2025, brutto. Das Projekt entsteht noch und ist nicht gefördert — dies sind die kalkulierten Sätze, keine bereits gezahlten Honorare.'
  }
} as const

const t = computed(() => COPY[l.value])
</script>

<template>
  <aside class="fairpay" aria-labelledby="fairpay-gap">
    <p class="fairpay__lead">{{ t.lead }}</p>
    <p class="fairpay__lead">{{ t.budgeted(eur(data.floorDay), data.rehearsalDays) }}</p>
    <p class="fairpay__lead">{{ t.gapNote(eur(data.fairPayDay)) }}</p>

    <p id="fairpay-gap" class="fairpay__figure">
      <span class="fairpay__amount">{{ eur(data.gap) }}</span>
      <span class="fairpay__label">{{ t.gapLabel }}</span>
    </p>

    <p class="fairpay__lead">{{ t.what }}</p>

    <a
      class="contact-button"
      href="https://revolut.me/titaniachaos"
      target="_blank"
      rel="noopener noreferrer"
      >{{ t.cta }}</a
    >

    <p class="fairpay__caveat">{{ t.caveat }}</p>
  </aside>
</template>

<style scoped>
.fairpay {
  margin: 28px 0;
  padding: 24px;
  border: 1px solid var(--vp-c-brand-soft);
  border-radius: 14px;
  background: var(--vp-c-bg-soft);
}
.fairpay__lead {
  margin: 0 0 12px;
  max-width: 68ch;
  line-height: 1.7;
}
.fairpay__figure {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin: 20px 0;
  flex-wrap: wrap;
}
.fairpay__amount {
  color: var(--vp-c-brand-1);
  font-size: 2.4rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
}
.fairpay__label {
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.fairpay__caveat {
  margin: 16px 0 0;
  max-width: 68ch;
  color: var(--vp-c-text-2);
  font-size: 12px;
  line-height: 1.55;
}
</style>
