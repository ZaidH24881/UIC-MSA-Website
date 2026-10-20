// Legacy CMS token exchange is retired; the board workspace uses Firebase Auth.
export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname === '/cms-auth') {
      return new Response('This editor has moved to /admin/.', { status: 410 });
    }
    return env.ASSETS.fetch(request);
  },
};
