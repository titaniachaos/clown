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
import LocalePreference from './LocalePreference.vue'
import NotFound from './NotFound.vue'
import Filing from './Filing.vue'
import UiBadge from './ui/UiBadge.vue'
import UiButton from './ui/UiButton.vue'
import UiLabel from './ui/UiLabel.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  // Acknowledgment belongs on every page: the obligation covers any
  // communication activity, not a single credits page. It renders nothing
  // until a grant is signed.
  Layout: () => h(DefaultTheme.Layout, null, {
      'layout-top': () => h(LocalePreference, { base: '/clown' }),
      // A path here is a question, so an address that answers nothing is a
      // question rather than a wall: it redirects when the same question has a
      // page under another order, and offers the answerable ones when it does
      // not. This is the slot the default theme actually renders -- a
      // top-level `NotFound` on the theme object is only the router's fallback
      // for a missing page module, and never reaches the 404 screen.
      'not-found': () => h(NotFound),
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
    app.component('Filing', Filing)
    // The ported primitives, same three as the archive. Registered here
    // because `enhanceApp` is where vitepress.dev registers components, and
    // globally because half the call sites are Markdown.
    app.component('UiBadge', UiBadge)
    app.component('UiButton', UiButton)
    app.component('UiLabel', UiLabel)
  }
} satisfies Theme
