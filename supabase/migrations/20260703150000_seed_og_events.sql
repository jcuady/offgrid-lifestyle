-- Seed default storefront events when the CMS table is empty.
INSERT INTO public.og_events (
  id, title, subtitle, event_date, event_time, location, address, description,
  image, category, status, featured, price, capacity, registered, highlights, sort_order
)
SELECT * FROM (VALUES
  (
    'ev-1',
    'OffGrid Pickleball Open',
    'Dink Different Championship Series',
    '15 Jun',
    '9:00 AM - 7:00 PM',
    'BGC Arena',
    'Taguig, Metro Manila',
    'A full-day competitive and community-focused pickleball event featuring beginner to advanced brackets, exhibition matches, and product activations from OffGrid Lifestyle.',
    '/images/event_barako.png',
    'tournament',
    'upcoming',
    true,
    '₱1,200',
    180,
    126,
    '["Beginner, intermediate, and advanced brackets","Official OffGrid athlete exhibition matches","Live customization booth and merch drop","On-site coaching corners and skills clinic"]'::jsonb,
    0
  ),
  (
    'ev-2',
    'City Lights Night Rally',
    'Community Play Under The Lights',
    '28 Jun',
    '6:00 PM - 10:00 PM',
    'Makati Sports Hub',
    'Makati, Metro Manila',
    'An open-play evening designed to connect players, teams, and creators in a relaxed but energetic atmosphere.',
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1800&auto=format&fit=crop',
    'community',
    'upcoming',
    false,
    'Free',
    120,
    84,
    '["Open-play courts for all levels","Community mixer and partner matching","OffGrid giveaway and photo wall"]'::jsonb,
    1
  ),
  (
    'ev-3',
    'OG Pilipinas Capsule Launch',
    'Culture, Craft, And Court',
    '09 Jul',
    '2:00 PM - 8:00 PM',
    'The Fifth At Rockwell',
    'Mandaluyong, Metro Manila',
    'Exclusive launch of the latest OG Pilipinas capsule featuring limited pieces, athlete appearances, and a behind-the-design showcase.',
    'https://images.unsplash.com/photo-1522199710521-72d69614c702?q=80&w=1800&auto=format&fit=crop',
    'launch',
    'upcoming',
    false,
    'Invite',
    NULL,
    NULL,
    '["First access to limited capsule pieces","Design walkthrough from OffGrid creatives","Athlete signing and fan sessions"]'::jsonb,
    2
  ),
  (
    'ev-4',
    'Performance Fabric Workshop',
    'Fit, Material, And Movement',
    '20 May',
    '1:00 PM - 4:00 PM',
    'OffGrid Studio',
    'Quezon City, Metro Manila',
    'Hands-on workshop on selecting the right fabric, cut, and print combination for teams and clubs.',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1800&auto=format&fit=crop',
    'workshop',
    'past',
    false,
    '₱850',
    NULL,
    NULL,
    '["Material and durability demos","Sizing and fit optimization session","Printing method comparison"]'::jsonb,
    3
  )
) AS seed (
  id, title, subtitle, event_date, event_time, location, address, description,
  image, category, status, featured, price, capacity, registered, highlights, sort_order
)
WHERE NOT EXISTS (SELECT 1 FROM public.og_events LIMIT 1);
