# Changelog

## 0.1.0 — 2026-09-28

### Added
- Phase 0: Go Controller, versioned process liveness и structured logs.
- React/TypeScript Dashboard с реальной проверкой доступности API.
- PostgreSQL dev-стенд, baseline SQL migration, Docker Compose, Makefile и CI.
- AGENTS.md, архитектура, ADR, roadmap и инструкции демонстрации.

### Known limitations
- Нет node management, Agent, gRPC, VPN/transport providers или deployment engine.
- Controller пока не использует PostgreSQL; health означает только liveness.
- Нет пользовательской аутентификации; только локальная dev-среда.
- Build/test, Docker stack, повтор миграции и browser smoke проверены локально.
- Чистый clone первого commit `eee3925`: Go/frontend build и tests прошли.
- GitHub Actions для `8c73572` прошёл: Go race tests, frontend, Docker и миграции.
- Milestone опубликован в `MarkBobrov309/debilka`, annotated tag `v0.1.0`.
