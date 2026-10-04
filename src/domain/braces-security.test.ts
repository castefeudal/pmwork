import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const braces = require("braces") as {
  (input: string, options?: { expand?: boolean; maxDepth?: number }): string[];
  compile(input: string | Record<string, unknown>, options?: { maxDepth?: number }): string;
  expand(input: string | Record<string, unknown>, options?: { maxDepth?: number }): string[];
  stringify(input: string | Record<string, unknown>, options?: { maxDepth?: number }): string;
};

function nestedAst(depth: number): Record<string, unknown> {
  let node: Record<string, unknown> = { type: "text", value: "a" };
  for (let index = 0; index < depth; index += 1) {
    node = { type: "brace", nodes: [node] };
  }
  return { type: "root", nodes: [node] };
}

describe("braces nesting depth guard", () => {
  it("rejects deeply nested brace and parenthesis input before recursive processing", () => {
    const nestedBraces = "{".repeat(3500) + "a,b" + "}".repeat(3500);
    const nestedParens = "(".repeat(3500) + "a" + ")".repeat(3500);

    expect(() => braces(nestedBraces)).toThrow(/exceeds max depth/);
    expect(() => braces.expand(nestedBraces)).toThrow(/exceeds max depth/);
    expect(() => braces(nestedParens)).toThrow(/exceeds max depth/);
  });

  it("guards public walkers when callers supply an AST directly", () => {
    const ast = nestedAst(3500);

    expect(() => braces.compile(ast)).toThrow(/exceeds max depth/);
    expect(() => braces.expand(ast)).toThrow(/exceeds max depth/);
    expect(() => braces.stringify(ast)).toThrow(/exceeds max depth/);
  });

  it("preserves normal brace behavior and permits lower caller limits", () => {
    expect(braces.expand("a{1..3}b{c,d}")).toEqual([
      "a1bc", "a1bd", "a2bc", "a2bd", "a3bc", "a3bd",
    ]);
    expect(braces("{{a,b},c}")).toEqual(["((a|b)|c)"]);
    expect(() => braces("{{a,b},c}", { maxDepth: 1 })).toThrow(/exceeds max depth/);
  });
});
