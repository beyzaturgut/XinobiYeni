import { spawn } from 'node:child_process';
import { openSync, closeSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const logPath = '/tmp/xinobi-local.log';
const log = openSync(logPath, 'a');
const child = spawn(process.execPath, ['tools/dev-local.mjs'], {
  cwd: root, detached: true, stdio: ['ignore', log, log],
});
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.unref();
closeSync(log);
console.log(`Local servisler başlatıldı. PID: ${child.pid}. Log: ${logPath}`);
