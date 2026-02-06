# Segurança e LGPD

## Princípios
- Minimização de dados pessoais.
- Logs sem dados sensíveis (tokens/PII mascarados).
- Tokens de marketplace armazenados com placeholder `TODO encrypt`.

## Retenção
- Retenção de eventos de tracking limitada ao necessário para auditoria.
- POD armazenado em bucket dedicado com ciclo de vida.

## Acesso
- Tokens JWT para autenticação.
- Rotas críticas devem exigir JWT (TODO reforçar RBAC por role).
