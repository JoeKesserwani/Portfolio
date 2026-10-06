create table if not exists public.portfolio_content (
  id text primary key check (id = 'main'),
  content jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.portfolio_content enable row level security;
grant select on public.portfolio_content to anon, authenticated;
grant insert, update on public.portfolio_content to authenticated;

drop policy if exists "Public can read portfolio" on public.portfolio_content;
create policy "Public can read portfolio"
  on public.portfolio_content for select
  to anon, authenticated
  using (id = 'main');

drop policy if exists "Configured admin can initialize portfolio" on public.portfolio_content;
create policy "Configured admin can initialize portfolio"
  on public.portfolio_content for insert
  to authenticated
  with check (id = 'main' and lower(auth.jwt() ->> 'email') = lower('REPLACE_WITH_ADMIN_EMAIL'));

drop policy if exists "Configured admin can update portfolio" on public.portfolio_content;
create policy "Configured admin can update portfolio"
  on public.portfolio_content for update
  to authenticated
  using (id = 'main' and lower(auth.jwt() ->> 'email') = lower('REPLACE_WITH_ADMIN_EMAIL'))
  with check (id = 'main' and lower(auth.jwt() ->> 'email') = lower('REPLACE_WITH_ADMIN_EMAIL'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-images',
  'portfolio-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view portfolio photos" on storage.objects;
create policy "Public can view portfolio photos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'portfolio-images');

drop policy if exists "Configured admin can upload portfolio photos" on storage.objects;
create policy "Configured admin can upload portfolio photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'portfolio-images'
    and lower(auth.jwt() ->> 'email') = lower('REPLACE_WITH_ADMIN_EMAIL')
  );

drop policy if exists "Configured admin can replace portfolio photos" on storage.objects;
create policy "Configured admin can replace portfolio photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'portfolio-images'
    and lower(auth.jwt() ->> 'email') = lower('REPLACE_WITH_ADMIN_EMAIL')
  )
  with check (
    bucket_id = 'portfolio-images'
    and lower(auth.jwt() ->> 'email') = lower('REPLACE_WITH_ADMIN_EMAIL')
  );

drop policy if exists "Configured admin can delete portfolio photos" on storage.objects;
create policy "Configured admin can delete portfolio photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'portfolio-images'
    and lower(auth.jwt() ->> 'email') = lower('REPLACE_WITH_ADMIN_EMAIL')
  );
