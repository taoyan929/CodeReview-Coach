> Status: MVP implemented · Last reviewed: 2026-09-14 · Imported from [Linear](https://linear.app/taoyan929/document/03-learning-scoring-and-adaptive-model-716ed7acf5b5).
>
> Repository Markdown is the implementation reference. Material product changes should be reflected in both this document and the matching Linear issue or project document.

# Learning, Scoring & Adaptive Model

## 1. Why this model exists

The learner may identify the correct technical problem using imperfect English. The system must therefore evaluate **technical understanding** separately from **communication quality**.

## 2. Finding anatomy

A learner finding can include:

* one or more independently selected lines
* category
* diagnosis
* impact/reasoning
* suggested fix

Expected finding metadata can include:

* accepted line/ranges
* category
* target concepts
* accepted aliases/keywords
* impact concepts
* acceptable fix concepts
* severity
* hints
* reference comment

## 3. MVP deterministic evaluation

Use structured signals before AI:

### Detection

Did the learner select the correct/acceptable code location?

### Category

Did the chosen issue type match the expected category or an accepted adjacent category?

### Diagnosis

Did the response contain the target technical concept or an accepted alias?

### Reasoning

Did the learner identify the consequence/risk?

### Fix

Did the suggested change address the root issue?

The MVP can use concept aliases and keyword groups rather than exact sentence matching.

## 4. Technical vs communication score

### Technical Review Score

Derived from:

* detection
* diagnosis
* reasoning
* fix quality

### Communication Quality

Derived separately from:

* clarity
* specificity
* actionable wording
* professional tone

Communication should never make a technically correct answer technically wrong.

## 5. Suggested scoring shape

Per finding, store dimension scores rather than only one grade:

* detection: 0–1
* category: 0–1
* diagnosis: 0–1
* reasoning: 0–1
* fix: 0–1
* communication: 0–1

Exercise technical score can use weighted findings by severity/importance.

Exact weights should be constants/configuration, not embedded in UI components.

### Implemented MVP rules

The deterministic engine uses these technical weights per expected finding:

| Dimension | Weight |
| --- | ---: |
| Detection / accepted location overlap | 35% |
| Category / accepted adjacent category | 15% |
| Diagnosis / concept recognition | 25% |
| Reasoning / consequence recognition | 15% |
| Suggested fix / root-cause correction | 10% |

Finding status thresholds are:

- **Strong:** weighted finding score ≥ 0.75
- **Partial / needs another look:** weighted finding score ≥ 0.35
- **Incorrect:** weighted finding score < 0.35
- **Missed:** no learner finding matches the expected finding

A learner finding can match an expected finding when either its file and line range overlap an accepted location, or its accepted category and diagnosis concept signals are both strong. Full Review normalises expected and learner text into significant tokens and matches curated concept phrases. Language Assist additionally recognises curated compact keyword groups and code operators such as `===`, `!=` and `??`. Exact sentences and correct grammar are never required.

The exercise technical score is the expected-finding-weighted total, reported from 0–100. A correct Language Assist impact choice earns the reasoning dimension; “Not sure yet” earns no reasoning points but does not invalidate the finding. Communication is stored separately: Full Review uses diagnosis clarity, impact specificity and fix actionability, while Language Assist uses only the learner-authored short diagnosis (60%) and fix (40%). It is never included in the technical score.

Assistance level records the strongest hint level divided by three. Review submission does not mark curriculum completion: completion remains pending until the learner performs the fix step introduced by TAO-22.

## 6. Hint handling

Hints are assistance signals, not punishment.

Record:

* number of hints
* strongest hint level used
* whether answer was revealed

A learner may complete the exercise after hints, but assistance-independent mastery should increase more slowly than when the same concept is found without help.

Language Assist is a separate support signal rather than a hint. Completion is unchanged, but the final attempt mastery contribution is multiplied by `0.85` after the normal technical, hint and fix calculation.

## 7. Completion model

Curriculum Completion answers: **How much of the built-in path have I completed?**

Each curated exercise/module has a curriculum weight. Total curated MVP weight = 100%.

Completion increases when the defined completion criteria are met. It should not decrease because of a low score.

## 8. Mastery model

Review Mastery answers: **How well am I performing?**

Mastery considers:

* technical score
* difficulty
* repeated performance
* recency
* retries
* hint usage
* successful fixes

Mastery can exist at:

* concept level
* topic level
* track level
* learning level
* overall

Avoid claiming mastery is a real-world engineering certification; it is an in-product learning metric.

### Implemented mastery calculation

Each scored attempt contributes an in-product mastery score from 0–100:

| Signal | Contribution |
| --- | ---: |
| Deterministic technical score | 75% |
| Independent work (inverse of strongest hint level) | 10% |
| Submitted code fix | 15% |

Overall, track and learning-level mastery are averages of matching scored attempts. Primary and secondary exercise tracks both receive the signal. Mastery remains `undefined` until at least one matching attempt exists; the UI must show insufficient data rather than 0%.

Curriculum completion is calculated independently from completed exercise weights against the curriculum's configured total. A low mastery score never removes completion.

## 9. Weak-topic model

A concept becomes weak when deterministic thresholds are met, for example:

* repeatedly missed
* low recent technical score
* high hint dependency
* failed fix step

Weak status should decay/remove after successful later practice.

The implemented deterministic weak threshold is mastery below 70 for a concept that has been missed at least once. Priority increases as mastery falls and miss count rises. Tracks with measured mastery below 70 are surfaced separately. These rules are domain constants and can be calibrated without changing page components.

Streaks use unique completion dates in the browser's local calendar. The current streak remains active when the last local completion date was today or yesterday. Weekly goals start on local Monday, default to five completed fixes, and preserve a learner's target for the active week. These values are re-derived from attempt history, so the calendar correction requires no learner-state schema migration.

## 10. Rule-based recommendations

Recommendation inputs:

* prerequisites
* completion
* mastery
* weak concepts
* last-practised time
* recent mission types
* difficulty
* level unlocks

Example rules:

1. New user → foundational starter path.
2. Concept score below threshold → same/easier concept.
3. Concept missed twice recently → weak-topic priority.
4. Strong score with no hints → harder or cross-topic exercise.
5. Track completion/mastery threshold → unlock next level.
6. Weak topic stale for several days → bring back into Daily Mission.
7. Rotate mission types to avoid monotony.

The implemented `recommendExercises` boundary is a pure, deterministic ranking function. It filters locked exercises and unmet prerequisites before scoring eligible work, caps output at three tasks, and returns a stable `Recommendation` contract with a machine-readable reason code and learner-facing explanation. Completed work is only eligible again when it reinforces a current weak concept.

## 11. Daily Mission generation

Create 1–3 tasks balancing:

* path progression
* weak-topic reinforcement
* variety
* estimated time

Each recommendation should have an explainable reason.

The generated mission persists the ranked recommendations alongside its exercise IDs. The Dashboard uses those persisted reasons and calculates remaining time from incomplete mission items rather than estimating proportionally.

## 12. Weekly Goal

A weekly goal can be exercise-based initially (e.g. complete 5 reviews), with optional concept/track goals later.

Weekly summary:

* completed reviews
* strongest improvement
* weak topics
* next-week focus

## 13. Level unlocks

Example design, configurable later:

* Level 1 available by default
* Level 2 unlocks at 30% Code Literacy completion and 65% mastery, or when compatible prior Level 2 activity already exists
* Level 3 unlocks at 35% Technology Review completion and 70% mastery, or when compatible prior Level 3 activity already exists
* Boss Reviews unlock after Level 3 is available, curriculum completion reaches 50%, and overall review mastery reaches 70%

Avoid hard-coding thresholds into page components.

## 14. AI upgrade path

Later AI can improve diagnosis/reasoning/fix semantic matching, but it should consume and return the same structured dimensions.

AI should not replace:

* line/range match
* exercise metadata
* completion tracking
* learner attempt history
* deterministic fallback

This preserves explainability and prevents the product from becoming dependent on one model response.
