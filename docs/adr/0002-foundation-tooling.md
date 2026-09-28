# ADR 0002: Минимальные инструменты foundation

Status: Accepted · 2026-09-28

## Context
Пустой репозиторий должен стать собираемым и проверяемым без реализации всех
будущих подсистем и без раннего выбора крупных framework.

## Decision
Go 1.25 и стандартная библиотека для Controller. React/TypeScript, Vite и Vitest
для Dashboard; Node.js 24 и npm lockfile. PostgreSQL 17 в Compose. В Phase 0
единственная SQL-миграция запускается psql отдельным контейнером, после готовности
БД и до Controller. Она создаёт только schema и журнал версий, не доменные таблицы.
GitHub Actions проверяет код и Linux-контейнеры. Корневой Makefile — необязательная
обёртка над одинаковыми локальными и CI-командами.

## Alternatives
Backend framework, ORM и отдельный migration framework пока добавляют больше
зависимостей, чем пользы. React SSR framework не нужен для локальной панели.
Отказ от lockfile ухудшает воспроизводимость frontend dependency tree.

## Consequences
Go не имеет внешних dependencies и go.sum пока не нужен. Контейнерные теги
закреплены по линии версии, но не digest: битовая воспроизводимость образов
не гарантируется. Перед production образы закрепляются по digest.
SQL runner сейчас знает ровно одну идемпотентную миграцию; до следующих миграций
Phase 1 выбирается инструмент с checksum validation и последовательным применением
только новых версий. Не превращать текущий apply.sql в бесконтрольный повтор всех DDL.

## Sources
- [Vite: требования к окружению](https://vite.dev/guide/)
- [Официальный образ PostgreSQL](https://hub.docker.com/_/postgres)
