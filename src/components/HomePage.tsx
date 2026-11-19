import { CursorPhotoTrail } from './CursorPhotoTrail';
import { TRAIL_PHOTOS } from '../galleryMeta';
import { SiteNav } from './SiteNav';

type NavItem = 'about' | 'words' | 'gallery' | 'projects';

export function HomePage({ onNavigate, startOpen = false }: { onNavigate?: (page: NavItem) => void; startOpen?: boolean }) {
  // Desktop-sized trail photos would cover most of a phone screen
  const isSmallScreen = window.matchMedia('(max-width: 640px)').matches;

  return (
    <CursorPhotoTrail
      images={TRAIL_PHOTOS}
      order="sequential"
      maxImages={10}
      spawnIntervalMs={80}
      minMovePx={10}
      imageSizeRange={isSmallScreen ? [110, 150] : [180, 240]}
      lifespanMs={1400}
      trailZIndex={1}
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: '#002FA7',
        // Let finger drags draw the trail instead of panning or zooming the page
        touchAction: 'none',
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
          textAlign: 'center',
          padding: '0 1rem',
          color: '#FFFCEE',
          // The 2.5rem floor would overflow phones narrower than ~360px, so shrink with the viewport there
          fontSize: 'clamp(min(2.5rem, 11vw), 6.5vw, 6rem)',
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
