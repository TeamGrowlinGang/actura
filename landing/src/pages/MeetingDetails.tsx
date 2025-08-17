import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchMeetingById, createActionItem, updateActionItem, deleteActionItem } from '../lib/data'
import type { ActionItem, Meeting } from '../lib/types'
import { FiChevronLeft, FiClock, FiDownload, FiSend, FiX } from 'react-icons/fi'

function formatDuration(mins: number): string {
  if (mins <= 0) return '0m'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}

function Participants({ participants }: { participants: Meeting['participants'] }) {
  const maxVisible = 3
  const visible = participants.slice(0, maxVisible)
  const hidden = participants.slice(maxVisible)
  const tooltip = hidden.length > 0 ? hidden.map((p) => p.name).join(', ') : ''
  return (
    <div className="flex items-center gap-2">
      {visible.map((p) => (
        <span key={p.id} className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#E9F2FF] text-brand-dark text-[11px] font-bold" title={p.name}>{p.initials}</span>
      ))}
      {hidden.length > 0 && (
        <span className="inline-flex h-6 px-2 items-center justify-center rounded-full bg-[#E9F2FF] text-brand-dark text-[11px] font-bold" title={tooltip}>
          3+
        </span>
      )}
    </div>
  )
}

export function MeetingDetails() {
  const { id } = useParams<{ id: string }>()
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [items, setItems] = useState<ActionItem[]>([])
  const [sending, setSending] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!id) return
    fetchMeetingById(id)
      .then((m) => {
        setMeeting(m)
        setItems(m?.actionItems ?? [])
      })
      .catch(console.error)
  }, [id])

  if (!meeting) {
    return (
      <section className="min-h-dvh bg-[#F7FAFF] px-4 py-6 md:py-10">
        <div className="site-container">
          <div className="h-6 w-48 rounded bg-neutral-100" />
          <div className="mt-4 h-10 w-full max-w-3xl rounded bg-neutral-100" />
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-dvh bg-[#F7FAFF] px-4 py-6 md:py-10 hero-fade">
      <div className="site-container">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/profile" className="inline-flex items-center justify-center rounded-full border border-brand/20 bg-white p-2 text-brand shadow-sm hover:bg-brand/10" aria-label="Back to profile">
              <FiChevronLeft className="h-5 w-5" />
            </Link>
            <span className="text-base font-semibold text-[#2a74ff]">Meetings</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm" />
        </div>

        {/* Title + actions + meta */}
        <div className="mt-6">
          <div className="grid items-start gap-3 md:grid-cols-[1fr_auto] md:grid-rows-2">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight md:row-start-1 md:col-start-1">{meeting.title}</h1>

            <button
              type="button"
              onClick={async () => {
                setSending(true)
                const startedAt = performance.now()
                try {
                  const base = (import.meta as any).env.VITE_N8N_URL as string
                  const secret = (import.meta as any).env.VITE_N8N_SECRET as string | undefined
                  const url = `${base?.replace(/\/$/, '') || ''}/webhook/export-notion`
                  await fetch(url, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      ...(secret ? { 'x-webhook-secret': secret } : {}),
                    },
                    body: JSON.stringify({ meetingId: meeting.id }),
                  })
                } catch (err) {
                  console.error('Failed to request Notion export', err)
                } finally {
                  const elapsed = performance.now() - startedAt
                  const minimumMs = 1200
                  const remaining = Math.max(0, minimumMs - elapsed)
                  window.setTimeout(() => setSending(false), remaining)
                }
              }}
              className="inline-flex items-center justify-self-end justify-center gap-2 rounded-lg bg-[#2a74ff] px-3 py-2 font-semibold text-white shadow hover:bg-brand-dark md:row-start-1 md:col-start-2"
            >
              <FiSend /> {sending ? 'Sending…' : 'Send to Notion'}
            </button>

            <div className="flex flex-wrap items-center gap-4 text-neutral-500 md:row-start-2 md:col-start-1">
              <span className="inline-flex items-center gap-1"><FiClock /> Yesterday at {new Date(meeting.startsAtISO).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
              <span>•</span>
              <span>{formatDuration(meeting.durationMinutes)}</span>
              <span>•</span>
              <Participants participants={meeting.participants} />
            </div>

            <button
              type="button"
              onClick={() => {
                setDownloading(true)
                setTimeout(() => setDownloading(false), 900)
              }}
              className="inline-flex items-center justify-self-end justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 font-medium shadow-sm hover:bg-neutral-50 md:row-start-2 md:col-start-2"
            >
              <FiDownload /> {downloading ? 'Preparing…' : 'Download transcript'}
            </button>
          </div>
        </div>

        {/* Summary */}
        {meeting.summary && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold">Summary</h2>
            <p className="mt-3 max-w-4xl text-neutral-700">{meeting.summary}</p>
          </div>
        )}

        {/* Action items */}
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Action items</h2>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm hover:bg-neutral-50"
              onClick={async () => {
                // Optimistic add; if Supabase mode, create server-side and use returned id
                const optimistic = { id: `ai_${items.length + 1}`, title: '', assigneeEmail: '', dueDateISO: '', priority: 'Medium' as const }
                setItems((prev) => [...prev, optimistic])
                const created = await createActionItem(meeting.id)
                if (created) {
                  setItems((prev) => prev.map((p) => (p === optimistic ? created : p)))
                }
              }}
            >
              + Add item
            </button>
          </div>
          {items.length === 0 ? (
            <p className="mt-3 text-neutral-500">No action items yet.</p>
          ) : (
            <div className="mt-4 grid gap-4">
              {items.map((ai, idx) => (
                <div key={ai.id} className="group rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <input
                        value={ai.title}
                        onChange={(e) => {
                          const v = e.target.value
                          setItems((prev) => prev.map((p, i) => i === idx ? { ...p, title: v } : p))
                        }}
                        onBlur={() => updateActionItem(meeting.id, items[idx]).catch(console.error)}
                        placeholder="Add an action item title..."
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 outline-none focus:border-brand"
                      />
                      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                        <input
                          value={ai.assigneeEmail ?? ''}
                          onChange={(e) => {
                            const v = e.target.value
                            setItems((prev) => prev.map((p, i) => i === idx ? { ...p, assigneeEmail: v } : p))
                          }}
                          onBlur={() => updateActionItem(meeting.id, items[idx]).catch(console.error)}
                          placeholder="Assignee"
                          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 outline-none focus:border-brand"
                        />
                        <input
                          type="date"
                          value={ai.dueDateISO ? new Date(ai.dueDateISO).toISOString().slice(0, 10) : ''}
                          onChange={(e) => {
                            const v = e.target.value
                            setItems((prev) => prev.map((p, i) => i === idx ? { ...p, dueDateISO: v ? new Date(v).toISOString() : '' } : p))
                          }}
                          onBlur={() => updateActionItem(meeting.id, items[idx]).catch(console.error)}
                          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 outline-none focus:border-brand"
                        />
                        <select
                          value={ai.priority ?? 'Medium'}
                          onChange={(e) => {
                            const v = e.target.value as ActionItem['priority']
                            setItems((prev) => prev.map((p, i) => i === idx ? { ...p, priority: v } : p))
                          }}
                          onBlur={() => updateActionItem(meeting.id, items[idx]).catch(console.error)}
                          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 outline-none focus:border-brand"
                        >
                          <option>Low</option>
                          <option>Medium</option>
                          <option>High</option>
                        </select>
                      </div>
                      {/* Timestamp is rendered in the right column under the delete button */}
                    </div>
                    <div className="flex w-16 flex-col items-center gap-2 pt-1">
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 shadow-sm hover:bg-red-100"
                        onClick={() => {
                          const toDelete = items[idx]
                          setItems((prev) => prev.filter((_, i) => i !== idx))
                          deleteActionItem(toDelete.id).catch(console.error)
                        }}
                        aria-label="Delete action item"
                        title="Delete"
                      >
                        <FiX />
                      </button>
                      {ai.timestampLabel && (
                        <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-600">{ai.timestampLabel}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}


