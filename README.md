# MSA at UIC

The replacement MSA community website, built with Astro, TypeScript, self-hosted DM Sans/Libre Baskerville, and static content. Implements the design in [improvements.md](improvements.md) and migrates useful content documented in [site-analysis.md](site-analysis.md).

## Run

Use Node 24 and pnpm 11.19.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Development preview: `http://127.0.0.1:4321/`.

```sh
pnpm build
pnpm test
pnpm preview
```

Production preview: `http://127.0.0.1:4322/`. It exercises the actual 301 redirect map and 404 response. Deployable output is `dist/`.

For the full browser suite with installed Chrome:

```sh
node tests/browser.mjs
node tests/layout.mjs
node tests/states.mjs
```

CI installs Chromium and runs the same suite. It checks 17 routes across eight widths, menu focus/Escape, keyboard access, disclosures, clipboard feedback, poster expansion, image failure, JavaScript-disabled navigation, accessibility rules, redirects, and 404s. The actual outcomes and limitations are recorded in [verification](docs/verification.md).

## Maintain and launch

- [Content updates, hosting, annual handover, and rollback](docs/maintenance.md)
- [Board events editor setup (`/admin`)](docs/board-editing-setup.md)
- [Asset provenance and crop manifest](content/asset-manifest.json)
- [Legacy redirect map](content/redirects.json)
- [Implementation decisions and scope](docs/implementation-plan.md)
- [External destination verification](docs/external-links.md)

Membership stays in CampusGroups, recordings on YouTube, and giving with the user-supplied payment providers. No database or custom payment backend is required. Current event records, daily prayer-room details, and committee openings use explicit announcement/contact fallbacks until supplied.

Deployed on Cloudflare via Workers (Git-connected import, not the older standalone Pages product), configured by the committed `wrangler.jsonc`: build command `pnpm build`, deploy command `npx wrangler deploy` (serves `./dist` as static assets and routes `/cms-auth` through `worker/entry.js`). Set `NODE_VERSION=24` and `SITE_URL` as environment variables on the project. For a manual deployment:

```sh
pnpm build && pnpm dlx wrangler deploy
```

The workflow rebuilds daily. Set repository secret `DEPLOY_HOOK_URL` to your host's authorized rebuild hook so those builds also refresh the live site. Without that hook or equivalent host scheduling, uploaded build artifacts do not update a live deployment.

The existing public domain and paid services have not been changed. Physical iPhone/Android and a screen-reader application remain pre-launch checks. See the maintenance guide for operating facts and photo-rights assumptions to confirm at cutover.
