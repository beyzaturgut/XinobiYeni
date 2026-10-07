// Fails when the web palette (apps/web/src/app/globals.css) and design/tokens.json disagree.
// The web changed to black and white on 06.10.2026 without the token file, and the mobile app inherited the old green palette.
import { readFile } from 'node:fs/promises';

const tokens = JSON.parse(await readFile(new URL('../design/tokens.json', import.meta.url), 'utf8'));
const css = await readFile(new URL('../apps/web/src/app/globals.css', import.meta.url), 'utf8');
const pairs = { ink: 'ink', muted: 'muted', canvas: 'canvas', surface: 'surface', deep: 'deep', teal: 'teal', tealHover: 'teal-hover', line: 'line' };
const problems = [];
for (const [token, variable] of Object.entries(pairs)) {
  const web = css.match(new RegExp(`--color-${variable}:\\s*(#[0-9a-fA-F]{6})`))?.[1];
  if (!web) problems.push(`--color-${variable} missing in globals.css`);
  else if (web.toUpperCase() !== tokens.color[token]?.toUpperCase()) problems.push(`${token}: tokens.json ${tokens.color[token]} ≠ web ${web}`);
}
if (problems.length) {
  console.error(`design/tokens.json is out of step with the web palette:\n  ${problems.join('\n  ')}\nUpdate design/tokens.json, then run pnpm tokens:mobile.`);
  process.exit(1);
}
console.log(`design tokens ${tokens.version} match the web palette`);
