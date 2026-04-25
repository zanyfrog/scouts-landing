const http = require("http");
const fs = require("fs");
const path = require("path");
const orm = require("../scouts.orm");

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const ormBaseUrl = String(process.env.ORM_BASE_URL || "").replace(/\/+$/, "");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function json(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function forwardApiRequest(req, res) {
  return new Promise((resolve, reject) => {
    const targetUrl = new URL(req.url, `${ormBaseUrl}/`);
    const proxyReq = http.request(
      targetUrl,
      {
        method: req.method,
        headers: {
          "Content-Type": req.headers["content-type"] || "application/json; charset=utf-8",
        },
      },
      (proxyRes) => {
        const chunks = [];
        proxyRes.on("data", (chunk) => chunks.push(chunk));
        proxyRes.on("end", () => {
          const payload = Buffer.concat(chunks);
          res.writeHead(proxyRes.statusCode || 502, {
            "Content-Type": proxyRes.headers["content-type"] || "application/json; charset=utf-8",
            "Cache-Control": "no-store",
          });
          res.end(payload);
          resolve(true);
        });
      }
    );

    proxyReq.on("error", reject);
    req.on("data", (chunk) => proxyReq.write(chunk));
    req.on("end", () => proxyReq.end());
    req.on("error", reject);
  });
}

async function handleApi(req, res) {
  if (ormBaseUrl && req.url.startsWith("/api/")) {
    await forwardApiRequest(req, res);
    return true;
  }

  if (req.method === "GET" && req.url === "/api/data") {
    json(res, 200, orm.getDataPayload());
    return true;
  }

  if (req.method === "POST" && req.url === "/api/scouts") {
    const body = JSON.parse((await readBody(req)) || "{}");
    orm.saveScouts(Array.isArray(body.scouts) ? body.scouts : []);
    json(res, 200, { ok: true });
    return true;
  }

  if (req.method === "POST" && req.url === "/api/adults") {
    const body = JSON.parse((await readBody(req)) || "{}");
    orm.saveAdults(Array.isArray(body.adults) ? body.adults : []);
    json(res, 200, { ok: true });
    return true;
  }

  if (req.method === "POST" && req.url === "/api/adult-leaders") {
    const body = JSON.parse((await readBody(req)) || "{}");
    orm.saveAdultLeaders(Array.isArray(body.adultLeaders) ? body.adultLeaders : []);
    json(res, 200, { ok: true });
    return true;
  }

  if (req.method === "POST" && req.url === "/api/adult-scout-relationships") {
    const body = JSON.parse((await readBody(req)) || "{}");
    orm.saveAdultScoutRelationships(Array.isArray(body.adultScoutRelationships) ? body.adultScoutRelationships : []);
    json(res, 200, { ok: true });
    return true;
  }

  if (req.method === "POST" && req.url === "/api/patrols") {
    const body = JSON.parse((await readBody(req)) || "{}");
    orm.savePatrols(Array.isArray(body.patrols) ? body.patrols : []);
    json(res, 200, { ok: true });
    return true;
  }

  if (req.method === "POST" && req.url === "/api/events") {
    const body = JSON.parse((await readBody(req)) || "{}");
    orm.saveEvents(Array.isArray(body.events) ? body.events : []);
    json(res, 200, { ok: true });
    return true;
  }

  return false;
}

function resolveStaticFilePath(requestedPath) {
  const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const servesOrmData =
    safePath === "\\data" ||
    safePath.startsWith("\\data\\") ||
    safePath === "/data" ||
    safePath.startsWith("/data/");
  const baseDir = servesOrmData ? path.dirname(orm.dataDir) : root;

  return path.join(baseDir, safePath);
}

orm.ensureDataFiles();

const server = http.createServer(async (req, res) => {
  try {
    if (await handleApi(req, res)) {
      return;
    }

    const requested = req.url === "/" ? "/index.html" : req.url;
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
  console.log(`Scout review server running at http://0.0.0.0:${port}`);
});
