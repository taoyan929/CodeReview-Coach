> Status: Post-MVP boundary confirmed · Last reviewed: 2026-09-14 · Imported from [Linear](https://linear.app/taoyan929/document/08-ai-integration-and-product-evolution-roadmap-db98a9b6a509).
>
> Repository Markdown is the implementation reference. Material product changes should be reflected in both this document and the matching Linear issue or project document.

# AI Integration & Product Evolution Roadmap

## Guiding principle

**You think first → AI coaches second.**

AI is an enhancement layer, not the prerequisite for the learning product and not the sole judge of correctness.

## Phase M1–M3 — Non-AI MVP

Build and validate:

* curated full-stack curriculum
* structured line/range review
* deterministic scoring
* staged hints/feedback
* fix-the-code step
* curriculum completion
* mastery and weak topics
* rule-based recommendations
* Daily/Weekly Missions
* streaks/unlocks/Boss Reviews

Why no AI yet:

* validate the learning loop first
* keep evaluation explainable
* remove API cost/latency while UI changes rapidly
* build clean training data/signals for later AI

## M4 — AI Coach

Primary use case: understand learner wording that deterministic matching cannot fully interpret.

### AI responsibilities

* semantic diagnosis matching
* reasoning-quality feedback
* fix-quality feedback
* multilingual learner input
* communication clarity
* professional review-comment rewrite suggestions

### AI does not own

* selected line/range correctness
* deterministic category match
* exercise answer metadata
* completion calculation
* attempt history
* final truth when confidence is low

### Example

Learner:
“user not found no handle”

Deterministic signals:

* correct line ✓
* Error Handling category ✓

AI:

* semantic match: user-not-found handling ✓
* technical understanding: correct
* communication: understandable but imprecise
* suggested wording: “What happens if the user does not exist? Consider returning a 404 response.”

## M4 AI architecture

Client
→ application API
→ AI Coach Orchestrator
→ model provider
→ schema validation
→ merge policy with deterministic result
→ structured coach feedback

Never expose provider keys in browser.

## M4 confidence policy

Recommended behaviour:

* high confidence → use AI semantic signal as supporting evidence
* medium confidence → show coaching, avoid changing correctness aggressively
* low confidence → deterministic evaluation/retry fallback

Log enough structured metadata to debug model behaviour without storing unnecessary sensitive content.

## M5 — AI Adaptive Learning

Upgrade rule-based recommendations rather than replace the entire engine.

AI can:

* rerank candidate exercises
* personalise mission mix
* create variants for weak concepts
* adjust scenarios to learner level
* generate spaced-practice challenges

Rule engine remains fallback and provides curriculum constraints.

## AI-generated exercise pipeline

1. Select learning objective from curriculum/weak concepts.
2. Generate `ExerciseDraft` using strict schema.
3. Validate schema.
4. Validate required findings/hints/reference solution.
5. Run quality/safety checks.
6. Reject or regenerate if invalid.
7. Present to learner.
8. Store source/version/model metadata if productised.

AI should not generate arbitrary unreviewed exercises directly into production learning paths.

## M5 — Real PR / AI Coding mode

Long-term differentiator:

* import or create a realistic PR
* learner reviews first
* compare with senior/reference review
* compare with AI reviewer
* show issues learner found that AI missed and vice versa

This reinforces the product message: developers should supervise AI rather than blindly accept generated code.

## Future product modes

### Interview Mode

Time-boxed review challenge, limited hints, report at end.

### Team / Education Mode

Instructor-curated challenges, cohort analytics, common weak concepts.

### Graduate Onboarding

Company-specific stack/rules represented as exercise packs.

### Additional tracks

New languages/frameworks added through content and track metadata without changing the learning engine.

## AI provider abstraction

Define a provider-neutral internal interface. Avoid hard-coding UI/domain logic to one model vendor.

Conceptual interface:

```ts
interface AiCoachService {
  assessReview(input: AiReviewInput): Promise<StructuredAiAssessment>;
  generateExercise(input: ExerciseGenerationInput): Promise<ExerciseDraft>;
  rankRecommendations(input: AiRecommendationInput): Promise<AiRanking>;
}
```

## Evaluation of AI quality

Before broad release, test a fixed benchmark set containing:

* correct but poor English
* partial technical answers
* wrong line but right concept
* right line but wrong reasoning
* Chinese/multilingual explanations
* ambiguous comments
* adversarial prompt-like learner text

Measure:

* false rejection of technically correct answers
* false acceptance of incorrect answers
* confidence calibration
* consistency across paraphrases/languages

## Cost and latency controls

* AI only after user submission
* batch assessment where appropriate
* cache static reference coaching if safe
* deterministic scoring handles easy signals
* model routing can use smaller models for simple communication rewrites
* provide graceful non-AI fallback

## Product decision gates

Do not move from M3 to AI because AI is fashionable. Move when:

1. core MVP is usable
2. structured scoring has known limitations on real learner language
3. learners benefit from more nuanced feedback
4. product has enough stable data contracts to evaluate model quality

Do not move to AI-generated curriculum until curated content and recommendation behaviour provide a trustworthy baseline.
