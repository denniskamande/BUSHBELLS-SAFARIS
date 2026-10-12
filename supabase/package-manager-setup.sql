-- Public safari catalogue with edits restricted to approved gallery admins.
-- Run gallery-setup.sql first if this is a new Supabase project.
create table if not exists public.safari_packages (
  id text primary key,
  days numeric not null check (days > 0),
  package_data jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists safari_packages_days_idx
  on public.safari_packages (days);

alter table public.safari_packages enable row level security;
grant select on public.safari_packages to anon, authenticated;
grant insert, update, delete on public.safari_packages to authenticated;

drop policy if exists "Anyone can view safari packages" on public.safari_packages;
create policy "Anyone can view safari packages"
  on public.safari_packages for select to anon, authenticated using (true);

drop policy if exists "Gallery admins can add safari packages" on public.safari_packages;
create policy "Gallery admins can add safari packages"
  on public.safari_packages for insert to authenticated
  with check (public.is_gallery_admin() and id = (package_data ->> 'id'));

drop policy if exists "Gallery admins can edit safari packages" on public.safari_packages;
create policy "Gallery admins can edit safari packages"
  on public.safari_packages for update to authenticated
  using (public.is_gallery_admin())
  with check (public.is_gallery_admin() and id = (package_data ->> 'id'));

drop policy if exists "Gallery admins can remove safari packages" on public.safari_packages;
create policy "Gallery admins can remove safari packages"
  on public.safari_packages for delete to authenticated
  using (public.is_gallery_admin());
