-- Application login role for environments where postgres password is unavailable.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rotahub_app') THEN
    CREATE ROLE rotahub_app LOGIN PASSWORD 'RotaHubApp_2026_02_09';
  ELSE
    ALTER ROLE rotahub_app WITH LOGIN PASSWORD 'RotaHubApp_2026_02_09';
  END IF;
END $$;

GRANT CONNECT ON DATABASE postgres TO rotahub_app;
GRANT USAGE ON SCHEMA public TO rotahub_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO rotahub_app;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO rotahub_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO rotahub_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO rotahub_app;
