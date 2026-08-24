import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'en',
  title: 'Solo Titania Chaos 2026',
  titleTemplate: ':title | Solo Titania Chaos 2026',
  description: 'Research, dramaturgy, rehearsal and production for the wordless Solo Titania Chaos 2026 clown project.',
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Concept', link: '/concept' },
      { text: 'Dramaturgy', link: '/dramaturgy' },
      { text: 'Studio', link: '/studio-process' },
      { text: 'Titania Chaos', link: 'https://titaniachaos.github.io/' }
    ],
    sidebar: [
      {
        text: 'Solo Titania Chaos 2026',
        items: [
          { text: 'Project Home', link: '/' },
          { text: 'Artistic Concept', link: '/concept' },
          { text: 'Audience Relationship', link: '/audience' },
          { text: 'Dramaturgy', link: '/dramaturgy' },
          { text: 'Studio Process', link: '/studio-process' },
          { text: 'Rehearsal Toolkit', link: '/rehearsal-toolkit' },
          { text: 'Material Research', link: '/material-research' },
          { text: 'Decision Gates', link: '/decisions' },
          { text: 'Production', link: '/production' },
          { text: 'About', link: '/about' }
        ]
      }
    ],
    search: { provider: 'local' },
    socialLinks: [
      { icon: 'instagram', link: 'https://www.instagram.com/titaniachaos' }
    ],
    outline: { level: [2, 3] }
  }
})
