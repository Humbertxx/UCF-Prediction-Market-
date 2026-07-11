# Landing page assets

Drop image files here for the home page hero. Vite serves this folder at `/landing/…`.

## Hero background (required for custom art)

| File | Purpose |
| --- | --- |
| `hero-background.webp` | Primary full-bleed hero image (recommended) |
| `hero-background.jpg` | Fallback if WebP is not used |
| `hero-background.png` | Second fallback |

**Suggested spec (Polymarket-style):**

- Aspect ratio ~16:9 or wider (e.g. 1920×1080 or 2400×1350)
- Dark, high-contrast trading UI or campus crowd photo
- Leave the top third relatively calm — headline copy sits there
- Avoid heavy text baked into the image; the app renders all copy

If no file is present, the hero uses a deck-toned gradient fallback.

## Optional section images

| File | Used in |
| --- | --- |
| `section-how-it-works.webp` | “How it works” band (optional right-side visual) |
| `section-campus.webp` | Campus demo section background accent |

## Notes

- Do not commit licensed stock photos unless you have rights.
- Prefer WebP under ~400 KB for demo load time.
- After adding files, refresh the dev server; no import changes needed.
