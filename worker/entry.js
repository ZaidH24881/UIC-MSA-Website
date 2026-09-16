// Cloudflare Worker entry point (unified Workers + static assets deploy).
//
// Serves the built Astro site from ./dist for every request, except /cms-auth,
// which is handled here directly — it's the GitHub-token relay for the Events
// Editor at /admin. See docs/board-editing-setup.md for what protects that route
// (Cloudflare Access) and how GITHUB_BOT_TOKEN gets set.

function popupMessageHtml(status, payload) {
  const message = `authorization:github:${status}:${JSON.stringify(payload)}`;
  return `<!doctype html>
<html>
  <body>
    <script>
      (function () {
        function receiveMessage(e) {
          window.opener.postMessage(${JSON.stringify(message)}, e.origin);
          window.removeEventListener('message', receiveMessage, false);
        }
        window.addEventListener('message', receiveMessage, false);
        window.opener.postMessage('authorizing:github', '*');
      })();
    </script>
  </body>
</html>`;
}

// GITHUB_BOT_TOKEN is a Secrets Store binding, not a plain text variable — it
// exposes an async get() rather than being the string itself.
async function readBotToken(env) {
  const binding = env.GITHUB_BOT_TOKEN;
  if (!binding) return null;
  if (typeof binding === 'string') return binding;
  if (typeof binding.get === 'function') return binding.get();
  return null;
}

async function cmsAuthResponse(env) {
  const token = await readBotToken(env);
  if (!token) {
    return new Response(
      popupMessageHtml('error', {
        message: 'Events Editor is not fully set up yet (missing bot token).',
      }),
      { headers: { 'Content-Type': 'text/html' } },
    );
  }
  return new Response(popupMessageHtml('success', { token, provider: 'github' }), {
    headers: { 'Content-Type': 'text/html' },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/cms-auth') {
      return cmsAuthResponse(env);
    }
    return env.ASSETS.fetch(request);
  },
};
