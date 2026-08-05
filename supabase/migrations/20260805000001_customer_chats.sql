-- AutoFlow Studio — Customer Chat & Configurable Response Tree Migration
-- Setup tables for customer chat history, messages, and db-driven quick response tree.

-- 1. chatbot_response_tree Table
create table if not exists public.chatbot_response_tree (
    id            uuid primary key default gen_random_uuid(),
    trigger_word  text not null,
    response_text text not null,
    lang          text not null default 'en',
    created_at    timestamptz not null default now()
);

-- Enable RLS for response tree
alter table public.chatbot_response_tree enable row level security;

drop policy if exists "allow public read on response tree" on public.chatbot_response_tree;
create policy "allow public read on response tree" 
    on public.chatbot_response_tree for select 
    using (true);

drop policy if exists "allow admins write on response tree" on public.chatbot_response_tree;
create policy "allow admins write on response tree" 
    on public.chatbot_response_tree for all 
    to authenticated 
    using (true);

-- 2. customer_chats Table
create table if not exists public.customer_chats (
    id            uuid primary key default gen_random_uuid(),
    session_id    text not null,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now(),
    status        text not null default 'bot', -- 'bot', 'human', 'needs_human'
    assigned_to   uuid references public.profiles(id) on delete set null,
    customer_name text not null default 'Visitor',
    lead_id       uuid -- optional reference
);

-- Enable RLS for customer chats
alter table public.customer_chats enable row level security;

-- Open select/insert/update policies to all users (including anonymous visitors)
drop policy if exists "allow public select/insert/update on customer_chats" on public.customer_chats;
create policy "allow public select/insert/update on customer_chats" 
    on public.customer_chats for all 
    using (true);

-- 3. customer_messages Table
create table if not exists public.customer_messages (
    id            uuid primary key default gen_random_uuid(),
    chat_id       uuid not null references public.customer_chats(id) on delete cascade,
    sender_type   text not null, -- 'customer', 'bot', 'human'
    sender_id     uuid references public.profiles(id) on delete set null, -- null for bot/customer
    content       text not null,
    created_at    timestamptz not null default now()
);

-- Enable RLS for customer messages
alter table public.customer_messages enable row level security;

drop policy if exists "allow public select/insert on customer_messages" on public.customer_messages;
create policy "allow public select/insert on customer_messages" 
    on public.customer_messages for all 
    using (true);

-- 4. GDPR History Cleanup Function
create or replace function public.cleanup_old_customer_chats()
returns void as $$
begin
    -- Delete customer chats updated more than 30 days ago (on delete cascade deletes messages)
    delete from public.customer_chats
    where updated_at < now() - interval '30 days';
end;
$$ language plpgsql security definer;

-- 5. Indexes for performance
create index if not exists idx_chatbot_response_tree_trigger on public.chatbot_response_tree(trigger_word);
create index if not exists idx_customer_chats_session on public.customer_chats(session_id);
create index if not exists idx_customer_chats_status on public.customer_chats(status);
create index if not exists idx_customer_messages_chat_id on public.customer_messages(chat_id);
create index if not exists idx_customer_messages_created on public.customer_messages(created_at);
