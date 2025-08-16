export type RecordingStatus = 'pending' | 'complete'

export interface UserProfile {
  id: string
  name: string
  initials: string
}

export interface Participant {
  id: string
  name: string
  initials: string
}

export interface Meeting {
  id: string
  title: string
  startsAtISO: string
  durationMinutes: number
  actionItemCount: number
  status: RecordingStatus
  participants: Participant[]
  summary?: string
  actionItems?: ActionItem[]
}

export interface ProfileData {
  profile: UserProfile
  meetings: Meeting[]
}

export interface ActionItem {
  id: string
  title: string
  assigneeEmail?: string
  dueDateISO?: string
  priority?: 'Low' | 'Medium' | 'High'
  timestampLabel?: string
}


