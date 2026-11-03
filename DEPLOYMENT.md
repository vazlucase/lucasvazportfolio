# Publicar em lucasvazportfolio.vercel.app

O repositório é `vazlucase/lucasvazportfolio`. O projeto deve usar a raiz do repositório, preset Vite e Node.js 24. Build, instalação, pasta `dist`, rotas e função estão definidos no `vercel.json`; não configure a pasta `dist` como raiz do projeto.

## Ativar o painel de produção

1. Execute `npm run setup:production` neste checkout. O comando preserva arquivos de credenciais já existentes.
2. Abra **secrets/vercel.env**, que não é versionado. Abra **secrets/painel-producao.txt** para consultar a senha de login. Não copie a senha para o GitHub ou para o código.
3. No projeto da Vercel, conecte um banco Upstash Redis persistente. Use o endpoint HTTPS e o token REST padrão do banco. Não use token somente de leitura: coleta, limitação e revogação precisam escrever.
4. Em **Settings → Environment Variables**, cadastre os valores de `ANALYTICS_ADMIN_PASSWORD_HASH` e `ANALYTICS_SESSION_SECRET` do arquivo privado. Cadastre também `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` e `ANALYTICS_KEY_PREFIX=lucasvaz:analytics:production:v1`.
5. Selecione **Production**. Para Preview, use credenciais e banco/prefixo separados; não reutilize os dados reais. Nunca use `VITE_` nas chaves administrativas. Marque as credenciais como sensíveis quando a interface permitir.
6. Faça **Redeploy** depois de cadastrar/alterar as variáveis. Variáveis novas não mudam um deployment existente. Pushes para `main` usam a integração Git da Vercel, se ela estiver conectada.
7. Abra `/painel`, entre com a senha de produção e confira o estado de medição. Visite o portfólio em outro navegador, sem Do Not Track ou exclusão de visitas, para conferir a coleta real.

Sem essas variáveis, o portfólio continua acessível e as APIs de métricas retornam indisponibilidade. Nenhum relatório é liberado sem credenciais válidas. O arquivo local de visitas não é enviado à Vercel; a produção usa exclusivamente o banco persistente.

## Conferência depois do deployment

- `/` entrega o portfólio e `/painel` entrega a tela de acesso.
- Sem cookie, `/api/analytics/report` e `/api/analytics/export` recusam acesso; com configuração incompleta retornam 503.
- Depois de entrar, filtros e CSV funcionam. Depois de sair, o cookie anterior perde acesso.
- `.env.local`, `secrets/vercel.env` e `.analytics-data/analytics.json` não são arquivos públicos.
- O histórico começa com os acessos reais recebidos em produção, sem dados fictícios.

O Node.js da função pode usar rede para o Redis; não há dependência de disco persistente na Vercel. O acesso local por `npm run dev` e `npm run preview` é separado da produção e exige a senha local.

## Rotação e recuperação

As senhas são geradas aleatoriamente, não exibidas no terminal e não recuperáveis a partir do hash. Guarde os arquivos privados em local seguro ou use um gerenciador de senhas. Para trocar o acesso, gere um novo conjunto em checkout limpo, atualize hash e segredo na Vercel e publique novamente. Isso invalida todas as sessões anteriores.

Os testes e a auditoria locais não substituem a conferência do deployment real. O funcionamento da conexão Upstash depende do banco e das credenciais cadastradas na conta da Vercel.
