# Состояние проекта · 2026-09-28

**Пользователь возобновил работу командой «Продолжай работу».**
Пауза снята. Подготовлено локальное оформление Phase 0; идёт GitHub-синхронизация.
Phase 1 не начат. Автоматическое продолжение и фоновые задачи не настроены.

## Запрос и границы
Исходный полный master prompt сохранён в `docs/project-brief.md`.
Текущая задача — только Phase 0, затем остановка и отчёт. Требуются маленькие
законченные изменения, проверки, документация, commits и чистое рабочее дерево.
Архитектура Control Plane / Data Plane, Go Controller/Agent, React/TypeScript,
PostgreSQL, REST/gRPC. VPN и transport подключаются независимо через providers.
OpenWrt исключён. Пользовательская/device auth отложена. Controller не транзит
пользовательского трафика. Секреты не коммитить, историю не переписывать.

## Репозиторий
- Путь: `C:\Users\mark\Desktop\diplom\ebuchka`.
- Изначально каталог был пустой, Git отсутствовал.
- Git инициализирован, текущая ветка `master` (default при git init).
- Первый commit: `eee3925` —
  `feat(foundation): bootstrap controller dashboard and local infrastructure`.
- Пользователь предоставил remote `https://github.com/MarkBobrov309/debilka.git`.
  Репозиторий публичный, перед первой отправкой пустой, без refs. Существующую
  локальную ветку `master` сохраняем; переименование не требуется.
- Коммит сохранения паузы: `9d80365` —
  `docs: preserve phase 0 verification and paused session state`.
- После push и проверки CI создать annotated tag `v0.1.0` на финальном commit.
  История и ветка не переписывались.

## Реализовано
- `cmd/controller`, `internal/config`, `internal/httpapi`: Go 1.25, stdlib,
  JSON slog, validation адреса, timeout и корректное завершение по SIGTERM.
- `GET /api/v1/health`: status=ok, service=controller, api_version=v1.
  Это только process liveness; Controller ещё не подключён к PostgreSQL.
- `web/`: React 19.3, TypeScript 7, Vite 8, Vitest 5; Node.js 24;
  lockfile зафиксирован. Экран foundation делает реальный запрос API,
  различает checking/online/unavailable, timeout 5 секунд, кнопка повторной проверки.
- Compose: PostgreSQL 17, отдельный psql migration job, Go Controller,
  Nginx со статическим Dashboard и proxy `/api`.
- Миграция 0001 создаёт schema `orchestrator`, таблицу schema_migrations
  и одну запись `1|foundation`. Повторяемая, транзакционная, advisory lock.
- Makefile, Dockerfiles, GitHub Actions, .gitignore, .env.example, AGENTS,
  README, CHANGELOG, roadmap, обязательные docs и два ADR.
- Нет domain nodes, Agent, gRPC, tunnel/transport providers, routes, deployment,
  revisions, failover или пользовательской auth: это последующие фазы.

## Проверено
- Go 1.25.5 Windows: test, vet, build — PASS.
- Config и httpapi: 100% statement coverage. cmd/main — container smoke,
  SIGTERM и exit 0, без отдельного unit test.
- Frontend: 8 tests — PASS; strict typecheck и production build — PASS.
- npm install/audit: 0 найденных vulnerabilities на момент проверки.
- Оба Docker-образа собраны; PostgreSQL/Controller healthy; migration exit 0.
- Повтор миграции оставил единственную запись версии 1.
- API через `http://127.0.0.1:5173/api/v1/health` возвращает ожидаемый JSON.
- Браузер: доступен → после остановки Controller и reload недоступен →
  после запуска Controller и активации кнопки клавиатурой доступен.
  Mouse automation не давала видимого эффекта; клавиатурная проверка сработала.
- Чистый локальный clone `eee3925` в `.cache/clean-checkout`: Go test/vet/build,
  npm ci --offline, frontend tests/build — PASS; status клона чистый.
- git diff --cached --check выполнен перед первым commit; секретов в нём нет.
- Race detector только настроен в Linux CI, локально не запускался.
- После возобновления подтверждены healthy Controller/PostgreSQL, migrate exit 0,
  ответ API через proxy и единственная версия миграции. Код с `eee3925` не менялся;
  повторная полная сборка не требовалась. Обновлены только статусные документы.

## Окружение и работающие процессы
- Docker Desktop был запущен для тестирования и оставлен работающим.
- Compose-проект `dsrao`: postgres, controller, web оставлены запущенными;
  migrate — завершённый job. После возобновления состояние подтверждено.
- Dashboard: `http://127.0.0.1:5173/`.
- Controller: `http://127.0.0.1:8080/api/v1/health`.
- PostgreSQL НЕ публикует порт на хост: первоначальный 5432 был недоступен;
  взаимодействие с БД через Compose network / docker compose exec.
- Локальный `.env` со случайным паролем создан и игнорируется Git. Не выводить
  его содержимое в отчёты. postgres-data volume сохраняется.
- `.cache/clean-checkout`, `.cache/go-build`, `web/node_modules`, `web/dist`,
  `bin/controller.exe` — игнорируемые артефакты проверки.
- Владелец созданной `.git` исправлен на учётную запись mark. В sandbox Git
  может требовать точечный `-c safe.directory=C:/Users/mark/Desktop/diplom/ebuchka`;
  глобальные настройки safe.directory не менялись.
- Среда ограничивает запись в `.git`, сеть npm и Docker: использовались
  разрешённые escalated tool calls. Для Go в sandbox GOCACHE был направлен в .cache.
- PowerShell: использовать npm.cmd при ограничении запуска npm.ps1.

## Оставшиеся шаги
1. Прочитать AGENTS, этот файл, roadmap; проверить git status/log и состояние Compose.
2. Настроить предоставленный remote, отправить `master`, проверить CI;
   после фиксации результатов создать и отправить tag `v0.1.0`.
   Не делать force push.
3. Проверить GitHub Actions после push, если доступен инструмент для чтения статуса.
   Не утверждать, что CI прошёл, без результата. Обновить документы о синхронизации.
4. Только по отдельному запросу Phase 1: выбор migration runner с checksum,
   PostgreSQL storage, Node model/create/list REST API, readiness и integration tests.

## История паузы
Пользователь остановил работу после первого commit и чистого clone. Полное задание,
проверки и окружение сохранены в `9d80365`. Возобновление ограничено оставшимися
шагами Phase 0, как предписывает исходное задание. Повторно создавать foundation
или запускать уже пройденные проверки без изменений не требуется.

Текущий apply.sql — runner только для одной идемпотентной baseline migration.
Не расширять его механическим повторением всех будущих DDL. ADR 0002 фиксирует
необходимость выбрать полноценный подход при начале Phase 1.
