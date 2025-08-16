import type { ProfileData, Meeting, ActionItem, Participant } from './types'
import { mockProfileData } from './mockData'
import { getSupabaseClient } from './supabaseClient'

// Toggle this later to switch to Supabase implementation
export const DATA_SOURCE: 'mock' | 'supabase' = (import.meta.env.VITE_DATA_SOURCE as 'mock' | 'supabase') ?? 'mock'

// Single seam: replace this function body to fetch from Supabase later.
export async function fetchProfileData(): Promise<ProfileData> {
  if (DATA_SOURCE === 'mock') {
    await new Promise((r) => setTimeout(r, 250))
    return mockProfileData
  }
  const client = getSupabaseClient()
  if (!client) {
    console.warn('Supabase env not configured, falling back to mock data')
    await new Promise((r) => setTimeout(r, 250))
    return mockProfileData
  }

  // Fetch the single profile for now (mock parity)
  const { data: profileRows, error: profileError } = await client
    .from('profiles')
    .select('id, name, initials')
    .limit(1)
  if (profileError) throw profileError
  const profile = profileRows?.[0] ?? mockProfileData.profile

  // Fetch meetings with participants and action items
  const { data: meetingRows, error: meetingsError } = await client
    .from('meetings')
    .select(`
      id,
      title,
      starts_at,
      duration_minutes,
      status,
      summary,
      notion_requested,
      notion_exported_at,
      meeting_participants:meeting_participants(
        participant:participants(
          id,
          name,
          initials
        )
      ),
      action_items(id, title, assignee_email, due_date, priority, timestamp_label)
    `)
    .order('starts_at', { ascending: false })
  if (meetingsError) throw meetingsError

  const meetings: Meeting[] = (meetingRows ?? []).map((row: any) => {
    const participants: Participant[] = (row.meeting_participants ?? [])
      .map((mp: any) => mp.participant)
      .filter(Boolean)
    const actionItems: ActionItem[] | undefined = (row.action_items ?? []).map((ai: any) => ({
      id: ai.id,
      title: ai.title,
      assigneeEmail: ai.assignee_email ?? undefined,
      dueDateISO: ai.due_date ?? undefined,
      priority: ai.priority ?? undefined,
      timestampLabel: ai.timestamp_label ?? undefined,
    }))

    const actionItemCount = actionItems?.length ?? 0

    return {
      id: row.id,
      title: row.title,
      startsAtISO: row.starts_at,
      durationMinutes: row.duration_minutes ?? 0,
      actionItemCount,
      status: row.status,
      participants,
      summary: row.summary ?? undefined,
      actionItems,
      notionRequested: row.notion_requested,
      notionExportedAt: row.notion_exported_at,
    }
  })

  return { profile, meetings }
}

export async function fetchMeetingById(id: string) {
  const data = await fetchProfileData()
  return data.meetings.find((m) => m.id === id) ?? null
}

export async function requestNotionExport(meetingId: string): Promise<boolean> {
  if (DATA_SOURCE !== 'supabase') return true
  const client = getSupabaseClient()
  if (!client) return false
  const { error } = await client
    .from('meetings')
    .update({ notion_requested: true })
    .eq('id', meetingId)
  if (error) {
    console.error('Failed to flag Notion export:', error)
    return false
  }
  return true
}


