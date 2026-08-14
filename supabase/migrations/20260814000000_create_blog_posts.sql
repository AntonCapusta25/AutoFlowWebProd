-- Migration: Create blog_posts table and storage bucket for blog images
-- ============================================================

-- 1. Create Blog Posts Table
create table if not exists public.blog_posts (
  id uuid default gen_random_uuid() primary key,
  slug text not null,
  lang text not null default 'en',
  title text not null,
  desc_text text not null,
  publish_date text not null,
  body text not null,
  faqs jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (slug, lang)
);

-- 2. Enable Row Level Security (RLS)
alter table public.blog_posts enable row level security;

-- 3. Configure Policies for public.blog_posts
drop policy if exists "Allow public read access to blog_posts" on public.blog_posts;
create policy "Allow public read access to blog_posts"
  on public.blog_posts for select
  using (true);

drop policy if exists "Allow admins to modify blog_posts" on public.blog_posts;
create policy "Allow admins to modify blog_posts"
  on public.blog_posts
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 4. Create Storage Bucket for Blog Images
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

-- 5. Configure Storage Policies for blog-images
drop policy if exists "Allow public read access to blog_images" on storage.objects;
create policy "Allow public read access to blog_images"
  on storage.objects for select
  using (bucket_id = 'blog-images');

drop policy if exists "Allow admins to upload blog_images" on storage.objects;
create policy "Allow admins to upload blog_images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'blog-images' and public.is_admin());

drop policy if exists "Allow admins to delete blog_images" on storage.objects;
create policy "Allow admins to delete blog_images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'blog-images' and public.is_admin());
