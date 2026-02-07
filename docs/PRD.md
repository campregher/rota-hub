# PRD - RotaHub MVP

## Objetivo
Conectar vendedores e entregadores para executar entregas de pedidos de marketplaces (Mercado Livre e Shopee, via stubs no MVP), com rastreabilidade operacional e prova de entrega.

## Problema
Vendedores precisam de logística rápida para last-mile e entregadores precisam de demanda organizada. O MVP centraliza pedidos, cria jobs e permite aceitação/execução com controle de status.

## Escopo MVP
- Cadastro/autenticação com JWT próprio (Nest).
- Stubs de integração Mercado Livre/Shopee.
- Normalização de pedidos e criação/listagem de jobs.
- Feed de jobs abertos para entregadores.
- Aceite de job atômico (somente 1 courier).
- Fluxo de status validado.
- POD (Proof of Delivery) com upload opcional de foto para Supabase Storage.
- Tracking events para auditoria operacional.

## Fora do Escopo MVP
- Motor real de matching por raio/ETA.
- Pricing dinâmico.
- SLA avançado.
- Painéis analíticos completos.
- Supabase Auth com políticas RLS produtivas.

## Regras de Negócio
- Estados do job:
  - `OPEN -> ASSIGNED -> PICKED_UP -> IN_TRANSIT -> DELIVERED`
  - Estados terminais alternativos: `CANCELLED`, `DISPUTE`
- Apenas um entregador pode aceitar um job (`UNIQUE job_assignments.job_id`).
- Aceitação em conflito retorna `409`.
- Se `POD_REQUIRED=true`, não permitir `DELIVERED` sem POD.

## Perfis
- Seller: cria jobs, conecta marketplaces, consulta pedidos/jobs.
- Courier: visualiza feed e executa jobs.
- Admin (reservado no modelo): suporte operacional futuro.

## Critérios de Aceite
- API com Swagger em `/docs`.
- Migrações SQL Supabase criam todas as tabelas/enums/constraints.
- Seed com seller, couriers, addresses, orders e jobs OPEN.
- Testes unitários cobrindo aceite de job e transições inválidas.
