# Bowline

**A calmer way through your day.**

Bowline is a daily support app for neurodivergent adults — built around how ADHD, autism, AuDHD, dyslexia, dyspraxia, executive dysfunction, and burnout actually feel. Structure when you need it. Never trapped by it.

🔗 **Live app:** [dlockwood13.github.io/Bowline](https://dlockwood13.github.io/Bowline/)

> **Note on this repository.** The code is publicly visible so people can see how Bowline works, but it is **not open-source**. See the [License](#license) section for what is and is not allowed.

---

## What it does

Bowline meets you where your day actually is — not where a productivity app thinks you should be. The plan adapts to how you feel, not the other way round.

### Today
Start by telling Bowline how the day feels — clear, foggy, tired, anxious, overstimulated, burnt out, in pain, low, angry, shut down, wired, or not sure. The screen adapts: suggestions, task visibility, and tools shift to match. A mood log builds quietly in the background so you can see patterns over time. Each day ends with a mood-matched mindfulness quote.

### Now
"What do I do next?" — without pressure. Tap **I am stuck** and Bowline asks why, then responds appropriately (stuck differently when it's "too big" vs "too boring"). **Make smaller** offers tiny first steps. **Body double** and **Timer** give you contained, low-stakes sessions. **Titration tracker** logs BP, HR, weight, mood, and severity-rated side effects when you're on ADHD medication — with history, trend sparklines, and a clean export for your prescriber.

### Plan
Tasks with energy levels, durations, and accents — not just a flat list.

### TL;DR
Paste a confusing message, letter, or email. Get back the actual point, the actual deadline, and a calm suggested response.

### Reset
Short, guided resets for specific states — anxiety, sensory overload, anger, pain, change of plan, shutdown. Not generic mindfulness. State-specific.

### Journey
A stage-by-stage map through neurodivergent assessment and diagnosis in the UK. Four pathways:

- **ADHD** — 10 stages, from "I think I might have ADHD" through titration
- **Autism** — 9 stages, from noticing to living long-term with diagnosis
- **Dyslexia** — 8 stages, including the route question (NHS / DSA / Access to Work / private) and a Tools stage
- **Dyspraxia (DCD)** — 8 stages, with an OT-focused Tools stage

Each stage has its own Overview, Prepare checklist, Scripts (copyable), Support, and Links. Progress saves separately per condition.

### Me
Profile, settings, and crisis support — always one tap away.

---

## Why "Bowline"?

A bowline is a knot that holds firm under load but unties easily when you pull it the right way. It does not lock you in. It does not slip. That is the shape of support we wanted: solid when you need to lean on it, never trapping you.

---

## Built with

Vanilla JavaScript, HTML, and CSS — no build step, no framework. The whole app loads as static files and runs entirely in the browser.

- **State** — single in-memory object (`src/data/state.js`) shared across screens
- **Router** — tiny custom router (`src/app/router.js`) registering screen-render functions
- **AI features** — TL;DR Assist and task breakdown call an Anthropic API endpoint via `src/services/api.js`
- **Icons** — [Tabler Icons](https://tabler-icons.io)
- **Charts** — pure inline SVG, no library
- **Persistence** — currently session-only; persistence is on the roadmap

### Why no framework?

Bowline is meant to be light and fast. The codebase is small enough that anyone (including its author) can read it end-to-end. Frameworks would add weight without benefit at this scale.

---

## Repository structure

```
Bowline/
├── index.html              — Entry point
├── src/
│   ├── app/
│   │   └── router.js       — Screen registration and navigation
│   ├── data/
│   │   └── state.js        — Shared in-memory state
│   ├── services/
│   │   └── api.js          — Anthropic API client
│   ├── screens/
│   │   ├── today/          — Mood-aware home screen
│   │   ├── now/            — Next-step support + titration tracker
│   │   ├── plan/           — Task planning
│   │   ├── tldr/           — Message translator
│   │   ├── reset/          — State-specific resets
│   │   ├── journey/        — Diagnosis pathways (ADHD/autism/dyslexia/dyspraxia)
│   │   └── me/             — Profile and settings
│   └── assets/             — Logo, lockup, fonts
├── LICENSE
└── README.md
```

---

## Design principles

These are the rules Bowline tries to hold to. They show up in copy, layout, and what gets built.

- **Demands are the enemy.** Every screen should reduce, not add, demand load.
- **Adapt, do not lecture.** The app reacts to how the user feels; it does not tell them what they should feel.
- **Words are weight.** Short, literal, direct. No therapy-speak. No corporate cheer. No "you got this!"
- **Diagnosis does not gate support.** Every Journey stage emphasises that strategies work without a label.
- **Crisis is one tap away.** Crisis links are always visible on Me and inside Support tabs.
- **Sensory calm.** Soft palette, generous spacing, no flashing, no popups, no surprise sounds.
- **Mobile first.** Most users will be on a phone, often during a hard moment. Layout has to hold up at ~380px width.
- **No dark patterns.** No streaks designed to manipulate. No FOMO. No notifications for engagement's sake. The titration streak is genuinely useful clinical data — that is the only "streak" in the app.

---

## What this app is not

- **It is not a substitute for assessment, therapy, or medication.** It is a daily companion, not a clinician.
- **It is not a tracker that judges you.** No streaks that punish missed days, no productivity scores.
- **It is not US-focused.** Resources and pathways are UK-specific (NHS, Right to Choose, Access to Work, DSA).
- **It does not collect data.** Currently everything is in-memory and stays in your browser. When persistence is added, it will be local-first.

---

## Roadmap

Rough order, may shift.

- [ ] Local persistence (IndexedDB) so data survives reloads
- [ ] PWA install — work offline, add to home screen
- [ ] Export / import of state (for backup or moving devices)
- [ ] Co-occurrence prompt — when ADHD + autism + dyslexia + dyspraxia overlap is suspected
- [ ] Stage 11 for ADHD — "Stable on medication" (long-term maintenance)
- [ ] More TL;DR templates (NHS letters, DWP letters, university communications)
- [ ] Customisable mood list (people experience different states)
- [ ] Accessibility audit and reduced-motion mode

---

## Feedback and reporting

Code contributions are not currently accepted, but feedback is genuinely welcome — especially:

- **Lived-experience feedback** on copy, framing, and missed angles
- **Stage content corrections** if any UK pathway info is out of date
- **Bug reports** with steps to reproduce
- **Accessibility issues** — colour contrast, screen reader behaviour, keyboard navigation

Open a [GitHub Issue](https://github.com/dlockwood13/Bowline/issues) and let me know.

---

## Acknowledgements

Built with care, by someone who has been on both sides of the system — corporate, public service, mental health support — and got tired of apps that do not work for the people they say they are for.

Resources and pathways draw on guidance from:

- National Autistic Society (autism.org.uk)
- ADHD UK (adhduk.co.uk)
- British Dyslexia Association (bdadyslexia.org.uk)
- Dyspraxia Foundation (dyspraxiafoundation.org.uk)
- NHS, NICE, and Access to Work (UK)

External links go directly to these organisations — Bowline does not re-publish their content.

---

## Crisis resources (UK)

If you are in crisis, these come first:

- **Samaritans** — 116 123 (24/7, free)
- **Shout** — text HOME to 85258 (24/7, free)
- **NHS** — call 111, option 2 for mental health
- **Emergency** — 999 or A&E

---

## License

**Copyright © 2026 D. Lockwood. All rights reserved.**

Bowline is **proprietary software**. The source code is published in this repository for transparency and so users can see how the app works. It is **not open-source**.

**You may:**
- View and read the source code on GitHub
- Run the app in your browser at [dlockwood13.github.io/Bowline](https://dlockwood13.github.io/Bowline/)
- Cite Bowline in writing, research, or commentary, with attribution

**You may not, without prior written permission from the author:**
- Copy, modify, or redistribute the source code or assets
- Fork, host, or deploy your own version of the app
- Use any part of the code in another project, open-source or commercial
- Translate, port, or rebrand the app
- Use Bowline's name, logo, or content for any product or service

If you would like to use, license, or build on Bowline in any way, please [open an issue](https://github.com/dlockwood13/Bowline/issues) or get in touch directly. Reasonable requests — especially from non-profit, educational, or community settings — are welcomed.

For full license terms, see the [LICENSE](LICENSE) file in this repository.

---

## Contact

[GitHub Issues](https://github.com/dlockwood13/Bowline/issues) is the best place to reach out about the project.
