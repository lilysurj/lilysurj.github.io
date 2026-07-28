import { useEffect, useState } from 'react';

const imageModules = import.meta.glob<{ default: string }>(
  '../assets/gallery/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP,gif,GIF,avif,AVIF}',
  { eager: true }
);

const PHOTOS = Object.entries(imageModules).map(([path, m]) => ({
  src: m.default,
  filename: path.split('/').pop()!,
}));

const DEFAULT_TAG = 'shot on film';

// Fill in caption and/or tag for each photo. tag defaults to DEFAULT_TAG if omitted.
const DESCRIPTIONS: Record<string, { caption?: string; tag?: string }> = {
  'big_shan.jpeg':       { caption: 'big shan' },
  'foothill_blvd.jpeg':  { caption: 'foothill blvd' },
  'friends.JPG':         { caption: 'big bear!' },
  'green_beach.jpeg':    { caption: 'green' },
  'max.jpeg':            { caption: 'mmc' },
  'megan_and_peen.jpeg': { caption: 'scripps larp' },
};

export function GalleryPage({ onBack }: { onBack: () => void }) {
  const [visible, setVisible] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number>(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!lightbox) return;
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') {
        const next = (lightboxIdx + 1) % PHOTOS.length;
        setLightboxIdx(next);
        setLightbox(PHOTOS[next].src);
      }
      if (e.key === 'ArrowLeft') {
        const prev = (lightboxIdx - 1 + PHOTOS.length) % PHOTOS.length;
        setLightboxIdx(prev);
        setLightbox(PHOTOS[prev].src);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, lightboxIdx]);

  const openLightbox = (src: string, idx: number) => {
    setLightbox(src);
    setLightboxIdx(idx);
    setHoveredIdx(null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#002FA7',
        color: 'white',
        overflow: 'auto',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      {/* Header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: '#002FA7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
        }}
      >
        <button
          onClick={onBack}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.55')}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 500,
            letterSpacing: '0.03em',
            cursor: 'pointer',
            padding: 0,
            opacity: 0.55,
            transition: 'opacity 0.2s',
          }}
          aria-label="Return to home"
        >
          return
        </button>
        <span style={{ fontSize: '1rem', fontWeight: 500, letterSpacing: '0.03em', opacity: 0.55 }}>
          lily surjadinata
        </span>
      </div>

      {/* Grid */}
      {PHOTOS.length === 0 ? (
        <div style={{ padding: '2rem 1.5rem', opacity: 0.4, fontSize: '0.95rem', fontWeight: 500 }}>
          Drop photos into <code style={{ fontFamily: 'monospace' }}>src/assets/gallery/</code> to display them here.
        </div>
      ) : (
        <div
          style={{
            columns: '2 280px',
            columnGap: '6px',
            padding: '6px',
          }}
        >
          {PHOTOS.map(({ src, filename }, i) => {
            const entry = DESCRIPTIONS[filename];
            const caption = entry?.caption ?? '';
            const tag = entry?.tag ?? DEFAULT_TAG;
            const isHovered = hoveredIdx === i;
            return (
              <div
                key={src}
                onClick={() => openLightbox(src, i)}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  position: 'relative',
                  display: 'block',
                  marginBottom: '6px',
                  breakInside: 'avoid',
                  cursor: 'zoom-in',
                }}
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  style={{ width: '100%', display: 'block' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.52)',
                    opacity: isHovered ? 1 : 0,
                    transition: 'opacity 0.25s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '1rem',
                    pointerEvents: 'none',
                    gap: '0.2rem',
                  }}
                >
                  {caption && (
                    <span
                      style={{
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: '1rem',
                        fontWeight: 400,
                        letterSpacing: '0.02em',
                        lineHeight: 1.4,
                        textAlign: 'center',
                      }}
                    >
                      {caption}
                    </span>
                  )}
                  <span
                    style={{
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: '0.875rem',
                      fontWeight: 400,
                      letterSpacing: '0.04em',
                      textAlign: 'center',
                    }}
                  >
                    {tag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.93)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            cursor: 'zoom-out',
          }}
        >
          <img
            src={lightbox}
            alt=""
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '92vw',
              maxHeight: '92vh',
              objectFit: 'contain',
              cursor: 'default',
            }}
          />

          {/* Arrow buttons */}
          {PHOTOS.length > 1 && (
            <>
              <button
                onClick={e => {
                  e.stopPropagation();
                  const prev = (lightboxIdx - 1 + PHOTOS.length) % PHOTOS.length;
                  setLightboxIdx(prev);
                  setLightbox(PHOTOS[prev].src);
                }}
                aria-label="Previous photo"
                style={{
                  position: 'fixed',
                  left: '1.25rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  opacity: 0.6,
                  padding: '0.5rem',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
              >
                ←
              </button>
              <button
                onClick={e => {
                  e.stopPropagation();
                  const next = (lightboxIdx + 1) % PHOTOS.length;
                  setLightboxIdx(next);
                  setLightbox(PHOTOS[next].src);
                }}
                aria-label="Next photo"
                style={{
                  position: 'fixed',
                  right: '1.25rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  opacity: 0.6,
                  padding: '0.5rem',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
              >
                →
              </button>
            </>
          )}

          {/* Close button */}
          <button
            onClick={() => setLightbox(null)}
            aria-label="Close"
            style={{
              position: 'fixed',
              top: '1.25rem',
              right: '1.5rem',
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '1.25rem',
              cursor: 'pointer',
              opacity: 0.6,
              padding: '0.5rem',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
