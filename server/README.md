# Ponte Google Sheets -> SQL Server

Este servico mantem as planilhas publicas como entrada operacional, armazena copias versionadas dos CSVs no SQL Server e fornece o mesmo CSV ao painel por uma API segura.

## O que fica preservado

- Os assistentes continuam preenchendo o Google Sheets.
- O painel continua usando os mesmos processamentos e calculos.
- Cada alteracao de CSV gera uma versao historica no SQL.
- Se o Google Sheets ficar indisponivel, a ultima carga valida permanece no banco.

## Preparacao pela TI

1. Criar o banco `PainelGestaoMakro` em homologacao.
2. Usar a conta ADM apenas para executar `database/001_schema.sql` e criar a conta tecnica.
3. Criar o login tecnico `painel_makro_app` sem permissao de administrador.
4. Conceder a essa conta somente leitura e gravacao no banco do painel.
5. Liberar saida HTTPS do servidor para `docs.google.com`.
6. Disponibilizar Node.js 20 ou superior no servidor da aplicacao.

Exemplo de permissoes, que deve ser revisado pela TI:

```sql
USE PainelGestaoMakro;
CREATE USER [painel_makro_app] FOR LOGIN [painel_makro_app];
ALTER ROLE db_datareader ADD MEMBER [painel_makro_app];
ALTER ROLE db_datawriter ADD MEMBER [painel_makro_app];
```

A aplicacao nao deve utilizar a senha ADM.

## Instalacao

No diretorio `server`:

```powershell
Copy-Item .env.example .env
npm ci
npm run db:apply
npm run sync
npm start
```

Edite `.env` somente no servidor. Esse arquivo e ignorado pelo Git.

## Conferencia antes da virada

1. Abra `GET /api/health` e confirme `database: connected`.
2. Abra `GET /api/sources` e confirme 27 fontes sem falhas.
3. Compare uma fonte, por exemplo `/api/data/aet.csv`, com o CSV publico correspondente.
4. Mantenha `mode: 'sheets'` em `config.js` durante a homologacao.
5. Depois da conciliacao, altere para `mode: 'sql'` e informe a URL publica da API.

Enquanto `fallbackToSheets` estiver ativo, uma indisponibilidade da API faz o painel tentar o CSV publico. Depois da estabilizacao do ambiente, a TI pode desativar essa contingencia alterando o valor para `false`.

## Rotas

- `GET /api/health`: saude do servico e do SQL.
- `GET /api/sources`: ultima sincronizacao de cada fonte.
- `GET /api/data/:key.csv`: ultima copia valida da fonte.
- `POST /api/admin/sync`: sincronizacao manual; exige o cabecalho `x-sync-key`.

## Operacao

O processo sincroniza automaticamente no intervalo de `SYNC_INTERVAL_MINUTES`. Uma falha nao apaga a ultima carga valida. O historico fica em `dbo.CsvSnapshots` e as execucoes em `dbo.SyncRuns`.
