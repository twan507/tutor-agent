COMPOSE_INFRA = docker compose -p tutor-infra -f deploy/infra/docker-compose.yml --env-file .env
COMPOSE_APP   = docker compose -p tutor-app -f deploy/app/docker-compose.yml --env-file .env

.PHONY: up network deploy down-app logs test lint

network:
	-docker network create tutor-net

up: network
	$(COMPOSE_INFRA) up -d --wait
	$(COMPOSE_APP) up -d --build

deploy:
	$(COMPOSE_APP) pull
	$(COMPOSE_APP) up -d

down-app:
	$(COMPOSE_APP) down

logs:
	$(COMPOSE_APP) logs -f --tail=100

test:
	cd backend && uv run pytest
	cd frontend && pnpm test

lint:
	cd backend && uv run ruff check . && uv run ruff format --check .
	cd frontend && pnpm lint && pnpm format:check
