-- Migration: Add trigger to automatically update campaign stats on outreach_emails status changes
-- Supports INSERT, UPDATE (of status), and DELETE

create or replace function public.update_campaign_stats_on_email_update()
returns trigger as $$
declare
  sent_cnt int;
  open_cnt int;
  repl_cnt int;
  target_camp_id uuid;
begin
  -- Identify the target campaign
  if tg_op = 'DELETE' then
    target_camp_id := old.campaign_id;
  else
    target_camp_id := new.campaign_id;
  end if;

  if target_camp_id is not null then
    -- Count the email statuses for this campaign
    select 
      count(*) filter (where status in ('Sent', 'Opened', 'Replied')) as sent,
      count(*) filter (where status in ('Opened', 'Replied')) as opened,
      count(*) filter (where status = 'Replied') as replied
    into sent_cnt, open_cnt, repl_cnt
    from public.outreach_emails
    where campaign_id = target_camp_id;
    
    -- Update the campaign stats
    update public.campaigns
    set stats = jsonb_build_object(
      'sent', coalesce(sent_cnt, 0),
      'opened', coalesce(open_cnt, 0),
      'replied', coalesce(repl_cnt, 0)
    )
    where id = target_camp_id;
  end if;
  
  return null;
end;
$$ language plpgsql security definer;

-- Attach trigger to public.outreach_emails
drop trigger if exists on_outreach_email_status_change on public.outreach_emails;
create trigger on_outreach_email_status_change
  after insert or update of status or delete on public.outreach_emails
  for each row execute procedure public.update_campaign_stats_on_email_update();
