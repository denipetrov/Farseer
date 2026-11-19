// Builds the image as `farseer:local`:  npm run docker:build [tag]
//
// Finds the two build secrets the Dockerfile takes, so the command is the same
// on every machine:
//   npm_token  NPM_TOKEN, or else the GitHub Packages token in ~/.npmrc
//              (`@denipetrov/spirit-link` is a private GitHub package)
//   extra_ca   the file DOCKER_EXTRA_CA or NODE_EXTRA_CA_CERTS names, when set —
//              for a machine whose antivirus or proxy re-signs HTTPS (Avast does)
//
// Neither is printed, and neither ends up in a layer of the image.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

function npmToken() {
  if (process.env.NPM_TOKEN) return process.env.NPM_TOKEN;

  const npmrc = join(homedir(), '.npmrc');
  if (!existsSync(npmrc)) return null;

  const line = readFileSync(npmrc, 'utf8')
    .split(/\r?\n/)
    .find((entry) => entry.startsWith('//npm.pkg.github.com/:_authToken='));

  return line ? line.slice(line.indexOf('=') + 1).trim() : null;
}

const token = npmToken();
if (!token) {
  console.error(
    'No GitHub Packages token: set NPM_TOKEN, or add //npm.pkg.github.com/:_authToken to ~/.npmrc',
  );
  process.exit(1);
}

const tag = process.argv[2] ?? 'farseer:local';
const args = ['build', '--secret', 'id=npm_token,env=NPM_TOKEN', '-t', tag];

const ca = process.env.DOCKER_EXTRA_CA || process.env.NODE_EXTRA_CA_CERTS;
if (ca && existsSync(ca)) {
  args.push('--secret', `id=extra_ca,src=${ca}`);
  console.log(`Using the extra CA from ${ca}`);
}

args.push('.');

const result = spawnSync('docker', args, {
  stdio: 'inherit',
  env: { ...process.env, NPM_TOKEN: token, DOCKER_BUILDKIT: '1' },
});
process.exit(result.status ?? 1);
