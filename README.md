# RotaHub Monorepo

Monorepo do MVP RotaHub com:
- `apps/backend`: NestJS + TypeScript + Prisma
- `apps/seller-web`: Next.js
- `apps/courier-app`: Expo React Native
- `packages/shared-types`: tipos compartilhados
- `packages/shared-utils`: utilitarios compartilhados
- `supabase/migrations`: migracoes SQL oficiais
- `supabase/seed.sql`: dados iniciais
- `docs/*`: documentacao

## Requisitos

- Node.js 20+
- npm 10+
- Conta no Supabase

## 1) Criar projeto no Supabase

No dashboard do Supabase, crie um projeto e copie:
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## 2) Configurar variaveis

Copie `.env.example` para `.env` na raiz e preencha os valores.

## 3) CLI do Supabase (sem Docker)

```bash
npm install --save-dev supabase
npx supabase login
npx supabase link --project-ref <SEU_PROJECT_REF>
```

## 4) Aplicar schema e seed

```bash
npx supabase db push
```

Seed:

```bash
npx supabase db query < supabase/seed.sql
```

PowerShell:

```powershell
Get-Content supabase/seed.sql -Raw | npx supabase db query
```

## 5) Criar bucket para POD

No Supabase Storage, crie o bucket `rotahub-pod`.

## 6) Backend

```bash
cd apps/backend
npm install
npm run prisma:generate
npm run start:dev
```

Swagger: `http://localhost:3000/docs`

### Endpoints protegidos por JWT (Bearer)

- `POST /jobs`
- `POST /jobs/:id/accept`
- `POST /jobs/:id/status`
- `POST /orders/sync`
- `GET /orders`
- `POST /integrations/mercadolivre/connect`
- `POST /integrations/shopee/connect`

Use `POST /auth/login` e informe o access token no botao **Authorize** do Swagger.

## 7) Smoke test automatizado

Com backend rodando e seed aplicado:

```bash
cd apps/backend
npm run test:smoke
```

O smoke valida: login -> create job -> accept -> pod -> delivered.

## 8) Seller Web

```bash
cd apps/seller-web
npm install
npm run dev
```

## 9) Courier App

```bash
cd apps/courier-app
npm install
npm run start
```

## Observacoes

- Fonte de verdade do banco: `supabase/migrations/*.sql`
- Prisma e usado como ORM/client; evolucao de schema deve ser feita via SQL em `supabase/migrations`.
- Nao usar Docker ou docker-compose neste projeto.
- `SUPABASE_SERVICE_ROLE_KEY` nunca deve ir para frontends.