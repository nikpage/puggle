# Puggle Brainstorm

Working design notes for the AI pet personality and memory systems.

---

## Personality System

### Current State
- Three sliders: emotion, affection, energy (config.txt / localStorage)
- Weights control how much each trait influences the prompt
- Static — values don't change based on interaction

### Drift via Trailing Average

Personality traits should shift over time based on how the user interacts with the pet, but not from any single interaction. The drift rate is a **trailing average** — keep a rolling window of recent interactions (e.g. last ~20), each tagged by which trait they relate to. The trend across that window determines which direction a trait drifts and how fast.

- One play session doesn't make the pet hyper. Consistent play over time does.
- Storage: array in localStorage, pop oldest, push newest.
- Drift is gradual and reversible — neglect a trait and it fades back.

### Trait Tradeoffs / Correlations

High trait values aren't just positives — they come with emotional consequences. This is what makes the pet feel real.

Known pairings to start with:

| Trait | Consequence when high | Trigger condition |
|---|---|---|
| Affectionate | Easily hurt / pouty | Ignored, interaction frequency drops |
| Energetic | Restless, misbehaves | Understimulated, boring interactions |
| Loyal | Jealous, possessive | User mentions other pets/AIs |
| Intelligent | Stubborn, opinionated | Told to do something it "disagrees" with |

These are not separate sliders. They're behavioral consequences injected into the prompt when the trait is above a threshold AND the trigger condition is met.

Start with 3-4 pairings. Gemini will fill personality gaps naturally if the prompt gives it room.

### Species Variation (future)

Different pet types could have different baseline ranges, drift rates, and which correlations are strongest. A cat drifts toward independence; a dog drifts toward loyalty. Defined per species, not hardcoded.

---

## Memory System

### Problem

Storing every back-and-forth is impractical and wasteful. Most interactions are forgettable. But some moments matter — and a pet that remembers nothing feels hollow.

### Interaction Weighting (1-100)

Each interaction gets scored on significance (1-100). The score determines how long it persists and how much it shapes personality.

**Tiers:**

| Score Range | Longevity | Personality Impact | Example |
|---|---|---|---|
| 1-30 (low) | Short-lived individually, but repeated low-value interactions build **meta-memories** — patterns, not specifics | Indirect — the pattern contributes, not any single event | "User usually says hi in the morning", "User likes puns" |
| 31-70 (mid) | Long recall, even after a long time | Little to none — these are episodic, not formative | "That time we talked about space and you made a joke about Pluto", "Remember when milk came out of your nose at McDonalds" |
| 71-100 (high) | Persistent — effectively permanent | Strong and lasting — these shape who the pet becomes | Surprise events (good or bad), major emotional moments, first meeting, user sharing something deeply personal |

**Key ideas:**
- Low-value repetition is additive. 50 small interactions about food → meta-memory "user talks about food a lot" without storing each one.
- Mid-value memories are the color and texture of the relationship. They don't change the pet, but they make it feel like a shared history.
- High-value memories are rare and formative. They should be hard to trigger and hard to forget.

### Scoring

Open question: who scores the interaction? Options:
- Gemini scores it as part of the response (ask it to rate significance 1-100)
- Heuristic based on interaction length, emotional keywords, novelty
- Hybrid — heuristic first pass, Gemini confirms/adjusts for borderline cases

### Storage

Considering **pgvector** for vector-based retrieval — store embeddings of memories so the pet can recall relevant ones based on conversational context, not just recency.

**Open questions:**
- How much detail to store per memory? Full quotes? Summaries? Just the vector?
  - Probably summaries + vector. Quotes for high-value memories. Vectors alone lose the texture.
- Graph RAG was considered but feels like overkill for a pet's memory. Relationships between memories could matter eventually, but vector similarity gets you 80% of the way.
- pgvector requires a server component — this breaks the current "runs entirely in browser" model. Need to decide if memory is the feature that justifies a backend, or if there's a client-side alternative (IndexedDB + lightweight embedding).

---

## Open Questions

- Where does the scoring threshold live? Hardcoded? Configurable? Per-species?
- Should the pet be able to "forget" mid-value memories over time (decay), or do they persist once stored?
- How does memory interact with personality drift? Does recalling a high-value sad memory temporarily shift emotion down?
- Client-side vs server-side storage — what's the boundary?
