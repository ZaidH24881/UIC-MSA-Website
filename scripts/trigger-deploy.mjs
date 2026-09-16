const hook = process.env.DEPLOY_HOOK_URL;
if (!hook) {
  console.log(
    'No host deploy hook configured. Verified static build is available as the msa-website artifact. Configure DEPLOY_HOOK_URL before public launch for daily content refresh.',
  );
  process.exit(0);
}
const url = new URL(hook);
if (url.protocol !== 'https:') throw new Error('Deploy hook must use HTTPS.');
const response = await fetch(url, { method: 'POST', signal: AbortSignal.timeout(30000) });
if (!response.ok) throw new Error(`Host rejected deploy hook: HTTP ${response.status}`);
console.log('Configured hosting provider accepted the rebuild request.');
