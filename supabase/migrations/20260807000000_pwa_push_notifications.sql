-- PWA Push Notifications Migration
-- Create the push subscriptions table and trigger for real-time customer message alerts

-- 1. admin_push_subscriptions Table
create table if not exists public.admin_push_subscriptions (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid references auth.users(id) on delete cascade not null unique,
    subscription jsonb not null,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

-- Enable RLS
alter table public.admin_push_subscriptions enable row level security;

-- Policies for admin subscriptions
drop policy if exists "Allow authenticated users to manage their own push subscriptions" on public.admin_push_subscriptions;
create policy "Allow authenticated users to manage their own push subscriptions" 
    on public.admin_push_subscriptions for all
    to authenticated 
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- 2. Trigger Function to Notify Admins via Edge Function
create or replace function public.on_customer_message_inserted()
returns trigger as $$
declare
    chat_status text;
    chat_cust_name text;
    request_id bigint;
begin
    -- Only trigger for customer messages
    if new.sender_type <> 'customer' then
        return new;
    end if;

    -- Fetch chat status and customer name
    select status, customer_name into chat_status, chat_cust_name
    from public.customer_chats
    where id = new.chat_id;

    -- Send push notification if chat is in human takeover mode or needs assistance
    if chat_status = 'human' or chat_status = 'needs_human' then
        select net.http_post(
            url := 'https://gvuucsammtyweehzqwjo.supabase.co/functions/v1/send-push-notification',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2dXVjc2FtbXR5d2VlaHpxd2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3Mzg3NjQsImV4cCI6MjA5MzMxNDc2NH0.0RDHL9bhXaClj0lkHy6ocuquur5rjN7IaslEtia3WzE"}'::jsonb,
            body := jsonb_build_object(
                'chat_id', new.chat_id,
                'message', new.content,
                'sender_name', chat_cust_name
            )
        ) into request_id;
    end if;

    return new;
end;
$$ language plpgsql security definer;

-- Create trigger on customer_messages
drop trigger if exists trg_customer_message_inserted on public.customer_messages;
create trigger trg_customer_message_inserted
    after insert on public.customer_messages
    for each row
    execute function public.on_customer_message_inserted();
