"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const ormBaseUrl = String(process.env.ORM_BASE_URL || "http://127.0.0.1:4175").replace(/\/+$/, "");
const authBaseUrl = String(process.env.AUTH_BASE_URL || "http://127.0.0.1:3000").replace(/\/+$/, "");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".pdf": "application/pdf",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

function json(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function isLocalRequest(req) {
  const address = req.socket.remoteAddress || "";
  const host = String(req.headers.host || "").split(":")[0].toLowerCase();
  return (
    address === "127.0.0.1" ||
    address === "::1" ||
    address === "::ffff:127.0.0.1" ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1"
  );
}

function forwardRequest(req, res, baseUrl) {
  return new Promise((resolve, reject) => {
    const targetUrl = new URL(req.url, `${baseUrl}/`);
    const proxyReq = http.request(
      targetUrl,
      {
        method: req.method,
        headers: {
          ...req.headers,
          host: targetUrl.host,
          connection: "close",
          ...(baseUrl === authBaseUrl && isLocalRequest(req) ? { "X-Local-Demo-Login": "true" } : {}),
        },
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 502, {
          "Content-Type": proxyRes.headers["content-type"] || "application/json; charset=utf-8",
          "Cache-Control": proxyRes.headers["cache-control"] || "no-store",
        });
        proxyRes.pipe(res);
        proxyRes.on("end", () => resolve(true));
      }
    );

    proxyReq.on("error", reject);
    req.on("data", (chunk) => proxyReq.write(chunk));
    req.on("end", () => proxyReq.end());
    req.on("error", reject);
  });
}

function resolveStaticFilePath(requestedPath) {
  const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  return path.join(root, safePath);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");

    if (url.pathname.startsWith("/auth/")) {
      await forwardRequest(req, res, authBaseUrl);
      return;
    }

    if (url.pathname.startsWith("/api/")) {
      await forwardRequest(req, res, ormBaseUrl);
      return;
    }

    const requested = url.pathname === "/" ? "/index.html" : url.pathname;
    const filePath = resolveStaticFilePath(requested);

    fs.readFile(filePath, (error, data) => {
      if (error) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Not found");
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        "Content-Type": contentTypes[ext] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      res.end(data);
    });
  } catch (error) {
    json(res, 500, { error: error.message });
  }
});

server.listen(port, () => {
  console.log(`Scouts landing server running at http://0.0.0.0:${port}`);
});
