# Lucas Costa Vaz — Portfólio
Portfólio em React 18, TypeScript e Vite, preparado para GitHub e Vercel. Identidade editorial em Anton, Outfit e Space Mono, superfícies creme e grafite e detalhes em lima e lilás.

Site: https://lucasvazportfolio.vercel.app
Painel: https://lucasvazportfolio.vercel.app/painel

## Desenvolvimento local
Requer Node.js 24. Use o mesmo runtime na Vercel e na integração contínua.

~~~sh
npm ci
npm run setup:admin
npm run dev
~~~

O site abre em http://127.0.0.1:3000. O painel exige senha **também localmente**. O comando de configuração gera uma senha aleatória em **secrets/painel-local.txt** e salva somente seu hash e o segredo de sessão em **.env.local**. Esses arquivos são privados e ignorados pelo Git. A geração preserva credenciais existentes.

O servidor aceita APIs somente de loopback. O histórico local é salvo em **.analytics-data/analytics.json**. Reiniciar o processo encerra as sessões administrativas locais, mas preserva as métricas. Faça backup dessa pasta para manter a coleta local. Não há senha padrão.

## Site e painel
- Abertura animada, tema claro/escuro, navegação acessível, projetos com detalhes e habilidades em acordeão.
- Contato por e-mail e WhatsApp, redução de movimento e recuperação de falhas.
- Layout fluido validado entre 240 e 3440 pixels, incluindo orientação horizontal. Grades, títulos, rodapé, menus e tabelas se reorganizam conforme o espaço.
- Nó flutuante: percebe o conteúdo, escolhe caminhos variados nos espaços livres e acompanha a rolagem. Carinho, petiscos, brincadeira, descanso e memórias existem apenas na visita; pensamentos e cuidados não são enviados ao servidor.
- Painel em **/painel** (alias **/admin**) com views, visitantes, sessões, engajamento, tempo ativo, origens, dispositivos, navegadores, projetos, seções e cliques de contato.
- Filtros de 30 dias, 3 meses e 1 ano, gráfico acessível, atualização automática, exportação CSV e exclusão das próprias visitas.

## Publicação na Vercel
Leia [DEPLOYMENT.md](DEPLOYMENT.md) para ativar as métricas no projeto conectado ao GitHub.

~~~sh
npm run setup:production
~~~

Esse comando prepara **secrets/vercel.env** e **secrets/painel-producao.txt**, separados das credenciais locais. Cadastre na Vercel:
- **ANALYTICS_ADMIN_PASSWORD_HASH**: hash scrypt gerado pelo comando.
- **ANALYTICS_SESSION_SECRET**: segredo aleatório de sessão, também gerado.
- **UPSTASH_REDIS_REST_URL** e **UPSTASH_REDIS_REST_TOKEN**: banco persistente Upstash.
- **ANALYTICS_KEY_PREFIX**: namespace exclusivo, separado entre Production e Preview.

Nunca adicione o prefixo **VITE_** a credenciais. O site público funciona sem configuração administrativa; relatórios e coleta ficam bloqueados até as credenciais e o banco estarem prontos. A existência do formulário de login não expõe dados do painel. O histórico de produção é separado do local.

A função **api/analytics.js** usa o runtime Node.js da Vercel. O **vercel.json** configura build, rotas, cache privado e cabeçalhos. Imagens pequenas são versionadas como arquivos binários normais, sem depender de Git LFS.

## Segurança
Senha com scrypt e salt, sessões assinadas e registradas no banco, revogação ao sair, cookies HttpOnly/Secure/SameSite, validação de origem e de payload, limitação compartilhada via Redis e resposta fechada em falhas. Consulte [SECURITY.md](SECURITY.md).

A CSP permite apenas scripts da própria origem e o hash do JSON-LD. Se editar o bloco JSON-LD do HTML, atualize o hash no vercel.json; o build detecta divergências. Source maps e arquivos privados não são publicados. A verificação de publicação procura segredos conhecidos no código e nos artefatos.

## Como as métricas funcionam
Cada carregamento do portfólio conta uma view; mudar de âncora não. Visitas ao painel e testes não contam. Não há histórico demonstrativo: datas anteriores à coleta aparecem sem histórico.

Visitantes são identificadores aleatórios por navegador; sessões expiram após 30 minutos de inatividade. Tempo ativo é uma estimativa com a aba visível e atividade recente. Cliques de contato indicam intenção e não confirmam mensagens enviadas. Do Not Track e Global Privacy Control são respeitados.

Os períodos incluem o dia atual em America/Sao_Paulo. Três meses e um ano usam meses de calendário. Comparações só aparecem com cobertura do período anterior. Eventos são retidos por 800 dias; o contador total é preservado. Nenhum IP bruto, nome, e-mail, mensagem ou URL completa de referência é salvo nos eventos. Contadores de segurança usam chaves HMAC temporárias.

## Verificações
~~~sh
npm run lint
npm run check:server
npm test
npm run build
npm audit --audit-level=moderate
~~~

O build inclui verificação de exposição de arquivos e CSP. Os testes cobrem raciocínio e rotas do Nó, períodos, coleta, persistência, métricas, login, sessões, revogação, limites e falhas. O workflow GitHub Actions executa essas verificações em push e pull request. Dependabot acompanha atualizações.

Um override de minimatch 11 corrige o alerta de amplificação de padrões nas ferramentas de desenvolvimento; lint, build e testes verificam a compatibilidade.

## Estrutura
- **src/components**: site, componentes compartilhados, Nó e painel.
- **src/analytics**: coleta no navegador e contratos das métricas.
- **server**: validação, autenticação, relatórios, armazenamento e adaptador local.
- **api**: função de produção.
- **scripts**: geração de credenciais e verificação de publicação.
- **tests**: testes isolados, sem alterar o histórico real.
- **public**: imagens, ícone, robots e sitemap.

Referências de integração: [funções Node.js da Vercel](https://vercel.com/docs/functions/runtimes/node-js), [variáveis de ambiente](https://vercel.com/docs/environment-variables), [Redis REST e Lua](https://upstash.com/docs/redis/features/restapi).

© 2026 Lucas Costa Vaz. Todos os direitos reservados.
