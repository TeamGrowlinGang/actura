import acturaMark from '../assets/logo inside navbar.png'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { FiMenu, FiX } from 'react-icons/fi'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50">
      <div className="site-container mt-3 md:mt-6 rounded-full bg-gradient-to-r from-[#3B91F9] to-[#005FD2] text-white shadow-navbar">
        <div className="flex items-center justify-between px-4 md:px-8 lg:px-10 py-1 md:py-1">
          <div className="flex items-center gap-3">
            <img
              src={acturaMark}
              alt="Actura"
              className="h-12 md:h-20 lg:h-24 w-auto select-none"
              draggable={false}
            />
          </div>
          <nav className="hidden md:flex items-center gap-9 lg:gap-10 text-base/6 lg:text-lg/7">
            <a href="/" onClick={(e) => { e.preventDefault(); window.location.reload(); }} className="hover:opacity-90">Home</a>
            <Link to="/under-construction" className="hover:opacity-90">How it works</Link>
            <Link to="/under-construction" className="hover:opacity-90">Why Actura?</Link>
            <Link to="/under-construction" className="hover:opacity-90">Pricing</Link>
            <Link to="/under-construction" className="hover:opacity-90">Contact</Link>
          </nav>
          <button
            aria-label="Open menu"
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-white/70"
            onClick={() => setIsOpen((v) => !v)}
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {isOpen && (
        <div className="md:hidden">
          <div className="site-container mt-2 rounded-2xl bg-white/95 shadow-lg ring-1 ring-black/5 overflow-hidden">
            <div className="flex flex-col divide-y divide-black/5 text-neutral-800">
              <a
                href="/"
                onClick={(e) => { e.preventDefault(); setIsOpen(false); window.location.reload(); }}
                className="px-5 py-3 active:bg-black/[.03]"
              >
                Home
              </a>
              <Link to="/under-construction" className="px-5 py-3 active:bg-black/[.03]" onClick={() => setIsOpen(false)}>How it works</Link>
              <Link to="/under-construction" className="px-5 py-3 active:bg-black/[.03]" onClick={() => setIsOpen(false)}>Why Actura?</Link>
              <Link to="/under-construction" className="px-5 py-3 active:bg-black/[.03]" onClick={() => setIsOpen(false)}>Pricing</Link>
              <Link to="/under-construction" className="px-5 py-3 active:bg-black/[.03]" onClick={() => setIsOpen(false)}>Contact</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}


