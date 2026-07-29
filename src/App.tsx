import { useState } from 'react'
import './index.css'
import { IntroOverlay } from './components/IntroOverlay'
import { HomePage } from './components/HomePage'
import { PageView } from './components/PageView'
import { GalleryPage } from './components/GalleryPage'
import { AboutPage } from './components/AboutPage'

type Page = 'about' | 'blog' | 'gallery' | 'projects';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [returnedFromPage, setReturnedFromPage] = useState(false);

  const handleBack = () => {
    setReturnedFromPage(true);
    setCurrentPage(null);
  };

  return (
    <>
      {currentPage === 'gallery' ? (
        <GalleryPage onBack={handleBack} />
      ) : currentPage === 'about' ? (
        <AboutPage onBack={handleBack} onNavigate={setCurrentPage} />
      ) : currentPage ? (
        <PageView page={currentPage} onBack={handleBack} />
      ) : (
        <HomePage onNavigate={setCurrentPage} startOpen={returnedFromPage} />
      )}
      <IntroOverlay />
    </>
  )
}
