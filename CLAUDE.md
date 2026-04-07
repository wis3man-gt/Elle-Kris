# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Static marketing website for Elle & Kris's Construction. No build step — open `index.html` directly in a browser or use a local dev server. Deployed to Vercel.

## Development

No build system or package manager. Run locally with any static file server, e.g.:

```bash
npx live-server .
# or
python -m http.server
```

## Architecture

Single-page site (`index.html`) with vanilla CSS and JS. All sections live in `index.html` in this order: hero (nav floats inside), logos strip, why-us, services, projects, footer.

### CSS

`css/main.css` is the entry point — it imports everything in order:

```
variables.css     ← all design tokens (colors, spacing, typography, radii, shadows, transitions)
reset.css         ← base resets
components.css    ← shared: .btn--primary / --ghost / --outline
sections/nav.css
sections/hero.css
sections/logos.css
sections/why-us.css
sections/services.css
sections/projects.css
sections/footer.css
```

Always use CSS custom properties from `variables.css`. Never hardcode values that already exist as tokens. Spacing, font sizes, colors, and radii all have named tokens.

CSS class naming follows BEM with a section prefix: `.nav__link`, `.hero__video`, `.why-us__stat-num`, etc. State classes use the `is-*` prefix: `is-open`, `is-visible`, `is-expanded`.

### JavaScript

`js/main.js` — vanilla JS only, no frameworks or dependencies. Handles:
- Why-us stat count-up (IntersectionObserver)
- Services card staggered entrance (IntersectionObserver)
- Logos marquee with playback-rate easing on hover (Web Animations API)
- Phone number copy to clipboard (desktop + mobile variants)
- Projects fade-up on scroll (IntersectionObserver)
- Mobile nav burger + accordion (aria attributes managed manually)
- Hero video viewport pause/play (IntersectionObserver)

### Assets

- `assets/svg/` — all icons and logos as SVG
- `assets/videos/heroVideo.mp4` — background video for hero section
