# Arquitetura

## Visão geral
Monorepo com apps (backend, seller-web, courier-app), pacotes compartilhados e infraestrutura em Docker.

## Backend
- NestJS + Prisma (PostgreSQL/PostGIS).
- Redis para cache/filas (BullMQ).
- MinIO para POD (S3 compatível).

## Módulos
- **auth**: registro/login/refresh.
- **users**: perfis de sellers e couriers.
- **integrations**: placeholders ML/Shopee.
- **orders**: sync/list.
- **jobs**: criação, aceitação, status e feed courier.
- **pod**: prova de entrega.
- **tracking**: tracking_events.
- **matching** e **payouts**: stubs no MVP.

## Dados e eventos
- Jobs criam eventos de tracking em mudanças de status.
- POD salva metadados e, quando necessário, atualiza status para DELIVERED.

## Consistência
- `job_assignments.jobId` com UNIQUE para garantir exclusividade.
- Transações Prisma para aceitar job.
