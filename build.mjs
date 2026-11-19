// Builds the n8n package: each credential and node file is bundled to CommonJS in dist/, with the shared catalog
// inlined so the published package has no runtime dependencies. Icons sit next to their source files.
import { copyFileSync, rmSync } from 'node:fs';
import { build } from 'esbuild';

rmSync('dist', { recursive: true, force: true });
const files = ['credentials/GenehApi.credentials', 'credentials/GenehBusinessApi.credentials', 'nodes/Geneh/Geneh.node', 'nodes/GenehTrigger/GenehTrigger.node'];
for (const f of files) {
  await build({
    entryPoints: [`${f}.ts`],
    outfile: `dist/${f}.js`,
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    external: ['n8n-workflow'],
    legalComments: 'none',
    logLevel: 'warning',
  });
}
for (const dir of ['credentials', 'nodes/Geneh', 'nodes/GenehTrigger']) {
  for (const icon of ['geneh.svg', 'geneh.dark.svg']) copyFileSync(`${dir}/${icon}`, `dist/${dir}/${icon}`);
}
