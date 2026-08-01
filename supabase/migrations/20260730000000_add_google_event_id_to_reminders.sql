-- AutoFlow Studio — Add Google Calendar Event ID tracking to reminders table
alter table public.reminders
  add column if not exists google_event_id text;
