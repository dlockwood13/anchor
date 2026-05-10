# Brand assets

Drop the two brand image files into this folder. The app expects them at these exact filenames:

## Required files

### `bowline-icon.png`

The square app-icon style mark — teal background with the white knot.

| Use | Size in app |
|-----|-------------|
| Topbar (every screen) | 38 × 38 px |
| Me page header (replaced by lockup) | — |
| Favicon (32×32, 192×192) | scaled |
| Apple touch icon | 180 × 180 |

**Recommended export:** `512 × 512 px` PNG. The browser scales it down — but uploading a high-resolution master means it stays crisp on Retina displays and any future use cases (app store, social avatars, etc.).

### `bowline-lockup.png`

The horizontal lockup — knot mark + "Bowline" wordmark + divider + "A CALMER WAY / through your day" tagline. (The second image you supplied.)

| Use | Size in app |
|-----|-------------|
| Splash screen | up to 100 px tall, max 100% width |
| Me page header | up to 80 px tall |
| Open Graph / social sharing preview | scaled |

**Recommended export:** `1200 × 320 px` PNG with a transparent background. This works across all the contexts above and makes a good social-share preview at the same time.

## Where they're referenced

| File | Reference |
|------|-----------|
| `index.html` | favicons + Open Graph meta tag |
| `src/app/router.js` | topbar mark on every screen |
| `src/features/splash/splash.js` | splash screen lockup |
| `src/features/me/me.js` | Me page header lockup |

## Tips

- **Transparent background** is essential for the lockup — it sits inside coloured cards in the Me section, so any white background will show.
- **The icon can have its teal background baked in** — it always sits on a neutral surface (topbar, app icon).
- If you ever want to recolour the mark in code later, supply a separate transparent-background version and swap CSS `filter` properties to recolour it. But you don't need this for the MVP.

## Optional extras

If you want to add later:

- `bowline-icon-dark.png` — white-stroke knot on transparent background, for use in the topbar in dark mode (the image-based mark doesn't auto-adapt the way the SVG one did)
- `bowline-mark.svg` — a vector version of the icon, for the favicon and any place where infinite scaling matters
- `bowline-lockup-dark.png` — light-coloured wordmark for dark backgrounds
- `bowline-og.png` — purpose-built 1200 × 630 social sharing image with the lockup centred on a clean background

## Dark mode caveat

The current setup uses the same teal-background icon in light and dark mode. It still looks good against the dark topbar (the icon is self-contained) but the wordmark in the lockup is dark green — it'll look a bit muted on dark backgrounds.

If you care about dark mode polish, add a `bowline-lockup-dark.png` with light-coloured text and update `splash.js` and `me.js` to swap based on `prefers-color-scheme`. Happy to wire this up if you want.
