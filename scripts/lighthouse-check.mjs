import { spawn, execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { chromium } from "@playwright/test";

const require = createRequire(import.meta.url);
const cli = path.join(path.dirname(require.resolve("lighthouse/package.json")), "cli/index.js");
const output = "quality-evidence/lighthouse";
const port = 4174;
const base = process.env.PMWORK_BASE_PATH === "github" ? "/pmwork" : "";
const samples = 3;
fs.mkdirSync(output, { recursive: true });
const tlsDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "pmwork-lighthouse-"));
const tlsKey = path.join(tlsDirectory, "key.pem"), tlsCert = path.join(tlsDirectory, "cert.pem");
try {
  execFileSync(process.env.OPENSSL_BINARY ?? "openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "2", "-subj", "/CN=localhost", "-addext", "subjectAltName=IP:127.0.0.1,DNS:localhost", "-keyout", tlsKey, "-out", tlsCert], { stdio: "ignore" });
} catch (error) {
  for (const file of [tlsKey, tlsCert]) if (fs.existsSync(file)) fs.unlinkSync(file);
  fs.rmdirSync(tlsDirectory);
  throw Error("OpenSSL is required to create the ephemeral localhost HTTP/2 fixture", { cause: error });
}
const server = spawn(process.execPath, ["scripts/serve-export.mjs"], {
  env: { ...process.env, PORT: String(port), PMWORK_HTTP_COMPRESSION: "gzip", PMWORK_HTTP2: "1", PMWORK_TLS_KEY: tlsKey, PMWORK_TLS_CERT: tlsCert },
  stdio: ["ignore", "pipe", "inherit"],
});
const rows = [];
try {
  await new Promise((resolve, reject) => {
    let message = "";
    const timer = setTimeout(() => reject(Error("Lighthouse export server did not start")), 10000);
    server.once("error", error => { clearTimeout(timer); reject(error); });
    server.once("exit", () => { clearTimeout(timer); reject(Error("Lighthouse export server exited")); });
    server.stdout.on("data", chunk => {
      message += chunk;
      if (message.includes("PMWORK_EXPORT_READY")) { clearTimeout(timer); resolve(); }
    });
  });
  for (let sample = 1; sample <= samples; sample++) for (const locale of ["ru", "en"]) for (const surface of ["landing", "onboarding"]) for (const profile of ["mobile", "desktop"]) {
    const name = `${locale}-${surface}-${profile}-${sample}`;
    const url = `https://127.0.0.1:${port}${base}/${locale}/${surface === "onboarding" ? "workspace/" : ""}`;
    const file = `${output}/${name}.json`;
    const args = [cli, url, "--output=json", `--output-path=${file}`, "--only-categories=performance,accessibility", "--quiet", "--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage --disable-gpu --ignore-certificate-errors", "--no-enable-error-reporting"];
    if (profile === "desktop") args.push("--preset=desktop");
    execFileSync(process.execPath, args, { env: { ...process.env, CHROME_PATH: process.env.CHROME_PATH ?? chromium.executablePath() }, stdio: "inherit" });
    const report = JSON.parse(fs.readFileSync(file, "utf8"));
    const protocol = report.audits["network-requests"].details.items.find(item => item.resourceType === "Document")?.protocol;
    if (protocol !== "h2") throw Error(`Expected negotiated HTTP/2, received ${protocol}`);
    rows.push({ protocol, name, sample, locale, surface, profile, lighthouse: report.lighthouseVersion,
      performance: Math.round(report.categories.performance.score * 100), accessibility: Math.round(report.categories.accessibility.score * 100),
      lcp: report.audits["largest-contentful-paint"].numericValue, cls: report.audits["cumulative-layout-shift"].numericValue,
      tbt: report.audits["total-blocking-time"].numericValue,
    });
    fs.writeFileSync(`${output}/samples.json`, JSON.stringify(rows, null, 2));
    console.log(JSON.stringify(rows.at(-1)));
  }
  const median = values => values.toSorted((a, b) => a - b)[1];
  const groups = [...new Set(rows.map(row => `${row.locale}-${row.surface}-${row.profile}`))].map(name => {
    const group = rows.filter(row => `${row.locale}-${row.surface}-${row.profile}` === name);
    return { name, samples: group.length, ...Object.fromEntries(["performance", "accessibility", "lcp", "cls", "tbt"].map(key => [key, median(group.map(row => row[key]))])) };
  });
  const failures = groups.filter(group => group.performance < 90 || group.accessibility < 90 || group.lcp > 2500 || group.cls > 0.1);
  fs.writeFileSync(`${output}/summary.json`, JSON.stringify({ groups, failures, protocol: "Three cold-site samples; Lighthouse default simulated mobile/desktop profiles; HTTPS HTTP/2 with gzip text transfer, matching the observed Pages ALPN; ephemeral localhost certificate only; default light theme; workspace is first-run onboarding. No field INP or human accessibility claim." }, null, 2));
  console.table(groups);
  if (failures.length) throw Error(`Lighthouse budgets failed: ${failures.map(group => group.name).join(", ")}`);
} finally {
  server.kill();
  for (const file of [tlsKey, tlsCert]) if (fs.existsSync(file)) fs.unlinkSync(file);
  fs.rmdirSync(tlsDirectory);
}
