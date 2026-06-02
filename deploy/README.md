# Deployment — IIS + Next.js standalone

The app is built as a **Next.js standalone server** (`output: 'standalone'`) and
served under a sub-path on IIS. IIS does not run Node itself — it acts as a
**reverse proxy** (URL Rewrite + ARR) to a Node process that runs the bundled
`server.js`, kept alive as a Windows service via **NSSM**.

```
Browser ──HTTPS──> IIS (URL Rewrite + ARR) ──HTTP──> node server.js  (127.0.0.1:<port>)
         /<basePath>/...                      /<basePath>/...
```

## Environments

| Env  | Public URL                                          | basePath           | Node port | env file          | web.config              |
|------|-----------------------------------------------------|--------------------|-----------|-------------------|-------------------------|
| UAT  | `https://udn.sbisecurities.in/diynri/`              | `/diynri`          | `3001`    | `.env.uat`        | `deploy/uat/web.config` |
| PROD | `https://diy.sbisecurities.in/open-nri-account/`    | `/open-nri-account`| `3000`    | `.env.production` | `deploy/production/web.config` |

`basePath` is read from `NEXT_PUBLIC_BASE_PATH` (set in each env file) at build
time and baked into the bundle — routes, `_next` assets and `next/image` are all
prefixed automatically.

> ⚠️ **`.env.uat` and `.env.production` are git-ignored** (not in the repo). They
> must exist on the build machine and contain at least:
> ```
> # .env.uat
> NEXT_PUBLIC_BASE_PATH=/diynri
> NEXT_PUBLIC_BACKEND_URL=https://udn.sbisecurities.in/
> # .env.production
> NEXT_PUBLIC_BASE_PATH=/open-nri-account
> NEXT_PUBLIC_BACKEND_URL=https://diy.sbisecurities.in/
> ```
> If the env file is missing at build time, `NEXT_PUBLIC_BASE_PATH` falls back to
> `/diynri` (see `next.config.ts`) — wrong for production.

## Prerequisites (build machine)

- Node.js 18.18+ / 20+ and npm
- `npm install` (pulls `dotenv-cli` used by the build scripts)

## Prerequisites (IIS server)

- Node.js (LTS) installed
- IIS modules: **URL Rewrite** + **Application Request Routing (ARR)**
- ARR proxy enabled: IIS Manager → server node → *Application Request Routing
  Cache* → *Server Proxy Settings* → tick **Enable proxy**
- **NSSM** (https://nssm.cc) on PATH, to run `server.js` as a service

## 1. Build

```powershell
# from the project root
npm install          # first time / when deps change

npm run build:uat    # UAT  → basePath /diynri
# or
npm run build:prod   # PROD → basePath /open-nri-account
```

Each build:
1. bumps the patch version (`scripts/bump-version.mjs`) → updates `package.json`
   + `src/lib/version.ts` (shown in the app footer),
2. runs `next build` with the chosen env file,
3. assembles a self-contained folder (`scripts/assemble-standalone.mjs`).

Commit the bumped `package.json` + `src/lib/version.ts` so the version keeps
advancing across machines/CI.

## 2. Artifact

The deployable output is **`.next/standalone/`** — it already contains
`server.js`, a minimal `node_modules`, `.next/static`, and `public`. Zip that
folder and copy it to the server, e.g.:

| Env  | Server folder                  |
|------|--------------------------------|
| UAT  | `C:\inetpub\diynri\`           |
| PROD | `C:\inetpub\open-nri-account\` |

## 3. Run the Node server as a Windows service (NSSM)

**UAT** (port 3001):

```powershell
nssm install diynri "C:\Program Files\nodejs\node.exe" "C:\inetpub\diynri\server.js"
nssm set diynri AppDirectory "C:\inetpub\diynri"
nssm set diynri AppEnvironmentExtra PORT=3001 HOSTNAME=127.0.0.1 NODE_ENV=production
nssm set diynri AppStdout "C:\inetpub\diynri\logs\out.log"
nssm set diynri AppStderr "C:\inetpub\diynri\logs\err.log"
nssm start diynri
```

**PROD** (port 3000):

```powershell
nssm install open-nri-account "C:\Program Files\nodejs\node.exe" "C:\inetpub\open-nri-account\server.js"
nssm set open-nri-account AppDirectory "C:\inetpub\open-nri-account"
nssm set open-nri-account AppEnvironmentExtra PORT=3000 HOSTNAME=127.0.0.1 NODE_ENV=production
nssm set open-nri-account AppStdout "C:\inetpub\open-nri-account\logs\out.log"
nssm set open-nri-account AppStderr "C:\inetpub\open-nri-account\logs\err.log"
nssm start open-nri-account
```

Sanity check locally on the box:

```powershell
# UAT
curl http://127.0.0.1:3001/diynri
# PROD
curl http://127.0.0.1:3000/open-nri-account
```

Service controls: `nssm restart <name>`, `nssm stop <name>`, `nssm remove <name> confirm`.

## 4. IIS site + web.config

Copy the matching config into the IIS site root that fronts the public host:

- UAT  → `deploy/uat/web.config`
- PROD → `deploy/production/web.config`

These rewrite `/<basePath>/*` (and `/<basePath>/assets/*`) to the local Node
port above. Because the Node server already runs under `basePath`, requests pass
straight through.

Browse the public URL to verify; the build version appears in the bottom-right
footer (e.g. `v1.0.1`).

## Updating env values / ports

- **URL or backend changes** → edit `.env.uat` / `.env.production`, rebuild.
- **basePath change** → edit `NEXT_PUBLIC_BASE_PATH` in the env file **and** the
  `match`/`action` URLs in the corresponding `web.config`, then rebuild.
- **Port change** → update `nssm set <name> AppEnvironmentExtra PORT=...` **and**
  the `web.config` `action url` port.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `502.3` / `ARR error` in IIS | Node service not running, or wrong port. `nssm status <name>`, check `logs\err.log`. |
| Page loads but CSS/JS/images 404 | ARR proxy not enabled, or `web.config` rewrite path doesn't match the basePath. |
| Routes/assets resolve to root (no prefix) | Built without the env file (basePath empty). Rebuild with `build:uat` / `build:prod`. |
| `next/image` images broken | Don't wrap `<Image>` srcs with `asset()` — Next prefixes them; double-prefix → `/<base>/<base>/...`. |
| Uploads fail on large files | Raise `maxAllowedContentLength` in `web.config` (default here: 20 MB). |
