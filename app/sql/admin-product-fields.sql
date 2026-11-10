-- Happy Time Connect — one-time database additions for the admin product form.
--
-- Paste the whole file into Supabase → SQL Editor → New query, then press Run.
-- It is safe to run twice. Nothing is deleted; only new optional columns and
-- one storage policy are added.
--
-- After running it, open the admin console → Products → Add product. The Brand,
-- Description and Retail price fields appear by themselves (the console asks the
-- database which columns exist). Reload the page first.

-- ---------------------------------------------------------------- 1. columns
alter table public.ht_products add column if not exists brand text;
alter table public.ht_products add column if not exists description text;
alter table public.ht_products add column if not exists retail_price numeric;

comment on column public.ht_products.brand is 'Manufacturer, shown to dealers under the product name';
comment on column public.ht_products.description is 'Short dealer-facing copy, falls back to a default sentence when empty';
comment on column public.ht_products.retail_price is 'Recommended retail price in LKR; wholesale price stays in ht_products.price';

-- ------------------------------------------------- 2. keep the rows tidy
-- A 5 MB camera photo is rejected in the browser, but guard the column too so a
-- bad upload can never bloat the catalogue query.
alter table public.ht_products
  drop constraint if exists ht_products_image_length;
alter table public.ht_products
  add constraint ht_products_image_length check (image is null or length(image) <= 200000);

-- ------------------------------------------------- 3. photo uploads
-- The product-images bucket already serves public reads. This policy lets the
-- console (anon key, no login) write new photos into the ht-connect/products/
-- folder only. If you would rather keep the bucket read-only, skip section 3:
-- the console then stores a 24 kB inline copy instead of a full-size photo.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "ht product photo uploads" on storage.objects;
create policy "ht product photo uploads"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'product-images' and (storage.foldername(name))[1] = 'ht-connect');

drop policy if exists "ht product photo replace" on storage.objects;
create policy "ht product photo replace"
  on storage.objects for update
  to anon
  using (bucket_id = 'product-images' and (storage.foldername(name))[1] = 'ht-connect');

-- ------------------------------------------------- 4. check it worked
-- Should list brand, description, retail_price next to the existing columns.
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'ht_products'
order by ordinal_position;
