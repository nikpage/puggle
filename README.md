# AI Pet — Phase 1

A simple AI pet that you can chat with. Its personality is driven by configurable sliders that influence how it responds.

## Overview

This is Phase 1 — a browser-based chat interface where an AI pet responds according to personality settings you control. The pet speaks at a toddler level (~2-3 year old vocabulary and syntax).

## Files

```
ai-pet/
├── index.html        — Chat interface
├── app.js            — Main logic (reads config, calls AI, handles chat & notifications)
├── style.css         — Styling
├── config.txt        — Personality sliders (user-editable)
├── config-ui.html    — UI for editing personality settings
└── README.md         — This file
```

## Setup

1. Add your API key in `app.js` (Claude or Gemini)
2. Open `index.html` in a browser
3. Allow browser notifications when prompted (for pet attention-seeking)
4. Chat with your pet

## Personality System

The pet's personality is controlled by **sliders** — each ranging from **-100 to +100**, with **0 as neutral**.

### Default Sliders

| Slider     | -100 (low end) | +100 (high end) |
|------------|----------------|-----------------|
| Emotion    | Depressed      | Joyful          |
| Affection  | Aloof          | Needy           |
| Energy     | Lethargic      | Vibrant         |

### Weights

- Each slider has a **weight** value
- All weights must add up to **100%**
- Adding/removing sliders auto-redistributes weights
- Weights are still manually editable after redistribution

### Config Format

Edit `config.txt` directly or use `config-ui.html`:

```
emotion=50|weight=33
affection=75|weight=34
energy=40|weight=33
```

## How It Works

1. Slider values from config are included in the AI prompt
2. The AI responds in character based on those personality values
3. Higher affection + energy = pet seeks attention more often (via browser notifications)
4. Click a notification to open the chat with the pet's message

## Future Vision

This is the foundation for a larger interactive pet ecosystem:

- **Egg/hatchling system** — how you care for the egg shapes the pet's personality
- **Visual representation** — on-screen pet with editable appearance
- **Phone integration** — camera, haptic feedback, push notifications
- **Pet-to-pet interaction** — shared spaces where pets meet
- **Realistic consequences** — neglect affects personality; may need "pet psychologist" game mechanics to fix
- **DNA system** — configs become the pet's DNA, not directly user-accessible in later phases
