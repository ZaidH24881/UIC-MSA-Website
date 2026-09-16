for (let attempt = 0; attempt < 30; attempt++) {
  try {
    const r = await fetch('http://127.0.0.1:4322/');
    if (r.ok) process.exit(0);
  } catch {}
  await new Promise((resolve) => setTimeout(resolve, 500));
}
throw new Error('Production preview did not become ready.');
