# Research ethics and data protection

Working notes, not legal advice. Verified 2026-08-25. Your institution's ethics
committee has the final say, and this is written to make that conversation
short rather than to replace it.

Not published — `ethics/` sits outside `docs/`.

## What actually applies

I overstated this earlier. Two corrections:

**Ethics review is not legally mandatory here.** In Austria, statutory ethics
review binds biomedical research — medications, medical devices, applied
medical research on human participants. **For social science, law and the
humanities it is voluntary at law.** So no statute compels a clown project to
seek approval.

That is not the same as optional. Once you enrol, your university's own rules
apply, and institutional committees do cover arts-based research — the standard
Austrian committee composition reserves a seat for arts and architecture.
Funders and examiners ask for it independently of the state.

**GDPR binds regardless.** It does not care whether ethics review was
voluntary. Recording identifiable people needs a lawful basis under Art. 6 and
informed consent before recording begins. Art. 89 requires safeguards —
minimisation, pseudonymisation — but does **not** relax the need for a lawful
basis. Austria adds **§ 12 DSG** on image processing, on top of the GDPR.

## The distinction that decides most of this

Not everything the studio process describes is personal data.

| Activity | Personal data? | What is needed |
|---|---|---|
| Anonymous behavioural notes — "three people checked a phone in the silence" | **No**, if no one is identifiable | Nothing under GDPR |
| Counts, timings, laugh/no-laugh tallies | **No** | Nothing under GDPR |
| **Video or stills of the audience** | **Yes** | Lawful basis, informed consent, § 12 DSG |
| **Video of the performance with audience audible** | **Yes**, if voices identify anyone | Consent, or capture that excludes them |
| Field protocol notes on strangers in public | Grey — depends on identifiability | See below |

Most of what [studio-process.md](../docs/studio-process.md) asks for is the top
two rows. `Record behaviour, not feelings` and the flop scale are counts and
observations, not dossiers. Written as anonymous aggregates, they raise no data
protection question at all.

The expensive rows are the camera ones — and `Keep the camera running` is a
working rule of the process.

## The field protocol is the sharp one

[studio-process.md](../docs/studio-process.md) says: *observe people's solitary
behaviour in public and domestic spaces without assigning motives.*

Public space, anonymous notes, no recording: defensible, and common in
observational practice.

**Domestic spaces is the problem.** Observing people in homes without their
knowledge is covert research on identifiable individuals in a private setting.
Committees scrutinise that category hardest, and it is the single item here
most likely to draw an objection — or to be the thing an examiner asks about.

Two ways out, both cheap:
1. **Narrow the wording to public space**, and treat domestic observation as
   memory and self-observation rather than fieldwork.
2. **Keep it, and get consent** from the households concerned.

Option 1 costs a sentence. Option 2 costs paperwork. Doing neither costs the
chapter.

## One exercise that looks like a problem and is not

`Let an observer leave without warning and note when the body notices.`

Read quickly this looks like deception of a participant, and it is not. The
observer is *told* to leave; the person kept in the dark is the performer, whose
reaction is the datum. That is the researcher experimenting on herself, which
needs no approval from anyone.

Worth writing down because it is the kind of line an assessor stops on, and the
answer takes one sentence.

## What to prepare

- **Participant information sheet** — what the project is, what is recorded,
  how long it is kept, who sees it, how to withdraw. Drafts in this directory, in English, German and Bulgarian.
- **Consent form** — separate ticks for participating, for being filmed, and
  for the footage being shown publicly. A single "I agree to take part" does
  not carry filming.
- **Data management plan** — where footage lives, encrypted or not, retention
  period, deletion date, who has access.
- **A no-camera row.** Audience members who decline filming need somewhere to
  sit that is out of frame. Decide this before the first test, not at the door.

## Sequence

1. Decide the field protocol wording — before the next round of observation.
2. Draft the consent instruments — before audience test 1.
3. If enrolled, put them to the committee — their template beats mine.
4. Keep signed consents with the footage, not separately.

## The photo archive

`100 procenta budni/` holds 68 photographs and 6 videos, 217 MB, outside both
repositories. It is a camera roll, not a press kit, and it sorts into three
kinds:

- **Solo, publishable.** `Margareten-2.jpg` — Titania alone, red nose, against
  Jugendstil façades in Margareten. No third parties.
- **Events and workshops with identifiable others.** `_DSC4950.jpg` has roughly
  twenty audience faces; `_DSC4738.jpg` has three people at close range. These
  are the same people the consent form exists for. Publishing them without it
  would contradict the position this document takes.
- **Personal and political.** `IMG_7052.jpeg` is Titania under a "Safe abortion
  is a human right" banner. Nothing to do with consent — an editorial decision
  about what the professional site says, and hers alone.
- **Children.** `IMG_1610.jpg` is Titania on a slackline holding both hands of a
  child of about five, with a second child beside her and more watching. This is
  the strictest category in the folder, not the same as the adults above. A
  child cannot consent; a parent or guardian must, in writing, for that specific
  publication. The GDPR treats children's data as meriting specific protection,
  and the workshop and birthday pages are exactly where an image like this would
  be reached for. **Do not publish any frame containing a child without the
  guardian's written agreement naming the use.**
- **Fellow performers.** `IMG_1355.jpg` is Titania with an acrobat mid-handstand
  at a street event. Consent is still needed, but this is the easy case: a
  colleague at a public performance, usually reachable and usually willing.
  Ask; do not assume.
- **Someone else's work.** `f2ed9844-….jpg` photographs a framed ink portrait of
  Titania, signed and dated 16.11.2023. The subject consents to nothing here;
  the question is copyright, and it belongs to whoever drew it. Being the sitter
  is not a licence to publish the drawing.

None of it has been published. Anything from the second kind needs consent from
the people in frame before it goes anywhere public, and the release in
`consent-en.md` covers exactly this: a separate tick for public use.

`margareten.jpg` on the concept pages is the first frame taken from this folder:
solo, no third party, resized to 1050×1400 and 173 KB. It is the shape the rest
has to be in before it goes anywhere.

## The six videos

4.6 to 19.5 seconds each, 1080p, 5–25 MB. They split the same way the
photographs do, and one of them raises the field-protocol question again:

- **Solo and usable.** `IMG_2246.MOV` — Titania in a park, red coat, red nose,
  bare trees. Nobody else in frame.
- **Strangers in the street.** `IMG_7217.MOV` — a city street, two identifiable
  passers-by, no Titania in the frame at all. This is the field protocol in
  video form: people filmed without knowing. The wording question above applies
  to it, and video makes identification easier than notes ever would.

**Self-hosting is not possible inside the page budget, and the numbers are not
close.** A page must stay under 500 KB and already spends around 200 KB:

| encode | size |
|---|---|
| 10s, 720p, no audio | 2,441 KB |
| 3s, 480p, no audio, crf 30 | 374 KB |

Even three silent seconds at 480p overruns the page. So video means one of three
things: embedding from a platform, which puts a third party's tracking on the
page and changes what the privacy policy has to say; raising the budget
deliberately; or not carrying video. It is a decision, not an optimisation.
