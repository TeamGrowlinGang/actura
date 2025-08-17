import { FiChevronRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import DiscordLogo from '../assets/Icons/Discord.svg'
import CalendarLogo from '../assets/Icons/Calendar.svg'
import GroupFiveLogo from '../assets/Icons/Group 5.svg'
import TeamsLogo from '../assets/Icons/Teams.svg'
import NotionLogo from '../assets/Icons/Notion.svg'
import ZoomLogo from '../assets/Icons/Zoom.svg'
import desktopImage from '../assets/desktop image.png'
import { useEffect, useState } from 'react'

export function Hero() {
  const firstLine = 'Your AI teammate'
  const phrases = [
    'who never misses a task.',
    'who summarises.',
    'who keeps you on track.',
  ]

  const [firstProgress, setFirstProgress] = useState(0)
  const [secondProgress, setSecondProgress] = useState(0)
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  // Type the first line once
  useEffect(() => {
    if (firstProgress >= firstLine.length) return
    const t = setTimeout(() => setFirstProgress(firstProgress + 1), 20)
    return () => clearTimeout(t)
  }, [firstProgress])

  // Cycle the second line indefinitely (type, pause, delete)
  useEffect(() => {
    if (firstProgress < firstLine.length) return
    const current = phrases[phraseIndex]
    const typingDelay = 38
    const deletingDelay = 18
    const pauseAtEnd = 1400

    let t: number | undefined
    if (!isDeleting && secondProgress < current.length) {
      t = window.setTimeout(() => setSecondProgress(secondProgress + 1), typingDelay)
    } else if (!isDeleting && secondProgress === current.length) {
      t = window.setTimeout(() => setIsDeleting(true), pauseAtEnd)
    } else if (isDeleting && secondProgress > 0) {
      t = window.setTimeout(() => setSecondProgress(secondProgress - 1), deletingDelay)
    } else if (isDeleting && secondProgress === 0) {
      setIsDeleting(false)
      setPhraseIndex((phraseIndex + 1) % phrases.length)
    }
    return () => { if (t) clearTimeout(t) }
  }, [firstProgress, isDeleting, secondProgress, phraseIndex])

  return (
    <section className="relative hero-fade">
      <div className="site-container">
        <div className="mx-auto max-w-5xl px-6 pb-24 pt-20 text-center md:pt-28">
          <h1 className="text-balance text-5xl font-extrabold tracking-tight md:text-7xl font-['Futura_PT','Futura','Futura_Std','Avenir_Next','Avenir','Inter',system-ui,Arial,sans-serif] fade-in-up">
            <span>{firstLine.slice(0, firstProgress)}</span>
            <span className="block">
              {phrases[phraseIndex].slice(0, secondProgress)}
              <span className="caret-blink" />
            </span>
          </h1>
          <p className="mx-auto mt-8 md:mt-10 max-w-2xl text-xl md:text-2xl text-neutral-600 fade-in-up fade-in-up-1">
            Act quick. Act clever.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-5 fade-in-up fade-in-up-2">
            <a
              href="/Actura_1.0.0_x64-setup.exe"
              className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-7 py-3.5 text-white text-lg md:text-xl shadow hover:bg-neutral-800 font-['Futura_PT','Futura','Futura_Std','Avenir_Next','Avenir','Inter',system-ui,Arial,sans-serif]"
            >
              <span className="font-semibold">Download</span>
              <FiChevronRight />
            </a>
            <Link to="/profile" className="font-semibold text-brand text-lg md:text-xl font-['Futura_PT','Futura','Futura_Std','Avenir_Next','Avenir','Inter',system-ui,Arial,sans-serif]">
              View profile
            </Link>
          </div>

          <div className="mt-16 md:mt-8 lg:mt-4 xl:mt-10 mb-10 md:mb-12 lg:mb-14 flex items-center justify-center gap-5 fade-in-up fade-in-up-3">
            <img
              src={DiscordLogo}
              alt="Discord"
              className="h-16 w-auto sm:h-[64px] md:h-[72px] transition-transform duration-200 ease-out hover:scale-110 hover:-translate-y-0.5"
            />
            <img
              src={TeamsLogo}
              alt="Teams"
              className="h-16 w-auto sm:h-[64px] md:h-[72px] transition-transform duration-200 ease-out hover:scale-110 hover:-translate-y-0.5"
            />
            <img
              src={ZoomLogo}
              alt="Zoom"
              className="h-16 w-auto sm:h-[64px] md:h-[72px] transition-transform duration-200 ease-out hover:scale-110 hover:-translate-y-0.5"
            />
            <img
              src={GroupFiveLogo}
              alt="Group 5"
              className="h-16 w-auto sm:h-[64px] md:h-[72px] transition-transform duration-200 ease-out hover:scale-110 hover:-translate-y-0.5"
            />
            <img
              src={CalendarLogo}
              alt="Calendar"
              className="h-16 w-auto sm:h-[64px] md:h-[72px] transition-transform duration-200 ease-out hover:scale-110 hover:-translate-y-0.5"
            />
            <img
              src={NotionLogo}
              alt="Notion"
              className="h-16 w-auto sm:h-[64px] md:h-[72px] transition-transform duration-200 ease-out hover:scale-110 hover:-translate-y-0.5"
            />
          </div>
        </div>

        <div className="relative mx-auto mt-0 md:-mt-16 lg:-mt-24 xl:-mt-32 px-6 md:px-0 fade-in-up fade-in-up-4">
          <div className="group relative mx-auto w-full">
            <img
              src={desktopImage}
              alt="App preview"
              className="block w-full rounded-2xl mx-auto transition-transform duration-300 ease-out group-hover:scale-[1.02] border-0 outline-none ring-0"
            />
          </div>
        </div>
      </div>
    </section>
  )
}


