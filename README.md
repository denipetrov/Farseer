# Farseer

The World of Warcraft front end for rankwarden.gg. It shows leaderboards, characters, guilds and widgets, using data from the
[Soulseeker](../Soulseeker) API. [docs/soulseeker.md](docs/soulseeker.md) covers how
Farseer talks to Soulseeker: origins, tokens and conventions.

## Stack

- React 19 + TypeScript 6, built with Vite
- TanStack Query for server state
- TanStack Router (file-based routes in `src/routes/`). URL search params act as data filters.
- styled-components, with no UI library
- localStorage for user preferences (`src/preferences/`)
- ESLint, Prettier and Vitest

TypeScript stays on 6.x until typescript-eslint supports TypeScript 7. Soulseeker does the same.

## Getting started

```bash
npm install
cp .env.example .env.local   # VITE_SOULSEEKER_API_URL, local Soulseeker on :3001
npm run dev                  # http://localhost:5173. Keep this port: Soulseeker's CORS allows it
```

| Command                | What it does                                               |
| ---------------------- | ---------------------------------------------------------- |
| `npm run check`        | Typecheck, lint, format check and unit tests: what CI runs |
| `npm test`             | Unit tests (`src/**/*.test.ts(x)`)                         |
| `npm run docker:build` | Builds the image as `farseer:local`                        |
| `npm run docker:run`   | Serves that image on http://localhost:8080                 |

On Windows, run Vitest from a shell whose path uses an uppercase drive letter (`D:\...`, as PowerShell does). From Git Bash's `/d/...`, Vitest loads itself twice and reports "failed to find the current suite".

If an antivirus or proxy re-signs HTTPS on your machine, set `DOCKER_EXTRA_CA` or `NODE_EXTRA_CA_CERTS` to its root certificate before `npm run docker:build`. Otherwise, `npm ci` fails inside the image.

## Configuration

The app reads `/config.js` (`window.__FARSEER_CONFIG__`) before it starts, then falls back to `VITE_*` variables.

- **Locally**, `public/config.js` is left empty, so `.env.local` applies.
- **In the cluster**, the Helm chart replaces `config.js` from `runtimeConfig` in `values.yaml`. One image therefore serves every environment, and changing a value doesn't need a rebuild.

## Styling conventions

1. **`src/styles/palette.ts`** is the only place raw hex values live.
2. **`src/styles/tokens.ts`** maps the palette to shared CSS variables (`--color-bg`, `--color-text`, `--color-accent`, `--space-4`, ...). `--color-accent*` changes with `<html data-faction="horde|alliance">`, which is set from the user's preference.
3. **Components** declare their own local variables, which default to the shared tokens:
   ```ts
   const Panel = styled.section`
     --panel-bg: var(--color-surface);
     background: var(--panel-bg);
   `;
   ```

## CI/CD

It follows Soulseeker's pattern: CI on every change, an image for each version tag, and deploys run by hand.

| Workflow      | Trigger                                   | What it does                                                                                                                                                       |
| ------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ci.yml`      | pull request, push to `main` or `develop` | Typecheck, lint (no warnings allowed), format check, unit tests, build. Lints and renders the Helm chart, parses the scripts, builds the image without pushing it. |
| `release.yml` | tag `v*`                                  | Publishes `ghcr.io/denipetrov/farseer:<tag>` and `:sha-<commit>`. Never `latest`.                                                                                  |
| `deploy.yml`  | manual, input `image_tag`                 | Connects to the DigitalOcean cluster, then runs `create-secrets.sh` and `deploy.sh`                                                                                |

```bash
git tag v0.1.0 && git push origin v0.1.0   # publishes the image
# then run the Deploy workflow with image_tag=v0.1.0
```

### Deployment

Farseer runs in the `farseer` namespace of the same cluster as Rankwarden and Soulseeker. It is one Helm release (`deploy/helm/farseer`):

- unprivileged nginx serving the static build;
- 2–4 replicas under an autoscaler;
- a PodDisruptionBudget;
- an HTTPRoute for `rankwarden.gg` on the cluster Gateway;
- a NetworkPolicy that admits only the gateway namespace and allows no egress.

Before the first deploy:

1. In GitHub, create a `production` environment with a required reviewer. Add the secrets `DIGITALOCEAN_ACCESS_TOKEN`, `GHCR_USERNAME` and `GHCR_TOKEN` (`read:packages`), and the variable `DO_CLUSTER_NAME`.
2. The Gateway (`public` in namespace `gateway`, listener `https`) needs a listener for `rankwarden.gg`.
3. Soulseeker's `CORS_ORIGINS` must list every hostname in `httpRoute.hostnames`.

To deploy by hand:

```bash
GHCR_USERNAME=… GHCR_TOKEN=… bash deploy/scripts/create-secrets.sh
bash deploy/scripts/deploy.sh v0.1.0
kubectl -n farseer port-forward svc/farseer 8080:80 && curl localhost:8080/healthz
```

For a local kind cluster:

```bash
npm run docker:build && kind load docker-image farseer:local --name <cluster>
kubectl create namespace farseer
FARSEER_HELM_ARGS="--set image.repository=farseer --set imagePullSecrets=null --set httpRoute.enabled=false" \
  bash deploy/scripts/deploy.sh local
```

## Layout

```
src/
  api/          HTTP client and query client; Soulseeker endpoints go here
  components/   shared UI components
  preferences/  localStorage-backed user preferences (faction, ...)
  routes/       TanStack Router file routes (routeTree.gen.ts is generated)
  styles/       palette, CSS-variable tokens, global styles
  config.ts     runtime config (/config.js, then VITE_*)
public/config.js   runtime config placeholder, replaced in the cluster
deploy/
  nginx/        nginx config baked into the image
  helm/farseer  the chart
  scripts/      create-secrets.sh, deploy.sh
docs/           integration notes (Soulseeker)
scripts/        local tooling (docker-build.mjs)
```
