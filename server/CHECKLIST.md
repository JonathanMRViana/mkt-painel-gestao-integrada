# Checklist de implantacao

## Dados que a TI deve fornecer

- Nome do servidor e da instancia SQL.
- Porta do SQL Server.
- Nome do banco de homologacao.
- Usuario tecnico exclusivo da aplicacao.
- Senha temporaria ou forma segura de cadastrar a senha no servidor.
- Indicacao se a conexao exige criptografia e certificado interno.
- Nome do servidor Windows que executara o servico.
- Dominio HTTPS definitivo da API.

Nao envie a senha ADM por GitHub, e-mail aberto ou arquivo do projeto.

## Ordem da implantacao

1. A TI cria o banco `PainelGestaoMakro`.
2. A TI executa `database/001_schema.sql` no banco.
3. A TI cria o login tecnico `painel_makro_app` com uma senha propria.
4. A TI executa `database/002_permissions.sql`.
5. No servidor da aplicacao, copie `.env.example` para `.env` e preencha a conta tecnica.
6. Execute `npm ci`.
7. Execute `npm run sync`.
8. Consulte `SELECT * FROM dbo.vw_SyncStatus ORDER BY DisplayName` e confirme 27 fontes.
9. Execute `npm start` e valide `/api/health`, `/api/sources` e `/api/data/aet.csv`.
10. Compare os totais do AET no SQL e no painel ainda em modo `sheets`.
11. Em homologacao, altere `config.js` para `mode: 'sql'`.
12. Valide todos os paineis antes de publicar a troca.

## Criterios de aceite

- 27 fontes com ultima carga `SUCCESS`.
- Nenhum CSV vazio ou HTML salvo como fonte.
- Quantidades iguais entre Google Sheets e SQL.
- Painel sem erros no console.
- Atualizacao automatica confirmada.
- Senha ADM ausente do codigo, `.env` e Git.
- Conta tecnica sem permissao de administrador.

