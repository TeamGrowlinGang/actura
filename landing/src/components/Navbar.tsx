import acturaMark from '../assets/logo inside navbar.png'
import { Link } from 'react-router-dom'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50">
      <div className="site-container mt-6 rounded-full bg-gradient-to-r from-[#3B91F9] to-[#005FD2] text-white shadow-navbar">
        <div className="flex items-center justify-between px-5 md:px-8 lg:px-10 py-2 md:py-1">
          <div className="flex items-center gap-3">
            <img
              src={acturaMark}
              alt="Actura"
              className="h-24 w-auto select-none"
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
        </div>
      </div>
    </header>
  )
}


