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
      en: 'The auguste, decided 25 August 2026. The BnF characterisation carries the register exactly: candour and naivety mingled with “a playful instinct and a liking for dissimulation with no consequences”. Bouffon was ruled out — it works in a gang and mocks the audience. One adjustment the tradition forces: the classical auguste is the *recipient* of the comic doings, subordinate to a whiteface. In a solo there is no whiteface, so the room plays it — which movements 4 and 5 already do. Grock, an auguste who broke free of the pairing and carried the entrée into the theatre, is the precedent. The reading corrects that by half. Van Wyk, whose thesis is that clown theatre needs the Whiteface for structure and the Auguste for spontaneity, describes her own *solo* work putting the two inside one performer as conceptual counterparts, and argues that where the Auguste is in charge a Whiteface supplying rules, tension and goals is essential. So the function splits rather than moving out: the room supplies the rule, which is what movement 5 is, and the performer supplies the aspiration to elegance and the collapse out of it. That is [[two-in-one]] again, reached from clown practice instead of philosophy.',
      bg: 'Огюстът, решено на 25 август 2026 г. Характеристиката на BnF предава регистъра точно: прямота и наивност, смесени с „игрови инстинкт и склонност към безобидна прикритост“. Буфонът отпадна — той действа на група и се подиграва на публиката. Една поправка, която традицията налага: класическият огюст е *получателят* на комичното действие, подчинен на белия клоун. В соло няма бял клоун, затова стаята поема ролята — което движения 4 и 5 вече правят. Грок, огюст, който се освобождава от двойката и пренася антрето в театъра, е прецедентът. Прочетеното поправя това наполовина. Ван Вайк, чиято теза е, че клоунският театър се нуждае от белия клоун за структура и от огюста за спонтанност, описва собствената си *солова* работа, в която двамата са вътре в един изпълнител като понятийни съответствия, и твърди, че там, където огюстът води, е необходим бял клоун, който доставя правила, напрежение и цели. Значи функцията се разделя, а не се изнася: стаята доставя правилото, каквото е движение 5, а изпълнителят доставя стремежа към изящество и рухването от него. Това е [[two-in-one]] отново, стигнато от клоунската практика, а не от философията.',
      de: 'Der Auguste, entschieden am 25. August 2026. Die Charakterisierung der BnF trifft das Register genau: Aufrichtigkeit und Naivität, vermischt mit „einem Spieltrieb und einer Neigung zur folgenlosen Verstellung“. Bouffon scheidet aus — er arbeitet in der Gruppe und verspottet das Publikum. Eine Korrektur, die die Tradition erzwingt: Der klassische Auguste ist der *Empfänger* des komischen Geschehens, dem Weißclown untergeordnet. Im Solo gibt es keinen Weißclown, also übernimmt der Raum die Rolle — was die Bewegungen 4 und 5 bereits tun. Grock, ein Auguste, der sich aus dem Paar löste und die Entrée ins Theater trug, ist der Präzedenzfall. Die Lektüre korrigiert das zur Hälfte. Van Wyk, deren These lautet, dass Clown-Theater den Weißclown für die Struktur und den Auguste für die Spontaneität braucht, beschreibt ihre eigene *Solo*-Arbeit, in der beide als begriffliche Gegenstücke in einer Spielerin liegen, und argumentiert, dass dort, wo der Auguste führt, ein Weißclown mit Regeln, Spannung und Zielen unerlässlich ist. Die Funktion spaltet sich also, statt auszuwandern: Der Raum liefert die Regel, was Bewegung 5 ist, und die Spielerin liefert das Streben nach Eleganz und den Absturz daraus. Das ist wieder [[two-in-one]], von der Clown-Praxis her erreicht statt von der Philosophie.'
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
