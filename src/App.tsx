import { useEffect, useRef, useState } from 'react'
import './index.css'
// import { IntroOverlay } from './components/IntroOverlay'
import { HomePage } from './components/HomePage'
import { PageView } from './components/PageView'
import { GalleryPage } from './components/GalleryPage'
import { AboutPage } from './components/AboutPage'
import { PageLoader, LOADER_FADE_MS } from './components/PageLoader'
import { ALL_PHOTOS } from './galleryMeta'

// Keep in sync with PAGE_ROUTES in vite.config.ts
const PAGES = ['about', 'words', 'gallery', 'projects'] as const;
type Page = (typeof PAGES)[number];

// GitHub Pages redirects /gallery to /gallery/, so ignore slashes
const pageFromPath = (pathname: string): Page | null => {
  const slug = pathname.replace(/^\/+|\/+$/g, '');
  return (PAGES as readonly string[]).includes(slug) ? (slug as Page) : null;
};

const pushPath = (page: Page | null) => {
  const path = page ? `/${page}` : '/';
  if (pageFromPath(window.location.pathname) !== page) history.pushState(null, '', path);
};

const MIN_LOADER_MS = 700;
const GALLERY_PRELOAD_COUNT = 12;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const preloadImage = (src: string) =>
  new Promise<void>(resolve => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
  });

// Assets the destination page needs before it's revealed
const preloadPage = (page: Page | null) =>
  page === 'gallery'
    ? Promise.all(ALL_PHOTOS.slice(0, GALLERY_PRELOAD_COUNT).map(p => preloadImage(p.grid)))
    : Promise.resolve();

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page | null>(() => pageFromPath(window.location.pathname));
  const [returnedFromPage, setReturnedFromPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [blanking, setBlanking] = useState(false);
  const navToken = useRef(0);

  const transitionTo = async (page: Page | null, updateUrl = true) => {
    const token = ++navToken.current;
    if (updateUrl) pushPath(page);
    setLoading(true);
    const ready = Promise.all([preloadPage(page), wait(MIN_LOADER_MS)]);

    // Swap pages only once the loader fully covers the screen
    await wait(LOADER_FADE_MS);
    if (token !== navToken.current) return;
    if (page === null) setReturnedFromPage(true);
    setCurrentPage(page);

    await ready;
    if (token !== navToken.current) return;
    setLoading(false);
  };

  // The nav's close animation already shoots the star across, so just blank the page under it
  const handleBackStart = () => {
    navToken.current++;
    setBlanking(true);
  };

  const handleBack = () => {
    navToken.current++;
    pushPath(null);
    setLoading(false);
    setBlanking(false);
    setReturnedFromPage(true);
    setCurrentPage(null);
  };

  // Browser back/forward: the URL already changed, so just play the transition
  const transitionRef = useRef(transitionTo);
  transitionRef.current = transitionTo;
  useEffect(() => {
    const onPopState = () => transitionRef.current(pageFromPath(window.location.pathname), false);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return (
    <>
      {currentPage === 'gallery' ? (
        <GalleryPage onBack={handleBack} onBackStart={handleBackStart} onNavigate={transitionTo} />
      ) : currentPage === 'about' ? (
        <AboutPage onBack={handleBack} onBackStart={handleBackStart} onNavigate={transitionTo} />
      ) : currentPage ? (
        <PageView page={currentPage} onBack={handleBack} onBackStart={handleBackStart} onNavigate={transitionTo} />
      ) : (
        <HomePage onNavigate={transitionTo} startOpen={returnedFromPage} />
      )}
      <PageLoader visible={loading || blanking} blank={blanking} />
      {/* <IntroOverlay /> */}
    </>
  )
}
