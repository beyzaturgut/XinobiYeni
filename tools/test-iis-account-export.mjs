// Run against a production export built with the IIS packaging environment.
// The API is intercepted: no real accounts, SMTP, SQL or remote requests are used.
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';

const root=path.resolve('apps/web/out');
const require=createRequire(path.resolve('apps/web/package.json'));
const {chromium}=require('@playwright/test');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=new URL(req.url,'http://localhost').pathname;
  let file=path.resolve(root,'.'+decodeURIComponent(pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(404).end();return;}
  if(pathname.endsWith('/')||!path.extname(file))file=path.join(file,'index.html');
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});
  res.end(await readFile(file));
 }catch{res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
 browser=await chromium.launch({headless:true,...(process.platform==='darwin'?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{})});
 const page=await browser.newPage();
 let loginRequest;
 await page.route('**/api/**',async route=>{
  const request=route.request();
  if(new URL(request.url()).pathname==='/api/v1/auth/web/login'){
   loginRequest=request;
   await route.fulfill({status:401,json:{title:'Export login reached the API',code:'invalid_credentials'}});
  }else if(new URL(request.url()).pathname==='/api/v1/catalog/storefront'){
   await route.fulfill({json:{products:[],prices:{},content:{slides:[]}}});
  }else await route.fulfill({status:401,json:{code:'unauthorized'}});
 });
 await page.goto(`http://127.0.0.1:${server.address().port}/hesap/`);
 await page.getByRole('button',{name:'Giriş yap',exact:true}).first().click();
 const dialog=page.getByRole('dialog',{name:'Giriş yap'});
 await dialog.getByLabel('E-posta adresi').fill('export-test@example.invalid');
 await dialog.getByLabel('Parola',{exact:true}).fill('export-test-password-1');
 await dialog.getByRole('button',{name:'Giriş yap',exact:true}).click();
 await page.getByText('Export login reached the API',{exact:true}).waitFor();
 assert.equal(loginRequest.method(),'POST');
 assert.equal(loginRequest.headers()['x-xinobi-csrf'],'1');
 assert.equal(loginRequest.postDataJSON().email,'export-test@example.invalid');
 console.log('PASS: exported account form sends a same-origin login request with CSRF and displays the API response.');
}finally{
 await browser?.close();
 await new Promise(resolve=>server.close(resolve));
}
