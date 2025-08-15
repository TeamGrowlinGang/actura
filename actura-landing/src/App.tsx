import './index.css'
import { Navbar } from './components/Navbar.tsx'
import { Hero } from './components/Hero.tsx'

function App() {
  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
      </main>
    </div>
  )
}

export default App
