import { describe, expect, it } from "vitest";
import fs from "node:fs";

describe("localized PWA packaging", () => {
  it("uses locale-specific install targets", () => {
    const ru = JSON.parse(
      fs.readFileSync("public/manifest-ru.webmanifest", "utf8"),
    );
    const en = JSON.parse(
      fs.readFileSync("public/manifest-en.webmanifest", "utf8"),
    );
    expect(ru.start_url).toBe("./ru/workspace/");
    expect(en.start_url).toBe("./en/workspace/");
    expect(ru.description).toMatch(/[А-Яа-я]/);
    expect(en.description).not.toMatch(/[А-Яа-я]/);
  });

  it("keeps locale-aware offline fallbacks and versioned cache", () => {
    const worker = fs.readFileSync("public/sw.js", "utf8");
    expect(worker).toMatch(/CACHE\s*=\s*"pmwork-v3"/);
    expect(worker).toContain('pathname.includes("/en/")');
  });

  it("installs resiliently so one failed request cannot discard a release", () => {
    const worker = fs.readFileSync("public/sw.js", "utf8");
    expect(worker).toContain("Promise.allSettled");
    expect(worker).not.toContain("cache.addAll");
  });

  it("registers the worker to detect and apply updates promptly", () => {
    const register = fs.readFileSync(
      "src/components/pwa-register.tsx",
      "utf8",
    );
    expect(register).toContain("updateViaCache:'none'");
    expect(register).toContain("reg.waiting&&navigator.serviceWorker.controller");
    expect(register).toContain("SKIP_WAITING");
    expect(register).toContain("controllerchange");
  });
});
