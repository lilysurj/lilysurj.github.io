# Project Handoff

## Project Overview
Personal website with a "Creation of Adam" halftone intro overlay animation.

## Tech Stack
- React 19 + TypeScript (Vite build)
- Tailwind CSS v4 (`@tailwindcss/vite`)
- No external UI libraries

## Color Tokens
- Background / Klein Blue: `#002FA7`
- Hands / Ivory: `#EEFEEE`

---

## Session: 2026-07-27

### What was done
Created `src/components/IntroOverlay.tsx` — a self-contained React component that ports the existing vanilla `intro.html` animation into the React/TypeScript stack.

### Component: `IntroOverlay`
**File:** `src/components/IntroOverlay.tsx`

**Animation sequence:**
1. On mount: `requestAnimationFrame` triggers opacity fade-in of both hands
2. After 450ms: both hands slide 20 world-units toward each other (left hand right, right hand left) via CSS `left` transition with `cubic-bezier(.4,0,.2,1)` easing over 1.4s
3. On `transitionend` (propertyName: `'left'`) of the left hand: spark fires, overlay fades out (0.9s)
4. After 900ms: component unmounts (`isDismissed = true`)

**World-unit scaling:**
Uses CSS custom property `--u: min(calc(100vw / 1600), calc(100vh / 900))` on the container div. All hand positions and SVG dimensions use `calc(var(--u) * N)`. This keeps both hands identically scaled at all viewport sizes.

**Key positions (world-units, reference canvas 1600×900):**
| Element | top | left (resting) | left (touching) |
|---------|-----|----------------|-----------------|
| Left hand wrap | 286 | 378 | 398 |
| Right hand wrap | 165.8 | 697.6 | 677.6 |
| Spark | 450 | 800 | — |

**SVG data:**
- Left hand: `viewBox="0 0 460 170"` — halftone dot cloud
- Right hand: `viewBox="0 0 460 290"` — halftone dot cloud
- Stored as raw SVG circle string constants, injected via `dangerouslySetInnerHTML` (static authored data, no XSS risk)

**State:**
```ts
const [isVisible, setIsVisible]   = useState(false);  // hands faded in
const [isTouching, setIsTouching] = useState(false);  // hands sliding
const [isFading, setIsFading]     = useState(false);   // overlay fading
const [isDismissed, setIsDismissed] = useState(false); // unmounted
const [sparkFired, setSparkFired]  = useState(false);  // spark animating
const hasContacted = useRef(false);                    // dedupe guard
```

**Skip button:** `fixed bottom-6 right-6 z-50` — calls `dismiss()` which sets `isFading = true` immediately.

**Accessibility:** `role="dialog" aria-modal="true"` on overlay, `aria-hidden="true"` on SVGs and spark, `aria-label="Skip intro"` on button.

---

## Session: 2026-07-27 (update)

### What changed
Resized hands and repositioned them to span from screen edges.

**Previous:** world-unit `--u` system sized hands to fit a 1600×900 canvas; hands were small and centered in the middle of the screen.

**New:** viewport-unit layout — each hand is `55vw` wide, left wrist at `left: 0`, right wrist at `left: calc(100vw - 55vw)`. The `--u` system was removed entirely.

**Key constants** (all in `src/components/IntroOverlay.tsx` lines 1–27):
- `HAND_W = '55vw'`
- `LEFT_H = 'calc(55vw * 170 / 460)'` — exact aspect ratio from viewBox
- `RIGHT_H = 'calc(55vw * 290 / 460)'`
- `LEFT_TOP = 'calc(50vh - 55vw * 164 / 460)'` — places left fingertip at vertical center
- `RIGHT_TOP = 'calc(50vh - 55vw * 284 / 460)'` — places right fingertip at vertical center
- `SLIDE = '6vw'` — how much each hand slides during animation
- `SPARK_LEFT = 'calc(6vw + 55vw * 402 / 460)'` — fingertip meeting point x (~54vw)
- `SPARK_TOP = '50vh'`

**Derivation:** Fingertip coordinates (402, 164) for left and (122, 284) for right come from the original `intro.html` world data: spark at (800wu, 450wu), left touching at (398wu, 286wu), right touching at (677.6wu, 165.8wu). The right hand's shoulder may extend above the viewport on widescreen; `overflow: hidden` clips it.

---

### How to integrate in App.tsx
```tsx
import { useState } from 'react';
import { IntroOverlay } from './components/IntroOverlay';

export default function App() {
  return (
    <>
      <IntroOverlay />
      <main>
        {/* your site content */}
      </main>
    </>
  );
}
```
The overlay mounts on top via `fixed inset-0 z-[100]` and removes itself from the DOM once dismissed — no conditional rendering needed in `App.tsx`.

---

## Session: 2026-07-27 (homepage)

### What was done
Created `src/components/HomePage.tsx` — the post-intro home screen with an animated nav reveal.

### Layout
- Klein Blue (`#002FA7`) full-screen background via `fixed inset-0`
- `lily surjadinata` — `position: fixed; bottom; left`, `font-weight: 900`, `font-size: clamp(2.5rem, 6.5vw, 6rem)`, Inter font
- Arrow icon — outlined left-pointing triangle SVG (`<polygon points="28,2 6,16 28,30">`)
- Nav items — `gallery | projects | blog | about`, spanned across `left: 28vw` → `right: 75vw` via `display: flex; justify-content: space-between`

### Animation: arrow flies right→left on click
Arrow is always `position: fixed; top: 1.5rem; left: 1.5rem`.

| State | transform | animation |
|-------|-----------|-----------|
| Default (closed) | `translateX(calc(100vw - 5rem))` — offsets to top-right | none |
| Animating | `undefined` (keyframe takes over) | `flyLeft 1.2s cubic-bezier(0.4,0,0.2,1) both` |
| Open | `translateX(0)` | none |

`@keyframes flyLeft` in `src/index.css` — tilts -10deg at 20–80% progress, levels at 0% and 100%.

### Nav reveal via setTimeout
Each nav item has `opacity: 0 → 1` via `transition: opacity 0.35s ease`. Items are revealed by adding to a `Set<NavItem>` state after the plane's estimated crossing time:

| Item | x position | reveal delay |
|------|-----------|--------------|
| about | ~75vw | 280ms |
| blog | ~59vw | 480ms |
| projects | ~44vw | 660ms |
| gallery | ~28vw | 860ms |

Items have `tabIndex={-1}` while hidden for a11y.

### Integration
`App.tsx` renders `<HomePage />` behind `<IntroOverlay />` (z-100). Once the overlay unmounts, the homepage is visible.

### onNavigate prop
`HomePage` accepts `onNavigate?: (page: NavItem) => void` for future page routing. Nav buttons call this when clicked.

### Source assets
- `inspo/left-hand.png` — original hand image used to generate SVG dots
- `inspo/right-hand.png` — original hand image
- `inspo/website color palette.png` — color reference
- `intro.html` — working vanilla HTML/CSS/JS prototype (source of truth for animation timing and positions)

---

## Session: 2026-07-27 (nav ordering + routing)

### What changed
- Reordered `NAV_ITEMS` in `HomePage.tsx` to alphabetical left→right: `['about', 'blog', 'gallery', 'projects']`
- Updated `REVEAL_AT` timings to match new positions (plane flies right→left, so rightmost = revealed first):
  | Item | x position | reveal delay |
  |------|-----------|--------------|
  | projects | ~75vw | 280ms |
  | gallery | ~59vw | 480ms |
  | blog | ~44vw | 660ms |
  | about | ~28vw | 860ms |
- Added state-based routing to `App.tsx`: `currentPage: Page | null` state, `onNavigate` prop wired to `HomePage`
- Created `src/components/PageView.tsx` — placeholder page for each nav item with a "return" button that calls `onBack → setCurrentPage(null)`
- No external router added; URL does not change on navigation (can add React Router later if needed)
- PageView fades in via `requestAnimationFrame → opacity 0→1` on mount
- Layout: fixed top bar with "return" (left) + "lily surjadinata" (right, 0.55 opacity), then large `clamp(3rem, 8vw, 7rem)` page title below, "coming soon" placeholder body

---

## Session: 2026-07-27 (gallery)

### What was done
Built a photo gallery page (`src/components/GalleryPage.tsx`) wired to the "gallery" nav item.

### Adding photos
Drop image files into `src/assets/gallery/`. Supported formats: jpg, jpeg, png, webp, gif, avif (any case). No config needed — Vite's `import.meta.glob` auto-discovers them on rebuild.

### Layout
- CSS `columns: 2 280px` masonry grid — photos display at natural aspect ratio, auto-responsive (2 → 1 col as viewport narrows)
- 6px `column-gap` and `margin-bottom` between photos
- Sticky header: "return" (left) + "lily surjadinata" (right), both at 0.55 opacity

### Lightbox
- Click any photo → full-screen dark overlay (0.93 opacity black) with image centered
- ← / → arrow buttons (+ keyboard ArrowLeft/ArrowRight) to navigate between photos
- ✕ close button top-right + Escape key
- Click overlay background to dismiss

### Routing
`App.tsx` checks `currentPage === 'gallery'` first and renders `GalleryPage` directly; other pages still use the `PageView` placeholder shell.

---

## Session: 2026-07-27 (gallery hover captions)

### What changed
Added hover overlay to gallery photos in `src/components/GalleryPage.tsx`.

**Behavior:** hovering a photo fades in a semi-transparent black overlay (`rgba(0,0,0,0.52)`) with the caption anchored to the bottom-left. The overlay has `pointerEvents: none` so clicks still open the lightbox.

**How to add/edit captions:** edit the `DESCRIPTIONS` object at the top of `GalleryPage.tsx`. Keys are image filenames (e.g. `'big_shan.jpeg'`). Leave a key's value as `''` to show no text (just the dark tint). Add new keys for any photos added to `src/assets/gallery/`.

**Refactor:** `PHOTOS` array changed from `string[]` to `{ src: string, filename: string }[]` so the glob module key (original filename) is preserved for caption lookups. All lightbox navigation updated accordingly.

---

## Session: 2026-07-27 (intro overlay — PNG hands)

### What changed
Replaced the SVG halftone dot clouds with real PNG images.

**New assets:**
- `src/assets/left-hand-trans.png` (copied from `inspo/`) — 5250×4054 RGBA, hand content in left 0–47.1% of canvas
- `src/assets/right-hand-trans.png` (copied from `inspo/`) — 5250×4054 RGBA, hand content in right 48.2–100% of canvas

**Layout:**
Both images are set to `width: 100vw`. Because they share the same 5250×4054 canvas size:
- Left hand content occupies 0–47.1vw of the viewport
- Right hand content occupies 48.2–100vw of the viewport
- At "touch" position (both images at `left: 0`) the fingertips are only ~1.1vw apart

**Fingertip pixel positions (used for vertical alignment):**
- Left fingertip: pixel (2471, 2178) → 47.1% x, 53.7% y
- Right fingertip: pixel (2533, 2133) → 48.2% x, 52.6% y

**Constants in IntroOverlay.tsx:**
```ts
const SLIDE      = '6vw';
const SPARK_LEFT = '47.6vw';   // midpoint between fingertips at touch
const SPARK_TOP  = '65vh';

// left wrapper:  top = calc(65vh - 100vw * 2178 / 5250)
// right wrapper: top = calc(65vh - 100vw * 2133 / 5250)
```

**Animation:**
- Left hand: rest → `left: -6vw`, touch → `left: 0`
- Right hand: rest → `left: 6vw`, touch → `left: 0`
- Same timing as before (fade-in → 450ms → 1.4s slide → spark → 0.9s fade out)

**Removed:** `LEFT_DOTS`, `RIGHT_DOTS` SVG circle string constants and all `dangerouslySetInnerHTML` usage.

---

## Session: 2026-07-27 (intro overlay — vertical alignment + overlap bug)

### What changed
Updated `src/components/IntroOverlay.tsx` constants (lines 19–27) to fix vertical fingertip alignment. Current values:

```ts
const HAND_W     = '55vw';
const LEFT_H     = 'calc(55vw * 170 / 460)';
const RIGHT_H    = 'calc(55vw * 290 / 460)';
const LEFT_TOP   = 'calc(65vh - 55vw * 164 / 460)';  // Adam's fingertip (cy=164) sits at 65vh
const RIGHT_TOP  = 'calc(65vh - 23vw)';               // God's visual fingertip row at same y — TUNED EMPIRICALLY
const SLIDE      = '6vw';
const SPARK_LEFT = 'calc(48vw)';
const SPARK_TOP  = 'calc(65vh - 3.5vw)';
```

**Why 65vh not 50vh:** the right hand's shoulder (upper-right of SVG) was clipping into view at 50vh vertical center; shifting to 65vh moves both hands lower so the shoulder exits above the viewport cleanly.

**Why RIGHT_TOP = `calc(65vh - 23vw)`:** The previous value `calc(65vh - 55vw * 284 / 460)` used cy=284 as the vertical reference, which is the wrist/base of the right hand, not the fingertip. The true visual fingertip of the right hand (God's hand) in the SVG is near cy≈165. `23vw = 55vw * 165/390` (empirically tuned). This brings God's fingertip to the same screen y as Adam's.

**Result:** vertical placement is confirmed correct by user.

---

### Open bug: hands overlap when touching

**Symptom:** When the animation completes, the two hand images visually overlap completely rather than just meeting at the fingertips.

**Root cause — geometry:**

At touch position:
- Left hand: `left: 6vw` → covers screen 6vw–61vw (width 55vw)
- Right hand: `left: 39vw` → covers screen 39vw–94vw (width 55vw)
- Overlap zone: 39vw–61vw = **22vw** of overlap

The fingertips meet at ~54vw (screen left + SLIDE + 402/460 × 55vw), which is inside the overlap zone. But the ARMS of both hands also extend into this zone:
- Left arm body occupies 6–54vw; the portion 39–54vw (15vw) is in the overlap zone
- Right arm body occupies 54–94vw; the portion 54–61vw (7vw) is in the overlap zone

In addition, the right hand SVG has forearm dots at low cx values (cx=5–135 at cy=135–175) due to the arm's diagonal sweep. These appear in the overlap region and visually collide with the left hand's arm dots.

**Dot cloud structure of right hand (RIGHT_DOTS):**
- The arm sweeps diagonally top-right → bottom-left
- Uppermost dots: cx=445–455, cy=15 (shoulder, top-right of SVG)
- The arm's leftmost reach: cx=5, cy=165 (forearm row); cx=65–125, cy=135
- Fingertip cluster: cx=115–135, cy=265–285
- So the body of the right arm occupies almost the entire SVG width

**Why the original intro.html didn't have this problem:**
In the original `--u` system on a 1600×900 canvas, each hand was 460wu × (1px/1wu) = 460px at 1600px viewport width = 28.75vw. The overlap zone was only ~11vw, and at that small size the sparse fingertip dots barely overlapped visually. At 55vw the overlap is 22vw — double — and arm body dots from both hands fill the zone.

**Potential fixes to evaluate:**
1. **`clip-path` on each hand wrapper** — clip the left hand at its fingertip x, clip the right hand at its fingertip x. This is the cleanest approach; halftone dots taper naturally at the fingertip so the hard edge is invisible.
   - Left wrapper: `clip-path: inset(0 calc(55vw * 48/460) 0 0)` — trims rightmost 48/460 ≈ 10% (after fingertip at x=402, keep up to ~x=412)
   - Right wrapper: `clip-path: inset(0 0 0 calc(55vw * 112/460))` — trims leftmost 112/460 ≈ 24% (before fingertip at x=122, keep from ~x=112)
   - Both clips should sit at the SVG `left` property level (the `<div>` wrapper, not the `<svg>`)
2. **Reduce HAND_W** — smaller hands won't overlap as much, but the user explicitly wanted hands spanning the full screen width
3. **CSS `mix-blend-mode: screen`** on the SVGs — would blend overlapping ivory dots into a brighter merged color rather than stacking opaquely; may look intentional/artistic

---

## Session: 2026-07-27 (cursor photo trail)

### What was done
Added a reusable cursor photo trail effect component — images spawn near the cursor as the user moves the mouse, then fade out.

### New files
- `src/components/CursorPhotoTrail.tsx` — the reusable component
- `src/components/CursorPhotoTrailDemo.tsx` — full-screen demo wired to gallery images

### Dependency added
`framer-motion` — used for `AnimatePresence` + `motion.img` enter/exit animations.

### Component API
```tsx
<CursorPhotoTrail
  images={string[]}           // image src array (required)
  order="sequential"|"random" // default: sequential
  maxImages={6}               // max concurrent trail items
  spawnDistancePx={80}        // min mouse travel (px) before next spawn
  spawnIntervalMs={80}        // min time (ms) between spawns
  imageSizeRange={[120, 180]} // [min, max] px size per item
  lifespanMs={600}            // ms before exit animation starts
  style={...}                 // applied to the container div
  className={...}
>
  {children}  {/* rendered inside the same container */}
</CursorPhotoTrail>
```

Container has `position: relative`; trail images are `position: absolute`, `pointer-events: none`, `z-index: 50`. Each image is a square (`object-fit: cover`) with a random ±10° rotation.

### Animations (Framer Motion)
- **Enter:** opacity 0→1, scale 0.8→1 over 150ms
- **Exit:** opacity 1→0, scale 1→0.9, y drifts up 28px over 300ms
- `AnimatePresence` handles mount/unmount transitions

### Throttling
Two independent gates — both must pass for a spawn:
1. Time: ≥ `spawnIntervalMs` since last spawn
2. Distance: ≥ `spawnDistancePx` Euclidean distance from last spawn position

### Cleanup
- Each spawned item schedules its own `setTimeout` (keyed by id in `timersRef: Map<number, ReturnType<typeof setTimeout>>`)
- `useEffect` cleanup clears all pending timers on unmount

### Demo page
`CursorPhotoTrailDemo` is wired as the default page in `App.tsx` (initial state `'trail-demo'`).
To return to normal site: change `useState<Page | null>('trail-demo')` → `useState<Page | null>(null)` in `App.tsx:12`.

---

## Session: 2026-07-27 (cursor trail — homepage integration + equal spacing)

### What changed

**Equal spacing fix (`CursorPhotoTrail.tsx`):**
Replaced the dual time+distance throttle with path interpolation. `lastSpawnPosRef` now tracks the position of the *last spawned image* (not the raw cursor). On each `mousemove`:
1. Compute Euclidean distance from `lastSpawnPos` to current cursor.
2. If < `spawnDistancePx`, do nothing (remainder carries over).
3. Otherwise, spawn `floor(dist / spawnDistancePx)` images equally spaced along the segment.
4. Update `lastSpawnPos` to the last spawned position — the sub-interval remainder carries into the next event.

This makes spacing constant at any cursor speed. Fast cursor movement spawns multiple images in a single event; slow movement accumulates distance across events.

Removed `spawnIntervalMs` prop (no longer needed). Added `trailZIndex` prop (default: 50).

**Homepage integration (`HomePage.tsx`):**
- Outer `<div className="fixed inset-0 overflow-hidden">` replaced with `<CursorPhotoTrail style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#002FA7' }}>`.
- Gallery images loaded via `import.meta.glob` (same pattern as `GalleryPage.tsx`).
- Arrow button bumped to `z-index: 60`, nav to `z-index: 55` — both stay above trail images at z-50.
- h1 set to `z-index: 1` so trail photos float over the title (intentional heatbureau.com aesthetic).
- Trail images have `pointer-events: none`; nav/button clicks work regardless of z-order.

**App.tsx:** Reverted to `null` default page, removed `trail-demo` routing and `CursorPhotoTrailDemo` import.

---

## Session: 2026-07-27 (nav bar background strip)

### What changed
Added a `position: fixed` background strip at the top of `HomePage.tsx` that sits between the photo trail and the nav text.

**Element:** `<div>` with `top: 0, left: 0, right: 0, height: 4rem, background: #002FA7, zIndex: 50, pointerEvents: none`

**Z-index stack:**
| Layer | zIndex |
|-------|--------|
| Photo trail images | 1 (trailZIndex prop) |
| Name h1 | 2 |
| Nav bar background strip | **50** |
| Nav text | 55 |
| Arrow button | 60 |

The strip is the same Klein Blue as the page background, so it's invisible against the background but blocks photos from bleeding through the menu area. `pointerEvents: none` ensures clicks pass through to nav buttons.

---

## Session: 2026-07-28 (return button text)

### What changed
Changed the return button label on subpages from `re★urn` → `return★` in both `src/components/GalleryPage.tsx` (line 89) and `src/components/PageView.tsx` (line 63). The `StarIcon` now appears after the word "return" instead of inside it.

---

## Session: 2026-07-28 (photo trail spacing + star icon + nav close animation)

### Photo trail spacing
`spawnDistancePx` in `HomePage.tsx` increased from `100` → `150` to reduce photo overlap.

### Star icon replacing plane arrow
Replaced `PlaneArrow` SVG (outlined triangle polygon) with `StarIcon` — a white-filled 4-pointed sparkle star.

**SVG:** `viewBox="0 0 24 24"`, `fill="white"`. Path: `M12 0 L13.77 10.23 L24 12 L13.77 13.77 L12 24 L10.23 13.77 L0 12 L10.23 10.23 Z` (outer r=12, inner r≈2.5 at 45° — very sharp/elongated points).

**Used in two places:**
1. The nav trigger button: `width: 32, height: 32`
2. Inline in the `<h1>` name: `"lily surj" + <StarIcon style={{ width: '0.75em', height: '0.75em' }} /> + "dinata"` — replaces the first "a" in surjadinata. Wrapped in `<span style={{ display: 'inline-flex', alignItems: 'center' }}>`.

### flyLeft animation update (rotation before flight)
`@keyframes flyLeft` in `index.css` updated to spin the star −90° in place before flying:
```css
0%   { transform: translateX(calc(100vw - 5rem)) rotate(0deg);   timing: ease-in-out }
25%  { transform: translateX(calc(100vw - 5rem)) rotate(-90deg); timing: linear }
100% { transform: translateX(0) rotate(-90deg); }
```
- 0–25% (0–300ms): rotates in place at right side
- 25–100% (300–1200ms): flies left, stays rotated

Static `navOpen` transform updated to `'translateX(0) rotate(-90deg)'` so rotation persists after animation ends.

### REVEAL_AT timings recalculated
Old timings assumed pure linear flight from 0ms. Now flight starts at 300ms (after rotation phase).
Formula: `t = 300 + (95 - vw) / 95 * 900`

| Item | vw | reveal delay |
|------|----|-------------|
| projects | ~75vw | 490ms |
| gallery | ~59vw | 640ms |
| blog | ~44vw | 780ms |
| about | ~28vw | 935ms |

### Close (flyRight) animation — reverse nav
Added `closeNav()` function and `isClosing` state. Clicking the star when open plays the reverse:

**`@keyframes flyRight`** (`index.css`):
```css
0%   { transform: translateX(0) rotate(-90deg); timing: ease-in-out }
25%  { transform: translateX(0) rotate(0deg);   timing: linear }
100% { transform: translateX(calc(100vw - 5rem)) rotate(0deg); }
```

**`HIDE_AT`** — when each item's opacity fade starts on close. Values are timed so the fade (350ms duration) completes exactly as the star arrives: `t_hide = t_arrive - 350ms` where `t_arrive = 300 + vw / 95 * 900`.

| Item | vw | hide delay |
|------|----|-----------|
| about | ~28vw | 215ms |
| blog | ~44vw | 365ms |
| gallery | ~59vw | 510ms |
| projects | ~75vw | 660ms |

Button `onClick` now toggles: `navOpen ? closeNav : openNav`. Cursor is `pointer` unless `isAnimating`.

### Menu bar opacity tied to revealed set
The nav background strip now has `opacity: revealed.size > 0 ? 1 : 0` with `transition: 'opacity 0.35s ease'`. It fades in when the first word appears (open) and fades out when the last word is removed from `revealed` (close).

---

## Session: 2026-07-28 (title star double-click spin)

### What changed
The star in "lily surj★dinata" (`<h1>` in `HomePage.tsx`) now spins 360° when double-clicked.

**Implementation:**
- Added `starSpinning: boolean` state to `HomePage`.
- `StarIcon` now accepts an optional `onAnimationEnd` prop (forwarded to the `<svg>`).
- The star is wrapped in a `<span role="img" aria-label="star">` with `pointerEvents: 'auto'` (overrides the parent `h1`'s `pointerEvents: 'none'`) and an `onDoubleClick` handler.
- On double-click: sets `starSpinning = true`. On `animationEnd`: resets to `false`.
- Applied animation: `starNameSpin 0.6s ease-in-out` (added to `src/index.css`).

**Keyframe (`index.css`):**
```css
@keyframes starNameSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
```

---

## Session: 2026-07-28 (about page links)

### What changed
Two phrases in `src/components/AboutPage.tsx` are now hyperlinks:
- **"harvey mudd"** → `https://www.hmc.edu/` (opens in new tab)
- **"listening to house music"** → `https://music.youtube.com/@lilys2891?si=xOIeaIJDe79_4GIW` (opens in new tab)

Both use `color: inherit` and `textDecorationColor: rgba(255,252,238,0.4)` to keep the subtle underline style consistent with the ivory palette.
