# Runbook Rotahub

## Pré-requisitos
- Docker + Docker Compose
- Node.js 18+

## Subir infraestrutura
```bash
docker compose -f infra/docker-compose.yml up -d
```

## Backend
```bash
cd apps/backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

Swagger disponível em `http://localhost:3000/docs`.

## Debug
- Verifique logs com `docker compose logs`.
- Para reset de banco:
```bash
docker compose -f infra/docker-compose.yml down -v
```

## Storage (MinIO)
- Console: http://localhost:9001
- Crie bucket `rotahub`.
