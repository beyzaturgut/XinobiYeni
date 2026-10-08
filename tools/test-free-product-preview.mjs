// Network-safe canonical renderer validation; provider responses are local/mocked.
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const result = spawnSync(process.execPath, [path.resolve('apps/web/node_modules/@playwright/test/cli.js'), 'test', 'commerce-surface-integration.spec.ts'], { cwd: path.resolve('apps/web'), stdio: 'inherit' });
process.exit(result.status ?? 1);
