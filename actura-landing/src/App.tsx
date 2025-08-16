import './index.css'
import { Navbar } from './components/Navbar.tsx'
import { Hero } from './components/Hero.tsx'
import { BackgroundBlobs } from './components/BackgroundBlobs.tsx'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Profile } from './pages/Profile.tsx'
import { MeetingDetails } from './pages/MeetingDetails.tsx'
import { Footer } from './components/Footer.tsx'

function App() {
  const location = useLocation()
  const isLanding = location.pathname === '/'
  return (
    <div className="min-h-dvh flex flex-col relative">
      {isLanding && <BackgroundBlobs />}
      {isLanding && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/meetings/:id" element={<MeetingDetails />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
