import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import SourceLedger from './SourceLedger.vue'
import PageRelations from './PageRelations.vue'
import Supporters from './Supporters.vue'
import FairPay from './FairPay.vue'
import QuestionDisclosure from './QuestionDisclosure.vue'
import HeroSlider from './HeroSlider.vue'
import MediaFigure from './MediaFigure.vue'
import BlogIndex from './BlogIndex.vue'
import BlogTopic from './BlogTopic.vue'
import PageTopics from './PageTopics.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  // Acknowledgment belongs on every page: the obligation covers any
  // communication activity, not a single credits page. It renders nothing
  // until a grant is signed.
  Layout: () => h(DefaultTheme.Layout, null, {
      'home-hero-image': () => h(HeroSlider),
      // The tags a page already carries, as links. Placed here rather than in
      // thirty-three Markdown files; renders nothing on a page with no tags.
      // The home page has no such slot and writes it out itself.
      'doc-after': () => h(PageTopics),
      'layout-bottom': () => h(Supporters)
    }),
  enhanceApp({ app }) {
    app.component('SourceLedger', SourceLedger)
    app.component('PageRelations', PageRelations)
    app.component('FairPay', FairPay)
    app.component('QuestionDisclosure', QuestionDisclosure)
    // The journal's photographs. They are served from the main site; this
    // repository stores only the index of them. See media.data.ts.
    app.component('MediaFigure', MediaFigure)
    app.component('BlogIndex', BlogIndex)
    app.component('BlogTopic', BlogTopic)
    app.component('PageTopics', PageTopics)
  }
} satisfies Theme
