import fs from 'node:fs';
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
const paths = new Set(['ru/', 'en/', 'ru/workspace/', 'en/workspace/', 'ru/tools/', 'en/tools/', 'sw.js', 'sitemap.xml', 'robots.txt']);
function walk(dir) {
  for (const item of fs.readdirSync(dir, {withFileTypes:true})) {
    const file = `${dir}/${item.name}`;
    if (item.isDirectory()) walk(file);
    else if (/\.(html|js|css|woff2|png|svg|webmanifest|txt|xml)$/.test(file) && !/out\/(?:404(?:\/|\.)|_not-found\/)/.test(file)) paths.add(file.slice(4).replace(/index\.html$/, ''));
  }
}
walk('out');
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
