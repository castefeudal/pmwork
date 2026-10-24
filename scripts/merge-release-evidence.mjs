import fs from 'node:fs';
import path from 'node:path';

const workspace = path.resolve(process.argv[2] ?? '.');
const root = JSON.parse(fs.readFileSync(path.join(workspace, 'quality-evidence-root/release.json'), 'utf8'));
const publishedPath = path.join(workspace, 'out/quality-evidence.json');
const releasePath = path.join(workspace, 'out/release.json');
const published = JSON.parse(fs.readFileSync(publishedPath, 'utf8'));
const release = JSON.parse(fs.readFileSync(releasePath, 'utf8'));

if (!release.commit || published.commit !== release.commit || root.commit !== release.commit) {
  throw new Error('Root, GitHub Pages and public evidence must use the same commit');
}

for (const evidence of [root, published]) {
  if (!evidence.crossBrowser || evidence.crossBrowser.expected < 1 || evidence.crossBrowser.unexpected || evidence.crossBrowser.flaky || evidence.crossBrowser.skipped) {
    throw new Error('Complete, stable cross-browser runs for both base paths are required');
  }
  if (!evidence.lighthouse || evidence.lighthouse.failures.length || evidence.lighthouse.groups.length !== 8 || evidence.lighthouse.groups.some(group =>
    group.samples !== 3 || ![group.performance, group.accessibility, group.lcp, group.cls].every(Number.isFinite) || group.performance < 90 || group.accessibility < 90 || group.lcp <= 0 || group.lcp > 2500 || group.cls < 0 || group.cls > 0.1)) {
    throw new Error('Complete Lighthouse budgets for both base paths are required');
  }
}

published.crossBrowserByBase = { root: root.crossBrowser, github: published.crossBrowser };
published.lighthouseByBase = { root: root.lighthouse, github: published.lighthouse };
published.crossBrowser = { ...root.crossBrowser, base: root.base };
fs.writeFileSync(publishedPath, `${JSON.stringify(published, null, 2)}\n`);
console.log(`Included ${root.crossBrowser.expected} root cross-browser checks for ${root.commit}`);
