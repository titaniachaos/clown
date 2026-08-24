import { defineLoader } from 'vitepress'

/**
 * Build-time data loader for the source ledger.
 *
 * Every entry is written once and rendered into all three locales, so a
 * correction to a citation cannot land in English and quietly miss Bulgarian.
 * The loader runs in Node during the build; the result is inlined as JSON.
 */

export type Lang = 'en' | 'bg' | 'de'

/**
 * How the attribution stands. Encoded, not decorative.
 *
 * `verified` — the documentation was already quoting this source.
 * `chosen`   — the project decided the lineage; the tradition is documented.
 * `probable` — a close match the documentation has not confirmed.
 * `open`     — unattributed, and awaiting a decision.
 */
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
  phrase: Record<Lang, string>
  /** What it is drawing on. */
  gloss: Record<Lang, string>
}

export interface Data {
  entries: SourceEntry[]
  ui: Record<Lang, {
    phrase: string
    source: string
    status: Record<Status, string>
    counts: Record<Status, string>
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
      en: 'Montaigne’s *arrière-boutique*: “we must reserve a backshop, wholly our own and entirely free.” Movement 3 stages the essay. Its reversal — that the private room stays furnished with borrowed language and absent people — is not Montaigne’s, and belongs to the project.',
      bg: '*Arrière-boutique* на Монтен: „трябва да си запазим задна стая, изцяло наша и напълно свободна“. Движение 3 поставя есето на сцена. Обръщането — че личната стая остава обзаведена със заета реч и отсъстващи хора — не е на Монтен и принадлежи на проекта.',
      de: 'Montaignes *arrière-boutique*: „wir müssen uns einen Hinterladen vorbehalten, ganz der unsere und völlig frei“. Bewegung 3 bringt den Essay auf die Bühne. Die Umkehrung — dass der private Raum mit geliehener Sprache und abwesenden Menschen möbliert bleibt — stammt nicht von Montaigne, sondern vom Projekt.'
    }
  },
  {
    id: 'three-terms',
    status: 'verified',
    locus: 'concept · 2',
    work: 'Hannah Arendt, The Origins of Totalitarianism (1951), closing chapter',
    phrase: {
      en: 'Solitude, loneliness and isolation',
      bg: 'Самота, самотност и изолация',
      de: 'Einsamkeit, Verlassenheit und Isolation'
    },
    gloss: {
      en: 'Arendt’s three-way distinction, in her order and with her boundaries: isolation as the political inability to act together, loneliness as the common ground for terror, solitude as the situation in which one keeps oneself company.',
      bg: 'Тристранното разграничение на Аренд, в нейния ред и с нейните граници: изолацията като политическа невъзможност за съвместно действие, самотността като обща почва на терора, самотата като положение, в което човек си прави компания.',
      de: 'Arendts dreiteilige Unterscheidung, in ihrer Reihenfolge und mit ihren Grenzen: Isolation als politische Unfähigkeit zum gemeinsamen Handeln, Verlassenheit als gemeinsamer Boden des Terrors, Einsamkeit als die Lage, in der man sich selbst Gesellschaft leistet.'
    }
  },
  {
    id: 'two-in-one',
    status: 'verified',
    locus: 'dramaturgy · 6',
    work: 'Hannah Arendt, The Life of the Mind (1978)',
    phrase: {
      en: 'The two-in-one',
      bg: 'Двамата в един',
      de: 'Das Zwei-in-Einem'
    },
    gloss: {
      en: 'Arendt’s term for thinking as an inner dialogue — the self splitting into questioner and answerer. Movement 6 puts the second half outside the performer, in an object: a wordless clown cannot stage an inner dialogue as dialogue, so the split is externalised into something that can be met, played with and let go.',
      bg: 'Понятието на Аренд за мисленето като вътрешен диалог — азът се разделя на питащ и отговарящ. Движение 6 поставя втората половина извън изпълнителя, в предмет: безсловесният клоун не може да представи вътрешен диалог като диалог, затова разделението се изнася в нещо, което може да бъде срещнато, да се играе с него и да бъде оставено.',
      de: 'Arendts Begriff für das Denken als inneren Dialog — das Selbst spaltet sich in Fragenden und Antwortenden. Bewegung 6 setzt die zweite Hälfte außerhalb der Spielerin an, in ein Objekt: Ein wortloser Clown kann einen inneren Dialog nicht als Dialog zeigen, also wird die Spaltung in etwas verlegt, dem man begegnen, mit dem man spielen und das man loslassen kann.'
    }
  },
  {
    id: 'capacity',
    status: 'verified',
    locus: 'concept · 6',
    work: 'D. W. Winnicott, “The Capacity to be Alone”, Int. J. Psycho-Anal. 39 (1958), 416–420',
    phrase: {
      en: 'Learning to be alone',
      bg: 'Да се научиш да си сам',
      de: 'Alleinsein lernen'
    },
    gloss: {
      en: 'The capacity is built by being alone in the presence of someone. The project’s extension — that an audience supplies exactly that presence for a solo performer — is the load-bearing claim of the whole concept.',
      bg: 'Способността се изгражда, докато си сам в присъствието на някого. Приносът на проекта — че публиката осигурява точно това присъствие за соловия изпълнител — е носещото твърдение на цялата концепция.',
      de: 'Die Fähigkeit entsteht dadurch, dass man in Anwesenheit eines anderen allein ist. Der Beitrag des Projekts — dass ein Publikum genau diese Anwesenheit für eine Solospielerin bereitstellt — ist die tragende Behauptung des gesamten Konzepts.'
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
    locus: 'concept · audience · rehearsal-toolkit',
    work: 'Philippe Gaulier; Lucy Amsden, “Monsieur Marcel and Monsieur Flop”, Theatre, Dance and Performance Training 8:2 (2017)',
    ref: '10.1080/19443927.2017.1316304',
    phrase: {
      en: 'The flop',
      bg: 'Флопът',
      de: 'Der Flop'
    },
    gloss: {
      en: 'Not simply a failure: the clown registering the failure to make the audience laugh, so that the registration becomes the comic moment. The flop scale rated by exposure rather than laugh size is this project’s instrument, not Gaulier’s.',
      bg: 'Не просто провал: клоунът осъзнава, че не е разсмял публиката, и това осъзнаване става комичният момент. Скалата на флоповете, оценявана по разкритост, а не по сила на смеха, е инструмент на този проект, не на Голие.',
      de: 'Nicht bloß ein Scheitern: Der Clown bemerkt, dass er das Publikum nicht zum Lachen gebracht hat, und dieses Bemerken wird zum komischen Moment. Die nach Bloßstellung statt nach Lachstärke bewertete Flop-Skala ist ein Instrument dieses Projekts, nicht Gauliers.'
    }
  },
  {
    id: 'lecoq',
    status: 'verified',
    locus: 'concept · rehearsal-toolkit',
    work: 'Jacques Lecoq, Le Corps Poétique (1997)',
    phrase: {
      en: 'Movement analysis and observed behaviour',
      bg: 'Анализ на движението и наблюдавано поведение',
      de: 'Bewegungsanalyse und beobachtetes Verhalten'
    },
    gloss: {
      en: 'Two of the five unnamed lineages are both Lecoq: *tout bouge* and the observation practice the field protocol prescribes. He also supplies the route — the clown is not reached except through the neutral mask, which is what movement 1 is in all but name.',
      bg: 'Две от петте неназовани традиции са и двете на Льокок: *tout bouge* и практиката на наблюдение, която полевият протокол предписва. Той дава и пътя — до клоуна се стига само през неутралната маска, каквото по същество е движение 1.',
      de: 'Zwei der fünf unbenannten Linien sind beide Lecoq: *tout bouge* und die Beobachtungspraxis, die das Feldprotokoll vorschreibt. Er liefert auch den Weg — zum Clown gelangt man nur durch die neutrale Maske, was Bewegung 1 der Sache nach ist.'
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
    locus: 'concept · material-research',
    work: 'Pascal Jacob, « L’Auguste », BnF / Centre national des arts du cirque',
    phrase: {
      en: 'Playful anarchy',
      bg: 'Игрова анархия',
      de: 'Spielerische Anarchie'
    },
    gloss: {
      en: 'The auguste, decided 25 August 2026. The BnF characterisation carries the register exactly: candour and naivety mingled with “a playful instinct and a liking for dissimulation with no consequences”. Bouffon was ruled out — it works in a gang and mocks the audience. One adjustment the tradition forces: the classical auguste is the *recipient* of the comic doings, subordinate to a whiteface. In a solo there is no whiteface, so the room plays it — which movements 4 and 5 already do. Grock, an auguste who broke free of the pairing and carried the entrée into the theatre, is the precedent.',
      bg: 'Огюстът, решено на 25 август 2026 г. Характеристиката на BnF предава регистъра точно: прямота и наивност, смесени с „игрови инстинкт и склонност към безобидна прикритост“. Буфонът отпадна — той действа на група и се подиграва на публиката. Една поправка, която традицията налага: класическият огюст е *получателят* на комичното действие, подчинен на белия клоун. В соло няма бял клоун, затова стаята поема ролята — което движения 4 и 5 вече правят. Грок, огюст, който се освобождава от двойката и пренася антрето в театъра, е прецедентът.',
      de: 'Der Auguste, entschieden am 25. August 2026. Die Charakterisierung der BnF trifft das Register genau: Aufrichtigkeit und Naivität, vermischt mit „einem Spieltrieb und einer Neigung zur folgenlosen Verstellung“. Bouffon scheidet aus — er arbeitet in der Gruppe und verspottet das Publikum. Eine Korrektur, die die Tradition erzwingt: Der klassische Auguste ist der *Empfänger* des komischen Geschehens, dem Weißclown untergeordnet. Im Solo gibt es keinen Weißclown, also übernimmt der Raum die Rolle — was die Bewegungen 4 und 5 bereits tun. Grock, ein Auguste, der sich aus dem Paar löste und die Entrée ins Theater trug, ist der Präzedenzfall.'
    }
  },
  {
    id: 'emptied-room',
    status: 'open',
    locus: 'concept · 8',
    work: '—',
    phrase: {
      en: 'The emptied room',
      bg: 'Изпразнената стая',
      de: 'Der geleerte Raum'
    },
    gloss: {
      en: 'No source. Letting the self loosen rather than consoling it may point to Weil, to a reading of non-self, or to contemplative solitude. It should be decided rather than left to resemblance.',
      bg: 'Няма източник. Отпускането на аза, вместо утешаването му, може да сочи към Вейл, към прочит на не-аза или към съзерцателната самота. Това трябва да бъде решено, а не оставено на прилика.',
      de: 'Keine Quelle. Das Lockern des Selbst statt seiner Tröstung könnte auf Weil, auf eine Lesart des Nicht-Selbst oder auf kontemplative Einsamkeit deuten. Das sollte entschieden und nicht der Ähnlichkeit überlassen werden.'
    }
  }
]

const ui: Data['ui'] = {
  en: {
    phrase: 'In the documentation',
    source: 'Drawing on',
    status: { verified: 'Verified', chosen: 'Chosen', probable: 'Probable', open: 'Open' },
    counts: { verified: 'verified', chosen: 'chosen', probable: 'probable', open: 'open' }
  },
  bg: {
    phrase: 'В документацията',
    source: 'Опира се на',
    status: { verified: 'Потвърдено', chosen: 'Избрано', probable: 'Вероятно', open: 'Отворено' },
    counts: { verified: 'потвърдени', chosen: 'избрано', probable: 'вероятно', open: 'отворени' }
  },
  de: {
    phrase: 'In der Dokumentation',
    source: 'Stützt sich auf',
    status: { verified: 'Belegt', chosen: 'Gewählt', probable: 'Wahrscheinlich', open: 'Offen' },
    counts: { verified: 'belegt', chosen: 'gewählt', probable: 'wahrscheinlich', open: 'offen' }
  }
}

export default defineLoader({
  async load(): Promise<Data> {
    return { entries, ui }
  }
})
