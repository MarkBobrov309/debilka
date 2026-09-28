# Архитектура

## Границы системы

Control Plane: Go Controller, PostgreSQL и React/TypeScript Dashboard.
REST обслуживает Dashboard и внешнее API. В Phase 3 отдельный защищённый gRPC
канал соединит Controller и Go Agent. Data Plane: удалённые узлы с туннельными
и транспортными сервисами. Пользовательский трафик не проходит через Controller
по архитектурной необходимости.

```text
Dashboard ── REST ── Controller ── PostgreSQL
                         │
                  защищённый gRPC (Phase 3)
                         │
                       Agents
                         │
               Tunnel / Transport providers
                         │
               Node → [Node …] → Target
```

## Что реализовано в Phase 0

- Controller: stdlib HTTP, проверка адреса запуска, JSON liveness, structured logs,
  ограниченные таймауты и завершение по сигналу.
- Dashboard: skeleton и запрос реального liveness API через same-origin proxy.
- PostgreSQL: dev-контейнер и транзакционная повторяемая базовая миграция.
  Controller ещё не соединяется с БД: это задача Phase 1.
- CI: Go/frontend checks, Compose build, миграция и smoke test.

## Планируемые границы модулей

Домен: Node, Tunnel, TunnelPeer, Transport, Route, RouteHop, Target, Service,
Config, ConfigRevision, Deployment. Это план, а не уже существующие Go-типы.
Domain не зависит от Xray, WireGuard или OpenVPN. Новые интерфейсы появляются
на реальных границах интеграций, когда начинается соответствующий этап.

Configuration Engine: typed model → validation → provider/renderer → artifact.
Deployment Engine: diff → backup → apply → verify → commit state либо rollback.
Controller хранит Desired State; Agent сообщает Actual State. Успех доставки
не означает успешное применение. Каждая revision неизменяема, содержит checksum,
источник, время, node/component и статус; предыдущая рабочая версия сохраняется.

Agent исполняет локальные операции; systemd — одна из его реализаций service
manager. Решения о маршрутах, failover и политике принимает Controller.
Monitoring отдельно оценивает process, tunnel и route health. Health Engine
использует историю и configurable hysteresis; failover появляется после него.

## Структура

```text
cmd/controller/       точка входа Go Controller
internal/config/      настройки процесса
internal/httpapi/     HTTP transport
web/src/              Dashboard
migrations/           нумерованные SQL-миграции
deploy/               Dockerfile и reverse proxy
docs/adr/             архитектурные решения
.github/workflows/    проверки CI
```

По мере реализации добавятся `cmd/agent`, `api/proto`, `internal/domain`,
`internal/storage`, `internal/orchestration`, `internal/agent`,
`internal/providers`, `internal/xray/{model,renderer,validator,client,service}`.
Пустые реализации этих подсистем сейчас не создаются.

## Безопасность и ограничения

Управляющий канал требует конфиденциальности, целостности, идентификации узла,
версии протокола, защиты от replay и аудита. Его протокол и выдача сертификатов
должны быть зафиксированы отдельным ADR до первой сетевой реализации Agent.
Пользовательская аутентификация отложена; будущие User и Device — разные сущности,
отзыв одного устройства не отзывает остальные. Сейчас порты только на loopback.

OpenWrt исключён из основного комплекса. VPN и transport независимы: ни один
конкретный provider не обязателен. Маскировка меняет наблюдаемые характеристики
соединения и может снижать детектируемость; абсолютная невыявляемость не обещается.
