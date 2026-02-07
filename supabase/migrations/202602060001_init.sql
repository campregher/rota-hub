-- RotaHub MVP initial schema (Supabase/Postgres)
create extension if not exists pgcrypto;

-- Enums
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('SELLER', 'COURIER', 'ADMIN'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE user_status AS ENUM ('ACTIVE', 'DISABLED', 'PENDING'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE marketplace AS ENUM ('MERCADO_LIVRE', 'SHOPEE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE connection_status AS ENUM ('PENDING', 'CONNECTED', 'DISCONNECTED', 'ERROR'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE order_status_normalized AS ENUM ('NEW', 'READY_TO_SHIP', 'IN_DELIVERY', 'DELIVERED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE vehicle_type AS ENUM ('BIKE', 'MOTORBIKE', 'CAR', 'VAN'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE doc_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE job_status AS ENUM ('OPEN', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'DISPUTE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE tracking_event_type AS ENUM ('JOB_CREATED', 'JOB_ACCEPTED', 'STATUS_CHANGED', 'POD_UPLOADED', 'JOB_CANCELLED', 'JOB_DISPUTE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE payout_status AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Timestamp trigger helper
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  role user_role not null,
  status user_status not null default 'ACTIVE',
  full_name text not null,
  refresh_token_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists seller_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  store_name text,
  document text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists courier_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  vehicle_type vehicle_type not null default 'MOTORBIKE',
  doc_status doc_status not null default 'PENDING',
  rating numeric(3,2) not null default 5.00,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  label text,
  street text not null,
  number text,
  district text,
  city text not null,
  state text not null,
  postal_code text,
  country text not null default 'BR',
  lat numeric(10,7),
  lng numeric(10,7),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists marketplace_connections (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references users(id) on delete cascade,
  marketplace marketplace not null,
  status connection_status not null default 'PENDING',
  external_seller_id text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (seller_id, marketplace)
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references users(id) on delete cascade,
  marketplace marketplace not null,
  marketplace_order_id text not null,
  status order_status_normalized not null default 'NEW',
  total_cents integer,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (marketplace, marketplace_order_id)
);

create table if not exists delivery_jobs (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references users(id) on delete cascade,
  order_id uuid references orders(id) on delete set null,
  pickup_address_id uuid not null references addresses(id),
  dropoff_address_id uuid not null references addresses(id),
  status job_status not null default 'OPEN',
  expires_at timestamptz,
  price_cents integer,
  notes text,
  assigned_courier_id uuid references users(id) on delete set null,
  assigned_at timestamptz,
  picked_up_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists job_assignments (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null unique references delivery_jobs(id) on delete cascade,
  courier_id uuid not null references users(id) on delete cascade,
  accepted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists tracking_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references delivery_jobs(id) on delete cascade,
  event_type tracking_event_type not null,
  from_status job_status,
  to_status job_status,
  actor_user_id uuid references users(id) on delete set null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists proof_of_delivery (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null unique references delivery_jobs(id) on delete cascade,
  photo_url text,
  receiver_name text not null,
  lat numeric(10,7),
  lng numeric(10,7),
  delivered_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists payouts (
  id uuid primary key default gen_random_uuid(),
  courier_id uuid not null references users(id) on delete cascade,
  job_id uuid references delivery_jobs(id) on delete set null,
  amount_cents integer not null,
  status payout_status not null default 'PENDING',
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_delivery_jobs_status on delivery_jobs(status);
create index if not exists idx_delivery_jobs_expires_at on delivery_jobs(expires_at);
create index if not exists idx_delivery_jobs_created_at on delivery_jobs(created_at);
create index if not exists idx_tracking_events_job_id_created_at on tracking_events(job_id, created_at);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_created_at on orders(created_at);
create index if not exists idx_payouts_status on payouts(status);
create index if not exists idx_marketplace_connections_status on marketplace_connections(status);

-- updated_at triggers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_users_updated_at') THEN
    CREATE TRIGGER set_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_seller_profiles_updated_at') THEN
    CREATE TRIGGER set_seller_profiles_updated_at BEFORE UPDATE ON seller_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_courier_profiles_updated_at') THEN
    CREATE TRIGGER set_courier_profiles_updated_at BEFORE UPDATE ON courier_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_addresses_updated_at') THEN
    CREATE TRIGGER set_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_marketplace_connections_updated_at') THEN
    CREATE TRIGGER set_marketplace_connections_updated_at BEFORE UPDATE ON marketplace_connections FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_orders_updated_at') THEN
    CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_delivery_jobs_updated_at') THEN
    CREATE TRIGGER set_delivery_jobs_updated_at BEFORE UPDATE ON delivery_jobs FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_payouts_updated_at') THEN
    CREATE TRIGGER set_payouts_updated_at BEFORE UPDATE ON payouts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

-- RLS MVP: disabled (production should enable with policies)
alter table users disable row level security;
alter table seller_profiles disable row level security;
alter table courier_profiles disable row level security;
alter table addresses disable row level security;
alter table marketplace_connections disable row level security;
alter table orders disable row level security;
alter table delivery_jobs disable row level security;
alter table job_assignments disable row level security;
alter table tracking_events disable row level security;
alter table proof_of_delivery disable row level security;
alter table payouts disable row level security;