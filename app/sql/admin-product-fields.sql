-- R.S.D. Premium Watches — optional catalogue fields and product photo setup.
-- Customer prices are entered directly by the administrator. Supplier costs remain
-- private operational data and are not used to recalculate the public price.

alter table public.ht_products add column if not exists brand text;
alter table public.ht_products add column if not exists description text;
alter table public.ht_products add column if not exists colors jsonb not null default '[]'::jsonb;
alter table public.ht_products add column if not exists gender text not null default 'Unisex';
alter table public.ht_products add column if not exists product_type text not null default 'Watches';
alter table public.ht_products add column if not exists is_new boolean not null default false;
alter table public.ht_products add column if not exists availability text not null default 'Available to order';

alter table public.ht_products
  drop constraint if exists ht_products_image_length;
alter table public.ht_products
  add constraint ht_products_image_length check (image is null or length(image) <= 200000);

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- No anonymous upload policy is created here. The browser tries storage first,
-- then safely falls back to a small inline thumbnail when the public key cannot
-- write. Add an authenticated server-side upload route before permitting writes.

select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'ht_products'
order by ordinal_position;
