const base = process.env.PMWORK_LIVE_URL;
if (!base) throw new Error('PMWORK_LIVE_URL is required');
let release;
for (let attempt = 0; attempt < 8; attempt++) {
  try {
    const response = await fetch(new URL(`release.json?check=${Date.now()}`, base), {signal: AbortSignal.timeout(15000), cache:'no-store'});
    if (response.ok) release = await response.json();
    if (release?.commit === process.env.GITHUB_SHA) break;
  } catch { /* Pages edge propagation may take a moment. */ }
  if (attempt < 7) await new Promise(resolve => setTimeout(resolve, 10000));
}
if (release?.commit !== process.env.GITHUB_SHA) throw new Error(`Live release does not match ${process.env.GITHUB_SHA}`);
const workerResponse = await fetch(new URL(`sw.js?check=${Date.now()}`, base), {signal: AbortSignal.timeout(15000), cache:'no-store'});
if (!workerResponse.ok) throw new Error(`Published service worker: ${workerResponse.status}`);
const worker = await workerResponse.text();
const precacheSource = worker.match(/const PRECACHE = (\[[\s\S]*?\]);\s*const CORE/)?.[1];
if (!precacheSource) throw new Error('Published service worker has no readable precache manifest');
const precache = JSON.parse(precacheSource);
if (!Array.isArray(precache) || precache.length !== release.assets) {
  throw new Error(`Published precache count ${precache.length} does not match release marker ${release.assets}`);
}
if (!worker.includes(`pmwork-${release.version}`)) throw new Error('Published service worker cache version does not match release marker');
const paths = new Set(['ru/', 'en/', 'ru/workspace/', 'en/workspace/', 'ru/tools/', 'en/tools/', 'sw.js', 'sitemap.xml', 'robots.txt', ...precache]);
const queue = [...paths], failures = [];
await Promise.all(Array.from({length:6}, async () => {
  while (queue.length) {
    const path = queue.shift();
    try {
      const response = await fetch(new URL(path, base), {method:'HEAD',signal:AbortSignal.timeout(15000)});
      if (!response.ok) failures.push(`${path}: ${response.status}`);
      if (/\.(js|css|woff2)$/.test(path) && /text\/html/.test(response.headers.get('content-type') ?? '')) failures.push(`${path}: HTML returned for asset`);
    } catch(error) { failures.push(`${path}: ${error.message}`); }
  }
}));
if (failures.length) throw new Error(failures.join('\n'));
console.log(`LIVE PASS: ${release.productVersion}, commit ${release.commit}; ${paths.size} routes/assets HTTP OK at ${base}`);
