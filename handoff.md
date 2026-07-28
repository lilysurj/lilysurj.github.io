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

### Source assets
- `inspo/left-hand.png` — original hand image used to generate SVG dots
- `inspo/right-hand.png` — original hand image
- `inspo/website color palette.png` — color reference
- `intro.html` — working vanilla HTML/CSS/JS prototype (source of truth for animation timing and positions)
