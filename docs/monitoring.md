# Monitoring

В Phase 0 есть только process liveness Controller и structured lifecycle logs.
Успешный health API не означает доступность узлов, БД или маршрута.

Phase 11 вводит отдельные уровни: node (CPU/RAM/disk/uptime), service (process),
tunnel (доступность), route (end-to-end). RTT и packet loss — отдельные измерения.
Phase 12 добавит историю, HEALTHY/DEGRADED/UNAVAILABLE и hysteresis с порогами,
обоснованными экспериментами. Phase 13 — failover/recovery с anti-flapping и аудитом.
