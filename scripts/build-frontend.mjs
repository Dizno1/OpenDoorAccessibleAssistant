import { cp, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(join(root, 'index.html'), join(dist, 'index.html'));
// Preserve the application's existing relative asset paths and local data.
for (const directory of ['css', 'js', 'docs', 'tools', 'workflows']) {
  await cp(join(root, directory), join(dist, directory), { recursive: true });
}
console.log('Prepared isolated frontend assets in dist/');
