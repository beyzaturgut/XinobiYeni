import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { publishProductPreviews } from './publish-product-previews.mjs';
// Make reviewed visual prototypes available without requiring the optional development review services.
// The browser still checks each association against the current API catalog before using it.
const previewState=JSON.parse(await readFile('fixtures/product-surfaces/xinobi-u-accepted/catalog-state.fragment.json','utf8'));
await publishProductPreviews(process.cwd(),'apps/web/public',previewState);
const children = [
  spawn('dotnet', ['run', '--project', 'services/api/Xinobi.Api.csproj', '--launch-profile', 'http', '--no-restore', '-p:OpenApiGenerateDocumentsOnBuild=false'], { stdio: 'inherit' }),
  spawn('pnpm', ['--filter', 'web', 'dev', '--hostname', '127.0.0.1', '--port', '3000'], { stdio: 'inherit' }),
  spawn('pnpm', ['--filter', 'admin', 'dev', '--host', '127.0.0.1', '--port', '5173', '--strictPort'], { stdio: 'inherit' }),
];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill('SIGTERM');
  process.exitCode = code;
}
for (const child of children) {
  child.on('error', error => { console.error(error.message); stop(1); });
  child.on('exit', code => { if (!stopping) stop(code || 0); });
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
