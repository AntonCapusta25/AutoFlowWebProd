-- 1. Assign all restored outreach leads to the salesperson hassansyhuzz@gmail.com
update public.outreach_leads
set assignee_id = (
  select id 
  from public.profiles 
  where email = 'hassansyhuzz@gmail.com'
  limit 1
)
where assignee_id is null;
