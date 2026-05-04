const http = require("http");
const fs = require("fs");
const path = require("path");
const orm = require("../scouts.orm");

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const ormBaseUrl = String(process.env.ORM_BASE_URL || "http://127.0.0.1:4174").replace(/\/+$/, "");
const authBaseUrl = String(process.env.AUTH_BASE_URL || "http://127.0.0.1:3000").replace(/\/+$/, "");
const holidaysFile = path.join(root, "resources", "holidays.json");
const ormRoot = path.dirname(require.resolve("../scouts.orm"));
const patrolsFile = path.join(ormRoot, "data", "patrols.json");
const eventImageReferencesFile = path.join(ormRoot, "data", "event-image-references.json");

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

function isGitLfsPointerFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  try {
    return fs.readFileSync(filePath, "utf8").startsWith("version https://git-lfs.github.com/spec/v1");
  } catch (error) {
    return false;
  }
}

function repairOrmEventsJson() {
  const ormRoot = path.dirname(require.resolve("../scouts.orm"));
  const eventsJsonFile = path.join(ormRoot, "data", "events.json");

  if (isGitLfsPointerFile(eventsJsonFile)) {
    fs.unlinkSync(eventsJsonFile);
  }
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

function readEventImageSources() {
  const references = readJsonFile(eventImageReferencesFile, {});
  const values = Object.values(references).filter((value) => typeof value === "string" && value.trim());
  const publicImage = values.find((value) => /^https?:\/\//i.test(value)) || "";
  const inlineImages = values.filter((value) => /^data:image\//i.test(value));
  const photoImages = inlineImages.filter((value) => !/^data:image\/svg/i.test(value));
  const smallPhotoImages = photoImages.filter((value) => value.length < 50000);
  return { publicImage, inlineImages, photoImages, smallPhotoImages };
}

function isPublicImageReference(value) {
  const source = String(value || "").trim();
  return /^https?:\/\//i.test(source) || /^assets\//i.test(source) || /^\/api\/public\/events\//i.test(source);
}

function isInlineImageReference(value) {
  return /^data:(image|video)\//i.test(String(value || "").trim());
}

function publicImageAllowed(value, includeInlineImages = false) {
  return isPublicImageReference(value) || (includeInlineImages && isInlineImageReference(value));
}

function publicMediaReference(eventId, kind, index = 0) {
  const path = kind === "primary"
    ? `/api/public/events/${encodeURIComponent(eventId)}/media/primary`
    : `/api/public/events/${encodeURIComponent(eventId)}/media/gallery/${index}`;
  return path;
}

function toPublicMediaReference(eventId, value, kind, index = 0) {
  const source = String(value || "").trim();
  if (!source) return "";
  return isInlineImageReference(source) ? publicMediaReference(eventId, kind, index) : source;
}

function sendDataUrlMedia(res, dataUrl) {
  const source = String(dataUrl || "").trim();
  const match = source.match(/^data:([^;,]+)(;base64)?,(.*)$/s);
  if (!match) {
    json(res, 404, { error: "Media not found" });
    return;
  }

  const [, mimeType, base64Flag, payload] = match;
  const body = base64Flag ? Buffer.from(payload, "base64") : Buffer.from(decodeURIComponent(payload), "utf8");
  res.writeHead(200, {
    "Content-Type": mimeType || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  res.end(body);
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
    return location.includes("walkersville");
  });
  if (walkersvilleSource?.id) ids.add(walkersvilleSource.id);

  return ids;
}

function publicFallbackImageForEvent(event, index, sources) {
  const text = `${event?.title || ""} ${event?.homeBase || ""} ${event?.location || ""}`.toLowerCase();

  if (text.includes("sandy point")) {
    return sources.publicImage || sources.inlineImages[0] || "";
  }

  if (text.includes("walkersville")) {
    return sources.photoImages[0] || sources.inlineImages[0] || sources.publicImage || "";
  }

  if (text.includes("board of review") || text.includes("review")) {
    return sources.smallPhotoImages[0] || sources.photoImages[0] || sources.inlineImages[0] || sources.publicImage || "";
  }

  if (text.includes("adventure")) {
    return sources.inlineImages[1] || sources.inlineImages[0] || sources.publicImage || "";
  }

  if (text.includes("camp")) {
    const campImages = sources.photoImages.length ? sources.photoImages : sources.inlineImages;
    return campImages[index % Math.max(1, campImages.length)] || sources.publicImage || "";
  }

  const fallbackImages = sources.photoImages.length ? sources.photoImages : sources.inlineImages;
  return fallbackImages[index % Math.max(1, fallbackImages.length)] || sources.publicImage || "";
}

function shouldAvoidFullPublicMediaFetch(event) {
  const text = `${event?.title || ""} ${event?.category || ""} ${event?.homeBase || ""} ${event?.location || ""}`.toLowerCase();
  return text.includes("walkersville") || text.includes("camp") || text.includes("board of review") || text.includes("review");
}

function hasPublicEventMedia(event) {
  const image = String(event?.image || "").trim();
  const gallery = Array.isArray(event?.gallery) ? event.gallery : [];
  return Boolean(image) || gallery.some((item) => String(item?.src || item?.image || item || "").trim());
}

function shouldIncludeCalendarFallbackImage(event) {
  const text = `${event?.title || ""} ${event?.category || ""} ${event?.homeBase || ""} ${event?.location || ""}`.toLowerCase();
  return text.includes("board of review") || text.includes("review");
}

function enrichCalendarEventMedia(events) {
  const sources = readEventImageSources();
  return (Array.isArray(events) ? events : []).map((event, index) => {
    if (!shouldIncludeCalendarFallbackImage(event) || String(event?.image || "").trim()) {
      return event;
    }
    const image = publicFallbackImageForEvent(event, index, sources);
    return {
      ...event,
      image,
      gallery: image ? [{ src: image }] : [],
    };
  });
}

function enrichPublicFeaturedEventMedia(events) {
  const sources = readEventImageSources();
  const featuredIds = publicFeaturedImageEventIds(events);
  return (Array.isArray(events) ? events : []).map((event, index) => {
    if (!featuredIds.has(event?.id)) {
      return event;
    }

    const gallery = Array.isArray(event?.gallery) ? event.gallery : [];
    const image = String(event?.image || "").trim() || publicFallbackImageForEvent(event, index, sources);
    return {
      ...event,
      image,
      gallery: gallery.length ? gallery : (image ? [{ src: image }] : []),
    };
  });
}

async function fetchFullOrmEvent(eventId) {
  if (!eventId) return null;
  if (ormBaseUrl) {
    try {
      const response = await fetch(`${ormBaseUrl}/api/events/${encodeURIComponent(eventId)}?includeMedia=true`, { cache: "no-store" });
      if (response.ok) {
        const payload = await response.json();
        return payload.event || payload.data || payload;
      }
    } catch (error) {}
  }
  return orm.getEventById(eventId, { includeMedia: true });
}

async function fetchPublicOrmEventSummary(eventId) {
  if (!eventId) return null;
  if (ormBaseUrl) {
    try {
      const response = await fetch(`${ormBaseUrl}/api/events/${encodeURIComponent(eventId)}?includeMedia=false`, { cache: "no-store" });
      if (response.ok) {
        const payload = await response.json();
        return payload.event || payload.data || payload;
      }
    } catch (error) {}
  }
  return orm.getEventById(eventId, { includeMedia: false });
}

async function hydrateFeaturedEventMedia(events) {
  const featuredIds = publicFeaturedImageEventIds(events);
  const fullEvents = await Promise.all([...featuredIds].map(fetchFullOrmEvent));
  const fullById = new Map(fullEvents.filter(Boolean).map((event) => [String(event.id), event]));
  return events.map((event) => {
    const fullEvent = fullById.get(String(event.id));
    if (!fullEvent) return event;
    return {
      ...event,
      image: fullEvent.image || event.image,
      gallery: Array.isArray(fullEvent.gallery) ? fullEvent.gallery : event.gallery,
    };
  });
}

function publicEventSummary(event, includeInlineImages = false) {
  let gallery = Array.isArray(event.gallery)
    ? event.gallery
        .map((item) => (typeof item === "string" ? { src: item } : item))
        .filter((item) => publicImageAllowed(item?.src || item?.image, includeInlineImages))
        .slice(0, includeInlineImages ? 1 : 3)
        .map((item, index) => ({
          ...item,
          src: toPublicMediaReference(event.id, item?.src || item?.image, "gallery", index),
          image: undefined,
        }))
    : [];
  const image = publicImageAllowed(event.image, includeInlineImages) ? toPublicMediaReference(event.id, event.image, "primary") : gallery[0]?.src || "";
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

function dedupePublicEventMedia(events) {
  const seenMedia = new Set();
  return (Array.isArray(events) ? events : []).map((event) => {
    const image = String(event?.image || "");
    const gallery = Array.isArray(event?.gallery) ? event.gallery : [];
    const mediaKey = image || gallery.map((item) => item?.src || item?.image || "").find(Boolean) || "";
    if (!mediaKey || !seenMedia.has(mediaKey)) {
      if (mediaKey) seenMedia.add(mediaKey);
      return event;
    }
    return { ...event, image: "", gallery: [] };
  });
}

function buildPublicEventsQuery(reqUrl) {
  const sourceUrl = new URL(reqUrl, "http://localhost");
  const query = new URLSearchParams();
  ["startDate", "endDate", "page", "pageSize"].forEach((key) => {
    const value = sourceUrl.searchParams.get(key);
    if (value) query.set(key, value);
  });
  return query.toString();
}

async function loadPublicEventsResult(reqUrl) {
  const query = buildPublicEventsQuery(reqUrl);
  if (ormBaseUrl) {
    try {
      const response = await fetch(`${ormBaseUrl}/api/events${query ? `?${query}` : ""}`, { cache: "no-store" });
      if (response.ok) return response.json();
    } catch (error) {}
  }

  const url = new URL(reqUrl, "http://localhost");
  return orm.getEvents({
    startDate: url.searchParams.get("startDate") || "",
    endDate: url.searchParams.get("endDate") || "",
    page: url.searchParams.get("page") || 1,
    pageSize: url.searchParams.get("pageSize") || 50,
  });
}

async function loadPublicEvents(reqUrl) {
  const payload = await loadPublicEventsResult(reqUrl);
  return Array.isArray(payload.events) ? payload.events : [];
}

async function publicPayload(reqUrl) {
  const sourceEvents = await loadPublicEvents(reqUrl);
  const hydratedEvents = await hydrateFeaturedEventMedia(sourceEvents);
  const enrichedEvents = dedupePublicEventMedia(enrichPublicFeaturedEventMedia(hydratedEvents));
  return {
    data: {
      events: enrichedEvents.map((event) => publicEventSummary(event, true)),
      patrols: readJsonFile(patrolsFile, []),
      holidays: readHolidays(),
    },
  };
}
async function publicEventDetailPayload(eventId) {
  let sourceEvent = await fetchPublicOrmEventSummary(eventId);
  if (!sourceEvent) return null;

  if (!hasPublicEventMedia(sourceEvent) && !shouldAvoidFullPublicMediaFetch(sourceEvent)) {
    const fullEvent = await fetchFullOrmEvent(eventId);
    if (fullEvent) {
      sourceEvent = {
        ...sourceEvent,
        image: fullEvent.image || sourceEvent.image,
        gallery: Array.isArray(fullEvent.gallery) ? fullEvent.gallery : sourceEvent.gallery,
      };
    }
  }

  const enrichedEvent = enrichPublicFeaturedEventMedia([sourceEvent])[0];
  return { data: publicEventSummary(enrichedEvent, true) };
}

async function publicEventMediaSource(eventId, mediaPath) {
  const event = await fetchFullOrmEvent(eventId);
  if (!event) return "";
  if (mediaPath === "primary") {
    return String(event.image || "").trim();
  }
  const galleryMatch = String(mediaPath || "").match(/^gallery\/(\d+)$/);
  if (!galleryMatch) return "";
  const galleryIndex = Number(galleryMatch[1]);
  const galleryItem = Array.isArray(event.gallery) ? event.gallery[galleryIndex] : null;
  return String((typeof galleryItem === "string" ? galleryItem : galleryItem?.src || galleryItem?.image) || "").trim();
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

  const url = new URL(req.url, "http://localhost");

  if (req.method === "GET" && url.pathname === "/api/public") {
    json(res, 200, await publicPayload(req.url));
    return true;
  }

  if (req.method === "GET" && url.pathname === "/api/events") {
    const payload = await loadPublicEventsResult(req.url);
    const sourceEvents = Array.isArray(payload.events) ? payload.events : [];
    const enrichedEvents = enrichCalendarEventMedia(sourceEvents);
    json(res, 200, { ...payload, events: enrichedEvents.map((event) => publicEventSummary(event, true)) });
    return true;
  }

  const publicMediaMatch = url.pathname.match(/^\/api\/public\/events\/([^/]+)\/media\/(.+)$/);
  if (req.method === "GET" && publicMediaMatch) {
    const eventId = decodeURIComponent(publicMediaMatch[1]);
    const mediaSource = await publicEventMediaSource(eventId, decodeURIComponent(publicMediaMatch[2]));
    if (isInlineImageReference(mediaSource)) {
      sendDataUrlMedia(res, mediaSource);
    } else {
      json(res, 404, { error: "Media not found" });
    }
    return true;
  }

  if (req.method === "GET" && req.url.startsWith("/api/public/events/")) {
    const eventId = decodeURIComponent(new URL(req.url, "http://localhost").pathname.replace("/api/public/events/", ""));
    const payload = await publicEventDetailPayload(eventId);
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

repairOrmEventsJson();
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
