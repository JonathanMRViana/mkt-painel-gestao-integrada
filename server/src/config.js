import 'dotenv/config';

function required(name){
  const value=process.env[name]?.trim();
  if(!value)throw new Error(`Variavel obrigatoria ausente: ${name}`);
  return value;
}

function booleanValue(name,defaultValue){
  const value=process.env[name];
  return value===undefined?defaultValue:String(value).toLowerCase()==='true';
}

export function getConfig(){
  return {
    port:Number(process.env.PORT||3000),
    sql:{
      server:required('DB_SERVER'),
      port:Number(process.env.DB_PORT||1433),
      database:required('DB_DATABASE'),
      user:required('DB_USER'),
      password:required('DB_PASSWORD'),
      options:{
        encrypt:booleanValue('DB_ENCRYPT',true),
        trustServerCertificate:booleanValue('DB_TRUST_CERTIFICATE',false)
      },
      pool:{max:10,min:0,idleTimeoutMillis:30000}
    },
    allowedOrigins:(process.env.ALLOWED_ORIGINS||'').split(',').map(v=>v.trim()).filter(Boolean),
    syncAdminKey:required('SYNC_ADMIN_KEY'),
    syncIntervalMinutes:Math.max(1,Number(process.env.SYNC_INTERVAL_MINUTES||10)),
    syncOnStart:booleanValue('SYNC_ON_START',true)
  };
}

