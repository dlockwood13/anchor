# Bowline brand guidelines

> A calmer way through your day.

---

## Name

**Bowline** — pronounced *boh-lin* (like the sailor's knot it's named after).

A bowline is known as the king of knots. It holds firm under load, doesn't slip when you need it most, and unties cleanly when you're ready to move.

That is the philosophy of the product:

> Structure when you need it. Never trapped by it.

---

## Logo

The Bowline mark is a simplified, monoline representation of the bowline knot — a small loop above (the crown) and a larger working loop below, with the standing line coming down through them.

### Mark variants

| Use case | File |
|----------|------|
| Primary mark (SVG, scalable) | `src/assets/bowline-mark.svg` |
| Inline anywhere in app | `<svg><use href="#bowline-mark"/></svg>` (the symbol is defined once in `index.html`) |

### Sizing

| Size class | Dimensions | Use |
|------------|------------|-----|
| `bowline-mark`    | 32 × 32 px | Topbar, inline mentions |
| `bowline-mark-lg` | 48 × 48 px | Section headers, Me page header |
| `bowline-mark-xl` | 90 × 90 px | Splash screen, marketing |

### Clearspace

Always leave at least the height of the mark as clear space on all sides. Never crop, rotate, recolour outside the brand palette, or place on a busy background.

---

## Colour

### Primary palette

| Token | Hex | Use |
|-------|-----|-----|
| `--teal`        | `#3F8F73` | Primary brand colour, buttons, mark |
| `--teal-l`      | `#D9F0E4` | Soft backgrounds, mood-positive notices |
| `--teal-m`      | `#9FCFB4` | Mid-tone borders |
| `--teal-d`      | `#1F4F3D` | Text on light teal, dark mode mark |
| `--teal-deep`   | `#0E3D2E` | Wordmark, headings |

### Secondary palette (function-mapped)

Each colour maps to a function, not decoration.

| Token        | Hex       | Meaning |
|--------------|-----------|---------|
| `--lavender` | `#7F77DD` | Thinking, processing, cognitive load |
| `--peach`    | `#F0997B` | Sensory caution, gentle warning |
| `--amber`    | `#EF9F27` | Time pressure, attention |
| `--sky`      | `#85B7EB` | Calm information, reflection |

### Usage rules

- **Teal carries the brand** — use it for primary actions, the mark, and headings
- **Other colours signal function**, never aesthetic — don't introduce them just for variety
- **Never use red** in normal UI flow — failed/missed states use neutral language ("This did not happen yet"), not error styling
- **Always pair colour with text** — colour is never the only indicator of meaning

---

## Typography

**Atkinson Hyperlegible** — designed by the Braille Institute for low-vision and dyslexic readers. Letterforms are deliberately distinct (b/d, p/q, 1/I/l) and character spacing reduces visual crowding.

### Weights

Use only two weights:

- **400 (regular)** — body text, secondary labels
- **700 (bold)** — headings, button labels, primary text

Never use 500/600 (looks heavy against the host UI) or 800/900.

### Type scale

| Element | Size | Weight |
|---------|------|--------|
| Splash title    | 40px | 700 |
| Topbar h1       | 24px | 700 |
| Card main       | 18px | 700 |
| Body / button   | 15px | 700 |
| Card sub        | 13px | 400 |
| Section label   | 11px | 700 (uppercase, 1px tracking) |

### Casing

- **Sentence case** for titles, labels, buttons — never title case
- `UPPERCASE` only for section labels and tags, with letter-spacing
- Never `ALL CAPS` mid-sentence

---

## Voice

### Use

- Start with one step.
- You can reduce this.
- The plan can change.
- This is information, not failure.
- A smaller version still counts.
- Restart from any step.
- Pause before replying.
- You do not need to do everything.

### Avoid

- You failed. / You're behind.
- Crush your day. / Beat your record.
- Be more disciplined. / Just focus.
- You broke your streak.
- Try harder.
- Don't be lazy.

### Tone qualities

Calm · literal · respectful · practical · non-infantilising · non-clinical unless needed · non-shaming · direct.

---

## Lockup variations

The reference image shows six approved lockups:

1. **Mark + wordmark horizontal** — primary use, headers, marketing
2. **Mark + wordmark dark inverted** — for dark backgrounds
3. **Stacked (mark above wordmark)** — square contexts, social avatars
4. **Stacked on brand teal** — celebratory, splash, hero
5. **Mark + wordmark + tagline** — onboarding, About page, footers
6. **Lowercase wordmark** — editorial, press, About

App icons:

- **Solid teal with white mark** — bold home screen presence
- **Soft mint with teal mark** — calmer, wellbeing-app feel

---

## Don't

- Don't tilt or rotate the mark
- Don't add gradients, shadows, or glows
- Don't recolour the mark in non-brand colours
- Don't combine the wordmark with other type families
- Don't use the mark without sufficient clearspace
- Don't crop the mark to less than full visibility
- Don't pair Bowline with productivity language ("hustle", "crush", "grind")

---

## Files

```
src/assets/
└── bowline-mark.svg      # Primary mark, monochrome SVG, currentColor

docs/
└── brand.md              # This document
```

The mark uses `stroke="currentColor"` — set the parent's `color` CSS property (or the SVG's `color` attribute) to recolour without editing the file.
