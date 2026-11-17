// Builds the image as `farseer:local`:  npm run docker:build [tag]
//
// Passes the optional `extra_ca` build secret when DOCKER_EXTRA_CA or
// NODE_EXTRA_CA_CERTS names a certificate file. That is for a machine whose
// antivirus or proxy re-signs HTTPS (Avast does). It ends up in no layer.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const tag = process.argv[2] ?? 'farseer:local';
const args = ['build', '-t', tag];

const ca = process.env.DOCKER_EXTRA_CA || process.env.NODE_EXTRA_CA_CERTS;
if (ca && existsSync(ca)) {
  args.push('--secret', `id=extra_ca,src=${ca}`);
  console.log(`Using the extra CA from ${ca}`);
}

args.push('.');

const result = spawnSync('docker', args, {
  stdio: 'inherit',
  env: { ...process.env, DOCKER_BUILDKIT: '1' },
});
process.exit(result.status ?? 1);
