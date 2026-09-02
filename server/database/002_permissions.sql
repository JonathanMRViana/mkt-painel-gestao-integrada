/*
  Execute depois que a TI criar o login de servidor [painel_makro_app].
  A senha e criada fora deste arquivo e nunca deve ser salva no repositorio.
*/
USE [PainelGestaoMakro];
GO

IF SUSER_ID('painel_makro_app') IS NULL
  ;THROW 50001, 'Crie primeiro o login de servidor painel_makro_app.', 1;
GO

IF USER_ID('painel_makro_app') IS NULL
  CREATE USER [painel_makro_app] FOR LOGIN [painel_makro_app];
GO

GRANT SELECT,INSERT,UPDATE ON dbo.DataSources TO [painel_makro_app];
GRANT SELECT,INSERT ON dbo.SyncRuns TO [painel_makro_app];
GRANT SELECT,INSERT ON dbo.CsvSnapshots TO [painel_makro_app];
GRANT SELECT,INSERT,UPDATE ON dbo.LatestCsv TO [painel_makro_app];
GRANT SELECT ON dbo.vw_SyncStatus TO [painel_makro_app];
GO
