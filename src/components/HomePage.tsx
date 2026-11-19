import { CursorPhotoTrail } from './CursorPhotoTrail';
import { TRAIL_PHOTOS } from '../galleryMeta';
import { SiteNav } from './SiteNav';

type NavItem = 'about' | 'blog' | 'gallery' | 'projects';

export function HomePage({ onNavigate, startOpen = false }: { onNavigate?: (page: NavItem) => void; startOpen?: boolean }) {
  return (
    <CursorPhotoTrail
      images={TRAIL_PHOTOS}
      order="sequential"
      maxImages={10}
      spawnIntervalMs={80}
      minMovePx={10}
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
        lily surjadinata
      </h1>
    </CursorPhotoTrail>
  );
}
