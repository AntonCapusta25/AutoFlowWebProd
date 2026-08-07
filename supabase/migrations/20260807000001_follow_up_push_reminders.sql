-- Follow-up Reminders & New Chat Requests Push Notifications Migration
-- 1. Update check_and_send_reminders() to also send web push notifications to the assigned salesperson
create or replace function public.check_and_send_reminders()
returns void as $$
declare
  r record;
  email_body text;
  request_id bigint;
  push_request_id bigint;
begin
  for r in 
    select id, lead_name, lead_type, salesperson_id, salesperson_email, salesperson_name, notes_content
    from public.reminders
    where sent = false and scheduled_at <= now()
  loop
    -- Build the premium HTML email body
    email_body := '<div style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #0b0f19; color: #f3f4f6; padding: 30px; margin: 0;">' ||
                  '  <div style="background-color: #111827; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 32px; max-width: 550px; margin: 0 auto; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">' ||
                  '    <h2 style="margin-top: 0; color: #10b981; font-size: 1.4rem; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 16px; font-weight: 800; letter-spacing: -0.01em;">⏰ Call Reminder</h2>' ||
                  '    <div style="margin: 18px 0;">' ||
                  '      <span style="color: #6b7280; font-weight: 800; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">Lead Name</span>' ||
                  '      <span style="color: #f3f4f6; font-weight: 600; font-size: 0.95rem;">' || r.lead_name || '</span>' ||
                  '    </div>' ||
                  '    <div style="margin: 18px 0;">' ||
                  '      <span style="color: #6b7280; font-weight: 800; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">Lead Type</span>' ||
                  '      <span style="color: #f3f4f6; font-weight: 600; font-size: 0.95rem; text-transform: uppercase;">' || r.lead_type || '</span>' ||
                  '    </div>' ||
                  '    <div style="margin: 18px 0;">' ||
                  '      <span style="color: #6b7280; font-weight: 800; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">Your Note</span>' ||
                  '      <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); padding: 16px; border-radius: 12px; font-style: italic; color: #94a3b8; margin-top: 8px; line-height: 1.6;">' ||
                  '        "' || r.notes_content || '"' ||
                  '      </div>' ||
                  '    </div>' ||
                  '    <div style="text-align: center; margin-top: 24px;">' ||
                  '      <a href="https://autoflowstudio.net/admin/leads" style="display: inline-block; width: 100%; box-sizing: border-box; padding: 14px; background: #12715B; color: white !important; text-decoration: none; border-radius: 10px; font-weight: 800; font-size: 0.9rem; text-align: center; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(18, 113, 91, 0.2);" target="_blank">Open CRM Leads</a>' ||
                  '    </div>' ||
                  '  </div>' ||
                  '</div>';

    -- 1. Dispatch Email request asynchronously via pg_net
    select net.http_post(
      url := 'https://gvuucsammtyweehzqwjo.supabase.co/functions/v1/send-email',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2dXVjc2FtbXR5d2VlaHpxd2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3Mzg3NjQsImV4cCI6MjA5MzMxNDc2NH0.0RDHL9bhXaClj0lkHy6ocuquur5rjN7IaslEtia3WzE"}'::jsonb,
      body := jsonb_build_object(
        'type', 'campaign',
        'recipient', r.salesperson_email,
        'subject', '⏰ Call Reminder: ' || r.lead_name,
        'message', email_body
      )
    ) into request_id;

    -- 2. Dispatch Web Push notification request asynchronously via pg_net (targeting the specific salesperson)
    select net.http_post(
      url := 'https://gvuucsammtyweehzqwjo.supabase.co/functions/v1/send-push-notification',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2dXVjc2FtbXR5d2VlaHpxd2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3Mzg3NjQsImV4cCI6MjA5MzMxNDc2NH0.0RDHL9bhXaClj0lkHy6ocuquur5rjN7IaslEtia3WzE"}'::jsonb,
      body := jsonb_build_object(
        'user_id', r.salesperson_id,
        'title', '⏰ Call Reminder: ' || r.lead_name,
        'message', r.notes_content,
        'url', case 
          when r.lead_type = 'outreach' then '/admin/outreach'
          else '/admin/leads'
        end
      )
    ) into push_request_id;

    -- Mark reminder as sent
    update public.reminders
    set sent = true
    where id = r.id;
  end loop;
end;
$$ language plpgsql security definer;


-- 2. Create Trigger Function to Send Push Notification on New Chat Creation
create or replace function public.on_customer_chat_created()
returns trigger as $$
declare
    request_id bigint;
begin
    -- Trigger push notification to online admins for new chat sessions
    select net.http_post(
        url := 'https://gvuucsammtyweehzqwjo.supabase.co/functions/v1/send-push-notification',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2dXVjc2FtbXR5d2VlaHpxd2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3Mzg3NjQsImV4cCI6MjA5MzMxNDc2NH0.0RDHL9bhXaClj0lkHy6ocuquur5rjN7IaslEtia3WzE"}'::jsonb,
        body := jsonb_build_object(
            'chat_id', new.id,
            'title', '💬 New Chat Request',
            'message', 'Visitor "' || new.customer_name || '" started a new chat session.'
        )
    ) into request_id;

    return new;
end;
$$ language plpgsql security definer;

-- Attach trigger on customer_chats insert
drop trigger if exists trg_customer_chat_created on public.customer_chats;
create trigger trg_customer_chat_created
    after insert on public.customer_chats
    for each row
    execute function public.on_customer_chat_created();
