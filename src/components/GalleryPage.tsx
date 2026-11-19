import { useEffect, useRef, useState } from 'react';
import { ALL_PHOTOS as PHOTOS, getCaption } from '../galleryMeta';
import { SiteNav } from './SiteNav';

type Page = 'about' | 'words' | 'gallery' | 'projects';

const GAP = 6;
const MIN_COL_WIDTH = 140;
const MAX_COLS = 4;

const columnCount = () =>
  Math.max(1, Math.min(MAX_COLS, Math.floor((window.innerWidth - GAP) / (MIN_COL_WIDTH + GAP))));

// Masonry that fills left to right: each photo goes into the shortest column so far,
// so the first photos form the top row and the last ones sit at the bottom
function layoutColumns(count: number): number[][] {
  const cols: number[][] = Array.from({ length: count }, () => []);
  const heights = Array.from({ length: count }, () => 0);
  PHOTOS.forEach((photo, i) => {
    const c = heights.indexOf(Math.min(...heights));
    cols[c].push(i);
    heights[c] += photo.aspect;
  });
  return cols;
}

export function GalleryPage({ onBack, onBackStart, onNavigate }: { onBack: () => void; onBackStart?: () => void; onNavigate?: (page: Page) => void }) {
  const [visible, setVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number>(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [cols, setCols] = useState(columnCount);
  const containerRef = useRef<HTMLDivElement>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);

  const stepLightbox = (delta: number) => {
    const idx = (lightboxIdx + delta + PHOTOS.length) % PHOTOS.length;
    setLightboxIdx(idx);
    setLightbox(PHOTOS[idx].src);
  };

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const onResize = () => setCols(columnCount());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!lightbox) return;
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') stepLightbox(1);
      if (e.key === 'ArrowLeft') stepLightbox(-1);
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
      ref={containerRef}
      onScroll={(e) => setIsScrolled((e.target as HTMLDivElement).scrollTop > 80)}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#002FA7',
        color: '#FFFCEE',
        overflow: 'auto',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      <div hidden={lightbox !== null} inert={lightbox !== null}>
        <SiteNav startOpen hideNavItems={isScrolled} onNavigate={onNavigate} onCloseStart={onBackStart} onClose={onBack} />
      </div>

      {/* Grid */}
      {PHOTOS.length === 0 ? (
        <div style={{ padding: '2rem 1.5rem', opacity: 0.4, fontSize: '0.95rem', fontWeight: 500 }}>
          Drop photos into <code style={{ fontFamily: 'monospace' }}>src/assets/gallery/</code> to display them here.
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: `${GAP}px`,
            padding: `${GAP}px`,
            paddingTop: '5rem',
          }}
        >
          {layoutColumns(cols).map((col, c) => (
            <div key={c} style={{ flex: 1, minWidth: 0 }}>
              {col.map(i => {
                const { src, grid, filename, aspect } = PHOTOS[i];
                const caption = getCaption(filename);
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
                      marginBottom: `${GAP}px`,
                      cursor: 'zoom-in',
                    }}
                  >
                    <img
                      src={grid}
                      alt=""
                      loading="lazy"
                      style={{ width: '100%', aspectRatio: `1 / ${aspect}`, display: 'block' }}
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
                            color: 'rgba(255,252,238,0.9)',
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
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          // Horizontal swipe flips photos on touch screens
          onTouchStart={e => {
            const t = e.touches[0];
            swipeStartRef.current = { x: t.clientX, y: t.clientY };
          }}
          onTouchEnd={e => {
            const start = swipeStartRef.current;
            swipeStartRef.current = null;
            if (!start || PHOTOS.length < 2) return;
            const t = e.changedTouches[0];
            const dx = t.clientX - start.x;
            const dy = t.clientY - start.y;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) stepLightbox(dx < 0 ? 1 : -1);
          }}
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
              maxHeight: '92dvh',
              objectFit: 'contain',
              cursor: 'default',
            }}
          />

          {/* Captions are shown on hover in the grid, so touch screens get them here instead */}
          {getCaption(PHOTOS[lightboxIdx].filename) && (
            <span
              className="[@media(hover:hover)]:hidden"
              style={{
                position: 'fixed',
                bottom: '1.5rem',
                left: '1.5rem',
                right: '1.5rem',
                textAlign: 'center',
                color: 'rgba(255,252,238,0.9)',
                fontSize: '1rem',
                letterSpacing: '0.02em',
                pointerEvents: 'none',
              }}
            >
              {getCaption(PHOTOS[lightboxIdx].filename)}
            </span>
          )}

          {/* Arrow buttons */}
          {PHOTOS.length > 1 && (
            <>
              <button
                onClick={e => {
                  e.stopPropagation();
                  stepLightbox(-1);
                }}
                aria-label="Previous photo"
                style={{
                  position: 'fixed',
                  left: '1.25rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#FFFCEE',
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
                  stepLightbox(1);
                }}
                aria-label="Next photo"
                style={{
                  position: 'fixed',
                  right: '1.25rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#FFFCEE',
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
              color: '#FFFCEE',
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
