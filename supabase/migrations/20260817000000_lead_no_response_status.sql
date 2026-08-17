-- Migration: Auto-update lead status to 'No Response' when corresponding notes are entered
-- Captures notes like "no answer", "no response", "nr", "no-response", etc.

create or replace function public.auto_update_lead_status_no_response()
returns trigger as $$
begin
  -- Check if the note/call content contains "no answer", "no response", "nr" (as a word), or their variations
  if (new.event_type = 'note' or new.event_type = 'call') and 
     (new.content ~* '\y(no[ -]answer|no[ -]response|nr)\y') then
     
    -- Update lead status to 'No Response' based on lead type
    if new.lead_type = 'booking' then
      update public.booking_leads
      set status = 'No Response'
      where id = new.lead_id;
    elsif new.lead_type = 'contact' then
      update public.contact_leads
      set status = 'No Response'
      where id = new.lead_id;
    elsif new.lead_type = 'outreach' then
      update public.outreach_leads
      set status = 'No Response'
      where id = new.lead_id;
    end if;
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- Attach the trigger to public.lead_history
drop trigger if exists on_lead_history_no_response on public.lead_history;
create trigger on_lead_history_no_response
  after insert on public.lead_history
  for each row execute procedure public.auto_update_lead_status_no_response();
