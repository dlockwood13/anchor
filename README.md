# Anchor

**A calmer way through your day.**

Anchor is a daily support app for ADHD, autism, AuDHD, dyslexia, dyspraxia, anxiety-related executive dysfunction, sensory processing differences, burnout, and chronic overwhelm.

> The user is not the problem. The environment, task structure, sensory load, ambiguity, and timing may be the problem. Anchor helps modify those conditions.

---

## What it does

| Section | Purpose |
|---------|---------|
| **Today** | Mood check-in, task anchors, essentials view |
| **Now** | One task at a time, with a full "I'm stuck" flow |
| **Plan** | Brain dump, task breakdown (AI), energy-based planning, step-by-step routines |
| **TL;DR** | Paste any message — get the key point, action items, tone, or a draft reply (AI) |
| **Reset** | Guided regulation flows for 8 types of overwhelm |
| **Me** | Support resource links, communication scripts, sensory tools, essentials, preferences |

---

## Design decisions

### Typography — Atkinson Hyperlegible
Designed for low-vision and dyslexic readers. Letterforms are deliberately distinct to prevent common reversals (b/d, p/q) and character spacing reduces visual crowding.

### Colour with meaning
Each colour maps to a function, not decoration:
- **Teal** — action and progress
- **Lavender** — thinking and processing
- **Peach / amber** — caution and sensory load
- **Sky blue** — calm information

### No shame states
Missed tasks say "This did not happen yet." There are no streaks, scores, or "try harder" prompts.

---

## File structure

```
anchor/
├── index.html
├── README.md
└── src/
    ├── styles/
    │   └── main.css
    ├── data/
    │   └── state.js
    ├── app/
    │   └── router.js
    ├── services/
    │   └── api.js
    └── features/
        ├── today/today.js
        ├── now/now.js
        ├── plan/plan.js
        ├── tldr/tldr.js
        ├── reset/reset.js
        └── me/me.js
```

---

## Getting started

This is a plain HTML/JS app using ES modules — no build step required.

### Run locally

```bash
# Clone the repo
git clone https://github.com/your-username/anchor.git
cd anchor

# Serve with any static file server
npx serve .
# or
python3 -m http.server 3000
```

Then open `http://localhost:3000`.

> **Note:** ES modules require a local server. Opening `index.html` directly via `file://` will not work in most browsers.

### Deploy to GitHub Pages

1. Push your code to the `main` branch
2. Go to **Settings → Pages**
3. Set source to **Deploy from branch → main → / (root)**
4. Your app will be live at `https://your-username.github.io/anchor`

---

## AI features

The Plan (task breakdown) and TL;DR sections call the Anthropic API directly from the browser.

**For production use**, proxy these requests through your own backend so your API key is never exposed in client-side code.

For **local development only**, add your key to `src/services/api.js`:

```js
headers: {
  'Content-Type': 'application/json',
  'x-api-key': 'YOUR_KEY_HERE',         // local dev only — never commit this
  'anthropic-version': '2023-06-01',
},
```

---

## Accessibility

- **Atkinson Hyperlegible** font throughout
- All interactive elements have `aria-label` or visible labels
- Colour is never the only indicator of meaning — text labels always accompany colour
- Large tap targets (minimum 44px)
- Dark mode supported via CSS custom properties
- Reduced motion respected via `prefers-reduced-motion` (add to CSS as needed)
- `sr-only` class available for screen-reader-only content

---

## Support resources (Me tab)

The Me section links to curated external resources across four categories:

- **ADHD** — ADHD Foundation, CHADD, How to ADHD, ADDitude Magazine
- **Autism** — Autistic UK, Autism Toolbox, Ambitious About Autism
- **Strategies** — Pomodoro, interoception, sensory diet, executive function
- **Crisis** — Mind, Samaritans, Shout (text 85258), NHS crisis care

---

## Brand voice

**Use:** Start with one step. You can reduce this. The plan can change. This is information, not failure. A smaller version still counts. Restart from any step.

**Avoid:** You failed. Crush your day. Be more disciplined. You broke your streak. Just focus. Try harder.

---

## Roadmap

- [ ] Persistent storage (tasks, preferences across sessions)
- [ ] Onboarding flow
- [ ] Calendar integration
- [ ] Body doubling timer
- [ ] Voice input
- [ ] Read-aloud mode
- [ ] Object permanence notes ("where I put it")
- [ ] Support person sharing (opt-in, privacy-first)
- [ ] Wearable integration
- [ ] PWA / installable app
- [ ] Offline support
