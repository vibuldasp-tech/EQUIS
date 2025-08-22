# DPP Platform Monorepo (EU Textiles)

This monorepo contains a production-ready, standards-aligned Digital Product Passport (DPP) platform for EU textiles.

## Quickstart

Requirements: Docker, Docker Compose, Node 20+

1. Copy environment file:

```bash
cp .env.example .env
```

2. Start the stack:

```bash
make dev
```

3. Run DB migrations and seed demo data:

```bash
make db-migrate
make seed
```

4. Open:
- Public site: http://localhost:5173
- Passport API: http://localhost:8081/healthz
- ID Resolver: http://localhost:8082/healthz
- EPCIS API: http://localhost:8083/healthz

## Make Targets
- `make dev` – start all services
- `make test` – run service tests in containers
- `make db-migrate` – apply DB migrations
- `make seed` – load sample catalog and EPCIS batch

## Structure
See `ARCHITECTURE.md` and `SCHEMAS.md` for details.