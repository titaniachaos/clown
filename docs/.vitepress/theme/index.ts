import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import SourceLedger from './SourceLedger.vue'
import PageRelations from './PageRelations.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('SourceLedger', SourceLedger)
    app.component('PageRelations', PageRelations)
  }
} satisfies Theme
