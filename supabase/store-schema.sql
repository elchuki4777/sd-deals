-- SD Deals store schema. Run schema.sql first, then this migration in the Supabase SQL editor.
-- Never put a Supabase service-role key in a browser client.
create extension if not exists pgcrypto;
create or replace function public.store_is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((auth.jwt()->'app_metadata'->>'role')='admin',false);
$$;

-- Customer-owned profile fields; contact/address data is private to the customer and trusted staff.
create table if not exists public.customer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  preferred_contact text not null default 'Email' check(preferred_contact in ('Email','Phone','Text')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Public product catalog contains no purchase costs or seller profit.
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  slug text not null unique,
  name text not null check(length(name) between 1 and 160),
  category text not null check(category in ('Phones','Fragrances','Clothing','Electronics','Gaming PCs','PC Parts','Accessories')),
  brand text not null default '',
  price numeric(12,2) not null check(price>=0),
  sale_price numeric(12,2) check(sale_price is null or (sale_price>=0 and sale_price<price)),
  condition text not null check(condition in ('New','Open Box','Like New','Good','Used')),
  stock_quantity integer not null default 0 check(stock_quantity>=0),
  image_urls text[] not null default '{}',
  description text not null default '',
  specifications jsonb not null default '{}',
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_catalog_idx on public.products(active,category,created_at desc);
create index if not exists products_brand_idx on public.products(brand);

-- This financial table is administrator-only, including SELECT.
create table if not exists public.inventory_costs (
  product_id uuid primary key references public.products(id) on delete cascade,
  purchase_cost numeric(12,2) not null default 0 check(purchase_cost>=0),
  fees numeric(12,2) not null default 0 check(fees>=0),
  shipping_cost numeric(12,2) not null default 0 check(shipping_cost>=0),
  imei_status text not null default '' check(length(imei_status)<=120),
  updated_at timestamptz not null default now()
);
alter table public.inventory_costs add column if not exists imei_status text not null default '';
create or replace view public.admin_inventory_profit with (security_invoker=true) as
  select p.id as product_id,p.sku,p.name,p.category,p.stock_quantity,coalesce(p.sale_price,p.price) as selling_price,
         c.purchase_cost,c.fees,c.shipping_cost,c.imei_status,
         (coalesce(p.sale_price,p.price)-c.purchase_cost-c.fees-c.shipping_cost) as unit_profit,
         case when coalesce(p.sale_price,p.price)=0 then 0 else round(((coalesce(p.sale_price,p.price)-c.purchase_cost-c.fees-c.shipping_cost)/coalesce(p.sale_price,p.price))*100,2) end as profit_margin
  from public.products p join public.inventory_costs c on c.product_id=p.id;
grant select on public.admin_inventory_profit to authenticated;

-- Order totals are immutable snapshots. The identity sequence starts at the first example after demo SD-1049.
create sequence if not exists public.store_order_number_seq start with 1050;
revoke all on sequence public.store_order_number_seq from public,anon,authenticated;
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('SD-'||lpad(nextval('public.store_order_number_seq')::text,4,'0')),
  user_id uuid not null references auth.users(id) on delete restrict,
  customer_name text not null,
  email text not null,
  phone text not null,
  shipping_address text not null default '',
  shipping_method text not null check(shipping_method in ('Shipping','Local Pickup')),
  payment_method text not null,
  payment_status text not null default 'Pending' check(payment_status in ('Pending','Paid','Failed','Refunded')),
  status text not null default 'Order Received' check(status in ('Order Received','Payment Confirmed','Preparing Order','Shipped','Out for Delivery','Delivered','Ready for Pickup','Picked Up','Cancelled')),
  subtotal numeric(12,2) not null check(subtotal>=0),
  shipping numeric(12,2) not null default 0 check(shipping>=0),
  tax numeric(12,2) not null default 0 check(tax>=0),
  total numeric(12,2) not null check(total>=0),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_customer_created_idx on public.orders(user_id,created_at desc);
create table if not exists public.saved_products (
  customer_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(customer_id,product_id)
);
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  sku text not null,
  name text not null,
  quantity integer not null check(quantity>0),
  unit_price numeric(12,2) not null check(unit_price>=0),
  image_url text not null default ''
);
create index if not exists order_items_order_idx on public.order_items(order_id);

-- Customer reviews stay hidden until an administrator moderates them.
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check(rating between 1 and 5),
  body text not null check(length(body) between 3 and 1500),
  status text not null default 'Pending' check(status in ('Pending','Published','Rejected')),
  verified_purchase boolean not null default false,
  display_name text not null default 'Customer',
  created_at timestamptz not null default now(),
  unique(product_id,customer_id)
);
create index if not exists reviews_product_published_idx on public.reviews(product_id,status,created_at desc);

create or replace function public.sync_store_review_status()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.payment_status='Paid' and old.payment_status is distinct from new.payment_status then
    update public.reviews r set verified_purchase=true where r.customer_id=new.user_id and r.status='Published'
      and exists(select 1 from public.order_items oi where oi.order_id=new.id and oi.product_id=r.product_id);
  end if;
  return new;
end;$$;
drop trigger if exists orders_sync_review_verification on public.orders;
create trigger orders_sync_review_verification after update of payment_status on public.orders for each row execute function public.sync_store_review_status();

create or replace function public.sd_store_touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$begin new.updated_at=now();return new;end;$$;
drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at before update on public.products for each row execute function public.sd_store_touch_updated_at();
drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at before update on public.orders for each row execute function public.sd_store_touch_updated_at();
drop trigger if exists customer_profiles_touch_updated_at on public.customer_profiles;
create trigger customer_profiles_touch_updated_at before update on public.customer_profiles for each row execute function public.sd_store_touch_updated_at();
drop trigger if exists inventory_costs_touch_updated_at on public.inventory_costs;
create trigger inventory_costs_touch_updated_at before update on public.inventory_costs for each row execute function public.sd_store_touch_updated_at();

create or replace function public.mark_verified_store_review()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  new.verified_purchase:=exists(select 1 from public.orders o join public.order_items oi on oi.order_id=o.id where o.user_id=new.customer_id and o.payment_status='Paid' and o.status<>'Cancelled' and oi.product_id=new.product_id);
  new.display_name:='Customer';
  return new;
end;$$;
drop trigger if exists reviews_mark_verified on public.reviews;
create trigger reviews_mark_verified before insert on public.reviews for each row execute function public.mark_verified_store_review();

-- Atomically validate product IDs, reserve stock, take prices from trusted rows, and save order snapshots.
-- Checkout creates a pending-payment order only; it never pretends to collect money.
create or replace function public.place_store_order(
  p_items jsonb,p_shipping_method text,p_customer_name text,p_email text,p_phone text,
  p_shipping_address text default '',p_payment_method text default 'Contact me to arrange payment',p_notes text default ''
) returns text language plpgsql security definer set search_path = '' as $$
declare
  customer uuid:=auth.uid(); item jsonb; product_row public.products%rowtype;
  qty integer; amount numeric(12,2); sub numeric(12,2):=0; ship numeric(12,2):=0; tax_amount numeric(12,2):=0;
  order_id uuid; order_number text;
begin
  if customer is null then raise exception 'Sign in to place an order'; end if;
  if coalesce((select (auth.jwt()->'app_metadata'->>'role')='admin'),false) then raise exception 'Administrator accounts cannot place customer orders'; end if;
  if jsonb_typeof(p_items) is distinct from 'array' then raise exception 'Invalid shopping cart'; end if;
  if jsonb_array_length(p_items)<1 or jsonb_array_length(p_items)>40 then raise exception 'Invalid shopping cart'; end if;
  if p_shipping_method not in('Shipping','Local Pickup') then raise exception 'Invalid fulfillment option'; end if;
  if length(trim(p_customer_name)) not between 1 and 160 or length(trim(p_phone)) not between 7 and 40 or p_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Enter valid contact details'; end if;
  if p_shipping_method='Shipping' and (length(trim(coalesce(p_shipping_address,'')))<8 or length(p_shipping_address)>500) then raise exception 'Enter a complete shipping address'; end if;
  if p_shipping_method='Local Pickup' and p_shipping_address not ilike '%San Diego Area%' then raise exception 'Local pickup details are shared after the order is confirmed'; end if;
  if p_payment_method not in('Card (secure payment coming soon)','Pay at local pickup','Contact me to arrange payment') then raise exception 'Invalid payment method'; end if;
  if length(coalesce(p_notes,''))>1000 then raise exception 'Order notes are too long'; end if;
  if (select count(distinct value->>'product_id') from jsonb_array_elements(p_items))<>jsonb_array_length(p_items) then raise exception 'Duplicate products are not allowed in cart'; end if;
  insert into public.customer_profiles(user_id,full_name,phone) values(customer,trim(p_customer_name),trim(p_phone))
    on conflict(user_id) do update set full_name=excluded.full_name,phone=excluded.phone;
  for item in select value from jsonb_array_elements(p_items) loop
    if coalesce(item->>'product_id','') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then raise exception 'Invalid product in cart'; end if;
    if coalesce(item->>'quantity','') !~ '^[0-9]{1,3}$' then raise exception 'Invalid product quantity'; end if;
    qty:=(item->>'quantity')::integer;
    if qty<1 or qty>20 then raise exception 'Product quantity is not allowed'; end if;
    select * into product_row from public.products where id=(item->>'product_id')::uuid and active for update;
    if not found then raise exception 'A product is no longer available'; end if;
    if product_row.stock_quantity<qty then raise exception 'Not enough stock for %',product_row.name; end if;
    amount:=coalesce(product_row.sale_price,product_row.price);
    sub:=sub+amount*qty;
  end loop;
  if p_shipping_method='Shipping' and sub<100 then ship:=9.95; end if;
  -- Baseline estimate for the San Diego-area business. Connect tax calculation to a tax provider for live sales.
  tax_amount:=round((sub+ship)*0.0775,2);
  insert into public.orders(user_id,customer_name,email,phone,shipping_address,shipping_method,payment_method,subtotal,shipping,tax,total,notes)
    values(customer,trim(p_customer_name),lower(trim(p_email)),trim(p_phone),case when p_shipping_method='Shipping' then trim(p_shipping_address) else 'San Diego Area — details after order confirmation' end,p_shipping_method,p_payment_method,sub,ship,tax_amount,sub+ship+tax_amount,left(coalesce(p_notes,''),1000))
    returning id,orders.order_number into order_id,order_number;
  for item in select value from jsonb_array_elements(p_items) loop
    qty:=(item->>'quantity')::integer;
    select * into product_row from public.products where id=(item->>'product_id')::uuid and active for update;
    amount:=coalesce(product_row.sale_price,product_row.price);
    update public.products set stock_quantity=stock_quantity-qty where id=product_row.id and stock_quantity>=qty;
    if not found then raise exception 'Not enough stock for %',product_row.name; end if;
    insert into public.order_items(order_id,product_id,sku,name,quantity,unit_price,image_url)
      values(order_id,product_row.id,product_row.sku,product_row.name,qty,amount,coalesce(product_row.image_urls[1],''));
  end loop;
  return order_number;
end;$$;
revoke all on function public.place_store_order(jsonb,text,text,text,text,text,text,text) from public,anon;
grant execute on function public.place_store_order(jsonb,text,text,text,text,text,text,text) to authenticated;

alter table public.saved_products enable row level security;
alter table public.saved_products force row level security;
alter table public.customer_profiles enable row level security;
alter table public.customer_profiles force row level security;
alter table public.products enable row level security;
alter table public.products force row level security;
alter table public.inventory_costs enable row level security;
alter table public.inventory_costs force row level security;
alter table public.orders enable row level security;
alter table public.orders force row level security;
alter table public.order_items enable row level security;
alter table public.order_items force row level security;
alter table public.reviews enable row level security;
alter table public.reviews force row level security;
revoke all on public.inventory_costs from anon,authenticated;
revoke all on public.admin_inventory_profit from anon,authenticated;
revoke all on public.products from anon,authenticated;
revoke all on public.orders from anon,authenticated;
revoke all on public.order_items from anon,authenticated;
revoke all on public.customer_profiles from anon,authenticated;
revoke all on public.saved_products from anon,authenticated;
revoke all on public.reviews from anon,authenticated;
drop policy if exists "Public read active products" on public.products;
create policy "Public read active products" on public.products for select to anon,authenticated using(active or (select public.store_is_admin()));
drop policy if exists "Admins create products" on public.products;
create policy "Admins create products" on public.products for insert to authenticated with check((select public.store_is_admin()));
drop policy if exists "Admins update products" on public.products;
create policy "Admins update products" on public.products for update to authenticated using((select public.store_is_admin())) with check((select public.store_is_admin()));
drop policy if exists "Admins delete products" on public.products;
create policy "Admins delete products" on public.products for delete to authenticated using((select public.store_is_admin()));
drop policy if exists "Admins manage private inventory costs" on public.inventory_costs;
create policy "Admins manage private inventory costs" on public.inventory_costs for all to authenticated using((select public.store_is_admin())) with check((select public.store_is_admin()));
drop policy if exists "Customers read own profiles" on public.customer_profiles;
create policy "Customers read own profiles" on public.customer_profiles for select to authenticated using(user_id=(select auth.uid()) or (select public.store_is_admin()));
drop policy if exists "Customers update own profiles" on public.customer_profiles;
create policy "Customers update own profiles" on public.customer_profiles for update to authenticated using(user_id=(select auth.uid()) or (select public.store_is_admin())) with check(user_id=(select auth.uid()) or (select public.store_is_admin()));
drop policy if exists "Customers insert own profiles" on public.customer_profiles;
create policy "Customers insert own profiles" on public.customer_profiles for insert to authenticated with check(user_id=(select auth.uid()) or (select public.store_is_admin()));
drop policy if exists "Customers and admins read their orders" on public.orders;
create policy "Customers and admins read their orders" on public.orders for select to authenticated using(user_id=(select auth.uid()) or (select public.store_is_admin()));
drop policy if exists "Admins update order status" on public.orders;
create policy "Admins update order status" on public.orders for update to authenticated using((select public.store_is_admin())) with check((select public.store_is_admin()));
drop policy if exists "Customers read their order items" on public.order_items;
create policy "Customers read their order items" on public.order_items for select to authenticated using(exists(select 1 from public.orders o where o.id=order_id and (o.user_id=(select auth.uid()) or (select public.store_is_admin()))));
drop policy if exists "Public read approved reviews" on public.reviews;
create policy "Public read approved reviews" on public.reviews for select to anon,authenticated using(status='Published' or customer_id=(select auth.uid()) or (select public.store_is_admin()));
drop policy if exists "Customers add their own reviews" on public.reviews;
create policy "Customers add their own reviews" on public.reviews for insert to authenticated with check(customer_id=(select auth.uid()) and status='Pending');
drop policy if exists "Customers manage their saved products" on public.saved_products;
create policy "Customers manage their saved products" on public.saved_products for all to authenticated using(customer_id=(select auth.uid()) or (select public.store_is_admin())) with check(customer_id=(select auth.uid()) or (select public.store_is_admin()));
drop policy if exists "Admins moderate reviews" on public.reviews;
create policy "Admins moderate reviews" on public.reviews for update to authenticated using((select public.store_is_admin())) with check((select public.store_is_admin()));

grant select on public.products to anon,authenticated;
grant insert,update,delete on public.products to authenticated;
grant select,insert,update on public.customer_profiles to authenticated;
grant select,update on public.orders to authenticated;
grant select on public.order_items to authenticated;
grant select,insert,update on public.reviews to authenticated;
grant select,insert,update,delete on public.saved_products to authenticated;
grant select,insert,update,delete on public.inventory_costs to authenticated;

-- Product photos are publicly viewable, but uploads/changes remain admin-only. No executable or SVG files.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('product-images','product-images',true,10485760,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=true,file_size_limit=10485760,allowed_mime_types=array['image/jpeg','image/png','image/webp'];

-- Add store-specific columns needed by the existing appointment admin/quote portal.
alter table public.availability_settings add column if not exists shipping_address text not null default '';
alter table public.availability_settings add column if not exists shipping_instructions text not null default '';
revoke all on public.shipping_settings from anon,authenticated;
drop policy if exists "Admins manage shipping settings" on public.shipping_settings;
create policy "Admins manage shipping settings" on public.shipping_settings for all to authenticated using((select public.store_is_admin())) with check((select public.store_is_admin()));
grant select,insert,update,delete on public.shipping_settings to authenticated;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((auth.jwt()->'app_metadata'->>'role')='admin',false);
$$;
create or replace function public.get_admin_appointments()
returns setof public.appointments language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.store_is_admin() then raise exception 'Administrator access required'; end if;
  return query select a.* from public.appointments a order by a.created_at desc;
end;$$;
grant execute on function public.get_admin_appointments() to authenticated;

-- Enforce file type/size on the server-side Storage upload policy too.
drop policy if exists "Customers upload own part photos" on storage.objects;
create policy "Customers upload own part photos" on storage.objects for insert to authenticated with check(bucket_id='part-photos' and (storage.foldername(name))[1]=(select auth.uid())::text and (metadata->>'size')::bigint<=10485760 and coalesce(metadata->>'mimetype','') in ('image/jpeg','image/png','image/webp','image/gif'));

drop policy if exists "Anyone may view store product photos" on storage.objects;
create policy "Anyone may view store product photos" on storage.objects for select to anon,authenticated using(bucket_id='product-images');
drop policy if exists "Admins upload store product photos" on storage.objects;
create policy "Admins upload store product photos" on storage.objects for insert to authenticated with check(bucket_id='product-images' and (select public.store_is_admin()));
drop policy if exists "Admins update store product photos" on storage.objects;
create policy "Admins update store product photos" on storage.objects for update to authenticated using(bucket_id='product-images' and (select public.store_is_admin())) with check(bucket_id='product-images' and (select public.store_is_admin()));
drop policy if exists "Admins delete store product photos" on storage.objects;
create policy "Admins delete store product photos" on storage.objects for delete to authenticated using(bucket_id='product-images' and (select public.store_is_admin()));

-- Extend the pre-existing PC appointment validator to cover common Windows setup requests.
alter table public.appointments drop constraint if exists appointments_service_check;
alter table public.appointments add constraint appointments_service_check check(service in ('Full PC Assembly','PC Assembly','Custom Gaming PC Build','PC Upgrade','PC Repair','PC Diagnostics','Cable Management','PC Consultation','Windows Setup','Windows & Driver Setup'));

-- Public lookup omits phone, email, street address and customer details.
create or replace function public.lookup_store_order(p_order_number text,p_email text)
returns table(order_number text,status text,payment_status text,total numeric,shipping_method text,created_at timestamptz,items jsonb)
language plpgsql security definer set search_path='' as $$
begin
  if auth.uid() is null or public.store_is_admin() then return; end if;
  if length(coalesce(p_order_number,''))>20 or length(coalesce(p_email,''))>254 then return; end if;
  return query select o.order_number,o.status,o.payment_status,o.total,o.shipping_method,o.created_at,
    coalesce(jsonb_agg(jsonb_build_object('name',oi.name,'quantity',oi.quantity,'unit_price',oi.unit_price,'image_url',oi.image_url)) filter(where oi.id is not null),'[]'::jsonb)
    from public.orders o left join public.order_items oi on oi.order_id=o.id
    where upper(o.order_number)=upper(trim(p_order_number)) and lower(o.email)=lower(trim(p_email)) and o.user_id=auth.uid()
    group by o.id;
end;$$;
revoke all on function public.lookup_store_order(text,text) from public,anon;
grant execute on function public.lookup_store_order(text,text) to authenticated;

grant select on public.products to anon,authenticated;
grant insert,update,delete on public.products to authenticated;
grant select,insert,update on public.customer_profiles to authenticated;
grant select,update on public.orders to authenticated;
grant select on public.order_items to authenticated;
grant select,insert,update on public.reviews to authenticated;
grant select,insert,update,delete on public.saved_products to authenticated;
grant select,insert,update,delete on public.inventory_costs to authenticated;
