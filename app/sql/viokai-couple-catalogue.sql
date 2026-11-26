-- Public catalogue rows for the VIOKAI men's and women's colour family.
-- Supplier cost is intentionally not stored here. The public price is LKR 3,560
-- per watch; the couple-set offer is presented in the storefront at LKR 6,620.

insert into public.ht_products (
  sku, name, category, price, stock, reserved, image, brand, description,
  colors, variant_group, variant_images, trend, sort_order, gender,
  product_type, is_new, availability
)
values
(
  'RSD-WS-188',
  'VIOKAI Men''s Date Watch',
  'Wrist Watches',
  3560,
  0,
  0,
  '/products/RSD-WS-188-gold.webp',
  'VIOKAI',
  'A bracelet watch with a fluted bezel, date window and colour options. Presentation box and bracelet-adjustment tool included as shown.',
  '["Gold", "Green", "Silver", "Blue"]'::jsonb,
  'RSD-WS-188',
  '[{"sku":"RSD-WS-188","color":"Gold","image":"/products/RSD-WS-188-gold.webp"},{"sku":"RSD-WS-188","color":"Green","image":"/products/RSD-WS-188-green.webp"},{"sku":"RSD-WS-188","color":"Silver","image":"/products/RSD-WS-188-silver.webp"},{"sku":"RSD-WS-188","color":"Blue","image":"/products/RSD-WS-188-blue.webp"}]'::jsonb,
  '[0,0,0,0,0,0,0]'::jsonb,
  188,
  'Men',
  'Watches',
  true,
  'Available to order'
),
(
  'RSD-WS-189',
  'VIOKAI Women''s Date Watch',
  'Wrist Watches',
  3560,
  0,
  0,
  '/products/RSD-WS-189-gold.webp',
  'VIOKAI',
  'A bracelet watch with a fluted bezel, date window and colour options. Presentation box and bracelet-adjustment tool included as shown.',
  '["Gold", "Green", "Silver", "Blue"]'::jsonb,
  'RSD-WS-189',
  '[{"sku":"RSD-WS-189","color":"Gold","image":"/products/RSD-WS-189-gold.webp"},{"sku":"RSD-WS-189","color":"Green","image":"/products/RSD-WS-189-green.webp"},{"sku":"RSD-WS-189","color":"Silver","image":"/products/RSD-WS-189-silver.webp"},{"sku":"RSD-WS-189","color":"Blue","image":"/products/RSD-WS-189-blue.webp"}]'::jsonb,
  '[0,0,0,0,0,0,0]'::jsonb,
  189,
  'Women',
  'Watches',
  true,
  'Available to order'
)
on conflict (sku) do update set
  name = excluded.name,
  category = excluded.category,
  price = excluded.price,
  image = excluded.image,
  brand = excluded.brand,
  description = excluded.description,
  colors = excluded.colors,
  variant_group = excluded.variant_group,
  variant_images = excluded.variant_images,
  sort_order = excluded.sort_order,
  gender = excluded.gender,
  product_type = excluded.product_type,
  is_new = excluded.is_new,
  availability = excluded.availability,
  updated_at = now();
