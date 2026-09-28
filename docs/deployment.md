# Развёртывание

Phase 0 поддерживает локальный dev-стенд, не production deployment.
`docker compose up --build -d` строит Controller и статический Dashboard,
поднимает PostgreSQL, ждёт его health, запускает миграцию и затем Controller/web.
PostgreSQL сохраняет данные в named volume. Миграция отдельная, а не initdb hook:
её можно повторить на существующем volume командой `docker compose run --rm migrate`.
Порт PostgreSQL не публикуется на хост; для диагностики использовать
`docker compose exec postgres psql -U orchestrator -d orchestrator`.

Controller запускается непривилегированным пользователем. Nginx обслуживает web
и проксирует `/api` на Controller. Все опубликованные порты привязаны к loopback.
`docker compose logs controller migrate` показывает диагностику.
`docker compose down` сохраняет БД; удаление volume уничтожает данные и не является
обычным шагом остановки или исправления ошибки.

Для последующей эксплуатации нужны TLS и auth политики, secure Agent enrollment,
secrets storage, backup/restore БД, закрепление image digest и проверка обновлений.
Эти работы не реализованы и не маскируются существованием Dockerfile.
