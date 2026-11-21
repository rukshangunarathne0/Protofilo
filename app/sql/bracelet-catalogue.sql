-- R.S.D. bracelet catalogue additions from the 2026-11-09 upload batch.
--
-- The supplied black-heart rectangular-link photo is a visual match for the
-- existing RSD-OT-140 product and is intentionally not duplicated. The other
-- thirteen photos are distinct bracelet designs, so they remain separate
-- products rather than speculative colour variants.
--
-- Prices were not supplied with the images. New rows therefore use price 0,
-- which the public catalogue renders as "Contact for price" until the retail
-- prices are confirmed in the admin console.

insert into public.ht_products (
  sku, name, category, price, stock, reserved, image, trend, sort_order,
  brand, description, colors, gender, product_type, is_new, availability,
  is_high_value
)
values
  ('RSD-OT-141', 'Gold Circular Emblem Bracelet', 'Others', 0, 0, 0, '/products/RSD-OT-141.webp', '[0,0,0,0,0,0,0]'::jsonb, 9, 'Unbranded', 'Gold-tone bracelet with a circular openwork emblem.', '["Gold"]'::jsonb, 'Women', 'Bracelet', true, 'Available to order', false),
  ('RSD-OT-142', 'Gold Charm Link Bracelet', 'Others', 0, 0, 0, '/products/RSD-OT-142.webp', '[0,0,0,0,0,0,0]'::jsonb, 10, 'Unbranded', 'Fine gold-tone chain bracelet with decorative charm details.', '["Gold"]'::jsonb, 'Women', 'Bracelet', true, 'Available to order', false),
  ('RSD-OT-143', 'Gold Rectangular Link Bracelet', 'Others', 0, 0, 0, '/products/RSD-OT-143.webp', '[0,0,0,0,0,0,0]'::jsonb, 11, 'Unbranded', 'Gold-tone bracelet with elongated rectangular links.', '["Gold"]'::jsonb, 'Women', 'Bracelet', true, 'Available to order', false),
  ('RSD-OT-144', 'Gold Scale Link Bracelet', 'Others', 0, 0, 0, '/products/RSD-OT-144.webp', '[0,0,0,0,0,0,0]'::jsonb, 12, 'Unbranded', 'Gold-tone bracelet with a textured overlapping-link finish.', '["Gold"]'::jsonb, 'Women', 'Bracelet', true, 'Available to order', false),
  ('RSD-OT-145', 'Gold Heart Charm Bracelet', 'Others', 0, 0, 0, '/products/RSD-OT-145.webp', '[0,0,0,0,0,0,0]'::jsonb, 13, 'Unbranded', 'Fine gold-tone bracelet with a heart charm.', '["Gold"]'::jsonb, 'Women', 'Bracelet', true, 'Available to order', false),
  ('RSD-OT-146', 'Gold Heart and Pearl Link Bracelet', 'Others', 0, 0, 0, '/products/RSD-OT-146.webp', '[0,0,0,0,0,0,0]'::jsonb, 14, 'Unbranded', 'Layered gold-tone bracelet with heart and pearl accents.', '["Gold","White"]'::jsonb, 'Women', 'Bracelet', true, 'Available to order', false),
  ('RSD-OT-147', 'Gold Clover Charm Bracelet', 'Others', 0, 0, 0, '/products/RSD-OT-147.webp', '[0,0,0,0,0,0,0]'::jsonb, 15, 'Unbranded', 'Gold-tone bracelet with repeating clover charms and clear accents.', '["Gold","White"]'::jsonb, 'Women', 'Bracelet', true, 'Available to order', false),
  ('RSD-OT-148', 'Gold Black Medallion Bracelet', 'Others', 0, 0, 0, '/products/RSD-OT-148.webp', '[0,0,0,0,0,0,0]'::jsonb, 16, 'Unbranded', 'Gold-tone link bracelet with a black medallion and blue accent.', '["Gold","Black","Blue"]'::jsonb, 'Women', 'Bracelet', true, 'Available to order', false),
  ('RSD-OT-149', 'Gold Mesh Bracelet', 'Others', 0, 0, 0, '/products/RSD-OT-149.webp', '[0,0,0,0,0,0,0]'::jsonb, 17, 'Unbranded', 'Minimal gold-tone mesh bracelet with an adjustable chain.', '["Gold"]'::jsonb, 'Women', 'Bracelet', true, 'Available to order', false),
  ('RSD-OT-150', 'Gold Black Glitter Bracelet', 'Others', 0, 0, 0, '/products/RSD-OT-150.webp', '[0,0,0,0,0,0,0]'::jsonb, 18, 'Unbranded', 'Gold-tone bracelet with a black glitter centre and braided edges.', '["Gold","Black"]'::jsonb, 'Women', 'Bracelet', true, 'Available to order', false),
  ('RSD-OT-151', 'Gold Greek Key Bracelet', 'Others', 0, 0, 0, '/products/RSD-OT-151.webp', '[0,0,0,0,0,0,0]'::jsonb, 19, 'Unbranded', 'Gold-tone braided bracelet with a Greek key centrepiece.', '["Gold"]'::jsonb, 'Women', 'Bracelet', true, 'Available to order', false),
  ('RSD-OT-152', 'Gold Floral Charm Bracelet', 'Others', 0, 0, 0, '/products/RSD-OT-152.webp', '[0,0,0,0,0,0,0]'::jsonb, 20, 'Unbranded', 'Gold-tone bracelet with repeating floral charms.', '["Gold"]'::jsonb, 'Women', 'Bracelet', true, 'Available to order', false),
  ('RSD-OT-153', 'Gold Triple Heart Bracelet', 'Others', 0, 0, 0, '/products/RSD-OT-153.webp', '[0,0,0,0,0,0,0]'::jsonb, 21, 'Unbranded', 'Gold-tone layered bracelet with three heart charms.', '["Gold"]'::jsonb, 'Women', 'Bracelet', true, 'Available to order', false)
on conflict (sku) do nothing;

select sku, name, price, image, category, product_type, is_new
from public.ht_products
where sku between 'RSD-OT-141' and 'RSD-OT-153'
order by sku;
