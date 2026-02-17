# CLAUDE.md — Permanent Instructions

## Rules (no exceptions, ever)

1. **Only change what is explicitly asked.** No refactoring, no "improvements", no variable renames, no scope creep. If it wasn't requested, don't touch it.
2. **Never rewrite working code.** Fix the specific issue. Do not restructure, reorganize, or rewrite surrounding code.
3. **Read every file fully before making any edit.** Understand what exists before changing anything.
4. **The user's word is final.** When told to use a specific model, library, approach, or pattern — do exactly that. No substitutions, no "better" alternatives.
5. **Never introduce new bugs.** If a fix risks breaking something else, stop and ask first.
6. **No lazy or generic responses.** Use this codebase and the user's instructions as the only source of truth. Never rewrite from assumptions or statistical patterns.

## Project

- This is an experimental AI pet app (vanilla JS, no build tools, no framework)
- Uses Google Gemini API (currently gemini-2.5-flash-lite)
- API key stored in browser localStorage
- Personality driven by configurable sliders (config.txt / localStorage)
- No server-side code. Runs entirely in browser.
