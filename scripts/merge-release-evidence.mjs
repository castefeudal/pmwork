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

if (!root.crossBrowser || root.crossBrowser.expected < 1 || root.crossBrowser.unexpected || root.crossBrowser.flaky || root.crossBrowser.skipped) {
  throw new Error('A complete, stable root cross-browser run is required for public evidence');
}

published.crossBrowser = { ...root.crossBrowser, base: root.base };
fs.writeFileSync(publishedPath, `${JSON.stringify(published, null, 2)}\n`);
console.log(`Included ${root.crossBrowser.expected} root cross-browser checks for ${root.commit}`);
