import { useEffect, useState, type CSSProperties } from 'react';
import lilyPhoto from '../assets/lily.png?w=1120&format=webp';
import { SiteNav } from './SiteNav';

const linkStyle: CSSProperties = { color: 'inherit', textDecoration: 'underline', textDecorationColor: 'rgba(255,252,238,0.4)' };

type Page = 'about' | 'words' | 'gallery' | 'projects';

export function AboutPage({ onBack, onBackStart, onNavigate }: { onBack: () => void; onBackStart?: () => void; onNavigate?: (page: Page) => void }) {
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
      <SiteNav startOpen onNavigate={onNavigate} onCloseStart={onBackStart} onClose={onBack} />

      <style>{`@media (max-width: 640px) { .about-photo { order: -1; } .about-text { max-width: 100% !important; width: 100%; } }`}</style>

      {/* Content */}
      <div
        style={{
          minHeight: '100dvh',
          paddingTop: '6rem',
          paddingBottom: '4rem',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          display: 'flex',
          flexDirection: 'row',
          gap: '3rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div className="about-text" style={{ flex: '0 1 auto', maxWidth: 'clamp(300px, 45%, 560px)' }}>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.75, opacity: 0.85, margin: '0 0 1.5rem' }}>
            hey! i&#39;m lily, a student at <a href="https://www.hmc.edu/" target="_blank" rel="noreferrer" style={linkStyle}>harvey mudd</a> studying cs and math with a concentration in econ. i&#39;ve worked on national security with <a href="https://www.infragardlosangeles.org/" target="_blank" rel="noreferrer" style={linkStyle}>infragard</a> and the doj, and i&#39;ve done research in nlp and secure memory. in summer 2027, i&#39;ll be interning at palantir.
          </p>

          <p style={{ fontSize: '1.1rem', lineHeight: 1.75, opacity: 0.85, margin: '0 0 1.5rem' }}>
            outside the lab, i swim and i&#39;m getting into <button onClick={() => onNavigate?.('gallery')} style={{ ...linkStyle, background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer' }}>film photography</button>. i also love wordle, and i&#39;m usually listening to <a href="https://music.youtube.com/@lilysurj" target="_blank" rel="noreferrer" style={linkStyle}>house music</a>.
          </p>

          <p style={{ fontSize: '1.1rem', lineHeight: 1.75, opacity: 0.85, margin: '0 0 1.5rem' }}>
            reach out at lsurjadinata [at] hmc [dot] edu
          </p>
        </div>

        {/* Photo centered in remaining space */}
        <div className="about-photo" style={{ flex: '1 1 280px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img
            src={lilyPhoto}
            alt="lily surjadinata"
            style={{ width: 'clamp(200px, 100%, 560px)', display: 'block' }}
          />
        </div>
      </div>
    </div>
  );
}
