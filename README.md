# Bowline

> **A calmer way through your day.**
>
> *Structure when you need it. Never trapped by it.*

Bowline is a daily support app for ADHD, autism, AuDHD, dyslexia, dyspraxia, anxiety-related executive dysfunction, sensory processing differences, burnout, and chronic overwhelm.

Named after the sailor's knot — known as the king of knots — that holds firm under load but unties cleanly when you're ready to move.

> The user is not the problem. The environment, task structure, sensory load, ambiguity, and timing may be. Bowline helps modify those conditions.

---

## What it does

| Section | Purpose |
|---------|---------|
| **Today**   | Mood check-in, task anchors, essentials view |
| **Now**     | One task at a time, with a full "I'm stuck" flow |
| **Plan**    | Brain dump, AI task breakdown, energy-based planning, routines |
| **TL;DR**   | Paste any message — get the key point, action items, tone, or a draft reply (AI) |
| **Reset**   | Guided regulation flows for 8 types of overwhelm |
| **Journey** | Diagnosis tracker — 9 stages, with scripts for GP and workplace |
| **Me**      | Communication scripts, sensory tools, support resource library |

---

## Brand

Full guidelines are in [`docs/brand.md`](docs/brand.md).

- **Name:** Bowline (pronounced *boh-lin*)
- **Primary colour:** `#3F8F73` (deep teal)
- **Wordmark colour:** `#0E3D2E`
- **Typeface:** Atkinson Hyperlegible (regular + bold only)
- **Logo:** monoline knot mark — see `src/assets/bowline-mark.svg`

The bowline mark uses `stroke="currentColor"` so it adapts to whatever colour its parent uses — making dark mode and inverted variants automatic.

---

## File structure

```
bowline/
├── index.html
├── README.md
├── docs/
│   └── brand.md                       # Brand guidelines
└── src/
    ├── assets/
    │   └── bowline-mark.svg           # Logo mark, scalable, monochrome
    ├── styles/
    │   └── main.css                   # Brand tokens + component styles
    ├── data/
    │   └── state.js                   # Single source of truth + BRAND constants
    ├── app/
    │   └── router.js                  # Navigation, branded topbar
    ├── services/
    │   └── api.js                     # Anthropic API for AI features
    └── features/
        ├── splash/splash.js           # Welcome screen with brand mark
        ├── today/today.js
        ├── now/now.js
        ├── plan/plan.js
        ├── tldr/tldr.js
        ├── reset/reset.js
        ├── diagnosis/diagnosis.js     # 9-stage journey tracker
        └── me/me.js                   # Brand-headed support library
```

---

## Getting started

This is a plain HTML/JS app using ES modules — no build step required.

### Run locally

```bash
git clone https://github.com/your-username/bowline.git
cd bowline
npx serve .                            # or python3 -m http.server 3000
```

Open `http://localhost:3000`.

> ES modules require a server. Opening `index.html` directly via `file://` will not work.

### Deploy to GitHub Pages

1. Push to `main`
2. Settings → Pages → Deploy from branch → `main` → `/ (root)`
3. App live at `https://your-username.github.io/bowline`

---

## AI features

The Plan (task breakdown) and TL;DR sections call the Anthropic API directly from the browser. **For production, proxy these through a backend** so your API key isn't exposed.

For local development, add your key to `src/services/api.js`:

```js
headers: {
  'Content-Type': 'application/json',
  'x-api-key': 'YOUR_KEY_HERE',         // never commit
  'anthropic-version': '2023-06-01',
}
```

---

## Design principles

### 1. Predictability
Same things in the same places every day. Stable navigation. No surprise interactions.

### 2. One decision at a time
Each screen asks for one thing. No "plan your day, set goals, choose reminders" mega-prompts.

### 3. Regulation before productivity
If the user is overwhelmed, Bowline doesn't push action — it offers a reset first.

### 4. Externalise executive function
Sequences, reminders, first steps, scripts, and decisions live in the app — not in working memory.

### 5. No shame states
Missed tasks say "This did not happen yet." No streaks, scores, "try harder" language, or failure styling.

### 6. Function-mapped colour
Teal = action. Lavender = thinking. Peach/amber = sensory caution. Sky = calm information. Colour is never decorative.

---

## Accessibility

- **Atkinson Hyperlegible** font throughout — designed for dyslexia and low vision
- All interactive elements have `aria-label` or visible labels
- Colour is never the only indicator of meaning
- Minimum 44px tap targets
- Dark mode supported via `prefers-color-scheme`
- `sr-only` class for screen-reader-only content

---

## Roadmap

- [ ] Replace approximated bowline mark with proper illustrator-drawn version
- [ ] Persistent storage (tasks, preferences across sessions)
- [ ] Onboarding flow (mood, sensory, reminder, neurodiversity profile)
- [ ] Calendar integration (read-only)
- [ ] Body doubling timer
- [ ] Voice input
- [ ] Read-aloud mode
- [ ] PWA / installable app
- [ ] Offline support
- [ ] Backend proxy for AI calls
- [ ] Support person sharing (opt-in, privacy-first)

---

## Voice

**Use:** Start with one step. You can reduce this. The plan can change. This is information, not failure. A smaller version still counts. Restart from any step.

**Avoid:** You failed. Crush your day. Be more disciplined. You broke your streak. Just focus. Try harder.

---

## Licence

TBD — likely MIT for code, with a separate notice for the brand and trademark.
