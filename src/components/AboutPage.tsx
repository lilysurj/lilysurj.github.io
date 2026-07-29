import { useEffect, useState, type CSSProperties } from 'react';

const StarIcon = ({ style }: { style?: CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="#FFFCEE" aria-hidden="true" style={style}>
    <path d="M12 0 L13.77 10.23 L24 12 L13.77 13.77 L12 24 L10.23 13.77 L0 12 L10.23 10.23 Z" />
  </svg>
);

const linkStyle: CSSProperties = { color: 'inherit', textDecoration: 'underline', textDecorationColor: 'rgba(255,252,238,0.4)' };

type Page = 'about' | 'blog' | 'gallery' | 'projects';

export function AboutPage({ onBack, onNavigate }: { onBack: () => void; onNavigate?: (page: Page) => void }) {
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
        overflow: 'auto',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      {/* Header */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          zIndex: 10,
          background: '#002FA7',
        }}
      >
        <button
          onClick={onBack}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.55')}
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
          aria-label="Return to home"
        >
          return<StarIcon style={{ width: '0.75em', height: '0.75em', display: 'inline-block', verticalAlign: 'middle', margin: '0 0.05em' }} />
        </button>
        <span style={{ fontSize: '1rem', fontWeight: 500, letterSpacing: '0.03em', opacity: 0.55 }}>
          lily surjadinata
        </span>
      </div>

      {/* Content */}
      <div
        style={{
          paddingTop: '8rem',
          paddingBottom: '6rem',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          maxWidth: '680px',
        }}
      >
        {/* <h1
          style={{
            fontSize: 'clamp(3rem, 8vw, 7rem)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            margin: '0 0 3rem',
          }}
        >
          about
        </h1> */}

        {/* ---- your content below ---- */}

        <p style={{ fontSize: '1.1rem', lineHeight: 1.75, opacity: 0.85, margin: '0 0 1.5rem' }}>
          hey! i&#39;m lily, a junior at <a href="https://www.hmc.edu/" target="_blank" rel="noreferrer" style={linkStyle}>harvey mudd</a> studying cs and math with an econ concentration. i&#39;ve done national security work with <a href="https://www.infragardlosangeles.org/" target="_blank" rel="noreferrer" style={linkStyle}>infragard</a>, fbi outreach, and the doj, plus nlp research and full-stack dev.
        </p>

        <p style={{ fontSize: '1.1rem', lineHeight: 1.75, opacity: 0.85, margin: '0 0 1.5rem' }}>
          outside of the cs lab, i&#39;ve love swimming and am getting into <button onClick={() => onNavigate?.('gallery')} style={{ ...linkStyle, background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer' }}>film photography</button>. you can probably find me playing zip or listening to <a href="https://music.youtube.com/@lilys2891?si=xOIeaIJDe79_4GIW" target="_blank" rel="noreferrer" style={linkStyle}> house music</a>.
        </p>

        <p style={{ fontSize: '1.1rem', lineHeight: 1.75, opacity: 0.85, margin: '0 0 1.5rem' }}>
          reach out via lsurjadinata [at] hmc [dot] edu !
        </p>

        {/* ---- your content above ---- */}
      </div>
    </div>
  );
}
