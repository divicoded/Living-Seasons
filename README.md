# Living Seasons

A premium, living digital seasonal experience built with React 19, Vite, TypeScript, React Three Fiber (Three.js), and Framer Motion. Living Seasons is a from-scratch rebuild of the original "Yokoso 2.0" HTML/CSS/JS prototype, reimagined with Material You dynamic theming, a 3D particle engine, and cinematic motion design.

The app opens on the current month's Indian season, recolors its entire interface from a single seed color, and lets you shift the world between six seasons with a tap, a swipe, or a scroll.

---

## Table of Contents

- [Overview](#overview)
- [Feature Tour](#feature-tour)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture and Major Logics](#architecture-and-major-logics)
  - [State and Persistence](#state-and-persistence)
  - [Season Sync and Dynamic Theming](#season-sync-and-dynamic-theming)
  - [The 3D Particle Scene](#the-3d-particle-scene)
  - [The 2D Particle Layer](#the-2d-particle-layer)
  - [Background and Lighting](#background-and-lighting)
  - [Smooth Scrolling](#smooth-scrolling)
  - [Reveal and Text Animations](#reveal-and-text-animations)
  - [The Flip Clock](#the-flip-clock)
  - [Season Carousel Interactions](#season-carousel-interactions)
  - [Tinder Style Quote Swipe](#tinder-style-quote-swipe)
  - [Profile Card](#profile-card)
  - [GIF Strip](#gif-strip)
  - [Settings Sheet](#settings-sheet)
  - [Easter Egg](#easter-egg)
  - [Loading Screen](#loading-screen)
- [Identity Defaults](#identity-defaults)
- [Running Locally](#running-locally)
- [Building for Production](#building-for-production)
- [Deploying to GitHub Pages](#deploying-to-github-pages)
- [Accessibility and Performance](#accessibility-and-performance)
- [License](#license)

---

## Overview

Living Seasons treats time and weather as a living canvas. Instead of a static landing page, it presents a single scrolling narrative that is themed entirely by the active season. Every surface, shadow, glow, and particle is derived from one Material You seed color, so switching seasons feels like the whole world is reborn.

The experience is divided into seven acts:

1. **Hero** - a greeting that uses your name, the current season, a live flip clock, and today's date.
2. **Season Verse** - a short seasonal poem.
3. **Seasons** - a tabbed carousel you can tap, swipe, scroll, or arrow-key through.
4. **The Hour** - a per-digit flip clock with the current local time and date.
5. **A Thought** - a Tinder style swipeable quote card.
6. **Me** - a profile card with your GitHub avatar, a fixed name, mood, and season stats.
7. **In motion** - a horizontally scrollable strip of GIFs paired with the season quote.

A settings sheet and a hidden easter egg round out the experience.

---

## Feature Tour

- **Month aware launch.** The app reads the current month on load and selects the matching Indian season (Vasant, Grishma, Varsha, Sharad, Hemant, or Shishir). It always opens in the right season for the time of year.
- **Material You dynamic color.** A single seed per season drives the entire palette through CSS `color-mix`. Surfaces, text, glow, and elevation all recolor instantly.
- **3D particle engine.** A React Three Fiber canvas renders season specific particles (petals, sparks, rain, leaves, snow, frost) with postprocessing bloom, chromatic aberration, noise, and vignette.
- **2D sakura and leaf layers.** For Vasant and Sharad, a lightweight 2D canvas paints drifting petals and leaves behind the 3D scene using the original Yokoso draw routines.
- **Cinematic motion.** Framer Motion powers the flip clock, quote swipe, reveal-on-scroll sections, and the loading bloom.
- **Magnetic + gyro profile card.** On desktop the card is magnetically attracted toward the cursor (with spring smoothing) and tilts in 3D; on mobile it tilts from the device gyroscope.
- **Long-press flip easter egg.** Long-pressing the avatar triggers a scale-up + 360° backflip and returns it to place, with the photo kept at native resolution (no quality loss).
- **Tinder swipe quotes.** Drag or tap the quote card to shuffle through seasonal thoughts with like and nope gradients.
- **In motion GIF strip.** A horizontally scrollable strip of seasonal GIFs (drag/swipe the track, or use the nav buttons) with a season quote above it.
- **Persistent preferences.** Your season, name, photo, tagline, and settings survive reloads through `localStorage`.
- **Reduced motion and performance modes.** Respect `prefers-reduced-motion` and offer a performance mode that trims the 3D scene.
- **Easter egg.** A small pulsing dot opens the original Yokoso 2.0 prototype.

---

## Tech Stack

| Concern | Choice |
| --- | --- |
| Framework | React 19 |
| Build tool | Vite 5 |
| Language | TypeScript 5 |
| 3D | Three.js, @react-three/fiber 9, @react-three/drei 10, @react-three/postprocessing 3 |
| Animation | Framer Motion 12 |
| State | Zustand 5 with persist middleware |
| UI primitives | MUI Joy (beta) |
| Icons | react-icons |
| Fonts | Sora, Inter, IBM Plex Mono (Google Fonts) plus local display fonts |

---

## Project Structure

```
yokoso-react/
  index.html                 # Vite entry HTML, meta, font preconnects
  package.json               # Scripts, deps, metadata
  vite.config.ts             # Vite config (port, build target)
  tsconfig.json              # TypeScript config
  .gitignore                 # Ignores node_modules, dist, caches
  LICENSE                    # MIT
  public/
    assets/
      Fonts/                 # Local display font files
      GIFs/                  # Prototype GIFs (easter egg only)
      Icons/                 # Season icon PNGs
    prototype/               # Copied original Yokoso 2.0 (index.html, script.js, styles.css)
  src/
    main.tsx                 # React root render
    App.tsx                  # Composition root, loader gating
    vite-env.d.ts
    store/
      useStore.ts            # Zustand store + persist + defaults
    hooks/
      useSeasonSync.ts       # Month to season mapping + CSS variable injection
      useFeedback.ts         # Haptics + sound feedback helper
    data/
      seasons.ts             # Season theme table (seed, particle, gradient, etc.)
    components/
      Hero.tsx / hero.css
      SeasonVerse.tsx / verse.css
      SeasonCarousel.tsx / carousel.css
      TimeSection.tsx / time.css
      Quotes.tsx / quotes.css
      ProfileCard.tsx / profile.css
      GifStrip.tsx / gifstrip.css
      SettingsSheet.tsx / settings.css
      Background.tsx / background.css
      SeasonParticles2D.tsx / season-particles-2d.css
      ScrollProgress.tsx / scroll-progress.css
      LoadingScreen.tsx / loading.css
      EasterEgg.tsx / easteregg.css
      Reveal.tsx             # Scroll reveal wrapper
      TextReveal.tsx         # Per-word text rise animation
      scene/
        SeasonScene.tsx / scene.css   # R3F canvas + particles + postprocessing
    styles/
      global.css             # Root variables, resets, base elements
      loading.css            # (legacy, kept for reference)
```

---

## Architecture and Major Logics

### State and Persistence

`src/store/useStore.ts` is the single source of truth. It is a Zustand store wrapped in the `persist` middleware, which saves a slice of state to `localStorage` under the key `living-seasons`.

State shape:

- `season` - the active `SeasonId`.
- `name` - the display name shown in the hero (default `DIV`). The profile card uses a fixed `GITHUB_NAME` constant instead.
- `photo` - avatar URL (default is the GitHub avatar for `divicoded`).
- `tagline` - a short bio line (default `Wanderer of the seasons`).
- `settings` - an object of toggles: `particles`, `sound`, `haptics`, `status`, `motion`, `blur`, `perfMode`, `dynamicColor`, `reducedMotion`.

The store uses `version: 2` with a `migrate` function. When the persisted shape changes, the migrate resets identity fields (`name`, `photo`) to the new defaults while preserving other user settings. This prevents stale cached values from overriding fresh defaults after an update.

### Season Sync and Dynamic Theming

`src/hooks/useSeasonSync.ts` runs two effects:

1. On mount it calls `useStore.getState().setSeason(seasonForMonth(new Date().getMonth()))`. The month to season map is: Shishir (Jan, Feb), Vasant (Mar, Apr), Grishma (May, Jun), Varsha (Jul, Aug), Sharad (Sep, Oct), Hemant (Nov, Dec). This guarantees the app always opens on the season for the current month.
2. Whenever `season` or `dynamicColor` changes, it writes `--seed`, `--accent`, and `--light` onto `document.documentElement.style` and sets `document.body.dataset.season`. Because every color in `global.css` is expressed with `color-mix(in srgb, var(--seed) ...)`, the entire UI recolors from those three variables.

Note the hook intentionally uses `useStore.getState().setSeason(...)` rather than a subscribed selector for the initial set, to avoid hook-order issues when the season changes during render.

### The 3D Particle Scene

`src/components/scene/SeasonScene.tsx` mounts an R3F `<Canvas>` with `pointer-events: none` so it never blocks interaction. It picks a particle system based on the active season (`petal`, `spark`, `rain`, `leaf`, `snow`, `frost`) and animates it in `useFrame`. A postprocessing stack adds `Bloom`, `ChromaticAberration`, `Noise`, and `Vignette`. The canvas is `position: fixed; inset: 0; z-index: 1`, sitting behind the content but above the background gradient.

### The 2D Particle Layer

`src/components/background/SeasonParticles2D.tsx` is a 2D canvas that draws sakura petals for Vasant and drifting leaves for Sharad, reusing the original Yokoso draw routines. It is a fixed, full-screen, `pointer-events: none` layer. It runs continuously while the `particles` setting is enabled and only stops when that toggle is off; it only renders for those two seasons to keep the heavier 3D scene as the default.

### Background and Lighting

`src/components/background/Background.tsx` renders a fixed, `pointer-events: none` stack: a mesh gradient, floating blobs, a mouse-following light, film noise, fog, blur, and a vignette. The mouse light listens to `pointermove` and follows the cursor for a subtle parallax glow.

### Smooth Scrolling

The document (not the body) is the scroll container, which keeps `window.scrollTo`, anchor jumps, and `position: sticky` working. `src/components/ScrollProgress.tsx` listens to native scroll and paints a top progress bar.

A key detail: `body` uses `overflow-x: clip` (not `overflow-x: hidden`). Using `hidden` would force `overflow-y` to compute to `auto`, turning the body into its own scroll container and breaking window scrolling. `clip` prevents horizontal overflow without creating a scroll container.

### Reveal and Text Animations

`src/components/Reveal.tsx` wraps sections and animates them in on mount with Framer Motion (opacity, y, scale, blur). It uses an animate-on-mount approach (rather than `whileInView`) so it is reliable. If `reducedMotion` is on, it renders children in a plain `<div>` with no animation.

`src/components/TextReveal.tsx` splits a heading into per-word `<span>` elements with a staggered `--i` custom property, and a CSS keyframe (`word-rise`) makes each word rise and fade in.

### The Flip Clock

`src/components/TimeSection.tsx` shows the current local time as a flip clock. The `Flip` component splits each numeric value into individual characters and renders one `.flip-card` per digit, so every digit has its own flip animation. A colon blinks between hours and minutes, and an AM/PM label follows. Below the clock is a date block (weekday, month, day, year). The clock updates every second from a `setInterval`.

### Season Carousel Interactions

`src/components/SeasonCarousel.tsx` renders the six seasons as a `role="tablist"` of buttons. You can:

- **Tap** a tab to select that season.
- **Swipe** horizontally on touch (threshold 45px, horizontal bias, under 700ms).
- **Scroll** the carousel with wheel or trackpad (delta over 30).
- **Arrow keys** left/right when the carousel is focused.

Each interaction calls `go(next)`, which wraps around the season order and calls `setSeason` plus a small haptic/sound `feedback`.

### Tinder Style Quote Swipe

`src/components/Quotes.tsx` shows one quote card per season. The card is a Framer Motion `drag="x"` element with `dragConstraints` pinned to zero and `dragElastic` for overscroll. As you drag, `useTransform` drives a rotation, a like gradient (right), and a nope gradient (left). On `onDragEnd`, if the horizontal offset exceeds 110px the card swipes and `swipe(dir)` advances to the next quote. A plain `onClick` also advances the quote (tap to shuffle). The `AnimatePresence` block cross-fades the quote text.

### Profile Card

`src/components/ProfileCard.tsx` is the "Me" section. It shows a gradient cover with a breathing glow, a spinning conic avatar ring around your GitHub photo with an online pulse dot, your **name** (fixed to the constant `GITHUB_NAME = 'Div'`, the GitHub handle — editing "Your name" in settings no longer changes this card), a GitHub link, a status pill, chips (mood, weather, local time, India, season), and a "Today's reflection" quote from the season description.

**Magnetic + gyro motion:** On desktop a `pointermove` listener computes a magnetic pull (the card translates toward the cursor within a radius) and a 3D tilt, both smoothed with Framer Motion springs. On mobile a `deviceorientation` listener drives the tilt from the gyroscope (with iOS permission request). The card is wrapped in a `perspective` container so the 3D tilt reads correctly.

**Long-press flip easter egg:** Pressing and holding the avatar for 500ms fires a haptic `feedback('select', 24)` and runs a Framer Motion animation that scales the avatar up to 1.6x and rotates it 360° on the Y axis, then returns it to place. `backface-visibility: hidden` and native-resolution `object-fit: cover` keep the photo crisp at every scale.

### Settings Sheet

`src/components/SettingsSheet.tsx` is a compact bottom sheet (opened by the settings button) with two sections: **Identity** (editable name and tagline, which affect the hero, not the fixed profile name) and **Experience** (seven switches: Ambient particles, Motion & animation, Background blur, Dynamic color, Performance mode, Sound, Haptics). The Season selector and Photo upload were intentionally removed to keep the sheet minimal. Changes write straight to the Zustand store and persist.

### GIF Strip

`src/components/GifStrip.tsx` is the "In motion" section: a single horizontally scrollable row of seven GIFs (`public/assets/GIFs/anim1-anim7.gif`) with the season quote above it. The `.gifstrip-track` is `overflow-x: auto` with `scroll-snap-type: x mandatory` and `-webkit-overflow-scrolling: touch`, so it scrolls via trackpad/wheel on desktop and via touch swipe on mobile (the items themselves are not draggable). Prev/next nav buttons nudge the track by `scrollBy`, and each nav/drag action fires a small haptic/sound `feedback`.

### Easter Egg

`src/components/EasterEgg.tsx` renders a small pulsing dot (bottom-left). Clicking it opens a popover that links to `/prototype/index.html`, the original Yokoso 2.0 prototype copied into `public/prototype`.

### Loading Screen

`src/components/LoadingScreen.tsx` shows a blooming flower loader with a percentage and progress bar. A `setInterval` ramps a counter to 100, then a `setTimeout` calls `onDone` (which flips `loaded` in `App` and unmounts the loader). The loader is `position: fixed; inset: 0; z-index: 9999`, so it must dismiss to free interaction. The completion logic is guarded so it fires exactly once even if the parent re-renders.

---

## Identity Defaults

The app ships with these defaults so it feels personal on first load:

- **Name (hero):** `DIV`
- **Profile name (fixed):** `Div` (GitHub handle, not editable from settings)
- **Photo:** `https://avatars.githubusercontent.com/u/217160893?v=4` (the GitHub avatar for `divicoded`)
- **Tagline:** `Wanderer of the seasons`
- **Status:** `Building in the open`
- **GitHub:** `https://github.com/divicoded`

These live in `src/store/useStore.ts` (and `GITHUB_NAME`/`GITHUB_URL` constants in `ProfileCard.tsx`). Because state is persisted, the first load uses the defaults; later visits reuse your saved values. The `migrate` function in the store resets identity fields to these defaults after a version bump, so a stale cache never overrides them.

---

## Running Locally

Requirements: Node 18+ (Node 20+ recommended) and npm.

```bash
# install dependencies
npm install

# start the dev server (opens at http://localhost:5173)
npm run dev
```

The dev server prints the local URL. If port 5173 is busy it moves to 5174, and so on.

---

## Building for Production

```bash
npm run build
```

This runs `tsc -b && vite build` and emits a static site to `dist/`. Preview it locally with:

```bash
npm run preview
```

---

## Deploying to GitHub Pages

This repo includes a ready-to-use GitHub Actions workflow at `.github/workflows/deploy.yml`. On every push to `main` (or manual dispatch) it checks out the code, sets up Node 20 with npm cache, runs `npm ci` then `npm run build`, uploads the `dist/` folder as a Pages artifact, and deploys it.

To enable it:

1. Push this repo to GitHub.
2. Go to **Settings -> Pages -> Build and deployment -> Source -> GitHub Actions**.
3. Push to `main`; the "Deploy to GitHub Pages" workflow runs automatically.

If you serve from a subpath (for example `username.github.io/living-seasons`), add a `base` to `vite.config.ts`:

```ts
export default defineConfig({
  base: '/living-seasons/',
  plugins: [react()],
});
```

Then rebuild. The `repository`, `homepage`, and `bugs` fields in `package.json` already point at `divicoded/living-seasons`.

---

## Accessibility and Performance

- **Reduced motion.** When the OS requests reduced motion, or the `reducedMotion` setting is on, reveal and text animations are skipped and the loader still dismisses.
- **Performance mode.** The `perfMode` setting trims the 3D scene for low power devices.
- **Touch.** The magnetic cursor effect is desktop-only; on coarse pointers the profile card uses gyroscope tilt instead. The GIF strip scrolls via native touch swipe.
- **Haptics.** The `useFeedback` hook calls `navigator.vibrate` (gated by the `haptics` setting) on supported devices - avatar long-press, GIF strip nav, carousel, and quote interactions. Sound uses a tiny WebAudio blip after a user gesture.
- **Pointer events.** Every decorative layer (3D canvas, 2D particles, background, cursor, scroll progress) uses `pointer-events: none` so it never intercepts clicks, taps, or swipes. Only the content and controls are interactive.
- **Semantics.** The season selector uses a proper `tablist`/`tab` role; buttons carry accessible labels; decorative art is `aria-hidden`.

---

## License

Released under the MIT License. See [LICENSE](./LICENSE).
