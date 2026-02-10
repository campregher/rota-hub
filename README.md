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

Para deploy em cloud (Render/Railway), prefira `DATABASE_URL` do pooler do Supabase:

```env
postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
```

Importante: salvar sem aspas e sem prefixo `DATABASE_URL=` dentro do valor.

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
- Para CLI recentes sem `db query`, execute `supabase/seed.sql` via SQL Editor no dashboard do Supabase.
- Se sua CLI suportar `db query`, rode pelo terminal.

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
- `POST /jobs/:id/pod`
- `POST /orders/sync`
- `GET /orders`
- `GET /courier/feed`
- `POST /integrations/mercadolivre/connect`
- `POST /integrations/shopee/connect`
- `GET /payouts`

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
