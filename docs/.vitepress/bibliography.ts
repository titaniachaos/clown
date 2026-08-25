/**
 * The bibliography, structured.
 *
 * The ledger's `work` strings are prose: readable, but nothing can compute a
 * reference from them. These records carry the fields separately so the APA
 * reference, the Atom feed and any future bibliography page all derive from
 * one source and cannot disagree.
 *
 * Rule for this file: a field is present only if it was checked against the
 * source. A missing publisher is a gap to fill, never a guess to make.
 */

export type WorkType = 'book' | 'article' | 'chapter' | 'thesis' | 'web'

export interface Work {
  /** Stable slug; also the Atom entry id. */
  id: string
  type: WorkType
  /** APA order: "Surname, F. M." */
  authors: string[]
  /** Publication year. `original/translation` where APA wants both. */
  year: string
  /** Sentence case, as APA sets article, chapter and book titles. */
  title: string
  /** Journal or book the piece sits in. Title case, italicised on render. */
  container?: string
  volume?: string
  issue?: string
  pages?: string
  publisher?: string
  /** Institution, for a thesis. */
  institution?: string
  /** Bracketed descriptor APA uses for theses and other non-standard works. */
  descriptor?: string
  translator?: string
  doi?: string
  url?: string
  /** Retained after the reference, for reprints and editions. */
  note?: string
  /** Ledger record ids that cite this work. */
  records: string[]
  /** Whether this session read the work itself or scholarship quoting it. */
  read: 'full-text' | 'scholarship' | 'not-read'
}

export const WORKS: Work[] = [
  {
    id: 'montaigne-solitude',
    type: 'chapter',
    authors: ['Montaigne, M. de'],
    year: '1580/1877',
    title: 'Of solitude',
    container: 'Essays',
    note: 'Book I, chapter 38. Cotton translation (1685), revised by W. C. Hazlitt. Public domain.',
    translator: 'C. Cotton',
    url: 'https://hyperessays.net/essays/on-solitude/',
    records: ['back-shop'],
    read: 'full-text'
  },
  {
    id: 'arendt-ideology-terror',
    type: 'article',
    authors: ['Arendt, H.'],
    year: '1953',
    title: 'Ideology and terror: A novel form of government',
    container: 'The Review of Politics',
    volume: '15',
    issue: '3',
    pages: '303–327',
    note: 'Added as the closing chapter of The Origins of Totalitarianism in the 1958 edition; it is not in the 1951 first edition.',
    records: ['three-terms', 'two-in-one'],
    read: 'full-text'
  },
  {
    id: 'arendt-origins',
    type: 'book',
    authors: ['Arendt, H.'],
    year: '1951',
    title: 'The origins of totalitarianism',
    publisher: 'Harcourt, Brace',
    records: ['three-terms'],
    read: 'full-text'
  },
  {
    id: 'arendt-life-of-the-mind',
    type: 'book',
    authors: ['Arendt, H.'],
    year: '1978',
    title: 'The life of the mind',
    publisher: 'Harcourt Brace Jovanovich',
    note: 'Takes Cato, by way of Cicero, as its epigraph.',
    records: ['two-in-one'],
    read: 'not-read'
  },
  {
    id: 'winnicott-capacity',
    type: 'article',
    authors: ['Winnicott, D. W.'],
    year: '1958',
    title: 'The capacity to be alone',
    container: 'International Journal of Psycho-Analysis',
    volume: '39',
    pages: '416–420',
    note: 'Reprinted in The maturational processes and the facilitating environment (Hogarth, 1965), pp. 29–36. Read here in The collected works of D. W. Winnicott, Vol. 5 (Oxford University Press, 2016), ch. 20, pp. 241–248.',
    url: 'https://www.sas.upenn.edu/~cavitch/pdf-library/Winnicott_Capacity_To_Be_Alone.pdf',
    records: ['capacity'],
    read: 'full-text'
  },
  {
    id: 'turkle-alone-together',
    type: 'book',
    authors: ['Turkle, S.'],
    year: '2011',
    title: 'Alone together: Why we expect more from technology and less from each other',
    publisher: 'Basic Books',
    records: ['alone-together'],
    read: 'not-read'
  },
  {
    id: 'lecoq-corps-poetique',
    type: 'book',
    authors: ['Lecoq, J.'],
    year: '1997/2002',
    title: 'The moving body (Le corps poétique): Teaching creative theatre',
    publisher: 'Methuen',
    note: 'Pages 154, 159 and 160 are cited from the 2002 edition, by way of Amsden (2015).',
    records: ['lecoq', 'flop'],
    read: 'not-read'
  },
  {
    id: 'gaulier-tormentor',
    type: 'book',
    authors: ['Gaulier, P.'],
    year: '2007',
    title: 'Le gégèneur / The tormentor',
    publisher: 'Éditions Filmiko',
    note: 'Pages 204–205, 280 and 286 cited by way of Amsden (2015).',
    records: ['flop', 'complicity'],
    read: 'not-read'
  },
  {
    id: 'amsden-thesis',
    type: 'thesis',
    authors: ['Amsden, L.'],
    year: '2015',
    title: '“The work of a clown is to make the audience burst out laughing”: Learning clown at École Philippe Gaulier',
    descriptor: 'Doctoral thesis',
    institution: 'University of Glasgow',
    url: 'https://theses.gla.ac.uk/6372/',
    records: ['flop'],
    read: 'full-text'
  },
  {
    id: 'amsden-monsieur-flop',
    type: 'article',
    authors: ['Amsden, L.'],
    year: '2017',
    title: 'Monsieur Marcel and Monsieur Flop: Failure in clown training at École Philippe Gaulier',
    container: 'Theatre, Dance and Performance Training',
    volume: '8',
    issue: '2',
    doi: '10.1080/19443927.2017.1316304',
    records: ['flop'],
    read: 'full-text'
  },
  {
    id: 'purcell-gates-locating',
    type: 'article',
    authors: ['Purcell Gates, L.'],
    year: '2011',
    title: 'Locating the self: Narratives and practices of authenticity in French clown training',
    container: 'Theatre, Dance and Performance Training',
    volume: '2',
    issue: '2',
    pages: '231–242',
    doi: '10.1080/19443927.2011.553239',
    records: ['training-paradox'],
    read: 'scholarship'
  },
  {
    id: 'laughery-ecoute-chute',
    type: 'web',
    authors: ['Laughery, V.'],
    year: '2022',
    title: 'L’écoute et la chute: Le sens du lieu commun dans le jeu clownesque et ses échos dans l’écriture poétique',
    container: 'Fabula, Lieu(x) commun(s)',
    url: 'https://www.fabula.org/colloques/document8603.php',
    records: ['shared-floor'],
    read: 'full-text'
  },
  {
    id: 'murray-keefe-physical-theatres',
    type: 'book',
    authors: ['Murray, S.', 'Keefe, J.'],
    year: '2007',
    title: 'Physical theatres: A critical introduction',
    publisher: 'Routledge',
    note: 'Page 146 on complicité and 151 on the via negativa, cited by way of Amsden (2015).',
    records: ['complicity'],
    read: 'scholarship'
  },
  {
    id: 'decroux-paroles',
    type: 'book',
    authors: ['Decroux, É.'],
    year: '1963',
    title: 'Paroles sur le mime',
    publisher: 'Gallimard',
    records: ['decroux'],
    read: 'not-read'
  },
  {
    id: 'heidegger-sein-und-zeit',
    type: 'book',
    authors: ['Heidegger, M.'],
    year: '1927',
    title: 'Sein und Zeit',
    publisher: 'Max Niemeyer',
    note: 'Section 47, on death as ownmost and non-relational.',
    records: ['final-exit'],
    read: 'not-read'
  },
  {
    id: 'jacob-auguste',
    type: 'web',
    authors: ['Jacob, P.'],
    year: 'n.d.',
    title: 'L’Auguste',
    container: 'Bibliothèque nationale de France / Centre national des arts du cirque',
    url: 'https://cirque-cnac.bnf.fr/en/clowns/clown-characters/auguste',
    records: ['playful-anarchy'],
    read: 'full-text'
  },
  {
    id: 'grock-lifes-a-lark',
    type: 'book',
    authors: ['Grock'],
    year: '1931',
    title: 'Life’s a lark',
    publisher: 'Heinemann',
    translator: 'M. Pemberton',
    note: 'Translated from Ich lebe gern!; edited by Eduard Behrens.',
    records: ['grock'],
    read: 'not-read'
  },
  {
    id: 'orwell-1984',
    type: 'book',
    authors: ['Orwell, G.'],
    year: '1949',
    title: 'Nineteen eighty-four',
    publisher: 'Secker & Warburg',
    records: ['two-and-two'],
    read: 'not-read'
  },
  {
    id: 'bergson-le-rire',
    type: 'book',
    authors: ['Bergson, H.'],
    year: '1900',
    title: 'Le rire: Essai sur la signification du comique',
    publisher: 'Félix Alcan',
    note: 'Parts I.i, I.iv and III. Read in the Brereton and Rothwell translation, where the three conditions are named together: unsociability in the performer, insensibility in the spectator, and automatism.',
    url: 'https://www.gutenberg.org/cache/epub/4352/pg4352.txt',
    records: ['laughter-echo', 'insensibility', 'unconscious'],
    read: 'full-text'
  },
  {
    id: 'weil-pesanteur',
    type: 'book',
    authors: ['Weil, S.'],
    year: '1947',
    title: 'La pesanteur et la grâce',
    publisher: 'Plon',
    note: 'Compiled posthumously by Gustave Thibon from the notebooks Weil left in his keeping. English translation, Gravity and grace, 1952.',
    records: ['emptied-room'],
    read: 'scholarship'
  },
  {
    id: 'dickinson-fly',
    type: 'chapter',
    authors: ['Dickinson, E.'],
    year: '1896',
    title: 'I heard a Fly buzz — when I died',
    container: 'Poems: Third series',
    note: 'Numbered 465 by Johnson and 591 by Franklin. Published posthumously as “Dying”. Public domain. Linked to the manuscript in Amherst College Digital Collections rather than to an anthology page.',
    url: 'https://acdc.amherst.edu/view/EmilyDickinson/ma00167-16-16-00155',
    records: ['emptied-room'],
    read: 'full-text'
  },
  {
    id: 'davison-clown',
    type: 'book',
    authors: ['Davison, J.'],
    year: '2013',
    title: 'Clown: Readings in theatre practice',
    publisher: 'Palgrave Macmillan',
    records: ['authenticity-effect'],
    read: 'not-read'
  },
  {
    id: 'van-wyk-whiteface-auguste',
    type: 'thesis',
    authors: ['Van Wyk, K.'],
    year: '2015',
    title: 'The whiteface and the auguste: The integration of structure and spontaneity in contemporary clown theatre performance',
    descriptor: "Master's dissertation",
    institution: 'University of Cape Town',
    note: 'Department of Drama, supervised by Mark Fleishman. Argues that clowning is detrimentally emphasised as a purely spontaneous form, avoiding critical examination, and for the Whiteface as order, form, rules, preparation and critical enquiry.',
    url: 'https://open.uct.ac.za/handle/11427/20128',
    records: ['whiteface-split'],
    read: 'full-text'
  }
]

/** Italics are markup, so the formatter emits them as segments, not strings. */
export interface Segment {
  text: string
  italic?: boolean
}

/**
 * An APA 7 reference, as segments.
 *
 * Author, A. A. (Year). Title. Container, Vol(Issue), pages. https://doi.org/…
 * Books italicise the title; articles italicise the container and volume.
 */
export function apa(w: Work): Segment[] {
  const out: Segment[] = []
  const push = (text: string, italic = false) => {
    if (text) out.push(italic ? { text, italic: true } : { text })
  }

  const authors =
    w.authors.length === 0 ? '' :
    w.authors.length === 1 ? w.authors[0] :
    w.authors.length === 2 ? `${w.authors[0]}, & ${w.authors[1]}` :
    `${w.authors.slice(0, -1).join(', ')}, & ${w.authors[w.authors.length - 1]}`

  push(`${authors} (${w.year}). `)

  const standalone = w.type === 'book' || w.type === 'thesis'
  push(w.title, standalone)
  if (w.descriptor) push(` [${w.descriptor}${w.institution ? `, ${w.institution}` : ''}]`)
  push('. ')

  if (w.container) {
    if (w.type === 'chapter') push('In ')
    push(w.container, true)
    if (w.volume) {
      push(', ')
      push(w.volume, true)
      if (w.issue) push(`(${w.issue})`)
    }
    if (w.pages) push(`, ${w.pages}`)
    push('. ')
  } else if (w.pages) {
    push(`${w.pages}. `)
  }

  if (w.translator) push(`(${w.translator}, Trans.). `)
  if (w.publisher) push(`${w.publisher}. `)
  if (w.doi) push(`https://doi.org/${w.doi}`)
  else if (w.url) push(w.url)

  return out
}

/** The same reference as a flat string, for feeds and plain-text contexts. */
export function apaText(w: Work): string {
  return apa(w).map((s) => s.text).join('').trim()
}
