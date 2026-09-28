# Конфигурация

## Настройки запуска Phase 0
| Переменная | Default / назначение |
| --- | --- |
| CONTROLLER_HTTP_ADDR | `127.0.0.1:8080`; явный host и port 1..65535 |
| POSTGRES_PASSWORD | Обязателен для Compose, только локальный `.env` |

Compose задаёт Controller `0.0.0.0:8080` внутри контейнера, публикуя порт на
`127.0.0.1`. DB/user dev-стенда: `orchestrator`. Нельзя считать Compose production
конфигурацией. Изменение пароля в `.env` не меняет пароль уже созданной БД в volume.

## Будущий Configuration Engine
Настройки процесса отделены от доменных конфигураций узлов. Последние будут
типизированы, версионируемы, проверяемы и отрендерены отдельными provider.
Секреты передаются через references к secret storage; не сохраняются в Git/логах.
Build → Validate → Diff → Backup → Apply → Verify → Commit state; при ошибке —
rollback предыдущей revision. В Phase 0 этого engine пока нет.
