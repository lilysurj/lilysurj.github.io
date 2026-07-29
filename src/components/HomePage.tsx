import { useState, type CSSProperties } from 'react';
import { CursorPhotoTrail } from './CursorPhotoTrail';
import { FILM_PHOTOS } from '../galleryMeta';

const NAV_ITEMS = ['about', 'blog', 'gallery', 'projects'] as const;
type NavItem = (typeof NAV_ITEMS)[number];

// Milliseconds after click when the star crosses each item (right→left open, left→right close)
// Items at ~28%, ~44%, ~59%, ~75% vw. Rotation phase = 0–300ms, flight = 300–1200ms.
// open:  t = 300 + (95 - vw) / 95 * 900
// close: t = 300 + vw / 95 * 900
const REVEAL_AT: Record<NavItem, number> = {
  projects: 490,
  gallery: 640,
  blog: 780,
  about: 935,
};

const HIDE_AT: Record<NavItem, number> = {
  about:    215,
  blog:     365,
  gallery:  510,
  projects: 660,
};

const StarIcon = ({ style, onAnimationEnd }: { style?: CSSProperties; onAnimationEnd?: () => void }) => (
  <svg
    viewBox="0 0 24 24"
    fill="#FFFCEE"
    aria-hidden="true"
    style={style}
    onAnimationEnd={onAnimationEnd}
  >
    <path d="M12 0 L13.77 10.23 L24 12 L13.77 13.77 L12 24 L10.23 13.77 L0 12 L10.23 10.23 Z" />
  </svg>
);

export function HomePage({ onNavigate, startOpen = false }: { onNavigate?: (page: NavItem) => void; startOpen?: boolean }) {
  const [navOpen, setNavOpen] = useState(startOpen);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [revealed, setRevealed] = useState<Set<NavItem>>(startOpen ? new Set(NAV_ITEMS) : new Set());
  const [starSpinning, setStarSpinning] = useState(false);

  const openNav = () => {
    if (navOpen || isAnimating) return;
    setIsAnimating(true);

    NAV_ITEMS.forEach(item => {
      setTimeout(() => {
        setRevealed(prev => { const next = new Set(prev); next.add(item); return next; });
      }, REVEAL_AT[item]);
    });

    setTimeout(() => {
      setNavOpen(true);
      setIsAnimating(false);
    }, 1200);
  };

  const closeNav = () => {
    if (!navOpen || isAnimating) return;
    setIsAnimating(true);
    setIsClosing(true);

    NAV_ITEMS.forEach(item => {
      setTimeout(() => {
        setRevealed(prev => { const next = new Set(prev); next.delete(item); return next; });
      }, HIDE_AT[item]);
    });

    setTimeout(() => {
      setNavOpen(false);
      setIsAnimating(false);
      setIsClosing(false);
    }, 1200);
  };

  const arrowTransform = isAnimating
    ? undefined
    : navOpen
    ? 'translateX(0) rotate(-90deg)'
    : 'translateX(calc(100vw - 5rem)) rotate(0deg)';

  const arrowAnimation = isAnimating
    ? (isClosing ? 'flyRight 1.2s linear both' : 'flyLeft 1.2s linear both')
    : !navOpen
    ? 'starPulse 2s ease-in-out infinite'
    : undefined;

  return (
    <CursorPhotoTrail
      images={FILM_PHOTOS}
      order="sequential"
      maxImages={7}
      spawnDistancePx={150}
      imageSizeRange={[240, 240]}
      lifespanMs={700}
      trailZIndex={1}
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: '#002FA7',
      }}
    >
      {/* Menu bar background — above photo trail, behind nav text */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '6rem',
          background: '#002FA7',
          zIndex: 50,
          pointerEvents: 'none',
          opacity: revealed.size > 0 ? 1 : 0,
          transition: 'opacity 0.35s ease',
        }}
      />

      {/* Arrow / plane — flies from top-right to top-left on click */}
      <button
        onClick={navOpen ? closeNav : openNav}
        aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
        style={{
          position: 'fixed',
          top: '1.5rem',
          left: '1.5rem',
          transform: arrowTransform,
          animation: arrowAnimation,
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: isAnimating ? 'default' : 'pointer',
          zIndex: 60,
          lineHeight: 0,
        }}
      >
        <StarIcon style={{ width: 32, height: 32 }} />
      </button>

      {/* Nav items span ~28–75 vw, revealed right-to-left as plane passes */}
      <nav
        aria-label="Main navigation"
        style={{
          position: 'fixed',
          top: '1.5rem',
          left: '28vw',
          right: '25vw',
          height: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 55,
        }}
      >
        {NAV_ITEMS.map(item => (
          <button
            key={item}
            onClick={() => onNavigate?.(item)}
            tabIndex={revealed.has(item) ? 0 : -1}
            style={{
              opacity: revealed.has(item) ? 1 : 0,
              transition: 'opacity 0.35s ease',
              background: 'none',
              border: 'none',
              color: '#FFFCEE',
              fontSize: '1rem',
              fontWeight: 500,
              letterSpacing: '0.03em',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {item}
          </button>
        ))}
      </nav>

      {/* Name — deliberately below trail z-index so photos can float over it */}
      <h1
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFCEE',
          fontSize: 'clamp(2.5rem, 6.5vw, 6rem)',
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          margin: 0,
          userSelect: 'none',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          lily surj<span
            role="img"
            aria-label="star"
            onDoubleClick={() => {
              if (starSpinning) return;
              setStarSpinning(true);
            }}
            style={{ display: 'inline-flex', pointerEvents: 'auto', cursor: 'default', lineHeight: 0 }}
          >
            <StarIcon
              style={{
                width: '0.75em',
                height: '0.75em',
                flexShrink: 0,
                animation: starSpinning ? 'starNameSpin 0.6s ease-in-out' : undefined,
              }}
              onAnimationEnd={() => setStarSpinning(false)}
            />
          </span>dinata
        </span>
      </h1>
    </CursorPhotoTrail>
  );
}
