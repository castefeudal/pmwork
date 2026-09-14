import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

const root = resolve("out");
const basePath = process.env.PMWORK_BASE_PATH === "github" ? "/pmwork" : "";
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    let pathname = decodeURIComponent(url.pathname);
    if (basePath && (pathname === basePath || pathname.startsWith(`${basePath}/`)))
      pathname = pathname.slice(basePath.length) || "/";
    const relative = normalize(pathname).replace(/^([/\\])+/, "");
    let file = resolve(join(root, relative));
    if (file !== root && !file.startsWith(`${root}${sep}`)) throw new Error("unsafe path");
    let info = await stat(file).catch(() => null);
    if (info?.isDirectory() && !pathname.endsWith("/")) {
      response.writeHead(308, { location: `${url.pathname}/${url.search}` });
      response.end();
      return;
    }
    if (info?.isDirectory() || pathname.endsWith("/")) {
      file = join(file, "index.html");
      info = await stat(file).catch(() => null);
    }
    if (!info?.isFile()) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }
    response.writeHead(200, {
      "cache-control": "no-store",
      "content-type": contentTypes[extname(file)] ?? "application/octet-stream",
    });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
    response.end("Bad request");
  }
}).listen(3000, "127.0.0.1");
