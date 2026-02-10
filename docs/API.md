# API - RotaHub MVP

Base URL local: `http://localhost:3000`

Swagger: `GET /docs`

## Auth
- `POST /auth/register`
  - body: `email`, `password`, `fullName`, `role` (`SELLER|COURIER`)
- `POST /auth/login`
  - body: `email`, `password`
  - retorna `accessToken` e `refreshToken`
- `POST /auth/refresh`
  - body: `refreshToken`

## JWT Bearer required
Use `Authorization: Bearer <accessToken>` nos endpoints:
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

## Jobs
- `POST /jobs`
  - body: `orderId?`, `pickupAddressId`, `dropoffAddressId`, `expiresAt?`, `priceCents?`, `notes?`
  - `sellerId` vem do JWT
- `GET /jobs?status=OPEN|ASSIGNED|PICKED_UP|IN_TRANSIT|DELIVERED|CANCELLED|DISPUTE`
- `POST /jobs/:id/accept`
  - sem body
  - `courierId` vem do JWT
  - conflitos de aceite retornam `409`
- `POST /jobs/:id/status`
  - body: `status`
  - `actorUserId` vem do JWT
  - valida transicoes e regra de POD

## Courier
- `GET /courier/feed`
  - retorna jobs em `OPEN`

## POD
- `POST /jobs/:id/pod` (`multipart/form-data`)
  - campos: `receiverName`, `lat?`, `lng?`, `deliveredAt?`, `photo?`
  - salva `proof_of_delivery` e upload no bucket `rotahub-pod`

## Orders
- `POST /orders/sync`
  - cria/atualiza pedidos de exemplo (stub) para o seller do JWT
- `GET /orders?marketplace?`

## Integrations (Stubs)
- `POST /integrations/mercadolivre/connect`
  - gera URL placeholder
- `GET /integrations/mercadolivre/callback?code=&state=`
  - callback stub que persiste tokens criptografados no DB
- `POST /integrations/shopee/connect`
  - gera URL placeholder
- `GET /integrations/shopee/callback?code=&state=`
  - callback stub que persiste tokens criptografados no DB

## Payouts (Stub)
- `GET /payouts?courierUserId?`

## Erros comuns
- `400` validacao de DTO/transicao invalida.
- `401` token invalido/login invalido.
- `403` role sem permissao.
- `404` recurso nao encontrado.
- `409` conflito de aceite de job.
- `500` erro interno.
