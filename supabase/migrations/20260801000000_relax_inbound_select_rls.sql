-- AutoFlow Studio — Relax Select RLS policies on inbound lead tables for Salespeople
-- Allows authenticated salespeople to read booking_leads and contact_leads details.

drop policy if exists "admin read booking_leads" on public.booking_leads;
drop policy if exists "authenticated select booking_leads" on public.booking_leads;
create policy "authenticated select booking_leads" on public.booking_leads for select to authenticated using (true);

drop policy if exists "admin read contact_leads" on public.contact_leads;
drop policy if exists "authenticated select contact_leads" on public.contact_leads;
create policy "authenticated select contact_leads" on public.contact_leads for select to authenticated using (true);
