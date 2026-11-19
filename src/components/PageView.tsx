import { useEffect, useState } from 'react';
import { SiteNav } from './SiteNav';

type Page = 'about' | 'words' | 'gallery' | 'projects';

export function PageView({ page, onBack, onBackStart, onNavigate }: { page: Page; onBack: () => void; onBackStart?: () => void; onNavigate?: (page: Page) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#002FA7',
        color: '#FFFCEE',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
        overflow: 'auto',
      }}
    >
      <SiteNav startOpen onNavigate={onNavigate} onCloseStart={onBackStart} onClose={onBack} />

      {/* Page content */}
      <div
        style={{
          paddingTop: '8rem',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          maxWidth: '800px',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(3rem, 8vw, 7rem)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            margin: '0 0 3rem',
          }}
        >
          {page}
        </h1>

        {/* placeholder content */}
        <div style={{ opacity: 0.35, fontSize: '1rem', lineHeight: 1.7 }}>
          coming soon
        </div>
      </div>
    </div>
  );
}
