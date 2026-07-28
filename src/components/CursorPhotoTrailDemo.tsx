import { CursorPhotoTrail } from './CursorPhotoTrail';

const imageModules = import.meta.glob<{ default: string }>(
  '../assets/gallery/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP,gif,GIF}',
  { eager: true },
);

const DEMO_IMAGES = Object.values(imageModules).map(m => m.default);

export function CursorPhotoTrailDemo({ onBack }: { onBack: () => void }) {
  return (
    <CursorPhotoTrail
      images={DEMO_IMAGES}
      order="sequential"
      maxImages={7}
      spawnDistancePx={75}
      spawnIntervalMs={80}
      imageSizeRange={[130, 200]}
      lifespanMs={700}
      style={{
        width: '100vw',
        height: '100vh',
        background: '#002FA7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'crosshair',
        overflow: 'hidden',
      }}
    >
      <p
        style={{
          color: 'rgba(238, 254, 238, 0.3)',
          fontFamily: 'sans-serif',
          fontSize: '0.85rem',
          letterSpacing: '0.12em',
          textTransform: 'lowercase',
          pointerEvents: 'none',
          userSelect: 'none',
          margin: 0,
          zIndex: 1,
        }}
      >
        move your mouse
      </p>

      <button
        onClick={onBack}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0.45')}
        style={{
          position: 'absolute',
          top: '1.25rem',
          left: '1.5rem',
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '1rem',
          fontWeight: 500,
          letterSpacing: '0.03em',
          cursor: 'pointer',
          padding: 0,
          opacity: 0.45,
          transition: 'opacity 0.2s',
          zIndex: 100,
          pointerEvents: 'auto',
        }}
      >
        return
      </button>
    </CursorPhotoTrail>
  );
}
