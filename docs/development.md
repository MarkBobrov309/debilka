# Разработка и демонстрация Phase 0

## Инструменты
Go 1.25+, Node.js 24, npm, Git. Для полной проверки: Docker Engine с Linux containers
и Compose. Make необязателен; команды ниже работают без него.
Точные frontend dependencies фиксирует `web/package-lock.json`.

## Чистый checkout
Клонировать репозиторий и перейти в его корень. Скопировать `.env.example` в `.env`:
PowerShell `Copy-Item .env.example .env`, POSIX shell `cp .env.example .env`.
Записать в `.env` собственный случайный пароль PostgreSQL, не добавлять файл в Git.

```sh
npm --prefix web ci
go test ./...
go vet ./...
go build ./...
npm --prefix web test
npm --prefix web run build
docker compose config --quiet
docker compose up --build -d
```

В Windows использовать `npm.cmd`, если PowerShell запрещает npm.ps1.
Если Docker Desktop ещё не запущен, запустить его и дождаться готовности Engine.

## Demo: foundation
1. `docker compose ps -a`: PostgreSQL и Controller healthy, migrate завершился с 0,
   web запущен.
2. Открыть <http://127.0.0.1:5173>. Ожидается «Controller доступен».
3. `curl http://127.0.0.1:8080/api/v1/health` — JSON со status=ok, service=controller,
   api_version=v1. В PowerShell можно использовать `Invoke-RestMethod`.
4. `docker compose stop controller`; нажать «Проверить снова» — недоступен.
5. `docker compose start controller`; повторить проверку — доступен.
6. `docker compose run --rm migrate` — повторное применение не создаёт вторую версию.
7. `docker compose exec -T postgres psql -U orchestrator -d orchestrator -c
   "TABLE orchestrator.schema_migrations;"` — одна запись версии 1.
8. `docker compose down` — остановить с сохранением данных.

Это демонстрация связи UI/API и среды БД; она не демонстрирует подключение Agent.

## Без Docker
В терминале 1: `go run ./cmd/controller`. В терминале 2:
`npm --prefix web ci`, затем `npm --prefix web run dev`.
Открыть тот же адрес Dashboard. Vite перенаправляет `/api` в `127.0.0.1:8080`.
БД не нужна для process liveness; этот режим не проверяет SQL или Dockerfile.

## Работа с Git
Сначала status, AGENTS.md, roadmap и относящаяся к задаче архитектура. После изменения:
build/test, документация, diff, логический commit, чистый status. Для milestone —
проверка чистого checkout и локальный tag. Push только в настроенный remote;
отсутствие remote — явно оставшаяся задача, не повод создавать произвольный GitHub repo.
