# Funder visibility obligations

What a grant will require of the site once it is awarded. **Nothing here
applies yet** — these obligations attach on award, not on application. Written
now because one of them constrains the footer design, and that is cheaper to
know before than after.

Verified 2026-08-25 against the [Commission's emblem rules](https://commission.europa.eu/document/download/3192a0ef-6bda-4e1a-81ca-65ade2ffad73_en?filename=eu_emblem_rules.pdf)
and [EACEA visual identity](https://www.eacea.ec.europa.eu/grants/visual-identity_en).

Not published — `funding/` is outside `docs/`.

## If EU money lands (Creative Europe, Culture Moves Europe)

Three things, together:

1. **The EU emblem** — the twelve-star flag, unmodified.
2. **The funding statement**, spelled out in full next to it: *"Funded by the
   European Union"* or *"Co-funded by the European Union"*. Never abbreviated.
3. **The disclaimer**, in the appropriate language. EACEA beneficiaries must
   display all three, not a subset.

These apply to *any* communication or dissemination activity. A project website
is one.

## The rule that constrains the design

> The emblem must remain **distinct and separate** and cannot be modified by
> adding other visual marks, brands or text. When displayed in association with
> other logos, the emblem must be displayed **at least as prominently and
> visibly** as the other logos.

So a supporters row cannot put the EU flag in a line of equal-sized logos with
a national funder's mark larger, and cannot lock it up with the project's own
wordmark. If Vienna, the federal ministry and the EU all end up on the page,
the EU emblem sets the floor for every other logo's size.

The footer already carries photographer credits and the copyright line. Adding
supporters means designing that row against this constraint, not appending to
what is there.

## The trilingual implication

The funding statement and disclaimer must be *translated into local languages
where appropriate*. This site is published in three.

That is not three copies of an image — the emblem itself never changes — but
three versions of the statement and disclaimer text, which means they belong in
the locale config beside the footer message, not hard-coded. `check-locales`
would then hold them in parity automatically, the same way it holds everything
else.

## National funders

Wien Kultur, BMWKMS and НФК each have their own acknowledgment rules, and they
are not the EU's. Read each grant's own conditions on award — the EU emblem
rules do not govern them, and a national funder's logo sizing cannot override
the EU floor above.

## What is deliberately not built yet

No supporters component, no placeholder emblem. Building UI for a grant that
has not been awarded is speculative, and the exact statement wording depends on
which programme funds what. The constraint is recorded; the markup waits.
