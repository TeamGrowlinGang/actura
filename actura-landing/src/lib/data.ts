import type { ProfileData } from './types'
import { mockProfileData } from './mockData'

// Toggle this later to switch to Supabase implementation
export const DATA_SOURCE: 'mock' | 'supabase' = 'mock'

// Single seam: replace this function body to fetch from Supabase later.
export async function fetchProfileData(): Promise<ProfileData> {
  if (DATA_SOURCE === 'mock') {
    await new Promise((r) => setTimeout(r, 250))
    return mockProfileData
  }
  // Placeholder for future Supabase implementation
  // Example shape for the agent to implement:
  // const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  // const { data, error } = await client
  //   .from('meetings')
  //   .select('...')
  // if (error) throw error
  // return transformSupabaseToProfileData(data)
  throw new Error('Supabase data source not implemented yet')
}

export async function fetchMeetingById(id: string) {
  const data = await fetchProfileData()
  return data.meetings.find((m) => m.id === id) ?? null
}


