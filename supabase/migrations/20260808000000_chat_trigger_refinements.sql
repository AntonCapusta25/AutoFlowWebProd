-- Database Migration: Chat Trigger Refinements for Anti-Slop PWA Push Alerts
-- Drop the chat creation trigger to prevent spamming page-load/crawler events
drop trigger if exists trg_customer_chat_created on public.customer_chats;

-- Re-create on_customer_message_inserted to notify on the first message sent by a customer
create or replace function public.on_customer_message_inserted()
returns trigger as $$
declare
    chat_status text;
    chat_cust_name text;
    msg_count int;
    request_id bigint;
begin
    -- Only trigger for messages sent by the customer
    if new.sender_type <> 'customer' then
        return new;
    end if;

    -- Fetch chat status and customer name
    select status, customer_name into chat_status, chat_cust_name
    from public.customer_chats
    where id = new.chat_id;

    -- Count how many messages the customer has sent in this chat session
    select count(*) into msg_count
    from public.customer_messages
    where chat_id = new.chat_id and sender_type = 'customer';

    -- Trigger push notification on the FIRST message from a real user, or if takeover mode is active
    if msg_count = 1 or chat_status = 'human' or chat_status = 'needs_human' then
        select net.http_post(
            url := 'https://gvuucsammtyweehzqwjo.supabase.co/functions/v1/send-push-notification',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2dXVjc2FtbXR5d2VlaHpxd2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3Mzg3NjQsImV4cCI6MjA5MzMxNDc2NH0.0RDHL9bhXaClj0lkHy6ocuquur5rjN7IaslEtia3WzE"}'::jsonb,
            body := jsonb_build_object(
                'chat_id', new.chat_id,
                'message', new.content,
                'sender_name', chat_cust_name,
                'title', case 
                    when msg_count = 1 then '💬 New Chat Started'
                    else '💬 Live Chat Message'
                end
            )
        ) into request_id;
    end if;

    return new;
end;
$$ language plpgsql security definer;

-- Re-attach trigger on customer_messages
drop trigger if exists trg_customer_message_inserted on public.customer_messages;
create trigger trg_customer_message_inserted
    after insert on public.customer_messages
    for each row
    execute function public.on_customer_message_inserted();
