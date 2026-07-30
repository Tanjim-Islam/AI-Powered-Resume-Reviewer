begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  profession text,
  job_preferences text,
  modification_preferences text,
  memory_notes text,
  preferred_template_id text not null default 'harshibar',
  resume_photo_path text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_full_name_length check (
    full_name is null or char_length(full_name) <= 120
  ),
  constraint profiles_profession_length check (
    profession is null or char_length(profession) <= 160
  ),
  constraint profiles_job_preferences_length check (
    job_preferences is null or char_length(job_preferences) <= 2000
  ),
  constraint profiles_modification_preferences_length check (
    modification_preferences is null
    or char_length(modification_preferences) <= 2000
  ),
  constraint profiles_memory_notes_length check (
    memory_notes is null or char_length(memory_notes) <= 4000
  ),
  constraint profiles_preferred_template_valid check (
    preferred_template_id in (
      'harshibar',
      'curve',
      'northeastern',
      'boltach',
      'portrait',
      'iiit',
      'deedy',
      'engineer',
      'researcher',
      'executive',
      'swiss',
      'consulting',
      'finance',
      'legal',
      'clinical',
      'data',
      'cyber',
      'product',
      'sales',
      'graduate',
      'public-service'
    )
  ),
  constraint profiles_resume_photo_path_length check (
    resume_photo_path is null or char_length(resume_photo_path) <= 1024
  )
);

alter table public.profiles
  add column if not exists preferred_template_id text
  not null default 'harshibar';
alter table public.profiles
  add column if not exists resume_photo_path text;

alter table public.profiles
  drop constraint if exists profiles_preferred_template_valid;
alter table public.profiles
  add constraint profiles_preferred_template_valid check (
    preferred_template_id in (
      'harshibar',
      'curve',
      'northeastern',
      'boltach',
      'portrait',
      'iiit',
      'deedy',
      'engineer',
      'researcher',
      'executive',
      'swiss',
      'consulting',
      'finance',
      'legal',
      'clinical',
      'data',
      'cyber',
      'product',
      'sales',
      'graduate',
      'public-service'
    )
  );

alter table public.profiles
  drop constraint if exists profiles_resume_photo_path_length;
alter table public.profiles
  add constraint profiles_resume_photo_path_length check (
    resume_photo_path is null or char_length(resume_photo_path) <= 1024
  );

create table if not exists public.resume_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resume_name text not null default 'Resume',
  resume_text text not null,
  job_description text not null default '',
  ats_score smallint not null check (ats_score between 0 and 100),
  analysis jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint resume_analyses_name_length check (
    char_length(resume_name) <= 255
  )
);

alter table public.resume_analyses
  add column if not exists resume_name text
  not null default 'Resume';

alter table public.resume_analyses
  drop constraint if exists resume_analyses_name_length;
alter table public.resume_analyses
  add constraint resume_analyses_name_length check (
    char_length(resume_name) <= 255
  );

create table if not exists public.resume_rewrites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  analysis_id uuid unique references public.resume_analyses(id) on delete cascade,
  resume_name text not null default 'Resume',
  source_resume_text text not null,
  job_description text not null default '',
  rewrite_json jsonb not null,
  rewrite_markdown text not null,
  latex_source text not null,
  template_id text not null default 'harshibar',
  photo_path text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint resume_rewrites_name_length check (
    char_length(resume_name) <= 255
  ),
  constraint resume_rewrites_source_length check (
    char_length(source_resume_text) <= 100000
  ),
  constraint resume_rewrites_job_length check (
    char_length(job_description) <= 30000
  ),
  constraint resume_rewrites_markdown_length check (
    char_length(rewrite_markdown) <= 100000
  ),
  constraint resume_rewrites_latex_length check (
    char_length(latex_source) <= 150000
  ),
  constraint resume_rewrites_template_valid check (
    template_id in (
      'harshibar',
      'curve',
      'northeastern',
      'boltach',
      'portrait',
      'iiit',
      'deedy',
      'engineer',
      'researcher',
      'executive',
      'swiss',
      'consulting',
      'finance',
      'legal',
      'clinical',
      'data',
      'cyber',
      'product',
      'sales',
      'graduate',
      'public-service'
    )
  ),
  constraint resume_rewrites_photo_path_length check (
    photo_path is null or char_length(photo_path) <= 1024
  )
);

alter table public.resume_rewrites
  drop constraint if exists resume_rewrites_template_valid;
alter table public.resume_rewrites
  add constraint resume_rewrites_template_valid check (
    template_id in (
      'harshibar',
      'curve',
      'northeastern',
      'boltach',
      'portrait',
      'iiit',
      'deedy',
      'engineer',
      'researcher',
      'executive',
      'swiss',
      'consulting',
      'finance',
      'legal',
      'clinical',
      'data',
      'cyber',
      'product',
      'sales',
      'graduate',
      'public-service'
    )
  );

create index if not exists resume_analyses_user_created_idx
  on public.resume_analyses (user_id, created_at desc);

create index if not exists resume_rewrites_user_updated_idx
  on public.resume_rewrites (user_id, updated_at desc);

alter table public.profiles enable row level security;
alter table public.resume_analyses enable row level security;
alter table public.resume_rewrites enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "resume_analyses_select_own"
  on public.resume_analyses;
create policy "resume_analyses_select_own"
  on public.resume_analyses
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "resume_analyses_insert_own"
  on public.resume_analyses;
create policy "resume_analyses_insert_own"
  on public.resume_analyses
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "resume_analyses_delete_own"
  on public.resume_analyses;
create policy "resume_analyses_delete_own"
  on public.resume_analyses
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "resume_rewrites_select_own"
  on public.resume_rewrites;
create policy "resume_rewrites_select_own"
  on public.resume_rewrites
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "resume_rewrites_insert_own"
  on public.resume_rewrites;
create policy "resume_rewrites_insert_own"
  on public.resume_rewrites
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "resume_rewrites_update_own"
  on public.resume_rewrites;
create policy "resume_rewrites_update_own"
  on public.resume_rewrites
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "resume_rewrites_delete_own"
  on public.resume_rewrites;
create policy "resume_rewrites_delete_own"
  on public.resume_rewrites
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.profiles from anon;
revoke all on public.resume_analyses from anon;
revoke all on public.resume_rewrites from anon;
revoke all on public.profiles from authenticated;
revoke all on public.resume_analyses from authenticated;
revoke all on public.resume_rewrites from authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, delete on public.resume_analyses to authenticated;
grant select, insert, update, delete on public.resume_rewrites to authenticated;
grant all on public.profiles to service_role;
grant all on public.resume_analyses to service_role;
grant all on public.resume_rewrites to service_role;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

drop trigger if exists resume_rewrites_set_updated_at
  on public.resume_rewrites;
create trigger resume_rewrites_set_updated_at
  before update on public.resume_rewrites
  for each row execute function private.set_updated_at();

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'resume-assets',
  'resume-assets',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "resume_assets_select_own"
  on storage.objects;
create policy "resume_assets_select_own"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'resume-assets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "resume_assets_insert_own"
  on storage.objects;
create policy "resume_assets_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'resume-assets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "resume_assets_update_own"
  on storage.objects;
create policy "resume_assets_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'resume-assets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'resume-assets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "resume_assets_delete_own"
  on storage.objects;
create policy "resume_assets_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'resume-assets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

insert into public.profiles (id, full_name, avatar_url)
select
  users.id,
  coalesce(
    users.raw_user_meta_data ->> 'full_name',
    users.raw_user_meta_data ->> 'name'
  ),
  users.raw_user_meta_data ->> 'avatar_url'
from auth.users as users
on conflict (id) do nothing;

notify pgrst, 'reload schema';

commit;
