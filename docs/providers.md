# Providers

В Phase 0 provider implementations и пустые интерфейсы отсутствуют.
Будущая граница TunnelProvider включает validation, configure, lifecycle, status,
install/remove по необходимости. TransportProvider независим; Xray — одна из
реализаций. Service manager выполняет systemd операции через Agent.

WireGuard (Phase 7), OpenVPN (Phase 8), позднее IPsec/российские решения после
исследования и ADR. Ни один provider не является обязательным для Controller.
Новая реализация требует typed input, renderer/validation, диагностики, безопасного
deployment/rollback и тестов. Provider-specific параметры не проникают в бизнес-логику
маршрутов. Single-hop должен работать до внедрения multi-hop.
