import {createHash} from 'node:crypto';
import {parse} from 'csv-parse/sync';
import {getPool,sql} from './db.js';
import {sources} from './sources.js';

function hashContent(content){
  return createHash('sha256').update(content,'utf8').digest('hex');
}

function countRows(content){
  return parse(content,{bom:true,relax_column_count:true,skip_empty_lines:true}).length;
}

async function downloadSource(source){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),45000);
  try{
    const separator=source.url.includes('?')?'&':'?';
    const response=await fetch(`${source.url}${separator}sync=${Date.now()}`,{
      signal:controller.signal,
      headers:{'user-agent':'Makro-Painel-SQL-Sync/1.0','cache-control':'no-cache'}
    });
    if(!response.ok)throw new Error(`Google Sheets respondeu HTTP ${response.status}`);
    const content=await response.text();
    if(!content.trim())throw new Error('CSV vazio');
    if(/^\s*<!doctype html|^\s*<html/i.test(content))throw new Error('A fonte retornou HTML em vez de CSV');
    return {content,hash:hashContent(content),rowCount:countRows(content)};
  }finally{
    clearTimeout(timer);
  }
}

async function saveSuccess(source,payload,startedAt){
  const pool=await getPool();
  const transaction=new sql.Transaction(pool);
  await transaction.begin(sql.ISOLATION_LEVEL.READ_COMMITTED);
  try{
    const request=new sql.Request(transaction);
    request.input('SourceKey',sql.VarChar(80),source.key);
    request.input('DisplayName',sql.NVarChar(200),source.name);
    request.input('PublicUrl',sql.NVarChar(sql.MAX),source.url);
    request.input('ContentHash',sql.Char(64),payload.hash);
    request.input('RowCount',sql.Int,payload.rowCount);
    request.input('CsvContent',sql.NVarChar(sql.MAX),payload.content);
    request.input('StartedAt',sql.DateTime2,startedAt);
    await request.query(`
      MERGE dbo.DataSources AS target
      USING (SELECT @SourceKey SourceKey) AS source ON target.SourceKey=source.SourceKey
      WHEN MATCHED THEN UPDATE SET DisplayName=@DisplayName,PublicUrl=@PublicUrl,IsActive=1,UpdatedAt=SYSUTCDATETIME()
      WHEN NOT MATCHED THEN INSERT(SourceKey,DisplayName,PublicUrl,IsActive) VALUES(@SourceKey,@DisplayName,@PublicUrl,1);

      DECLARE @RunId BIGINT;
      INSERT dbo.SyncRuns(SourceKey,StartedAt,CompletedAt,Status,ContentHash,RowCount)
      VALUES(@SourceKey,@StartedAt,SYSUTCDATETIME(),'SUCCESS',@ContentHash,@RowCount);
      SET @RunId=SCOPE_IDENTITY();

      IF NOT EXISTS(SELECT 1 FROM dbo.CsvSnapshots WHERE SourceKey=@SourceKey AND ContentHash=@ContentHash)
        INSERT dbo.CsvSnapshots(SourceKey,ContentHash,RowCount,CsvContent,CapturedAt,SyncRunId)
        VALUES(@SourceKey,@ContentHash,@RowCount,@CsvContent,SYSUTCDATETIME(),@RunId);

      MERGE dbo.LatestCsv AS target
      USING (SELECT @SourceKey SourceKey) AS source ON target.SourceKey=source.SourceKey
      WHEN MATCHED THEN UPDATE SET ContentHash=@ContentHash,RowCount=@RowCount,CsvContent=@CsvContent,CapturedAt=SYSUTCDATETIME(),SyncRunId=@RunId
      WHEN NOT MATCHED THEN INSERT(SourceKey,ContentHash,RowCount,CsvContent,CapturedAt,SyncRunId)
      VALUES(@SourceKey,@ContentHash,@RowCount,@CsvContent,SYSUTCDATETIME(),@RunId);
    `);
    await transaction.commit();
  }catch(error){
    await transaction.rollback();
    throw error;
  }
}

async function saveFailure(source,error,startedAt){
  try{
    const pool=await getPool();
    await pool.request()
      .input('SourceKey',sql.VarChar(80),source.key)
      .input('DisplayName',sql.NVarChar(200),source.name)
      .input('PublicUrl',sql.NVarChar(sql.MAX),source.url)
      .input('StartedAt',sql.DateTime2,startedAt)
      .input('ErrorMessage',sql.NVarChar(2000),String(error.message||error).slice(0,2000))
      .query(`
        MERGE dbo.DataSources AS target
        USING (SELECT @SourceKey SourceKey) AS source ON target.SourceKey=source.SourceKey
        WHEN MATCHED THEN UPDATE SET DisplayName=@DisplayName,PublicUrl=@PublicUrl,UpdatedAt=SYSUTCDATETIME()
        WHEN NOT MATCHED THEN INSERT(SourceKey,DisplayName,PublicUrl,IsActive) VALUES(@SourceKey,@DisplayName,@PublicUrl,1);
        INSERT dbo.SyncRuns(SourceKey,StartedAt,CompletedAt,Status,ErrorMessage)
        VALUES(@SourceKey,@StartedAt,SYSUTCDATETIME(),'FAILED',@ErrorMessage);
      `);
  }catch(logError){
    console.error('Nao foi possivel registrar a falha no SQL:',logError.message);
  }
}

export async function syncSource(source){
  const startedAt=new Date();
  try{
    const payload=await downloadSource(source);
    await saveSuccess(source,payload,startedAt);
    return {key:source.key,status:'success',rows:payload.rowCount,hash:payload.hash};
  }catch(error){
    await saveFailure(source,error,startedAt);
    return {key:source.key,status:'failed',error:error.message};
  }
}

let activeSync;

export function syncAll(){
  if(activeSync)return activeSync;
  activeSync=(async()=>{
    const results=[];
    for(const source of sources)results.push(await syncSource(source));
    return results;
  })().finally(()=>{activeSync=undefined;});
  return activeSync;
}

