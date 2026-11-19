import { useState } from 'react';
import { StarIcon } from './SiteNav';

export const LOADER_FADE_MS = 300;

// Mounted once at the App level so the shooting star stays continuous across page swaps.
// `blank` mirrors SiteNav's close animation instead (same position and flyRight keyframes),
// since the real nav star lives inside the page's own stacking context and gets covered.
export function PageLoader({ visible, blank = false }: { visible: boolean; blank?: boolean }) {
  // Bump on every show so the shooting star remounts and starts its pass from the left edge
  const [run, setRun] = useState(0);
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setRun(r => r + 1);
  }

  return (
    <div
      aria-hidden={!visible}
      role="status"
      aria-label={visible ? 'Loading' : undefined}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#002FA7',
        zIndex: 100,
        overflow: 'hidden',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: visible && blank ? 'none' : `opacity ${LOADER_FADE_MS}ms ease`,
      }}
    >
      {blank && visible && (
        <div
          style={{
            position: 'absolute',
            top: '1.5rem',
            left: '1.5rem',
            lineHeight: 0,
            animation: 'flyRight 1.2s linear both',
          }}
        >
          <StarIcon style={{ width: 32, height: 32 }} />
        </div>
      )}

      {/* Same size and track as the menu star in SiteNav */}
      {!blank && (
        <div
          key={run}
          style={{
            position: 'absolute',
            top: '1.5rem',
            left: 0,
            lineHeight: 0,
            animation: 'loaderShoot 1s linear infinite',
          }}
        >
          <StarIcon style={{ width: 32, height: 32, transform: 'rotate(-90deg)' }} />
        </div>
      )}
    </div>
  );
}
