-- VIOKAI men's watch with five supplied colourway images.
-- Customer price: LKR 3,520. Stock remains 0 until inventory is confirmed.
-- Supplier cost is intentionally not stored or exposed.

insert into public.ht_products (
  sku, name, category, price, stock, reserved, image, brand, description,
  colors, variant_group, variant_images, trend, sort_order, gender,
  product_type, is_new, availability
)
values (
  'RSD-WS-Y32NH3',
  'VIOKAI Men''s Watch',
  'Wrist Watches',
  3520,
  0,
  0,
  '/products/viokai-watch-two-tone-gold.png',
  'VIOKAI',
  'A VIOKAI bracelet watch in five colourways: two-tone Gold, Green, Silver, Blue, and Black. Presented in the branded box shown.',
  '["Gold", "Green", "Silver", "Blue", "Black"]'::jsonb,
  'RSD-WS-Y32NH3',
  '[{"sku":"RSD-WS-Y32NH3","color":"Gold","image":"/products/viokai-watch-two-tone-gold.png"},{"sku":"RSD-WS-Y32NH3","color":"Green","image":"/products/viokai-watch-silver-green.png"},{"sku":"RSD-WS-Y32NH3","color":"Silver","image":"/products/viokai-watch-silver-white.png"},{"sku":"RSD-WS-Y32NH3","color":"Blue","image":"/products/viokai-watch-silver-blue.png"},{"sku":"RSD-WS-Y32NH3","color":"Black","image":"/products/viokai-watch-silver-black.png"}]'::jsonb,
  '[0,0,0,0,0,0,0]'::jsonb,
  0,
  'Men',
  'Watches',
  true,
  'Coming soon'
);
