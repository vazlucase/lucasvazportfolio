# Segurança

O painel em `/painel` e seu alias `/admin` exigem senha. A tela de login e o código de interface são públicos; relatórios, exportações e dados individuais só são entregues pela API após autenticação no servidor.

- A senha é verificada com scrypt e salt aleatório. O servidor recebe `ANALYTICS_ADMIN_PASSWORD_HASH`, nunca uma senha embutida no código.
- A assinatura de sessão depende do segredo e do hash da senha. Alterar qualquer um invalida as sessões existentes.
- Cada sessão tem nonce aleatório, validade de oito horas e registro no armazenamento. Sair remove o registro, impedindo a reutilização do cookie anterior.
- Na Vercel, cookies usam `__Host-`, `Secure`, `HttpOnly`, `SameSite=Strict` e `Path=/`, sem `Domain`. No desenvolvimento HTTP há um cookie separado e acesso limitado ao loopback.
- Limites de login, coleta e consultas usam Redis em produção, compartilhados entre instâncias. As chaves de limite usam HMAC do IP; não armazenam o IP em texto. Contadores e sessões expiram automaticamente.
- Requisições de escrita exigem JSON, origem exata e corpo limitado. Relatórios e exportações não são armazenados em cache.
- Falhas de credenciais ou armazenamento bloqueiam o acesso; erros de banco e valores de configuração não são enviados ao cliente.
- `.env*`, `secrets/`, `.analytics-data/`, metadados da Vercel, builds e chaves privadas ficam fora do Git e do envio pela CLI da Vercel.
- O build não gera source maps e confere arquivos públicos contra segredos conhecidos. A CSP restringe scripts à própria origem e ao hash do JSON-LD, bloqueia frames e plugins e restringe formulários à própria origem.

## Operação

Use bancos ou prefixos separados em Production e Preview. Não disponibilize credenciais de produção a builds de forks ou branches sem revisão. Proteções adicionais de conta e de deployment são administradas na Vercel e no GitHub, incluindo autenticação em duas etapas.

Para trocar o acesso, gere novas credenciais em um checkout limpo com `npm run setup:production`, atualize **tanto** o hash quanto o segredo na Vercel e faça um novo deployment. Guarde a senha em um gerenciador. A geração preserva arquivos existentes para evitar troca acidental.

Se uma credencial for publicada, revogue-a no serviço de origem e substitua-a. Apagar apenas o arquivo não remove o segredo do histórico Git.

O endpoint de coleta é público por necessidade. Validação, limitação e filtro de robôs reduzem abuso; não provam que toda visita é humana. O identificador de visitante representa um navegador. Não usar estes números como confirmação de venda ou envio de mensagem.

## Relatar um problema

Relate privadamente ao proprietário pelo contato do portfólio. Não inclua senhas, tokens, cookies ou dados de visitantes em issues públicas.
