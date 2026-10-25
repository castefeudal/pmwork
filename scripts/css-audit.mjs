#!/usr/bin/env node
/**
 * CSS cascade audit.
 *
 * Reports declarations that are shadowed by an identical selector later in the
 * cascade (same media context and same cascade layer). Those declarations ship
 * bytes that the browser must parse and then throw away, and they hide the real
 * source of truth from the next person who opens the stylesheet.
 *
 * Usage:
 *   node scripts/css-audit.mjs            # human summary
 *   node scripts/css-audit.mjs --json     # machine readable
 *   node scripts/css-audit.mjs --gate     # exit 1 above the documented budget
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Import order from app/layout.tsx. Cascade order matters: later wins.
const FILES = [
  "app/fonts.css", "app/tokens.css", "app/globals.css", "app/premium.css",
  "app/editorial.css", "app/ux-transformation.css", "app/excellence.css",
  "app/refinement.css", "app/clarity.css", "app/excellence-entry.css",
  "app/excellence-public.css", "app/deferred-operational.css", "app/workspace.css",
  "app/management.css", "app/excellence-workspace.css",
];

// Budget for shadowed declarations, ratcheted down as the layers are consolidated.
const SHADOWED_BUDGET = 500;

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Very small CSS reader: enough for flat declarations inside nested at-rules. */
function parse(css) {
  const text = stripComments(css);
  const out = [];
  let i = 0;
  const stack = []; // { kind: 'layer'|'media'|'supports', value: string }

  const context = () => {
    const layer = stack.filter((s) => s.kind === "layer").map((s) => s.value).pop() ?? "(unlayered)";
    const media = stack
      .filter((s) => s.kind !== "layer")
      .map((s) => `${s.kind}:${s.value}`)
      .join("|");
    return { layer, media };
  };

  const readBlock = (startIndex) => {
    // returns { body, end } for a balanced block starting after '{'
    let depth = 1;
    let j = startIndex;
    let body = "";
    while (j < text.length) {
      const ch = text[j];
      if (ch === "{") depth += 1;
      if (ch === "}") {
        depth -= 1;
        if (depth === 0) return { body, end: j + 1 };
      }
      body += ch;
      j += 1;
    }
    return { body, end: text.length };
  };

  while (i < text.length) {
    const open = text.indexOf("{", i);
    if (open === -1) break;
    const prelude = text.slice(i, open).trim();
    const atRule = /^@([a-z-]+)\s*(.*)$/i.exec(prelude);
    const { body, end } = readBlock(open + 1);

    if (atRule && !/^(font-face|keyframes|-webkit-keyframes|property|counter-style|page)$/i.test(atRule[1])) {
      stack.push({ kind: atRule[1].toLowerCase(), value: atRule[2].trim() });
      i = open + 1;
      // walk nested content by re-entering the same loop with the block body
      const nested = body + "}";
      // temporarily splice nested body into the text to reuse the parser
      const inner = parse(nested);
      for (const decl of inner) {
        const outer = context();
        out.push({ ...decl, layer: outer.layer, media: outer.media });
      }
      stack.pop();
      i = end;
      continue;
    }

    const ctx = context();
    for (const chunk of body.split(";")) {
      const colon = chunk.indexOf(":");
      if (colon === -1) continue;
      const prop = chunk.slice(0, colon).trim().toLowerCase();
      const value = chunk.slice(colon + 1).trim();
      if (!prop || !value) continue;
      for (const selector of prelude.split(",")) {
        out.push({
          selector: selector.trim().replace(/\s+/g, " "),
          prop,
          value,
          layer: ctx.layer,
          media: ctx.media,
        });
      }
    }
    i = end;
  }
  return out;
}

const declarations = [];
for (const file of FILES) {
  let css = "";
  try {
    css = readFileSync(path.join(root, file), "utf8");
  } catch {
    continue;
  }
  const before = declarations.length;
  for (const decl of parse(css)) declarations.push({ ...decl, file });
  void before;
}

const lastIndex = new Map();
declarations.forEach((decl, index) => {
  lastIndex.set(`${decl.layer}||${decl.media}||${decl.selector}||${decl.prop}`, index);
});

const shadowed = [];
declarations.forEach((decl, index) => {
  const key = `${decl.layer}||${decl.media}||${decl.selector}||${decl.prop}`;
  if (lastIndex.get(key) !== index) shadowed.push({ ...decl, index });
});

const hex = declarations.filter((d) => /#[0-9a-f]{3,8}\b/i.test(d.value));
const byFile = {};
for (const decl of shadowed) byFile[decl.file] = (byFile[decl.file] ?? 0) + 1;

const selectorCounts = new Map();
for (const decl of declarations) {
  const key = `${decl.layer}||${decl.media}||${decl.selector}`;
  selectorCounts.set(key, (selectorCounts.get(key) ?? 0) + 1);
}
const duplicateBlocks = [...selectorCounts.values()].filter((n) => n > 1).length;

const report = {
  files: FILES.length,
  declarations: declarations.length,
  shadowed: shadowed.length,
  shadowedByFile: byFile,
  duplicateSelectorBlocks: duplicateBlocks,
  rawHexValues: hex.length,
  rawHexByFile: hex.reduce((acc, d) => ((acc[d.file] = (acc[d.file] ?? 0) + 1), acc), {}),
  budget: SHADOWED_BUDGET,
  samples: shadowed.slice(0, 12).map((d) => `${d.file} { ${d.selector} } ${d.prop} — later layer restates it`),
};

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log("CSS cascade audit");
  console.log("─────────────────");
  console.log(`files              ${report.files}`);
  console.log(`declarations       ${report.declarations}`);
  console.log(`shadowed           ${report.shadowed}  (budget ${SHADOWED_BUDGET})`);
  console.log(`duplicate blocks   ${report.duplicateSelectorBlocks}`);
  console.log(`raw hex values     ${report.rawHexValues}`);
  console.log("");
  console.log("Shadowed by file:");
  for (const [file, count] of Object.entries(byFile).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(4)}  ${file}`);
  }
  console.log("");
  console.log("Raw hex by file:");
  for (const [file, count] of Object.entries(report.rawHexByFile).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(4)}  ${file}`);
  }
}

if (process.argv.includes("--gate") && report.shadowed > SHADOWED_BUDGET) {
  console.error(`\nShadowed declarations exceed the budget: ${report.shadowed} > ${SHADOWED_BUDGET}`);
  process.exit(1);
}
