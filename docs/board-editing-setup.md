# Board editing setup (Events Calendar)

Board members add, edit, and remove events through a form at `/admin` — no GitHub
account, JSON, or git required. Under the hood it's still a plain commit to
`src/data/events.json`, rebuilt and redeployed automatically by Cloudflare Pages, so
nothing about the site's no-backend design changes.

Access works in two layers:

1. **Cloudflare Access** gates `/admin` and `/cms-auth` at the edge, requiring sign-in
   with Google, restricted to `msaatuic@gmail.com` — the same shared Google login the
   board already uses for everything else. Nobody needs a GitHub account.
2. Once Access lets someone through, a small Cloudflare Pages Function
   (`functions/cms-auth.js`) hands the page a token from **one dedicated GitHub "bot"
   account** with write access to the repo, so the actual commit can happen. Board
   members never see this token.

This is a one-time setup. It needs admin access to the `nauraiz0/msawebsite2026`
GitHub repo and the Cloudflare account the site deploys through — so it should be
done by the repo owner or whoever on the board holds those credentials, not
necessarily by whoever wrote this code.

## 1. Get the site onto Cloudflare Pages, if it isn't already

Check whether `nauraiz0/msawebsite2026` is already connected to a live Cloudflare
Pages project, and who has access to that Cloudflare account. If nothing is deployed
yet: **Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git**,
pick this repo, set build command `pnpm build` and output directory `dist` (see
[`README.md`](../README.md) for the full settings). This also gives you admin access
to everything else in this guide.

## 2. Create the dedicated bot GitHub account

Create one GitHub account for this purpose alone (not a real person's account) —
or use a [fine-grained personal access token](https://github.com/settings/tokens?type=beta)
scoped to **only** `nauraiz0/msawebsite2026`, with repository permission
**Contents: Read and write**, generated from an account that already has write
access to the repo. Either way, note the resulting token — you won't see it again
after creating it.

## 3. Add the token to the Pages project

**Cloudflare Pages project → Settings → Environment variables → Add variable**:

- Name: `GITHUB_BOT_TOKEN`
- Value: the token from step 2
- Mark it **Encrypt** (secret), and add it to the **Production** environment

Redeploy the Pages project once so the new variable takes effect.

## 4. Set up Cloudflare Access

Cloudflare Access is part of Cloudflare Zero Trust (free for small teams — the free
plan covers well more than a board's worth of logins).

1. **Cloudflare dashboard → Zero Trust** (enable it if this is the first time).
2. **Settings → Authentication → Login methods → Add "Google."** Cloudflare's
   dashboard walks you through this; you may need to create a small Google Cloud
   OAuth client for it (Cloudflare links directly to that step). This is separate
   from GitHub — it's just letting Access recognize Google logins at all.
3. **Access → Applications → Add an application → Self-hosted.** Create one covering
   your domain with path `/admin*`, and a second (or one application with both paths
   added) covering `/cms-auth*`. Point both at the same domain the site is served
   from.
4. On each application's policy, set **Action: Allow**, rule: **Login Method is
   Google** AND **Emails: `msaatuic@gmail.com`**.

## 5. Point the CMS at your real domain

In `public/admin/config.yml`, set `backend.base_url` to the site's actual production
URL:

```yaml
backend:
  name: github
  repo: nauraiz0/msawebsite2026
  branch: main
  base_url: https://your-real-domain.org
  auth_endpoint: cms-auth
```

Commit and push.

## 6. Try it

Visit `/admin`. You should be prompted to sign in with Google first (Cloudflare
Access) — sign in as `msaatuic@gmail.com`. After that you'll land on the Decap CMS
screen, which still shows a **"Login with GitHub"** button — that's just Decap's
standard branding for this backend type; click it, and it should log you in
immediately with no further prompt, since Access already confirmed who you are and
`cms-auth` hands back the bot's token automatically. Confirm you can see, add, and
remove an event, then it's ready to hand to the board.

## Notes

- Everyone edits under the one bot account's identity — there's no per-person audit
  trail beyond Cloudflare Access's own login logs (Zero Trust → Logs → Access), which
  *do* show who actually signed in with Google, even though the git commits
  themselves won't show individual names.
- If the bot token is ever compromised or needs rotating, regenerate it (step 2) and
  update the Pages environment variable (step 3) — no code changes needed.
- The CMS edits `src/data/events.json` directly — the same file described in
  [`docs/maintenance.md`](maintenance.md). Its top-level shape is `{ "events": [...] }`.
- Saving in the CMS commits straight to `main` (`publish_mode: simple` in
  `config.yml`). To require a review step instead, change that to
  `editorial_workflow`, which opens a PR rather than committing directly.
