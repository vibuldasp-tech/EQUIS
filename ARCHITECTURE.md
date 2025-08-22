# Architecture

- Services: `passport-api`, `id-resolver`, `epcis-api`, optional `connectors/shopify`
- Apps: `public-site`, `operator-portal`
- Packages: `schemas`, `sdk`
- Infra: Docker Compose for dev; Terraform for EU region deployment

## Data Flow (Pipeline)
Ingest → Match → Transform → Validate → Enrich → Publish → Write-back.

## Standards
- GS1 Digital Link for identifiers (resolver + QR)
- EPCIS 2.0/CBV for events (mock endpoints)

## Storage
- Postgres: canonical DPP data (Prisma)
- Redis: cache and queues (BullMQ)
- MinIO/S3: evidence files and published public JSON (ETag)