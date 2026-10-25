import { createReadStream, readFileSync } from "node:fs";
import { createSecureServer } from "node:http2";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { createGzip } from "node:zlib";

const root = resolve("out");
const basePath = process.env.PMWORK_BASE_PATH === "github" ? "/pmwork" : "";
// Functional fixtures keep their historical no-store/uncompressed behavior.
// Opt in explicitly for cold-site Lighthouse transfer measurements.
const compress = process.env.PMWORK_HTTP_COMPRESSION === "gzip";
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

const handler = async (request, response) => {
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
    const acceptsGzip = (request.headers["accept-encoding"] ?? "").split(",").some(value => {
      const [encoding, ...parameters] = value.trim().split(";");
      return encoding === "gzip" && !parameters.some(parameter => /^q\s*=\s*0(?:\.0*)?$/.test(parameter.trim()));
    });
    const gzip = compress && acceptsGzip && /\.(?:html|css|js|json|svg|txt|xml|webmanifest)$/.test(file);
    response.writeHead(200, {
      "cache-control": "no-store",
      "content-type": contentTypes[extname(file)] ?? "application/octet-stream",
      ...(compress ? { vary: "Accept-Encoding" } : {}),
      ...(gzip ? { "content-encoding": "gzip" } : {}),
    });
    const stream = createReadStream(file);
    if (gzip) stream.pipe(createGzip()).pipe(response);
    else stream.pipe(response);
  } catch {
    response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
    response.end("Bad request");
  }
};
const server = process.env.PMWORK_HTTP2 === "1"
  ? createSecureServer({
    key: readFileSync(process.env.PMWORK_TLS_KEY),
    cert: readFileSync(process.env.PMWORK_TLS_CERT),
    allowHTTP1: true,
  }, handler)
  : createServer(handler);
server.listen(Number(process.env.PORT ?? 3000), "127.0.0.1", () => {
  if (compress) console.log("PMWORK_EXPORT_READY");
});
