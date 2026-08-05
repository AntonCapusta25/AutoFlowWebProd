-- AutoFlow Studio — Customer Chatbot Knowledge Base
-- Creates the public.company_knowledge table to store company-specific documents, pricing sheets, FAQ, and credentials.
-- This table is completely isolated from the customer/leads databases.

create table if not exists public.company_knowledge (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    title text not null,
    content text not null,
    updated_by uuid references public.profiles(id) on delete set null
);

-- Enable RLS (Row Level Security)
alter table public.company_knowledge enable row level security;

-- Policies for Authenticated Team Members (Full access to create, read, update, delete)
drop policy if exists "allow authenticated select on company_knowledge" on public.company_knowledge;
create policy "allow authenticated select on company_knowledge" 
    on public.company_knowledge for select 
    to authenticated 
    using (true);

drop policy if exists "allow authenticated insert on company_knowledge" on public.company_knowledge;
create policy "allow authenticated insert on company_knowledge" 
    on public.company_knowledge for insert 
    to authenticated 
    with check (true);

drop policy if exists "allow authenticated update on company_knowledge" on public.company_knowledge;
create policy "allow authenticated update on company_knowledge" 
    on public.company_knowledge for update 
    to authenticated 
    using (true);

drop policy if exists "allow authenticated delete on company_knowledge" on public.company_knowledge;
create policy "allow authenticated delete on company_knowledge" 
    on public.company_knowledge for delete 
    to authenticated 
    using (true);

-- Indexes for performance
create index if not exists idx_company_knowledge_title on public.company_knowledge(title);
