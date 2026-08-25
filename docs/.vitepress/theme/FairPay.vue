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
    fairAt: (fp: string) => `Fair Pay sits at ${fp} a day.`,
    standing: 'Vienna has no law on this. The floor is a non-binding recommendation, worked out between artists of the Wiener Perspektive and IG Freie Theaterarbeit. What the city has is a position: Fair Pay is a field of action in the Kulturstrategie 2030, the Gemeinderat resolved funding for the free performing arts on that basis in May 2021, and since 2020 the Kuratorium für Theater, Tanz und Performance has weighed the floors when assessing applications.',
    what: 'Supporting the project supports work paid at least at that floor. Contributions are not earmarked and buy no ticket and no thank-you — they go into studio time.',
    cta: 'Support the project',
    caveat: 'Rates from IG Freie Theaterarbeit, applicable from 2025, gross. The project is in creation and not yet funded — these are the rates it is budgeted at, not wages already paid.'
  },
  bg: {
    lead: 'Свободната сцена в Австрия има публикуван долен праг на хонорара — Honoraruntergrenze — и по-високо ниво Fair Pay над него. И двете са препоръки, не закон.',
    budgeted: (f: string, d: number) =>
      `Този проект залага художествения труд на прага: ${f} на ден, ставката за опитен изпълнител, за ${d} репетиционни дни.`,
    fairAt: (fp: string) => `Fair Pay е ${fp} на ден.`,
    standing: 'Виена няма закон за това. Прагът е необвързваща препоръка, изработена от артисти от Wiener Perspektive и IG Freie Theaterarbeit. Градът има позиция: справедливото заплащане е поле на действие в Kulturstrategie 2030, през май 2021 г. Общинският съвет прие на тази основа финансиране за свободната сцена, а от 2020 г. Kuratorium für Theater, Tanz und Performance отчита праговете при оценката на кандидатурите.',
    what: 'Подкрепата за проекта е подкрепа за труд, платен поне на този праг. Приносите не са целеви и не купуват билет или благодарност — отиват в студийно време.',
    cta: 'Подкрепете проекта',
    caveat: 'Ставки от IG Freie Theaterarbeit, в сила от 2025 г., бруто. Проектът е в процес на създаване и все още не е финансиран — това са ставките, по които е калкулиран, а не вече изплатени възнаграждения.'
  },
  de: {
    lead: 'Die freie darstellende Kunst in Österreich hat eine veröffentlichte Honoraruntergrenze und darüber ein höheres Fair-Pay-Niveau. Beides sind Empfehlungen, kein Gesetz.',
    budgeted: (f: string, d: number) =>
      `Dieses Projekt kalkuliert die künstlerische Arbeit an der Untergrenze: ${f} pro Tag, der Probensatz für Erfahrene, über ${d} Probentage.`,
    fairAt: (fp: string) => `Fair Pay liegt bei ${fp} pro Tag.`,
    standing: 'Wien hat dazu kein Gesetz. Die Untergrenze ist eine unverbindliche Empfehlung, erarbeitet von Künstler:innen der Wiener Perspektive und der IG Freie Theaterarbeit. Was die Stadt hat, ist eine Haltung: Fair Pay ist ein Handlungsfeld der Kulturstrategie 2030, der Gemeinderat beschloss auf dieser Grundlage im Mai 2021 Förderungen für die freien darstellenden Künste, und seit 2020 bezieht das Kuratorium für Theater, Tanz und Performance die Untergrenzen in die Beurteilung von Anträgen ein.',
    what: 'Das Projekt zu unterstützen heißt, Arbeit zu unterstützen, die mindestens an dieser Untergrenze bezahlt wird. Beiträge sind nicht zweckgebunden und kaufen kein Ticket und kein Dankeschön — sie gehen in Studiozeit.',
    cta: 'Das Projekt unterstützen',
    caveat: 'Sätze der IG Freie Theaterarbeit, gültig ab 2025, brutto. Das Projekt entsteht noch und ist nicht gefördert — dies sind die kalkulierten Sätze, keine bereits gezahlten Honorare.'
  }
} as const

const t = computed(() => COPY[l.value])
</script>

<template>
  <aside class="fairpay" aria-label="Fair pay">
    <p class="fairpay__lead">{{ t.lead }}</p>
    <p class="fairpay__lead">{{ t.budgeted(eur(data.floorDay), data.rehearsalDays) }}</p>
    <p class="fairpay__lead">{{ t.fairAt(eur(data.fairPayDay)) }}</p>
    <p class="fairpay__lead fairpay__standing">{{ t.standing }}</p>
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
.fairpay__standing {
  padding-left: 14px;
  border-left: 2px solid var(--vp-c-brand-soft);
  color: var(--vp-c-text-2);
  font-size: 14px;
}
.fairpay__caveat {
  margin: 16px 0 0;
  max-width: 68ch;
  color: var(--vp-c-text-2);
  font-size: 12px;
  line-height: 1.55;
}
</style>
