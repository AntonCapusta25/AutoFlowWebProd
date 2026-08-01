-- Create marketing content calendar and weekly KPIs tables, relax lead_history columns

-- 1. Create marketing_calendar_items table
drop table if exists public.marketing_calendar_items cascade;
create table public.marketing_calendar_items (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('tiktok', 'linkedin')),
  scheduled_date date,
  date_label text,
  day_of_week text,
  account text,
  pillar text,
  format text,
  hook text,
  concept_or_topic text,
  caption_or_destination text,
  cta text,
  notes text,
  google_event_id text, -- Polymorphic Google Calendar connection
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Create marketing_weekly_kpis table
drop table if exists public.marketing_weekly_kpis cascade;
create table public.marketing_weekly_kpis (
  id uuid primary key default gen_random_uuid(),
  week_label text not null unique,
  pillar_1_debt_impressions integer not null default 0,
  pillar_2_proof_impressions integer not null default 0,
  pillar_3_offer_impressions integer not null default 0,
  saves_shares integer not null default 0,
  quality_comments integer not null default 0,
  audit_comments integer not null default 0,
  booked_calls integer not null default 0,
  founder_impressions integer not null default 0,
  company_page_impressions integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Modify lead_history to support nullable lead_id and 'marketing' event logging
alter table public.lead_history alter column lead_id drop not null;
alter table public.lead_history drop constraint if exists lead_history_lead_type_check;
alter table public.lead_history add constraint lead_history_lead_type_check check (lead_type in ('booking', 'contact', 'outreach', 'marketing'));

-- 4. Enable Row Level Security
alter table public.marketing_calendar_items enable row level security;
alter table public.marketing_weekly_kpis enable row level security;

-- 5. Create RLS Policies: Everyone (authenticated) can read, only Admin / Napoleon can write
create policy "Anyone authenticated can read marketing_calendar_items"
  on public.marketing_calendar_items for select to authenticated using (true);

create policy "Admins can insert marketing_calendar_items"
  on public.marketing_calendar_items for insert to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'Napoleon')
    )
  );

create policy "Admins can update marketing_calendar_items"
  on public.marketing_calendar_items for update to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'Napoleon')
    )
  );

create policy "Admins can delete marketing_calendar_items"
  on public.marketing_calendar_items for delete to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'Napoleon')
    )
  );

create policy "Anyone authenticated can read marketing_weekly_kpis"
  on public.marketing_weekly_kpis for select to authenticated using (true);

create policy "Admins can insert marketing_weekly_kpis"
  on public.marketing_weekly_kpis for insert to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'Napoleon')
    )
  );

create policy "Admins can update marketing_weekly_kpis"
  on public.marketing_weekly_kpis for update to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'Napoleon')
    )
  );

create policy "Admins can delete marketing_weekly_kpis"
  on public.marketing_weekly_kpis for delete to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'Napoleon')
    )
  );

-- 6. Insert Seed Data
-- --- TikTok Calendar Items ---
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, pillar, format, hook, concept_or_topic, caption_or_destination, cta, notes) VALUES ('tiktok', '2026-07-27', 'Jul 27, 2026', 'Monday', 'Operational Debt', 'POV / talking head', '"POV: you''re still copy-pasting leads into a spreadsheet in 2026"', 'Fast-paced POV showing the daily manual grind of a founder juggling 5 tools before AutoFlow', 'The 5-tool tax nobody talks about', 'Follow for the fix', 'Sets the operational-debt hook in TikTok-native format');
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, pillar, format, hook, concept_or_topic, caption_or_destination, cta, notes) VALUES ('tiktok', '2026-07-28', 'Jul 28, 2026', 'Tuesday', 'Proof: Cases & Mini-Builds', 'Screen recording', '"I automated this in one afternoon"', 'Screen-record building a lead-follow-up automation live, sped up with captions calling out each step', 'We saved this business [X hrs]/week — here''s how', 'Comment AUDIT for a free breakdown', 'Needs a real/labelled-illustrative number + named industry, same specificity bar as LinkedIn');
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, pillar, format, hook, concept_or_topic, caption_or_destination, cta, notes) VALUES ('tiktok', '2026-07-29', 'Jul 29, 2026', 'Wednesday', 'Trend / Culture', 'Trending audio + text overlay', 'Use a current trending sound to frame "things that live rent-free in a founder''s head"', 'Quick list-style video: manual invoicing, missed follow-ups, no-show reminders, duplicate data entry', 'Rent-free: operational debt edition', 'Follow for more', 'Check trending sounds day-of; swap audio if it''s aged out');
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, pillar, format, hook, concept_or_topic, caption_or_destination, cta, notes) VALUES ('tiktok', '2026-07-30', 'Jul 30, 2026', 'Thursday', 'Operational Debt', 'Talking head', '"Nobody tells you scaling breaks your systems before it breaks your team"', 'Direct-to-camera short rant on why growth without systems = more manual work, not less', 'Scaling ≠ hiring more people to do the same thing manually', 'Link in bio for the checklist', NULL);
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, pillar, format, hook, concept_or_topic, caption_or_destination, cta, notes) VALUES ('tiktok', '2026-07-31', 'Jul 31, 2026', 'Friday', 'Offer & Audit', 'Talking head + text overlay', '"We''ll audit your business for free — here''s what that actually means"', 'Plain explanation of the audit: what we look at, what you get, how fast', 'Comment AUDIT and we''ll DM you', 'Comment AUDIT', 'Confirm AUDIT-comment automation is live before this posts');
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, pillar, format, hook, concept_or_topic, caption_or_destination, cta, notes) VALUES ('tiktok', NULL, 'Wk1 — daily', 'Mon–Sun', 'Engagement', 'Comment engagement', NULL, '15–20 min/day commenting on target-audience and automation/ops/SaaS-founder content — same daily habit as the LinkedIn plan, run on TikTok too', NULL, '—', 'Cheapest reach lever while the account is still building an audience');
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, pillar, format, hook, concept_or_topic, caption_or_destination, cta, notes) VALUES ('tiktok', '2026-08-03', 'Aug 03, 2026', 'Monday', 'Operational Debt', 'POV / talking head', '"POV: your CRM, your spreadsheet and your inbox all disagree about who your leads are"', 'Skit-style: three "sources of truth" arguing with each other, then AutoFlow reconciling them', 'When your tools don''t talk to each other', 'Follow for the fix', NULL);
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, pillar, format, hook, concept_or_topic, caption_or_destination, cta, notes) VALUES ('tiktok', '2026-08-04', 'Aug 04, 2026', 'Tuesday', 'Proof: Cases & Mini-Builds', 'Before/after split-screen', '"Before vs after: this business''s follow-up process"', 'Split-screen: manual chaos (sticky notes, missed replies) vs automated flow (instant, tracked)', '[X industry], [X hrs] saved/week', 'Comment AUDIT for a free breakdown', 'Real number + named industry required');
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, pillar, format, hook, concept_or_topic, caption_or_destination, cta, notes) VALUES ('tiktok', '2026-08-05', 'Aug 05, 2026', 'Wednesday', 'Trend / Culture', 'Duet-style / green screen reaction', 'React to a common bad automation take ("just hire a VA")', 'Green-screen reaction video pushing back gently, tying to "systems > shortcuts" brand value', 'Hot take: more hands isn''t the fix', 'Follow for more', 'Pick a real trending clip/format that fits — don''t force it');
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, pillar, format, hook, concept_or_topic, caption_or_destination, cta, notes) VALUES ('tiktok', '2026-08-06', 'Aug 06, 2026', 'Thursday', 'Operational Debt', 'Talking head', '"The $ cost of ''we''ll fix it later''"', 'Short story format: a process someone said they''d fix later, and what it cost a year on', '"We''ll fix it later" became a year', 'Link in bio for the checklist', NULL);
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, pillar, format, hook, concept_or_topic, caption_or_destination, cta, notes) VALUES ('tiktok', '2026-08-07', 'Aug 07, 2026', 'Friday', 'Offer & Audit', 'Screen recording + talking head', '"What actually happens after you comment AUDIT"', 'Walk through the automated DM → booking link flow, demystifying the CTA', 'See exactly what you get', 'Comment AUDIT', 'Second offer post of the week across the two-account funnel');
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, pillar, format, hook, concept_or_topic, caption_or_destination, cta, notes) VALUES ('tiktok', NULL, 'Wk2 — daily', 'Mon–Sun', 'Engagement', 'Comment engagement', NULL, '15–20 min/day commenting on target-audience and automation/ops/SaaS-founder content — same daily habit as the LinkedIn plan, run on TikTok too', NULL, '—', 'Cheapest reach lever while the account is still building an audience');
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, pillar, format, hook, concept_or_topic, caption_or_destination, cta, notes) VALUES ('tiktok', '2026-08-10', 'Aug 10, 2026', 'Monday', 'Proof: Cases & Mini-Builds', 'Screen recording', '"Watch this chatbot qualify a lead in real time"', 'Live screen demo of an AI chatbot/lead-qualification flow, sped up with callouts', '[X industry] chatbot, live', 'Comment AUDIT for a free breakdown', NULL);
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, pillar, format, hook, concept_or_topic, caption_or_destination, cta, notes) VALUES ('tiktok', '2026-08-11', 'Aug 11, 2026', 'Tuesday', 'Operational Debt', 'POV / talking head', '"POV: you''re the only person who knows how the whole business actually runs"', 'Relatable founder-bottleneck scenario, tied to key-person risk from undocumented manual process', 'If you disappeared for a week, would the business run?', 'Follow for the fix', NULL);
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, pillar, format, hook, concept_or_topic, caption_or_destination, cta, notes) VALUES ('tiktok', '2026-08-12', 'Aug 12, 2026', 'Wednesday', 'Trend / Culture', 'Trending audio + text overlay', 'List-style using a trending format: "Signs your ops are held together with duct tape"', 'Quick-cut list version of the LinkedIn checklist carousel, adapted for vertical video pacing', '5 signs your ops are duct-taped', 'Link in bio for the checklist', 'Mirrors the Week-1 LinkedIn carousel — repurpose the same list, new format');
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, pillar, format, hook, concept_or_topic, caption_or_destination, cta, notes) VALUES ('tiktok', '2026-08-13', 'Aug 13, 2026', 'Thursday', 'Proof: Cases & Mini-Builds', 'Talking head + b-roll', '"Here''s what a real operational-debt audit looks like"', 'Walk through an actual audit output (redacted/illustrative), narrated plainly', 'Inside a real audit', 'Comment AUDIT for a free breakdown', 'First specificity-bar case study should be live by this point');
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, pillar, format, hook, concept_or_topic, caption_or_destination, cta, notes) VALUES ('tiktok', '2026-08-14', 'Aug 14, 2026', 'Friday', 'Operational Debt', 'Talking head', '"Automation isn''t about replacing people, it''s about removing the boring 80%"', 'Direct-to-camera myth-busting short, reinforcing brand value ''engineering first, not shortcuts''', 'What automation is actually for', 'Follow for more', NULL);
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, pillar, format, hook, concept_or_topic, caption_or_destination, cta, notes) VALUES ('tiktok', NULL, 'Wk3 — daily', 'Mon–Sun', 'Engagement', 'Comment engagement', NULL, '15–20 min/day commenting on target-audience and automation/ops/SaaS-founder content — same daily habit as the LinkedIn plan, run on TikTok too', NULL, '—', 'Cheapest reach lever while the account is still building an audience');
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, pillar, format, hook, concept_or_topic, caption_or_destination, cta, notes) VALUES ('tiktok', '2026-08-17', 'Aug 17, 2026', 'Monday', 'Operational Debt', 'POV / talking head', '"POV: onboarding a new client and re-typing their info into 4 different systems"', 'Relatable skit on double data entry during onboarding', 'Data entry: the silent tax on growth', 'Follow for the fix', NULL);
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, pillar, format, hook, concept_or_topic, caption_or_destination, cta, notes) VALUES ('tiktok', '2026-08-18', 'Aug 18, 2026', 'Tuesday', 'Proof: Cases & Mini-Builds', 'Before/after split-screen', '"Before vs after: this business''s customer-service response time"', 'Split-screen showing manual response delays vs automated instant handling, with a stated number', '[X industry], response time cut by [X]', 'Comment AUDIT for a free breakdown', 'Real number + named industry required');
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, pillar, format, hook, concept_or_topic, caption_or_destination, cta, notes) VALUES ('tiktok', '2026-08-19', 'Aug 19, 2026', 'Wednesday', 'Trend / Culture', 'Trending audio + text overlay', 'Use a current trend format to riff on "things that take 5 minutes but feel like 50"', 'Quick relatable list of small manual tasks that compound into hours lost weekly', 'Death by a thousand small tasks', 'Link in bio for the checklist', 'Check trend relevance day-of before publishing');
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, pillar, format, hook, concept_or_topic, caption_or_destination, cta, notes) VALUES ('tiktok', '2026-08-20', 'Aug 20, 2026', 'Thursday', 'Offer & Audit', 'Talking head', '"What changes in your business 30 days after an audit"', 'Plain walkthrough of before/after 30 days post-audit, concrete and outcome-driven', '30 days after your audit', 'Comment AUDIT', NULL);
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, pillar, format, hook, concept_or_topic, caption_or_destination, cta, notes) VALUES ('tiktok', '2026-08-21', 'Aug 21, 2026', 'Friday', 'Proof: Cases & Mini-Builds', 'Screen recording', '"60 seconds: this automation runs while you sleep"', 'Screen recording of an automation firing overnight (booking, follow-up, or reminder), sped up', 'Runs while you sleep, literally', 'Comment AUDIT for a free breakdown', 'Good candidate to reuse/re-cut the LinkedIn 60-second proof video for TikTok pacing');
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, pillar, format, hook, concept_or_topic, caption_or_destination, cta, notes) VALUES ('tiktok', NULL, 'Wk4 — daily', 'Mon–Sun', 'Engagement', 'Comment engagement', NULL, '15–20 min/day commenting on target-audience and automation/ops/SaaS-founder content — same daily habit as the LinkedIn plan, run on TikTok too', NULL, '—', 'Cheapest reach lever while the account is still building an audience');

-- --- LinkedIn Calendar Items ---
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, account, pillar, format, concept_or_topic, cta, caption_or_destination, notes) VALUES ('linkedin', '2026-07-27', 'Jul 27, 2026', 'Monday', 'Company (Page) — Wk1', 'Operational Debt', 'Long-form text', '"The spreadsheet that runs your business": recognizable story of a founder tracking leads across 5 tools until something breaks', 'Soft — link in comments', 'Blog: What is operational debt?', 'Sets up the core narrative for the whole page');
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, account, pillar, format, concept_or_topic, cta, caption_or_destination, notes) VALUES ('linkedin', '2026-07-28', 'Jul 28, 2026', 'Tuesday', 'Founder (Profile) — Wk1', 'Operational Debt', 'Long-form text', 'First-person POV: the exact moment I realized manual follow-ups were capping our own growth', 'Soft — link in comments', 'Blog: What is operational debt?', 'More personal/opinionated framing of Wed''s theme');
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, account, pillar, format, concept_or_topic, cta, caption_or_destination, notes) VALUES ('linkedin', '2026-07-29', 'Jul 29, 2026', 'Wednesday', 'Company (Page) — Wk1', 'Proof: Cases & Mini-Builds', 'Carousel / document', 'Framework carousel: "5 signs your ops are held together with duct tape" (saveable checklist)', 'Medium — download checklist', 'Landing page: Operational debt checklist (email capture)', 'Anchors the framework to recognizable symptoms, not abstract theory');
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, account, pillar, format, concept_or_topic, cta, caption_or_destination, notes) VALUES ('linkedin', '2026-07-30', 'Jul 30, 2026', 'Thursday', 'Founder (Profile) — Wk1', 'Proof: Cases & Mini-Builds', 'Short screen-recording video', '60 seconds: a real automation we''ve shipped, shown end-to-end (no client name needed yet — label as illustrative if unconfirmed)', 'Medium — download mini-blueprint', 'Landing page: Mini-blueprint download', 'Needs a number, a named industry and a timeframe — no case study without a stat');
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, account, pillar, format, concept_or_topic, cta, caption_or_destination, notes) VALUES ('linkedin', '2026-07-31', 'Jul 31, 2026', 'Friday', 'Company (Page) — Wk1', 'Operational Debt', 'Long-form text', '"We''ll fix this later" becoming a year — the operational debt compounding story, service-business angle', 'Soft — link in comments', 'Blog: What is operational debt?', NULL);
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, account, pillar, format, concept_or_topic, cta, caption_or_destination, notes) VALUES ('linkedin', '2026-08-01', 'Aug 01, 2026', 'Saturday', 'Founder (Profile) — Wk1', 'Operational Debt', 'Long-form text', 'Opinion post: why most ''automation'' advice is just moving the manual work somewhere else', 'Soft — link in comments', 'Blog: What is operational debt?', NULL);
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, account, pillar, format, concept_or_topic, cta, caption_or_destination, notes) VALUES ('linkedin', NULL, 'Wk1 — daily', 'Mon–Sun', 'Founder', 'Engagement', 'Comment engagement', '15–20 min/day thoughtfully commenting on posts from target-audience accounts and established automation/ops/SaaS-founder voices — required, not optional', '—', '—', 'Faster reach lever than posting volume while the page is still building an audience');
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, account, pillar, format, concept_or_topic, cta, caption_or_destination, notes) VALUES ('linkedin', '2026-08-03', 'Aug 03, 2026', 'Monday', 'Company (Page) — Wk2', 'Operational Debt', 'Long-form text', 'The "five tools, one truth" problem: what happens when your CRM, spreadsheet and inbox all disagree', 'Soft — link in comments', 'Blog: What is operational debt?', NULL);
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, account, pillar, format, concept_or_topic, cta, caption_or_destination, notes) VALUES ('linkedin', '2026-08-04', 'Aug 04, 2026', 'Tuesday', 'Founder (Profile) — Wk2', 'Operational Debt', 'Long-form text', 'Founder POV: the real cost of a manual process isn''t the hours, it''s the decisions made on stale data', 'Soft — link in comments', 'Blog: What is operational debt?', NULL);
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, account, pillar, format, concept_or_topic, cta, caption_or_destination, notes) VALUES ('linkedin', '2026-08-05', 'Aug 05, 2026', 'Wednesday', 'Company (Page) — Wk2', 'Offer & Audit', 'Long-form text', 'Direct CTA: explain the audit process in plain terms — what we look at, what you get, how long it takes', 'Hard — "Comment AUDIT"', 'Automated DM → booking link (see 6.1 automation)', 'Confirm AUDIT-comment automation is live before this posts (Weeks 1–2 checklist item)');
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, account, pillar, format, concept_or_topic, cta, caption_or_destination, notes) VALUES ('linkedin', '2026-08-06', 'Aug 06, 2026', 'Thursday', 'Founder (Profile) — Wk2', 'Proof: Cases & Mini-Builds', 'Carousel / document', 'Before/after breakdown: a lead-qualification workflow — manual steps on the left, automated flow on the right', 'Medium — download mini-blueprint', 'Landing page: Mini-blueprint download', 'Include real/labelled-illustrative number, named industry, timeframe');
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, account, pillar, format, concept_or_topic, cta, caption_or_destination, notes) VALUES ('linkedin', '2026-08-07', 'Aug 07, 2026', 'Friday', 'Company (Page) — Wk2', 'Proof: Cases & Mini-Builds', 'Short screen-recording video', '"60 seconds: how this automation saves 5 hours/week" — CRM follow-up automation demo', 'Medium — download checklist', 'Landing page: Operational debt checklist (email capture)', NULL);
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, account, pillar, format, concept_or_topic, cta, caption_or_destination, notes) VALUES ('linkedin', '2026-08-08', 'Aug 08, 2026', 'Saturday', 'Founder (Profile) — Wk2', 'Offer & Audit', 'Long-form text', 'First-person: why we start every engagement with a free audit instead of a pitch deck', 'Hard — "Comment AUDIT"', 'Automated DM → booking link (see 6.1 automation)', 'Second offer post of the week — keeps ratio near 1-in-6/7 across both accounts combined');
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, account, pillar, format, concept_or_topic, cta, caption_or_destination, notes) VALUES ('linkedin', NULL, 'Wk2 — daily', 'Mon–Sun', 'Founder', 'Engagement', 'Comment engagement', '15–20 min/day thoughtfully commenting on posts from target-audience accounts and established automation/ops/SaaS-founder voices — required, not optional', '—', '—', 'Faster reach lever than posting volume while the page is still building an audience');
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, account, pillar, format, concept_or_topic, cta, caption_or_destination, notes) VALUES ('linkedin', '2026-08-10', 'Aug 10, 2026', 'Monday', 'Founder (Profile) — Wk3', 'Proof: Cases & Mini-Builds', 'Carousel / document', 'Framework: the 3 questions we ask before automating anything (saveable, positions expertise)', 'Medium — download checklist', 'Landing page: Operational debt checklist (email capture)', NULL);
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, account, pillar, format, concept_or_topic, cta, caption_or_destination, notes) VALUES ('linkedin', '2026-08-11', 'Aug 11, 2026', 'Tuesday', 'Company (Page) — Wk3', 'Operational Debt', 'Long-form text', 'Recognizable scenario: the founder who''s the only person who knows how the whole ops stack fits together', 'Soft — link in comments', 'Blog: What is operational debt?', NULL);
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, account, pillar, format, concept_or_topic, cta, caption_or_destination, notes) VALUES ('linkedin', '2026-08-12', 'Aug 12, 2026', 'Wednesday', 'Company (Page) — Wk3', 'Proof: Cases & Mini-Builds', 'Carousel / document', 'Audit checklist carousel: what a real operational-debt audit actually covers, step by step', 'Medium — download checklist', 'Landing page: Operational debt checklist (email capture)', 'First specificity-bar case study should land this week per rollout plan');
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, account, pillar, format, concept_or_topic, cta, caption_or_destination, notes) VALUES ('linkedin', '2026-08-13', 'Aug 13, 2026', 'Thursday', 'Founder (Profile) — Wk3', 'Operational Debt', 'Long-form text', 'Opinion: "scaling" isn''t hiring more people to do the same manual process faster', 'Soft — link in comments', 'Blog: What is operational debt?', NULL);
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, account, pillar, format, concept_or_topic, cta, caption_or_destination, notes) VALUES ('linkedin', '2026-08-14', 'Aug 14, 2026', 'Friday', 'Company (Page) — Wk3', 'Operational Debt', 'Long-form text', 'Recognizable scenario: onboarding a new client/customer and re-entering their data into four systems', 'Soft — link in comments', 'Blog: What is operational debt?', NULL);
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, account, pillar, format, concept_or_topic, cta, caption_or_destination, notes) VALUES ('linkedin', '2026-08-15', 'Aug 15, 2026', 'Saturday', 'Founder (Profile) — Wk3', 'Operational Debt', 'Short screen-recording video', '60 seconds: what a client''s ops stack looked like before we touched it (screen recording walk-through)', 'Soft — link in comments', 'Blog: What is operational debt?', 'Lock in best-performing time slot from Weeks 1–2 A/B test before publishing');
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, account, pillar, format, concept_or_topic, cta, caption_or_destination, notes) VALUES ('linkedin', NULL, 'Wk3 — daily', 'Mon–Sun', 'Founder', 'Engagement', 'Comment engagement', '15–20 min/day thoughtfully commenting on posts from target-audience accounts and established automation/ops/SaaS-founder voices — required, not optional', '—', '—', 'Faster reach lever than posting volume while the page is still building an audience');
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, account, pillar, format, concept_or_topic, cta, caption_or_destination, notes) VALUES ('linkedin', '2026-08-17', 'Aug 17, 2026', 'Monday', 'Company (Page) — Wk4', 'Operational Debt', 'Long-form text', '"Operational debt" defined in one scroll-stopping line, then unpacked with a concrete example', 'Soft — link in comments', 'Blog: What is operational debt?', NULL);
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, account, pillar, format, concept_or_topic, cta, caption_or_destination, notes) VALUES ('linkedin', '2026-08-18', 'Aug 18, 2026', 'Tuesday', 'Founder (Profile) — Wk4', 'Operational Debt', 'Long-form text', 'Founder POV: the automation we regret building the way we did, and what we''d do differently', 'Soft — link in comments', 'Blog: What is operational debt?', NULL);
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, account, pillar, format, concept_or_topic, cta, caption_or_destination, notes) VALUES ('linkedin', '2026-08-19', 'Aug 19, 2026', 'Wednesday', 'Company (Page) — Wk4', 'Proof: Cases & Mini-Builds', 'Carousel / document', 'Before/after breakdown: a customer-service response workflow, with a real number attached', 'Medium — download mini-blueprint', 'Landing page: Mini-blueprint download', 'Reference Weeks 5–6 review: shift ratio toward whichever of Pillar 1 or 2 is outperforming');
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, account, pillar, format, concept_or_topic, cta, caption_or_destination, notes) VALUES ('linkedin', '2026-08-20', 'Aug 20, 2026', 'Thursday', 'Founder (Profile) — Wk4', 'Proof: Cases & Mini-Builds', 'Short screen-recording video', '60 seconds: a chatbot/lead-qualification build shown live, with the time-saved number stated on screen', 'Medium — download mini-blueprint', 'Landing page: Mini-blueprint download', NULL);
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, account, pillar, format, concept_or_topic, cta, caption_or_destination, notes) VALUES ('linkedin', '2026-08-21', 'Aug 21, 2026', 'Friday', 'Company (Page) — Wk4', 'Offer & Audit', 'Long-form text', 'Direct CTA: what changes in a business in the 30 days after an audit — plain, concrete language', 'Hard — "Comment AUDIT"', 'Automated DM → booking link (see 6.1 automation)', NULL);
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, account, pillar, format, concept_or_topic, cta, caption_or_destination, notes) VALUES ('linkedin', '2026-08-22', 'Aug 22, 2026', 'Saturday', 'Founder (Profile) — Wk4', 'Offer & Audit', 'Carousel / document', 'Carousel: "what you get in an AutoFlow audit" — process visual, ends on the AUDIT CTA', 'Hard — "Comment AUDIT"', 'Automated DM → booking link (see 6.1 automation)', NULL);
INSERT INTO public.marketing_calendar_items (platform, scheduled_date, date_label, day_of_week, account, pillar, format, concept_or_topic, cta, caption_or_destination, notes) VALUES ('linkedin', NULL, 'Wk4 — daily', 'Mon–Sun', 'Founder', 'Engagement', 'Comment engagement', '15–20 min/day thoughtfully commenting on posts from target-audience accounts and established automation/ops/SaaS-founder voices — required, not optional', '—', '—', 'Faster reach lever than posting volume while the page is still building an audience');

-- --- KPI Tracker Weeks 1-8 ---
INSERT INTO public.marketing_weekly_kpis (week_label, pillar_1_debt_impressions, pillar_2_proof_impressions, pillar_3_offer_impressions, saves_shares, quality_comments, audit_comments, booked_calls, founder_impressions, company_page_impressions) VALUES ('Week 1', 0, 0, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO public.marketing_weekly_kpis (week_label, pillar_1_debt_impressions, pillar_2_proof_impressions, pillar_3_offer_impressions, saves_shares, quality_comments, audit_comments, booked_calls, founder_impressions, company_page_impressions) VALUES ('Week 2', 0, 0, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO public.marketing_weekly_kpis (week_label, pillar_1_debt_impressions, pillar_2_proof_impressions, pillar_3_offer_impressions, saves_shares, quality_comments, audit_comments, booked_calls, founder_impressions, company_page_impressions) VALUES ('Week 3', 0, 0, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO public.marketing_weekly_kpis (week_label, pillar_1_debt_impressions, pillar_2_proof_impressions, pillar_3_offer_impressions, saves_shares, quality_comments, audit_comments, booked_calls, founder_impressions, company_page_impressions) VALUES ('Week 4', 0, 0, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO public.marketing_weekly_kpis (week_label, pillar_1_debt_impressions, pillar_2_proof_impressions, pillar_3_offer_impressions, saves_shares, quality_comments, audit_comments, booked_calls, founder_impressions, company_page_impressions) VALUES ('Week 5', 0, 0, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO public.marketing_weekly_kpis (week_label, pillar_1_debt_impressions, pillar_2_proof_impressions, pillar_3_offer_impressions, saves_shares, quality_comments, audit_comments, booked_calls, founder_impressions, company_page_impressions) VALUES ('Week 6', 0, 0, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO public.marketing_weekly_kpis (week_label, pillar_1_debt_impressions, pillar_2_proof_impressions, pillar_3_offer_impressions, saves_shares, quality_comments, audit_comments, booked_calls, founder_impressions, company_page_impressions) VALUES ('Week 7', 0, 0, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO public.marketing_weekly_kpis (week_label, pillar_1_debt_impressions, pillar_2_proof_impressions, pillar_3_offer_impressions, saves_shares, quality_comments, audit_comments, booked_calls, founder_impressions, company_page_impressions) VALUES ('Week 8', 0, 0, 0, 0, 0, 0, 0, 0, 0);
