import { useEffect, useState, type CSSProperties } from 'react';

type Page = 'about' | 'blog' | 'gallery' | 'projects';

const StarIcon = ({ style }: { style?: CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="#FFFCEE" aria-hidden="true" style={style}>
    <path d="M12 0 L13.77 10.23 L24 12 L13.77 13.77 L12 24 L10.23 13.77 L0 12 L10.23 10.23 Z" />
  </svg>
);

export function PageView({ page, onBack }: { page: Page; onBack: () => void }) {
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
      {/* Top bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.5rem',
          zIndex: 10,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#FFFCEE',
            fontSize: '1rem',
            fontWeight: 500,
            letterSpacing: '0.03em',
            cursor: 'pointer',
            padding: 0,
            opacity: 0.55,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.55')}
          aria-label="Return to home"
        >
          return<StarIcon style={{ width: '0.75em', height: '0.75em', display: 'inline-block', verticalAlign: 'middle', margin: '0 0.05em' }} />
        </button>

        <span
          style={{
            fontSize: '1rem',
            fontWeight: 500,
            letterSpacing: '0.03em',
            opacity: 0.55,
          }}
        >
          lily surjadinata
        </span>
      </div>

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
