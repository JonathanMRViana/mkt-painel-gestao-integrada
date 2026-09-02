import {syncAll} from '../src/sync.js';
import {closePool} from '../src/db.js';

const results=await syncAll();
console.table(results.map(({key,status,rows,error})=>({key,status,rows:rows||0,error:error||''})));
await closePool();
if(results.some(item=>item.status==='failed'))process.exitCode=1;

