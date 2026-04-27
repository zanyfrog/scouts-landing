const http = require("http");
const fs = require("fs");
const path = require("path");
const orm = require("../scouts.orm");

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const ormBaseUrl = String(process.env.ORM_BASE_URL || "http://127.0.0.1:4174").replace(/\/+$/, "");
const authBaseUrl = String(process.env.AUTH_BASE_URL || "http://127.0.0.1:3000").replace(/\/+$/, "");
const holidaysFile = path.join(root, "resources", "holidays.json");

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

function isLocalRequest(req) {
  const address = req.socket.remoteAddress || "";
  return address === "127.0.0.1" || address === "::1" || address === "::ffff:127.0.0.1";
}

function readJsonFile(filePath, fallback = []) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    return fallback;
  }
}

function writeJsonFile(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function normalizeHoliday(record) {
  const date = String(record?.date || "").trim();
  const rawEndDate = String(record?.endDate || record?.date || "").trim();
  const endDate = rawEndDate && date && rawEndDate < date ? date : rawEndDate;
  return {
    id: String(record?.id || "").trim(),
    name: String(record?.name || "Custom holiday").trim(),
    date,
    endDate,
    placedBy: String(record?.placedBy || "").trim(),
    role: String(record?.role || "").trim(),
    note: String(record?.note || "").trim(),
  };
}

function readHolidays() {
  return readJsonFile(holidaysFile, []).map(normalizeHoliday).filter((holiday) => holiday.id && holiday.date);
}

function saveHolidays(holidays) {
  writeJsonFile(holidaysFile, (Array.isArray(holidays) ? holidays : []).map(normalizeHoliday).filter((holiday) => holiday.id && holiday.date));
}

function isPublicImageReference(value) {
  const source = String(value || "").trim();
  return /^https?:\/\//i.test(source) || /^assets\//i.test(source);
}

function isInlineImageReference(value) {
  return /^data:image\//i.test(String(value || "").trim());
}

function publicImageAllowed(value, includeInlineImages = false) {
  return isPublicImageReference(value) || (includeInlineImages && isInlineImageReference(value));
}

function eventStartTime(event) {
  const time = new Date(event?.startDate || "").getTime();
  return Number.isFinite(time) ? time : 0;
}

function eventEndTime(event) {
  const time = new Date(event?.endDate || event?.startDate || "").getTime();
  return Number.isFinite(time) ? time : eventStartTime(event);
}

function isUpcomingPublicEvent(event) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endTime = eventEndTime(event);
  return endTime ? endTime >= today.getTime() : false;
}

function publicFeaturedImageEventIds(events) {
  const sortedEvents = [...events].sort((a, b) => eventStartTime(a) - eventStartTime(b));
  const upcoming = sortedEvents.filter(isUpcomingPublicEvent);
  const recent = sortedEvents.filter((event) => !isUpcomingPublicEvent(event));
  const ids = new Set([upcoming[0]?.id, recent[recent.length - 1]?.id].filter(Boolean));

  const walkersvilleSource = sortedEvents.find((event) => {
    const location = String(event.homeBase || event.location || "").toLowerCase();
    return location.includes("walkersville") && /^2026-04-(09|10)/.test(String(event.startDate || ""));
  });
  if (walkersvilleSource?.id) ids.add(walkersvilleSource.id);

  return ids;
}

function publicEventSummary(event, includeInlineImages = false) {
  let gallery = Array.isArray(event.gallery)
    ? event.gallery
        .map((item) => (typeof item === "string" ? { src: item } : item))
        .filter((item) => publicImageAllowed(item?.src || item?.image, includeInlineImages))
        .slice(0, includeInlineImages ? 1 : 3)
    : [];
  const image = publicImageAllowed(event.image, includeInlineImages) ? event.image : gallery[0]?.src || "";
  if (includeInlineImages && image && gallery.length && (gallery[0].src || gallery[0].image) === image) {
    gallery = [];
  }

  return {
    id: event.id,
    title: event.title,
    category: event.category,
    startDate: event.startDate,
    endDate: event.endDate,
    dateLabel: event.dateLabel,
    homeBase: event.homeBase,
    location: event.location,
    audience: event.audience,
    description: event.description,
    detailNote: event.detailNote,
    activities: Array.isArray(event.activities) ? event.activities : [],
    image,
    gallery,
    upcoming: event.upcoming,
    repeatEnabled: event.repeatEnabled,
    repeatFrequency: event.repeatFrequency,
    repeatInterval: event.repeatInterval,
    repeatUntil: event.repeatUntil,
    repeatMonthlyPattern: event.repeatMonthlyPattern,
    repeatMonthlyOrdinal: event.repeatMonthlyOrdinal,
    repeatMonthlyWeekday: event.repeatMonthlyWeekday,
  };
}

function publicPayload() {
  const data = orm.getDataPayload();
  const sourceEvents = Array.isArray(data.events) ? data.events : [];
  const imageEventIds = publicFeaturedImageEventIds(sourceEvents);
  return {
    data: {
      events: sourceEvents.map((event) => publicEventSummary(event, imageEventIds.has(event.id))),
      patrols: Array.isArray(data.patrols) ? data.patrols : [],
      holidays: readHolidays(),
    },
  };
}
function publicEventDetailPayload(eventId) {
  const data = orm.getDataPayload();
  const sourceEvents = Array.isArray(data.events) ? data.events : [];
  const event = sourceEvents.find((item) => String(item.id) === String(eventId));
  return event ? { data: publicEventSummary(event, true) } : null;
}

function forwardApiRequest(req, res, baseUrl = ormBaseUrl) {
  return new Promise((resolve, reject) => {
    const targetUrl = new URL(req.url, `${baseUrl}/`);
    const proxyReq = http.request(
      targetUrl,
      {
        method: req.method,
        headers: {
          "Content-Type": req.headers["content-type"] || "application/json; charset=utf-8",
          ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
          ...(baseUrl === authBaseUrl && isLocalRequest(req) ? { "X-Local-Demo-Login": "true" } : {}),
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
  if (authBaseUrl && req.url.startsWith("/auth/")) {
    await forwardApiRequest(req, res, authBaseUrl);
    return true;
  }

  if (req.method === "GET" && req.url === "/api/public") {
    json(res, 200, publicPayload());
    return true;
  }

  if (req.method === "GET" && req.url.startsWith("/api/public/events/")) {
    const eventId = decodeURIComponent(new URL(req.url, "http://localhost").pathname.replace("/api/public/events/", ""));
    const payload = publicEventDetailPayload(eventId);
    json(res, payload ? 200 : 404, payload || { error: "Event not found" });
    return true;
  }

  if (ormBaseUrl && req.url.startsWith("/api/") && !req.url.startsWith("/api/holidays")) {
    await forwardApiRequest(req, res);
    return true;
  }

  if (req.method === "GET" && req.url === "/api/data") {
    json(res, 200, { ...orm.getDataPayload(), holidays: readHolidays() });
    return true;
  }

  if (req.method === "GET" && req.url === "/api/me/dashboard") {
    json(res, 200, { data: { ...orm.getDataPayload(), holidays: readHolidays() } });
    return true;
  }

  if (req.method === "POST" && req.url === "/api/holidays") {
    const body = JSON.parse((await readBody(req)) || "{}");
    saveHolidays(Array.isArray(body.holidays) ? body.holidays : []);
    json(res, 200, { ok: true });
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
  return path.join(root, safePath);
}

orm.ensureDataFiles();
if (!fs.existsSync(holidaysFile)) {
  saveHolidays([]);
}

const server = http.createServer(async (req, res) => {
  try {
    if (await handleApi(req, res)) {
      return;
    }

    const requestedUrl = new URL(req.url, "http://localhost");
    const requested = requestedUrl.pathname === "/" ? "/index.html" : requestedUrl.pathname;
    if (requested === "/data" || requested.startsWith("/data/")) {
      json(res, 404, { error: "Not found" });
      return;
    }
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
