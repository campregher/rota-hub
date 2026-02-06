# API MVP

Base URL: `http://localhost:3000`

## Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`

## Jobs
- `POST /jobs`
- `GET /jobs?status=OPEN`
- `POST /jobs/:id/accept`
- `POST /jobs/:id/status`

## Courier
- `GET /courier/feed`

## POD
- `POST /jobs/:id/pod` (multipart/form-data)

## Orders
- `POST /orders/sync`
- `GET /orders`

## Integrations
- `POST /integrations/mercadolivre/connect`
- `GET /integrations/mercadolivre/callback`
- `POST /integrations/shopee/connect`

## Erros
- `400` validação ou transição inválida.
- `401` credenciais inválidas.
- `409` conflito ao aceitar job.
