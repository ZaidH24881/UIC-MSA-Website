// Cloudflare Pages Function: hands the Events Editor (Decap CMS at /admin) a
// working GitHub token for the site repo.
//
// This route must be protected by the same Cloudflare Access policy as /admin
// (Google login, restricted to msaatuic@gmail.com) — see
// docs/board-editing-setup.md. Access verifies who's allowed in *before* any
// request reaches this function; this function itself does no login checking.
//
// It does not do a real GitHub OAuth exchange. It hands back one pre-configured
// token belonging to a single dedicated "bot" GitHub account with write access
// to the repo, so board members never need a GitHub account of their own. Set
// GITHUB_BOT_TOKEN as an encrypted environment variable on this Pages project —
// never commit it.

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

export async function onRequestGet({ env }) {
  if (!env.GITHUB_BOT_TOKEN) {
    return new Response(
      popupMessageHtml('error', {
        message: 'Events Editor is not fully set up yet (missing bot token).',
      }),
      { headers: { 'Content-Type': 'text/html' } },
    );
  }
  return new Response(
    popupMessageHtml('success', { token: env.GITHUB_BOT_TOKEN, provider: 'github' }),
    { headers: { 'Content-Type': 'text/html' } },
  );
}
