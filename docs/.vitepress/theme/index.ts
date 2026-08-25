import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import SourceLedger from './SourceLedger.vue'
import PageRelations from './PageRelations.vue'
import Supporters from './Supporters.vue'
import FairPay from './FairPay.vue'
import QuestionDisclosure from './QuestionDisclosure.vue'
import HeroSlider from './HeroSlider.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  // Acknowledgment belongs on every page: the obligation covers any
  // communication activity, not a single credits page. It renders nothing
  // until a grant is signed.
  Layout: () => h(DefaultTheme.Layout, null, {
      'home-hero-image': () => h(HeroSlider),
      'layout-bottom': () => h(Supporters)
    }),
  enhanceApp({ app }) {
    app.component('SourceLedger', SourceLedger)
    app.component('PageRelations', PageRelations)
    app.component('FairPay', FairPay)
    app.component('QuestionDisclosure', QuestionDisclosure)
  }
} satisfies Theme
