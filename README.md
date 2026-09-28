# Distributed Secure Remote Access Orchestrator

Подсистема удалённого доступа к специализированным автоматизированным системам.
Централизованный **Control Plane** управляет распределённым **Data Plane**;
Controller не является обязательным транзитным узлом пользовательского трафика.

## Текущий этап: Phase 0

Минимальный Go Controller с `GET /api/v1/health`, React/TypeScript Dashboard
с проверкой реального API, PostgreSQL 17, начальная SQL-миграция, Docker Compose
и GitHub Actions. Это foundation, ещё не система удалённого доступа.

Управление узлами, Agent, gRPC, VPN, Xray, deployment и маршруты пока не реализованы.
Endpoint проверяет процесс Controller, **не** готовность БД или туннелей.

## Быстрый запуск

Нужны Docker Engine / Docker Desktop с Linux containers и Docker Compose.
Скопировать `.env.example` в `.env`, задать собственный случайный
`POSTGRES_PASSWORD`, затем:

```sh
docker compose up --build -d
```

- Dashboard: <http://127.0.0.1:5173>
- Controller liveness: <http://127.0.0.1:8080/api/v1/health>

Порты доступны только на локальном компьютере. Стенд предназначен для разработки.
Для остановки с сохранением данных: `docker compose down`.

Без Docker: Go 1.25+ и Node.js 24; в отдельных терминалах:

```sh
go run ./cmd/controller
```

```sh
npm --prefix web ci
npm --prefix web run dev
```

В PowerShell вместо `npm` можно использовать `npm.cmd`. В этом режиме
Dashboard и Controller работают без БД; миграции требуют PostgreSQL.

## Проверки

```sh
go test ./...
go vet ./...
go build ./...
npm --prefix web test
npm --prefix web run build
```

`make install`, `make check`, `make build`, `make up` — удобные сокращения,
но Make не обязателен на Windows.

## Документация

- [Архитектура и структура](docs/architecture.md)
- [Дорожная карта](docs/roadmap.md)
- [Среда разработки и демонстрация](docs/development.md)
- [Конфигурация](docs/configuration.md), [API](docs/api.md)
- [Развёртывание](docs/deployment.md), [тестирование](docs/testing.md)
- [Мониторинг](docs/monitoring.md), [providers](docs/providers.md)
- [Архитектурные решения](docs/adr/0001-control-plane-data-plane.md)
- [История изменений](CHANGELOG.md), [правила разработки](AGENTS.md)
