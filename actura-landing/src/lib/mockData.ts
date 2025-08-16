import type { ProfileData } from './types'

export const mockProfileData: ProfileData = {
  profile: {
    id: 'user_zh',
    name: 'Zahir',
    initials: 'ZH',
  },
  meetings: [
    {
      id: 'm_1',
      title: 'You and Them Discuss Information Sharing',
      startsAtISO: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      durationMinutes: 0,
      actionItemCount: 0,
      status: 'pending',
      participants: [
        { id: 'p_zh', name: 'Zahir', initials: 'ZH' },
        { id: 'p_th', name: 'TH', initials: 'TH' },
        { id: 'p_js', name: 'JS', initials: 'JS' },
        { id: 'p_am', name: 'AM', initials: 'AM' },
      ],
      summary:
        'Discussion covered key information sharing protocols, data privacy concerns, and implementation timelines for the new system.',
      actionItems: [
        {
          id: 'ai_1',
          title: 'Review privacy policy updates',
          assigneeEmail: 'zahir@example.com',
          dueDateISO: new Date('2024-01-20').toISOString(),
          priority: 'High',
          timestampLabel: '@12:34',
        },
        {
          id: 'ai_2',
          title: 'Setup technical implementation meeting',
          assigneeEmail: 'them@example.com',
          dueDateISO: undefined,
          priority: 'Medium',
          timestampLabel: '@15:22',
        },
      ],
    },
    {
      id: 'm_2',
      title: 'You and Them Discuss Computer Architecture Concept',
      startsAtISO: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      durationMinutes: 378, // 6h 18m
      actionItemCount: 1,
      status: 'pending',
      participants: [
        { id: 'p_zh', name: 'Zahir', initials: 'ZH' },
        { id: 'p_th', name: 'TH', initials: 'TH' },
      ],
    },
    {
      id: 'm_3',
      title: 'You Discuss Pipeline Branching and Speculation',
      startsAtISO: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      durationMinutes: 3,
      actionItemCount: 7,
      status: 'complete',
      participants: [
        { id: 'p_zh', name: 'Zahir', initials: 'ZH' },
      ],
    },
  ],
}


