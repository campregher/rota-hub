# Rotahub PRD

## Objetivo
Criar uma plataforma logística para sellers com integração a marketplaces, roteamento e acompanhamento de entregas, com foco inicial no backend MVP.

## Escopo MVP
- Cadastro e autenticação de sellers e couriers.
- Sincronização de pedidos (stub).
- Criação e aceitação de jobs com consistência atômica.
- Tracking de eventos e POD.
- Integrações iniciais (Mercado Livre, Shopee) como placeholders.

## Regras de negócio
- Estados do Job: OPEN → ASSIGNED → PICKED_UP → IN_TRANSIT → DELIVERED, além de CANCELLED e DISPUTE.
- Aceitar Job deve ser atômico (um único courier por job).
- Para marcar DELIVERED, POD é obrigatório quando `POD_REQUIRED=true`.

## Personas
- **Seller**: integra marketplaces, monitora pedidos e jobs.
- **Courier**: aceita jobs e atualiza status/entrega.
- **Admin**: supervisão e auditoria.

## Fluxos principais
1. Seller integra marketplace → sincroniza pedidos.
2. Seller cria job de entrega.
3. Courier aceita job (lock atômico).
4. Courier atualiza status + POD.
5. Seller acompanha rastreio.
