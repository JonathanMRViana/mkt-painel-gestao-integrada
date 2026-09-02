import sql from 'mssql';
import {getConfig} from './config.js';

let poolPromise;

export function getPool(){
  if(!poolPromise){
    poolPromise=new sql.ConnectionPool(getConfig().sql).connect();
  }
  return poolPromise;
}

export async function closePool(){
  if(!poolPromise)return;
  const pool=await poolPromise;
  poolPromise=undefined;
  await pool.close();
}

export {sql};

