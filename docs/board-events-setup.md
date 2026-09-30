# Board event editing (Firebase)

Board members add, edit, and see new events immediately at `/events/` — no
GitHub account, JSON editing, or separate admin page required. There's a
small "Board sign-in" button near the bottom of that page; signing in with
the shared board Google account reveals an "Add an event" form, including a
flyer image upload. Saving writes straight to Firestore and the page updates
immediately for that board member; other visitors see it on their next load.

This replaces the previous Decap CMS + Cloudflare Access + GitHub bot setup
entirely — there's no Cloudflare Zero Trust, bot account, or Secrets Store
binding to maintain anymore.

## How access works

- **Sign-in** is Firebase Auth's Google provider — any Google account can
  sign in, but only allowlisted emails can actually save an event.
- **The allowlist** lives in two places that must be kept in sync:
  - `src/data/board-access.ts`'s `boardEmails` — controls whether the
    add-event *form* is shown after sign-in. This is a convenience, not
    security.
  - Firestore's security rules (Firebase Console → Firestore Database →
    Rules) — this is what actually rejects unauthorized writes, even if
    someone bypasses the UI.
- **Flyers** are stored as a compressed image directly on the event's
  Firestore document (not a separate file host), specifically to avoid
  requiring Firebase's paid Blaze plan. They're resized/re-compressed in the
  browser before saving, so expect noticeably lower image fidelity than a
  dedicated image host — that's a deliberate tradeoff to stay on the free
  Spark plan.

## One-time Firebase Console setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com),
   signed in as the shared board Google account (so you keep the same
   control you have over other shared MSA accounts today).
2. **Add project** → name it (e.g. `uic-msa-website`) → you can skip Google
   Analytics → Create.
3. Left sidebar → Build → **Authentication** → Get started → Sign-in method
   tab → click **Google** → toggle it on → set a support email → Save.
4. Left sidebar → Build → **Firestore Database** → Create database → pick a
   nearby region → **production mode** → Enable.
5. Firestore → **Rules** tab → replace the contents with:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /events/{eventId} {
         allow read: if true;
         allow write: if request.auth != null
           && request.auth.token.email in ['msaatuic@gmail.com', 'zhaid3@uic.edu'];
       }
     }
   }
   ```

   Add or remove emails from that list any time someone's access should
   change — just keep it in sync with `src/data/board-access.ts` in the
   repo. → Publish.
6. You do **not** need to set up Firebase Storage — flyers are stored
   directly on the event document, so there's nothing to enable there, and
   no billing plan upgrade is required.
7. Gear icon (top of the sidebar) → **Project settings** → scroll to "Your
   apps" → click the `</>` web icon → nickname it "MSA Website" → Register
   app (skip the Firebase Hosting step) → copy the six values shown under
   `firebaseConfig`.
8. Add those six values as environment variables named
   `PUBLIC_FIREBASE_API_KEY`, `PUBLIC_FIREBASE_AUTH_DOMAIN`,
   `PUBLIC_FIREBASE_PROJECT_ID`, `PUBLIC_FIREBASE_STORAGE_BUCKET`,
   `PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `PUBLIC_FIREBASE_APP_ID` — both in
   your local `.env` file (copy `.env.example` to `.env` and fill them in)
   and in Cloudflare's project **Environment Variables** (the same place
   `SITE_URL` is already set). These values are meant to be public; the
   Firestore rules above are what actually protect writes, not secrecy of
   these values.
9. Authentication → Settings → **Authorized domains** → confirm the
   production domain is listed (`localhost` is there by default, so local
   development works immediately).
10. Add the same six values as **repository variables** in GitHub (Settings
    → Secrets and variables → Actions → Variables tab — same place `SITE_URL`
    already lives), so the CI build in `.github/workflows/site.yml` embeds
    them too. Skipping this makes the CI browser tests fail with Firebase
    "invalid API key" console errors, since the built site has no real
    config to talk to.

## Moving the current events into Firestore

The events that exist today in `src/data/events.json` need to be copied into
Firestore once, after the setup above:

1. Firebase Console → gear icon → **Project settings** → **Service
   accounts** tab → **Generate new private key** → save the downloaded file
   as `service-account.json` in the project root (it's already covered by
   `.gitignore` — never commit it).
2. Run:

   ```sh
   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json node scripts/migrate-events-to-firestore.mjs
   ```

3. Visit `/events/` locally (`pnpm dev`) and confirm the calendar and
   upcoming list show the migrated events.
4. Delete `service-account.json` once you're done (or keep it somewhere
   private outside the repo — it grants full admin access to your Firebase
   project).
5. Once you've confirmed everything works, `src/data/events.json` can be
   deleted — it's no longer read by the site.

## Retiring the old admin setup

Once the above is verified working, the old Decap CMS / Cloudflare Access /
GitHub bot flow can be removed:

- In the repo: delete `public/admin/`, delete `worker/entry.js`, and
  simplify `wrangler.jsonc` to drop `main`, `run_worker_first`, and
  `secrets_store_secrets` (the site becomes plain static asset hosting).
- Outside the repo: in Cloudflare Zero Trust → Access, delete the
  applications covering `/admin*` and `/cms-auth*`; in the Cloudflare
  dashboard → Secrets Store, delete the `GITHUB_BOT_TOKEN` secret; on
  GitHub, revoke/delete the bot account's personal access token (and the
  bot account itself, if it was created solely for this).

Ask for this cleanup pass once the Firebase-based flow has been confirmed
working end-to-end — it's intentionally sequenced after verification so
there's never a window where board members have no working way to edit
events.
