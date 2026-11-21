-- R.S.D. public catalogue colour variants.
--
-- The uploaded photos were verified as six genuinely matching dial families:
--   RSD-WS-141: classic chronograph dial, three distinct colour/strap variants
--   RSD-WS-145: Orix open-heart dial, five case/strap colours
--   RSD-WS-146: BLINBOND two-tone dial, four dial colours
--   RSD-WS-159: Swatch radial minute-track dial, four dial colours
--   RSD-WS-160: Swatch bold-number dial, five dial colours
--   RSD-WS-161: Swatch open-work dial, five dial colours
--   RSD-WS-165: Tissot PRX Chronograph smooth-bezel family, six dial/bracelet variants
--
-- The two extra RSD-WS-141 photos are alternate shots of colours already
-- represented, not additional colour variants. Tissot RSD-WS-165 through
-- RSD-WS-170 share the same PRX chronograph case, dial layout and smooth bezel;
-- only the dial/bracelet colourway changes. RSD-WS-171 has a fluted bezel and
-- remains a separate product. This is visual matching, not brand grouping.
--
-- Each family keeps its existing representative SKU and price. The other
-- colours are image variants on that row, so the public collection remains
-- one card per genuinely matching design. No unrelated catalogue rows are
-- touched.

alter table public.ht_products
  add column if not exists variant_group text;

alter table public.ht_products
  add column if not exists variant_images jsonb not null default '[]'::jsonb;

update public.ht_products
set
  variant_group = sku,
  colors = case sku
    when 'RSD-WS-141' then '["Cream dial / Brown strap","Cream dial / Black strap","Black dial / Black strap"]'::jsonb
    when 'RSD-WS-145' then '["Blue","Black","Black & Gold","White & Gold","Rose Gold"]'::jsonb
    when 'RSD-WS-146' then '["Green","Blue","White","Gold"]'::jsonb
    when 'RSD-WS-159' then '["Turquoise","Green","Black","Red"]'::jsonb
    when 'RSD-WS-160' then '["Gold","Black","Blue","Green","Cream"]'::jsonb
    when 'RSD-WS-161' then '["Red","Orange","White","Green","Blue"]'::jsonb
  end,
  image = case sku
    when 'RSD-WS-141' then '/products/RSD-WS-141-cream-brown.webp'
    when 'RSD-WS-145' then '/products/RSD-WS-145-blue.webp'
    when 'RSD-WS-146' then '/products/RSD-WS-146-green.webp'
    when 'RSD-WS-159' then '/products/RSD-WS-159-turquoise.webp'
    when 'RSD-WS-160' then '/products/RSD-WS-160-gold.webp'
    when 'RSD-WS-161' then '/products/RSD-WS-161-red.webp'
  end,
  variant_images = case sku
    when 'RSD-WS-141' then '[
      {"sku":"RSD-WS-141","color":"Cream dial / Brown strap","image":"/products/RSD-WS-141-cream-brown.webp"},
      {"sku":"RSD-WS-141","color":"Cream dial / Black strap","image":"/products/RSD-WS-141-cream-black.webp"},
      {"sku":"RSD-WS-141","color":"Black dial / Black strap","image":"/products/RSD-WS-141-black-dial.webp"}
    ]'::jsonb
    when 'RSD-WS-145' then '[
      {"sku":"RSD-WS-145","color":"Blue","image":"/products/RSD-WS-145-blue.webp"},
      {"sku":"RSD-WS-145","color":"Black","image":"/products/RSD-WS-145-black.webp"},
      {"sku":"RSD-WS-145","color":"Black & Gold","image":"/products/RSD-WS-145-black-gold.webp"},
      {"sku":"RSD-WS-145","color":"White & Gold","image":"/products/RSD-WS-145-white-gold.webp"},
      {"sku":"RSD-WS-145","color":"Rose Gold","image":"/products/RSD-WS-145-rose-gold.webp"}
    ]'::jsonb
    when 'RSD-WS-146' then '[
      {"sku":"RSD-WS-146","color":"Green","image":"/products/RSD-WS-146-green.webp"},
      {"sku":"RSD-WS-146","color":"Blue","image":"/products/RSD-WS-146-blue.webp"},
      {"sku":"RSD-WS-146","color":"White","image":"/products/RSD-WS-146-white.webp"},
      {"sku":"RSD-WS-146","color":"Gold","image":"/products/RSD-WS-146-gold.webp"}
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
where sku in ('RSD-WS-141', 'RSD-WS-145', 'RSD-WS-146', 'RSD-WS-159', 'RSD-WS-160', 'RSD-WS-161');

-- Tissot PRX Chronograph: group only the six visually matching smooth-bezel
-- colourways. Keep the fluted-bezel RSD-WS-171 row independent.
update public.ht_products
set
  variant_group = case
    when sku in ('RSD-WS-165', 'RSD-WS-166', 'RSD-WS-167', 'RSD-WS-168', 'RSD-WS-169', 'RSD-WS-170') then 'RSD-WS-165'
    else null
  end,
  colors = case sku
    when 'RSD-WS-165' then '["Turquoise / Steel","Black / Two-tone","Black / Steel","White / Black","White / Gold","Black / Gold"]'::jsonb
    else colors
  end,
  image = case sku
    when 'RSD-WS-165' then '/products/RSD-WS-165.webp'
    else image
  end,
  variant_images = case sku
    when 'RSD-WS-165' then '[
      {"sku":"RSD-WS-165","color":"Turquoise / Steel","image":"/products/RSD-WS-165.webp"},
      {"sku":"RSD-WS-166","color":"Black / Two-tone","image":"/products/RSD-WS-166.webp"},
      {"sku":"RSD-WS-167","color":"Black / Steel","image":"/products/RSD-WS-167.webp"},
      {"sku":"RSD-WS-168","color":"White / Black","image":"/products/RSD-WS-168.webp"},
      {"sku":"RSD-WS-169","color":"White / Gold","image":"/products/RSD-WS-169.webp"},
      {"sku":"RSD-WS-170","color":"Black / Gold","image":"/products/RSD-WS-170.webp"}
    ]'::jsonb
    else '[]'::jsonb
  end,
  updated_at = now()
where sku in ('RSD-WS-165', 'RSD-WS-166', 'RSD-WS-167', 'RSD-WS-168', 'RSD-WS-169', 'RSD-WS-170', 'RSD-WS-171');

-- Audit the six colour families and the intentionally separate Tissot row.
select sku, variant_group, colors, variant_images
from public.ht_products
where sku in ('RSD-WS-141', 'RSD-WS-145', 'RSD-WS-146', 'RSD-WS-159', 'RSD-WS-160', 'RSD-WS-161', 'RSD-WS-165', 'RSD-WS-166', 'RSD-WS-167', 'RSD-WS-168', 'RSD-WS-169', 'RSD-WS-170', 'RSD-WS-171')
order by sku;
