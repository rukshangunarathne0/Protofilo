-- R.S.D. public catalogue colour variants.
--
-- The uploaded photos were verified as four genuinely matching dial families:
--   RSD-WS-145: Orix open-heart dial, five case/strap colours
--   RSD-WS-161: Swatch open-work dial, five dial colours
--   RSD-WS-160: Swatch bold-number dial, five dial colours
--   RSD-WS-159: Swatch radial minute-track dial, four dial colours
--
-- Each family keeps its existing representative SKU and price. The other
-- colours are image variants on that row, so the public collection remains
-- one card per dial family. No unrelated catalogue rows are touched.

alter table public.ht_products
  add column if not exists variant_group text;

alter table public.ht_products
  add column if not exists variant_images jsonb not null default '[]'::jsonb;

update public.ht_products
set
  variant_group = sku,
  colors = case sku
    when 'RSD-WS-145' then '["Blue","Black","Black & Gold","White & Gold","Rose Gold"]'::jsonb
    when 'RSD-WS-159' then '["Turquoise","Green","Black","Red"]'::jsonb
    when 'RSD-WS-160' then '["Gold","Black","Blue","Green","Cream"]'::jsonb
    when 'RSD-WS-161' then '["Red","Orange","White","Green","Blue"]'::jsonb
  end,
  image = case sku
    when 'RSD-WS-145' then '/products/RSD-WS-145-blue.webp'
    when 'RSD-WS-159' then '/products/RSD-WS-159-turquoise.webp'
    when 'RSD-WS-160' then '/products/RSD-WS-160-gold.webp'
    when 'RSD-WS-161' then '/products/RSD-WS-161-red.webp'
  end,
  variant_images = case sku
    when 'RSD-WS-145' then '[
      {"sku":"RSD-WS-145","color":"Blue","image":"/products/RSD-WS-145-blue.webp"},
      {"sku":"RSD-WS-145","color":"Black","image":"/products/RSD-WS-145-black.webp"},
      {"sku":"RSD-WS-145","color":"Black & Gold","image":"/products/RSD-WS-145-black-gold.webp"},
      {"sku":"RSD-WS-145","color":"White & Gold","image":"/products/RSD-WS-145-white-gold.webp"},
      {"sku":"RSD-WS-145","color":"Rose Gold","image":"/products/RSD-WS-145-rose-gold.webp"}
    ]'::jsonb
    when 'RSD-WS-159' then '[
      {"sku":"RSD-WS-159","color":"Turquoise","image":"/products/RSD-WS-159-turquoise.webp"},
      {"sku":"RSD-WS-159","color":"Green","image":"/products/RSD-WS-159-green.webp"},
      {"sku":"RSD-WS-159","color":"Black","image":"/products/RSD-WS-159-black.webp"},
      {"sku":"RSD-WS-159","color":"Red","image":"/products/RSD-WS-159-red.webp"}
    ]'::jsonb
    when 'RSD-WS-160' then '[
      {"sku":"RSD-WS-160","color":"Gold","image":"/products/RSD-WS-160-gold.webp"},
      {"sku":"RSD-WS-160","color":"Black","image":"/products/RSD-WS-160-black.webp"},
      {"sku":"RSD-WS-160","color":"Blue","image":"/products/RSD-WS-160-blue.webp"},
      {"sku":"RSD-WS-160","color":"Green","image":"/products/RSD-WS-160-green.webp"},
      {"sku":"RSD-WS-160","color":"Cream","image":"/products/RSD-WS-160-cream.webp"}
    ]'::jsonb
    when 'RSD-WS-161' then '[
      {"sku":"RSD-WS-161","color":"Red","image":"/products/RSD-WS-161-red.webp"},
      {"sku":"RSD-WS-161","color":"Orange","image":"/products/RSD-WS-161-orange.webp"},
      {"sku":"RSD-WS-161","color":"White","image":"/products/RSD-WS-161-white.webp"},
      {"sku":"RSD-WS-161","color":"Green","image":"/products/RSD-WS-161-green.webp"},
      {"sku":"RSD-WS-161","color":"Blue","image":"/products/RSD-WS-161-blue.webp"}
    ]'::jsonb
  end,
  updated_at = now()
where sku in ('RSD-WS-145', 'RSD-WS-159', 'RSD-WS-160', 'RSD-WS-161');

-- Audit the four representatives after applying the migration.
select sku, variant_group, colors, variant_images
from public.ht_products
where sku in ('RSD-WS-145', 'RSD-WS-159', 'RSD-WS-160', 'RSD-WS-161')
order by sku;
