-- Schema for landing app to mirror mock data
create table if not exists profiles (
  id text primary key,
  name text not null,
  initials text not null
);

do $$ begin
  create type recording_status as enum ('pending','complete');
exception when duplicate_object then null; end $$;

create table if not exists meetings (
  id text primary key,
  owner_id text not null references profiles(id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  duration_minutes integer not null default 0,
  status recording_status not null default 'pending',
  summary text
);

create table if not exists participants (
  id text primary key,
  name text not null,
  initials text not null
);

create table if not exists meeting_participants (
  meeting_id text not null references meetings(id) on delete cascade,
  participant_id text not null references participants(id) on delete cascade,
  primary key (meeting_id, participant_id)
);

do $$ begin
  create type priority_level as enum ('Low','Medium','High');
exception when duplicate_object then null; end $$;

create table if not exists action_items (
  id text primary key,
  meeting_id text not null references meetings(id) on delete cascade,
  title text not null,
  assignee_email text,
  due_date timestamptz,
  priority priority_level,
  timestamp_label text
);

-- Enable RLS
alter table profiles enable row level security;
alter table meetings enable row level security;
alter table participants enable row level security;
alter table meeting_participants enable row level security;
alter table action_items enable row level security;

-- Public read policies (adjust later for auth)
drop policy if exists "Allow public read profiles" on profiles;
create policy "Allow public read profiles" on profiles for select using (true);

drop policy if exists "Allow public read meetings" on meetings;
create policy "Allow public read meetings" on meetings for select using (true);

drop policy if exists "Allow public read participants" on participants;
create policy "Allow public read participants" on participants for select using (true);

drop policy if exists "Allow public read meeting_participants" on meeting_participants;
create policy "Allow public read meeting_participants" on meeting_participants for select using (true);

drop policy if exists "Allow public read action_items" on action_items;
create policy "Allow public read action_items" on action_items for select using (true);


