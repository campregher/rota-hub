# Workflows - Engenharia

## Definition of Done (DoD)
- Codigo implementado com validacao e tratamento de erro.
- Testes unitarios atualizados e passando.
- Documentacao relevante atualizada (`docs/*`).
- Sem vazamento de segredo ou log sensivel.

## Branching
- `main`: estavel.
- `feature/<tema>`: desenvolvimento.
- `hotfix/<tema>`: correcoes urgentes.

## Commits
- Mensagens objetivas, ex:
- `feat(jobs): atomic accept with unique assignment constraint`
- `fix(pod): validate receiverName before upload`

## Testes
- Backend:
- unitarios em `apps/backend/src/**/*.spec.ts`
- smoke em `apps/backend/scripts/smoke.mjs`

## Release
1. Rodar testes (`npm test`) e smoke (`npm run test:smoke`).
2. Aplicar migracoes SQL no Supabase (`npx supabase db push`).
3. Deploy backend.
4. Deploy seller-web e courier-app.
5. Smoke test em ambiente alvo:
- auth
- create job
- accept com concorrencia
- POD upload
- transicao para DELIVERED