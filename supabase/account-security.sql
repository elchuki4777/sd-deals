-- SD Deals customer account and ownership security migration.
-- Prerequisites: apply supabase/schema.sql, then supabase/store-schema.sql, then this file.
-- Admin claims are trusted only in auth.users.raw_app_meta_data (app_metadata in JWT).

create or replace function public.store_is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((auth.jwt()->'app_metadata'->>'role')='admin',false);
$$;
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select public.store_is_admin();
$$;

-- Add a consistent ownership key to existing customer-owned records, preserving existing integrations.
alter table public.appointments add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.quotes add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.build_events add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.messages add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.invoices add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.saved_products add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.order_items add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.customer_profiles add column if not exists preferred_contact text not null default 'Email';
alter table public.customer_profiles add column if not exists avatar_path text;
update public.appointments set user_id=customer_id where user_id is null;
update public.quotes set user_id=customer_id where user_id is null;
update public.build_events set user_id=customer_id where user_id is null;
update public.messages set user_id=customer_id where user_id is null;
update public.invoices set user_id=customer_id where user_id is null;
update public.saved_products set user_id=customer_id where user_id is null;
update public.order_items oi set user_id=o.user_id from public.orders o where oi.order_id=o.id and oi.user_id is null;
alter table public.appointments alter column user_id set not null;
alter table public.quotes alter column user_id set not null;
alter table public.build_events alter column user_id set not null;
alter table public.messages alter column user_id set not null;
alter table public.invoices alter column user_id set not null;
alter table public.saved_products alter column user_id set not null;
alter table public.order_items alter column user_id set not null;

-- Legacy customer_id remains, but cannot diverge from its canonical user_id.
create or replace function public.sync_sd_ownership()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_table_name='appointments' then
    if new.user_id is null then new.user_id:=new.customer_id; end if;
    if new.customer_id is null then new.customer_id:=new.user_id; end if;
    if new.user_id is distinct from new.customer_id then raise exception 'Appointment ownership cannot be changed'; end if;
  elsif tg_table_name='saved_products' then
    if new.user_id is null then new.user_id:=new.customer_id; end if;
    if new.customer_id is null then new.customer_id:=new.user_id; end if;
    if new.user_id is distinct from new.customer_id then raise exception 'Favorite ownership cannot be changed'; end if;
  elsif tg_table_name='order_items' then
    select o.user_id into new.user_id from public.orders o where o.id=new.order_id;
    if new.user_id is null then raise exception 'Order not found'; end if;
  elsif tg_table_name='quotes' or tg_table_name='build_events' or tg_table_name='messages' or tg_table_name='invoices' then
    if new.user_id is null then new.user_id:=new.customer_id; end if;
    if new.customer_id is null then new.customer_id:=new.user_id; end if;
    if new.user_id is distinct from new.customer_id then raise exception 'Customer record ownership cannot be changed'; end if;
    if not public.store_is_admin() and new.user_id is distinct from auth.uid() then raise exception 'Customer record must belong to the signed-in user'; end if;
  else
    if new.user_id is null then new.user_id:=new.customer_id; end if;
    if new.customer_id is null then new.customer_id:=new.user_id; end if;
    if new.user_id is distinct from new.customer_id then raise exception 'Customer record ownership cannot be changed'; end if;
  end if;
  return new;
end; $$;
drop trigger if exists appointments_sync_user_id on public.appointments;
create trigger appointments_sync_user_id before insert or update of user_id,customer_id on public.appointments for each row execute function public.sync_sd_ownership();
create or replace function public.seed_build_timeline()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
 if new.status='Confirmed' then
   insert into public.build_events(appointment_id,customer_id,user_id,milestone,completed,occurred_at)
   values(new.id,new.customer_id,new.user_id,'Appointment Confirmed',true,now()) on conflict(appointment_id,milestone) do nothing;
 end if;
 return new;
end; $$;
create or replace function public.sync_build_timeline()
returns trigger language plpgsql security definer set search_path = '' as $$
declare milestone_name text;
begin
 if new.status='Confirmed' and old.status is distinct from new.status then
   insert into public.build_events(appointment_id,customer_id,user_id,milestone,completed,occurred_at)
   values(new.id,new.customer_id,new.user_id,'Appointment Confirmed',true,now())
   on conflict(appointment_id,milestone) do update set completed=true,occurred_at=coalesce(public.build_events.occurred_at,excluded.occurred_at);
 end if;
 milestone_name:=case
  when new.status in ('Waiting for Parts','Parts Received','Parts Ordered') then 'Parts Received / Ordered'
  when new.status='Building PC' then 'PC Assembly Started'
  when new.status='Cable Management' then 'Cable Management'
  when new.status='Testing' then 'Testing'
  when new.status='Benchmarking' then 'Benchmarking'
  when new.status='Ready for Pickup' then 'Ready for Pickup'
  when new.status='Completed' then 'Completed' else null end;
 if milestone_name is not null then
   insert into public.build_events(appointment_id,customer_id,user_id,milestone,completed,occurred_at)
   values(new.id,new.customer_id,new.user_id,milestone_name,true,now())
   on conflict(appointment_id,milestone) do update set completed=true,occurred_at=coalesce(public.build_events.occurred_at,excluded.occurred_at);
 end if;
 return new;
end; $$;
drop trigger if exists quotes_sync_user_id on public.quotes;
create trigger quotes_sync_user_id before insert or update of user_id,customer_id on public.quotes for each row execute function public.sync_sd_ownership();
drop trigger if exists build_events_sync_user_id on public.build_events;
create trigger build_events_sync_user_id before insert or update of user_id,customer_id on public.build_events for each row execute function public.sync_sd_ownership();
drop trigger if exists messages_sync_user_id on public.messages;
create trigger messages_sync_user_id before insert or update of user_id,customer_id on public.messages for each row execute function public.sync_sd_ownership();
drop trigger if exists invoices_sync_user_id on public.invoices;
create trigger invoices_sync_user_id before insert or update of user_id,customer_id on public.invoices for each row execute function public.sync_sd_ownership();
drop trigger if exists saved_products_sync_user_id on public.saved_products;
create trigger saved_products_sync_user_id before insert or update of user_id,customer_id on public.saved_products for each row execute function public.sync_sd_ownership();
drop trigger if exists order_items_sync_user_id on public.order_items;
create trigger order_items_sync_user_id before insert or update of order_id,user_id on public.order_items for each row execute function public.sync_sd_ownership();

-- Complete customer profile. Email is always copied from auth.users, never accepted from client input.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  full_name text not null default '' check(length(full_name)<=160),
  phone text not null default '' check(length(phone)<=40),
  preferred_contact text not null default 'Email' check(preferred_contact in ('Email','Phone','Text Message')),
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check(avatar_path is null or avatar_path like user_id::text||'/%')
);
create or replace function public.enforce_sd_profile_email()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  select coalesce(u.email,'') into new.email from auth.users u where u.id=new.user_id;
  if new.email is null then raise exception 'Authenticated profile required'; end if;
  return new;
end; $$;
drop trigger if exists profiles_enforce_email on public.profiles;
create trigger profiles_enforce_email before insert or update of email,user_id on public.profiles for each row execute function public.enforce_sd_profile_email();
create or replace function public.sync_sd_profile_to_legacy()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.customer_profiles(user_id,full_name,phone,preferred_contact,avatar_path)
  values(new.user_id,new.full_name,new.phone,case when new.preferred_contact='Text Message' then 'Text' else new.preferred_contact end,new.avatar_path)
  on conflict(user_id) do update set full_name=excluded.full_name,phone=excluded.phone,preferred_contact=excluded.preferred_contact,avatar_path=excluded.avatar_path;
  return new;
end; $$;
drop trigger if exists profiles_sync_customer_profile on public.profiles;
create trigger profiles_sync_customer_profile after insert or update of full_name,phone,preferred_contact,avatar_path on public.profiles for each row execute function public.sync_sd_profile_to_legacy();
create or replace function public.create_sd_customer_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
declare profile_name text;
begin
  profile_name:=left(coalesce(new.raw_user_meta_data->>'full_name',''),160);
  insert into public.profiles(user_id,email,full_name) values(new.id,coalesce(new.email,''),profile_name) on conflict(user_id) do update set email=excluded.email;
  insert into public.customer_profiles(user_id,full_name) values(new.id,profile_name) on conflict(user_id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created_sd_profile on auth.users;
create trigger on_auth_user_created_sd_profile after insert on auth.users for each row execute function public.create_sd_customer_profile();
create or replace function public.sync_sd_auth_email()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.email is distinct from old.email then update public.profiles set email=coalesce(new.email,'') where user_id=new.id; end if;
  return new;
end; $$;
drop trigger if exists on_auth_user_updated_sd_email on auth.users;
create trigger on_auth_user_updated_sd_email after update of email on auth.users for each row execute function public.sync_sd_auth_email();
create or replace function public.sd_touch_profile_updated_at()
returns trigger language plpgsql set search_path = '' as $$begin new.updated_at=now();return new;end; $$;
drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at before update on public.profiles for each row execute function public.sd_touch_profile_updated_at();
insert into public.profiles(user_id,email,full_name,phone,preferred_contact,avatar_path)
select cp.user_id,coalesce(u.email,''),left(cp.full_name,160),left(cp.phone,40),case when cp.preferred_contact='Text' then 'Text Message' when cp.preferred_contact in('Email','Phone') then cp.preferred_contact else 'Email' end,cp.avatar_path
from public.customer_profiles cp join auth.users u on u.id=cp.user_id on conflict(user_id) do nothing;

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null check(length(full_name) between 1 and 160),
  street_address text not null check(length(street_address) between 3 and 200),
  apartment text not null default '' check(length(apartment)<=100),
  city text not null check(length(city) between 1 and 100),
  state text not null check(length(state) between 2 and 50),
  zip_code text not null check(zip_code ~ '^[0-9]{5}(-[0-9]{4})?$'),
  phone text not null check(length(phone) between 7 and 40),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists addresses_owner_idx on public.addresses(user_id,created_at desc);
-- Normalize any legacy duplicates before enforcing one default per customer.
with ranked_defaults as (
  select id,row_number() over(partition by user_id order by updated_at desc,created_at desc,id) as position
  from public.addresses where is_default
)
update public.addresses a set is_default=false from ranked_defaults r where a.id=r.id and r.position>1;
create index if not exists addresses_default_lookup_idx on public.addresses(user_id,is_default);
create unique index if not exists addresses_one_default_per_user_idx on public.addresses(user_id) where is_default;
create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id,product_id)
);
insert into public.favorites(user_id,product_id,created_at) select user_id,product_id,created_at from public.saved_products on conflict(user_id,product_id) do nothing;
create or replace function public.sync_sd_favorite_tables()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_table_name='saved_products' then
    if tg_op='DELETE' then delete from public.favorites where user_id=old.user_id and product_id=old.product_id;return old; end if;
    insert into public.favorites(user_id,product_id,created_at) values(new.user_id,new.product_id,new.created_at) on conflict(user_id,product_id) do nothing;
    return new;
  end if;
  if tg_op='DELETE' then delete from public.saved_products where user_id=old.user_id and product_id=old.product_id;return old; end if;
  insert into public.saved_products(customer_id,user_id,product_id,created_at) values(new.user_id,new.user_id,new.product_id,new.created_at) on conflict(customer_id,product_id) do nothing;
  return new;
end; $$;
drop trigger if exists saved_products_sync_favorites on public.saved_products;
create trigger saved_products_sync_favorites after insert or delete on public.saved_products for each row execute function public.sync_sd_favorite_tables();
drop trigger if exists favorites_sync_saved_products on public.favorites;
create trigger favorites_sync_saved_products after insert or delete on public.favorites for each row execute function public.sync_sd_favorite_tables();

-- Persistent order event log is populated only by its trusted trigger.
create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null,
  note text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists order_events_owner_idx on public.order_events(user_id,order_id,created_at);
create or replace function public.record_sd_order_status()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op='INSERT' or new.status is distinct from old.status then
    insert into public.order_events(order_id,user_id,status) values(new.id,new.user_id,new.status);
  end if;
  return new;
end; $$;
drop trigger if exists orders_record_status on public.orders;
create trigger orders_record_status after insert or update of status on public.orders for each row execute function public.record_sd_order_status();

-- Do not create a build record until the studio confirms the appointment.
create table if not exists public.pc_builds (
  id uuid primary key default gen_random_uuid(),
  build_number bigint generated always as identity unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  appointment_id uuid not null unique references public.appointments(id) on delete cascade,
  status text not null default 'Appointment Confirmed' check(status in ('Appointment Confirmed','Waiting for Parts','Parts Received','Building PC','Cable Management','Windows / Drivers','Testing','Benchmarking','Ready for Pickup','Completed','Cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create or replace function public.sync_sd_pc_build()
returns trigger language plpgsql security definer set search_path = '' as $$
declare build_status text;
begin
  if new.status='Pending Approval' then return new; end if;
  if new.status='Cancelled' then
    update public.pc_builds set status='Cancelled',updated_at=now() where appointment_id=new.id;
    return new;
  end if;
  build_status:=case when new.status='Confirmed' then 'Appointment Confirmed'
    when new.status='Waiting for Parts' then 'Waiting for Parts'
    when new.status in('Parts Received','Parts Ordered') then 'Parts Received'
    when new.status='Building PC' then 'Building PC'
    when new.status='Cable Management' then 'Cable Management'
    when new.status='Windows Setup' then 'Windows / Drivers'
    when new.status='Testing' then 'Testing'
    when new.status='Benchmarking' then 'Benchmarking'
    when new.status='Ready for Pickup' then 'Ready for Pickup'
    when new.status='Completed' then 'Completed' else null end;
  if build_status is null then return new; end if;
  insert into public.pc_builds(user_id,appointment_id,status) values(new.user_id,new.id,build_status)
  on conflict(appointment_id) do update set user_id=excluded.user_id,status=excluded.status,updated_at=now();
  return new;
end; $$;
drop trigger if exists appointments_sync_pc_build on public.appointments;
create trigger appointments_sync_pc_build after insert or update of status on public.appointments for each row execute function public.sync_sd_pc_build();
insert into public.pc_builds(user_id,appointment_id,status)
select a.user_id,a.id,case when a.status='Confirmed' then 'Appointment Confirmed' when a.status in('Parts Received','Parts Ordered') then 'Parts Received' when a.status='Windows Setup' then 'Windows / Drivers' else a.status end
from public.appointments a where a.status not in('Cancelled','Pending Approval') on conflict(appointment_id) do nothing;

-- Customer-only address writes use one atomic, ownership-checked function for default selection.
create or replace function public.save_customer_address(
  p_address_id uuid,p_full_name text,p_street_address text,p_apartment text,p_city text,p_state text,p_zip_code text,p_phone text,p_is_default boolean default false
) returns uuid language plpgsql security definer set search_path = '' as $$
declare customer uuid:=auth.uid(); saved_id uuid;
begin
  if customer is null or public.store_is_admin() then raise exception 'Customer sign-in required'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(customer::text,0::bigint));
  if length(trim(coalesce(p_full_name,''))) not between 1 and 160 or length(trim(coalesce(p_street_address,''))) not between 3 and 200 or length(trim(coalesce(p_apartment,'')))>100 or length(trim(coalesce(p_city,''))) not between 1 and 100 or length(trim(coalesce(p_state,''))) not between 2 and 50 or trim(coalesce(p_zip_code,'')) !~ '^[0-9]{5}(-[0-9]{4})?$' or length(trim(coalesce(p_phone,''))) not between 7 and 40 then raise exception 'Check each address field and try again'; end if;
  if coalesce(p_is_default,false) then update public.addresses set is_default=false where user_id=customer and is_default and id is distinct from p_address_id; end if;
  if p_address_id is null then
    insert into public.addresses(user_id,full_name,street_address,apartment,city,state,zip_code,phone,is_default)
    values(customer,trim(p_full_name),trim(p_street_address),trim(coalesce(p_apartment,'')),trim(p_city),trim(p_state),trim(p_zip_code),trim(p_phone),coalesce(p_is_default,false)) returning id into saved_id;
  else
    update public.addresses set full_name=trim(p_full_name),street_address=trim(p_street_address),apartment=trim(coalesce(p_apartment,'')),city=trim(p_city),state=trim(p_state),zip_code=trim(p_zip_code),phone=trim(p_phone),is_default=coalesce(p_is_default,false),updated_at=now()
    where id=p_address_id and user_id=customer returning id into saved_id;
    if saved_id is null then raise exception 'Address not found'; end if;
  end if;
  return saved_id;
end; $$;
revoke all on function public.save_customer_address(uuid,text,text,text,text,text,text,text,boolean) from public,anon;
grant execute on function public.save_customer_address(uuid,text,text,text,text,text,text,text,boolean) to authenticated;

-- Private profile/avatar storage.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('profile-avatars','profile-avatars',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];

-- All account-specific tables are RLS protected. Replace old permissive customer policies below.
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.favorites enable row level security;
alter table public.pc_builds enable row level security;
alter table public.order_events enable row level security;

drop policy if exists "Profiles read own or admin" on public.profiles;
create policy "Profiles read own or admin" on public.profiles for select to authenticated using(user_id=(select auth.uid()) or (select public.store_is_admin()));
drop policy if exists "Customers create own profile" on public.profiles;
create policy "Customers create own profile" on public.profiles for insert to authenticated with check(user_id=(select auth.uid()) and not (select public.store_is_admin()));
drop policy if exists "Customers update own profile" on public.profiles;
create policy "Customers update own profile" on public.profiles for update to authenticated using(user_id=(select auth.uid()) and not (select public.store_is_admin())) with check(user_id=(select auth.uid()) and not (select public.store_is_admin()));
drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Admins manage profiles" on public.profiles for all to authenticated using((select public.store_is_admin())) with check((select public.store_is_admin()));

drop policy if exists "Customers manage own addresses" on public.addresses;
drop policy if exists "Customers read own addresses" on public.addresses;
drop policy if exists "Customers delete own addresses" on public.addresses;
create policy "Customers read own addresses" on public.addresses for select to authenticated using(user_id=(select auth.uid()) and not (select public.store_is_admin()));
create policy "Customers delete own addresses" on public.addresses for delete to authenticated using(user_id=(select auth.uid()) and not (select public.store_is_admin()));
drop policy if exists "Admins manage addresses" on public.addresses;
create policy "Admins manage addresses" on public.addresses for all to authenticated using((select public.store_is_admin())) with check((select public.store_is_admin()));
drop policy if exists "Customers manage own favorites" on public.favorites;
drop policy if exists "Customers read own favorites" on public.favorites;
drop policy if exists "Customers add own favorites" on public.favorites;
drop policy if exists "Customers remove own favorites" on public.favorites;
create policy "Customers read own favorites" on public.favorites for select to authenticated using(user_id=(select auth.uid()) and not (select public.store_is_admin()));
create policy "Customers add own favorites" on public.favorites for insert to authenticated with check(user_id=(select auth.uid()) and not (select public.store_is_admin()));
create policy "Customers remove own favorites" on public.favorites for delete to authenticated using(user_id=(select auth.uid()) and not (select public.store_is_admin()));
drop policy if exists "Admins read favorites" on public.favorites;
drop policy if exists "Admins insert favorites" on public.favorites;
create policy "Admins read favorites" on public.favorites for select to authenticated using((select public.store_is_admin()));

drop policy if exists "Customers read own builds" on public.pc_builds;
create policy "Customers read own builds" on public.pc_builds for select to authenticated using(user_id=(select auth.uid()) or (select public.store_is_admin()));
drop policy if exists "Admins manage builds" on public.pc_builds;
create policy "Admins manage builds" on public.pc_builds for all to authenticated using((select public.store_is_admin())) with check((select public.store_is_admin()));
drop policy if exists "Customers read own order history" on public.order_events;
create policy "Customers read own order history" on public.order_events for select to authenticated using(user_id=(select auth.uid()) or (select public.store_is_admin()));
drop policy if exists "Admins manage order history" on public.order_events;
create policy "Admins manage order history" on public.order_events for all to authenticated using((select public.store_is_admin())) with check((select public.store_is_admin()));

drop policy if exists "Customers read own appointments" on public.appointments;
drop policy if exists "Customers request own appointments" on public.appointments;
drop policy if exists "Admins update appointment requests" on public.appointments;
drop policy if exists "Admins delete appointments" on public.appointments;
drop policy if exists "Admins create appointments" on public.appointments;
create policy "Appointment owner read or admin" on public.appointments for select to authenticated using(user_id=(select auth.uid()) or (select public.store_is_admin()));
create policy "Customer creates own pending appointment" on public.appointments for insert to authenticated with check(user_id=(select auth.uid()) and customer_id=(select auth.uid()) and status='Pending Approval' and not (select public.store_is_admin()));
create policy "Admins create appointments" on public.appointments for insert to authenticated with check((select public.store_is_admin()));
create policy "Admin updates appointments" on public.appointments for update to authenticated using((select public.store_is_admin())) with check((select public.store_is_admin()));
create policy "Admin deletes appointments" on public.appointments for delete to authenticated using((select public.store_is_admin()));

drop policy if exists "Customers read own orders" on public.orders;
drop policy if exists "Customers and admins read their orders" on public.orders;
drop policy if exists "Admins update order status" on public.orders;
drop policy if exists "Admins insert orders" on public.orders;
create policy "Customers read own orders" on public.orders for select to authenticated using(user_id=(select auth.uid()) or (select public.store_is_admin()));
create policy "Admins insert orders" on public.orders for insert to authenticated with check((select public.store_is_admin()));
create policy "Admins update orders" on public.orders for update to authenticated using((select public.store_is_admin())) with check((select public.store_is_admin()));

drop policy if exists "Customers read their order items" on public.order_items;
drop policy if exists "Customers read own order items" on public.order_items;
drop policy if exists "Admins insert order items" on public.order_items;
drop policy if exists "Admins update order items" on public.order_items;
drop policy if exists "Admins delete order items" on public.order_items;
create policy "Customers read own order items" on public.order_items for select to authenticated using(user_id=(select auth.uid()) or (select public.store_is_admin()));
create policy "Admins insert order items" on public.order_items for insert to authenticated with check((select public.store_is_admin()));
create policy "Admins update order items" on public.order_items for update to authenticated using((select public.store_is_admin())) with check((select public.store_is_admin()));
create policy "Admins delete order items" on public.order_items for delete to authenticated using((select public.store_is_admin()));

drop policy if exists "Customers and admins read quotes" on public.quotes;
drop policy if exists "Customers read own quotes" on public.quotes;
drop policy if exists "Only admins create quotes" on public.quotes;
drop policy if exists "Only admins revise quotes" on public.quotes;
create policy "Customers read own quotes" on public.quotes for select to authenticated using(user_id=(select auth.uid()) or (select public.store_is_admin()));
create policy "Admins create quotes" on public.quotes for insert to authenticated with check((select public.store_is_admin()));
create policy "Admins update quotes" on public.quotes for update to authenticated using((select public.store_is_admin())) with check((select public.store_is_admin()));
create policy "Admins delete quotes" on public.quotes for delete to authenticated using((select public.store_is_admin()));
create or replace function public.respond_to_quote(p_quote uuid,p_decision text,p_question text default null)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or public.store_is_admin() then raise exception 'Customer sign-in required'; end if;
  if p_decision not in('Accepted','Declined','Question Asked') then raise exception 'Invalid quote decision'; end if;
  if p_decision='Question Asked' and length(trim(coalesce(p_question,''))) not between 1 and 2000 then raise exception 'Enter a question'; end if;
  update public.quotes set status=p_decision,customer_question=case when p_decision='Question Asked' then left(trim(p_question),2000) else customer_question end
  where id=p_quote and user_id=auth.uid() and status='Pending Customer';
  if not found then raise exception 'Quote unavailable or no longer awaiting your response'; end if;
end; $$;
revoke all on function public.respond_to_quote(uuid,text,text) from public,anon;
grant execute on function public.respond_to_quote(uuid,text,text) to authenticated;

drop policy if exists "Customers read own build timeline" on public.build_events;
drop policy if exists "Admins manage build timeline" on public.build_events;
create policy "Customers read own build timeline" on public.build_events for select to authenticated using(user_id=(select auth.uid()) or (select public.store_is_admin()));
create policy "Admins manage build timeline" on public.build_events for all to authenticated using((select public.store_is_admin())) with check((select public.store_is_admin()));
drop policy if exists "Participants read appointment messages" on public.messages;
drop policy if exists "Participants send appointment messages" on public.messages;
create policy "Customers read own messages" on public.messages for select to authenticated using(user_id=(select auth.uid()) or (select public.store_is_admin()));
create policy "Customers send own messages" on public.messages for insert to authenticated with check(customer_id=(select auth.uid()) and user_id=(select auth.uid()) and sender_id=(select auth.uid()) and (appointment_id is null or exists(select 1 from public.appointments a where a.id=appointment_id and a.user_id=(select auth.uid()))));
drop policy if exists "Customers read own invoices" on public.invoices;
drop policy if exists "Admins manage invoices" on public.invoices;
create policy "Customers read own invoices" on public.invoices for select to authenticated using(user_id=(select auth.uid()) or (select public.store_is_admin()));
create policy "Admins manage invoices" on public.invoices for all to authenticated using((select public.store_is_admin())) with check((select public.store_is_admin()));
drop policy if exists "Customers manage their saved products" on public.saved_products;
drop policy if exists "Customers manage own saved products" on public.saved_products;
create policy "Customers read own saved products" on public.saved_products for select to authenticated using(user_id=(select auth.uid()) and not (select public.store_is_admin()));
create policy "Customers add own saved products" on public.saved_products for insert to authenticated with check(user_id=(select auth.uid()) and customer_id=(select auth.uid()) and not (select public.store_is_admin()));
create policy "Customers remove own saved products" on public.saved_products for delete to authenticated using(user_id=(select auth.uid()) and not (select public.store_is_admin()));
drop policy if exists "Admins read saved products" on public.saved_products;
create policy "Admins read saved products" on public.saved_products for select to authenticated using((select public.store_is_admin()));

-- Revoke defaults and grant only operations protected by the policies above.
revoke all on public.profiles,public.addresses,public.favorites,public.pc_builds,public.order_events from anon,authenticated;
revoke all on public.appointments,public.orders,public.order_items,public.quotes,public.build_events,public.messages,public.invoices,public.saved_products,public.customer_profiles from anon,authenticated;
grant select,insert,update on public.profiles to authenticated;
grant select,delete on public.addresses to authenticated;
grant select,insert,delete on public.favorites to authenticated;
grant select on public.pc_builds,public.order_events to authenticated;
grant select,insert,update,delete on public.appointments to authenticated;
grant select,insert,update on public.orders to authenticated;
grant select,insert,update,delete on public.order_items to authenticated;
grant select,insert,update,delete on public.quotes,public.build_events,public.invoices to authenticated;
grant select,insert on public.messages to authenticated;
grant select,insert,update,delete on public.saved_products to authenticated;
grant select,insert,update on public.customer_profiles to authenticated;

-- Private profile photo uploads and downloads stay in a folder keyed by the authenticated UID.
drop policy if exists "Customers upload own profile avatars" on storage.objects;
create policy "Customers upload own profile avatars" on storage.objects for insert to authenticated with check(bucket_id='profile-avatars' and (storage.foldername(name))[1]=(select auth.uid())::text and coalesce((metadata->>'size')::bigint,0)<=5242880 and coalesce(metadata->>'mimetype','') in('image/jpeg','image/png','image/webp'));
drop policy if exists "Customers read own profile avatars" on storage.objects;
create policy "Customers read own profile avatars" on storage.objects for select to authenticated using(bucket_id='profile-avatars' and ((storage.foldername(name))[1]=(select auth.uid())::text or (select public.store_is_admin())));
drop policy if exists "Customers delete own profile avatars" on storage.objects;
create policy "Customers delete own profile avatars" on storage.objects for delete to authenticated using(bucket_id='profile-avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);
