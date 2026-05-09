# Anchor

**A calmer way through your day.**

Anchor is a daily support app for ADHD, autism, AuDHD, dyslexia, dyspraxia, anxiety-related executive dysfunction, sensory processing differences, burnout, and chronic overwhelm.

> The user is not the problem. The environment, task structure, sensory load, ambiguity, and timing may be the problem. Anchor helps modify those conditions.

---

## What it does

- **Today** — mood check-in, task anchors, essentials view
- **Now** — one task at a time, with a full "I'm stuck" flow
- **Plan** — brain dump, task breakdown (AI), energy-based planning, step-by-step routines
- **TL;DR** — paste any message; get the key point, action items, tone, or a draft reply (AI)
- **Reset** — guided regulation flows for 8 types of overwhelm
- **Me** — communication scripts, sensory tools, essentials checklist, preferences

---

## File structure

```
anchor/
├── index.html
├── README.md
├── src/
│   ├── styles/
│   │   └── main.css
│   ├── data/
│   │   └── state.js
│   ├── app/
│   │   └── router.js
│   ├── services/
│   │   └── api.js
│   └── features/
│       ├── today/today.js
│       ├── now/now.js
│       ├── plan/plan.js
│       ├── tldr/tldr.js
│       ├── reset/reset.js
│       └── me/me.js
```

---

## Getting started

This is a plain HTML/JS app with ES modules — no build step required.

### Run locally

```bash
# Clone the repo
git clone https://github.com/your-username/anchor.git
cd anchor

# Serve with any static server, e.g.:
npx serve .
# or
python3 -m http.server 3000
```

Then open `http://localhost:3000` in your browser.

> Note: ES modules require a server — opening `index.html` directly via `file://` will not work.

### Deploy to GitHub Pages

1. Push to your `main` branch
2. Go to **Settings → Pages**
3. Set source to **Deploy from branch → main → / (root)**
4. Your app will be live at `https://your-username.github.io/anchor`

---

## AI features

The Plan (task breakdown) and TL;DR features call the Anthropic API directly from the browser.

For production use, you should proxy these requests through your own backend to keep your API key secure. Do not expose your API key in client-side code.

To add your key for local development only, edit `src/services/api.js` and add an `Authorization` header:

```js
headers: {
  'Content-Type': 'application/json',
  'x-api-key': 'YOUR_KEY_HERE',        // local dev only
  'anthropic-version': '2023-06-01',
}
```

---

## Design principles

- Predictable navigation — same places every day
- One decision at a time
- Regulation before productivity
- No shame states — missed tasks are "not yet", not "failed"
- No streaks, scores, or hustle language

---

## Roadmap

- [ ] Persistent storage (tasks, preferences)
- [ ] Calendar integration
- [ ] Onboarding flow
- [ ] Body doubling timer
- [ ] Voice input
- [ ] Read-aloud mode
- [ ] Wearable integration
- [ ] Object permanence notes
- [ ] Support person sharing (opt-in)
- [ ] PWA / installable app

---

## Brand voice

**Use:** Start with one step. You can reduce this. The plan can change. This is information, not failure. A smaller version still counts. Restart from any step.

**Avoid:** You failed. Crush your day. Be more disciplined. You broke your streak. Just focus. Try harder.
