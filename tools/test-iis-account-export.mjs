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
 let loginRequest,verificationRequest,registrationRequest,resetRequest;
 let verificationAttempts=0,registered=false,resetPassword;
 await page.route('**/api/**',async route=>{
  const request=route.request();
  if(new URL(request.url()).pathname==='/api/v1/auth/web/login'){
   loginRequest=request;
   if(resetPassword&&request.postDataJSON().password===resetPassword){
    registered=true;
    await route.fulfill({json:{id:'export-customer',name:'Export Customer',email:'export-test@example.invalid'}});
   }else await route.fulfill({status:401,json:{title:'Export login reached the API',code:'invalid_credentials'}});
  }else if(new URL(request.url()).pathname==='/api/v1/auth/password-reset'){
   await route.fulfill({json:{verificationId:'export-reset',email:request.postDataJSON().email,expiresAt:new Date(Date.now()+600000).toISOString()}});
  }else if(new URL(request.url()).pathname==='/api/v1/auth/password-reset/confirm'){
   resetRequest=request;
   resetPassword=request.postDataJSON().newPassword;
   await route.fulfill({status:204});
  }else if(new URL(request.url()).pathname==='/api/v1/auth/email-verification'){
   verificationRequest=request;
   if(++verificationAttempts===1)await route.fulfill({status:503,json:{title:'SMTP test unavailable',code:'email_unavailable'}});
   else await route.fulfill({json:{verificationId:'export-verification',email:'export-test@example.invalid',expiresAt:new Date(Date.now()+600000).toISOString()}});
  }else if(new URL(request.url()).pathname==='/api/v1/auth/web/register'){
   registrationRequest=request;
   if(request.postDataJSON().verificationCode!=='654321')await route.fulfill({status:400,json:{title:'Test verification code rejected'}});
   else{
    registered=true;
    await route.fulfill({json:{id:'export-customer',name:'Export Customer',email:'export-test@example.invalid'}});
   }
  }else if(registered&&new URL(request.url()).pathname.startsWith('/api/v1/me/')){
   await route.fulfill({json:new URL(request.url()).pathname.endsWith('/inbox')?{items:[],unread:0}:[]});
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
 await dialog.getByRole('button',{name:'Yeni hesap',exact:true}).click();
 await dialog.getByLabel('Ad soyad').fill('Export Customer');
 await dialog.getByLabel('E-posta adresi').fill('export-test@example.invalid');
 await dialog.getByLabel('Parola',{exact:true}).fill('export-test-password-1');
 await dialog.getByRole('button',{name:'Doğrulama kodu gönder',exact:true}).click();
 await dialog.getByText('SMTP test unavailable',{exact:true}).waitFor();
 await dialog.getByRole('button',{name:'Doğrulama kodu gönder',exact:true}).click();
 await dialog.getByLabel('Doğrulama kodu').fill('123456');
 await dialog.getByRole('button',{name:'E-postayı doğrula ve hesabı oluştur',exact:true}).click();
 await dialog.getByText('Test verification code rejected',{exact:true}).waitFor();
 await dialog.getByLabel('Doğrulama kodu').fill('654321');
 await dialog.getByRole('button',{name:'E-postayı doğrula ve hesabı oluştur',exact:true}).click();
 await dialog.waitFor({state:'hidden'});
 assert.equal(verificationRequest.headers()['x-xinobi-csrf'],'1');
 assert.equal(verificationRequest.postDataJSON().email,'export-test@example.invalid');
 assert.equal(registrationRequest.postDataJSON().verificationId,'export-verification');
 assert.equal(registrationRequest.postDataJSON().verificationCode,'654321');
 assert.equal(registrationRequest.headers()['x-xinobi-csrf'],'1');
 assert.equal(registered,true);
 console.log('PASS: registration uses the production verification endpoint, shows delivery/code errors and submits the verification ID with the code.');
 registered=false;
 await page.reload();
 await page.getByRole('button',{name:'Giriş yap',exact:true}).first().click();
 await dialog.getByRole('button',{name:'Parolamı unuttum',exact:true}).click();
 await dialog.getByLabel('E-posta adresi').fill('export-test@example.invalid');
 await dialog.getByRole('button',{name:'Sıfırlama kodu gönder',exact:true}).click();
 await dialog.getByLabel('Sıfırlama kodu').waitFor();
 assert.equal(await dialog.getByLabel('Sıfırlama kodu').inputValue(),'');
 assert.equal(await dialog.getByLabel('Yeni parola',{exact:true}).inputValue(),'');
 await dialog.getByLabel('Sıfırlama kodu').fill('654321');
 await dialog.getByLabel('Yeni parola',{exact:true}).fill('replacement-export-password-2');
 await dialog.getByRole('button',{name:'Parolayı değiştir',exact:true}).click();
 await dialog.getByText('Parolan değiştirildi ve tüm cihazlardaki oturumların kapatıldı. Yeni parolanla giriş yap.',{exact:true}).waitFor();
 assert.equal(resetRequest.postDataJSON().verificationId,'export-reset');
 assert.equal(resetRequest.postDataJSON().verificationCode,'654321');
 assert.equal(resetRequest.postDataJSON().newPassword,'replacement-export-password-2');
 await dialog.getByLabel('E-posta adresi').fill('export-test@example.invalid');
 await dialog.getByLabel('Parola',{exact:true}).fill('export-test-password-1');
 await dialog.getByRole('button',{name:'Giriş yap',exact:true}).click();
 await dialog.getByText('Export login reached the API',{exact:true}).waitFor();
 await dialog.getByLabel('Parola',{exact:true}).fill('replacement-export-password-2');
 await dialog.getByRole('button',{name:'Giriş yap',exact:true}).click();
 await dialog.waitFor({state:'hidden'});
 console.log('PASS: reset code starts empty, reset submits the new password and subsequent login uses the entered replacement password.');
}finally{
 await browser?.close();
 await new Promise(resolve=>server.close(resolve));
}
