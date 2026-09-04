> Status: Draft · Last reviewed: 2026-09-04 · Imported from [Linear](https://linear.app/taoyan929/document/03-learning-scoring-and-adaptive-model-716ed7acf5b5).
>
> Repository Markdown is the implementation reference. Material product changes should be reflected in both this document and the matching Linear issue or project document.

# Learning, Scoring & Adaptive Model

## 1. Why this model exists

The learner may identify the correct technical problem using imperfect English. The system must therefore evaluate **technical understanding** separately from **communication quality**.

## 2. Finding anatomy

A learner finding can include:

* line/range
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

## 6. Hint handling

Hints are assistance signals, not punishment.

Record:

* number of hints
* strongest hint level used
* whether answer was revealed

A learner may complete the exercise after hints, but assistance-independent mastery should increase more slowly than when the same concept is found without help.

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

## 9. Weak-topic model

A concept becomes weak when deterministic thresholds are met, for example:

* repeatedly missed
* low recent technical score
* high hint dependency
* failed fix step

Weak status should decay/remove after successful later practice.

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

## 11. Daily Mission generation

Create 1–3 tasks balancing:

* path progression
* weak-topic reinforcement
* variety
* estimated time

Each recommendation should have an explainable reason.

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
* Level 2 unlocks after required foundation completion and minimum mastery
* Level 3 unlocks after sufficient Level 2 coverage/mastery
* Boss Reviews unlock at curriculum checkpoints

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

