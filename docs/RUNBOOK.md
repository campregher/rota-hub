# Runbook - Local (Sem Docker)

## Pre-requisitos
- Node.js 20+
- npm 10+

## 1) Configurar variaveis
1. Copie `.env.example` para `.env`.
2. Preencha:
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_POD_BUCKET=rotahub-pod`
- `JWT_ACCESS_SECRET` e `JWT_REFRESH_SECRET`
- `MARKETPLACE_TOKEN_ENCRYPTION_KEY`

Notas de `DATABASE_URL`:
- Local: pode usar host direto `db.<project_ref>.supabase.co:5432`.
- Cloud/Render: prefira pooler `aws-0-<region>.pooler.supabase.com:6543` com usuario `postgres.<project_ref>`.
- Salvar sem aspas e sem incluir `DATABASE_URL=` dentro do valor.

## 2) Conectar no projeto Supabase
```bash
npm install --save-dev supabase
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
```

## 3) Aplicar schema e seed
```bash
npx supabase db push
```

Seed:
- Se sua versao da CLI nao tiver `supabase db query`, execute `supabase/seed.sql` no SQL Editor do dashboard.
- Se tiver `db query`, rode via terminal.

## 4) Criar bucket para POD
No dashboard do Supabase Storage:
1. Criar bucket `rotahub-pod`.
2. MVP: pode manter bucket publico.

## 5) Rodar backend
```bash
cd apps/backend
npm install
npm run prisma:generate
npm run start:dev
```

Swagger: `http://localhost:3000/docs`

## 6) Login e Bearer token
1. Rode `POST /auth/login` no Swagger.
2. Copie `accessToken`.
3. Clique em **Authorize** e cole `Bearer <token>`.

## 7) Smoke test automatizado
Com backend rodando e seed aplicado:
```bash
cd apps/backend
npm run test:smoke
```

## 8) Rodar frontends
Seller web:
```bash
cd apps/seller-web
npm install
npm run dev
```

Courier app:
```bash
cd apps/courier-app
npm install
npm run start
```

## 9) Deploy (resumo)
- Backend: Render/Railway/Fly com variaveis de ambiente do `.env`.
- Seller web: Vercel com `NEXT_PUBLIC_API_URL` apontando para backend deployado.
- Courier app: Expo EAS Build com `EXPO_PUBLIC_API_URL` apontando para backend deployado.
- Banco: manter migracoes SQL via `npx supabase db push` antes de deploy.

## Troubleshooting
- `P1001/P1000 Prisma`: revisar `DATABASE_URL`, host e SSL.
- `Tenant or user not found`: em pooler, usar usuario `postgres.<project_ref>`.
- `URL must start with protocol`: remover aspas/prefixo indevido e garantir `postgresql://`.
- `The table ... does not exist`: schema nao aplicado no projeto correto.
- `Failed to upload POD photo`: conferir `SUPABASE_SERVICE_ROLE_KEY` e bucket.
- `409 on accept`: comportamento esperado em corrida de aceite.
- `DELIVERED blocked`: `POD_REQUIRED=true` exige POD antes de entregar.
