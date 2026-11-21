-- R.S.D. Chanel and Hublot catalogue additions from the 2026-11-09 upload batch.
--
-- Verified visual groupings only:
--   Chanel square quartz watch: three bracelet families
--     * existing RSD-WS-147 + RSD-WS-172: silver belt
--     * RSD-WS-173 + RSD-WS-174: gold belt
--     * RSD-WS-175 + RSD-WS-176 + RSD-WS-177: rose gold belt
--   Hublot tonneau chronograph: RSD-WS-178 through RSD-WS-185
--   Hublot round skeleton chronograph: existing RSD-WS-143 + RSD-WS-186
--     and RSD-WS-187
--
-- Two supplied photos are alternate shots of colours already represented and
-- are intentionally not duplicated: the extra Chanel gold/white photo and
-- the extra Hublot steel-case grey-dial photo. All Chanel colourways use the
-- existing Chanel price of LKR 2,100. No price was supplied for the new
-- tonneau Hublot family, so it remains contact-for-price until priced in the
-- admin catalogue. The existing round Hublot price is preserved.

-- Extend the existing Chanel silver-belt product with its verified black-dial
-- colour and use the existing silver/white row as the family representative.
update public.ht_products
set
  name = 'Chanel Square Quartz Watch — Silver Belt',
  image = '/products/RSD-WS-147.webp',
  description = 'Chanel square quartz watch with a crystal-set bezel and integrated silver-tone bracelet.',
  colors = '["White dial / Silver belt","Black dial / Silver belt"]'::jsonb,
  variant_group = 'RSD-WS-147',
  variant_images = '[
    {"sku":"RSD-WS-147","color":"White dial / Silver belt","image":"/products/RSD-WS-147.webp"},
    {"sku":"RSD-WS-172","color":"Black dial / Silver belt","image":"/products/RSD-WS-172.webp"}
  ]'::jsonb,
  gender = 'Women',
  product_type = 'Watches',
  is_new = true,
  availability = 'Available to order',
  updated_at = now()
where sku = 'RSD-WS-147';

-- Extend the existing Hublot round blue skeleton chronograph with the two
-- matching black and white dial variants supplied in this batch.
update public.ht_products
set
  name = 'Hublot Round Skeleton Chronograph Watch',
  image = '/products/RSD-WS-143.webp',
  description = 'Hublot round skeleton chronograph with a steel-tone case and blue rubber strap.',
  colors = '["Steel / Blue skeleton dial / Blue strap","Black / Black skeleton dial / Black strap","Steel / White skeleton dial / Black strap"]'::jsonb,
  variant_group = 'RSD-WS-143',
  variant_images = '[
    {"sku":"RSD-WS-143","color":"Steel / Blue skeleton dial / Blue strap","image":"/products/RSD-WS-143.webp"},
    {"sku":"RSD-WS-186","color":"Black / Black skeleton dial / Black strap","image":"/products/RSD-WS-186.webp"},
    {"sku":"RSD-WS-187","color":"Steel / White skeleton dial / Black strap","image":"/products/RSD-WS-187.webp"}
  ]'::jsonb,
  gender = 'Men',
  product_type = 'Watches',
  is_new = true,
  availability = 'Limited availability',
  updated_at = now()
where sku = 'RSD-WS-143';

insert into public.ht_products (
  sku, name, category, price, stock, reserved, image, trend, sort_order,
  brand, description, colors, variant_group, variant_images, gender,
  product_type, is_new, availability, is_high_value
)
values
  ('RSD-WS-172', 'Chanel Square Quartz Watch — Black Dial / Silver Belt', 'Wrist Watches', 2100, 0, 0, '/products/RSD-WS-172.webp', '[0,0,0,0,0,0,0]'::jsonb, 28, 'Chanel', 'Chanel square quartz watch with a black dial, crystal-set bezel and integrated silver-tone bracelet.', '["Black dial / Silver belt"]'::jsonb, 'RSD-WS-147', '[]'::jsonb, 'Women', 'Watches', true, 'Available to order', false),
  ('RSD-WS-173', 'Chanel Square Quartz Watch — Gold Belt', 'Wrist Watches', 2100, 0, 0, '/products/RSD-WS-173.webp', '[0,0,0,0,0,0,0]'::jsonb, 29, 'Chanel', 'Chanel square quartz watch with a crystal-set bezel and integrated gold-tone bracelet.', '["White dial / Gold belt","Black dial / Gold belt"]'::jsonb, 'RSD-WS-173', '[
    {"sku":"RSD-WS-173","color":"White dial / Gold belt","image":"/products/RSD-WS-173.webp"},
    {"sku":"RSD-WS-174","color":"Black dial / Gold belt","image":"/products/RSD-WS-174.webp"}
  ]'::jsonb, 'Women', 'Watches', true, 'Available to order', false),
  ('RSD-WS-174', 'Chanel Square Quartz Watch — Black Dial / Gold Belt', 'Wrist Watches', 2100, 0, 0, '/products/RSD-WS-174.webp', '[0,0,0,0,0,0,0]'::jsonb, 30, 'Chanel', 'Chanel square quartz watch with a black dial and integrated gold-tone bracelet.', '["Black dial / Gold belt"]'::jsonb, 'RSD-WS-173', '[]'::jsonb, 'Women', 'Watches', true, 'Available to order', false),
  ('RSD-WS-175', 'Chanel Square Quartz Watch — Rose Gold Belt', 'Wrist Watches', 2100, 0, 0, '/products/RSD-WS-175.webp', '[0,0,0,0,0,0,0]'::jsonb, 31, 'Chanel', 'Chanel square quartz watch with a crystal-set bezel and integrated rose-gold-tone bracelet.', '["Black dial / Rose gold belt","Pink dial / Rose gold belt","White dial / Rose gold belt"]'::jsonb, 'RSD-WS-175', '[
    {"sku":"RSD-WS-175","color":"Black dial / Rose gold belt","image":"/products/RSD-WS-175.webp"},
    {"sku":"RSD-WS-176","color":"Pink dial / Rose gold belt","image":"/products/RSD-WS-176.webp"},
    {"sku":"RSD-WS-177","color":"White dial / Rose gold belt","image":"/products/RSD-WS-177.webp"}
  ]'::jsonb, 'Women', 'Watches', true, 'Available to order', false),
  ('RSD-WS-176', 'Chanel Square Quartz Watch — Pink Dial / Rose Gold Belt', 'Wrist Watches', 2100, 0, 0, '/products/RSD-WS-176.webp', '[0,0,0,0,0,0,0]'::jsonb, 32, 'Chanel', 'Chanel square quartz watch with a soft pink dial and integrated rose-gold-tone bracelet.', '["Pink dial / Rose gold belt"]'::jsonb, 'RSD-WS-175', '[]'::jsonb, 'Women', 'Watches', true, 'Available to order', false),
  ('RSD-WS-177', 'Chanel Square Quartz Watch — White Dial / Rose Gold Belt', 'Wrist Watches', 2100, 0, 0, '/products/RSD-WS-177.webp', '[0,0,0,0,0,0,0]'::jsonb, 33, 'Chanel', 'Chanel square quartz watch with a white dial and integrated rose-gold-tone bracelet.', '["White dial / Rose gold belt"]'::jsonb, 'RSD-WS-175', '[]'::jsonb, 'Women', 'Watches', true, 'Available to order', false),
  ('RSD-WS-178', 'Hublot Tonneau Chronograph Watch', 'Wrist Watches', 0, 0, 0, '/products/RSD-WS-178.webp', '[0,0,0,0,0,0,0]'::jsonb, 34, 'Hublot', 'Hublot tonneau chronograph with a four-screw case and rubber strap.', '["Black case / Black dial / Black strap","Black case / White skeleton dial / Black strap","Black case / Brown dial / Brown strap","Black case / Grey dial / Grey strap","Black case / Black dial / Blue strap","Steel case / Black dial / Blue strap","Steel case / Brown dial / Brown strap","Steel case / Grey dial / Grey strap"]'::jsonb, 'RSD-WS-178', '[
    {"sku":"RSD-WS-178","color":"Black case / Black dial / Black strap","image":"/products/RSD-WS-178.webp"},
    {"sku":"RSD-WS-179","color":"Black case / White skeleton dial / Black strap","image":"/products/RSD-WS-179.webp"},
    {"sku":"RSD-WS-180","color":"Black case / Brown dial / Brown strap","image":"/products/RSD-WS-180.webp"},
    {"sku":"RSD-WS-181","color":"Black case / Grey dial / Grey strap","image":"/products/RSD-WS-181.webp"},
    {"sku":"RSD-WS-182","color":"Black case / Black dial / Blue strap","image":"/products/RSD-WS-182.webp"},
    {"sku":"RSD-WS-183","color":"Steel case / Black dial / Blue strap","image":"/products/RSD-WS-183.webp"},
    {"sku":"RSD-WS-184","color":"Steel case / Brown dial / Brown strap","image":"/products/RSD-WS-184.webp"},
    {"sku":"RSD-WS-185","color":"Steel case / Grey dial / Grey strap","image":"/products/RSD-WS-185.webp"}
  ]'::jsonb, 'Men', 'Watches', true, 'Available to order', false),
  ('RSD-WS-179', 'Hublot Tonneau Chronograph — White Skeleton Dial', 'Wrist Watches', 0, 0, 0, '/products/RSD-WS-179.webp', '[0,0,0,0,0,0,0]'::jsonb, 35, 'Hublot', 'Hublot tonneau chronograph with a white skeleton dial and black rubber strap.', '["Black case / White skeleton dial / Black strap"]'::jsonb, 'RSD-WS-178', '[]'::jsonb, 'Men', 'Watches', true, 'Available to order', false),
  ('RSD-WS-180', 'Hublot Tonneau Chronograph — Brown Dial / Brown Strap', 'Wrist Watches', 0, 0, 0, '/products/RSD-WS-180.webp', '[0,0,0,0,0,0,0]'::jsonb, 36, 'Hublot', 'Hublot tonneau chronograph with a brown dial and brown rubber strap.', '["Black case / Brown dial / Brown strap"]'::jsonb, 'RSD-WS-178', '[]'::jsonb, 'Men', 'Watches', true, 'Available to order', false),
  ('RSD-WS-181', 'Hublot Tonneau Chronograph — Grey Dial / Grey Strap', 'Wrist Watches', 0, 0, 0, '/products/RSD-WS-181.webp', '[0,0,0,0,0,0,0]'::jsonb, 37, 'Hublot', 'Hublot tonneau chronograph with a grey dial and grey rubber strap.', '["Black case / Grey dial / Grey strap"]'::jsonb, 'RSD-WS-178', '[]'::jsonb, 'Men', 'Watches', true, 'Available to order', false),
  ('RSD-WS-182', 'Hublot Tonneau Chronograph — Black Case / Blue Strap', 'Wrist Watches', 0, 0, 0, '/products/RSD-WS-182.webp', '[0,0,0,0,0,0,0]'::jsonb, 38, 'Hublot', 'Hublot tonneau chronograph with a black case, dark dial and blue rubber strap.', '["Black case / Black dial / Blue strap"]'::jsonb, 'RSD-WS-178', '[]'::jsonb, 'Men', 'Watches', true, 'Available to order', false),
  ('RSD-WS-183', 'Hublot Tonneau Chronograph — Steel Case / Blue Strap', 'Wrist Watches', 0, 0, 0, '/products/RSD-WS-183.webp', '[0,0,0,0,0,0,0]'::jsonb, 39, 'Hublot', 'Hublot tonneau chronograph with a steel-tone case, dark dial and blue rubber strap.', '["Steel case / Black dial / Blue strap"]'::jsonb, 'RSD-WS-178', '[]'::jsonb, 'Men', 'Watches', true, 'Available to order', false),
  ('RSD-WS-184', 'Hublot Tonneau Chronograph — Steel Case / Brown Strap', 'Wrist Watches', 0, 0, 0, '/products/RSD-WS-184.webp', '[0,0,0,0,0,0,0]'::jsonb, 40, 'Hublot', 'Hublot tonneau chronograph with a steel-tone case, brown dial and brown rubber strap.', '["Steel case / Brown dial / Brown strap"]'::jsonb, 'RSD-WS-178', '[]'::jsonb, 'Men', 'Watches', true, 'Available to order', false),
  ('RSD-WS-185', 'Hublot Tonneau Chronograph — Steel Case / Grey Strap', 'Wrist Watches', 0, 0, 0, '/products/RSD-WS-185.webp', '[0,0,0,0,0,0,0]'::jsonb, 41, 'Hublot', 'Hublot tonneau chronograph with a steel-tone case, grey dial and grey rubber strap.', '["Steel case / Grey dial / Grey strap"]'::jsonb, 'RSD-WS-178', '[]'::jsonb, 'Men', 'Watches', true, 'Available to order', false),
  ('RSD-WS-186', 'Hublot Round Skeleton Chronograph — Black Dial', 'Wrist Watches', 4450, 0, 0, '/products/RSD-WS-186.webp', '[0,0,0,0,0,0,0]'::jsonb, 42, 'Hublot', 'Hublot round skeleton chronograph with a black dial and black rubber strap.', '["Black / Black skeleton dial / Black strap"]'::jsonb, 'RSD-WS-143', '[]'::jsonb, 'Men', 'Watches', true, 'Limited availability', false),
  ('RSD-WS-187', 'Hublot Round Skeleton Chronograph — White Dial', 'Wrist Watches', 4450, 0, 0, '/products/RSD-WS-187.webp', '[0,0,0,0,0,0,0]'::jsonb, 43, 'Hublot', 'Hublot round skeleton chronograph with a white dial and black rubber strap.', '["Steel / White skeleton dial / Black strap"]'::jsonb, 'RSD-WS-143', '[]'::jsonb, 'Men', 'Watches', true, 'Limited availability', false)
on conflict (sku) do update set
  name = excluded.name,
  category = excluded.category,
  image = excluded.image,
  trend = excluded.trend,
  sort_order = excluded.sort_order,
  brand = excluded.brand,
  description = excluded.description,
  colors = excluded.colors,
  variant_group = excluded.variant_group,
  variant_images = excluded.variant_images,
  gender = excluded.gender,
  product_type = excluded.product_type,
  is_new = excluded.is_new,
  availability = excluded.availability,
  is_high_value = excluded.is_high_value,
  updated_at = now();

-- Keep every Chanel colourway at the same customer-facing price.
update public.ht_products
set price = 2100,
    updated_at = now()
where brand = 'Chanel';

-- Audit the five requested collection cards and every attached colour variant.
select sku, name, price, variant_group, colors, variant_images, image
from public.ht_products
where sku in ('RSD-WS-143', 'RSD-WS-147', 'RSD-WS-172', 'RSD-WS-173', 'RSD-WS-174', 'RSD-WS-175', 'RSD-WS-176', 'RSD-WS-177', 'RSD-WS-178', 'RSD-WS-179', 'RSD-WS-180', 'RSD-WS-181', 'RSD-WS-182', 'RSD-WS-183', 'RSD-WS-184', 'RSD-WS-185', 'RSD-WS-186', 'RSD-WS-187')
order by sku;
