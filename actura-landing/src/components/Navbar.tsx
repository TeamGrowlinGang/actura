import acturaMark from '../assets/logo inside navbar.png'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50">
      <div className="site-container mt-6 rounded-full bg-gradient-to-r from-[#3B91F9] to-[#005FD2] text-white shadow-navbar">
        <div className="flex items-center justify-between px-5 md:px-6 py-2 md:py-1">
          <div className="flex items-center gap-3">
            <img
              src={acturaMark}
              alt="Actura"
              className="h-20 w-auto select-none"
              draggable={false}
            />
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm/6">
            <a href="#" className="hover:opacity-90">Home</a>
            <a href="#" className="hover:opacity-90">How it works</a>
            <a href="#" className="hover:opacity-90">Why Actura?</a>
            <a href="#" className="hover:opacity-90">Pricing</a>
            <a href="#" className="hover:opacity-90">Contact</a>
          </nav>
        </div>
      </div>
    </header>
  )
}


