import { useState } from 'react';
import { CursorPhotoTrail } from './CursorPhotoTrail';
import { FILM_PHOTOS } from '../galleryMeta';
import { SiteNav, StarIcon } from './SiteNav';

type NavItem = 'about' | 'blog' | 'gallery' | 'projects';

export function HomePage({ onNavigate, startOpen = false }: { onNavigate?: (page: NavItem) => void; startOpen?: boolean }) {
  const [starSpinning, setStarSpinning] = useState(false);

  return (
    <CursorPhotoTrail
      images={FILM_PHOTOS}
      order="sequential"
      maxImages={10}
      spawnDistancePx={100}
      imageSizeRange={[180, 240]}
      lifespanMs={1400}
      trailZIndex={1}
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: '#002FA7',
      }}
    >
      <SiteNav showOverlay startOpen={startOpen} onNavigate={onNavigate} />

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
