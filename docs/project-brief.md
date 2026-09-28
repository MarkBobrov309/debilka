# MASTER PROMPT ДЛЯ CODEX

Ты работаешь над долгосрочным инженерным проектом по разработке программной подсистемы удалённого доступа к специализированным автоматизированным системам.

Проект должен создаваться как реальный расширяемый программный продукт, а не как одноразовый набор скриптов или конфигурационных файлов.

## 1. Назначение проекта

Рабочее название:

**Distributed Secure Remote Access Orchestrator**

Предмет разработки:

**«Разработка подсистемы удалённого доступа к специализированным АС с применением технологий маскировки и сокрытия сетевого трафика».**

Основная идея проекта — создать централизованную систему управления распределённой инфраструктурой удалённого доступа.

Система должна позволять:

* управлять большим количеством удалённых серверных узлов;
* подключать и контролировать VPS/серверы в различных сетевых и географических расположениях;
* автоматически доставлять и обновлять конфигурации;
* управлять защищёнными туннелями;
* поддерживать несколько реализаций VPN/туннельных технологий;
* использовать Xray как один из транспортных уровней;
* строить как однопереходные, так и multi-hop маршруты;
* контролировать состояние узлов, туннелей и маршрутов;
* автоматически переключаться на резервные направления;
* хранить историю конфигураций;
* выполнять rollback;
* предоставлять централизованный web-интерфейс;
* предоставлять журналирование и аудит;
* в перспективе поддерживать различные российские и зарубежные механизмы защищённого туннелирования.

Главный принцип:

**центральная система управления и фактическая передача пользовательского трафика должны быть разделены.**

Central Controller управляет инфраструктурой, но не должен становиться обязательным транзитным узлом пользовательского трафика.

---

# 2. Основная архитектура

Система должна строиться по модели Control Plane / Data Plane.

## Control Plane

Центральный Go Controller:

* управление узлами;
* управление конфигурациями;
* управление туннелями;
* управление маршрутами;
* deployment;
* monitoring;
* health checks;
* orchestration;
* хранение состояния;
* аудит;
* web API.

## Data Plane

Распределённые узлы:

* фактическая передача трафика;
* VPN;
* Xray;
* транспорт;
* маршрутизация;
* multi-hop.

Общая схема:

```
WEB DASHBOARD
       │
       ▼
 GO CONTROLLER
       │
   REST/gRPC
       │
       ▼
  NODE AGENTS
       │
┌──────┼──────┐
▼      ▼      ▼
```

Xray    WG    OpenVPN
│      │      │
└──────┼──────┘
│
MULTI-HOP
│
▼
TARGET NODE
│
▼
SPECIALIZED AS

---

# 3. Технологический стек

Базовый стек:

Backend:

* Go

Agent:

* Go

Frontend:

* React
* TypeScript

Database:

* PostgreSQL

API:

* REST для внешнего API и Dashboard
* gRPC для Controller ↔ Agent

Configuration:

* YAML/JSON как пользовательское представление, если необходимо
* внутренняя типизированная модель конфигурации

Remote service management:

* systemd

Containerization:

* Docker для центральных компонентов, если это упрощает локальную разработку и тестирование

CI:

* GitHub Actions

VPN/Tunnel integrations:

Первый этап:

* WireGuard
* OpenVPN

Следующие этапы:

* IPsec
* российские решения
* другие подходящие реализации

Transport:

* Xray-core

Xray не должен быть архитектурным центром всей системы.

Он должен выступать одним из интегрируемых компонентов transport engine.

---

# 4. Основной архитектурный принцип

НИКОГДА не проектируй систему как простой редактор конфигурационных файлов.

Плохо:

```
Web UI
  ↓
xray.json
  ↓
SSH
  ↓
restart
```

Правильно:

```
Web UI
   ↓
Domain Model
   ↓
Configuration Engine
   ↓
Provider / Renderer
   ↓
Generated Config
   ↓
Agent
   ↓
Service
```

Все внешние технологии должны подключаться через абстракции.

Например:

```
TunnelProvider
    ├── WireGuardProvider
    ├── OpenVPNProvider
    ├── IPSecProvider
    └── FutureProvider
```

Аналогично:

```
TransportProvider
    ├── XrayProvider
    └── FutureProvider
```

Центральная бизнес-логика не должна зависеть от конкретной реализации WireGuard, OpenVPN или Xray.

---

# 5. Desired State / Actual State

Система должна использовать концепцию Desired State.

Controller хранит:

```
DESIRED STATE
```

Agent сообщает:

```
ACTUAL STATE
```

Пример:

```
Desired:
  Xray = running
  WG = running
  config_revision = 42

Actual:
  Xray = running
  WG = running
  config_revision = 41
```

Controller должен определить рассинхронизацию и инициировать deployment.

После применения Agent возвращает результат.

Это должно быть фундаментальным принципом orchestration.

---

# 6. Node Agent

На каждом удалённом сервере работает отдельный Go Agent.

Agent отвечает за локальные операции.

Минимально:

* регистрация;
* heartbeat;
* сбор информации о системе;
* получение команд;
* получение конфигураций;
* применение конфигураций;
* управление сервисами;
* проверка локального состояния;
* отправка метрик;
* отправка логов/результатов операций;
* rollback.

Agent не должен содержать бизнес-логику всей системы.

Он является управляемым исполнителем.

---

# 7. Безопасность управляющего канала

Управляющий канал Controller ↔ Agent должен проектироваться как отдельный защищённый контур.

Не использовать небезопасные внешние административные интерфейсы.

Коммуникация должна обеспечивать:

* конфиденциальность;
* целостность;
* идентификацию узла;
* проверку версии сообщений;
* защиту от повторной отправки старых команд;
* безопасную выдачу конфигураций;
* audit trail.

Конкретную модель полноценной пользовательской аутентификации НЕ реализовывать в первых этапах проекта.

Но архитектура должна предусматривать её подключение в будущем.

---

# 8. Конфигурационный Engine

Это один из центральных модулей системы.

НЕ хранить настройки только как произвольный JSON.

Создать собственную доменную модель:

* Node;
* Tunnel;
* TunnelPeer;
* Transport;
* Route;
* RouteHop;
* Target;
* Service;
* Config;
* ConfigRevision;
* Deployment.

Для Xray отдельно:

* Inbound;
* Outbound;
* Routing Rule;
* Transport;
* Security;
* DNS;
* наблюдение/health-related settings, если они необходимы.

Для VPN:

* Tunnel;
* Interface;
* Peer;
* Endpoint;
* Addressing;
* Routes;
* Keys/credentials, когда соответствующий модуль будет реализован.

---

# 9. Xray integration

Xray должен быть интегрирован через отдельный модуль.

Пример:

```
internal/
  xray/
    model/
    renderer/
    validator/
    client/
    service/
```

Система должна уметь:

1. создавать внутреннюю Xray-модель;
2. валидировать её;
3. генерировать конфигурацию;
4. передавать её Agent;
5. выполнять локальную проверку;
6. применять конфигурацию;
7. получать состояние;
8. читать диагностическую информацию;
9. выполнять rollback.

Начинать с малого.

НЕ пытаться реализовать в GUI сразу все возможные параметры Xray.

Сначала:

* базовый inbound;
* базовый outbound;
* базовая routing-модель;
* VLESS;
* затем transport/security;
* затем нужные механизмы REALITY;
* затем остальные действительно необходимые функции.

---

# 10. VPN abstraction

Создать интерфейс примерно следующего уровня:

```
type TunnelProvider interface {
    Install(...)
    Configure(...)
    Start(...)
    Stop(...)
    Restart(...)
    Status(...)
    Remove(...)
    Validate(...)
}
```

Это только архитектурный ориентир.

Не привязывай доменную модель к конкретному API.

Первая реализация:

```
WireGuardProvider
```

Вторая:

```
OpenVPNProvider
```

Следующие:

```
IPsecProvider
RussianProviderX
RussianProviderY
...
```

Новый provider должен добавляться без переписывания всего Controller.

---

# 11. Route Model

Маршрут является отдельной сущностью.

Например:

```
Client
  ↓
Node A
  ↓
Node B
  ↓
Node C
  ↓
Target
```

Количество hops не должно быть жёстко ограничено.

Route должен иметь:

* идентификатор;
* имя;
* состояние;
* source;
* target;
* последовательность hops;
* используемый tunnel provider;
* transport;
* приоритет;
* health policy;
* deployment state.

---

# 12. Multi-hop

Multi-hop внедрять только после того, как работает обычный single-hop маршрут.

Этапы:

Version 1:

```
Client → Node → Target
```

Version 2:

```
Client → Node A → Node B → Target
```

Version 3:

```
Client → A → B → C → Target
```

Version 4:

```
альтернативные маршруты:

Client → A → B → Target
Client → A → C → Target
```

В будущем система должна уметь выбирать между альтернативными путями.

---

# 13. Monitoring

Создать отдельный Monitoring Engine.

Он должен получать:

Node metrics:

* CPU;
* RAM;
* disk;
* uptime.

Service metrics:

* Xray;
* WireGuard;
* OpenVPN;
* Agent.

Network metrics:

* RTT;
* packet loss;
* availability.

Tunnel state:

* healthy;
* degraded;
* unavailable.

Route state:

* healthy;
* degraded;
* unavailable;
* switching;
* recovered.

Не смешивать:

```
process health

tunnel health

route health
```

Это разные уровни состояния.

---

# 14. Health Check Engine

Создать отдельную модель состояния.

Минимум:

```
HEALTHY
DEGRADED
UNAVAILABLE
```

Оценка должна основываться не на единственной ошибке.

Использовать:

* последовательность успешных проверок;
* последовательность ошибок;
* RTT;
* packet loss;
* стабильность;
* историю состояния.

Предусмотреть hysteresis.

Например:

```
3 failures → failover
```

и:

```
5 successful checks → recovery accepted
```

Конкретные значения должны быть конфигурируемыми и обоснованными экспериментами.

---

# 15. Failover

После появления monitoring и health engine реализовать automatic failover.

Например:

```
Route A = ACTIVE
Route B = STANDBY
```

Если:

```
Route A → DEGRADED → UNAVAILABLE
```

система должна перейти на:

```
Route B → ACTIVE
```

Все переходы должны записываться в журнал.

Не допускать постоянного переключения туда-сюда.

---

# 16. Configuration Revision

Любая конфигурация должна быть версионируемой.

Например:

```
Revision 1
Revision 2
Revision 3
Revision 4 ← ACTIVE
```

Каждая revision должна иметь:

* revision ID;
* author/source;
* creation timestamp;
* checksum;
* status;
* related node;
* related component.

Статусы:

```
DRAFT
VALIDATED
APPLIED
FAILED
ROLLED_BACK
```

---

# 17. Safe Deployment

Новая конфигурация НЕ должна бездумно перезаписывать рабочую.

Pipeline:

```
generate
   ↓
validate
   ↓
backup
   ↓
apply
   ↓
restart/reload
   ↓
health check
   ↓
success
```

или:

```
failure
   ↓
rollback
   ↓
restore previous revision
```

---

# 18. Dashboard

Dashboard должен быть интерфейсом управления реальной доменной моделью.

Основные разделы:

Dashboard:

* общая статистика;
* состояние узлов;
* active routes;
* failures;
* alerts.

Nodes:

* список узлов;
* состояние;
* системные метрики;
* установленные сервисы;
* версии.

Tunnels:

* список туннелей;
* provider;
* состояние;
* endpoint;
* health.

Routes:

* route builder;
* hops;
* состояние;
* active/standby.

Configurations:

* шаблоны;
* revisions;
* diff;
* deployment;
* rollback.

Monitoring:

* графики;
* health;
* история.

Audit:

* действия;
* изменения;
* deployment;
* failover.

---

# 19. Topology View

В будущем Dashboard должен отображать инфраструктуру как граф.

Пример:

```
Client
   │
   ▼
Node A
  ├──── Node B ─────┐
  │                 │
  └──── Node C ─────┤
                    ▼
                  Target
```

Topology должна быть не просто декоративной.

Она должна использовать реальные данные из модели Node/Route.

---

# 20. Git Workflow

Git является обязательной частью разработки.

Repository должен содержать весь проект.

Каждое значимое изменение должно быть отдельным логическим commit.

НЕ делать огромные коммиты:

```
"implement everything"
```

Предпочитать:

```
feat(controller): add node model

feat(api): add node endpoints

feat(agent): add heartbeat

feat(config): add revision model

feat(xray): add config renderer

feat(vpn): add wireguard provider

feat(route): add multi-hop model

feat(monitoring): add health checks

fix(agent): handle failed deployment
```

Использовать понятные commit messages.

Не переписывать существующую историю без явной команды пользователя.

Не делать force push.

Не создавать и не менять ветки без необходимости или явного указания.

Рабочее дерево после завершения отдельной задачи должно быть чистым, если только пользователь явно не попросил оставить незакоммиченные изменения.

---

# 21. GitHub

Проект должен регулярно синхронизироваться с GitHub.

После завершения крупного рабочего этапа:

1. проверить изменения;
2. выполнить тесты;
3. проверить git diff;
4. создать commit;
5. проверить git status;
6. push в настроенный remote, если remote доступен и операция разрешена текущим окружением.

Если push невозможно выполнить:

* не считать задачу полностью завершённой;
* показать причину;
* оставить локальный commit;
* явно сообщить, что именно осталось сделать.

Не удалять remote.
Не изменять credentials.
Не выполнять destructive git commands без явного указания.

---

# 22. AGENTS.md

На старте проекта обязательно создать:

```
AGENTS.md
```

Он должен содержать:

* краткое описание проекта;
* архитектурные принципы;
* структуру репозитория;
* команды сборки;
* команды тестирования;
* правила Git;
* правила документации;
* правила создания новых provider;
* правила изменения БД;
* правила работы с конфигурациями;
* правила безопасности.

AGENTS.md должен оставаться компактным.

Не превращай AGENTS.md в гигантскую документацию.

Подробные документы должны храниться отдельно:

```
docs/
  architecture.md
  development.md
  api.md
  configuration.md
  deployment.md
  testing.md
  roadmap.md
  decisions/
```

Используй документацию по назначению, а не заставляй читать весь repository перед каждой небольшой задачей.

---

# 23. ADR

Все существенные архитектурные решения оформлять как ADR.

Например:

```
docs/adr/0001-control-plane-data-plane.md
docs/adr/0002-agent-architecture.md
docs/adr/0003-tunnel-provider-interface.md
docs/adr/0004-xray-integration.md
```

Каждый ADR должен содержать:

* Context;
* Decision;
* Alternatives;
* Consequences.

---

# 24. Стратегия разработки

НИКОГДА не пытайся реализовать весь проект одним большим изменением.

Работай итерационно.

Каждый этап должен давать работоспособный результат.

Основное правило:

**сначала вертикальный рабочий срез, потом расширение.**

Например:

```
DB
  ↓
API
  ↓
UI
  ↓
Agent
  ↓
working feature
```

а не:

```
3 месяца backend
3 месяца frontend
3 месяца networking
```

---

# 25. Обязательный порядок разработки

Следовать примерно такой последовательности.

## Phase 0 — Project foundation

* repository;
* Go module;
* frontend skeleton;
* Docker;
* PostgreSQL;
* migrations;
* CI;
* AGENTS.md;
* documentation;
* Makefile/Taskfile;
* development environment.

Результат:

проект собирается и запускается.

---

## Phase 1 — Controller

Реализовать:

* database;
* nodes;
* REST API;
* health endpoint;
* logging;
* configuration.

Результат:

работающий Controller.

---

## Phase 2 — Dashboard

Реализовать:

* node list;
* node creation;
* node details;
* basic status.

Результат:

через браузер можно управлять узлами.

---

## Phase 3 — Agent

Реализовать:

* startup;
* registration;
* heartbeat;
* system information;
* secure controller communication.

Результат:

реальный VPS появляется в Dashboard как ONLINE.

---

## Phase 4 — Deployment Engine

Реализовать:

* desired state;
* actual state;
* configuration revisions;
* deployment status;
* retries;
* rollback foundation.

Результат:

Controller может доставить конфигурацию на Agent.

---

## Phase 5 — Service Manager

Реализовать управление systemd:

* start;
* stop;
* restart;
* status;
* enable;
* disable.

Результат:

Controller/Agent может управлять реальными сервисами.

---

## Phase 6 — Xray

Сначала:

* базовая integration;
* renderer;
* validator;
* service manager;
* config deployment.

Потом:

* inbound;
* outbound;
* routing;
* VLESS;
* нужные transport/security механизмы;
* REALITY;
* дополнительные возможности Xray по мере необходимости.

Результат:

Xray можно полноценно создать и управлять им через систему.

---

## Phase 7 — WireGuard

Создать:

```
WireGuardProvider
```

Реализовать:

* installation;
* configuration;
* peer management;
* lifecycle;
* status;
* deployment.

Результат:

WireGuard можно создать через Dashboard и применить на удалённом узле.

---

## Phase 8 — OpenVPN

Создать:

```
OpenVPNProvider
```

Не ломать существующую архитектуру.

Результат:

два независимых provider работают через один общий интерфейс.

---

## Phase 9 — Route Engine

Реализовать:

* routes;
* hops;
* targets;
* route state.

Результат:

создание single-hop маршрутов.

---

## Phase 10 — Multi-hop

Реализовать:

* 2 hops;
* 3 hops;
* произвольное количество hops;
* validation;
* dependency ordering.

Результат:

рабочий multi-hop path.

---

## Phase 11 — Monitoring

Реализовать:

* node monitoring;
* service monitoring;
* tunnel monitoring;
* route monitoring;
* metrics;
* historical state.

---

## Phase 12 — Health Engine

Реализовать:

```
HEALTHY
DEGRADED
UNAVAILABLE
```

и hysteresis.

---

## Phase 13 — Failover

Реализовать:

* primary route;
* standby route;
* failover;
* recovery;
* anti-flapping.

Результат:

можно намеренно выключить node и продемонстрировать автоматическое переключение.

---

## Phase 14 — Topology

Создать визуализацию:

```
Node → Node → Node → Target
```

Показывать реальные route relationships.

---

## Phase 15 — Advanced providers

Исследовать:

* IPsec;
* российские решения;
* другие подходящие VPN/туннельные технологии.

Для каждого решения сначала сделать исследование и ADR.

После этого решать, нужен ли полноценный provider.

---

## Phase 16 — Advanced orchestration

Возможные функции:

* automatic route selection;
* route scoring;
* path recalculation;
* preferred node;
* weighted routes;
* fallback hierarchy.

---

## Phase 17 — Hardening

После основной функциональности:

* security review;
* permissions;
* secrets handling;
* input validation;
* audit;
* safe deployment;
* rollback;
* rate limits;
* error handling;
* secure defaults.

---

# 26. Аутентификация и управление устройствами

ЭТО НЕ ВХОДИТ В ОСНОВНОЙ FIRST IMPLEMENTATION FLOW.

Реализовать отдельным поздним этапом.

Архитектурно предусмотреть:

```
User
  │
  ├── Device 1
  ├── Device 2
  └── Device 3
```

Отдельные сущности:

* User;
* Device;
* Credential;
* Role;
* Permission;
* Session;
* AccessPolicy.

Ключевой принцип:

```
User != Device
```

Потерянное устройство должно отзываться отдельно.

После revoke:

* прекращается доступ;
* старые credentials больше не считаются доверенными;
* активные sessions могут завершаться;
* остальные устройства пользователя не затрагиваются.

Возможные модели аутентификации исследовать отдельно перед реализацией.

---

# 27. Тестирование

Каждый новый компонент должен иметь тесты.

Минимум:

Unit tests:

* domain logic;
* config validation;
* route logic;
* state machine;
* failover;
* renderer.

Integration tests:

* PostgreSQL;
* Controller ↔ Agent;
* provider integration.

E2E tests:

* create node;
* register agent;
* create configuration;
* deploy;
* verify;
* create route;
* simulate failure;
* failover;
* rollback.

Нельзя считать feature завершённой без проверки.

---

# 28. Definition of Done

Задача считается завершённой только когда:

* код написан;
* архитектура не нарушена;
* добавлены необходимые тесты;
* тесты проходят;
* проект собирается;
* документация обновлена;
* changelog обновлён, если изменение заметное;
* git diff проверен;
* commit создан;
* git status проверен.

Для крупного milestone:

* создан release/tag;
* README обновлён;
* добавлена демонстрационная инструкция;
* проверен clean checkout.

---

# 29. Правила работы Codex

Перед началом КАЖДОЙ существенной задачи:

1. Изучи только те части repository, которые относятся к задаче.
2. Проверь AGENTS.md.
3. Проверь актуальную архитектуру.
4. Определи затрагиваемые модули.
5. Сначала сформулируй краткий implementation plan.
6. Реализуй небольшой законченный кусок.
7. Запусти необходимые тесты.
8. Исправь найденные проблемы.
9. Обнови документацию.
10. Сделай commit.
11. Покажи краткий итог.

Не делать огромных изменений за один шаг.

Если задача большая, разделяй её самостоятельно на подзадачи.

---

# 30. Правила изменения архитектуры

Не вводи новый framework, database, message broker, dependency или infrastructure component только потому, что он удобен для одной конкретной задачи.

Для нового крупного dependency сначала оцени:

* необходимость;
* альтернативы;
* влияние на архитектуру;
* поддержку;
* сложность;
* пользу для дипломного проекта.

Если архитектурное решение существенно меняется:

1. создаётся ADR;
2. обновляется architecture.md;
3. после этого изменяется код.

---

# 31. Правила кода

Предпочтения:

* простой Go;
* стандартная библиотека там, где её достаточно;
* явные зависимости;
* небольшие модули;
* интерфейсы на границе подсистем;
* dependency injection;
* context.Context;
* structured logging;
* typed errors;
* понятные имена;
* отсутствие скрытой магии.

Не создавать premature abstractions.

Абстракция должна появляться там, где она реально защищает архитектуру от конкретной реализации.

---

# 32. Правила работы с конфигурациями

Никогда не записывать production-конфигурацию вслепую.

Pipeline:

```
Build
  ↓
Validate
  ↓
Diff
  ↓
Backup
  ↓
Apply
  ↓
Verify
  ↓
Commit state
```

Всегда иметь возможность rollback.

Не хранить секреты и приватные ключи в Git.

Использовать secrets/environment/configuration storage.

---

# 33. Документация

Документировать не только "как это работает", но и "почему сделано именно так".

Обязательные документы:

```
README.md

docs/
  architecture.md
  roadmap.md
  development.md
  deployment.md
  configuration.md
  testing.md
  monitoring.md
  providers.md
```

После каждого крупного изменения проверять, не устарела ли документация.

---

# 34. Roadmap

В repository всегда должен существовать:

```
docs/roadmap.md
```

В нём:

```
DONE
IN PROGRESS
NEXT
FUTURE
```

Не удалять выполненные этапы.

История разработки должна быть видна.

Это важно и для последующего оформления диплома.

---

# 35. Changelog

Создать:

```
CHANGELOG.md
```

Для каждого значимого milestone фиксировать:

* дату;
* изменения;
* новые функции;
* исправления;
* known limitations.

---

# 36. Демонстрационный принцип

Каждая крупная фича должна иметь демонстрационный сценарий.

Например:

### Demo: Node management

```
Add VPS
↓
install agent
↓
agent connects
↓
Dashboard = ONLINE
```

### Demo: Configuration deployment

```
edit config
↓
revision created
↓
deploy
↓
service restarted
↓
health = OK
```

### Demo: Multi-hop

```
Node A
  ↓
Node B
  ↓
Node C
  ↓
Target
```

### Demo: Failover

```
A → B → C
    ↓
  FAILURE
    ↓
A → D → C
```

Каждая демонстрация должна воспроизводиться из чистого окружения по инструкции.

---

# 37. Работа в режиме поэтапного диалога

Не пытайся заранее написать весь проект.

В начале каждой новой сессии:

1. проверь состояние repository;
2. прочитай AGENTS.md;
3. проверь roadmap;
4. проверь текущий git status;
5. определи последнюю завершённую milestone;
6. продолжи со следующей логической задачи.

После завершения задачи сообщай:

```
Completed:
...

Tests:
...

Files changed:
...

Commit:
...

Next recommended step:
...
```

Не выполняй следующую большую задачу автоматически, если пользователь явно её не запросил.

---

# 38. Важнейшее правило проекта

**Рабочий код важнее количества написанного кода.**

Каждый этап должен оставлять repository в состоянии:

```
buildable
testable
understandable
demonstrable
```

Если возможно выбрать между:

```
1000 строк незавершённой функции
```

и

```
200 строк полностью работающей функции
```

выбирай второе.

---

# 39. Что нужно сделать сейчас

НЕ начинай сразу писать всю систему.

Сначала:

1. изучи текущий repository;
2. определи, пустой он или уже содержит код;
3. создай AGENTS.md;
4. создай docs/architecture.md;
5. создай docs/roadmap.md;
6. создай docs/development.md;
7. предложи начальную структуру каталогов;
8. подготовь Phase 0;
9. реализуй только минимальный foundation;
10. запусти build/test;
11. создай первый Git commit.

После завершения Phase 0 остановись и предоставь отчёт.

Дальнейшие этапы должны выполняться постепенно, по одной законченной задаче за раз.

# 40. Критически важные ограничения

Не включать OpenWrt в основную архитектуру проекта.

OpenWrt может рассматриваться как внешний потенциальный клиентский сценарий в будущем, но не является частью текущего дипломного программного комплекса.

Не делать WireGuard обязательным компонентом.

Не делать Xray единственным транспортом.

Не делать OpenVPN единственным VPN.

Система должна быть расширяемой.

Не закладывать пользовательскую аутентификацию в первые implementation phases.

Аутентификация пользователей и устройств является отдельным последующим подсистемным модулем.

Не утверждать, что транспортная маскировка гарантирует абсолютную невыявляемость.

Формулировать результат как снижение детектируемости/изменение наблюдаемых характеристик транспортного соединения.

Не хранить секреты в Git.

Не использовать force push.

Не переписывать историю Git.

Не выполнять необратимые или destructive операции без явного указания.

---

# 41. Главный критерий успешности проекта

В финальной версии должна существовать возможность открыть Dashboard и увидеть:

```
Nodes
├── ONLINE
├── DEGRADED
└── OFFLINE

Tunnels
├── WireGuard
├── OpenVPN
└── Future providers

Xray
├── Inbound
├── Outbound
├── Transport
└── Routing

Routes
├── Single-hop
├── Multi-hop
└── Failover

Configuration
├── Revisions
├── Deployment
└── Rollback

Monitoring
├── Nodes
├── Tunnels
└── Routes

Audit
└── History
```

и управлять всей этой инфраструктурой через единый Controller + Agent architecture.

Начинай с Phase 0 и не перепрыгивай сразу к полной реализации.
