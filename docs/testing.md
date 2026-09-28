# Тестирование

## Автоматические проверки
- `go test ./...`: валидация адреса, default loopback, HTTP contract,
  неизвестные endpoints и недопустимые методы.
- `go vet ./...`, `go build ./...`: Go static checks и сборка.
- `npm --prefix web test`: health contract, сбои HTTP/network/JSON,
  несовместимая версия и начальное состояние Dashboard.
- `npm --prefix web run build`: TypeScript strict check и production bundle.
- CI дополнительно выполняет `go test -race ./...` на Linux.
- Compose CI: build, запуск PostgreSQL, повтор миграции, проверка единственной
  версии и API через web proxy. UI browser E2E добавляются вместе с node management.

## Локальная проверка 2026-09-28
- Windows: Go 1.25.5, Node.js 24.15.0, npm 11.12.1.
- PASS: Go unit tests, vet и build. Config/httpapi packages: 100% statement
  coverage; cmd/main проверен запуском контейнера и корректным SIGTERM (exit 0).
- PASS: frontend 8 tests, strict typecheck и production build.
- PASS: Docker build обоих образов; PostgreSQL/Controller healthy; migrate exit 0.
- PASS: повтор миграции оставляет одну запись `1|foundation`.
- PASS: API через web proxy возвращает ожидаемый v1 contract.
- PASS: браузер показывает доступный Controller; после остановки и перезагрузки
  страницы — недоступен; после запуска и активации кнопки клавиатурой — доступен.
- Локальный порт PostgreSQL был занят/недоступен: публикация порта удалена,
  БД доступна только внутри Compose. Остальные порты — loopback.
- PASS: чистый clone коммита `eee3925` в `.cache/clean-checkout`: Go test/vet/build,
  `npm ci --offline`, все 8 frontend tests и production build. Status клона чистый.

На момент первоначальных локальных проверок GitHub Actions ещё не запускался.
Race detector предусмотрен в Linux CI, но не запускался локально.

## Проверка при возобновлении 2026-09-28
- Рабочее дерево до оформления milestone чистое; после `eee3925` менялась
  только документация. Уже пройденные build/test повторно не запускались.
- PASS: Controller и PostgreSQL healthy, migrate завершён с 0, web запущен.
- PASS: API через web proxy возвращает ожидаемый v1 contract; в журнале миграций
  единственная запись `1|foundation`.
- Проверен diff foundation; `.env`, приватные ключи и сертификаты не отслеживаются.
- GitHub-синхронизация и CI завершены; milestone `v0.1.0`.

## GitHub Actions · 2026-09-28
- [Run 36462732529](https://github.com/MarkBobrov309/debilka/actions/runs/36462732529),
  commit `8c735720d9d536855133e02a2ff2e6d32ad10b6f`: **SUCCESS**.
- PASS: gofmt, go vet, `go test -race ./...`, Go build.
- PASS: npm ci, frontend tests, TypeScript/Vite build.
- PASS: Compose validation, Docker build/start, API через web proxy,
  повторная миграция и проверка единственной версии.
- Финальный commit milestone меняет только документацию; код, dependencies,
  SQL, Docker и workflow совпадают с проверенным commit. Повтор CI для записи
  результатов пропущен через `[skip ci]`; это не дополнительный выполненный run.

## Будущие уровни
Phase 1: PostgreSQL storage и API integration. Phase 3: secure Controller ↔ Agent.
Следующие фазы: renderer/validation, state machines, rollback, provider integration,
single-hop и multi-hop. Health/failover проверяются сериями ошибок и успешных
измерений с hysteresis; одна удачная проверка не доказывает устойчивость.
