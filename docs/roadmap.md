# Roadmap

## DONE
- 2026-09-28: изучен исходный каталог — пустой, без Git и кода.
- Foundation-код: Controller liveness, React skeleton, Compose/PostgreSQL,
  начальная миграция, CI, Makefile и архитектурные документы.

## IN PROGRESS
- Phase 0: проверка build/test, запуска, clean checkout и первый commit.
  Итог проверки записывается в docs/testing.md и CHANGELOG.md.

## NEXT
- Phase 1 — PostgreSQL storage, nodes, REST API, readiness, logging/configuration.
  Первым срезом: миграции с проверкой checksum, Node repository и create/list API
  с PostgreSQL integration tests. Не начинать без отдельного запроса.
- Phase 2 — node list/create/details/status через Dashboard.
- Phase 3 — Go Agent: startup, registration, heartbeat, system info;
  отдельный ADR и защищённый gRPC с идентификацией и защитой от replay.

## FUTURE
| Phase | Результат |
| --- | --- |
| 4 | Desired/Actual State, revisions, deployment, retries, rollback foundation |
| 5 | systemd lifecycle через Agent |
| 6 | Xray model/validation/render/deployment; inbound/outbound/routing/VLESS, затем transport/security/REALITY |
| 7 | WireGuardProvider, конфигурация peers и lifecycle |
| 8 | OpenVPNProvider через ту же границу интеграции |
| 9 | Routes, targets и single-hop |
| 10 | 2/3/N hops, validation и dependency ordering |
| 11 | Отдельные node/service/tunnel/route monitoring и история |
| 12 | HEALTHY/DEGRADED/UNAVAILABLE, hysteresis и эксперименты с порогами |
| 13 | Primary/standby, failover/recovery и anti-flapping |
| 14 | Topology по реальным Node/Route relationships |
| 15 | Исследование IPsec и российских решений; ADR до provider |
| 16 | Route scoring, recalculation, weights, fallback hierarchy |
| 17 | Security review, permissions, secrets, input validation, audit, limits |
| Later | User/Device/Credential/Role/Permission/Session/AccessPolicy; независимый revoke устройств |

Выполненные этапы сохраняются в истории. Каждый этап должен быть демонстрируемым,
иметь проверки и небольшой логический commit; следующая большая задача начинается
только по запросу пользователя.
