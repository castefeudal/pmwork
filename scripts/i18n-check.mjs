import fs from "node:fs";

const required = ["src/content/catalog.ts", "src/content/ui.ts"];
for (const file of required) {
  const source = fs.readFileSync(file, "utf8");
  if (!/ru\s*:/.test(source) || !/en\s*:/.test(source))
    throw new Error(`${file}: locale missing`);
  if (/ru\s*:\s*""|en\s*:\s*""/.test(source))
    throw new Error(`${file}: empty translation`);
}

const ui = fs.readFileSync("src/content/ui.ts", "utf8");
const ru = ui.match(/ru:\s*\{([\s\S]*?)\n\s*\},\n\s*en:/)?.[1];
const en = ui.match(/en:\s*\{([\s\S]*?)\n\s*\},\n\}\s+as\s+const;/)?.[1];
if (!ru || !en) throw new Error("Cannot parse locale catalogs");
const keys = (source) =>
  (source.match(/\b[a-zA-Z]+:/g) || [])
    .map((value) => value.slice(0, -1))
    .sort()
    .join("|");
if (keys(ru) !== keys(en)) throw new Error("UI locale keys differ");

const userFacing = [
  "src/content/ui.ts",
  "src/data/demo.ts",
  "src/components/workspace-app.tsx",
  "src/components/workspace-dialog.tsx",
  "src/components/workspace-views.tsx",
  "src/components/record-editor.tsx",
  "src/components/tools-lab.tsx",
  "src/components/catalog-page.tsx",
  "src/components/public-header.tsx",
  "src/components/footer.tsx",
  "app/[locale]/page.tsx",
  "app/[locale]/layout.tsx",
  "app/[locale]/about/page.tsx",
  "app/[locale]/privacy/page.tsx",
  "app/[locale]/sources/page.tsx",
];
const denied = [
  "Project Manager",
  "project management",
  "workspace",
  "playbooks?",
  "stakeholders?",
  "milestones?",
  "outcomes?",
  "scope",
  "review",
  "capacity",
  "backup",
  "snapshots?",
  "activity trail",
  "quality gates?",
  "acceptance criteria",
  "Definition of Done",
  "feedback",
  "response plan",
  "risk management",
  "baseline",
  "actual",
  "committed",
  "forecast",
  "sponsor",
  "local-first",
  "AI-free",
  "evidence",
  "governance",
  "deliverables?",
  "issues?",
  "handover",
  "lessons learned",
  "benefits?",
];
const deny = new RegExp(`\\b(?:${denied.join("|")})\\b`, "i");
const violations = [];
for (const file of userFacing) {
  const source = fs.readFileSync(file, "utf8");
  for (const match of source.matchAll(/(["'`])((?:(?!\1).)*)\1/g)) {
    const value = match[2];
    if (!value.includes("${") && /[А-Яа-яЁё]/.test(value) && deny.test(value))
      violations.push(`${file}: ${value.slice(0, 120)}`);
  }
  for (const match of source.matchAll(/\bru\s*\?\s*"([^"]+)"/g)) {
    if (deny.test(match[1]))
      violations.push(`${file}: English term in RU branch: ${match[1]}`);
  }
  for (const match of source.matchAll(/\ben\s*:\s*"([^"]*[А-Яа-яЁё][^"]*)"/g))
    violations.push(`${file}: Russian text in EN value: ${match[1]}`);
}
if (violations.length)
  throw new Error(
    `i18n language-purity violations:\n${violations.slice(0, 30).join("\n")}`,
  );
console.log(
  `i18n parity and language purity valid: ru ↔ en (${userFacing.length} user-facing files)`,
);
