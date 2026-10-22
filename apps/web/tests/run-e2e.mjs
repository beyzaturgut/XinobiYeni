import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {publishProductPreviews} from '../../../tools/publish-product-previews.mjs';
const require=createRequire(import.meta.url);
// Build the actual UI with same-origin test endpoints. serve-export.mjs refuses
// every write request; browser contract fixtures handle account/quote/chat writes.
const env={...process.env,
  NEXT_PUBLIC_COMMERCE_API_URL:'/api/v1/local-commerce',
  NEXT_PUBLIC_DESIGN_API_URL:'/api/v1/design-studio',
  // Surface specs exercise the development preview bridge; live builds never set this.
  NEXT_PUBLIC_DEV_SURFACE_BRIDGE:'1',
};
function run(cli,args){
  const result=spawnSync(process.execPath,[cli,...args],{stdio:'inherit',env});
  if(result.error)throw result.error;
  if(result.status!==0)process.exit(result.status??1);
}
run(require.resolve('next/dist/bin/next'),['build']);
// Replace whatever previews the developer's local catalogue published into public/ with the packaged reviewed
// bundles for the test catalogue (see playwright.config.ts), so preview specs do not depend on local data.
const root=path.resolve('../..');
await publishProductPreviews(root,path.resolve('out'),JSON.parse(await readFile(path.join(root,'fixtures/product-surfaces/xinobi-u-accepted/catalog-state.fragment.json'),'utf8')));
run(require.resolve('@playwright/test/cli'),['test',...process.argv.slice(2)]);
