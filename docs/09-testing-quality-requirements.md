> Status: Content QA implemented · Last reviewed: 2026-09-05 · Imported from [Linear](https://linear.app/taoyan929/document/09-testing-content-qa-and-non-functional-requirements-bfe6f92c654d).
>
> Repository Markdown is the implementation reference. Material product changes should be reflected in both this document and the matching Linear issue or project document.

# Testing, Content QA & Non-Functional Requirements

## 1. Quality principle

A code-review learning product is only trustworthy if its expected findings, scoring rules and explanations are themselves reviewable and testable.

## 2. Test layers

### Unit tests

Prioritise pure domain logic:

* line/range matching
* category matching
* concept/alias matching
* scoring aggregation
* hint/assistance calculations
* completion calculation
* mastery update
* weak-topic transitions
* recommendation ranking
* unlock logic
* streak/daily mission logic

### Component tests

Cover:

* code-line selection
* finding composer
* hint controls
* staged feedback states
* completion/mastery cards
* mission progress
* locked/unlocked path states

### Integration tests

Critical flows:

1. complete beginner review end-to-end
2. retry after partial finding
3. use progressive hint
4. final reveal
5. fix code
6. persist and restore progress
7. recommendation changes after weak-topic miss
8. unlock a new level/Boss Review

### End-to-end tests

Add once UI stabilises for:

* first launch → first completed exercise
* returning user → Today’s Mission
* multi-file Boss Review

## 3. Exercise content QA

Every curated exercise should pass a content checklist:

* requirement is understandable
* code compiles/is syntactically plausible unless syntax error is intentional
* intentional issues are documented
* no accidental hidden issues that invalidate scoring
* expected line/ranges are correct
* accepted categories make sense
* diagnosis aliases do not over-match unrelated answers
* hints progress from subtle to strong
* explanation says why the issue matters
* reference review comment is professional and concise
* reference fix actually solves the issue
* difficulty and estimated time are reasonable
* concepts/tags/prerequisites are correct

The TAO-19 content gate enforces these structural rules at repository startup and in CI. The built-in pack contains 24 schema-valid exercises, 1–2 expected findings per exercise, complete three-level hints, matching reference files, and four executable golden evaluation cases per exercise.

## 4. Golden evaluation cases

For each important finding, include sample learner answers:

* strong correct
* correct but poor English
* partial
* adjacent/acceptable wording
* wrong reasoning
* unrelated/wrong

These cases become deterministic scoring tests and later an AI semantic-evaluation benchmark.

## 5. Accessibility

* keyboard access to selectable code lines where practical
* visible focus states
* semantic labels for form controls
* do not communicate status by colour alone
* sufficient contrast
* responsive layouts at common laptop/tablet widths
* review findings navigable without mouse-only interaction

## 6. Performance

MVP targets:

* fast local load
* no unnecessary network dependency
* lazy-load large exercise libraries/code editor dependencies where beneficial
* avoid recomputing full mastery/history on every render; use domain services/selectors

## 7. Data integrity

* version localStorage schema
* validate loaded state
* recover from corrupt/incompatible state without crashing
* support reset/export later if useful
* exercise IDs stable across content updates

## 8. Security — MVP

* never execute exercise code directly
* render code as text
* no secrets in client bundle
* sanitise any future markdown/HTML content
* imported content in future is untrusted

## 9. Security — future backend/AI

* server-side secrets
* authenticated/authorised learner resources
* rate limits
* request size limits
* safe GitHub token handling
* minimise learner content sent to LLMs
* model output schema validation
* prompt-injection-resistant separation between imported code and system instructions

## 10. Privacy

MVP local-first is privacy-friendly by default.

If analytics/accounts are introduced later:

* disclose collected data
* collect only data needed for product/learning improvement
* avoid storing raw learner code/comments unnecessarily
* support deletion/export as product requirements mature

## 11. Observability — future

If backend introduced:

* request IDs
* structured errors
* AI latency/cost metrics
* model confidence/evaluation metrics
* exercise failure/content-quality reporting

Do not log secrets or full private repository contents by default.

## 12. Definition of done for an exercise

An exercise is not “done” merely because it renders. It must:

* pass schema validation
* pass golden scoring tests
* have reviewed hints/explanation/reference fix
* render correctly in targeted review mode
* update progress/mastery correctly
* have no answer leakage before reveal

## 13. Definition of done for MVP

* core workflows work from first launch through completion and next recommendation
* all curated exercises validate
* deterministic scoring tests pass
* progress survives reload
* no critical console/runtime errors
* accessible primary interactions
* responsive desktop experience
* README and Linear docs match actual architecture
* known limitations documented
* AI/GitHub future interfaces remain optional and do not complicate MVP runtime
