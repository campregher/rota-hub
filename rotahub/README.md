# Rotahub

Monorepo Rotahub com backend NestJS, seller web Next.js, courier app Expo e infraestrutura Docker.

## Estrutura
```
rotahub/
  apps/
    backend/
    seller-web/
    courier-app/
  packages/
    shared-types/
    shared-utils/
  infra/
    docker-compose.yml
  docs/
```

## Subir infraestrutura
```bash
cd rotahub
docker compose -f infra/docker-compose.yml up -d
```

## Backend (MVP)
```bash
cd rotahub/apps/backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

Swagger: http://localhost:3000/docs

## Seller Web
```bash
cd rotahub/apps/seller-web
npm install
npm run dev
```

## Courier App
```bash
cd rotahub/apps/courier-app
npm install
npm run start
```

## Documentação
Veja `docs/` para PRD, arquitetura, API e runbook.
