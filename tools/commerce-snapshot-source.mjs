import {access,readFile} from 'node:fs/promises';
import path from 'node:path';

export async function readCommerceSnapshot(dataDirectory, fetchSnapshot=globalThis.fetch){
 let sqlCatalog;
 try{await access(path.join(dataDirectory,'catalog-sql.enabled'));sqlCatalog=true;}
 catch(error){if(error.code!=='ENOENT')throw error;sqlCatalog=false;}
 if(!sqlCatalog)return JSON.parse(await readFile(path.join(dataDirectory,'state.json'),'utf8'));
 const response=await fetchSnapshot('http://127.0.0.1:5003/api/v1/local-commerce/state',{signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error(`SQL catalog export failed (${response.status}); refusing an outdated file snapshot.`);
 if(response.headers.get('x-xinobi-catalog-storage')!=='SqlServer')throw new Error('The running API is not using SQL; restart it before packaging.');
 return response.json();
}
