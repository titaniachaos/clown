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

export interface Data {
  entries: SourceEntry[]
  ui: Localised<{
    phrase: string
    source: string
    status: Record<Status, string>
    /** One form per grammatical number: the tally prints a bare integer. */
    counts: Record<Status, { one: string; many: string }>
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
    locus: 'concept · audience · rehearsal-toolkit',
    work: 'Jacques Lecoq, Le Corps Poétique (1997); Philippe Gaulier; Lucy Amsden, “Monsieur Marcel and Monsieur Flop”, Theatre, Dance and Performance Training 8:2 (2017)',
    ref: '10.1080/19443927.2017.1316304',
    phrase: {
      en: 'The flop',
      bg: 'Флопът',
      de: 'Der Flop'
    },
    gloss: {
      en: 'Two definitions, and the project needs both. Lecoq: an attempt at an exploit that inevitably fails, the student’s own weakness turned into material. Gaulier: the clown *registering* the failure, so the registration becomes the comic moment. Lecoq supplies the attempt, Gaulier the look up afterwards. The flop scale rated by exposure rather than laugh size is this project’s instrument, not either man’s.',
      bg: 'Две определения, и проектът се нуждае и от двете. Льокок: опит за подвиг, който неизбежно се проваля — собствената слабост на ученика, превърната в материал. Голие: клоунът *осъзнава* провала и това осъзнаване става комичният момент. Льокок дава опита, Голие — вдигането на поглед след него. Скалата на флоповете, оценявана по разкритост, а не по сила на смеха, е инструмент на този проект, не на никого от двамата.',
      de: 'Zwei Definitionen, und das Projekt braucht beide. Lecoq: der Versuch einer Glanzleistung, der unweigerlich scheitert — die eigene Schwäche der Schülerin, in Material verwandelt. Gaulier: der Clown *bemerkt* das Scheitern, und dieses Bemerken wird zum komischen Moment. Lecoq liefert den Versuch, Gaulier den Blick danach. Die nach Bloßstellung statt nach Lachstärke bewertete Flop-Skala ist ein Instrument dieses Projekts, nicht das eines der beiden.'
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
    counts: {
      verified: { one: 'verified', many: 'verified' },
      chosen: { one: 'chosen', many: 'chosen' },
      probable: { one: 'probable', many: 'probable' },
      open: { one: 'open', many: 'open' }
    }
  },
  bg: {
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
    return { entries, ui }
  }
})
