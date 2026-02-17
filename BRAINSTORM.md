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

### Design Principle

The pet talks, so it's not a pure animal analogy — but the *mind* underneath should still be more associative than narrative. A dog doesn't remember stories. It remembers patterns, feelings, and what works. The speech is the interface; the memory engine is closer to Pavlov than a diary.

That said, the goal is for the user to **feel a relationship**. Some narrative recall will help there — the pet doesn't need to remember everything, but surfacing the right moment at the right time makes the bond feel real.

### Memory Types

Memory is organized by **type**, not just significance score. Each type forms differently and serves a different purpose.

| Type | What it stores | How it forms | Feels like |
|---|---|---|---|
| **Association** | Trigger → response pattern | Repetition (Pavlovian). Can form surprisingly fast. | "Ooh, you said the W word!" |
| **Conditioning** | Pet behavior → user reaction | Reinforcement (operant). Pet learns what *works*. | Pet figures out that being pouty gets more attention. Learns to train *you*. |
| **Emotional imprint** | Vague feeling tied to a topic, word, or event | Single strong stimulus or repeated moderate ones | "I don't like when you talk about that." No story, just the residue. |
| **Narrative** | A specific shared moment | Rare. High-significance interactions only. | "Remember when we..." — used sparingly for relationship texture. |

**Key insight:** Associations and conditioning are the workhorse. They're cheap, fast, and feel authentic. Narrative memories are expensive and should be rare — but they're what make the user feel known.

### Interaction Scoring (1-100)

Each interaction gets a significance score. The score determines which memory type(s) it feeds and how long it persists.

| Score | Longevity | What it feeds | Example |
|---|---|---|---|
| 1-30 | Short-lived alone, but repetition builds **meta-memories** (patterns, not specifics) | Associations, conditioning | "User usually says hi in the morning", "Being excited gets more play time" |
| 31-70 | Long recall, even after a long time | Emotional imprints, occasional narrative | A funny moment, a mildly surprising conversation topic |
| 71-100 | Persistent — effectively permanent | Narrative + strong emotional imprint + personality impact | First meeting, user sharing something deeply personal, surprise events |

Low-value repetition is additive: 50 small food-related interactions → meta-memory "user talks about food a lot" without storing each one.

### Scoring

Open question: who scores? Options:
- Gemini scores as part of its response (rate significance 1-100)
- Heuristic (interaction length, emotional keywords, novelty)
- Hybrid — heuristic first pass, Gemini adjusts borderline cases

### Proactive Recall — The Google Photos Inspiration

Google Photos surfaces old memories unprompted — "3 years ago today." But the interesting part is when it surfaces *related* photos (not just date-matched), or ones that suggest it has a sense of humor or emotional awareness. It's not just a timeline; it's curated recall.

The pet could do something similar: **unprompted memory surfacing.** Not just responding to the user, but occasionally volunteering a memory when context is right — or even when it's slightly *wrong* in a charming way.

- Surface an old association when a new conversation echoes it
- Misremember details slightly (pet-like, not broken)
- Bring up something just because it's been a while — "I was just thinking about that time..."
- Juxtapose two unrelated memories in a way that's accidentally funny or touching

This isn't retrieval-augmented generation in the traditional sense — it's more like *mood-augmented recall*. The pet's current emotional state + conversation context → what bubbles up. Worth exploring how to make this feel natural rather than mechanical.

### Storage

**Database:** pgvector for vector-based retrieval. Local DB that the user can back up to cloud at will. A server/backend component is expected as the project grows.

**What to store per memory:**
- Associations: trigger + response pattern, reinforcement count. Lightweight.
- Conditioning: pet behavior + observed user reaction + success rate. Lightweight.
- Emotional imprints: topic/keyword + valence + intensity. No narrative needed.
- Narrative memories: summary + key quotes + vector embedding. Richer storage, but rare.

Graph RAG considered but probably overkill. Vector similarity handles most retrieval needs.

---

## Open Questions

- Where does the scoring threshold live? Hardcoded? Configurable? Per-species?
- Should memories decay? Mid-value ones could fade, making the pet feel more natural. But some "random" old memories surfacing is charming (see Google Photos note).
- How does memory interact with personality drift? Does recalling a high-value sad memory temporarily shift emotion?
- How does the proactive recall system decide *when* to surface a memory vs. just respond normally? Frequency matters — too often is annoying, too rare is invisible.
- Can the pet develop "favorite memories" it returns to — the way a person retells the same stories?
