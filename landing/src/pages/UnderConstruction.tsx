import { Link } from 'react-router-dom'
export function UnderConstruction() {
  return (
    <section className="min-h-dvh bg-[#F7FAFF] px-4 flex items-center justify-center">
      <div className="site-container text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900">Under construction</h1>
        <p className="mt-3 text-neutral-600">We&apos;re working hard on this page. Please check back soon.</p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-[#2a74ff] px-4 py-2 font-semibold text-white shadow hover:bg-brand-dark"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </section>
  )
}


