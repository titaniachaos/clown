import { createHash } from 'node:crypto'
import { defineLoader } from 'vitepress'
import type { Lang, Localised } from './locale.ts'

/**
 * Build-time data loader for the source ledger.
 *
 * Every entry is written once and rendered into all three locales, so a
 * correction to a citation cannot land in English and quietly miss Bulgarian.
 * The loader runs in Node during the build; the result is inlined as JSON.
 */

/**
 * How the attribution stands. Encoded, not decorative.
 *
 * `verified` — the documentation was already quoting this source.
 * `chosen`   — the project decided the lineage; the tradition is documented.
 * `probable` — a close match the documentation has not confirmed.
 * `open`     — unattributed, and awaiting a decision.
 */
export type { Lang }
export type Status = 'verified' | 'chosen' | 'probable' | 'open'

export interface SourceEntry {
  /** Anchor id, shared across locales. */
  id: string
  status: Status
  /** Where the phrase appears in this documentation. */
  locus: string
  /** Citation. Titles stay in their original language in every locale. */
  work: string
  /** Persistent identifier, where one exists. */
  ref?: string
  /** The phrase as it stands in the documentation. */
  phrase: Localised
  /** What it is drawing on. */
  gloss: Localised
}

/** How one record stands to another. Edges, not prose. */
export type Relation = 'cites' | 'supports' | 'contests' | 'converges'

export interface Edge {
  from: string
  to: string
  kind: Relation
}

/** Facets a record may carry beyond its citation. Merged in by the loader. */
/** One seat in the reading order: the records to read, and why then. */
export interface Seat {
  records: string[]
  note: Record<Lang, string>
}

export interface Facets {
  /** The claim the work itself makes, in its own terms. */
  statement?: Record<Lang, string>
  /** The paradox that claim generates for this project. */
  paradox?: Record<Lang, string>
}

/** A paradox the project owns: no source, and the page should say so. */
export interface OwnParadox {
  where: Record<Lang, string>
  claim: Record<Lang, string>
}

/** One record, once every facet is folded in. */
export type Record_ = SourceEntry & Facets & {
  /** Content address: changes when any part of the record changes. */
  address: string
  out: Edge[]
  in: Edge[]
}

export interface Data {
  entries: Record_[]
  own: OwnParadox[]
  reading: (Seat & { seat: number })[]
  edges: Edge[]
  /** The addresses folded to one value, recomputed on every build. */
  receipt: string
  ui: Localised<{
    phrase: string
    source: string
    status: Record<Status, string>
    /** One form per grammatical number: the tally prints a bare integer. */
    counts: Record<Status, { one: string; many: string }>
    statement: string
    paradox: string
    relations: string
    order: string
    own: string
    receipt: string
    kinds: Record<Relation, string>
  }>
}

declare const data: Data
export { data }

const entries: SourceEntry[] = [
  {
    id: 'back-shop',
    status: 'verified',
    locus: 'dramaturgy · 3',
    work: 'Michel de Montaigne, Essais I.38, « De la solitude » (1580)',
    phrase: {
      en: 'The back shop',
      bg: 'Задната стая',
      de: 'Der Hinterladen'
    },
    gloss: {
      en: 'Montaigne’s *arrière-boutique*: “we must reserve a backshop, wholly our own and entirely free” (Book I, ch. 38). Movement 3 stages the essay. Its reversal — that the private room stays furnished with borrowed language and absent people — is not Montaigne’s, and belongs to the project.',
      bg: '*Arrière-boutique* на Монтен: „трябва да си запазим задна стая, изцяло наша и напълно свободна“ (книга I, гл. 38). Движение 3 поставя есето на сцена. Обръщането — че личната стая остава обзаведена със заета реч и отсъстващи хора — не е на Монтен и принадлежи на проекта.',
      de: 'Montaignes *arrière-boutique*: „wir müssen uns einen Hinterladen vorbehalten, ganz der unsere und völlig frei“ (Buch I, Kap. 38). Bewegung 3 bringt den Essay auf die Bühne. Die Umkehrung — dass der private Raum mit geliehener Sprache und abwesenden Menschen möbliert bleibt — stammt nicht von Montaigne, sondern vom Projekt.'
    }
  },
  {
    id: 'three-terms',
    status: 'verified',
    locus: 'concept · 2',
    work: '“Ideology and Terror: A Novel Form of Government”, Review of Politics 15:3 (1953), 303–27; added as the closing chapter of The Origins of Totalitarianism in the 1958 edition',
    phrase: {
      en: 'Solitude, loneliness and isolation',
      bg: 'Самота, самотност и изолация',
      de: 'Einsamkeit, Verlassenheit und Isolation'
    },
    gloss: {
      en: 'Read in the source. The three are not degrees of one condition but three different situations. Isolation is political — the inability to act with others — and Arendt insists it is *required* for all making: the maker withdraws from common concerns and stays in contact with the world as human artifice. Isolation turns into loneliness only when the capacity to add something of one’s own to the common world is destroyed. Loneliness is social, and she calls it the common ground for terror. Solitude is being two-in-one with oneself.',
      bg: 'Прочетено в източника. Трите не са степени на едно състояние, а три различни положения. Изолацията е политическа — невъзможността да действаш с другите — и Аренд настоява, че тя е *необходима* за всяко правене: правещият се оттегля от общите грижи и остава във връзка със света като човешко творение. Изолацията се превръща в самотност само когато способността да добавиш нещо свое към общия свят бъде разрушена. Самотността е социална и Аренд я нарича обща почва на терора. Самотата е да си двама в един със себе си.',
      de: 'In der Quelle gelesen. Die drei sind keine Abstufungen eines Zustands, sondern drei verschiedene Lagen. Isolation ist politisch — die Unfähigkeit, mit anderen zu handeln — und Arendt besteht darauf, dass sie für alles Herstellen *nötig* ist: Der Herstellende zieht sich aus den gemeinsamen Angelegenheiten zurück und bleibt mit der Welt als menschlichem Artefakt verbunden. Isolation schlägt erst dann in Verlassenheit um, wenn die Fähigkeit zerstört wird, der gemeinsamen Welt etwas Eigenes hinzuzufügen. Verlassenheit ist sozial, und sie nennt sie den gemeinsamen Boden des Terrors. Einsamkeit heißt, mit sich selbst zwei-in-eins zu sein.'
    }
  },
  {
    id: 'two-in-one',
    status: 'verified',
    locus: 'dramaturgy · 6',
    work: 'Hannah Arendt, “Ideology and Terror” (1953), where the term first appears; developed in The Life of the Mind (1978), whose epigraph is Cato by way of Cicero',
    phrase: {
      en: 'The two-in-one',
      bg: 'Двамата в един',
      de: 'Das Zwei-in-Einem'
    },
    gloss: {
      en: 'Arendt takes it from Epictetus by way of Cato: in solitude I am by myself, together with my self, and therefore two-in-one; in loneliness I am actually one, deserted. The crucial difficulty, and the hinge of the hour: *the two-in-one needs the others in order to become one again.* Identity is confirmed only from outside, and company restores the single voice. Solitude splits; being seen makes whole. Movement 6 builds a companion that cannot perform that office — an object can hold presence but cannot confirm an identity — which is why it must be let go while the room is still full.',
      bg: 'Аренд го взема от Епиктет през Катон: в самотата съм при себе си, заедно със своя аз, и следователно двама в един; в самотността съм действително един, изоставен. Решаващото затруднение и пантата на часа: *двамата в един се нуждаят от другите, за да станат отново един.* Идентичността се потвърждава само отвън, а компанията възстановява единния глас. Самотата разделя; да бъдеш видян те прави цял. Движение 6 изгражда спътник, който не може да изпълни тази служба — предметът може да носи присъствие, но не може да потвърди идентичност — и затова трябва да бъде оставен, докато залата още е пълна.',
      de: 'Arendt übernimmt es von Epiktet über Cato: In der Einsamkeit bin ich bei mir, zusammen mit meinem Selbst, und also zwei-in-eins; in der Verlassenheit bin ich tatsächlich einer, verlassen. Die entscheidende Schwierigkeit und das Scharnier der Stunde: *Das Zwei-in-Eins braucht die anderen, um wieder eins zu werden.* Identität wird nur von außen bestätigt, und Gesellschaft stellt die eine Stimme wieder her. Einsamkeit spaltet; gesehen zu werden macht ganz. Bewegung 6 baut eine Gefährtin, die dieses Amt nicht ausüben kann — ein Objekt kann Anwesenheit tragen, aber keine Identität bestätigen — weshalb sie losgelassen werden muss, solange der Saal noch voll ist.'
    }
  },
  {
    id: 'capacity',
    status: 'verified',
    locus: 'concept · 6',
    work: 'D. W. Winnicott, “The Capacity to be Alone”, Int. J. Psycho-Anal. 39 (1958), 416–420; repr. The Maturational Processes and the Facilitating Environment (Hogarth, 1965), 29–36',
    phrase: {
      en: 'Learning to be alone',
      bg: 'Да се научиш да си сам',
      de: 'Alleinsein lernen'
    },
    gloss: {
      en: 'Read in full. The paper’s own section heading is *Paradox*, and an editor’s note marks it as the first appearance of that term in Winnicott. Two things the summaries omit. He names the relationship *ego-relatedness*, and allows that the reliable other may be represented by a cot, a pram or the atmosphere of the room — which makes the companion in movement 6 a carrier of presence rather than a substitute for one. And what an undemanding presence permits is floundering: existing without reacting and without direction until an impulse arrives that feels real. The project’s extension — that an audience supplies that presence for a solo performer — is the load-bearing claim of the whole concept.',
      bg: 'Прочетено изцяло. Заглавието на един от разделите в статията е *Парадокс*, а редакторска бележка го отбелязва като първата поява на този термин у Уиникът. Две неща, които преразказите пропускат. Той нарича отношението *его-свързаност* и допуска, че надеждният друг може да бъде представен от люлка, количка или от атмосферата на стаята — което прави спътника в движение 6 носител на присъствие, а не негов заместител. А онова, което непретенциозното присъствие позволява, е лутането: да съществуваш, без да реагираш и без посока, докато не дойде импулс, който усещаш като истински. Приносът на проекта — че публиката осигурява това присъствие за соловия изпълнител — е носещото твърдение на цялата концепция.',
      de: 'Vollständig gelesen. Eine Abschnittsüberschrift des Aufsatzes lautet *Paradox*, und eine Herausgebernotiz verzeichnet sie als erstes Auftreten dieses Begriffs bei Winnicott. Zwei Dinge, die die Zusammenfassungen auslassen. Er nennt die Beziehung *Ich-Bezogenheit* und lässt zu, dass der verlässliche andere durch ein Bettchen, einen Kinderwagen oder die Atmosphäre des Raums vertreten sein kann — was die Gefährtin in Bewegung 6 zur Trägerin von Anwesenheit macht statt zu deren Ersatz. Und was eine nicht fordernde Anwesenheit erlaubt, ist das Treiben: existieren ohne Reaktion und ohne Richtung, bis ein Impuls eintrifft, der sich echt anfühlt. Der Beitrag des Projekts — dass ein Publikum diese Anwesenheit für eine Solospielerin bereitstellt — ist die tragende Behauptung des gesamten Konzepts.'
    }
  },
  {
    id: 'alone-together',
    status: 'verified',
    locus: 'concept · 7',
    work: 'Sherry Turkle, Alone Together (Basic Books, 2011)',
    phrase: {
      en: 'Alone together',
      bg: 'Сами заедно',
      de: 'Gemeinsam einsam'
    },
    gloss: {
      en: 'The title and thesis of Turkle’s book: constant connection produces an illusion of companionship and, underneath it, a deeper solitude. The only mode with a contemporary reference point, and therefore the one a programmer will quote back.',
      bg: 'Заглавието и тезата на книгата на Търкъл: постоянната свързаност създава илюзия за общност и под нея — по-дълбока самота. Единственият режим със съвременна отправна точка и затова онзи, който програматорът ще цитира.',
      de: 'Titel und These von Turkles Buch: Ständige Verbundenheit erzeugt eine Illusion von Gesellschaft und darunter eine tiefere Einsamkeit. Der einzige Modus mit einem gegenwärtigen Bezugspunkt und deshalb jener, den eine Programmleitung zitieren wird.'
    }
  },
  {
    id: 'flop',
    status: 'verified',
    locus: 'concept · audience · studio',
    work: 'Jacques Lecoq, Le Corps Poétique (1997) / The Moving Body, 160; Philippe Gaulier, Le Gégèneur / The Tormentor (2007), 280 and 286; Lucy Amsden, “Monsieur Marcel and Monsieur Flop”, Theatre, Dance and Performance Training 8:2 (2017), 129–142',
    ref: '10.1080/19443927.2017.1316304',
    phrase: {
      en: 'The flop',
      bg: 'Флопът',
      de: 'Der Flop'
    },
    gloss: {
      en: 'Two definitions, and the project needs both. Lecoq: an attempt at an exploit that inevitably fails, the student’s own weakness turned into material. Gaulier: the clown *registering* the failure, so the registration becomes the comic moment. Lecoq supplies the attempt, Gaulier the look up afterwards. The flop scale rated by exposure rather than laugh size is this project’s instrument, not either man’s. Amsden separates three kinds, and reports that students cannot tell them apart: the scripted failure that is a number’s premise, the failure to amuse, and the flop the clown registers and reincorporates. The scale should record which kind a failure was, or the slippage between them — where she argues the training actually happens — is exactly what it hides.',
      bg: 'Две определения, и проектът се нуждае и от двете. Льокок: опит за подвиг, който неизбежно се проваля — собствената слабост на ученика, превърната в материал. Голие: клоунът *осъзнава* провала и това осъзнаване става комичният момент. Льокок дава опита, Голие — вдигането на поглед след него. Скалата на флоповете, оценявана по разкритост, а не по сила на смеха, е инструмент на този проект, не на никого от двамата. Амсдън разграничава три вида и отбелязва, че учениците не ги различават: сценарийният провал, който е предпоставката на номера; неуспехът да разсмееш; и флопът, който клоунът осъзнава и вплита обратно. Скалата трябва да записва кой вид е бил всеки провал, иначе точно приплъзването между тях — където според нея всъщност се случва обучението — е онова, което тя скрива.',
      de: 'Zwei Definitionen, und das Projekt braucht beide. Lecoq: der Versuch einer Glanzleistung, der unweigerlich scheitert — die eigene Schwäche der Schülerin, in Material verwandelt. Gaulier: der Clown *bemerkt* das Scheitern, und dieses Bemerken wird zum komischen Moment. Lecoq liefert den Versuch, Gaulier den Blick danach. Die nach Bloßstellung statt nach Lachstärke bewertete Flop-Skala ist ein Instrument dieses Projekts, nicht das eines der beiden. Amsden unterscheidet drei Arten und berichtet, dass Studierende sie nicht auseinanderhalten können: das geschriebene Scheitern, das die Prämisse einer Nummer ist; das Misslingen, zum Lachen zu bringen; und der Flop, den der Clown bemerkt und wieder einbaut. Die Skala sollte festhalten, welche Art vorlag — sonst verbirgt sie genau das Gleiten zwischen ihnen, in dem nach ihrer Darstellung die Ausbildung stattfindet.'
    }
  },
  {
    id: 'lecoq',
    status: 'verified',
    locus: 'concept · studio',
    work: 'Jacques Lecoq, Le Corps Poétique (1997) / The Moving Body, 154 and 159',
    phrase: {
      en: 'Movement analysis and observed behaviour',
      bg: 'Анализ на движението и наблюдавано поведение',
      de: 'Bewegungsanalyse und beobachtetes Verhalten'
    },
    gloss: {
      en: 'Two of the five unnamed lineages are both Lecoq: *tout bouge* and the observation practice the field protocol prescribes. He also supplies the route — the clown is not reached except through the neutral mask, which is what movement 1 is in all but name. Two cautions, from Amsden. Lecoq wrote *little* on clown and wrote it abstractly, so the lineage is real but thin on the page. And his clown work was a tool for the freedom of actors, not training for clown performers. What is citable is precise: the search for one’s own clown as a fundamental principle, and his instruction to be oneself as profoundly as possible and observe the effect one has on the audience. Davison contests the premise itself — see [[authenticity-effect]].',
      bg: 'Две от петте неназовани традиции са и двете на Льокок: *tout bouge* и практиката на наблюдение, която полевият протокол предписва. Той дава и пътя — до клоуна се стига само през неутралната маска, каквото по същество е движение 1. Две предупреждения, от Амсдън. Льокок е писал *малко* за клоуна и то абстрактно, тъй че традицията е истинска, но тънка на хартия. А работата му с клоуна е била средство за свободата на актьора, не обучение за клоуни. Цитируемото е точно: търсенето на собствения клоун като основен принцип и указанието му да бъдеш себе си възможно най-дълбоко и да наблюдаваш ефекта, който имаш върху публиката. Дейвисън оспорва самата предпоставка — виж [[authenticity-effect]].',
      de: 'Zwei der fünf unbenannten Linien sind beide Lecoq: *tout bouge* und die Beobachtungspraxis, die das Feldprotokoll vorschreibt. Er liefert auch den Weg — zum Clown gelangt man nur durch die neutrale Maske, was Bewegung 1 der Sache nach ist. Zwei Vorbehalte, von Amsden. Lecoq schrieb *wenig* über den Clown und schrieb es abstrakt, die Linie ist also echt, aber dünn auf dem Papier. Und seine Clown-Arbeit war ein Mittel zur Freiheit der Schauspielenden, keine Ausbildung für Clowns. Zitierbar ist Genaues: die Suche nach dem eigenen Clown als Grundprinzip und seine Anweisung, so tief wie möglich man selbst zu sein und die Wirkung zu beobachten, die man auf das Publikum hat. Davison bestreitet die Prämisse selbst — siehe [[authenticity-effect]].'
    }
  },
  {
    id: 'complicity',
    status: 'verified',
    locus: 'concept · audience',
    work: 'Philippe Gaulier, Le Gégèneur / The Tormentor (2007), 204–205, glossing Le Robert; Murray and Keefe, Physical Theatres (2007), 146',
    phrase: {
      en: 'Complicity',
      bg: 'Съучастие',
      de: 'Komplizenschaft'
    },
    gloss: {
      en: 'Gaulier reaches for a dictionary: complicity is a profound understanding between people, *spontaneous and often unexpressed*. Murray and Keefe report that *complicité* has no immediate translation. The unexpressed part is the argument for this solo’s silence — complicity is already a wordless channel, so an hour without language is not working against its medium but inside the one complicity uses. Its companion term is *disponibilité*, the state of being ready for play, which is Winnicott’s floundering arrived at from the studio rather than the clinic.',
      bg: 'Голие посяга към речника: съучастието е дълбоко разбирателство между хора, *спонтанно и често неизказано*. Мъри и Кийф отбелязват, че *complicité* няма непосредствен превод. Неизказаното е доводът за мълчанието на това соло — съучастието вече е безсловесен канал, тъй че час без език не работи срещу средата си, а вътре в онази, която съучастието използва. Сродното понятие е *disponibilité*, готовността за игра, което е лутането на Уиникът, стигнато от студиото, а не от кабинета.',
      de: 'Gaulier greift zum Wörterbuch: Komplizenschaft ist ein tiefes Einverständnis zwischen Menschen, *spontan und oft unausgesprochen*. Murray und Keefe halten fest, dass *complicité* keine unmittelbare Übersetzung hat. Das Unausgesprochene ist das Argument für das Schweigen dieses Solos — Komplizenschaft ist bereits ein wortloser Kanal, eine Stunde ohne Sprache arbeitet also nicht gegen ihr Medium, sondern in dem, das die Komplizenschaft ohnehin benutzt. Ihr Schwesterbegriff ist *disponibilité*, die Bereitschaft zum Spiel, also Winnicotts Treiben, vom Studio her erreicht statt aus der Praxis.'
    }
  },
  {
    id: 'laughter-echo',
    status: 'verified',
    locus: 'concept · audience',
    work: 'Henri Bergson, Le Rire (1900), I.i',
    phrase: {
      en: 'Laughter needs an echo',
      bg: 'Смехът се нуждае от ехо',
      de: 'Das Lachen braucht ein Echo'
    },
    gloss: {
      en: 'Bergson’s condition for the comic: you would hardly appreciate it if you felt yourself isolated from others, and laughter reverberates inside a circle that stays closed. Read straight, it turns every laugh in the room into evidence that the people in it are not alone — produced on cue by a figure claiming to be exactly that. The load-bearing claim of the concept, arriving from a source with no interest in the project, and the reason [[complicity]] is a condition of the piece rather than a technique inside it.',
      bg: 'Условието на Бергсон за комичното: човек трудно би го оценил, ако се чувства откъснат от другите, а смехът отеква в кръг, който остава затворен. Прочетено буквално, това превръща всеки смях в залата в доказателство, че хората в нея не са сами — предизвикано по знак от фигура, която твърди точно обратното. Носещото твърдение на концепцията, дошло от източник без интерес към проекта, и причината [[complicity]] да е условие на представлението, а не похват вътре в него.',
      de: 'Bergsons Bedingung für das Komische: Man würde es kaum empfinden, fühlte man sich von den anderen abgeschnitten, und das Lachen hallt in einem Kreis wider, der geschlossen bleibt. Wörtlich gelesen macht das jedes Lachen im Raum zum Beleg dafür, dass die Anwesenden nicht allein sind — auf Stichwort hervorgerufen von einer Figur, die genau das Gegenteil behauptet. Die tragende Behauptung des Konzepts, aus einer Quelle ohne Interesse am Projekt, und der Grund, warum [[complicity]] eine Bedingung des Stücks ist und kein Mittel darin.'
    }
  },
  {
    id: 'insensibility',
    status: 'verified',
    locus: 'concept · dramaturgy · 4',
    work: 'Henri Bergson, Le Rire (1900), I.i and III',
    phrase: {
      en: 'Insensibility in the spectator',
      bg: 'Безчувственост у зрителя',
      de: 'Unempfindlichkeit beim Zuschauer'
    },
    gloss: {
      en: 'Bergson’s two essential conditions for the comic are unsociability in the performer and insensibility in the spectator: laughter, he writes, has no greater foe than emotion. Recorded here because it is the strongest argument against the central question as it stands — if the room must set feeling aside in order to laugh, it cannot laugh and undergo solitude in the same instant. [[flop]] answers it in sequence rather than simultaneity: the collapse takes the laugh under Bergson’s condition, and the look up afterwards re-admits what the laugh suspended. Which is why the registering comes after the collapse and never during.',
      bg: 'Двете съществени условия на Бергсон за комичното са необщителност у изпълнителя и безчувственост у зрителя: смехът, пише той, няма по-голям враг от чувството. Записано тук, защото е най-силният довод срещу централния въпрос така, както стои — ако залата трябва да остави чувството настрана, за да се смее, тя не може да се смее и да преживява уединението в един и същи миг. [[flop]] отговаря последователно, а не едновременно: рухването взема смеха при условието на Бергсон, а вдигнатият след това поглед връща онова, което смехът е спрял. Затова осъзнаването идва след рухването, а никога по време на него.',
      de: 'Bergsons zwei wesentliche Bedingungen des Komischen sind Ungeselligkeit bei der Spielerin und Unempfindlichkeit beim Zuschauer: Das Lachen, schreibt er, hat keinen größeren Feind als das Gefühl. Hier festgehalten, weil es das stärkste Argument gegen die zentrale Frage in ihrer jetzigen Fassung ist — muss der Raum das Fühlen beiseitelegen, um zu lachen, kann er nicht im selben Augenblick lachen und Alleinsein erfahren. [[flop]] beantwortet das nacheinander statt gleichzeitig: Der Zusammenbruch nimmt das Lachen unter Bergsons Bedingung, und der Blick danach lässt wieder zu, was das Lachen ausgesetzt hat. Darum kommt das Bemerken nach dem Zusammenbruch und nie währenddessen.'
    }
  },
  {
    id: 'unconscious',
    status: 'verified',
    locus: 'studio · two-and-two · dramaturgy · 4',
    work: 'Henri Bergson, Le Rire (1900), I.iv',
    phrase: {
      en: 'The comic person is unconscious',
      bg: 'Комичният човек е несъзнаващ',
      de: 'Der komische Mensch ist unbewusst'
    },
    gloss: {
      en: 'A character is comic in proportion to his ignorance of himself, Bergson writes: invisible to himself while remaining visible to everyone else, and a ridiculous defect that *feels* itself to be ridiculous starts at once to correct itself. That is the source the material research needed and did not have. The division of knowledge — the performer knows where the join is, the clown must not — is not a rehearsal convenience but the condition of the comic. It also sets Bergson against [[flop]]: for Gaulier the registering *is* the comic moment, and for Bergson consciousness of the defect is what ends it. Sequence resolves it, as with [[insensibility]]: unconscious during the collapse, conscious only after, which is why the look up must never arrive during.',
      bg: 'Един герой е комичен в степента, в която не познава себе си, пише Бергсон: невидим за себе си, оставайки видим за всички останали, а смешният недостатък, който *усети*, че е смешен, веднага започва да се поправя. Това е източникът, от който изследването на материала се нуждаеше и нямаше. Разделението на знанието — изпълнителят знае къде е сглобката, клоунът не бива — не е репетиционно удобство, а условие на комичното. То също изправя Бергсон срещу [[flop]]: за Голие осъзнаването *е* комичният момент, а за Бергсон съзнанието за недостатъка е онова, което го прекратява. Последователността го решава, както при [[insensibility]]: несъзнаващ по време на рухването, осъзнаващ едва след него — затова вдигнатият поглед не бива да идва по време на.',
      de: 'Eine Figur ist komisch im Verhältnis zu ihrer Unkenntnis ihrer selbst, schreibt Bergson: sich selbst unsichtbar, während sie allen anderen sichtbar bleibt — und ein lächerlicher Fehler, der sich als lächerlich *empfindet*, beginnt sofort, sich zu korrigieren. Das ist die Quelle, die der Materialrecherche fehlte. Die Teilung des Wissens — die Spielerin weiß, wo die Naht sitzt, der Clown darf es nicht — ist keine Probenbequemlichkeit, sondern die Bedingung des Komischen. Sie stellt Bergson zugleich gegen [[flop]]: Für Gaulier *ist* das Bemerken der komische Moment, für Bergson beendet das Bewusstsein des Fehlers ihn. Die Abfolge löst das, wie bei [[insensibility]]: unbewusst während des Zusammenbruchs, bewusst erst danach — darum darf der Blick nie währenddessen kommen.'
    }
  },
  {
    id: 'authenticity-effect',
    status: 'verified',
    locus: 'concept · studio · two-and-two',
    work: 'Jon Davison, “The Phenomenology of Clown”, ClownBlog, 30 September 2008; Clown: Readings in Theatre Practice (Palgrave Macmillan, 2013)',
    phrase: {
      en: 'Authenticity as an effect',
      bg: 'Автентичността като ефект',
      de: 'Authentizität als Effekt'
    },
    gloss: {
      en: 'Davison refuses the premise most of this ledger leans on. Failure, he argues, does not uncover a truth beneath the veneer: it produces a theatrical truth-effect *like any other, from melodrama to naturalism*, and an audience reading spontaneity is reading a learnable technique. He also denies that clowning is understood through games with rules — the play frame [[playful-anarchy]] and [[complicity]] inherit — and holds that the clown can be reached without the nose. Recorded because it is the strongest live objection to this project’s method: the material research stakes the whole comedy on the conviction being real, and [[lecoq]] supplies the route to a clown of one’s own. If Davison is right, real is not the requirement; legible is. Whether that difference survives contact with an audience is a studio question, not a page one.',
      bg: 'Дейвисън отхвърля предпоставката, на която се опира по-голямата част от този регистър. Провалът, твърди той, не разкрива истина под лустрото: той произвежда театрален ефект на истина, *както всеки друг — от мелодрамата до натурализма*, а публиката, която разчита спонтанност, разчита изучима техника. Той отрича и че клоунадата се разбира през игри с правила — игровата рамка, която наследяват [[playful-anarchy]] и [[complicity]] — и смята, че до клоуна се стига и без носа. Записано, защото е най-силното живо възражение срещу метода на този проект: изследването на материала залага цялата комедия на това убеждението да е истинско, а [[lecoq]] дава пътя към собствен клоун. Ако Дейвисън е прав, изискването не е истинско, а четимо. Дали тази разлика оцелява при среща с публика, е въпрос на студиото, не на страницата.',
      de: 'Davison verweigert die Prämisse, auf die sich der größte Teil dieses Verzeichnisses stützt. Das Scheitern, argumentiert er, legt keine Wahrheit unter der Oberfläche frei: Es erzeugt einen theatralen Wahrheitseffekt *wie jeder andere, von der Melodramatik bis zum Naturalismus*, und ein Publikum, das Spontaneität liest, liest eine erlernbare Technik. Er bestreitet auch, dass Clownerie über Spiele mit Regeln zu verstehen sei — der Spielrahmen, den [[playful-anarchy]] und [[complicity]] erben — und hält den Clown auch ohne Nase für erreichbar. Festgehalten, weil es der stärkste lebende Einwand gegen die Methode dieses Projekts ist: Die Materialrecherche setzt die ganze Komik darauf, dass die Überzeugung echt ist, und [[lecoq]] liefert den Weg zum eigenen Clown. Hat Davison recht, ist nicht echt die Anforderung, sondern lesbar. Ob dieser Unterschied den Kontakt mit einem Publikum überlebt, ist eine Frage des Studios, nicht der Seite.'
    }
  },
  {
    id: 'decroux',
    status: 'verified',
    locus: 'concept',
    work: 'Étienne Decroux, Paroles sur le Mime (1963)',
    phrase: {
      en: 'Economy and stillness',
      bg: 'Икономия и неподвижност',
      de: 'Ökonomie und Stillstand'
    },
    gloss: {
      en: 'Corporeal mime applies the principles of drama to movement itself: pause, hesitation, weight, resistance, surprise. Decroux argued for banning speech from the theatre until the actor could work from the body — a larger version of this project’s wager.',
      bg: 'Телесният мим прилага принципите на драмата към самото движение: пауза, колебание, тежест, съпротива, изненада. Декру настоява речта да бъде изгонена от театъра, докато актьорът не може да работи от тялото — по-мащабна версия на облога на този проект.',
      de: 'Der körperliche Mime wendet die Prinzipien des Dramas auf die Bewegung selbst an: Pause, Zögern, Gewicht, Widerstand, Überraschung. Decroux forderte, die Sprache aus dem Theater zu verbannen, bis der Schauspieler vom Körper her arbeiten kann — eine größere Fassung der Wette dieses Projekts.'
    }
  },
  {
    id: 'final-exit',
    status: 'probable',
    locus: 'concept · 9',
    work: 'Martin Heidegger, Sein und Zeit (1927), §47',
    phrase: {
      en: 'The final exit',
      bg: 'Последният изход',
      de: 'Der letzte Ausgang'
    },
    gloss: {
      en: '“Some thresholds cannot be crossed by another person” matches death as one’s ownmost, non-relational possibility. Marked probable because mode 9 immediately argues against it: vigils, farewells and audiences form communities around the passage. If Heidegger is the reference, saying so makes mode 9 an argument rather than an echo.',
      bg: '„Някои прагове не могат да бъдат прекрачени от друг“ съвпада със смъртта като най-собствена, безотносителна възможност. Отбелязано като вероятно, защото режим 9 веднага спори с него: бденията, сбогуванията и публиките образуват общности около прехода. Ако Хайдегер е отправната точка, назоваването ѝ прави режим 9 аргумент, а не отглас.',
      de: '„Manche Schwellen kann kein anderer überschreiten“ entspricht dem Tod als eigenster, unbezüglicher Möglichkeit. Als wahrscheinlich markiert, weil Modus 9 sofort widerspricht: Totenwachen, Abschiede und Publikum bilden Gemeinschaften um den Übergang. Ist Heidegger der Bezug, wird Modus 9 durch das Benennen zum Argument statt zum Echo.'
    }
  },
  {
    id: 'playful-anarchy',
    status: 'chosen',
    locus: 'concept · studio',
    work: 'Pascal Jacob, « L’Auguste », BnF / Centre national des arts du cirque; Klara Van Wyk, The Whiteface and the Auguste, MA dissertation, University of Cape Town (2015)',
    phrase: {
      en: 'Playful anarchy',
      bg: 'Игрова анархия',
      de: 'Spielerische Anarchie'
    },
    gloss: {
      en: 'The auguste, decided 25 August 2026. The BnF characterisation carries the register exactly: candour and naivety mingled with “a playful instinct and a liking for dissimulation with no consequences” (Jacob, “L’Auguste”, unpaginated). Bouffon was ruled out — it works in a gang and mocks the audience. One adjustment the tradition forces: the classical auguste is the *recipient* of the comic doings, subordinate to a whiteface. In a solo there is no whiteface, so the room plays it — which movements 4 and 5 already do. Grock, an auguste who broke free of the pairing and carried the entrée into the theatre, is the precedent. The reading corrects that by half. Van Wyk, whose thesis is that clown theatre needs the Whiteface for structure and the Auguste for spontaneity, describes her own *solo* work putting the two inside one performer as conceptual counterparts, and argues that where the Auguste is in charge a Whiteface supplying rules, tension and goals is essential. So the function splits rather than moving out: the room supplies the rule, which is what movement 5 is, and the performer supplies the aspiration to elegance and the collapse out of it. That is [[two-in-one]] again, reached from clown practice instead of philosophy.',
      bg: 'Огюстът, решено на 25 август 2026 г. Характеристиката на BnF предава регистъра точно: прямота и наивност, смесени с „игрови инстинкт и склонност към безобидна прикритост“ (Жакоб, „L’Auguste“, без пагинация). Буфонът отпадна — той действа на група и се подиграва на публиката. Една поправка, която традицията налага: класическият огюст е *получателят* на комичното действие, подчинен на белия клоун. В соло няма бял клоун, затова стаята поема ролята — което движения 4 и 5 вече правят. Грок, огюст, който се освобождава от двойката и пренася антрето в театъра, е прецедентът. Прочетеното поправя това наполовина. Ван Вайк, чиято теза е, че клоунският театър се нуждае от белия клоун за структура и от огюста за спонтанност, описва собствената си *солова* работа, в която двамата са вътре в един изпълнител като понятийни съответствия, и твърди, че там, където огюстът води, е необходим бял клоун, който доставя правила, напрежение и цели. Значи функцията се разделя, а не се изнася: стаята доставя правилото, каквото е движение 5, а изпълнителят доставя стремежа към изящество и рухването от него. Това е [[two-in-one]] отново, стигнато от клоунската практика, а не от философията.',
      de: 'Der Auguste, entschieden am 25. August 2026. Die Charakterisierung der BnF trifft das Register genau: Aufrichtigkeit und Naivität, vermischt mit „einem Spieltrieb und einer Neigung zur folgenlosen Verstellung“ (Jacob, „L’Auguste“, ohne Paginierung). Bouffon scheidet aus — er arbeitet in der Gruppe und verspottet das Publikum. Eine Korrektur, die die Tradition erzwingt: Der klassische Auguste ist der *Empfänger* des komischen Geschehens, dem Weißclown untergeordnet. Im Solo gibt es keinen Weißclown, also übernimmt der Raum die Rolle — was die Bewegungen 4 und 5 bereits tun. Grock, ein Auguste, der sich aus dem Paar löste und die Entrée ins Theater trug, ist der Präzedenzfall. Die Lektüre korrigiert das zur Hälfte. Van Wyk, deren These lautet, dass Clown-Theater den Weißclown für die Struktur und den Auguste für die Spontaneität braucht, beschreibt ihre eigene *Solo*-Arbeit, in der beide als begriffliche Gegenstücke in einer Spielerin liegen, und argumentiert, dass dort, wo der Auguste führt, ein Weißclown mit Regeln, Spannung und Zielen unerlässlich ist. Die Funktion spaltet sich also, statt auszuwandern: Der Raum liefert die Regel, was Bewegung 5 ist, und die Spielerin liefert das Streben nach Eleganz und den Absturz daraus. Das ist wieder [[two-in-one]], von der Clown-Praxis her erreicht statt von der Philosophie.'
    }
  },
  {
    id: 'training-paradox',
    status: 'verified',
    locus: 'concept · audience · studio',
    work: 'Laura Purcell Gates, “Locating the self: narratives and practices of authenticity in French clown training”, Theatre, Dance and Performance Training 2:2 (2011), 231–242',
    ref: '10.1080/19443927.2011.553239',
    phrase: {
      en: 'Failing in order to succeed',
      bg: 'Да се провалиш, за да успееш',
      de: 'Scheitern, um zu gelingen'
    },
    gloss: {
      en: 'The article the flop paradox is quoted from, and the study of the thing [[authenticity-effect]] says is an effect: narratives and practices of *authenticity* in French clown training. Her definition is the one [[flop]] rests on — before an audience the flop is a rehearsed mistake, in the classroom it is genuine, and the student cannot always tell which one is happening.',
      bg: 'Статията, от която е цитиран парадоксът на флопа, и изследването на онова, което [[authenticity-effect]] нарича ефект: разкази и практики на *автентичност* във френското клоунско обучение. Нейното определение е онова, върху което стъпва [[flop]] — пред публика флопът е репетирана грешка, в клас е истински, а ученикът не винаги различава кое от двете се случва.',
      de: 'Der Aufsatz, aus dem die Flop-Paradoxie zitiert ist, und die Untersuchung dessen, was [[authenticity-effect]] einen Effekt nennt: Erzählungen und Praktiken der *Authentizität* in der französischen Clownausbildung. Ihre Definition trägt [[flop]] — vor Publikum ist der Flop ein geprobter Fehler, im Unterricht ein echter, und die Lernende kann nicht immer sagen, welcher gerade geschieht.'
    }
  },
  {
    id: 'shared-floor',
    status: 'verified',
    locus: 'dramaturgy · 4 · studio',
    work: 'Vincent Laughery, « L’écoute et la chute », Fabula, Lieu(x) commun(s) (2022)',
    phrase: {
      en: 'The shared floor',
      bg: 'Споделеният под',
      de: 'Der geteilte Boden'
    },
    gloss: {
      en: 'The fall does not lower the performer beneath the room; it puts them on a floor the room is already standing on. That is the same move the material research makes when the collapse of a proof exposes what everybody present already knows, and it is why [[flop]] produces company rather than pity.',
      bg: 'Падането не смъква изпълнителя под залата; поставя го на под, върху който залата вече стои. Това е същият ход, който прави изследването на материала, когато рухването на едно доказателство разкрива онова, което всички присъстващи вече знаят, и затова [[flop]] произвежда компания, а не съжаление.',
      de: 'Der Fall senkt die Spielende nicht unter den Raum; er stellt sie auf einen Boden, auf dem der Raum ohnehin steht. Das ist derselbe Zug, den die Materialrecherche macht, wenn der Zusammenbruch eines Beweises freilegt, was alle Anwesenden längst wissen — und darum erzeugt [[flop]] Gesellschaft statt Mitleid.'
    }
  },
  {
    id: 'grock',
    status: 'verified',
    locus: 'concept · studio',
    work: 'Grock, Life’s a Lark (Heinemann, 1931; tr. Madge Pemberton from Ich lebe gern!)',
    phrase: {
      en: 'The auguste who left the pairing',
      bg: 'Огюстът, който напусна двойката',
      de: 'Der Auguste, der das Paar verließ'
    },
    gloss: {
      en: 'The precedent [[playful-anarchy]] leans on, and the reason a solo auguste is not a contradiction in terms: he broke free of the whiteface pairing and carried the entrée into the theatre. What the autobiography supplies is the fact of it, not a method — the case is precedent, not instruction.',
      bg: 'Прецедентът, на който се опира [[playful-anarchy]], и причината соловият огюст да не е противоречие: той се освобождава от двойката с белия клоун и пренася антрето в театъра. Автобиографията дава факта, а не метод — случаят е прецедент, не указание.',
      de: 'Der Präzedenzfall, auf den sich [[playful-anarchy]] stützt, und der Grund, warum ein Solo-Auguste kein Widerspruch ist: Er löste sich aus dem Paar mit dem Weißclown und trug die Entrée ins Theater. Die Autobiografie liefert die Tatsache, keine Methode — der Fall ist Präzedenz, keine Anweisung.'
    }
  },
  {
    id: 'two-and-two',
    status: 'verified',
    locus: 'studio · two-and-two',
    work: 'George Orwell, Nineteen Eighty-Four (Secker & Warburg, 1949)',
    phrase: {
      en: 'Two and two make five',
      bg: 'Две и две правят пет',
      de: 'Zwei und zwei macht fünf'
    },
    gloss: {
      en: 'The phrase is Orwell’s, and the material research borrows it without the novel’s meaning: there it is assent extracted by force, here it is a private conviction met with complicity. Recorded so the borrowing is visible — the worked example turns on the same four characters carrying terror in one room and comedy in another, which only reads as an argument if the first room is named.',
      bg: 'Изразът е на Оруел и изследването на материала го заема без значението на романа: там е съгласие, изтръгнато със сила, тук е лично убеждение, посрещнато със съучастие. Записано, за да е видимо заемането — работният пример се върти около същите четири знака, които носят терор в едната стая и комедия в другата, а това звучи като довод само ако първата стая е назована.',
      de: 'Die Formel ist Orwells, und die Materialrecherche entleiht sie ohne die Bedeutung des Romans: dort ist sie erzwungene Zustimmung, hier eine private Überzeugung, der Komplizenschaft begegnet. Festgehalten, damit die Anleihe sichtbar ist — das durchgespielte Beispiel dreht sich um dieselben vier Zeichen, die im einen Raum Terror und im anderen Komik tragen, was nur dann ein Argument ergibt, wenn der erste Raum benannt wird.'
    }
  },
  {
    id: 'whiteface-split',
    status: 'verified',
    locus: 'concept · dramaturgy · 5 · 6',
    work: 'Klara Van Wyk, The Whiteface and the Auguste: The Integration of Structure and Spontaneity in Contemporary Clown Theatre Performance, MA dissertation, University of Cape Town (2015)',
    phrase: {
      en: 'The whiteface a solo keeps',
      bg: 'Белият клоун, който солото запазва',
      de: 'Der Weißclown, den ein Solo behält'
    },
    gloss: {
      en: 'Clown theatre needs the Whiteface for structure and the Auguste for spontaneity, and the Auguste has come to stand for *clown* so completely that the structural half goes unexamined. On her own solo work she puts the two inside one performer as conceptual counterparts, and argues that where the Auguste is in charge a Whiteface supplying rules, tension and goals is essential. That is why [[playful-anarchy]] does not hand the function to the furniture alone: the room supplies the rule, the performer supplies the aspiration and the collapse out of it, which is [[two-in-one]] reached from clown practice instead of philosophy.',
      bg: 'Клоунският театър се нуждае от белия клоун за структура и от огюста за спонтанност, а огюстът е започнал да означава *клоун* толкова пълно, че структурната половина остава неразгледана. В собствената си солова работа тя поставя двамата вътре в един изпълнител като понятийни съответствия и твърди, че там, където огюстът води, е необходим бял клоун, който доставя правила, напрежение и цели. Затова [[playful-anarchy]] не предава функцията само на мебелите: стаята доставя правилото, изпълнителят — стремежа и рухването от него, което е [[two-in-one]], стигнато от клоунската практика, а не от философията.',
      de: 'Clown-Theater braucht den Weißclown für die Struktur und den Auguste für die Spontaneität, und der Auguste ist so vollständig für *Clown* eingetreten, dass die strukturelle Hälfte unbefragt bleibt. In ihrer eigenen Solo-Arbeit legt sie beide als begriffliche Gegenstücke in eine Spielerin und argumentiert, dass dort, wo der Auguste führt, ein Weißclown mit Regeln, Spannung und Zielen unerlässlich ist. Darum übergibt [[playful-anarchy]] die Funktion nicht allein den Möbeln: Der Raum liefert die Regel, die Spielerin das Streben und den Absturz daraus — das ist [[two-in-one]], von der Clown-Praxis her erreicht statt von der Philosophie.'
    }
  },
  {
    id: 'emptied-room',
    status: 'probable',
    locus: 'concept · 8',
    work: 'Simone Weil, La pesanteur et la grâce (Plon, 1947); Emily Dickinson, “I heard a Fly buzz — when I died” (J465 / F591)',
    phrase: {
      en: 'The emptied room',
      bg: 'Изпразнената стая',
      de: 'Der geleerte Raum'
    },
    gloss: {
      en: 'Two claims, two sources. The practice is Weil’s *décréation* — “to make something created pass into the uncreated” — which she separates carefully from destruction, “to make something created pass into nothingness”, and calls that a blameworthy substitute. So loosening the self and annihilating it are different operations, and she names the failure mode. *Rather than consoling it* is a live argument rather than a phrase: Merton’s contemplative solitude seeks and communes with the true self, while anattā frees one from the demand to be somebody permanent. Mode 8 has already taken the second side. And the fly is almost certainly Dickinson’s, which builds the whole nineteenth-century deathbed — the watchers, the willed keepsakes, the expected arrival — and substitutes a housefly whose buzz comes between the speaker and the light. Marked probable, not chosen: the reading is close, and the decision is the project’s to confirm.',
      bg: 'Две твърдения, два източника. Практиката е *décréation* на Вейл — „да направиш сътвореното да премине в несътвореното“ — което тя внимателно отделя от разрушението, „да направиш сътвореното да премине в нищото“, и нарича последното укоримо подобие. Тъй че отпускането на аза и унищожаването му са различни действия, а тя назовава провала. *Вместо да го утешаваш* е жив спор, а не фраза: съзерцателната самота на Мертън търси истинския аз и общува с него, докато анатта освобождава от изискването да бъдеш някой постоянен. Режим 8 вече е избрал втората страна. А мухата почти сигурно е на Дикинсън — стихотворението изгражда целия деветнадесетовековен смъртен одър: свидетелите, завещаните вещи, очакваното пришествие — и подменя всичко това с домашна муха, чието бръмчене застава между говорещата и светлината. Отбелязано като вероятно, не като избрано: прочитът е близък, а решението принадлежи на проекта.',
      de: 'Zwei Behauptungen, zwei Quellen. Die Praxis ist Weils *décréation* — „etwas Geschaffenes ins Ungeschaffene übergehen lassen“ — das sie sorgfältig von der Zerstörung trennt, „etwas Geschaffenes ins Nichts übergehen lassen“, und diese einen tadelnswerten Ersatz nennt. Das Lockern des Selbst und seine Vernichtung sind also verschiedene Vorgänge, und sie benennt die Fehlform. *Statt es zu trösten* ist ein lebendiger Streit und keine Wendung: Mertons kontemplative Einsamkeit sucht das wahre Selbst und verkehrt mit ihm, während anattā von der Forderung befreit, jemand Dauerhaftes zu sein. Modus 8 hat die zweite Seite bereits gewählt. Und die Fliege ist fast sicher Dickinsons: Das Gedicht baut das ganze Sterbebett des neunzehnten Jahrhunderts auf — die Wachenden, die vermachten Andenken, die erwartete Ankunft — und setzt an seine Stelle eine Stubenfliege, deren Summen zwischen die Sprecherin und das Licht tritt. Als wahrscheinlich markiert, nicht als gewählt: die Lesart ist nah, die Entscheidung gehört dem Projekt.'
    }
  }
]

const facets: Record<string, Facets> = {
  'unconscious': {
    statement: {
      en: 'A comic character is comic in proportion to his ignorance of himself — invisible to himself, visible to everyone else',
      bg: 'Комичният герой е комичен в степента, в която не познава себе си — невидим за себе си, видим за всички останали',
      de: 'Eine komische Figur ist komisch im Verhältnis zu ihrer Unkenntnis ihrer selbst — sich selbst unsichtbar, allen anderen sichtbar'
    },
    paradox: {
      en: 'The clown must not know what the performer knows: consciousness of the defect is what ends the comedy of it',
      bg: 'Клоунът не бива да знае онова, което изпълнителят знае: съзнанието за недостатъка е онова, което прекратява комизма му',
      de: 'Der Clown darf nicht wissen, was die Spielerin weiß: das Bewusstsein des Fehlers beendet seine Komik'
    }
  },
  'back-shop': {
    paradox: {
      en: 'The room kept wholly one’s own stays furnished with borrowed language and absent people',
      bg: 'Стаята, запазена изцяло за себе си, остава обзаведена със заета реч и отсъстващи хора',
      de: 'Der ganz eigene Raum bleibt mit geliehener Sprache und abwesenden Menschen möbliert'
    }
  },
  'capacity': {
    statement: {
      en: 'The capacity to be alone is *built* by a present, undemanding witness — and that witness may be a cot, a pram, or the atmosphere of the room',
      bg: 'Способността да си сам се **изгражда** от присъстващ, непретенциозен свидетел — а свидетелят може да бъде люлка, количка или атмосферата на стаята',
      de: 'Die Fähigkeit zum Alleinsein wird von einem anwesenden, nicht fordernden Zeugen **aufgebaut** — und dieser Zeuge kann ein Bettchen, ein Kinderwagen oder die Atmosphäre des Raums sein'
    },
    paradox: {
      en: 'The capacity to be alone is founded on having been alone in the presence of someone',
      bg: 'Способността да си сам се гради върху това да си бил сам в присъствието на някого',
      de: 'Die Fähigkeit zum Alleinsein gründet darauf, in Anwesenheit eines anderen allein gewesen zu sein'
    }
  },
  'flop': {
    statement: {
      en: 'A flop is not a property of the material: the same show was the funniest thing the company had seen one night and drove the audience out furious the next',
      bg: 'Флопът не е свойство на материала: същото представление е най-смешното, което трупата е виждала, в една вечер, и изгонва публиката вбесена в следващата',
      de: 'Ein Flop ist keine Eigenschaft des Materials: dieselbe Aufführung war an einem Abend das Komischste, was die Kompanie gesehen hatte, und trieb das Publikum am nächsten wütend hinaus'
    }
  },
  'insensibility': {
    paradox: {
      en: 'To laugh, the spectator must set feeling aside — and this piece wants the feeling',
      bg: 'За да се смее, зрителят трябва да остави чувството настрана — а това представление иска чувството',
      de: 'Um zu lachen, muss der Zuschauer das Fühlen beiseitelegen — und dieses Stück will das Fühlen'
    }
  },
  'laughter-echo': {
    paradox: {
      en: 'Laughter needs an echo, so a room laughing at solitude is a room disproving it',
      bg: 'Смехът се нуждае от ехо, тъй че зала, която се смее на уединението, е зала, която го опровергава',
      de: 'Das Lachen braucht ein Echo, also widerlegt ein Raum, der über Alleinsein lacht, es gerade'
    }
  },
  'lecoq': {
    statement: {
      en: 'Be yourself as profoundly as you can, *and observe the effect you have on the audience* — the self is read through its effect',
      bg: 'Бъди себе си възможно най-дълбоко **и наблюдавай ефекта, който имаш върху публиката** — азът се чете през своя ефект',
      de: 'Sei so tief wie möglich du selbst **und beobachte die Wirkung, die du auf das Publikum hast** — das Selbst wird an seiner Wirkung gelesen'
    }
  },
  'playful-anarchy': {
    statement: {
      en: 'Two and two make five is a private rule, or terror, or comedy, decided only by who is in the room',
      bg: 'Две и две правят пет е лично правило, или терор, или комедия — решава единствено кой е в залата',
      de: 'Zwei und zwei macht fünf ist eine private Regel, oder Terror, oder Komik — entschieden allein davon, wer im Raum ist'
    }
  },
  'shared-floor': {
    statement: {
      en: 'In the fall the performer reaches a floor shared with the public',
      bg: 'В падането изпълнителят достига под, споделен с публиката',
      de: 'Im Fall erreicht die Spielende einen mit dem Publikum geteilten Boden'
    }
  },
  'training-paradox': {
    paradox: {
      en: 'To make an audience laugh, the clown must repeatedly fail to make them laugh',
      bg: 'За да разсмее публиката, клоунът трябва многократно да не успее да я разсмее',
      de: 'Um ein Publikum zum Lachen zu bringen, muss der Clown wiederholt daran scheitern'
    }
  },
  'two-in-one': {
    statement: {
      en: 'Solitude splits the self in two; only other people make it one again, because identity is confirmed only from outside',
      bg: 'Самотата разделя аза на две; само другите го правят отново един, защото идентичността се потвърждава само отвън',
      de: 'Einsamkeit spaltet das Selbst in zwei; erst andere machen es wieder eins, denn Identität wird nur von außen bestätigt'
    },
    paradox: {
      en: 'Solitude is being two; loneliness is being one',
      bg: 'Самотата е да си двама; самотността е да си един',
      de: 'Einsamkeit heißt zwei zu sein; Verlassenheit heißt eins zu sein'
    }
  }
}

const own: OwnParadox[] = [
  {
    where: {
      en: 'The project’s own, in the concept',
      bg: 'Собствен на проекта, в концепцията',
      de: 'Eigen, im Konzept'
    },
    claim: {
      en: 'The clown cannot be alone while the audience is present, and cannot perform without them',
      bg: 'Клоунът не може да бъде сам, докато публиката присъства, и не може да играе без нея',
      de: 'Der Clown kann nicht allein sein, solange das Publikum da ist, und ohne es nicht spielen'
    }
  },
  {
    where: {
      en: 'The project’s own, in the concept',
      bg: 'Собствен на проекта, в концепцията',
      de: 'Eigen, im Konzept'
    },
    claim: {
      en: 'Language is a technology of company, so a wordless performance begins inside the condition it investigates',
      bg: 'Езикът е технология на общността, затова безсловесното представление започва вътре в състоянието, което изследва',
      de: 'Sprache ist eine Technik der Gesellschaft, also beginnt ein wortloses Stück im Zustand, den es untersucht'
    }
  },
  {
    where: {
      en: 'The project’s own, in the material research',
      bg: 'Собствен на проекта, в изследването на материала',
      de: 'Eigen, in der Materialrecherche'
    },
    claim: {
      en: 'Two and two make five: false in arithmetic, performable by an auguste, and violence in Orwell’s hands',
      bg: 'Две и две правят пет: невярно в аритметиката, изиграемо от огюст и насилие в ръцете на Оруел',
      de: 'Zwei und zwei macht fünf: falsch in der Arithmetik, spielbar für einen Auguste, Gewalt in Orwells Händen'
    }
  }
]

/**
 * The relations, as data rather than as prose. A gloss can still name another
 * record with [[id]]; these are the edges the matrix draws and the reason the
 * page can show what argues with what without anyone maintaining a list.
 */
const edges: Edge[] = [
  { from: 'flop', to: 'training-paradox', kind: 'cites' },
  { from: 'flop', to: 'lecoq', kind: 'cites' },
  { from: 'training-paradox', to: 'authenticity-effect', kind: 'contests' },
  { from: 'authenticity-effect', to: 'lecoq', kind: 'contests' },
  { from: 'authenticity-effect', to: 'flop', kind: 'contests' },
  { from: 'authenticity-effect', to: 'playful-anarchy', kind: 'contests' },
  { from: 'authenticity-effect', to: 'complicity', kind: 'contests' },
  { from: 'insensibility', to: 'laughter-echo', kind: 'contests' },
  { from: 'unconscious', to: 'flop', kind: 'contests' },
  { from: 'unconscious', to: 'insensibility', kind: 'converges' },
  { from: 'laughter-echo', to: 'complicity', kind: 'supports' },
  { from: 'insensibility', to: 'flop', kind: 'supports' },
  { from: 'capacity', to: 'complicity', kind: 'converges' },
  { from: 'two-in-one', to: 'playful-anarchy', kind: 'converges' },
  { from: 'shared-floor', to: 'flop', kind: 'converges' },
  { from: 'playful-anarchy', to: 'grock', kind: 'cites' },
  { from: 'playful-anarchy', to: 'two-and-two', kind: 'cites' },
  { from: 'three-terms', to: 'two-in-one', kind: 'supports' },
  { from: 'back-shop', to: 'capacity', kind: 'converges' },
  { from: 'alone-together', to: 'three-terms', kind: 'supports' },
  { from: 'decroux', to: 'complicity', kind: 'supports' },
  { from: 'final-exit', to: 'three-terms', kind: 'converges' },
  { from: 'emptied-room', to: 'back-shop', kind: 'converges' }
]

/**
 * A content address per record, folded to one receipt for the whole ledger.
 * Deterministic: the same records always give the same value, and any edit --
 * including to a single translation -- moves it. It is a fingerprint, not a
 * signature: it proves nothing about who wrote a record, only that a published
 * page and a local checkout are carrying the same one.
 */
function address(value: unknown): string {
  const canonical = (v: unknown): string =>
    Array.isArray(v)
      ? `[${v.map(canonical).join(',')}]`
      : v && typeof v === 'object'
        ? `{${Object.keys(v as object).sort().map((k) => `${k}:${canonical((v as any)[k])}`).join(',')}}`
        : JSON.stringify(v ?? null)
  return createHash('sha256').update(canonical(value)).digest('hex').slice(0, 12)
}

/**
 * The order the documentation needs, with the reason for each seat. A seat can
 * hold more than one record -- Arendt is two books, Bergson is one book read
 * twice -- so the sequence is its own list rather than a number on a record.
 */
const reading: Seat[] = [
  {
    records: ['two-in-one', 'three-terms'],
    note: {
      en: 'Arendt, *The Life of the Mind*, and the closing chapter of *The Origins of Totalitarianism* — two modes and one movement',
      bg: 'Аренд, *Животът на духа*, и последната глава на *Тоталитаризмът* — два режима и едно движение',
      de: 'Arendt, *Vom Leben des Geistes*, und das Schlusskapitel von *Elemente und Ursprünge totaler Herrschaft* — zwei Modi und eine Bewegung'
    }
  },
  {
    records: ['capacity'],
    note: {
      en: 'Winnicott, “The Capacity to be Alone” — five pages, and the load-bearing claim',
      bg: 'Уиникът, „Способността да бъдеш сам“ — пет страници и носещото твърдение',
      de: 'Winnicott, „The Capacity to be Alone“ — fünf Seiten und die tragende Behauptung'
    }
  },
  {
    records: ['laughter-echo', 'insensibility', 'unconscious'],
    note: {
      en: 'Bergson, *Le Rire* (1900) — public domain, and the only source here that both supports the concept and argues against it',
      bg: 'Бергсон, *Le Rire* (1900) — обществено достояние и единственият източник тук, който едновременно подкрепя концепцията и спори с нея',
      de: 'Bergson, *Le Rire* (1900) — gemeinfrei, und die einzige Quelle hier, die das Konzept zugleich stützt und ihm widerspricht'
    }
  },
  {
    records: ['lecoq'],
    note: {
      en: 'Lecoq, *Le Corps Poétique* — two of the five unnamed lineages at once',
      bg: 'Льокок, *Le Corps Poétique* — две от петте неназовани традиции наведнъж',
      de: 'Lecoq, *Le Corps Poétique* — zwei der fünf unbenannten Linien auf einmal'
    }
  },
  {
    records: ['back-shop'],
    note: {
      en: 'Montaigne, “De la solitude” — short, public domain, the source of a movement title',
      bg: 'Монтен, „За самотата“ — кратко, обществено достояние, източник на заглавие на движение',
      de: 'Montaigne, „De la solitude“ — kurz, gemeinfrei, Quelle eines Bewegungstitels'
    }
  },
  {
    records: ['flop', 'training-paradox'],
    note: {
      en: 'Amsden on the flop, and Purcell Gates on the training paradox',
      bg: 'Амсдън за флопа и Пърсел Гейтс за парадокса на обучението',
      de: 'Amsden über den Flop und Purcell Gates über die Paradoxie der Ausbildung'
    }
  },
  {
    records: ['alone-together'],
    note: {
      en: 'Turkle, *Alone Together* — the contemporary anchor',
      bg: 'Търкъл, *Alone Together* — съвременната опора',
      de: 'Turkle, *Alone Together* — der gegenwärtige Anker'
    }
  },
  {
    records: ['decroux'],
    note: {
      en: 'Decroux, *Paroles sur le Mime* — the argument for wordlessness',
      bg: 'Декру, *Paroles sur le Mime* — аргументът за безсловесността',
      de: 'Decroux, *Paroles sur le Mime* — das Argument für die Wortlosigkeit'
    }
  },
  {
    records: ['playful-anarchy'],
    note: {
      en: 'Pascal Jacob on the auguste, for the BnF and the CNAC — the chosen lineage',
      bg: 'Паскал Жакоб за огюста, за BnF и CNAC — избраната традиция',
      de: 'Pascal Jacob über den Auguste, für die BnF und das CNAC — die gewählte Linie'
    }
  },
  {
    records: ['whiteface-split'],
    note: {
      en: 'Van Wyk, *The Whiteface and the Auguste* (MA, Cape Town, 2015) — the half of the pairing a solo cannot simply drop',
      bg: 'Ван Вайк, *The Whiteface and the Auguste* (магистърска теза, Кейптаун, 2015) — половината от двойката, която солото не може просто да изостави',
      de: 'Van Wyk, *The Whiteface and the Auguste* (MA, Kapstadt, 2015) — die Hälfte des Paares, die ein Solo nicht einfach fallen lassen kann'
    }
  },
  {
    records: ['authenticity-effect'],
    note: {
      en: 'Davison, *Clown: Readings in Theatre Practice* (2013) — how recent the red nose is, and what choosing it signs',
      bg: 'Дейвисън, *Clown: Readings in Theatre Practice* (2013) — колко нов е червеният нос и какво подписва изборът му',
      de: 'Davison, *Clown: Readings in Theatre Practice* (2013) — wie jung die rote Nase ist und was ihre Wahl unterschreibt'
    }
  },
  {
    records: ['grock'],
    note: {
      en: 'Grock, *Life’s a Lark* (Heinemann, 1931; tr. Madge Pemberton from *Ich lebe gern!*) — the solo auguste who left the pairing behind',
      bg: 'Грок, *Life’s a Lark* (Heinemann, 1931; прев. Madge Pemberton от *Ich lebe gern!*) — соловият огюст, който напуска двойката',
      de: 'Grock, *Life’s a Lark* (Heinemann, 1931; übers. Madge Pemberton nach *Ich lebe gern!*) — der Solo-Auguste, der das Paar verließ'
    }
  },
  {
    records: ['shared-floor'],
    note: {
      en: 'Vincent Laughery, « L’écoute et la chute » (Fabula, *Lieu(x) commun(s)*, 2022) — the fall as a floor shared with the public',
      bg: 'Венсан Логери, « L’écoute et la chute » (Fabula, *Lieu(x) commun(s)*, 2022) — падането като под, споделен с публиката',
      de: 'Vincent Laughery, « L’écoute et la chute » (Fabula, *Lieu(x) commun(s)*, 2022) — der Fall als ein mit dem Publikum geteilter Boden'
    }
  }
]

const ui: Data['ui'] = {
  en: {
    statement: 'The statement it makes',
    paradox: 'The paradox that follows',
    relations: 'Stands to',
    order: 'Reading order',
    own: 'Paradoxes the project owns',
    receipt: 'Ledger receipt',
    kinds: { cites: 'cites', supports: 'supports', contests: 'contests', converges: 'converges with' },
    phrase: 'In the documentation',
    source: 'Drawing on',
    status: { verified: 'Verified', chosen: 'Chosen', probable: 'Probable', open: 'Open' },
    counts: {
      verified: { one: 'verified', many: 'verified' },
      chosen: { one: 'chosen', many: 'chosen' },
      probable: { one: 'probable', many: 'probable' },
      open: { one: 'open', many: 'open' }
    }
  },
  bg: {
    statement: 'Твърдението, което прави',
    paradox: 'Парадоксът, който следва',
    relations: 'Отнася се към',
    order: 'Ред на четене',
    own: 'Парадокси, които са на проекта',
    receipt: 'Отпечатък на регистъра',
    kinds: { cites: 'цитира', supports: 'подкрепя', contests: 'оспорва', converges: 'се схожда с' },
    phrase: 'В документацията',
    source: 'Опира се на',
    status: { verified: 'Потвърдено', chosen: 'Избрано', probable: 'Вероятно', open: 'Отворено' },
    counts: {
      verified: { one: 'потвърден', many: 'потвърдени' },
      chosen: { one: 'избран', many: 'избрани' },
      probable: { one: 'вероятен', many: 'вероятни' },
      open: { one: 'отворен', many: 'отворени' }
    }
  },
  de: {
    statement: 'Die Aussage, die es macht',
    paradox: 'Die Paradoxie, die folgt',
    relations: 'Steht zu',
    order: 'Lesereihenfolge',
    own: 'Paradoxien, die dem Projekt gehören',
    receipt: 'Verzeichnis-Fingerabdruck',
    kinds: { cites: 'zitiert', supports: 'stützt', contests: 'bestreitet', converges: 'trifft sich mit' },
    phrase: 'In der Dokumentation',
    source: 'Stützt sich auf',
    status: { verified: 'Belegt', chosen: 'Gewählt', probable: 'Wahrscheinlich', open: 'Offen' },
    counts: {
      verified: { one: 'belegt', many: 'belegt' },
      chosen: { one: 'gewählt', many: 'gewählt' },
      probable: { one: 'wahrscheinlich', many: 'wahrscheinlich' },
      open: { one: 'offen', many: 'offen' }
    }
  }
}

export default defineLoader({
  async load(): Promise<Data> {
    // One place assembles the record: citation, facets and edges. Everything
    // that renders -- the matrix, the paradoxes, the reading order, the
    // microdata -- reads this and nothing else.
    const assembled: Record_[] = entries.map((entry) => {
      const record = { ...entry, ...(facets[entry.id] ?? {}) }
      return {
        ...record,
        address: address(record),
        out: edges.filter((e) => e.from === entry.id),
        in: edges.filter((e) => e.to === entry.id)
      }
    })

    const known = new Set(assembled.map((e) => e.id))
    for (const edge of edges) {
      if (!known.has(edge.from) || !known.has(edge.to)) {
        throw new Error(`sources: relation ${edge.from} -> ${edge.to} names a record that does not exist`)
      }
    }

    for (const seat of reading) {
      for (const id of seat.records) {
        if (!known.has(id)) throw new Error(`sources: the reading order names ${id}, which is not a record`)
      }
    }

    return {
      entries: assembled,
      own,
      reading: reading.map((seat, i) => ({ ...seat, seat: i + 1 })),
      edges,
      receipt: address(assembled.map((e) => e.address).sort()),
      ui
    }
  }
})
