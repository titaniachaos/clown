<script setup lang="ts">
import { computed } from 'vue'
import { useLang } from './useLang.ts'

const { lang: l } = useLang()

const COPY = {
  en: {
    // The landmark name a screen reader announces for this region.
    region: 'Fair pay',
    opening: 'Artistic work is work.',
    budgetBefore: 'Solo Titania Chaos is budgeted according to the',
    hugLabel: 'Honoraruntergrenze',
    budgetMiddle: 'published by IG Freie Theaterarbeit for professional artistic work in Austria. Where funding allows, the aim is to work towards the higher',
    fairPayLabel: 'Fair Pay recommendation',
    recommendations: 'These are professional recommendations rather than statutory minimum rates. For this project, they provide a transparent basis for budgeting rehearsal, artistic collaboration and production work.',
    status: 'The project is currently in creation and not yet funded.',
    cta: 'Support the project',
    source: 'Current rates and recommendations:',
  },
  bg: {
    region: 'Справедливо заплащане',
    opening: 'Художественият труд е труд.',
    budgetBefore: '„Соло Титания Хаос“ се бюджетира според',
    hugLabel: 'Honoraruntergrenze',
    budgetMiddle: 'на IG Freie Theaterarbeit за професионален художествен труд в Австрия. Когато финансирането го позволява, целта е да се работи към по-високата',
    fairPayLabel: 'препоръка за Fair Pay',
    recommendations: 'Това са професионални препоръки, а не законово установени минимални ставки. За този проект те дават прозрачна основа за бюджетиране на репетиции, художествено сътрудничество и продукционна работа.',
    status: 'Проектът в момента е в процес на създаване и все още не е финансиран.',
    cta: 'Подкрепете проекта',
    source: 'Актуални ставки и препоръки:',
  },
  de: {
    region: 'Faire Bezahlung',
    opening: 'Künstlerische Arbeit ist Arbeit.',
    budgetBefore: 'Solo Titania Chaos wird nach der von der IG Freie Theaterarbeit veröffentlichten',
    hugLabel: 'Honoraruntergrenze',
    budgetMiddle: 'für professionelle künstlerische Arbeit in Österreich kalkuliert. Wo es die Förderung erlaubt, ist das Ziel, auf die höhere',
    fairPayLabel: 'Fair-Pay-Empfehlung',
    recommendations: 'Dies sind professionelle Empfehlungen und keine gesetzlich vorgeschriebenen Mindestsätze. Für dieses Projekt bilden sie eine transparente Grundlage für die Kalkulation von Proben, künstlerischer Zusammenarbeit und Produktionsarbeit.',
    status: 'Das Projekt befindet sich derzeit in der Entwicklung und ist noch nicht gefördert.',
    cta: 'Das Projekt unterstützen',
    source: 'Aktuelle Sätze und Empfehlungen:',
  }
} as const

const t = computed(() => COPY[l.value])
</script>

<template>
  <aside class="fairpay" :aria-label="t.region">
    <p class="fairpay__lead">{{ t.opening }}</p>
    <p class="fairpay__lead">
      {{ t.budgetBefore }}
      <strong><a href="https://freietheater.at/honoraruntergrenze/">{{ t.hugLabel }}</a></strong>
      {{ t.budgetMiddle }}
      <strong><a href="https://freietheater.at/honoraruntergrenze/">{{ t.fairPayLabel }}</a></strong>.
    </p>
    <p class="fairpay__lead">{{ t.recommendations }}</p>
    <p class="fairpay__lead">{{ t.status }}</p>

    <a
      class="contact-button"
      href="https://revolut.me/titaniachaos"
      target="_blank"
      rel="noopener noreferrer"
      >{{ t.cta }}</a
    >

    <p class="fairpay__caveat">
      <em>{{ t.source }} <a href="https://freietheater.at/">IG Freie Theaterarbeit</a>.</em>
    </p>
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
.fairpay__caveat {
  margin: 16px 0 0;
  max-width: 68ch;
  color: var(--vp-c-text-2);
  font-size: 12px;
  line-height: 1.55;
}
</style>
