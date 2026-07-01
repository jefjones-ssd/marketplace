-- Phase 1 foundation schema: profiles, listings, listing_images, messages, reviews, reports
-- RLS is enabled on all tables here; policies are added in a later migration.

create extension if not exists pgcrypto;

-- ------------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users (id),
  display_name text not null,
  suburb text not null check (
    suburb in (
      'Muizenberg',
      'Kalk Bay',
      'St James',
      'Fish Hoek',
      'Simon''s Town',
      'Noordhoek',
      'Kommetjie',
      'Glencairn',
      'Lakeside',
      'Marina da Gama'
    )
  ),
  verification_status text not null default 'unverified' check (
    verification_status in ('unverified', 'pending', 'verified', 'rejected')
  ),
  rating_average numeric default 0,
  rating_count integer default 0,
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

-- ------------------------------------------------------------------
-- listings
-- ------------------------------------------------------------------
create table listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references profiles (id),
  title text not null,
  description text,
  price numeric not null,
  category text not null check (
    category in (
      'Electronics',
      'Furniture',
      'Clothing',
      'Vehicles',
      'Garden',
      'Sports',
      'Books',
      'Other'
    )
  ),
  condition text not null check (
    condition in ('New', 'Like New', 'Good', 'Fair', 'Poor')
  ),
  -- must match profiles suburb list
  suburb text not null check (
    suburb in (
      'Muizenberg',
      'Kalk Bay',
      'St James',
      'Fish Hoek',
      'Simon''s Town',
      'Noordhoek',
      'Kommetjie',
      'Glencairn',
      'Lakeside',
      'Marina da Gama'
    )
  ),
  lat numeric,
  lng numeric,
  status text not null default 'active' check (
    status in ('active', 'sold', 'removed')
  ),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table listings enable row level security;

-- ------------------------------------------------------------------
-- listing_images
-- ------------------------------------------------------------------
create table listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings (id) on delete cascade,
  storage_path text not null,
  display_order integer default 0
);

alter table listing_images enable row level security;

-- ------------------------------------------------------------------
-- messages
-- ------------------------------------------------------------------
create table messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references profiles (id),
  recipient_id uuid references profiles (id),
  listing_id uuid references listings (id),
  body text not null,
  created_at timestamptz default now(),
  read_at timestamptz
);

alter table messages enable row level security;

-- ------------------------------------------------------------------
-- reviews
-- ------------------------------------------------------------------
create table reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid references profiles (id),
  reviewed_id uuid references profiles (id),
  listing_id uuid references listings (id),
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

alter table reviews enable row level security;

-- ------------------------------------------------------------------
-- reports
-- ------------------------------------------------------------------
create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references profiles (id),
  listing_id uuid references listings (id),
  user_id uuid references profiles (id),
  reason text not null,
  status text not null default 'open' check (
    status in ('open', 'reviewed', 'resolved')
  ),
  created_at timestamptz default now(),
  check (listing_id is not null or user_id is not null)
);

alter table reports enable row level security;

-- ------------------------------------------------------------------
-- updated_at trigger
-- ------------------------------------------------------------------
create function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on profiles
  for each row
  execute function set_updated_at();

create trigger set_listings_updated_at
  before update on listings
  for each row
  execute function set_updated_at();
