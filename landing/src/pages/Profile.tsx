import { useEffect, useMemo, useState } from 'react'
import acturaLogo from '../assets/final_svg.svg'
import { fetchProfileData } from '../lib/data'
import type { Meeting, ProfileData } from '../lib/types'
import { Link } from 'react-router-dom'
import { FiChevronLeft, FiCheck, FiClock } from 'react-icons/fi'

function formatDuration(mins: number): string {
  if (mins <= 0) return '0m'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}

function StatusPill({ status }: { status: Meeting['status'] }) {
  const Icon = status === 'complete' ? FiCheck : FiClock
  const label = status === 'complete' ? 'Complete' : 'Pending'
  return (
    <span
      className="inline-flex items-center rounded-full border border-[#3B91F9]/30 bg-white px-2.5 py-1 text-sm font-medium text-[#3B91F9] shadow-sm"
      title={label}
    >
      <Icon className="h-4 w-4 mr-1" />
      {label}
    </span>
  )
}

export function Profile() {
  const [data, setData] = useState<ProfileData | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetchProfileData().then(setData).catch(console.error)
  }, [])

  const filtered = useMemo(() => {
    if (!data) return [] as Meeting[]
    const q = query.trim().toLowerCase()
    if (!q) return data.meetings
    return data.meetings.filter(m => m.title.toLowerCase().includes(q))
  }, [data, query])

  if (!data) {
    return (
      <section className="site-container px-6 py-16">
        <div className="h-8 w-40 rounded bg-neutral-100" />
        <div className="mt-6 h-10 w-full max-w-xl rounded bg-neutral-100" />
        <div className="mt-6 grid gap-4">
          <div className="h-28 w-full rounded-2xl bg-neutral-100" />
          <div className="h-28 w-full rounded-2xl bg-neutral-100" />
          <div className="h-28 w-full rounded-2xl bg-neutral-100" />
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-dvh bg-[#F7FAFF] px-4 py-6 md:py-10">
      <div className="site-container">
        {/* Top bar */}
        <div className="flex items-center justify-between fade-in-up">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="mr-1 inline-flex items-center justify-center rounded-full border border-brand/20 bg-white p-2 text-brand shadow-sm transition-colors hover:bg-brand/10"
              aria-label="Back to landing"
            >
              <FiChevronLeft className="h-5 w-5" />
            </Link>
            <img src={acturaLogo} alt="Actura" className="h-22 md:h-20 w-auto" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#E9F2FF] flex items-center justify-center text-sm font-bold text-brand-dark">
              {data.profile.initials}
            </div>
            <span className="text-brand-dark">{data.profile.name}</span>
          </div>
        </div>

        {/* Greeting */}
        <div className="mt-8 fade-in-up fade-in-up-1">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900">Good afternoon, {data.profile.name}</h1>
          <p className="mt-2 text-neutral-500">Here are your recent meetings and recordings</p>
        </div>

        {/* Search */}
        <div className="mt-6 fade-in-up fade-in-up-2">
          <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm transition-shadow focus-within:shadow-md">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search meetings..."
              className="w-full outline-none"
            />
          </div>
        </div>

        {/* Meetings list */}
        <div className="mt-6 grid gap-4 fade-in-up fade-in-up-3">
          {filtered.map(meeting => (
            <article key={meeting.id} className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-transform duration-200 ease-out hover:shadow-md hover:scale-[1.01]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link to={`/meetings/${meeting.id}`} className="text-lg font-semibold text-brand-dark hover:text-brand">
                    {meeting.title}
                  </Link>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
                    <span>Yesterday at {new Date(meeting.startsAtISO).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                    {meeting.actionItemCount > 0 && (
                      <>
                        <span>•</span>
                        <span>{meeting.actionItemCount} action item{meeting.actionItemCount > 1 ? 's' : ''}</span>
                      </>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-neutral-600">
                    {meeting.participants.map(p => (
                      <span key={p.id} className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#E9F2FF] text-brand-dark text-[11px] font-bold">{p.initials}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill status={meeting.status} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}


