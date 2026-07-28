import { useState } from 'react';
import { CursorPhotoTrail } from './CursorPhotoTrail';

const imageModules = import.meta.glob<{ default: string }>(
  '../assets/gallery/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP,gif,GIF}',
  { eager: true },
);
const GALLERY_IMAGES = Object.values(imageModules).map(m => m.default);

const NAV_ITEMS = ['about', 'blog', 'gallery', 'projects'] as const;
type NavItem = (typeof NAV_ITEMS)[number];

// Milliseconds after click when the plane's centre crosses each item (right→left)
// Items are positioned at ~28%, ~44%, ~59%, ~75% of viewport width
const REVEAL_AT: Record<NavItem, number> = {
  projects: 280,
  gallery: 480,
  blog: 660,
  about: 860,
};

const PlaneArrow = () => (
  <svg width="34" height="32" viewBox="0 0 34 32" fill="none" aria-hidden="true">
    <polygon
      points="28,2 6,16 28,30"
      stroke="white"
      strokeWidth="2.5"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export function HomePage({ onNavigate, startOpen = false }: { onNavigate?: (page: NavItem) => void; startOpen?: boolean }) {
  const [navOpen, setNavOpen] = useState(startOpen);
  const [isAnimating, setIsAnimating] = useState(false);
  const [revealed, setRevealed] = useState<Set<NavItem>>(startOpen ? new Set(NAV_ITEMS) : new Set());

  const openNav = () => {
    if (navOpen || isAnimating) return;
    setIsAnimating(true);

    NAV_ITEMS.forEach(item => {
      setTimeout(() => {
        setRevealed(prev => {
          const next = new Set(prev);
          next.add(item);
          return next;
        });
      }, REVEAL_AT[item]);
    });

    setTimeout(() => {
      setNavOpen(true);
      setIsAnimating(false);
    }, 1200);
  };

  const arrowTransform = isAnimating
    ? undefined
    : navOpen
    ? 'translateX(0)'
    : 'translateX(calc(100vw - 5rem))';

  const arrowAnimation = isAnimating ? 'flyLeft 1.2s linear both' : undefined;

  return (
    <CursorPhotoTrail
      images={GALLERY_IMAGES}
      order="sequential"
      maxImages={7}
      spawnDistancePx={100}
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
        }}
      />

      {/* Arrow / plane — flies from top-right to top-left on click */}
      <button
        onClick={openNav}
        aria-label="Open navigation"
        style={{
          position: 'fixed',
          top: '1.5rem',
          left: '1.5rem',
          transform: arrowTransform,
          animation: arrowAnimation,
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: navOpen ? 'default' : 'pointer',
          zIndex: 60,
          lineHeight: 0,
        }}
      >
        <PlaneArrow />
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
              color: 'white',
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
          color: 'white',
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
        lily surjadinata
      </h1>
    </CursorPhotoTrail>
  );
}
