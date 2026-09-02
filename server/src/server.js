import path from 'node:path';
import {fileURLToPath} from 'node:url';
import express from 'express';
import helmet from 'helmet';
import {getConfig} from './config.js';
import {getPool,sql,closePool} from './db.js';
import {findSource,sources} from './sources.js';
import {syncAll} from './sync.js';

const config=getConfig();
const app=express();
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');

app.disable('x-powered-by');
app.use(helmet({contentSecurityPolicy:false,crossOriginResourcePolicy:{policy:'cross-origin'}}));
app.use(express.json({limit:'32kb'}));
app.use((req,res,next)=>{
  const origin=req.headers.origin;
  if(origin&&config.allowedOrigins.includes(origin))res.setHeader('Access-Control-Allow-Origin',origin);
  res.setHeader('Vary','Origin');
  if(req.method==='OPTIONS')return res.sendStatus(204);
  next();
});

app.get('/api/health',async(req,res)=>{
  try{
    const pool=await getPool();
    await pool.request().query('SELECT 1 AS ok');
    const status=await pool.request().query(`
      SELECT COUNT(*) SourceCount,MAX(CapturedAt) LastSync
      FROM dbo.LatestCsv
    `);
    res.json({status:'ok',database:'connected',...status.recordset[0]});
  }catch(error){
    res.status(503).json({status:'error',database:'unavailable',message:error.message});
  }
});

app.get('/api/sources',async(req,res)=>{
  const pool=await getPool();
  const result=await pool.request().query(`
    SELECT s.SourceKey,s.DisplayName,l.RowCount,l.CapturedAt,r.Status LastStatus,r.ErrorMessage
    FROM dbo.DataSources s
    LEFT JOIN dbo.LatestCsv l ON l.SourceKey=s.SourceKey
    OUTER APPLY(SELECT TOP 1 Status,ErrorMessage FROM dbo.SyncRuns r WHERE r.SourceKey=s.SourceKey ORDER BY r.SyncRunId DESC)r
    WHERE s.IsActive=1 ORDER BY s.DisplayName
  `);
  res.json(result.recordset);
});

app.get('/api/data/:key.csv',async(req,res)=>{
  const source=findSource(req.params.key);
  if(!source)return res.status(404).json({message:'Fonte desconhecida'});
  const pool=await getPool();
  const result=await pool.request()
    .input('SourceKey',sql.VarChar(80),source.key)
    .query('SELECT CsvContent,ContentHash,RowCount,CapturedAt FROM dbo.LatestCsv WHERE SourceKey=@SourceKey');
  if(!result.recordset.length)return res.status(503).json({message:'Fonte ainda nao sincronizada'});
  const snapshot=result.recordset[0];
  res.setHeader('Content-Type','text/csv; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  res.setHeader('ETag',`"${snapshot.ContentHash}"`);
  res.setHeader('X-Data-Rows',String(snapshot.RowCount));
  res.setHeader('X-Data-Captured-At',new Date(snapshot.CapturedAt).toISOString());
  res.send(snapshot.CsvContent);
});

app.post('/api/admin/sync',async(req,res)=>{
  const supplied=req.get('x-sync-key')||'';
  if(supplied!==config.syncAdminKey)return res.sendStatus(401);
  const results=await syncAll();
  const failed=results.filter(item=>item.status==='failed');
  res.status(failed.length?207:200).json({total:results.length,failed:failed.length,results});
});

app.use('/server',(req,res)=>res.sendStatus(404));
app.use(express.static(root,{index:'index.html',maxAge:0}));
app.get(/.*/,(req,res)=>res.sendFile(path.join(root,'index.html')));
app.use((error,req,res,next)=>{
  console.error(error);
  if(res.headersSent)return next(error);
  res.status(500).json({status:'error',message:'Falha interna do servico'});
});

const server=app.listen(config.port,()=>{
  console.log(`Painel Makro e API em http://localhost:${config.port}`);
  if(config.syncOnStart)syncAll().then(results=>console.log(`Sincronizacao inicial: ${results.filter(r=>r.status==='success').length}/${results.length}`));
});

const timer=setInterval(()=>{
  syncAll().then(results=>console.log(`Sincronizacao agendada: ${results.filter(r=>r.status==='success').length}/${sources.length}`));
},config.syncIntervalMinutes*60*1000);
timer.unref();

async function shutdown(){
  clearInterval(timer);
  server.close(async()=>{await closePool();process.exit(0);});
}
process.on('SIGINT',shutdown);
process.on('SIGTERM',shutdown);
