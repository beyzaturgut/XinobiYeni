import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
// Build the actual UI with same-origin test endpoints. serve-export.mjs refuses
// every write request; browser contract fixtures handle account/quote/chat writes.
const env={...process.env,
  NEXT_PUBLIC_COMMERCE_API_URL:'/api/v1/local-commerce',
  NEXT_PUBLIC_DESIGN_API_URL:'/api/v1/design-studio',
  NEXT_PUBLIC_EMAIL_VERIFICATION_API_URL:'/api/v1/email-verification',
  // Surface specs exercise the development preview bridge; live builds never set this.
  NEXT_PUBLIC_DEV_SURFACE_BRIDGE:'1',
};
for(const [cli,args] of [
  [require.resolve('next/dist/bin/next'),['build']],
  [require.resolve('@playwright/test/cli'),['test',...process.argv.slice(2)]],
]){
  const result=spawnSync(process.execPath,[cli,...args],{stdio:'inherit',env});
  if(result.error)throw result.error;
  if(result.status!==0)process.exit(result.status??1);
}
