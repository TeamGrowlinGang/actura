-- Seed data mirroring mockProfileData
insert into profiles (id, name, initials)
values ('user_zh', 'Zahir', 'ZH')
on conflict (id) do update set name = excluded.name, initials = excluded.initials;

-- Participants
insert into participants (id, name, initials) values
  ('p_zh', 'Zahir', 'ZH'),
  ('p_th', 'TH', 'TH'),
  ('p_js', 'JS', 'JS'),
  ('p_am', 'AM', 'AM')
on conflict (id) do update set name = excluded.name, initials = excluded.initials;

-- Meetings
insert into meetings (id, owner_id, title, starts_at, duration_minutes, status, summary) values
  ('m_1', 'user_zh', 'You and Them Discuss Information Sharing', now() - interval '20 hours', 0, 'pending', 'Discussion covered key information sharing protocols, data privacy concerns, and implementation timelines for the new system.'),
  ('m_2', 'user_zh', 'You and Them Discuss Computer Architecture Concept', now() - interval '1 day', 378, 'pending', null),
  ('m_3', 'user_zh', 'You Discuss Pipeline Branching and Speculation', now() - interval '1 day', 3, 'complete', null)
on conflict (id) do update set title = excluded.title;

-- Meeting participants
insert into meeting_participants (meeting_id, participant_id) values
  ('m_1', 'p_zh'), ('m_1', 'p_th'), ('m_1', 'p_js'), ('m_1', 'p_am'),
  ('m_2', 'p_zh'), ('m_2', 'p_th'),
  ('m_3', 'p_zh')
on conflict do nothing;

-- Action items for m_1
insert into action_items (id, meeting_id, title, assignee_email, due_date, priority, timestamp_label) values
  ('ai_1', 'm_1', 'Review privacy policy updates', 'zahir@example.com', '2024-01-20T00:00:00Z', 'High', '@12:34'),
  ('ai_2', 'm_1', 'Setup technical implementation meeting', 'them@example.com', null, 'Medium', '@15:22')
on conflict (id) do update set title = excluded.title;


