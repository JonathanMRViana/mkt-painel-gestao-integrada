SET NOCOUNT ON;
GO

IF OBJECT_ID('dbo.DataSources','U') IS NULL
BEGIN
  CREATE TABLE dbo.DataSources(
    SourceKey VARCHAR(80) NOT NULL CONSTRAINT PK_DataSources PRIMARY KEY,
    DisplayName NVARCHAR(200) NOT NULL,
    PublicUrl NVARCHAR(MAX) NOT NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_DataSources_IsActive DEFAULT(1),
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_DataSources_CreatedAt DEFAULT(SYSUTCDATETIME()),
    UpdatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_DataSources_UpdatedAt DEFAULT(SYSUTCDATETIME())
  );
END;
GO

IF OBJECT_ID('dbo.SyncRuns','U') IS NULL
BEGIN
  CREATE TABLE dbo.SyncRuns(
    SyncRunId BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_SyncRuns PRIMARY KEY,
    SourceKey VARCHAR(80) NOT NULL,
    StartedAt DATETIME2(3) NOT NULL,
    CompletedAt DATETIME2(3) NULL,
    Status VARCHAR(20) NOT NULL,
    ContentHash CHAR(64) NULL,
    RowCount INT NULL,
    ErrorMessage NVARCHAR(2000) NULL,
    CONSTRAINT FK_SyncRuns_DataSources FOREIGN KEY(SourceKey) REFERENCES dbo.DataSources(SourceKey),
    CONSTRAINT CK_SyncRuns_Status CHECK(Status IN('SUCCESS','FAILED'))
  );
  CREATE INDEX IX_SyncRuns_SourceKey_StartedAt ON dbo.SyncRuns(SourceKey,StartedAt DESC);
END;
GO

IF OBJECT_ID('dbo.CsvSnapshots','U') IS NULL
BEGIN
  CREATE TABLE dbo.CsvSnapshots(
    SnapshotId BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_CsvSnapshots PRIMARY KEY,
    SourceKey VARCHAR(80) NOT NULL,
    ContentHash CHAR(64) NOT NULL,
    RowCount INT NOT NULL,
    CsvContent NVARCHAR(MAX) NOT NULL,
    CapturedAt DATETIME2(3) NOT NULL,
    SyncRunId BIGINT NOT NULL,
    CONSTRAINT FK_CsvSnapshots_DataSources FOREIGN KEY(SourceKey) REFERENCES dbo.DataSources(SourceKey),
    CONSTRAINT FK_CsvSnapshots_SyncRuns FOREIGN KEY(SyncRunId) REFERENCES dbo.SyncRuns(SyncRunId),
    CONSTRAINT UQ_CsvSnapshots_SourceHash UNIQUE(SourceKey,ContentHash)
  );
  CREATE INDEX IX_CsvSnapshots_SourceKey_CapturedAt ON dbo.CsvSnapshots(SourceKey,CapturedAt DESC);
END;
GO

IF OBJECT_ID('dbo.LatestCsv','U') IS NULL
BEGIN
  CREATE TABLE dbo.LatestCsv(
    SourceKey VARCHAR(80) NOT NULL CONSTRAINT PK_LatestCsv PRIMARY KEY,
    ContentHash CHAR(64) NOT NULL,
    RowCount INT NOT NULL,
    CsvContent NVARCHAR(MAX) NOT NULL,
    CapturedAt DATETIME2(3) NOT NULL,
    SyncRunId BIGINT NOT NULL,
    CONSTRAINT FK_LatestCsv_DataSources FOREIGN KEY(SourceKey) REFERENCES dbo.DataSources(SourceKey),
    CONSTRAINT FK_LatestCsv_SyncRuns FOREIGN KEY(SyncRunId) REFERENCES dbo.SyncRuns(SyncRunId)
  );
END;
GO

CREATE OR ALTER VIEW dbo.vw_SyncStatus AS
SELECT
  s.SourceKey,
  s.DisplayName,
  l.RowCount,
  l.CapturedAt LastSuccessfulSync,
  lastRun.Status LastRunStatus,
  lastRun.StartedAt LastRunStartedAt,
  lastRun.ErrorMessage
FROM dbo.DataSources s
LEFT JOIN dbo.LatestCsv l ON l.SourceKey=s.SourceKey
OUTER APPLY(
  SELECT TOP 1 r.Status,r.StartedAt,r.ErrorMessage
  FROM dbo.SyncRuns r
  WHERE r.SourceKey=s.SourceKey
  ORDER BY r.SyncRunId DESC
)lastRun
WHERE s.IsActive=1;
GO

