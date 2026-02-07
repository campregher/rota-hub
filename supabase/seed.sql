-- RotaHub MVP seed
-- password hash below corresponds to plaintext: password

insert into users (id, email, password_hash, role, status, full_name)
values
  ('11111111-1111-1111-1111-111111111111', 'seller@rotahub.dev', '$2b$10$AFEsVOI9EIwJ/7itsEhuCeY7uLkW5pwWn4AklSSnEEhkAdm1Sa0GC', 'SELLER', 'ACTIVE', 'Seller Demo'),
  ('22222222-2222-2222-2222-222222222222', 'courier1@rotahub.dev', '$2b$10$AFEsVOI9EIwJ/7itsEhuCeY7uLkW5pwWn4AklSSnEEhkAdm1Sa0GC', 'COURIER', 'ACTIVE', 'Courier One'),
  ('33333333-3333-3333-3333-333333333333', 'courier2@rotahub.dev', '$2b$10$AFEsVOI9EIwJ/7itsEhuCeY7uLkW5pwWn4AklSSnEEhkAdm1Sa0GC', 'COURIER', 'ACTIVE', 'Courier Two')
on conflict (id) do update set
  email = excluded.email,
  password_hash = excluded.password_hash,
  role = excluded.role,
  status = excluded.status,
  full_name = excluded.full_name;

insert into seller_profiles (id, user_id, store_name, document)
values
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Loja Demo', '12.345.678/0001-00')
on conflict (id) do nothing;

insert into courier_profiles (id, user_id, vehicle_type, doc_status, rating)
values
  ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'MOTORBIKE', 'APPROVED', 4.80),
  ('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'BIKE', 'APPROVED', 4.60)
on conflict (id) do nothing;

insert into addresses (id, label, street, number, district, city, state, postal_code, country, lat, lng)
values
  ('77777777-7777-7777-7777-777777777777', 'Pickup Centro', 'Rua A', '100', 'Centro', 'Sao Paulo', 'SP', '01000-000', 'BR', -23.5505200, -46.6333080),
  ('88888888-8888-8888-8888-888888888888', 'Entrega Vila', 'Rua B', '200', 'Vila Mariana', 'Sao Paulo', 'SP', '04101-000', 'BR', -23.5890000, -46.6350000)
on conflict (id) do nothing;

insert into orders (id, seller_id, marketplace, marketplace_order_id, status, total_cents, raw_payload)
values
  ('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', 'MERCADO_LIVRE', 'MLB-ORDER-0001', 'READY_TO_SHIP', 12990, '{"channel":"mercadolivre","note":"seed"}'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'SHOPEE', 'SHP-ORDER-0001', 'READY_TO_SHIP', 8990, '{"channel":"shopee","note":"seed"}')
on conflict (marketplace, marketplace_order_id) do nothing;

insert into delivery_jobs (id, seller_id, order_id, pickup_address_id, dropoff_address_id, status, expires_at, price_cents, notes)
values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', '77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888', 'OPEN', now() + interval '4 hours', 1800, 'Entregar com cuidado'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888', 'OPEN', now() + interval '6 hours', 2200, 'Cliente prefere contato no local')
on conflict (id) do nothing;

insert into tracking_events (job_id, event_type, from_status, to_status, payload)
values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'JOB_CREATED', null, 'OPEN', '{"source":"seed"}'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'JOB_CREATED', null, 'OPEN', '{"source":"seed"}');
