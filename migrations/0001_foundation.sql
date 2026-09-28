-- Immutable once released. No domain tables until Phase 1.
BEGIN;
SELECT pg_advisory_xact_lock(73490321);
CREATE SCHEMA IF NOT EXISTS orchestrator;
CREATE TABLE IF NOT EXISTS orchestrator.schema_migrations (
    version bigint PRIMARY KEY,
    name text NOT NULL,
    applied_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO orchestrator.schema_migrations (version, name)
VALUES (1, 'foundation') ON CONFLICT (version) DO NOTHING;
COMMIT;
