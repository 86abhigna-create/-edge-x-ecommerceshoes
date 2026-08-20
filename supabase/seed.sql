-- Seed data for categories
INSERT INTO public.categories (name, slug, description, sort_order) VALUES
('All Shoes', 'all-shoes', 'All shoe categories', 0),
('Sneakers', 'sneakers', 'Modern sneakers for everyday wear', 1),
('Streetwear Sneakers', 'streetwear-sneakers', 'Bold streetwear-inspired sneakers', 2),
('High-Top Shoes', 'high-top-shoes', 'High-top ankle support shoes', 3),
('Low-Top Shoes', 'low-top-shoes', 'Low-top casual shoes', 4),
('Casual Shoes', 'casual-shoes', 'Comfortable casual footwear', 5),
('Fashion Shoes', 'fashion-shoes', 'Trendy fashion-forward shoes', 6),
('Sports-Inspired Shoes', 'sports-inspired-shoes', 'Athletic-inspired lifestyle shoes', 7),
('Limited-Edition Shoes', 'limited-edition-shoes', 'Exclusive limited edition releases', 8),
('New-Release Shoe', 'new-release-shoe', 'Latest shoe releases', 9)
ON CONFLICT (slug) DO NOTHING;

-- Seed data for products
INSERT INTO public.products (slug, name, tagline, badge, price, discount_percent, category_id, description, materials, colorway, colors, sizes, in_stock, stock_count, published, featured) 
SELECT 
  p.slug, p.name, p.tagline, p.badge, p.price, p.discount_percent, c.id, p.description, p.materials, p.colorway, p.colors, p.sizes, p.in_stock, p.stock_count, p.published, p.featured
FROM (VALUES
  ('apex-vol-1', 'Apex Vol. 1', 'Architectural mastery in pristine white', 'New', 24000, 0, 'new-release-shoe', 
   'The Apex Vol. 1 is an architectural masterpiece featuring pristine white premium leather, precise multi-panel construction, and a chunky shock-absorbing rubber outsole engineered for the concrete landscape.',
   ARRAY['Full-grain Italian Calfskin', 'Ballistic Mesh Lining', 'Vibram Traction Outsole'],
   'Optic White / Off-White', ARRAY['Black', 'White'], ARRAY['US 8', 'US 9', 'US 10', 'US 11'], true, 56, true, true),
  ('strata-void', 'Strata Void', 'Nocturnal velocity in monochromatic black', 'Limited', 19500, 0, 'limited-edition-shoes',
   'Designed for nocturnal velocity, the Strata Void combines sleek monochromatic black mesh with hyper-reflective silver metallic overlays and ultra-responsive foam cushioning.',
   ARRAY['Engineered Speed Mesh', '3M Reflective Overlays', 'Carbon Composite Shank'],
   'Void Black / Metallic Silver', ARRAY['Black', 'Silver'], ARRAY['US 8', 'US 9', 'US 10', 'US 11'], true, 42, true, true),
  ('titan-shift', 'Titan Shift', 'Brutalist grey meets electric blue', null, 28000, 0, 'sports-inspired-shoes',
   'Sports-inspired engineering at its finest. The Titan Shift merges industrial grey suede panels with electric blue technical webbing and an exaggerated tread pattern for maximum ground grip.',
   ARRAY['Brushed Italian Suede', 'Technical Nylon Webbing', 'Dual-Density EVA Midsole'],
   'Industrial Grey / Electric Blue', ARRAY['Grey', 'Electric Blue'], ARRAY['US 8.5', 'US 9', 'US 10', 'US 11'], true, 35, true, false),
  ('core-minimal', 'Core Minimal', 'Refined restraint in white nappa', null, 16000, 0, 'low-top-shoes',
   'The epitome of refined restraint. Handcrafted from buttery soft white nappa leather with contrast navy heel tab and clean tonal stitching.',
   ARRAY['Nappa Leather Upper', 'Waxed Cotton Laces', 'Natural Rubber Cupsole'],
   'White / Navy', ARRAY['White', 'Navy'], ARRAY['US 8', 'US 9', 'US 10', 'US 11'], true, 40, true, false),
  ('concrete-spec-x', 'Concrete Spec X', 'Raw industrial flagship silhouette', 'Limited', 31000, 0, 'high-top-shoes',
   'The flagship silhouette of the Concrete Edit. Featuring raw industrial textures, asymmetric lacing, and reinforced heel cages.',
   ARRAY['Concrete-Dyed Nubuck', 'Kevlar Reinforced Mesh', 'Custom Molded TPU Outsole'],
   'Slate Concrete / Acid Lime', ARRAY['Slate Concrete', 'Acid Lime'], ARRAY['US 8', 'US 9', 'US 10', 'US 11'], true, 22, true, true),
  ('obsidian-prime', 'Obsidian Prime', 'Pure stealth in obsidian black', 'New', 1399900, 0, 'sneakers',
   'Pure stealth. Deep obsidian tones coupled with weather-resistant matte synthetics for all-conditions urban utility.',
   ARRAY['Weatherproof Ripstop', 'Matte Rubberized Leather', 'Zoom Air Cushioning'],
   'Obsidian Black', ARRAY['Black', 'Matte Charcoal'], ARRAY['US 8', 'US 9', 'US 10', 'US 11'], true, 30, true, false),
  ('metro-glide', 'Metro Glide', 'Engineered for daily commute', null, 1199900, 0, 'streetwear-sneakers',
   'Engineered for the daily commute and underground nightlife. Sleek profile with reinforced leather paneling.',
   ARRAY['Full-Grain Leather', 'Air-Cooled Mesh'],
   'Bone / Slate', ARRAY['Bone', 'Slate'], ARRAY['US 8', 'US 9', 'US 10', 'US 11'], true, 28, true, false),
  ('chrono-casual', 'Chrono Casual', 'Effortless relaxed styling', null, 899900, 0, 'casual-shoes',
   'Effortless relaxed styling with architectural precision. Perfect for weekend gallery hops and lounge wear.',
   ARRAY['Washed Canvas', 'Memory Foam Insole'],
   'Olive / Canvas', ARRAY['Olive', 'Canvas'], ARRAY['US 8', 'US 9', 'US 10', 'US 11'], true, 32, true, false),
  ('avant-garde-one', 'Avant Garde One', 'Runway piece for concrete streets', 'Limited', 2199900, 0, 'fashion-shoes',
   'A runway piece brought to the concrete streets. Features sculptural lines, artisanal leather treatment, and hand-stitched detailing.',
   ARRAY['Vachetta Leather', 'Hand-Waxed Finish'],
   'Midnight Burgundy', ARRAY['Burgundy', 'Black'], ARRAY['US 8', 'US 9', 'US 10', 'US 11'], true, 18, true, true)
) AS p(slug, name, tagline, badge, price, discount_percent, category_slug, description, materials, colorway, colors, sizes, in_stock, stock_count, published, featured)
JOIN public.categories c ON c.slug = p.category_slug
ON CONFLICT (slug) DO NOTHING;

-- Seed product variants
INSERT INTO public.product_variants (product_id, color, size, stock)
SELECT p.id, v.color, v.size, v.stock
FROM public.products p
CROSS JOIN LATERAL (
  VALUES
    -- Apex Vol. 1
    ('apex-vol-1', 'Black', 'US 8', 10),
    ('apex-vol-1', 'Black', 'US 9', 15),
    ('apex-vol-1', 'Black', 'US 10', 3),
    ('apex-vol-1', 'Black', 'US 11', 0),
    ('apex-vol-1', 'White', 'US 8', 8),
    ('apex-vol-1', 'White', 'US 9', 12),
    ('apex-vol-1', 'White', 'US 10', 6),
    ('apex-vol-1', 'White', 'US 11', 2),
    -- Strata Void
    ('strata-void', 'Black', 'US 8', 12),
    ('strata-void', 'Black', 'US 9', 10),
    ('strata-void', 'Black', 'US 10', 2),
    ('strata-void', 'Black', 'US 11', 0),
    ('strata-void', 'Silver', 'US 8', 9),
    ('strata-void', 'Silver', 'US 9', 7),
    ('strata-void', 'Silver', 'US 10', 2),
    ('strata-void', 'Silver', 'US 11', 0),
    -- Titan Shift
    ('titan-shift', 'Grey', 'US 8.5', 8),
    ('titan-shift', 'Grey', 'US 9', 12),
    ('titan-shift', 'Grey', 'US 10', 3),
    ('titan-shift', 'Grey', 'US 11', 0),
    ('titan-shift', 'Electric Blue', 'US 8.5', 5),
    ('titan-shift', 'Electric Blue', 'US 9', 6),
    ('titan-shift', 'Electric Blue', 'US 10', 1),
    ('titan-shift', 'Electric Blue', 'US 11', 0),
    -- Core Minimal
    ('core-minimal', 'White', 'US 8', 10),
    ('core-minimal', 'White', 'US 9', 14),
    ('core-minimal', 'White', 'US 10', 2),
    ('core-minimal', 'White', 'US 11', 0),
    ('core-minimal', 'Navy', 'US 8', 7),
    ('core-minimal', 'Navy', 'US 9', 5),
    ('core-minimal', 'Navy', 'US 10', 2),
    ('core-minimal', 'Navy', 'US 11', 0),
    -- Concrete Spec X
    ('concrete-spec-x', 'Slate Concrete', 'US 8', 6),
    ('concrete-spec-x', 'Slate Concrete', 'US 9', 8),
    ('concrete-spec-x', 'Slate Concrete', 'US 10', 2),
    ('concrete-spec-x', 'Slate Concrete', 'US 11', 0),
    ('concrete-spec-x', 'Acid Lime', 'US 8', 3),
    ('concrete-spec-x', 'Acid Lime', 'US 9', 3),
    ('concrete-spec-x', 'Acid Lime', 'US 10', 0),
    ('concrete-spec-x', 'Acid Lime', 'US 11', 0),
    -- Obsidian Prime
    ('obsidian-prime', 'Black', 'US 8', 8),
    ('obsidian-prime', 'Black', 'US 9', 10),
    ('obsidian-prime', 'Black', 'US 10', 2),
    ('obsidian-prime', 'Black', 'US 11', 0),
    ('obsidian-prime', 'Matte Charcoal', 'US 8', 5),
    ('obsidian-prime', 'Matte Charcoal', 'US 9', 4),
    ('obsidian-prime', 'Matte Charcoal', 'US 10', 1),
    ('obsidian-prime', 'Matte Charcoal', 'US 11', 0),
    -- Metro Glide
    ('metro-glide', 'Bone', 'US 8', 6),
    ('metro-glide', 'Bone', 'US 9', 9),
    ('metro-glide', 'Bone', 'US 10', 3),
    ('metro-glide', 'Bone', 'US 11', 0),
    ('metro-glide', 'Slate', 'US 8', 5),
    ('metro-glide', 'Slate', 'US 9', 4),
    ('metro-glide', 'Slate', 'US 10', 1),
    ('metro-glide', 'Slate', 'US 11', 0),
    -- Chrono Casual
    ('chrono-casual', 'Olive', 'US 8', 7),
    ('chrono-casual', 'Olive', 'US 9', 11),
    ('chrono-casual', 'Olive', 'US 10', 2),
    ('chrono-casual', 'Olive', 'US 11', 0),
    ('chrono-casual', 'Canvas', 'US 8', 6),
    ('chrono-casual', 'Canvas', 'US 9', 5),
    ('chrono-casual', 'Canvas', 'US 10', 1),
    ('chrono-casual', 'Canvas', 'US 11', 0),
    -- Avant Garde One
    ('avant-garde-one', 'Burgundy', 'US 8', 4),
    ('avant-garde-one', 'Burgundy', 'US 9', 6),
    ('avant-garde-one', 'Burgundy', 'US 10', 1),
    ('avant-garde-one', 'Burgundy', 'US 11', 0),
    ('avant-garde-one', 'Black', 'US 8', 3),
    ('avant-garde-one', 'Black', 'US 9', 3),
    ('avant-garde-one', 'Black', 'US 10', 1),
    ('avant-garde-one', 'Black', 'US 11', 0)
) AS v(slug, color, size, stock)
WHERE p.slug = v.slug
ON CONFLICT (product_id, color, size) DO NOTHING;

-- Seed settings
INSERT INTO public.settings (key, value, description) VALUES
('site_name', '"Edge-X"', 'Site name'),
('site_description', '"Premium footwear for the modern urbanite"', 'Site description'),
('currency', '"USD"', 'Default currency'),
('tax_rate', '0.08', 'Tax rate (8%)'),
('shipping_rate', '15.00', 'Standard shipping rate'),
('free_shipping_threshold', '100.00', 'Free shipping threshold')
ON CONFLICT (key) DO NOTHING;

-- Seed coupons
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, valid_from, valid_until, is_active) VALUES
('WELCOME10', 'Welcome 10% off first order', 'percentage', 10, 5000, 5000, 1000, NOW(), NOW() + INTERVAL '1 year', true),
('SAVE20', 'Save $20 on orders over $150', 'fixed', 2000, 15000, 2000, 500, NOW(), NOW() + INTERVAL '6 months', true),
('FREESHIP', 'Free shipping on any order', 'fixed', 1500, 0, 1500, 2000, NOW(), NOW() + INTERVAL '3 months', true)
ON CONFLICT (code) DO NOTHING;

-- Function to increment coupon usage
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.coupons
  SET usage_count = usage_count + 1
  WHERE id = coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;