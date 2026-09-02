import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {getPool,closePool} from '../src/db.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const sqlText=await fs.readFile(path.join(here,'../database/001_schema.sql'),'utf8');
const batches=sqlText.split(/^\s*GO\s*$/gim).map(value=>value.trim()).filter(Boolean);
const pool=await getPool();
for(const batch of batches)await pool.request().batch(batch);
console.log(`Banco preparado com ${batches.length} lotes SQL.`);
await closePool();

