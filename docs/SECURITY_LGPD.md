# Security & LGPD - RotaHub MVP

## Principios
- Minimizacao de dados pessoais e operacionais.
- Segregacao de segredos (backend vs frontend).
- Nao registrar tokens ou credenciais em logs.

## Dados sensiveis
- JWT de acesso/refresh.
- Tokens de marketplace (ML/Shopee).
- `SUPABASE_SERVICE_ROLE_KEY`.

## Controles implementados no MVP
- Endpoints criticos (`jobs`, `orders`, `integrations connect`) usam JWT Bearer.
- IDs de seller/courier/actor nao sao mais recebidos no body; vem do JWT.
- Tokens de marketplace sao persistidos criptografados (AES-256-GCM) com chave derivada de `MARKETPLACE_TOKEN_ENCRYPTION_KEY`.
- Validacao de DTO com `class-validator` e `ValidationPipe` global.

## Regras operacionais
- Nunca expor `SUPABASE_SERVICE_ROLE_KEY` em apps frontend.
- Nunca logar access token/refresh token.
- Rotacionar segredos periodicamente.

## LGPD
- Base legal: execucao de contrato e legitimo interesse operacional.
- POD armazena apenas dados minimos para prova de entrega.
- Definir politica de retencao para POD e tracking conforme juridico.
- Planejar fluxo de atendimento dos direitos do titular (acesso/retificacao/exclusao).

## RLS no Supabase
- MVP: RLS desligado para simplificar operacao.
- Producao: habilitar RLS e criar policies por papel (seller/courier/admin), idealmente com Supabase Auth ou JWT compativel.

## Checklist para producao
- Ativar RLS + policies.
- Implementar rate limit e protecao anti abuso.
- Revisao de seguranca em pipeline (SAST/dependency scan).
- Auditoria de acesso e alertas de anomalia.