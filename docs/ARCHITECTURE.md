# Architecture - RotaHub MVP

## Visao geral
Monorepo com tres apps e dois pacotes compartilhados:
- `apps/backend`: NestJS + Prisma + Swagger
- `apps/seller-web`: Next.js para seller
- `apps/courier-app`: Expo React Native para courier
- `packages/shared-types`
- `packages/shared-utils`

Infra:
- Supabase Postgres
- Supabase Storage (bucket `rotahub-pod`)
- Sem Docker/Compose

## Backend (modulos)
- `auth`: register/login/refresh JWT
- `users`: usuarios e perfis
- `integrations`: connect/callback stubs ML/Shopee
- `orders`: sync/list de pedidos
- `jobs`: create/list/accept/status
- `tracking`: eventos operacionais
- `pod`: prova de entrega
- `courier`: feed de jobs OPEN
- `matching`: stub
- `payouts`: stub

## Autenticacao e autorizacao
- JWT Bearer proprio do backend.
- Endpoints criticos inferem identidade pelo token (seller/courier/admin).
- IDs de ator nao sao aceitos no body para operacoes de jobs/orders/integrations.

## Fluxo principal
1. Seller autenticado cria job (`POST /jobs`) -> `OPEN`.
2. Courier aceita job (`POST /jobs/:id/accept`) em transacao atomica.
3. Status segue transicoes validas (`PICKED_UP`, `IN_TRANSIT`, `DELIVERED`).
4. POD (`POST /jobs/:id/pod`) salva metadados e foto opcional.
5. `DELIVERED` exige POD quando `POD_REQUIRED=true`.
6. `tracking_events` registra eventos de auditoria.

## Modelo de dados
Tabelas:
- `users`
- `seller_profiles`
- `courier_profiles`
- `addresses`
- `marketplace_connections`
- `orders`
- `delivery_jobs`
- `job_assignments`
- `tracking_events`
- `proof_of_delivery`
- `payouts`

## Integridade
- `users.email` UNIQUE
- `orders (marketplace, marketplace_order_id)` UNIQUE
- `job_assignments.job_id` UNIQUE
- Indices de status e datas para consultas operacionais

## Seguranca
- Tokens de marketplace persistidos criptografados (AES-256-GCM).
- `SUPABASE_SERVICE_ROLE_KEY` somente no backend.
- Sem log de tokens/segredos.

## Observabilidade
- Filtro global de excecao padroniza erros.
- `tracking_events` para trilha operacional.
- Recomendado em producao: logs estruturados + traces.