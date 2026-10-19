-- Bushbells Safaris gallery: public viewing, explicitly approved admin editing.
create table if not exists public.gallery_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.gallery_admins enable row level security;

create or replace function public.is_gallery_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.gallery_admins where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_gallery_admin() from public;
grant execute on function public.is_gallery_admin() to authenticated;

create table if not exists public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  caption text not null,
  alt_text text not null,
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.gallery_photos
  add column if not exists destination_id text,
  add column if not exists highlight text,
  add column if not exists media_type text not null default 'image' check (media_type in ('image', 'video'));

create index if not exists gallery_photos_destination_highlight_idx
  on public.gallery_photos (destination_id, highlight);

alter table public.gallery_photos enable row level security;
grant select on public.gallery_photos to anon, authenticated;
grant insert, update, delete on public.gallery_photos to authenticated;

drop policy if exists "Anyone can view gallery photo records" on public.gallery_photos;
create policy "Anyone can view gallery photo records"
  on public.gallery_photos
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Gallery admins can add photo records" on public.gallery_photos;
create policy "Gallery admins can add photo records"
  on public.gallery_photos
  for insert
  to authenticated
  with check (public.is_gallery_admin());

drop policy if exists "Gallery admins can edit photo records" on public.gallery_photos;
create policy "Gallery admins can edit photo records"
  on public.gallery_photos
  for update
  to authenticated
  using (public.is_gallery_admin())
  with check (public.is_gallery_admin());

drop policy if exists "Gallery admins can remove photo records" on public.gallery_photos;
create policy "Gallery admins can remove photo records"
  on public.gallery_photos
  for delete
  to authenticated
  using (public.is_gallery_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gallery',
  'gallery',
  true,
  15728640,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'video/mp4', 'video/webm']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can view gallery image files" on storage.objects;
drop policy if exists "Anyone can view gallery media files" on storage.objects;
create policy "Anyone can view gallery media files"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'gallery');

drop policy if exists "Gallery admins can upload image files" on storage.objects;
drop policy if exists "Gallery admins can upload gallery media files" on storage.objects;
create policy "Gallery admins can upload gallery media files"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'gallery'
    and public.is_gallery_admin()
  );

drop policy if exists "Gallery admins can remove image files" on storage.objects;
drop policy if exists "Gallery admins can remove gallery media files" on storage.objects;
create policy "Gallery admins can remove gallery media files"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'gallery'
    and public.is_gallery_admin()
  );

-- Add an admin after inviting that person under Authentication > Users:
-- insert into public.gallery_admins (user_id)
-- select id from auth.users where email = 'admin@example.com';
