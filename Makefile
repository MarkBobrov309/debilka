.PHONY: install build test check run dev up down
install:
	npm --prefix web ci
build:
	go build ./...
	npm --prefix web run build
test:
	go test ./...
	npm --prefix web test
check: test
	go vet ./...
run:
	go run ./cmd/controller
dev:
	npm --prefix web run dev
up:
	docker compose up --build -d
down:
	docker compose down
