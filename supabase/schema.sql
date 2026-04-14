-- ============================================================
-- LeadHunter Supabase Schema
-- Run this in your Supabase project: Dashboard > SQL Editor
-- ============================================================

-- --------------------------------------------------------
-- 1. Profiles (extends auth.users)
-- --------------------------------------------------------
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade not null primary key,
  name        text,
  email       text,
  role        text not null default 'user' check (role in ('user', 'admin')),
  plan        text not null default 'free' check (plan in ('free', 'starter', 'pro', 'enterprise')),
  searches_used    integer not null default 0,
  searches_limit   integer not null default 10,
  saved_leads      integer not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- --------------------------------------------------------
-- 2. Auto-create profile when user signs up
-- --------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- --------------------------------------------------------
-- 3. Searches (search history)
-- --------------------------------------------------------
create table if not exists public.searches (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  query        text not null,
  location     text default '',
  industry     text default '',
  experience   text default '',
  company_size text default '',
  result_count integer default 0,
  filters      jsonb default '{}',
  searched_at  timestamptz not null default now()
);

alter table public.searches enable row level security;

create policy "Users can manage own searches"
  on public.searches
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- --------------------------------------------------------
-- 4. Saved Leads
-- --------------------------------------------------------
create table if not exists public.leads (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  name         text not null,
  title        text,
  company      text,
  location     text,
  industry     text,
  linkedin_url text,
  email        text,
  phone        text,
  company_size text,
  experience   text,
  created_at   timestamptz not null default now()
);

alter table public.leads enable row level security;

create policy "Users can manage own leads"
  on public.leads
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- --------------------------------------------------------
-- 5. Lead Lists
-- --------------------------------------------------------
create table if not exists public.lead_lists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  description text,
  created_at  timestamptz not null default now()
);

alter table public.lead_lists enable row level security;

create policy "Users can manage own lists"
  on public.lead_lists
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- --------------------------------------------------------
-- 6. Lead List Items (junction)
-- --------------------------------------------------------
create table if not exists public.lead_list_items (
  id       uuid primary key default gen_random_uuid(),
  list_id  uuid references public.lead_lists(id) on delete cascade not null,
  lead_id  uuid references public.leads(id) on delete cascade not null,
  added_at timestamptz not null default now(),
  unique(list_id, lead_id)
);

alter table public.lead_list_items enable row level security;

create policy "Users can manage own list items"
  on public.lead_list_items
  using (
    exists (
      select 1 from public.lead_lists
      where id = list_id and user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.lead_lists
      where id = list_id and user_id = auth.uid()
    )
  );

-- --------------------------------------------------------
-- 7. To make a user admin, run:
--    update public.profiles set role = 'admin' where email = 'your@email.com';
-- --------------------------------------------------------

-- --------------------------------------------------------
-- 8. Plan limits + wallet + expiry
-- --------------------------------------------------------
alter table public.profiles alter column searches_limit set default 5;
alter table public.profiles add column if not exists wallet_balance numeric(10,2) not null default 0.00;
alter table public.profiles add column if not exists plan_expires_at timestamptz;

-- --------------------------------------------------------
-- 9. Auto-sync searches_limit when plan is changed
-- --------------------------------------------------------
create or replace function public.sync_plan_limits()
returns trigger as $$
begin
  if new.plan = 'free'          then new.searches_limit := 5;
  elsif new.plan = 'starter'    then new.searches_limit := 20;
  elsif new.plan = 'pro'        then new.searches_limit := 100;
  elsif new.plan = 'enterprise' then new.searches_limit := 500;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_plan_change on public.profiles;
create trigger on_plan_change
  before update of plan on public.profiles
  for each row execute function public.sync_plan_limits();

-- --------------------------------------------------------
-- 10. Payments table (payment screenshot submissions)
-- --------------------------------------------------------
create table if not exists public.payments (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  plan            text not null,
  amount          numeric(10,2) not null,
  method          text not null check (method in ('jazzcash', 'bank')),
  screenshot_url  text not null,
  transaction_ref text,
  status          text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note      text,
  submitted_at    timestamptz not null default now(),
  reviewed_at     timestamptz,
  reviewed_by     uuid references auth.users(id)
);

alter table public.payments enable row level security;

create policy "Users can view own payments"
  on public.payments for select
  using (auth.uid() = user_id);

create policy "Users can insert own payments"
  on public.payments for insert
  with check (auth.uid() = user_id);

-- --------------------------------------------------------
-- 11. Storage bucket for payment screenshots
--     Run in Supabase dashboard: Storage > New Bucket
--     Name: payment-screenshots, Public: false
--     Or use SQL below if pg_storage extension is enabled:
-- insert into storage.buckets (id, name, public)
--   values ('payment-screenshots', 'payment-screenshots', false)
--   on conflict do nothing;
-- --------------------------------------------------------

-- Storage RLS policies for payment-screenshots bucket
-- Run these in Supabase Dashboard > SQL Editor after creating the bucket:

-- Allow authenticated users to upload to their own folder
create policy "Users can upload own screenshots"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'payment-screenshots' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to read their own screenshots
create policy "Users can read own screenshots"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'payment-screenshots' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Service role (used by admin API) can read all screenshots
-- This is automatically satisfied by the service role bypassing RLS.
-- No additional policy needed for admin signed URL generation.


-- --------------------------------------------------------
-- 12. Monthly reset (schedule via Supabase cron or pg_cron)
--     select cron.schedule('monthly-reset', '0 0 1 * *', $$
--       update public.profiles set searches_used = 0;
--     $$);
-- --------------------------------------------------------