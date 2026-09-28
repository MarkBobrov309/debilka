# Distributed Secure Remote Access Orchestrator

Расширяемая подсистема удалённого доступа к специализированным АС. Работать
небольшими законченными этапами; после Phase 0 не переходить к Phase 1 без запроса.

## Архитектура
- Control Plane (Go Controller, PostgreSQL, React Dashboard) отделён от Data Plane.
- Go Agent — локальный исполнитель. Controller не транзит пользовательского трафика.
- Desired State и Actual State разделены; конфигурация — типизированная модель,
  затем validation, provider/renderer, deployment и проверка результата.
- VPN и transport — независимые интеграции. Ни WireGuard, ни OpenVPN, ни Xray
  не обязательны. OpenWrt не входит в текущую архитектуру.
- Не создавать интерфейсы и сущности впрок. Существенные решения сначала в ADR.

## Структура и команды
- `cmd/controller`, `internal/`: Go; `web/`: React/TypeScript.
- `migrations/`: SQL; `deploy/`: контейнеры; `docs/adr/`: решения.
- Build: `go build ./...`, `npm --prefix web run build`.
- Test: `go test ./...`, `go vet ./...`, `npm --prefix web test`.
- В Windows использовать `npm.cmd`, если политика PowerShell блокирует `npm.ps1`.
- Полный dev-стенд: `docker compose up --build -d`; см. docs/development.md.

## Изменения
- Перед задачей читать git status, roadmap и только относящиеся к ней документы.
- Дать краткий план; реализовать один рабочий срез; проверить build/test/diff.
- Новые компоненты покрывать содержательными тестами; обновлять docs и changelog.
- Каждый законченный шаг — логический commit. Не менять ветки без необходимости,
  не переписывать историю, не делать force push. Оставлять чистое рабочее дерево.
- Push в существующий remote после крупного этапа; отсутствие remote явно сообщать.
- Новый provider должен подключаться на границе подсистемы, иметь validation,
  lifecycle, диагностику и тесты, не требовать переписывания Controller.
- Изменения БД — новые нумерованные миграции, транзакции и тест с PostgreSQL.
  Применённые миграции не редактировать; план отката описывать отдельно.
- Конфигурации: Build → Validate → Diff → Backup → Apply → Verify → Commit state;
  сохранять предыдущую revision для rollback. Не заменять production вслепую.

## Безопасность
- Не хранить credentials, приватные ключи, `.env` и рабочие конфигурации в Git/логах.
- Dev-порты публиковать только на loopback. Пользовательская аутентификация — позже.
- До Agent реализовать отдельный защищённый канал: идентификация узла, шифрование,
  версия протокола и защита от replay. Не выставлять незащищённые admin API наружу.
- Маскировка может снижать детектируемость, но не гарантирует невыявляемость.

Подробности: docs/architecture.md, docs/development.md, docs/roadmap.md.
