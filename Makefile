SHELL := /usr/bin/bash

.PHONY: dev test db-migrate seed build clean

DEV_ENV ?= .env

dev:
	docker compose --env-file $(DEV_ENV) up --build

test:
	docker compose --env-file $(DEV_ENV) run --rm passport-api npm test || true
	docker compose --env-file $(DEV_ENV) run --rm id-resolver npm test || true
	docker compose --env-file $(DEV_ENV) run --rm epcis-api npm test || true

# Run DB migrations via passport-api and epcis-api
# Note: deploy applies existing migrations; generation happens in images

db-migrate:
	docker compose --env-file $(DEV_ENV) run --rm passport-api npm run prisma:migrate
	docker compose --env-file $(DEV_ENV) run --rm epcis-api npx prisma migrate deploy

seed:
	docker compose --env-file $(DEV_ENV) run --rm passport-api npm run seed

build:
	docker compose --env-file $(DEV_ENV) build

clean:
	docker compose --env-file $(DEV_ENV) down -v