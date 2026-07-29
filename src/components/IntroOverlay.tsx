import { type CSSProperties, type FC, useEffect, useRef, useState } from 'react';
import leftHand from '../assets/left-hand-trans.png';
import rightHand from '../assets/right-hand-trans.png';

const StarIcon = ({ style }: { style?: CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="#FFFCEE" aria-hidden="true" style={style}>
    <path d="M12 0 L13.77 10.23 L24 12 L13.77 13.77 L12 24 L10.23 13.77 L0 12 L10.23 10.23 Z" />
  </svg>
);

// ---------------------------------------------------------------------------
// Layout constants
//
// Both PNG images are 5250×4054 RGBA. They're a matched pair:
//   left hand: content in left 0–47.1% of canvas, fingertip at (47.1%, 53.7%)
//   right hand: content in right 48.2–100% of canvas, fingertip at (48.2%, 52.6%)
//
// At width=100vw both images sit naturally side-by-side with fingertips
// ~1vw apart. SLIDE offsets each hand outward at rest and animates them in.
// ---------------------------------------------------------------------------
const SLIDE = '6vw';

export const IntroOverlay: FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showContactStar, setShowContactStar] = useState(false);
  const hasContacted = useRef(false);

  // Phase 1: fade hands in, then slide them together
  useEffect(() => {
    const rafId = requestAnimationFrame(() => setIsVisible(true));
    const touchTimer = setTimeout(() => setIsTouching(true), 450);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(touchTimer);
    };
  }, []);

  // Phase 3: unmount after fade-out completes
  useEffect(() => {
    if (!isFading) return;
    const t = setTimeout(() => setIsDismissed(true), 900);
    return () => clearTimeout(t);
  }, [isFading]);

  // Phase 2: show contact star, then fade after it blooms
  const handleLeftTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName !== 'left' || hasContacted.current) return;
    hasContacted.current = true;
    setShowContactStar(true);
    setTimeout(() => setIsFading(true), 1500);
  };

  const dismiss = () => {
    if (!hasContacted.current) hasContacted.current = true;
    setIsFading(true);
  };

  if (isDismissed) return null;

  return (
    <div
      role="dialog"
      aria-label="Intro animation"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: '#002FA7',
        overflow: 'hidden',
        zIndex: 100,
        opacity: isFading ? 0 : 1,
        transition: 'opacity 0.9s ease',
      }}
    >
      {/* Left hand (Adam) — slides in from the left */}
      <div
        onTransitionEnd={handleLeftTransitionEnd}
        style={{
          position: 'absolute',
          top: 'calc(65vh - 100vw * 2178 / 5250)',
          left: isTouching ? '0' : `calc(-${SLIDE})`,
          opacity: isVisible ? 1 : 0,
          transition: 'left 2.5s cubic-bezier(.4,0,.2,1), opacity 0.5s ease',
          willChange: 'left',
          pointerEvents: 'none',
        }}
      >
        <img
          src={leftHand}
          alt=""
          aria-hidden="true"
          draggable={false}
          style={{
            display: 'block',
            width: '100vw',
            height: 'calc(100vw * 4054 / 5250)',
          }}
        />
      </div>

      {/* Right hand (Creator) — slides in from the right */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(65vh - 100vw * 2133 / 5250)',
          left: isTouching ? '0' : SLIDE,
          opacity: isVisible ? 1 : 0,
          transition: 'left 2.5s cubic-bezier(.4,0,.2,1), opacity 0.5s ease',
          willChange: 'left',
          pointerEvents: 'none',
        }}
      >
        <img
          src={rightHand}
          alt=""
          aria-hidden="true"
          draggable={false}
          style={{
            display: 'block',
            width: '100vw',
            height: 'calc(100vw * 4054 / 5250)',
          }}
        />
      </div>

      {/* Contact star — blooms at fingertip meeting point */}
      {showContactStar && (
        <div
          style={{
            position: 'absolute',
            left: '47.6vw',
            top: '59vh',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <div style={{ width: '20vw', height: '20vw', animation: 'contactStarGrow 1.5s cubic-bezier(0.8, 0, 1, 1) forwards' }}>
            <StarIcon style={{ width: '100%', height: '100%' }} />
          </div>
        </div>
      )}

      {/* Skip button */}
      <button
        onClick={dismiss}
        className="fixed bottom-6 right-6 z-50 text-sm text-[#EEFEEE]/50 transition-colors duration-200 hover:text-[#EEFEEE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EEFEEE]/60"
        aria-label="Skip intro"
      >
        Skip
      </button>
    </div>
  );
};

export default IntroOverlay;
