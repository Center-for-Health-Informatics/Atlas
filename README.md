# ATLAS

<a href="http://www.ohdsi.org/web/atlas"><img src="http://www.ohdsi.org/web/wiki/lib/exe/fetch.php?cache=&media=documentation:software:logo_without_text.png" align="left" hspace="10" vspace="6" width="164" height="200"></a>

**ATLAS** is an open source software tool for researchers to conduct scientific analyses on standardized observational data converted to the [OMOP Common Data Model V5](https://github.com/OHDSI/CommonDataModel/wiki "OMOP Common Data Model V5"). Researchers can create cohorts by defining groups of people based on an exposure to a drug or diagnosis of a particular condition using healthcare claims data. ATLAS has vocabulary searching of medical concepts to identify people with specific conditions, drug exposures etc. Patient profiles can be viewed within a specific cohort allowing visualization of a particular subject's health care records. Population effect level estimation analyses allows for comparison of two different cohorts and leverages R packages.

## Resources

* [Atlas Demo (ohdsi.org)](http://atlas-demo.ohdsi.org/)
* [Documentation](https://github.com/OHDSI/Atlas/wiki)
* [Releases](https://github.com/OHDSI/Atlas/releases "Atlas releases")

## Technology

ATLAS is built using HTML, CSS and [Knockout JavaScript](http://knockoutjs.com/ "Knockout JavaScript"). For more information on using Atlas, please refer to the [setup guide](https://github.com/OHDSI/Atlas/wiki/Atlas-Setup-Guide "setup guide").

## Dependencies
- [WebAPI](https://github.com/OHDSI/WebAPI "WebAPI") — a running WebAPI instance is required; Atlas is a client that talks to it over HTTP.

## Development

```bash
npm install
npm run dev      # Vite dev server, default http://localhost:5173/atlas/
npm run build    # production build, output to js/assets/bundle/
npm test         # Node's built-in test runner
npm run lint     # eslint/neostandard
```

## Configuration

Atlas is a browser app (Vite + Knockout.js), so configuration happens in two different places depending on when it takes effect:

**Build time** (`npm run dev` / `npm run build`, and the Docker builder stage) — set environment variables before running the command, e.g. via a gitignored `.env.local` file (Vite loads this automatically) or `direnv`/`.envrc`:

| Variable | Purpose |
|---|---|
| `VITE_WEBAPI_URL` | WebAPI instance the app talks to, e.g. `http://localhost:8080/webapi/` |
| `VITE_WEBAPI_NAME` | Display name for that instance |

`js/config.js` reads these directly (`import.meta.env.VITE_*`) — there's no separate config file to create.

**Container runtime** (a pre-built Docker image, no rebuild) — set env vars on `docker run -e ...` or in a compose file's `environment:` block. The entrypoint substitutes them into a small file the running app fetches on load, so the same image can be pointed at different WebAPI instances without rebuilding:

| Variable | Purpose |
|---|---|
| `WEBAPI_URL` | WebAPI instance the app talks to |
| `ATLAS_INSTANCE_NAME` | Display name for that instance |
| `ATLAS_*` | Feature flags and auth-provider settings — see the full list of `ENV` defaults in [`Dockerfile`](Dockerfile) |

## Building the container image

`build.sh` produces a multi-arch (`linux/amd64` + `linux/arm64`) image with podman, so a build
on an Apple Silicon machine runs on the AMD64 deployment hosts. It tags three names — the
`package.json` version, that version plus the short git SHA, and `latest` — and pushes only when
asked:

```bash
./build.sh            # build only; nothing leaves this machine
PUSH=1 ./build.sh     # build and push to chi-tools.uc.edu
```

Pushing needs a one-time `podman login chi-tools.uc.edu`. Pushes from a dirty working tree are
refused (override with `FORCE=1`), since a `latest` built from uncommitted code can't be
reproduced. Overrides: `REGISTRY`, `PLATFORMS` (e.g. `PLATFORMS=linux/arm64` for a fast
local-only build).

The Vite build runs natively on the build host rather than under emulation — its output is
architecture-neutral, so both architectures share it. Only the nginx runtime layer differs.

## Running with Docker

```bash
podman run --rm -p 8080:8080 \
  -e WEBAPI_URL=http://my-webapi-host:8080/WebAPI/ \
  -e ATLAS_INSTANCE_NAME="My Instance" \
  chi-tools.uc.edu/atlas:latest
```

Atlas is served under the `/atlas/` path prefix, so the URL is <http://localhost:8080/atlas/>.

For deployment, [`deploy/compose.yaml`](deploy/compose.yaml) and
[`deploy/.env.example`](deploy/.env.example) are the files to copy to `/srv/atlas` on the target
host.

## Getting Involved
* Developer questions/comments/feedback: <a href="http://forums.ohdsi.org/c/developers">OHDSI Forum</a>
* We use the <a href="../../issues">GitHub issue tracker</a> for all bugs/issues/enhancements

## License
ATLAS is licensed under Apache License 2.
