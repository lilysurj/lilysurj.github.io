import './index.css'
import { IntroOverlay } from './components/IntroOverlay'

export default function App() {
  return (
    <>
      <IntroOverlay />
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400 text-sm">your site goes here</p>
      </main>
    </>
  )
}
