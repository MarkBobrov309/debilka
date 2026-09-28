# API · Phase 0

`GET /api/v1/health` → `200`, `Content-Type: application/json`, `Cache-Control: no-store`:

```json
{"status":"ok","service":"controller","api_version":"v1"}
```

Это liveness процесса. Endpoint не обращается к PostgreSQL, не проверяет Agent,
туннели или маршруты. Readiness появится вместе с storage в Phase 1.
`HEAD` поддерживается стандартным HTTP router; прочие методы получают 405.
Неизвестные endpoints получают 404. REST nodes и gRPC ещё отсутствуют.
Аутентификации нет; сервис предназначен для loopback dev-среды.
