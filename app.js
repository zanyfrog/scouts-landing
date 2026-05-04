const patrolNames = ["Python Patrol", "Nuclear Meese", "Flaming Arrows", "Senior"];
let scouts = [];
let adults = [];
let adultLeaders = [];
let adultScoutRelationships = [];
let patrols = [];
let roster = [];
let groupedByPatrol = [];
let savedParentGuardians = [];
let scoutLeadershipGroups = [];
let showAddAdultRow = false;
let showAddPatrolRow = false;
const defaultEvents = [];
let events = [];
const loadedCalendarMonths = new Set();
let holidays = [];
const unassignedPatrolValue = "";
const unassignedPatrolLabel = "Unassigned";
const defaultScoutAvatar = "assets/default-scout-avatar.svg";
const legacyDefaultScoutAvatar = "https://i.pinimg.com/474x/24/99/03/249903173ee16b3346ba320a24e56a8b.jpg";
const dashboards = { scout: { eyebrow: "Scout dashboard", title: "Your next events, rank progress, and patrol activity.", intro: "After login, scouts land on a role-based dashboard that keeps meetings, patrol updates, and advancement in one place.", tasks: ["Review upcoming troop and patrol events", "Check current rank progress and recent achievements", "See attendance history and service-hour highlights"], reports: ["Attendance report access when scout-visible data applies"] }, parent: { eyebrow: "Parent dashboard", title: "A family view of upcoming events and scout progress.", intro: "Parents can see the information they are allowed to access, including upcoming events, linked scout details, and family-relevant reports.", tasks: ["View upcoming troop events and invitations", "Track linked scout attendance, rank progress, and service hours", "Review reports tied to accessible family data"], reports: ["Attendance reports for linked scout data", "Rank-history report where family access is allowed"] }, "adult-leader": { eyebrow: "Adult leader dashboard", title: "Manage attendance, calendar updates, and troop operations.", intro: "Adult leaders can handle event attendance, calendar-driven updates, and role-relevant reports from their landing page.", tasks: ["Mark attendance for non-regular-meeting events", "Create or edit Google Calendar-backed events", "Enter service hours and fundraising records", "Review youth and adult org charts"], reports: ["Roster report", "Org chart", "Rank-history report", "Service-hours report", "Fundraising report", "Attendance report"] }, committee: { eyebrow: "Committee dashboard", title: "See committee-relevant events, reporting, and troop administration.", intro: "Committee members land on a dashboard tuned to the data and reports they are permitted to see.", tasks: ["Review committee-visible events", "Access reports for authorized troop data", "Monitor upcoming ceremonies and planning milestones"], reports: ["Reports available when the committee role has access to the underlying data"] }, admin: { eyebrow: "Administrator dashboard", title: "Administrative oversight across people, reports, and audit history.", intro: "Administrators receive a broad role-based dashboard with access to operations, reporting, and system oversight.", tasks: ["Approve registrations and manage person records", "Review audit history and troop-role access", "Access all reporting supported by administrator permissions"], reports: ["Roster report", "Org chart", "Rank-history report", "Service-hours report", "Fundraising report", "Attendance report"] } };
const attendanceHistory = [
  {
    id: "2026-01",
    month: "January 2026",
    present: 34,
    absent: 6,
    items: [
      { id: "jan-winter-skills", title: "Winter Skills Night", dateLabel: "January 7, 2026", present: 16, absent: 4 },
      { id: "jan-service-day", title: "January Service Project", dateLabel: "January 14, 2026", present: 18, absent: 2 },
      { id: "jan-campfire-program", title: "Campfire Program Rehearsal", dateLabel: "January 21, 2026", present: 15, absent: 3 },
    ],
  },
  {
    id: "2026-02",
    month: "February 2026",
    present: 36,
    absent: 4,
    items: [
      { id: "feb-knot-relays", title: "Knot Relays Meeting", dateLabel: "February 4, 2026", present: 17, absent: 1 },
      { id: "feb-dutch-oven", title: "Dutch Oven Prep Night", dateLabel: "February 11, 2026", present: 19, absent: 3 },
      { id: "feb-patrol-planning", title: "Patrol Planning Session", dateLabel: "February 25, 2026", present: 18, absent: 0 },
    ],
  },
  {
    id: "2026-03",
    month: "March 2026",
    present: 37,
    absent: 3,
    items: [
      { id: "mar-first-aid", title: "First Aid Challenge", dateLabel: "March 3, 2026", present: 18, absent: 2 },
      { id: "mar-gear-check", title: "Camp Gear Check", dateLabel: "March 17, 2026", present: 19, absent: 1 },
      { id: "mar-hike-planning", title: "Trail Hike Planning", dateLabel: "March 24, 2026", present: 20, absent: 0 },
    ],
  },
  {
    id: "2026-04",
    month: "April 2026",
    present: 35,
    absent: 5,
    items: [
      { id: "apr-river-cleanup", title: "River Cleanup Service Day", dateLabel: "April 5, 2026", present: 16, absent: 2, eventId: "river-cleanup" },
      { id: "apr-stem-night", title: "Regular Meeting: STEM Challenge Night", dateLabel: "April 8, 2026", present: 19, absent: 3, eventId: "troop-meeting-stem" },
      { id: "apr-campout-briefing", title: "Spring Campout Briefing", dateLabel: "April 15, 2026", present: 18, absent: 0, eventId: "spring-campout" },
    ],
  },
];
let expandedAttendanceMonths = new Set(["2026-04"]);
const adultRoleOptions = ["Scoutmaster", "Assistant Scoutmaster", "Committee Chair", "Committee Member", "Advancement Chair", "Treasurer", "Secretary", "Outdoor Activities Coordinator", "Equipment Coordinator", "Transportation Coordinator"];
const scoutLeadershipOptions = ["", "Senior Patrol Leader", "Assistant Senior Patrol Leader", "Patrol Leader", "Assistant Patrol Leader", "Scribe", "Quartermaster", "Historian", "Instructor", "Librarian", "Chaplain Aide", "Webmaster", "Outdoor Ethics Guide", "Bugler", "Den Chief", "Troop Guide", "OA Representative"];
const scoutRankOptions = ["Scout", "Tenderfoot", "Second Class", "First Class", "Star", "Life", "Eagle"];
const eventAudienceOptions = ["Troop", "Patrol", "Individuals", "Unit", "Adults"];
const imageReactionTypes = ["like", "love", "laugh", "disappointed"];
const scoutRankOrder = { Eagle: 8, Life: 7, Star: 6, "First Class": 5, "Second Class": 4, Tenderfoot: 3, Scout: 2, "Scout Rank": 2, Bobcat: 1 };
const eventEditorFieldSelector = "[data-event-edit-title], [data-event-edit-category], [data-event-edit-start], [data-event-edit-end], [data-event-edit-home-base], [data-event-edit-audience], [data-event-edit-description], [data-event-edit-note], [data-event-edit-upcoming], [data-event-edit-repeat-enabled], [data-event-edit-repeat-frequency], [data-event-edit-repeat-interval], [data-event-edit-repeat-until], [data-event-edit-repeat-monthly-pattern], [data-event-edit-repeat-monthly-ordinal], [data-event-edit-repeat-monthly-weekday], [data-gallery-title], [data-gallery-description], [data-activity-description], [data-activity-location], [data-activity-start], [data-activity-end]";
let eventAutosaveTimer = null;
let eventEditorSaveStatus = "saved";
let scoutRecordSaveStatus = "saved";
let pendingCalendarEventScroll = false;
const hydratedPublicEventIds = new Set();
const prototypeToday = new Date();
const saintJosephLocation = "Saint Joseph Catholic Church - Eldersburg";
function slugifyName(value) { return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, ""); }
function defaultReportsTo(role) { if (role === "Scoutmaster") return "Committee Chair"; if (role === "Assistant Scoutmaster") return "Scoutmaster"; if (role === "Committee Chair") return "Troop Committee"; return "Committee Chair"; }
function defaultArea(role) { return role === "Scoutmaster" || role === "Assistant Scoutmaster" ? "Program" : "Committee"; }
const adultRoleRank = { "Scoutmaster": 1, "Assistant Scoutmaster": 2, "Committee Chair": 3, "Advancement Chair": 4, "Treasurer": 5, "Secretary": 6, "Outdoor Activities Coordinator": 7, "Equipment Coordinator": 8, "Transportation Coordinator": 9, "Committee Member": 10 };
function sortAdultLeaders() { adultLeaders = [...adultLeaders].sort((a, b) => (adultRoleRank[a.role] || 999) - (adultRoleRank[b.role] || 999) || a.name.localeCompare(b.name)); }
function uniqueBy(items, getKey) { return [...new Map(items.map((item) => [getKey(item), item])).values()]; }
function normalizePatrol(record) { return { name: String(record?.name || "").trim(), badge: String(record?.badge || "").trim() }; }
function serializePatrol(patrol) { return { name: patrol.name, badge: patrol.badge }; }
function getPatrolRecord(patrolName) { return patrols.find((patrol) => patrol.name.toLowerCase() === String(patrolName || "").trim().toLowerCase()) || null; }
function getPatrolDisplayName(patrolName) { return String(patrolName || "").trim() || unassignedPatrolLabel; }
function isPatrolSpecificRole(role) { return role === "Patrol Leader" || role === "Assistant Patrol Leader"; }
function splitScoutName(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] || "", lastName: parts.slice(1).join(" ") };
}
function getScoutFirstName(scout) { return String(scout?.firstName || "").trim() || splitScoutName(scout?.name).firstName; }
function getScoutLastName(scout) { return String(scout?.lastName || "").trim() || splitScoutName(scout?.name).lastName; }
function getScoutFullName(scout) { return [getScoutFirstName(scout), getScoutLastName(scout)].filter(Boolean).join(" ") || String(scout?.name || "").trim() || "Unknown scout"; }
function getDefaultScoutNickname(scout) { return getScoutFirstName(scout); }
function getScoutNickname(scout) { return String(scout?.nickname || "").trim() || getDefaultScoutNickname(scout); }
function getScoutDirectoryName(scout) {
  const name = getScoutFullName(scout);
  const firstName = getDefaultScoutNickname(scout);
  const nickname = getScoutNickname(scout);
  return nickname && nickname.toLowerCase() !== firstName.toLowerCase() ? `${name} (${nickname})` : name;
}
function getScoutAvatar(scout) {
  const avatar = String(scout?.avatar || "").trim();
  return !avatar || avatar === legacyDefaultScoutAvatar ? defaultScoutAvatar : avatar;
}
function renderScoutAvatar(scout, className = "scout-avatar") {
  const label = getScoutFullName(scout);
  return `<img class="${className}" src="${getScoutAvatar(scout)}" alt="${label} avatar" />`;
}
function renderScoutName(sc, options = {}) {
  const label = options.label || getScoutFullName(sc);
  const className = options.className || "text-link";
  const nameMarkup = canSeeOrgChart() && sc?.id
    ? `<a class="${className}" href="#/scouts/${sc.id}"${options.newTab === false ? "" : ` target="_blank" rel="noreferrer"`}>${label}</a>`
    : `<span>${label}</span>`;
  return `<span class="scout-name-with-avatar">${renderScoutAvatar(sc)}${nameMarkup}</span>`;
}
function getPatrolNameList(extraPatrols = [], options = {}) {
  const includeUnassigned = options.includeUnassigned || [...scouts, ...roster, ...extraPatrols.map((patrol) => ({ patrol }))].some((entry) => !String(entry?.patrol ?? entry).trim());
  const names = uniqueBy([...patrolNames, ...patrols.map((patrol) => patrol.name), ...scouts.map((scout) => scout.patrol), ...extraPatrols].filter((name) => name !== undefined && name !== null && String(name).trim()), (name) => String(name).toLowerCase()).sort((a, b) => a.localeCompare(b));
  return includeUnassigned ? [unassignedPatrolValue, ...names] : names;
}
function normalizeScout(record) { const patrol = String(record.patrol || "").trim(); const leadershipRole = record.leadershipRole || ""; const firstName = getScoutFirstName(record); const lastName = getScoutLastName(record); const name = [firstName, lastName].filter(Boolean).join(" ") || record.name; return { id: record.id, name, firstName, lastName, nickname: getScoutNickname({ ...record, name, firstName, lastName }), gender: record.gender || "not specified", patrol, patrolBadge: getPatrolBadgeValue(patrol, record.patrolBadge), rank: record.rank || "Scout", leadershipRole: !patrol && isPatrolSpecificRole(leadershipRole) ? "" : leadershipRole, avatar: String(record.avatar || "").trim() || defaultScoutAvatar, parents: [] }; }
function normalizeAdult(record) { return { id: record.id, name: record.name, relationship: record.relationship || "Adult leader", email: record.email || "", homePhone: record.homePhone || "", cellPhone: record.cellPhone || "" }; }
function normalizeAdultLeader(record) { return { adultId: record.adultId || `adult-${slugifyName(record.name)}`, role: record.role || "Committee Member" }; }
function normalizeAdultScoutRelationship(record) { return { adultId: record.adultId, scoutId: record.scoutId, relationship: record.relationship || "Parent", priority: String(record.priority || "1") }; }
function normalizeHoliday(record) { const date = String(record?.date || "").trim(); const rawEndDate = String(record?.endDate || date).trim(); const endDate = rawEndDate && date && rawEndDate < date ? date : rawEndDate; return { id: String(record?.id || "").trim() || nextHolidayId(), name: String(record?.name || "Custom holiday").trim(), date, endDate, placedBy: String(record?.placedBy || "").trim(), role: String(record?.role || "").trim() || "Adult leader", note: String(record?.note || "").trim() }; }
function serializeScout(scout) { const firstName = getScoutFirstName(scout); const lastName = getScoutLastName(scout); const name = [firstName, lastName].filter(Boolean).join(" ") || scout.name; return { id: scout.id, name, firstName, lastName, nickname: getScoutNickname({ ...scout, name, firstName, lastName }), gender: scout.gender, patrol: scout.patrol, patrolBadge: getPatrolBadgeValue(scout.patrol, scout.patrolBadge), rank: scout.rank, leadershipRole: scout.leadershipRole, avatar: getScoutAvatar(scout) }; }
function serializeAdult(adult) { return { id: adult.id, name: adult.name, relationship: adult.relationship, email: adult.email, homePhone: adult.homePhone || "", cellPhone: adult.cellPhone || "" }; }
function serializeAdultLeader(leader) { return { adultId: leader.adultId, role: leader.role }; }
function serializeAdultScoutRelationship(relationship) { return { adultId: relationship.adultId, scoutId: relationship.scoutId, relationship: relationship.relationship, priority: relationship.priority }; }
function serializeHoliday(holiday) { return { id: holiday.id, name: holiday.name, date: holiday.date, endDate: holiday.endDate || holiday.date, placedBy: holiday.placedBy, role: holiday.role, note: holiday.note }; }
function normalizeEventLocation(value) {
  const normalized = String(value || "").trim();
  const compact = normalized.toLowerCase().replace(/\s+/g, " ");
  return compact === "st. joseph" || compact === "st joseph" || compact === "saint joseph" ? saintJosephLocation : normalized;
}
function normalizeActivity(record, index = 0) { return { id: record.id || `activity-${index + 1}`, description: record.description || "", location: normalizeEventLocation(record.location || ""), startDate: record.startDate || "", endDate: record.endDate || "" }; }
function createEmptyReactions() { return { like: [], love: [], laugh: [], disappointed: [] }; }
function normalizeImageReactions(record) { const reactions = createEmptyReactions(); imageReactionTypes.forEach((reaction) => { reactions[reaction] = Array.isArray(record?.[reaction]) ? record[reaction].filter(Boolean) : []; }); return reactions; }
function normalizeImageComment(comment, index = 0) { return { id: comment?.id || `comment-${index + 1}`, authorId: comment?.authorId || "", authorName: comment?.authorName || "Unknown user", createdAt: comment?.createdAt || new Date().toISOString(), text: comment?.text || "" }; }
function detectMediaType(value, mimeType = "") { if (String(mimeType).startsWith("video/")) return "video"; if (String(mimeType).startsWith("image/")) return "image"; if (/^data:video\//i.test(String(value || ""))) return "video"; if (/^data:image\//i.test(String(value || ""))) return "image"; if (/\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(String(value || ""))) return "video"; return "image"; }
function normalizeGalleryItem(item, index = 0) {
  if (typeof item === "string") {
    return { id: `image-${index + 1}`, src: item, mediaType: detectMediaType(item), title: "", description: "", imageDateTime: "", capturedAt: "", uploadedAt: "", comments: [], reactions: createEmptyReactions() };
  }
  return {
    id: item?.id || `image-${index + 1}`,
    src: item?.src || item?.image || "",
    mediaType: item?.mediaType || detectMediaType(item?.src || item?.image || "", item?.mimeType || ""),
    title: item?.title || "",
    description: item?.description || "",
    imageDateTime: item?.imageDateTime || item?.capturedAt || item?.dateTaken || "",
    capturedAt: item?.capturedAt || item?.imageDateTime || item?.dateTaken || "",
    uploadedAt: item?.uploadedAt || item?.createdAt || item?.datetime || "",
    originalName: item?.originalName || item?.fileName || "",
    lastModified: item?.lastModified || "",
    comments: Array.isArray(item?.comments) ? item.comments.map((comment, commentIndex) => normalizeImageComment(comment, commentIndex)) : [],
    reactions: normalizeImageReactions(item?.reactions || item),
  };
}
function getGalleryItemDateTime(item, index = 0) { const timestamp = Date.parse(item?.imageDateTime || item?.capturedAt || item?.dateTaken || item?.lastModified || item?.uploadedAt || item?.createdAt || item?.datetime || ""); return Number.isFinite(timestamp) ? timestamp : index; }
function sortGalleryByDateTime(items) { return (Array.isArray(items) ? items : []).map((item, index) => ({ item: normalizeGalleryItem(item, index), index })).filter(({ item }) => item.src).sort((a, b) => getGalleryItemDateTime(a.item, a.index) - getGalleryItemDateTime(b.item, b.index) || a.index - b.index).map(({ item }, index) => ({ ...item, id: item.id || `image-${index + 1}` })); }
function normalizeEvent(record) { const rawGallery = Array.isArray(record.gallery) ? record.gallery.filter(Boolean) : String(record.gallery || "").split(/\r?\n/).map((image) => image.trim()).filter(Boolean); const image = record.image || (typeof rawGallery[0] === "string" ? rawGallery[0] : rawGallery[0]?.src) || scoutOrgLogo; const homeBase = normalizeEventLocation(record.homeBase || record.location || ""); const activities = Array.isArray(record.activities) ? record.activities.map((activity, index) => normalizeActivity(activity, index)) : []; const gallery = sortGalleryByDateTime(rawGallery.map((item, index) => normalizeGalleryItem(item, index))); const repeatEnabled = typeof record.repeatEnabled === "boolean" ? record.repeatEnabled : String(record.repeatEnabled).toLowerCase() === "true"; const repeatInterval = Math.max(1, Number(record.repeatInterval) || 1); return { id: record.id, title: record.title || "Untitled event", category: record.category || "Event", startDate: record.startDate || "", endDate: record.endDate || "", dateLabel: record.dateLabel || "", homeBase, location: homeBase, audience: record.audience || "", description: record.description || "", detailNote: record.detailNote || "", activities, image, gallery: gallery.length ? gallery : [normalizeGalleryItem({ src: image }, 0)], upcoming: typeof record.upcoming === "boolean" ? record.upcoming : String(record.upcoming).toLowerCase() === "true", repeatEnabled, repeatFrequency: record.repeatFrequency || "weekly", repeatInterval, repeatUntil: record.repeatUntil || "", repeatMonthlyPattern: record.repeatMonthlyPattern || "date", repeatMonthlyOrdinal: record.repeatMonthlyOrdinal || "third", repeatMonthlyWeekday: record.repeatMonthlyWeekday || "monday" }; }
function getGalleryImagesFromEditor() { return sortGalleryByDateTime([...document.querySelectorAll("[data-gallery-item]")].map((item, index) => { const currentEvent = getEventById((window.location.hash || "").replace("#/events/", "")); const existing = currentEvent?.gallery?.find((galleryItem) => galleryItem.id === item.dataset.galleryItem) || normalizeGalleryItem({ src: item.dataset.gallerySrc }, index); const nextDescription = item.querySelector("[data-gallery-description]")?.value.trim() || ""; const nextTitle = nextDescription || item.querySelector("[data-gallery-title]")?.value.trim() || ""; return { ...existing, src: item.dataset.gallerySrc || existing.src, title: nextTitle, description: nextDescription }; }).filter((item) => item.src)); }
function setGalleryImagesInEditor(images) { const galleryItems = sortGalleryByDateTime(images); const eventId = (window.location.hash || "").replace("#/events/", ""); const currentEvent = getEventById(eventId); if (currentEvent) { currentEvent.gallery = galleryItems; if (!galleryItems.some((item) => item.src === currentEvent.image)) currentEvent.image = galleryItems[0]?.src || scoutOrgLogo; } }
function parseExifDateTime(value) {
  const match = String(value || "").trim().match(/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
  if (!match) return "";
  const [, year, month, day, hour, minute, second] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}
function readExifAscii(dataView, tiffStart, entryOffset, littleEndian) {
  const type = dataView.getUint16(entryOffset + 2, littleEndian);
  const count = dataView.getUint32(entryOffset + 4, littleEndian);
  if (type !== 2 || !count) return "";
  const valueOffset = count <= 4 ? entryOffset + 8 : tiffStart + dataView.getUint32(entryOffset + 8, littleEndian);
  if (valueOffset < 0 || valueOffset + count > dataView.byteLength) return "";
  let value = "";
  for (let index = 0; index < count; index += 1) {
    const charCode = dataView.getUint8(valueOffset + index);
    if (!charCode) break;
    value += String.fromCharCode(charCode);
  }
  return value;
}
function readExifIfd(dataView, tiffStart, ifdOffset, littleEndian) {
  const offset = tiffStart + ifdOffset;
  if (offset < 0 || offset + 2 > dataView.byteLength) return {};
  const tags = {};
  const entries = dataView.getUint16(offset, littleEndian);
  for (let index = 0; index < entries; index += 1) {
    const entryOffset = offset + 2 + index * 12;
    if (entryOffset + 12 > dataView.byteLength) break;
    const tag = dataView.getUint16(entryOffset, littleEndian);
    if (tag === 0x0132 || tag === 0x9003 || tag === 0x9004) tags[tag] = readExifAscii(dataView, tiffStart, entryOffset, littleEndian);
    if (tag === 0x8769) tags.exifIfdOffset = dataView.getUint32(entryOffset + 8, littleEndian);
  }
  return tags;
}
async function readImageDateTime(file) {
  const lastModified = file?.lastModified ? new Date(file.lastModified).toISOString() : "";
  if (!/^image\/jpe?g$/i.test(String(file?.type || "")) || !file?.slice) return lastModified;
  try {
    const buffer = await file.slice(0, 262144).arrayBuffer();
    const dataView = new DataView(buffer);
    if (dataView.getUint16(0) !== 0xffd8) return lastModified;
    let offset = 2;
    while (offset + 4 < dataView.byteLength) {
      if (dataView.getUint8(offset) !== 0xff) break;
      const marker = dataView.getUint8(offset + 1);
      const segmentLength = dataView.getUint16(offset + 2);
      if (marker === 0xe1 && offset + 4 + segmentLength <= dataView.byteLength) {
        const exifHeader = [0, 1, 2, 3, 4, 5].map((index) => String.fromCharCode(dataView.getUint8(offset + 4 + index))).join("");
        if (exifHeader === "Exif\0\0") {
          const tiffStart = offset + 10;
          const littleEndian = dataView.getUint16(tiffStart) === 0x4949;
          if (dataView.getUint16(tiffStart + 2, littleEndian) !== 42) return lastModified;
          const firstIfdOffset = dataView.getUint32(tiffStart + 4, littleEndian);
          const rootTags = readExifIfd(dataView, tiffStart, firstIfdOffset, littleEndian);
          const exifTags = rootTags.exifIfdOffset ? readExifIfd(dataView, tiffStart, rootTags.exifIfdOffset, littleEndian) : {};
          return parseExifDateTime(exifTags[0x9003] || exifTags[0x9004] || rootTags[0x0132]) || lastModified;
        }
      }
      offset += 2 + segmentLength;
    }
  } catch (error) {}
  return lastModified;
}
function readFileAsDataUrl(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve({ src: String(reader.result || ""), mediaType: detectMediaType(reader.result, file.type) }); reader.onerror = () => reject(reader.error || new Error("Could not read file")); reader.readAsDataURL(file); }); }
function storePatrolsSnapshot() {
  try {
    window.localStorage.setItem("troop883-patrols", JSON.stringify(patrols.map(serializePatrol)));
  } catch (error) {}
}
function storeEventsSnapshot() {
  try {
    window.localStorage.setItem("troop883-events", JSON.stringify(events));
  } catch (error) {
    if (error?.name === "QuotaExceededError") {
      try {
        window.localStorage.removeItem("troop883-events");
      } catch (removeError) {}
      return false;
    }
    throw error;
  }
  return true;
}
async function saveEvents() {
  events = events.map((event) => {
    const gallery = sortGalleryByDateTime(event.gallery || []);
    const image = gallery.some((item) => item.src === event.image) ? event.image : gallery[0]?.src || event.image || scoutOrgLogo;
    return { ...event, image, gallery };
  });
  await postJson("/api/events", { events: events.map((event) => ({ ...event })) });
  storeEventsSnapshot();
}
function eventEditorStatusLabel(status = eventEditorSaveStatus) {
  return status === "dirty" ? "Dirty" : status === "saving" ? "Saving" : "Saved";
}
function setEventEditorSaveStatus(status) {
  eventEditorSaveStatus = status;
  const indicator = document.querySelector("[data-event-save-status]");
  if (!indicator) return;
  indicator.dataset.eventSaveStatus = status;
  indicator.textContent = eventEditorStatusLabel(status);
}
function scoutRecordStatusLabel(status = scoutRecordSaveStatus) {
  return status === "dirty" ? "Dirty" : status === "saving" ? "Saving" : "Saved";
}
function setScoutRecordSaveStatus(status) {
  scoutRecordSaveStatus = status;
  const indicator = document.querySelector("[data-scout-save-status]");
  if (!indicator) return;
  indicator.dataset.scoutSaveStatus = status;
  indicator.textContent = scoutRecordStatusLabel(status);
}
function syncEventFromEditor(eventId) {
  const event = getEventById(eventId);
  if (!event) return null;
  const nextStartValue = document.querySelector("[data-event-edit-start]")?.value.trim() || event.startDate;
  const rawEndValue = document.querySelector("[data-event-edit-end]")?.value.trim();
  const nextEndValue = rawEndValue || nextStartValue;
  const nextGallery = getGalleryImagesFromEditor();
  event.title = document.querySelector("[data-event-edit-title]")?.value.trim() || event.title;
  event.category = document.querySelector("[data-event-edit-category]")?.value.trim() || event.category;
  event.startDate = nextStartValue;
  event.endDate = nextEndValue;
  event.dateLabel = formatEventDateLabelFromRange(nextStartValue, nextEndValue);
  event.homeBase = normalizeEventLocation(document.querySelector("[data-event-edit-home-base]")?.value.trim() || event.homeBase);
  event.location = event.homeBase;
  event.audience = document.querySelector("[data-event-edit-audience]")?.value.trim() || event.audience;
  event.description = document.querySelector("[data-event-edit-description]")?.value.trim() || event.description;
  event.detailNote = document.querySelector("[data-event-edit-note]")?.value.trim() || event.detailNote;
  event.upcoming = (document.querySelector("[data-event-edit-upcoming]")?.value || String(event.upcoming)) === "true";
  event.repeatEnabled = (document.querySelector("[data-event-edit-repeat-enabled]")?.value || String(event.repeatEnabled)) === "true";
  event.repeatFrequency = document.querySelector("[data-event-edit-repeat-frequency]")?.value || event.repeatFrequency || "weekly";
  event.repeatInterval = Math.max(1, Number(document.querySelector("[data-event-edit-repeat-interval]")?.value || event.repeatInterval || 1));
  event.repeatUntil = document.querySelector("[data-event-edit-repeat-until]")?.value.trim() || "";
  event.repeatMonthlyPattern = document.querySelector("[data-event-edit-repeat-monthly-pattern]")?.value || event.repeatMonthlyPattern || "date";
  event.repeatMonthlyOrdinal = document.querySelector("[data-event-edit-repeat-monthly-ordinal]")?.value || event.repeatMonthlyOrdinal || "third";
  event.repeatMonthlyWeekday = document.querySelector("[data-event-edit-repeat-monthly-weekday]")?.value || event.repeatMonthlyWeekday || "monday";
  event.activities = (event.activities || []).map((activity, index) => {
    const nextActivityStart = document.querySelector(`[data-activity-start="${activity.id}"]`)?.value.trim() || activity.startDate || event.startDate;
    const nextActivityEnd = document.querySelector(`[data-activity-end="${activity.id}"]`)?.value.trim() || activity.endDate || nextActivityStart;
    return normalizeActivity({
      id: activity.id || `activity-${index + 1}`,
      description: document.querySelector(`[data-activity-description="${activity.id}"]`)?.value.trim() || activity.description,
      location: normalizeEventLocation(document.querySelector(`[data-activity-location="${activity.id}"]`)?.value.trim() || activity.location),
      startDate: nextActivityStart,
      endDate: nextActivityEnd,
    }, index);
  });
  if (nextGallery.length) {
    event.gallery = sortGalleryByDateTime(nextGallery);
    if (!event.gallery.some((item) => item.src === event.image)) event.image = event.gallery[0]?.src || scoutOrgLogo;
  }
  return event;
}
function queueEventAutosave(eventId, delay = 500) {
  if (!eventId || !canSeeOrgChart()) return;
  setEventEditorSaveStatus("dirty");
  if (eventAutosaveTimer) window.clearTimeout(eventAutosaveTimer);
  eventAutosaveTimer = window.setTimeout(async () => {
    try {
      setEventEditorSaveStatus("saving");
      syncEventFromEditor(eventId);
      await saveEvents();
      setEventEditorSaveStatus("saved");
    } catch (error) {
      setEventEditorSaveStatus("dirty");
      throw error;
    } finally {
      eventAutosaveTimer = null;
    }
  }, delay);
}
async function flushEventAutosave(eventId) {
  if (!eventId || !canSeeOrgChart()) return;
  if (eventAutosaveTimer) {
    window.clearTimeout(eventAutosaveTimer);
    eventAutosaveTimer = null;
  }
  setEventEditorSaveStatus("saving");
  try {
    syncEventFromEditor(eventId);
    await saveEvents();
    setEventEditorSaveStatus("saved");
  } catch (error) {
    setEventEditorSaveStatus("dirty");
    throw error;
  }
}
function loadEvents(initialEvents = []) {
  events = Array.isArray(initialEvents) ? initialEvents.map(normalizeEvent) : [];
  storeEventsSnapshot();
}
function hasPrimaryEventMedia(event) {
  const image = String(event?.image || "").trim();
  const gallery = Array.isArray(event?.gallery) ? event.gallery : [];
  return Boolean(image && image !== scoutOrgLogo) || gallery.some((item) => {
    const src = normalizeGalleryItem(item).src;
    return src && src !== scoutOrgLogo;
  });
}
function mergeLoadedEvents(incomingEvents = []) {
  const nextEventsById = new Map(events.map((event) => [String(event.id), event]));
  incomingEvents.map(normalizeEvent).forEach((event) => {
    if (!event.id) return;
    const existing = nextEventsById.get(String(event.id));
    if (existing && hasPrimaryEventMedia(existing) && !hasPrimaryEventMedia(event)) {
      nextEventsById.set(String(event.id), { ...event, image: existing.image, gallery: existing.gallery });
      return;
    }
    nextEventsById.set(String(event.id), event);
  });
  events = [...nextEventsById.values()];
  storeEventsSnapshot();
}
function getEventById(eventId) { return events.find((event) => event.id === eventId); }
function mapUrlForLocation(location) { return `https://www.google.com/maps?q=${encodeURIComponent(normalizeEventLocation(location))}&output=embed`; }
function directionsUrlForLocation(location) { return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(normalizeEventLocation(location))}`; }
function formatRepeatSummary(event) {
  if (!event?.repeatEnabled) return "";
  const interval = Math.max(1, Number(event.repeatInterval) || 1);
  const frequency = String(event.repeatFrequency || "weekly").toLowerCase();
  const unitLookup = { daily: "day", weekly: "week", monthly: "month" };
  const unit = unitLookup[frequency] || "week";
  let everyLabel = interval === 1 ? `Repeats ${frequency}` : `Repeats every ${interval} ${unit}`;
  if (frequency === "monthly" && event.repeatMonthlyPattern === "nth-weekday") {
    const ordinalLabel = String(event.repeatMonthlyOrdinal || "third");
    const weekdayLabel = String(event.repeatMonthlyWeekday || "monday");
    everyLabel = interval === 1 ? `Repeats on the ${ordinalLabel} ${weekdayLabel} of each month` : `Repeats on the ${ordinalLabel} ${weekdayLabel} every ${interval} months`;
  }
  return event.repeatUntil ? `${everyLabel} until ${formatExactEventDateTime(event.repeatUntil)}` : everyLabel;
}
const monthLookup = { jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7, sep: 8, sept: 8, september: 8, oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11 };
function parseEventStartDate(event) { if (event.startDate) { const dateOnlyMatch = String(event.startDate).match(/^(\d{4})-(\d{2})-(\d{2})$/); if (dateOnlyMatch) return new Date(Number(dateOnlyMatch[1]), Number(dateOnlyMatch[2]) - 1, Number(dateOnlyMatch[3])); const parsed = new Date(event.startDate); if (!Number.isNaN(parsed.getTime())) return parsed; } const normalized = String(event.dateLabel || "").replace(",", "").trim(); const match = normalized.match(/^([A-Za-z]+)\s+(\d{1,2})/); if (!match) return null; const month = monthLookup[match[1].toLowerCase()]; if (month === undefined) return null; const yearMatch = normalized.match(/(\d{4})/); const year = yearMatch ? Number(yearMatch[1]) : 2026; return new Date(year, month, Number(match[2])); }
function parseEventEndDate(event) { if (event.endDate) { const dateOnlyMatch = String(event.endDate).match(/^(\d{4})-(\d{2})-(\d{2})$/); if (dateOnlyMatch) return new Date(Number(dateOnlyMatch[1]), Number(dateOnlyMatch[2]) - 1, Number(dateOnlyMatch[3])); const parsed = new Date(event.endDate); if (!Number.isNaN(parsed.getTime())) return parsed; } return parseEventStartDate(event); }
function startOfDay(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
function isUpcomingEvent(event) {
  const comparisonDate = startOfDay(prototypeToday).getTime();
  const endDate = parseEventEndDate(event) || parseEventStartDate(event);
  if (!endDate) return false;
  return startOfDay(endDate).getTime() >= comparisonDate;
}
function isWalkersvilleEvent(event) {
  const homeBase = String(event?.homeBase || event?.location || "").trim().toLowerCase();
  return homeBase.includes("walkersville") || homeBase.includes("walersville");
}
function isSandyPointEvent(event) {
  const homeBase = String(event?.homeBase || event?.location || "").trim().toLowerCase();
  return homeBase.includes("sandy point state park");
}
function getWalkersvilleDefaultGalleryItem() {
  const sourceEvent = events.find((event) => isWalkersvilleEvent(event) && hasPrimaryEventMedia(event));
  if (!sourceEvent) return null;
  if (sourceEvent.image) {
    const sourcePrimary = (sourceEvent.gallery || []).find((item) => normalizeGalleryItem(item).src === sourceEvent.image);
    return normalizeGalleryItem(sourcePrimary || { src: sourceEvent.image, title: sourceEvent.title, description: sourceEvent.description }, 0);
  }
  const sourceGallery = sourceEvent.gallery || [];
  if (!sourceGallery.length) return null;
  return normalizeGalleryItem(sourceGallery[0], 0);
}
function getSandyPointDefaultGalleryItem() {
  return normalizeGalleryItem({ src: "https://dnr.maryland.gov/publiclands/PublishingImages/sandy-point-drone-photo.jpg", title: "Sandy Point State Park", description: "Sandy Point State Park" }, 0);
}
function getDisplayMediaItems(event) {
  const mediaItems = event?.gallery?.length ? sortGalleryByDateTime(event.gallery) : [normalizeGalleryItem({ src: event?.image }, 0)];
  const primaryIndex = mediaItems.findIndex((item) => item.src === event?.image);
  if (primaryIndex > 0) {
    const [primaryItem] = mediaItems.splice(primaryIndex, 1);
    mediaItems.unshift(primaryItem);
  }
  if (isSandyPointEvent(event)) {
    const sandyPointDefault = getSandyPointDefaultGalleryItem();
    return [sandyPointDefault, ...mediaItems.filter((item) => item?.src && item.src !== sandyPointDefault.src)];
  }
  if (!isUpcomingEvent(event) || !isWalkersvilleEvent(event)) return mediaItems;
  const walkersvilleDefault = getWalkersvilleDefaultGalleryItem();
  if (!walkersvilleDefault?.src) return mediaItems;
  return [walkersvilleDefault, ...mediaItems.filter((item) => item?.src && item.src !== walkersvilleDefault.src)];
}
function getMonthlyOrdinalWeekdayDate(year, month, ordinal, weekday) {
  const weekdayLookup = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
  const targetWeekday = weekdayLookup[String(weekday || "").toLowerCase()];
  if (targetWeekday === undefined) return null;
  const dates = [];
  for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day += 1) {
    const candidate = new Date(year, month, day);
    if (candidate.getDay() === targetWeekday) dates.push(candidate);
  }
  if (!dates.length) return null;
  if (String(ordinal || "").toLowerCase() === "last") return dates[dates.length - 1];
  const ordinalLookup = { first: 0, second: 1, third: 2, fourth: 3 };
  const ordinalIndex = ordinalLookup[String(ordinal || "").toLowerCase()];
  return ordinalIndex === undefined ? null : (dates[ordinalIndex] || null);
}
function occursOnRecurringRule(event, date, start, end) {
  const targetDay = startOfDay(date);
  const startDay = startOfDay(start);
  const endDay = startOfDay(end);
  if (targetDay.getTime() < startDay.getTime()) return false;
  if (event.repeatUntil) {
    const repeatUntil = new Date(event.repeatUntil);
    if (!Number.isNaN(repeatUntil.getTime()) && targetDay.getTime() > startOfDay(repeatUntil).getTime()) return false;
  }
  const eventDurationDays = Math.max(0, Math.round((endDay.getTime() - startDay.getTime()) / (24 * 60 * 60 * 1000)));
  const frequency = String(event.repeatFrequency || "weekly").toLowerCase();
  const interval = Math.max(1, Number(event.repeatInterval) || 1);
  if (frequency === "daily") {
    const dayDiff = Math.round((targetDay.getTime() - startDay.getTime()) / (24 * 60 * 60 * 1000));
    return dayDiff % interval >= 0 && dayDiff % interval <= eventDurationDays;
  }
  if (frequency === "weekly") {
    const dayDiff = Math.round((targetDay.getTime() - startDay.getTime()) / (24 * 60 * 60 * 1000));
    const weekDiff = Math.floor(dayDiff / 7);
    if (weekDiff < 0 || weekDiff % interval !== 0) return false;
    const occurrenceStart = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate() + (weekDiff * 7));
    const occurrenceEnd = new Date(occurrenceStart.getFullYear(), occurrenceStart.getMonth(), occurrenceStart.getDate() + eventDurationDays);
    return targetDay.getTime() >= occurrenceStart.getTime() && targetDay.getTime() <= occurrenceEnd.getTime();
  }
  if (frequency === "monthly") {
    const monthDiff = ((targetDay.getFullYear() - startDay.getFullYear()) * 12) + (targetDay.getMonth() - startDay.getMonth());
    if (monthDiff < 0 || monthDiff % interval !== 0) return false;
    let occurrenceStart = null;
    if (event.repeatMonthlyPattern === "nth-weekday") {
      occurrenceStart = getMonthlyOrdinalWeekdayDate(targetDay.getFullYear(), targetDay.getMonth(), event.repeatMonthlyOrdinal, event.repeatMonthlyWeekday);
      if (!occurrenceStart) return false;
      occurrenceStart.setHours(start.getHours(), start.getMinutes(), start.getSeconds(), start.getMilliseconds());
    } else {
      const dayOfMonth = Math.min(startDay.getDate(), new Date(targetDay.getFullYear(), targetDay.getMonth() + 1, 0).getDate());
      occurrenceStart = new Date(targetDay.getFullYear(), targetDay.getMonth(), dayOfMonth, start.getHours(), start.getMinutes(), start.getSeconds(), start.getMilliseconds());
    }
    const occurrenceStartDay = startOfDay(occurrenceStart);
    const occurrenceEndDay = new Date(occurrenceStartDay.getFullYear(), occurrenceStartDay.getMonth(), occurrenceStartDay.getDate() + eventDurationDays);
    return targetDay.getTime() >= occurrenceStartDay.getTime() && targetDay.getTime() <= occurrenceEndDay.getTime();
  }
  return false;
}
function eventOccursOnDate(event, date) { const start = parseEventStartDate(event); const end = parseEventEndDate(event); if (!start || !end || !date) return false; if (event.repeatEnabled) return occursOnRecurringRule(event, date, start, end); const target = startOfDay(date).getTime(); return target >= startOfDay(start).getTime() && target <= startOfDay(end).getTime(); }
function eventOccursInMonth(event, year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day += 1) {
    if (eventOccursOnDate(event, new Date(year, month, day))) return true;
  }
  return false;
}
function formatDateTimeLocalValue(value) { const parsed = value ? new Date(value) : null; if (!parsed || Number.isNaN(parsed.getTime())) return ""; return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}T${String(parsed.getHours()).padStart(2, "0")}:${String(parsed.getMinutes()).padStart(2, "0")}`; }
function formatEventDateLabelFromRange(startValue, endValue) { const start = startValue ? new Date(startValue) : null; const end = endValue ? new Date(endValue) : null; if (!start || Number.isNaN(start.getTime())) return ""; const startHasTime = String(startValue || "").includes("T"); const endHasTime = String(endValue || "").includes("T"); const dateOptions = { month: "short", day: "numeric", year: "numeric" }; const timeOptions = { hour: "numeric", minute: "2-digit" }; const startDateText = start.toLocaleDateString("en-US", dateOptions); if (!end || Number.isNaN(end.getTime())) return startHasTime ? `${startDateText}, ${start.toLocaleTimeString("en-US", timeOptions)}` : startDateText; const sameDay = start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth() && start.getDate() === end.getDate(); if (sameDay) return (startHasTime || endHasTime) ? `${startDateText}, ${start.toLocaleTimeString("en-US", timeOptions)}-${end.toLocaleTimeString("en-US", timeOptions)}` : startDateText; const endDateText = end.toLocaleDateString("en-US", dateOptions); return `${startDateText} - ${endDateText}`; }
function formatExactEventDateTime(value) { const parsed = value ? new Date(value) : null; if (!parsed || Number.isNaN(parsed.getTime())) return "Not set"; const hasTime = String(value || "").includes("T"); return hasTime ? parsed.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : parsed.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }); }
function nextActivityId(event) { const used = new Set((event.activities || []).map((activity) => activity.id)); let counter = (event.activities || []).length + 1; while (used.has(`activity-${counter}`)) counter += 1; return `activity-${counter}`; }
function renderActivitySummary(activity) { return `<article class="month-summary-card"><div class="panel-heading"><h3>${activity.description || "Activity"}</h3><p>${formatExactEventDateTime(activity.startDate)} - ${formatExactEventDateTime(activity.endDate || activity.startDate)}</p></div><div class="event-meta"><span>${activity.location || "Location TBD"}</span></div></article>`; }
function renderCalendarExpandableEvent(event) { return `<details class="month-summary-card event-expand-card"><summary><div class="panel-heading"><h3>${event.title}</h3><p>${event.dateLabel} • ${event.homeBase || "Home base TBD"}</p></div></summary><div class="detail-stack"><p class="event-description">${event.description}</p><div class="event-meta"><span>${event.category}</span><span>${event.audience}</span>${event.repeatEnabled ? `<span>${formatRepeatSummary(event)}</span>` : ""}</div><ul class="detail-list"><li>Location from where all activities will start: ${event.homeBase || "Home base TBD"}</li><li>Starts: ${formatExactEventDateTime(event.startDate)}</li><li>Ends: ${formatExactEventDateTime(event.endDate || event.startDate)}</li>${event.repeatEnabled ? `<li>${formatRepeatSummary(event)}</li>` : ""}</ul>${event.activities?.length ? `<div class="detail-stack"><h4>Activities</h4>${event.activities.map(renderActivitySummary).join("")}</div>` : ""}<div class="scribe-actions"><a class="text-link" href="#/events/${event.id}">${canSeeOrgChart() ? "Open editor" : "Open event page"}</a></div></div></details>`; }
function getEventMonthKey(event) { const date = parseEventStartDate(event); if (!date) return ""; return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; }
function formatMonthLabel(monthKey) { const [year, month] = monthKey.split("-").map(Number); return new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" }); }
function getEventMonths() {
  const months = new Set();
  events.forEach((event) => {
    const start = parseEventStartDate(event);
    if (!start) return;
    const startMonthKey = getMonthKeyForDate(start);
    months.add(startMonthKey);
    if (!event.repeatEnabled) return;
    const repeatUntil = event.repeatUntil ? new Date(event.repeatUntil) : null;
    const fallbackEnd = new Date(prototypeToday.getFullYear() + 1, prototypeToday.getMonth(), 1);
    const limit = repeatUntil && !Number.isNaN(repeatUntil.getTime()) ? repeatUntil : fallbackEnd;
    let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const limitMonth = new Date(limit.getFullYear(), limit.getMonth(), 1);
    while (cursor.getTime() <= limitMonth.getTime()) {
      months.add(getMonthKeyForDate(cursor));
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }
  });
  return [...months].sort();
}
function getSortedEvents() { return [...events].sort((a, b) => (parseEventStartDate(a)?.getTime() || 0) - (parseEventStartDate(b)?.getTime() || 0)); }
function getSelectedEventMonth() {
  const months = getEventMonths();
  const saved = window.localStorage.getItem("troop883-events-month");
  if (saved && /^\d{4}-\d{2}$/.test(saved)) return saved;
  const todayMonth = getMonthKeyForDate(prototypeToday);
  if (months.includes(todayMonth)) return todayMonth;
  const nextUpcoming = getSortedEvents().find((event) => isUpcomingEvent(event));
  return getEventMonthKey(nextUpcoming) || months[months.length - 1] || "";
}
function setSelectedEventMonth(monthKey) { if (monthKey) window.localStorage.setItem("troop883-events-month", monthKey); }
function getTodayDateKey() { return `${prototypeToday.getFullYear()}-${String(prototypeToday.getMonth() + 1).padStart(2, "0")}-${String(prototypeToday.getDate()).padStart(2, "0")}`; }
function formatDateKey(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function parseDateKey(dateKey) { const [year, month, day] = String(dateKey || "").split("-").map(Number); if (!year || !month || !day) return null; return new Date(year, month - 1, day); }
function getMonthKeyForDate(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; }
function getSelectedCalendarDate() { return window.localStorage.getItem("troop883-selected-date") || getTodayDateKey(); }
function setSelectedCalendarDate(dateKey) { if (dateKey) window.localStorage.setItem("troop883-selected-date", dateKey); }
function getSelectedCalendarEventId() { return window.localStorage.getItem("troop883-selected-event-id") || ""; }
function setSelectedCalendarEventId(eventId) { if (eventId) { window.localStorage.setItem("troop883-selected-event-id", eventId); return; } window.localStorage.removeItem("troop883-selected-event-id"); }
async function hydratePublicCalendarEventMedia(eventId, { force = false } = {}) {
  if (!eventId || sessionToken) return;
  const event = getEventById(eventId);
  if (!event) return;
  if (!force && event.image && event.image !== scoutOrgLogo && (event.gallery || []).some((item) => normalizeGalleryItem(item).src === event.image)) return;
  try {
    const response = await fetch(`/api/public/events/${encodeURIComponent(eventId)}`, { cache: "no-store" });
    if (!response.ok) return;
    const payload = await response.json();
    const hydrated = normalizeEvent(payload.data || payload);
    const target = getEventById(eventId);
    if (!target) {
      mergeLoadedEvents([hydrated]);
      return;
    }
    target.image = hydrated.image || target.image;
    target.gallery = hydrated.gallery?.length ? hydrated.gallery : target.gallery;
    hydratedPublicEventIds.add(String(eventId));
  } catch (error) {}
}
async function hydrateLandingEventWindowMedia() {
  if (sessionToken || !["#/", "", "#"].includes(window.location.hash || "#/")) return;
  const eventIds = getLandingEventWindow().map((event) => event.id).filter(Boolean);
  const pendingIds = eventIds.filter((eventId) => !hydratedPublicEventIds.has(String(eventId)));
  if (!pendingIds.length) return;
  await Promise.all(pendingIds.map((eventId) => hydratePublicCalendarEventMedia(eventId, { force: true })));
  if (!["#/", "", "#"].includes(window.location.hash || "#/")) return;
  rebuildDerivedData();
  renderRoute();
}
function getEventDetailRouteId() {
  const hash = window.location.hash || "";
  if (!hash.startsWith("#/events/") || hash === "#/events/calendar" || hash === "#/events/list") return "";
  return hash.replace("#/events/", "");
}
function scrollSelectedCalendarEventIntoView() {
  const scrollToShowcase = () => {
    const showcase = document.querySelector("[data-calendar-event-showcase]");
    if (!showcase) return;
    showcase.setAttribute("tabindex", "-1");
    showcase.focus({ preventScroll: false });
    const top = showcase.getBoundingClientRect().top + window.scrollY - 16;
    showcase.scrollIntoView({ block: "start", behavior: "auto" });
    const targetTop = Math.max(0, top);
    window.scrollTo(0, targetTop);
    document.scrollingElement?.scrollTo(0, targetTop);
    document.documentElement.scrollTop = targetTop;
    document.body.scrollTop = targetTop;
  };
  window.requestAnimationFrame(() => {
    scrollToShowcase();
    window.setTimeout(scrollToShowcase, 120);
    window.setTimeout(scrollToShowcase, 600);
    window.setTimeout(scrollToShowcase, 1400);
  });
}
function requestSelectedCalendarEventScroll() {
  pendingCalendarEventScroll = true;
}
function flushSelectedCalendarEventScroll() {
  if (!pendingCalendarEventScroll) return;
  pendingCalendarEventScroll = false;
  scrollSelectedCalendarEventIntoView();
}
function ensureSelectedMonth() {
  const resolvedMonth = getSelectedEventMonth();
  if (resolvedMonth) {
    window.localStorage.setItem("troop883-events-month", resolvedMonth);
    const selectedDate = getSelectedCalendarDate();
    if (!selectedDate.startsWith(resolvedMonth)) {
      const firstEvent = getSortedEvents().find((event) => getEventMonthKey(event) === resolvedMonth);
      const fallbackDateKey = firstEvent ? formatDateKey(parseEventStartDate(firstEvent)) : `${resolvedMonth}-01`;
      window.localStorage.setItem("troop883-selected-date", resolvedMonth === getMonthKeyForDate(prototypeToday) ? getTodayDateKey() : fallbackDateKey);
    }
  }
  return resolvedMonth;
}
function formatFullDate(dateKey) {
  const date = parseDateKey(dateKey);
  return date ? date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "";
}
function formatDateLabelFromKey(dateKey) {
  const date = parseDateKey(dateKey);
  return date ? date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
}
function nextEventId() {
  const existing = new Set(events.map((event) => event.id));
  let counter = events.length + 1;
  while (existing.has(`event-${counter}`)) counter += 1;
  return `event-${counter}`;
}
function formatEventStorageValue(date, includeTime) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  if (!includeTime) return `${year}-${month}-${day}`;
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
function getFutureEventSchedule(startValue, endValue) {
  const sourceStart = startValue ? new Date(startValue) : null;
  const sourceEnd = endValue ? new Date(endValue) : null;
  const startHasTime = String(startValue || "").includes("T");
  const endHasTime = String(endValue || "").includes("T");
  const durationMs = sourceStart && sourceEnd && !Number.isNaN(sourceStart.getTime()) && !Number.isNaN(sourceEnd.getTime()) ? Math.max(0, sourceEnd.getTime() - sourceStart.getTime()) : 9 * 60 * 60 * 1000;
  const nextStart = sourceStart && !Number.isNaN(sourceStart.getTime()) ? new Date(sourceStart) : new Date(prototypeToday.getFullYear(), prototypeToday.getMonth(), prototypeToday.getDate(), 8, 0, 0, 0);
  do {
    nextStart.setDate(nextStart.getDate() + 7);
  } while (startOfDay(nextStart).getTime() <= startOfDay(prototypeToday).getTime());
  const nextEnd = new Date(nextStart.getTime() + durationMs);
  const nextStartValue = formatEventStorageValue(nextStart, startHasTime);
  const nextEndValue = formatEventStorageValue(nextEnd, endHasTime || startHasTime);
  return { startDate: nextStartValue, endDate: nextEndValue, dateLabel: formatEventDateLabelFromRange(nextStartValue, nextEndValue) };
}
function cloneGalleryItemForEvent(item, index) {
  const normalized = normalizeGalleryItem(item, index);
  return {
    ...normalized,
    id: `image-${Date.now()}-${index + 1}`,
    comments: (normalized.comments || []).map((comment, commentIndex) => normalizeImageComment({ ...comment, id: `comment-${commentIndex + 1}` }, commentIndex)),
    reactions: normalizeImageReactions(normalized.reactions || normalized),
  };
}
async function duplicateEventAsFuture(sourceEventId) {
  const sourceEvent = getEventById(sourceEventId);
  if (!sourceEvent) return null;
  const schedule = getFutureEventSchedule(sourceEvent.startDate, sourceEvent.endDate || sourceEvent.startDate);
  const duplicate = normalizeEvent({
    ...sourceEvent,
    id: nextEventId(),
    title: `Copy of ${sourceEvent.title}`,
    startDate: schedule.startDate,
    endDate: schedule.endDate,
    dateLabel: schedule.dateLabel,
    upcoming: true,
    activities: (sourceEvent.activities || []).map((activity, index) => normalizeActivity({ ...activity, id: `activity-${index + 1}` }, index)),
    gallery: (sourceEvent.gallery || []).map((item, index) => cloneGalleryItemForEvent(item, index)),
  });
  duplicate.image = duplicate.gallery[0]?.src || sourceEvent.image || scoutOrgLogo;
  events = [...events, duplicate];
  await saveEvents();
  const startDate = parseEventStartDate(duplicate) || prototypeToday;
  setSelectedEventMonth(getMonthKeyForDate(startDate));
  setSelectedCalendarDate(formatDateKey(startDate));
  setSelectedCalendarEventId(duplicate.id);
  return duplicate;
}
async function createEventForDate(dateKey) {
  const dateLabel = formatDateLabelFromKey(dateKey);
  const event = normalizeEvent({
    id: nextEventId(),
    title: "New event",
    category: "Event",
    startDate: `${dateKey}T08:00`,
    endDate: `${dateKey}T17:00`,
    dateLabel,
    homeBase: "Home base TBD",
    audience: "Troop",
    description: "Add the details for this event.",
    detailNote: "Use this page to finish the event details and visitor-facing notes.",
    activities: [],
    image: scoutOrgLogo,
    gallery: [scoutOrgLogo],
    upcoming: parseDateKey(dateKey)?.getTime() >= new Date(prototypeToday.getFullYear(), prototypeToday.getMonth(), prototypeToday.getDate()).getTime(),
    repeatEnabled: false,
    repeatFrequency: "weekly",
    repeatInterval: 1,
    repeatUntil: "",
    repeatMonthlyPattern: "date",
    repeatMonthlyOrdinal: "third",
    repeatMonthlyWeekday: "monday",
  });
  events.push(event);
  await saveEvents();
  setSelectedEventMonth(getMonthKeyForDate(parseDateKey(dateKey) || prototypeToday));
  setSelectedCalendarDate(dateKey);
  setSelectedCalendarEventId(event.id);
  return event;
}
function renderCalendarEventShowcase(event) {
  if (!event) {
    return `<article class="panel calendar-event-showcase empty" data-calendar-event-showcase><div class="panel-heading"><h3>Select an event</h3><p>Click any event on the calendar to see the full event summary here.</p></div><p class="event-description">The calendar stays in place while this panel updates with the chosen event's details.</p></article>`;
  }
  const activities = event.activities || [];
  const gallery = getDisplayMediaItems(event).filter((item) => item?.src);
  const leadMedia = gallery[0] || normalizeGalleryItem({ src: event.image || scoutOrgLogo }, 0);
  const leadMediaMarkup = renderGalleryMedia(leadMedia, getGalleryDisplayTitle(event, leadMedia, 0)).replace('class="event-gallery-media"', 'class="calendar-event-image"');
  return `<article class="calendar-event-showcase${isAdultEvent(event) ? " adult-event-theme" : ""}" data-calendar-event-showcase><div class="calendar-event-hero"><div class="calendar-event-image-wrap">${leadMediaMarkup}</div><div class="calendar-event-copy"><p class="eyebrow">Selected event</p><h3>${event.title}</h3><p class="event-description">${event.description || "No event description yet."}</p><div class="event-meta"><span>${event.category || "Event"}</span><span>${event.audience || "Audience TBD"}</span><span>${event.dateLabel || formatExactEventDateTime(event.startDate)}</span>${event.repeatEnabled ? `<span>${formatRepeatSummary(event)}</span>` : ""}</div><div class="calendar-event-facts"><div><span class="calendar-fact-label">Home base</span><strong>${event.homeBase || "Home base TBD"}</strong></div><div><span class="calendar-fact-label">Starts</span><strong>${formatExactEventDateTime(event.startDate)}</strong></div><div><span class="calendar-fact-label">Ends</span><strong>${formatExactEventDateTime(event.endDate || event.startDate)}</strong></div></div><div class="detail-note">${event.detailNote || "No additional event note yet."}</div><div class="scribe-actions">${canSeeOrgChart() ? `<a class="button secondary" href="#/events/${event.id}">Edit event</a>` : `<a class="button secondary" href="#/events/${event.id}">Open full event page</a>`}</div></div></div><div class="calendar-event-sections"><section class="panel"><div class="panel-heading"><h3>Activities</h3><p>${activities.length ? `${activities.length} planned item${activities.length === 1 ? "" : "s"}` : "No activities have been added yet."}</p></div>${activities.length ? `<div class="detail-stack">${activities.map((activity) => `<article class="month-summary-card"><div class="panel-heading"><h3>${activity.description || "Activity"}</h3><p>${formatExactEventDateTime(activity.startDate)}${activity.endDate ? ` - ${formatExactEventDateTime(activity.endDate)}` : ""}</p></div><div class="event-meta"><span>${activity.location || "Location TBD"}</span></div></article>`).join("")}</div>` : `<p class="event-description">This event does not have activity details yet.</p>`}</section><section class="panel"><div class="panel-heading"><h3>Quick info</h3><p>A concise overview for calendar browsing.</p></div><ul class="detail-list"><li>Audience: ${event.audience || "Audience TBD"}</li><li>Category: ${event.category || "Event"}</li><li>Home base: ${event.homeBase || "Home base TBD"}</li><li>Gallery media items: ${gallery.length}</li>${event.repeatEnabled ? `<li>${formatRepeatSummary(event)}</li>` : ""}</ul></section></div></article>`;
}
function renderImageReactionButtons(image) {
  const viewer = getCurrentViewerIdentity();
  return `<div class="image-reaction-row">${imageReactionTypes.map((reactionType) => {
    const count = (image.reactions?.[reactionType] || []).length;
    const isActive = viewer ? (image.reactions?.[reactionType] || []).includes(viewer.id) : false;
    const label = reactionType === "disappointed" ? "Disappointed" : reactionType.charAt(0).toUpperCase() + reactionType.slice(1);
    return `<button class="button secondary image-reaction-button${isActive ? " is-active" : ""}" type="button" data-gallery-reaction="${reactionType}" data-gallery-image-id="${image.id}"${canInteractWithGallerySocial() ? "" : " disabled"}>${label}${count ? ` (${count})` : ""}</button>`;
  }).join("")}</div>`;
}
function renderImageComments(image) {
  const comments = image.comments || [];
  return `<div class="image-comments"><div class="panel-heading compact"><h4>Comments</h4><p>${comments.length ? `${comments.length} comment${comments.length === 1 ? "" : "s"}` : "No comments yet."}</p></div>${comments.length ? `<div class="image-comment-list">${comments.map((comment) => `<article class="image-comment"><div class="image-comment-meta"><strong>${comment.authorName}</strong><span>${formatCommentDateTime(comment.createdAt)}</span></div><p>${comment.text}</p>${canRemoveGalleryComment(comment) ? `<button class="text-link image-comment-remove" type="button" data-remove-gallery-comment="${comment.id}" data-gallery-image-id="${image.id}">Remove comment</button>` : ""}</article>`).join("")}</div>` : `<p class="event-description">Be the first to comment on this image.</p>`}${canInteractWithGallerySocial() ? `<div class="image-comment-form"><textarea data-gallery-comment-input="${image.id}" aria-label="Write a comment for ${image.title || `image ${image.id}`}" placeholder="Add a comment"></textarea><button class="button secondary" type="button" data-add-gallery-comment="${image.id}">Post comment</button></div>` : `<p class="event-description">Sign in to comment or react.</p>`}</div>`;
}
function renderGalleryMedia(image, title) {
  if (image.mediaType === "video") {
    return `<video class="event-gallery-media" controls preload="metadata" playsinline title="${title}" src="${image.src}"></video>`;
  }
  return `<img class="event-gallery-media" src="${image.src}" alt="${title}" />`;
}
function closeMediaLightbox() {
  document.querySelector("[data-media-lightbox]")?.remove();
  document.body.classList.remove("media-lightbox-open");
}
function openMediaLightbox(eventId, mediaIndex) {
  const event = getEventById(eventId);
  const mediaItems = getDisplayMediaItems(event);
  const item = mediaItems[mediaIndex];
  if (!event || !item) return;
  closeMediaLightbox();
  const mediaMarkup = item.mediaType === "video"
    ? `<video class="media-lightbox-media" controls autoplay preload="metadata" playsinline></video>`
    : `<img class="media-lightbox-media" src="${item.src}" alt="${event.title}" />`;
  document.body.insertAdjacentHTML("beforeend", `<div class="media-lightbox" data-media-lightbox><button class="media-lightbox-backdrop" type="button" data-close-media-lightbox aria-label="Close media viewer"></button><div class="media-lightbox-dialog"><button class="media-lightbox-close" type="button" data-close-media-lightbox aria-label="Close media viewer">&times;</button>${mediaMarkup}<p class="media-lightbox-caption">${getGalleryDisplayTitle(event, item, mediaIndex)}</p></div></div>`);
  document.body.classList.add("media-lightbox-open");
  if (item.mediaType === "video") {
    const lightboxVideo = document.querySelector(".media-lightbox-media");
    if (lightboxVideo) {
      lightboxVideo.src = item.src;
      lightboxVideo.load();
      lightboxVideo.play().catch(() => {});
    }
  }
}
function renderEventCardMedia(event, item, index, active) {
  if (item.mediaType === "video") {
    const activeClass = active === null || active ? " is-active" : "";
    return `<div class="event-card-video-shell carousel-slide${activeClass}"><div class="event-card-video-preview${activeClass}"><div class="event-card-video-badge">Video</div><p>${getGalleryDisplayTitle(event, item, index)}</p><button class="media-popout-button" type="button" data-open-card-media="${event.id}" data-open-card-media-index="${index}">Open video</button></div></div>`;
  }
  if (active !== null) {
    return `<img src="${item.src}" alt="${event.title} photo ${index + 1}" class="carousel-image carousel-slide${active ? " is-active" : ""}" />`;
  }
  return `<img src="${item.src}" alt="${event.title} event image" />`;
}
function isAdultEvent(event) {
  return String(event?.audience || "").trim().toLowerCase() === "adults";
}
function getGalleryDisplayTitle(event, image, index) {
  const mediaLabel = image.mediaType === "video" ? "video" : "photo";
  return image.description || image.title || `${event.title} ${mediaLabel} ${index + 1}`;
}
function renderGalleryImageCard(event, image, index, editable) {
  const mediaLabel = image.mediaType === "video" ? "video" : "image";
  const displayTitle = getGalleryDisplayTitle(event, image, index);
  const displayDescription = image.description || (editable ? "Add a short caption or context for this image." : "No image description yet.");
  return `<figure class="event-gallery-item${editable ? " event-gallery-item-editable image-social-card" : " image-social-card"}" data-gallery-item="${image.id}" data-gallery-src="${image.src}">${renderGalleryMedia(image, displayTitle)}${editable ? `<figcaption><input type="text" data-gallery-title="${image.id}" value="${displayTitle}" placeholder="${image.mediaType === "video" ? "Video title" : "Image title"}" aria-label="Title for ${mediaLabel} ${index + 1}" /><textarea data-gallery-description="${image.id}" placeholder="${image.mediaType === "video" ? "Video description" : "Image description"}" aria-label="Description for ${mediaLabel} ${index + 1}">${image.description}</textarea><p class="gallery-primary-note">${index === 0 ? "Primary event image" : "Choose this item only if you want it to become the primary event image."}</p><div class="gallery-item-actions"><button class="button secondary gallery-action-button" type="button" data-make-primary-image="${image.id}">${index === 0 ? "Primary event image" : "Set as primary event image"}</button><button class="button danger gallery-action-button" type="button" data-remove-gallery-image="${image.id}">Remove</button></div>${renderImageReactionButtons(image)}${renderImageComments(image)}</figcaption>` : `<figcaption><strong>${displayTitle}</strong><p>${displayDescription}</p>${renderImageReactionButtons(image)}${renderImageComments(image)}</figcaption>`}</figure>`;
}
function getGalleryImageById(event, imageId) { return (event.gallery || []).find((image) => image.id === imageId) || null; }
function buildCalendarCells(monthKey) { const [year, month] = monthKey.split("-").map(Number); const firstDay = new Date(year, month - 1, 1); const daysInMonth = new Date(year, month, 0).getDate(); const startOffset = firstDay.getDay(); const eventsByDay = new Map(); for (let day = 1; day <= daysInMonth; day += 1) { const currentDate = new Date(year, month - 1, day); eventsByDay.set(day, events.filter((event) => eventOccursOnDate(event, currentDate)).sort((a, b) => (parseEventStartDate(a)?.getTime() || 0) - (parseEventStartDate(b)?.getTime() || 0))); } const cells = []; for (let index = 0; index < startOffset; index += 1) cells.push({ empty: true, key: `empty-${index}` }); for (let day = 1; day <= daysInMonth; day += 1) cells.push({ empty: false, day, events: eventsByDay.get(day) || [], key: `day-${day}` }); while (cells.length % 7 !== 0) cells.push({ empty: true, key: `tail-${cells.length}` }); return cells; }
function formatEventListDate(event) { const date = parseEventStartDate(event); return date ? date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : event.dateLabel; }
function addMonths(date, months) { const next = new Date(date); const day = next.getDate(); next.setMonth(next.getMonth() + months); if (next.getDate() !== day) next.setDate(0); return next; }
function getEventRangeStart() { return startOfDay(addMonths(prototypeToday, -2)); }
function getEventRangeEnd() { const end = addMonths(prototypeToday, 2); end.setHours(23, 59, 59, 999); return end; }
function getRollingEventList(direction) { const today = startOfDay(prototypeToday); const rangeStart = getEventRangeStart(); const rangeEnd = getEventRangeEnd(); return events.filter((event) => { const date = parseEventStartDate(event); if (!date) return false; const time = date.getTime(); if (direction === "past") return time < today.getTime() && time >= rangeStart.getTime(); return time >= today.getTime() && time <= rangeEnd.getTime(); }).sort((a, b) => direction === "past" ? (parseEventStartDate(b)?.getTime() || 0) - (parseEventStartDate(a)?.getTime() || 0) : (parseEventStartDate(a)?.getTime() || 0) - (parseEventStartDate(b)?.getTime() || 0)).slice(0, 3); }
function getLandingEventWindow() { const rangeStart = getEventRangeStart(); const rangeEnd = getEventRangeEnd(); return getSortedEvents().filter((event) => { const start = parseEventStartDate(event); const end = parseEventEndDate(event) || start; if (!start || !end) return false; return start.getTime() <= rangeEnd.getTime() && end.getTime() >= rangeStart.getTime(); }); }
function getCurrentEventIndex(items) { const today = startOfDay(prototypeToday).getTime(); const upcomingIndex = items.findIndex((event) => (parseEventStartDate(event)?.getTime() || 0) >= today); return upcomingIndex >= 0 ? upcomingIndex : Math.max(0, items.length - 1); }
function requestUpcomingScrollerCenter() { window.requestAnimationFrame(() => { const scroller = document.querySelector("[data-upcoming-scroller]"); const target = document.querySelector("[data-upcoming-current]"); if (!scroller || !target) return; const vertical = scroller.scrollHeight > scroller.clientHeight && scroller.scrollWidth <= scroller.clientWidth + 4; if (vertical) { scroller.scrollTop = target.offsetTop - ((scroller.clientHeight - target.clientHeight) / 2); return; } scroller.scrollLeft = target.offsetLeft - ((scroller.clientWidth - target.clientWidth) / 2); }); }
function scrollUpcomingEvents(direction) { const scroller = document.querySelector("[data-upcoming-scroller]"); const current = document.querySelector("[data-upcoming-current]") || scroller?.querySelector("[data-upcoming-card]"); if (!scroller || !current) return; const step = Math.round((current.getBoundingClientRect().width || 320) + 20); const vertical = scroller.scrollHeight > scroller.clientHeight && scroller.scrollWidth <= scroller.clientWidth + 4; scroller.scrollBy({ left: vertical ? 0 : direction * step, top: vertical ? direction * step : 0, behavior: "smooth" }); }
function getEventDetailPreviewEvents() {
  const sortedEvents = getSortedEvents();
  const recentEvents = sortedEvents.filter((event) => !isUpcomingEvent(event)).slice(-2);
  const upcomingEvents = sortedEvents.filter((event) => isUpcomingEvent(event)).slice(0, 2);
  return [...recentEvents, ...upcomingEvents];
}
function getAttendanceHistoryItem(itemId) { return attendanceHistory.flatMap((month) => month.items.map((item) => ({ ...item, monthId: month.id, month: month.month }))).find((item) => item.id === itemId) || null; }
function getAttendanceStatusForItem(item, scout, index) { const seed = `${item.id}-${scout.id}`.split("").reduce((total, char) => total + char.charCodeAt(0), 0); return (seed + index) % 5 === 0 ? "Absent" : "Present"; }
function getScoutRankValue(rank) { return scoutRankOrder[String(rank || "").trim()] || 0; }
function sortScoutsByRankWithinPatrol(items) {
  return [...items].sort((a, b) => getScoutRankValue(b.rank) - getScoutRankValue(a.rank) || a.name.localeCompare(b.name));
}
function getPatrolRosterLeadershipValue(scout) {
  if (scout?.leadershipRole === "Patrol Leader") return 0;
  if (scout?.leadershipRole === "Assistant Patrol Leader") return 1;
  return 2;
}
function sortScoutsForPatrolRoster(items) {
  return [...items].sort((a, b) => getPatrolRosterLeadershipValue(a) - getPatrolRosterLeadershipValue(b) || a.name.localeCompare(b.name));
}
function getAttendanceWindowStart(totalItems, visibleCount = 4) {
  const maxStart = Math.max(0, totalItems - visibleCount);
  const stored = Number(window.localStorage.getItem("troop883-attendance-window-start") || maxStart);
  return Math.min(Math.max(0, stored), maxStart);
}
function setAttendanceWindowStart(value) {
  window.localStorage.setItem("troop883-attendance-window-start", String(Math.max(0, value)));
}
function parseAttendanceItemDate(item) {
  if (!item?.dateLabel) return null;
  const parsed = new Date(item.dateLabel);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  const normalized = String(item.dateLabel).replace(",", "");
  const match = normalized.match(/^([A-Za-z]+)\s+(\d{1,2})\s+(\d{4})$/);
  if (!match) return null;
  const month = monthLookup[match[1].toLowerCase()];
  if (month === undefined) return null;
  return new Date(Number(match[3]), month, Number(match[2]));
}
function getAttendanceHistoryItemsSorted() {
  return attendanceHistory.flatMap((month) => month.items.map((item) => ({ ...item, monthId: month.id, month: month.month }))).sort((a, b) => (parseAttendanceItemDate(a)?.getTime() || 0) - (parseAttendanceItemDate(b)?.getTime() || 0));
}
function formatAttendanceColumnLabel(item) {
  const parsed = parseAttendanceItemDate(item);
  if (parsed && !Number.isNaN(parsed.getTime())) return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return item.dateLabel || item.title;
}
function renderAdultLeaderAttendanceMatrix() {
  const attendanceItems = getAttendanceHistoryItemsSorted();
  const visibleCount = 4;
  const windowStart = getAttendanceWindowStart(attendanceItems.length, visibleCount);
  const visibleItems = attendanceItems.slice(windowStart, windowStart + visibleCount);
  const maxStart = Math.max(0, attendanceItems.length - visibleCount);
  return `<section class="section"><div class="section-heading"><div><p class="eyebrow">Attendance spreadsheet</p><h2>All scouts by meeting date</h2></div><p class="section-copy">Use the arrows to page through four meeting dates at a time, with the most recent window at the far right of history.</p></div><div class="panel"><div class="panel-heading"><h3>${roster.length} scouts across ${attendanceItems.length} meeting dates</h3><p>Showing ${visibleItems.length ? `${windowStart + 1}-${windowStart + visibleItems.length}` : "0"} of ${attendanceItems.length} attendance dates.</p></div><div class="attendance-window-controls"><button class="button secondary" type="button" data-attendance-window="left"${windowStart <= 0 ? " disabled" : ""}>&larr; Earlier</button><button class="button secondary" type="button" data-attendance-window="right"${windowStart >= maxStart ? " disabled" : ""}>Later &rarr;</button></div><div class="table-wrap attendance-matrix-wrap"><table class="data-table attendance-matrix"><thead><tr><th class="attendance-name-col">Scout</th>${visibleItems.map((item) => `<th class="attendance-date-col"><span>${formatAttendanceColumnLabel(item)}</span><small>${item.title}</small></th>`).join("")}</tr></thead><tbody>${groupedByPatrol.map((group) => { const patrolScouts = sortScoutsByRankWithinPatrol(group.scouts); if (!patrolScouts.length) return ""; return `<tr class="attendance-patrol-row"><th class="attendance-patrol-header" colspan="${visibleItems.length + 1}">${getPatrolDisplayName(group.name)}</th></tr>${patrolScouts.map((scout) => { const scoutIndex = roster.findIndex((entry) => entry.id === scout.id); return `<tr><td class="attendance-name-col"><strong>${renderScoutName(scout, { className: "text-link" })}</strong><small>${scout.rank || "Rank TBD"}</small></td>${visibleItems.map((item) => { const status = getAttendanceStatusForItem(item, scout, scoutIndex); return `<td><span class="attendance-badge ${status === "Present" ? "present" : "absent"}">${status}</span></td>`; }).join("")}</tr>`; }).join("")}`; }).join("")}</tbody></table></div></div></section>`;
}
function renderAttendanceRowsForItem(item) { return groupedByPatrol.map((group) => `<section class="section"><div class="panel"><div class="panel-heading"><h3>${getPatrolDisplayName(group.name)}${group.name ? " Patrol" : ""}</h3><p>${group.scouts.length} scouts for this attendance item.</p></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Scout</th><th>Rank</th><th>Leadership</th><th>Attendance</th><th>Contacts</th></tr></thead><tbody>${group.scouts.map((scout, index) => { const status = getAttendanceStatusForItem(item, scout, index); return `<tr><td>${renderScoutName(scout, { className: "text-link" })}</td><td>${scout.rank}</td><td>${scout.leadershipRole || "-"}</td><td><span class="attendance-badge ${status === "Present" ? "present" : "absent"}">${status}</span></td><td>${scout.parents.map((parent) => `${parent.relationship}: ${parent.name}`).join("<br />")}</td></tr>`; }).join("")}</tbody></table></div></div></section>`).join(""); }
function svgDataUri(markup) { return `data:image/svg+xml;utf8,${encodeURIComponent(markup)}`; }
function buildLeaderBadge(title, accent, subtitle) { return svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88"><rect width="88" height="88" rx="18" fill="${accent}"/><circle cx="44" cy="28" r="16" fill="#fff" opacity=".18"/><path d="M44 17l4.8 9.6 10.6 1.5-7.7 7.5 1.8 10.5L44 41.1l-9.5 5 1.8-10.5-7.7-7.5 10.6-1.5z" fill="#fff"/><text x="44" y="63" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#fff">${title}</text><text x="44" y="76" text-anchor="middle" font-family="Arial, sans-serif" font-size="7" fill="#fff">${subtitle}</text></svg>`); }
function getRoleInitials(role) { return String(role || "").split(/\s+/).filter(Boolean).map((word) => word[0]).join("").slice(0, 4).toUpperCase(); }
function getScoutLeadershipEmblem(role) {
  const initials = getRoleInitials(role);
  return svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88"><rect width="88" height="88" rx="18" fill="#32523d"/><circle cx="44" cy="27" r="16" fill="#f7c948"/><path d="M44 15l5.1 10.3 11.4 1.7-8.2 8 1.9 11.3L44 41l-10.2 5.3L35.7 35l-8.2-8 11.4-1.7z" fill="#fff"/><text x="44" y="67" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#fff">${initials || "L"}</text></svg>`);
}
const scoutOrgLogo = svgDataUri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88"><rect width="88" height="88" rx="18" fill="#0b5cab"/><circle cx="44" cy="26" r="18" fill="#f7c948"/><path d="M44 15l5.4 10.8 11.9 1.7-8.6 8.4 2 11.8L44 42l-10.7 5.7 2-11.8-8.6-8.4 11.9-1.7z" fill="#0b5cab"/><text x="44" y="64" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#fff">Scout.org</text><text x="44" y="76" text-anchor="middle" font-family="Arial, sans-serif" font-size="7" fill="#dbeafe">Official fallback</text></svg>');
const adultLeaderEmblems = {
  "Scoutmaster": buildLeaderBadge("SM", "#174e2f", "Scoutmaster"),
  "Assistant Scoutmaster": buildLeaderBadge("ASM", "#3a6b35", "Assistant"),
  "Committee Chair": buildLeaderBadge("CC", "#7a1f1f", "Committee"),
  "Committee Member": buildLeaderBadge("CM", "#6b7280", "Committee"),
  "Advancement Chair": buildLeaderBadge("AC", "#7c3aed", "Advancement"),
  "Treasurer": buildLeaderBadge("TR", "#14532d", "Treasurer"),
  "Secretary": buildLeaderBadge("SEC", "#1d4ed8", "Secretary"),
  "Outdoor Activities Coordinator": buildLeaderBadge("OA", "#92400e", "Outdoor"),
  "Equipment Coordinator": buildLeaderBadge("EQ", "#0f766e", "Equipment"),
  "Transportation Coordinator": buildLeaderBadge("TC", "#9a3412", "Transport"),
};
function getAdultLeaderEmblem(role) { return adultLeaderEmblems[role] || scoutOrgLogo; }
function renderAdultLeaderIdentity(leader) { return `<span class="leader-identity"><img class="leader-emblem" src="${getAdultLeaderEmblem(leader.role)}" alt="${leader.role} emblem" /><span>${leader.name}</span></span>`; }
function renderAdultLeaderLink(leader) { return `<a class="text-link leader-link" href="#/adults/${leader.adultId}" target="_blank" rel="noreferrer">${renderAdultLeaderIdentity(leader)}</a>`; }
function renderAdultDirectoryActionCell(adult, leaderAssignment) {
  const leaderIcon = leaderAssignment ? `<img class="leader-emblem adult-directory-leader-icon" src="${getAdultLeaderEmblem(leaderAssignment.role)}" alt="${leaderAssignment.role} emblem" title="${leaderAssignment.role}" />` : "";
  return `<span class="adult-directory-actions"><a class="icon-button adult-edit-icon" href="#/adults/${adult.id}" aria-label="Edit ${adult.name}" title="Edit ${adult.name}">&#9998;</a>${leaderIcon}</span>`;
}
function renderScoutDirectoryActionCell(scout) {
  return `<a class="icon-button scout-edit-icon" href="#/scouts/${scout.id}" aria-label="Edit ${scout.name}" title="Edit ${scout.name}">&#9998;</a>`;
}
function renderScoutDirectoryNameCell(scout, scoutLabel) {
  const leaderIcon = scout.leadershipRole ? `<img class="leader-emblem scout-directory-leader-icon" src="${getScoutLeadershipEmblem(scout.leadershipRole)}" alt="${scout.leadershipRole} emblem" title="${scout.leadershipRole}" />` : `<span class="scout-directory-leader-placeholder" aria-hidden="true"></span>`;
  return `<span class="scout-directory-name">${leaderIcon}${renderScoutName(scout, { className: "text-link", newTab: false, label: scoutLabel })}</span>`;
}
function buildPatrolBadge(label, accent, subtitle) { return svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88"><rect width="88" height="88" rx="18" fill="${accent}"/><circle cx="44" cy="28" r="16" fill="#fff" opacity=".18"/><path d="M25 53h38L44 20z" fill="#fff"/><text x="44" y="65" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#fff">${label}</text><text x="44" y="76" text-anchor="middle" font-family="Arial, sans-serif" font-size="7" fill="#fff">${subtitle}</text></svg>`); }
const patrolBadges = {
  "Python Patrol": buildPatrolBadge("PY", "#1f6f43", "Python"),
  "Nuclear Meese": buildPatrolBadge("NM", "#0f4c81", "Meese"),
  "Flaming Arrows": buildPatrolBadge("FA", "#b45309", "Arrows"),
  Senior: buildPatrolBadge("SR", "#6b1f7b", "Senior"),
};
function getPatrolBadgeKey(patrol) { return slugifyName(patrol).replace(/\./g, "-"); }
function getPatrolBadgeImage(patrol) { return !String(patrol || "").trim() ? scoutOrgLogo : getPatrolRecord(patrol)?.badge || scouts.find((scout) => scout.patrol === patrol && scout.patrolBadge)?.patrolBadge || patrolBadges[patrol] || scoutOrgLogo; }
function getPatrolBadgeValue(patrol, badge = "") { return !String(patrol || "").trim() ? scoutOrgLogo : badge || getPatrolRecord(patrol)?.badge || patrolBadges[patrol] || scoutOrgLogo; }
function canEditScouts() { return canSeeOrgChart(); }
function getActiveScoutId() { return window.localStorage.getItem("troop883-active-scout-id") || scouts[0]?.id || ""; }
function setActiveScoutId(scoutId) { if (scoutId) { window.localStorage.setItem("troop883-active-scout-id", scoutId); } }
function canEditScoutRecord(scoutId) {
  return canSeeOrgChart()
    || (currentActor?.person?.externalId === scoutId || currentActor?.person?.id === scoutId)
    || (currentActor?.relationships || []).some((relationship) => relationship.scoutPersonId === scoutId);
}
function getCurrentViewerIdentity() {
  if (!currentActor?.authenticated) return null;
  return {
    id: currentActor.person?.externalId || currentActor.person?.id || currentActor.account?.id || "member",
    name: currentActor.person?.name || currentActor.account?.email || "Member",
    role: getCurrentMode(),
  };
}
function getActiveParentAdult() { return savedParentGuardians.find((adult) => getScoutsForAdult(adult).length) || savedParentGuardians[0] || null; }
function getLinkedScoutsForCurrentParent() {
  const activeParent = getActiveParentAdult();
  return activeParent ? getScoutsForAdult(activeParent) : [];
}
function eventTextForRegistration(event) {
  return [event?.title, event?.description, event?.detailNote, event?.homeBase, event?.location, ...(event?.activities || []).flatMap((activity) => [activity?.description, activity?.location])].filter(Boolean).join(" ").toLowerCase();
}
function eventMatchesScoutRegistration(event, scout) {
  if (!event || !scout) return false;
  const audience = String(event.audience || "").trim().toLowerCase();
  if (audience === "adults") return false;
  if (!audience || audience === "troop" || audience === "unit") return true;
  const eventText = eventTextForRegistration(event);
  if (audience === "patrol") return eventText.includes(String(scout.patrol || "").toLowerCase());
  if (audience === "individuals") return eventText.includes(String(scout.name || "").toLowerCase());
  return false;
}
function getRegisteredChildrenForEvent(event, linkedScouts = getLinkedScoutsForCurrentParent()) {
  return linkedScouts.filter((scout) => eventMatchesScoutRegistration(event, scout));
}
function getParentDashboardEventGroups() {
  const linkedScouts = getLinkedScoutsForCurrentParent();
  const today = startOfDay(prototypeToday);
  const recentWindowStart = new Date(today);
  recentWindowStart.setDate(recentWindowStart.getDate() - 21);
  const upcomingWindowEnd = new Date(today);
  upcomingWindowEnd.setDate(upcomingWindowEnd.getDate() + 56);
  const relevantEvents = events.map((event) => ({ event, registeredScouts: getRegisteredChildrenForEvent(event, linkedScouts) })).filter(({ registeredScouts }) => registeredScouts.length);
  const recent = relevantEvents.filter(({ event }) => {
    const endDate = parseEventEndDate(event) || parseEventStartDate(event);
    if (!endDate) return false;
    const endDay = startOfDay(endDate).getTime();
    return endDay < today.getTime() && endDay >= recentWindowStart.getTime();
  }).sort((a, b) => (parseEventEndDate(b.event)?.getTime() || parseEventStartDate(b.event)?.getTime() || 0) - (parseEventEndDate(a.event)?.getTime() || parseEventStartDate(a.event)?.getTime() || 0)).slice(0, 2);
  const upcoming = relevantEvents.filter(({ event }) => {
    const startDate = parseEventStartDate(event);
    if (!startDate) return false;
    const startDay = startOfDay(startDate).getTime();
    return startDay >= today.getTime() && startDay <= upcomingWindowEnd.getTime();
  }).sort((a, b) => (parseEventStartDate(a.event)?.getTime() || 0) - (parseEventStartDate(b.event)?.getTime() || 0));
  return { linkedScouts, recent, upcoming };
}
function canInteractWithGallerySocial() { return Boolean(getCurrentViewerIdentity()); }
function canModerateGalleryComments() { return canSeeOrgChart(); }
function canRemoveGalleryComment(comment) { const viewer = getCurrentViewerIdentity(); return Boolean(viewer && (viewer.id === comment.authorId || canModerateGalleryComments())); }
function formatCommentDateTime(value) { const parsed = value ? new Date(value) : null; if (!parsed || Number.isNaN(parsed.getTime())) return "Just now"; return parsed.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }); }
function nextGalleryCommentId(image) { const used = new Set((image.comments || []).map((comment) => comment.id)); let counter = (image.comments || []).length + 1; while (used.has(`comment-${counter}`)) counter += 1; return `comment-${counter}`; }
function toggleGalleryReaction(image, reactionType, viewerId) {
  image.reactions = normalizeImageReactions(image.reactions);
  imageReactionTypes.forEach((type) => {
    image.reactions[type] = (image.reactions[type] || []).filter((id) => id !== viewerId);
  });
  if (reactionType) {
    image.reactions[reactionType] = [...(image.reactions[reactionType] || []), viewerId];
  }
}
function deriveTitleText(element) {
  const ariaLabel = element.getAttribute("aria-label");
  if (ariaLabel) return ariaLabel.trim();
  const alt = element.getAttribute("alt");
  if (alt) return alt.trim();
  const placeholder = element.getAttribute("placeholder");
  if (placeholder) return placeholder.trim();
  const value = element.getAttribute("value");
  if (value) return value.trim();
  const text = (element.textContent || "").replace(/\s+/g, " ").trim();
  if (text) return text.slice(0, 120);
  if (element.id) return element.id;
  if (element.className && typeof element.className === "string") return element.className.split(" ")[0];
  return element.tagName.toLowerCase();
}
function applyTitleAttributes(root = document.body) {
  const selector = "a, button, input, select, option, label, img, h1, h2, h3, h4, h5, h6, p, span, div, section, article, main, header, nav, li, td, th";
  root.querySelectorAll(selector).forEach((element) => {
    const title = deriveTitleText(element);
    if (title) {
      element.setAttribute("title", title);
    }
  });
}
function rebuildDerivedData() { roster = scouts.map((scout) => { const parents = adultScoutRelationships.filter((relationship) => relationship.scoutId === scout.id).sort((a, b) => Number(a.priority || 99) - Number(b.priority || 99)).map((relationship) => { const adult = adults.find((entry) => entry.id === relationship.adultId); return adult ? { adultId: adult.id, name: adult.name, relationship: relationship.relationship, email: adult.email } : null; }).filter(Boolean); return { ...scout, patrolBadge: getPatrolBadgeValue(scout.patrol, scout.patrolBadge), parents }; }); groupedByPatrol = getPatrolNameList([], { includeUnassigned: roster.some((scout) => !scout.patrol) }).map((name) => ({ name, scouts: roster.filter((scout) => scout.patrol === name) })); savedParentGuardians = uniqueBy(adults.filter((adult) => /parent|guardian/i.test(adult.relationship) || adultScoutRelationships.some((relationship) => relationship.adultId === adult.id)), (adult) => `${adult.id}`).sort((a, b) => a.name.localeCompare(b.name)); adultLeaders = adultLeaders.map((leader) => { const linkedAdult = adults.find((adult) => adult.id === leader.adultId); return { ...leader, name: linkedAdult?.name || leader.name || "Unknown adult" }; }); scoutLeadershipGroups = [{ title: "Troop youth leadership", members: roster.filter((scout) => ["Senior Patrol Leader", "Assistant Senior Patrol Leader", "Scribe", "Quartermaster", "Historian", "Instructor", "Librarian", "Chaplain Aide", "Webmaster", "Outdoor Ethics Guide", "Bugler", "Den Chief", "Troop Guide", "OA Representative"].includes(scout.leadershipRole)) }, { title: "Patrol leadership", members: roster.filter((scout) => scout.leadershipRole === "Patrol Leader" || scout.leadershipRole === "Assistant Patrol Leader") }]; sortAdultLeaders(); }
const troopYouthLeadershipOrder = ["Senior Patrol Leader", "Assistant Senior Patrol Leader", "Troop Guide", "Scribe", "Quartermaster", "Historian", "Instructor", "Librarian", "Chaplain Aide", "Webmaster", "Outdoor Ethics Guide", "Bugler", "Den Chief", "OA Representative"];
function getTroopYouthLeadershipMembers() {
  return roster.filter((scout) => troopYouthLeadershipOrder.includes(scout.leadershipRole)).sort((a, b) => {
    const roleDelta = troopYouthLeadershipOrder.indexOf(a.leadershipRole) - troopYouthLeadershipOrder.indexOf(b.leadershipRole);
    if (roleDelta !== 0) return roleDelta;
    return a.name.localeCompare(b.name);
  });
}
function getPatrolLeadershipGroups() {
  return getPatrolNameList([], { includeUnassigned: false }).map((patrol) => {
    const patrolMembers = roster.filter((scout) => scout.patrol === patrol);
    const patrolLeader = patrolMembers.find((scout) => scout.leadershipRole === "Patrol Leader") || null;
    const assistantPatrolLeader = patrolMembers.find((scout) => scout.leadershipRole === "Assistant Patrol Leader") || null;
    return { patrol, badge: getPatrolBadgeImage(patrol), patrolLeader, assistantPatrolLeader };
  }).filter((group) => group.patrolLeader || group.assistantPatrolLeader);
}
function renderTroopYouthLeadershipCard(member) {
  return `<div class="org-card troop-leadership-card"><strong>${member.leadershipRole}</strong><span>${renderScoutName(member, { className: "text-link" })}</span><small>${getPatrolDisplayName(member.patrol)}</small></div>`;
}
function renderPatrolLeadershipCard(group) {
  return `<div class="patrol-leadership-card"><div class="patrol-leadership-badge"><img class="leader-emblem patrol-patch" src="${group.badge}" alt="${getPatrolDisplayName(group.patrol)} patch" /><strong>${getPatrolDisplayName(group.patrol)}</strong></div><div class="patrol-leadership-members"><div class="patrol-leadership-row"><span class="patrol-leadership-role">Patrol Leader</span><strong>${group.patrolLeader ? renderScoutName(group.patrolLeader, { className: "text-link" }) : "Unassigned"}</strong></div><div class="patrol-leadership-row"><span class="patrol-leadership-role">Assistant Patrol Leader</span><strong>${group.assistantPatrolLeader ? renderScoutName(group.assistantPatrolLeader, { className: "text-link" }) : "Unassigned"}</strong></div></div></div>`;
}
function getPatrolRowsForEditor() {
  const rows = getPatrolNameList([], { includeUnassigned: false }).map((patrol) => {
    const patrolScouts = sortScoutsByRankWithinPatrol(roster.filter((scout) => scout.patrol === patrol));
    const patrolLeader = patrolScouts.find((scout) => scout.leadershipRole === "Patrol Leader") || null;
    const assistantPatrolLeader = patrolScouts.find((scout) => scout.leadershipRole === "Assistant Patrol Leader") || null;
    return { patrol, badge: getPatrolBadgeImage(patrol), patrolLeader, assistantPatrolLeader, scouts: patrolScouts };
  });
  if (showAddPatrolRow) rows.push({ patrol: "", badge: scoutOrgLogo, patrolLeader: null, assistantPatrolLeader: null, scouts: [] });
  return rows;
}
function setPatrolBadgePreview(input) {
  const row = input.closest("[data-patrol-row]");
  const preview = row?.querySelector("[data-patrol-badge-preview]");
  if (!preview) return;
  preview.src = input.value.trim() || scoutOrgLogo;
}
function setScoutPatrolBadgePreview(select) {
  const preview = document.querySelector("[data-scout-patrol-badge-preview]");
  if (!preview) return;
  const patrol = select?.value || "";
  preview.src = getPatrolBadgeImage(patrol);
  preview.alt = `${getPatrolDisplayName(patrol)} badge`;
}
function renderPatrolScoutChip(scout, patrolName = "") {
  return `<span class="child-chip" data-patrol-scout-chip="${scout.id}"><button class="icon-button mini" data-remove-scout-from-patrol="${scout.id}" type="button" aria-label="Remove ${scout.name} from ${patrolName || "patrol"}">x</button>${renderScoutName(scout)}</span>`;
}
function renderPatrolLeaderOptions(patrolScouts, selectedScoutId = "") {
  return sortScoutsByRankWithinPatrol(patrolScouts).map((scout) => `<option value="${scout.id}"${selectedScoutId === scout.id ? " selected" : ""}>${scout.name}</option>`).join("");
}
function renderPatrolAddList(row, availableUnassigned, index) {
  if (!availableUnassigned.length) return `<div class="patrol-add-list is-hidden" data-patrol-add-list><span class="section-copy">No unassigned scouts available.</span></div>`;
  return `<div class="patrol-add-list is-hidden" data-patrol-add-list><select data-patrol-insert-scout aria-label="Select unassigned scout to add to ${row.patrol || `patrol ${index + 1}`}"><option value="">Select unassigned scout</option>${availableUnassigned.map((scout) => `<option value="${scout.id}">${scout.name} - ${scout.rank}</option>`).join("")}</select></div>`;
}
function updatePatrolAddListAvailability(row) {
  const select = row?.querySelector("[data-patrol-insert-scout]");
  if (select && !select.querySelector("option[value]:not([value=''])")) {
    row.querySelector("[data-show-patrol-add-list]")?.setAttribute("disabled", "");
    const addList = row.querySelector("[data-patrol-add-list]");
    if (addList) addList.innerHTML = `<span class="section-copy">No unassigned scouts available.</span>`;
  }
}
function addScoutToPatrolLeaderChoices(row, scout) {
  if (!row || !scout) return;
  row.querySelectorAll("[data-patrol-leader], [data-assistant-patrol-leader]").forEach((select) => {
    if (!select.querySelector(`option[value="${scout.id}"]`)) {
      select.insertAdjacentHTML("beforeend", `<option value="${scout.id}">${scout.name}</option>`);
    }
  });
}
function removeScoutFromPatrolLeaderChoices(row, scoutId) {
  if (!row || !scoutId) return;
  row.querySelectorAll(`[data-patrol-leader] option[value="${scoutId}"], [data-assistant-patrol-leader] option[value="${scoutId}"]`).forEach((option) => option.remove());
}
function addScoutToPatrolRow(row, scoutId) {
  if (!row || !scoutId) return false;
  const scout = roster.find((entry) => entry.id === scoutId) || scouts.find((entry) => entry.id === scoutId);
  if (!scout) return false;
  const addedScoutIds = new Set(String(row.dataset.addedScoutIds || "").split(",").map((value) => value.trim()).filter(Boolean));
  const removedScoutIds = new Set(String(row.dataset.removedScoutIds || "").split(",").map((value) => value.trim()).filter(Boolean));
  removedScoutIds.delete(scoutId);
  addedScoutIds.add(scoutId);
  row.dataset.addedScoutIds = [...addedScoutIds].join(",");
  row.dataset.removedScoutIds = [...removedScoutIds].join(",");
  const list = row.querySelector(".patrol-scout-list");
  if (list) {
    if (list.querySelector(".section-copy")) {
      list.innerHTML = "";
    }
    if (!list.querySelector(`[data-patrol-scout-chip="${scout.id}"]`)) {
      list.insertAdjacentHTML("beforeend", `${renderPatrolScoutChip(scout, row.querySelector("[data-patrol-name]")?.value || "patrol")} `);
    }
  }
  addScoutToPatrolLeaderChoices(row, scout);
  document.querySelectorAll(`[data-patrol-insert-scout] option[value="${scoutId}"]`).forEach((option) => {
    const optionRow = option.closest("[data-patrol-row]");
    option.remove();
    updatePatrolAddListAvailability(optionRow);
  });
  row.querySelector("[data-patrol-insert-scout]")?.closest("[data-patrol-add-list]")?.classList.add("is-hidden");
  return true;
}
async function savePatrolEditorChanges() {
  const rows = [...document.querySelectorAll("[data-patrol-row]")];
  const nextRows = [];
  const removedRows = [];
  const seenPatrols = new Set();

  rows.forEach((row, index) => {
    const previousPatrol = row.dataset.patrolOriginal || "";
    const nextPatrol = row.querySelector("[data-patrol-name]")?.value.trim() || previousPatrol;
    const nextBadge = row.querySelector("[data-patrol-badge]")?.value.trim() || getPatrolBadgeImage(nextPatrol);
    const patrolLeaderId = row.querySelector("[data-patrol-leader]")?.value || "";
    const assistantPatrolLeaderId = row.querySelector("[data-assistant-patrol-leader]")?.value || "";
    const removedScoutIds = String(row.dataset.removedScoutIds || "").split(",").map((value) => value.trim()).filter(Boolean);
    const addedScoutIds = String(row.dataset.addedScoutIds || "").split(",").map((value) => value.trim()).filter(Boolean);
    const isRemoved = row.dataset.patrolRemoved === "true";

    if (isRemoved) {
      if (previousPatrol) {
        removedRows.push({ previousPatrol, patrolLeaderId, assistantPatrolLeaderId });
      }
      return;
    }

    if (!nextPatrol) {
      return;
    }

    const patrolKey = nextPatrol.toLowerCase();
    if (seenPatrols.has(patrolKey)) {
      throw new Error(`Patrol "${nextPatrol}" is listed more than once.`);
    }
    seenPatrols.add(patrolKey);
    nextRows.push({ previousPatrol, nextPatrol, nextBadge, patrolLeaderId, assistantPatrolLeaderId, removedScoutIds, addedScoutIds });
  });

  nextRows.forEach(({ previousPatrol, nextPatrol, nextBadge }) => {
    if (!previousPatrol) return;
    scouts.filter((scout) => scout.patrol === previousPatrol).forEach((scout) => {
      scout.patrol = nextPatrol;
      scout.patrolBadge = nextBadge;
    });
  });

  removedRows.forEach(({ previousPatrol, patrolLeaderId, assistantPatrolLeaderId }) => {
    if (previousPatrol) {
      scouts.filter((scout) => scout.patrol === previousPatrol).forEach((scout) => {
        scout.patrol = unassignedPatrolValue;
        scout.patrolBadge = getPatrolBadgeValue(unassignedPatrolValue);
      });
    }
    [patrolLeaderId, assistantPatrolLeaderId].filter(Boolean).forEach((scoutId) => {
      const scout = scouts.find((entry) => entry.id === scoutId);
      if (scout) {
        scout.patrol = unassignedPatrolValue;
        scout.patrolBadge = getPatrolBadgeValue(unassignedPatrolValue);
      }
    });
  });

  scouts.forEach((scout) => {
    if (scout.leadershipRole === "Patrol Leader" || scout.leadershipRole === "Assistant Patrol Leader") {
      scout.leadershipRole = "";
    }
  });

  nextRows.forEach(({ nextPatrol, nextBadge, patrolLeaderId, assistantPatrolLeaderId, removedScoutIds, addedScoutIds }) => {
    removedScoutIds.forEach((scoutId) => {
      const scout = scouts.find((entry) => entry.id === scoutId);
      if (scout) {
        scout.patrol = unassignedPatrolValue;
        scout.patrolBadge = getPatrolBadgeValue(unassignedPatrolValue);
      }
    });
    addedScoutIds.forEach((scoutId) => {
      const scout = scouts.find((entry) => entry.id === scoutId);
      if (scout) {
        scout.patrol = nextPatrol;
        scout.patrolBadge = nextBadge;
      }
    });
    const patrolLeader = scouts.find((scout) => scout.id === patrolLeaderId);
    if (patrolLeader) {
      patrolLeader.patrol = nextPatrol;
      patrolLeader.patrolBadge = nextBadge;
      patrolLeader.leadershipRole = "Patrol Leader";
    }
    const assistantPatrolLeader = scouts.find((scout) => scout.id === assistantPatrolLeaderId);
    if (assistantPatrolLeader) {
      assistantPatrolLeader.patrol = nextPatrol;
      assistantPatrolLeader.patrolBadge = nextBadge;
      assistantPatrolLeader.leadershipRole = "Assistant Patrol Leader";
    }
  });

  patrols = nextRows.map(({ nextPatrol, nextBadge }) => ({ name: nextPatrol, badge: nextBadge }));
  scouts.forEach((scout) => {
    scout.patrolBadge = getPatrolBadgeImage(scout.patrol);
  });
  showAddPatrolRow = false;
  await saveScouts();
  await savePatrols();
  rebuildDerivedData();
  renderRoute();
}
function renderPatrolsRoute() {
  if (!canEditScouts()) { renderAccessDenied(); return; }
  const patrolRows = getPatrolRowsForEditor();
  const unassignedScouts = sortScoutsByRankWithinPatrol(roster.filter((scout) => !scout.patrol));
  app.innerHTML = `${topNav()}<section class="dashboard-banner"><div><p class="eyebrow">Patrols</p><h2>Manage patrols</h2><p class="intro compact">Upload a new badge image, rename patrols, add new patrols, and remove patrols into the unassigned pool from this page. Saving keeps the patrol list itself in sync and also writes patrol, badge, and patrol leadership changes back onto the scout records.</p></div><div class="status-chip"><span>Route</span><strong>/patrols</strong></div></section><section class="section"><div class="section-heading"><div><p class="eyebrow">Patrol editor</p><h2>Patrol cards</h2></div><div class="scribe-actions"><button class="button secondary" type="button" data-show-add-patrol>${showAddPatrolRow ? "Adding patrol..." : "Add patrol"}</button><button class="button primary" type="button" data-save-patrols>Save patrol changes</button></div></div><div class="patrol-card-grid">${patrolRows.map((row, index) => { const availableUnassigned = unassignedScouts.filter((scout) => scout.id !== row.patrolLeader?.id && scout.id !== row.assistantPatrolLeader?.id && !row.scouts.some((member) => member.id === scout.id)); const visibleScouts = row.scouts.filter((scout) => scout.id !== row.patrolLeader?.id && scout.id !== row.assistantPatrolLeader?.id); const patrolLabel = row.patrol || `patrol ${index + 1}`; return `<article class="panel patrol-editor-card" data-patrol-row data-patrol-original="${row.patrol}" data-patrol-scout-count="${row.scouts.length}"><div class="patrol-card-header"><div class="patrol-card-title"><input type="text" data-patrol-name value="${row.patrol}" placeholder="Patrol name" aria-label="Patrol name ${index + 1}" /></div><div class="patrol-card-badge"><label class="patrol-badge-click-target" aria-label="Change badge for ${patrolLabel}"><img class="patrol-badge-preview" data-patrol-badge-preview src="${row.badge}" alt="${row.patrol || "New patrol"} badge preview" /><input class="visually-hidden-file-input" type="file" data-patrol-badge-upload accept="image/*" /></label><input type="hidden" data-patrol-badge value="${row.badge}" aria-label="Badge for ${patrolLabel}" /></div></div><div class="patrol-card-leaders"><label><span>Patrol leader</span><select data-patrol-leader aria-label="Patrol leader for ${patrolLabel}"><option value="">Unassigned</option>${renderPatrolLeaderOptions(row.scouts, row.patrolLeader?.id || "")}</select></label><label><span>Assistant patrol leader</span><select data-assistant-patrol-leader aria-label="Assistant patrol leader for ${patrolLabel}"><option value="">Unassigned</option>${renderPatrolLeaderOptions(row.scouts, row.assistantPatrolLeader?.id || "")}</select></label></div><div class="patrol-card-members"><div class="patrol-card-members-heading"><span>Scouts in patrol</span><button class="icon-button add" data-show-patrol-add-list type="button" aria-label="Show unassigned scouts for ${patrolLabel}"${availableUnassigned.length ? "" : " disabled"}>+</button></div><div class="patrol-scout-list">${visibleScouts.length ? visibleScouts.map((scout) => renderPatrolScoutChip(scout, row.patrol)).join(" ") : `<span class="section-copy">No scouts assigned yet</span>`}</div>${renderPatrolAddList(row, availableUnassigned, index)}</div><div class="patrol-card-actions"><button class="button danger" type="button" data-toggle-remove-patrol>${row.patrol ? "Remove patrol" : "Discard row"}</button></div></article>`; }).join("")}</div></section><section class="section"><div class="panel"><div class="panel-heading"><h3>Unassigned scouts</h3><p>Scouts removed from a patrol land here until you add them into a patrol again.</p></div>${unassignedScouts.length ? `<div class="adult-children-list">${unassignedScouts.map((scout) => `<span class="child-chip">${renderScoutName(scout)}<small>${scout.rank}</small></span>`).join("")}</div>` : `<p class="section-copy">No unassigned scouts.</p>`}</div></section>`;
}
function getSavedAdultPeople() { return uniqueBy(adults, (adult) => adult.name).sort((a, b) => a.name.localeCompare(b.name)); }
function getAvailableAdultsForLeadership() { const current = new Set(adultLeaders.map((adult) => adult.name)); return getSavedAdultPeople().filter((adult) => !current.has(adult.name)); }
function findAdultByName(name) { return adults.find((adult) => adult.name.toLowerCase() === String(name || "").trim().toLowerCase()); }
function getAdultLeaderAssignment(adultId) { return adultLeaders.find((leader) => leader.adultId === adultId) || null; }
function getScoutsForAdult(adult) { const linkedScoutIds = new Set(adultScoutRelationships.filter((relationship) => relationship.adultId === adult.id).map((relationship) => relationship.scoutId)); return scouts.filter((scout) => linkedScoutIds.has(scout.id)); }
function getAvailableScoutsForAdult(adult) { const linkedScoutIds = new Set(adultScoutRelationships.filter((relationship) => relationship.adultId === adult.id).map((relationship) => relationship.scoutId)); return scouts.filter((scout) => !linkedScoutIds.has(scout.id)).sort((a, b) => a.name.localeCompare(b.name)); }
let currentActor = null;
let sessionToken = window.localStorage.getItem("troop883-auth-token") || "";
function authHeaders(extra = {}) { return { ...extra, ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}) }; }
function assignedRoles() { return new Set([...(currentActor?.globalRoles || []), ...(currentActor?.unitRoles || []).map((assignment) => assignment.role)]); }
function hasRole(role) { return assignedRoles().has(role); }
function hasAnyRole(roles) { const currentRoles = assignedRoles(); return roles.some((role) => currentRoles.has(role)); }
function getCurrentMode() {
  if (hasRole("administrator")) return "admin";
  if (hasRole("adult_leader")) return "adult-leader";
  if (hasRole("committee_member")) return "committee";
  if (hasRole("parent")) return "parent";
  if (hasRole("scout")) return "scout";
  return "public";
}
async function loadCurrentActor() {
  if (!sessionToken) {
    currentActor = null;
    return;
  }
  try {
    const response = await fetch("/auth/me", { cache: "no-store", headers: authHeaders() });
    if (!response.ok) {
      sessionToken = "";
      currentActor = null;
      window.localStorage.removeItem("troop883-auth-token");
      return;
    }
    currentActor = await response.json();
  } catch (error) {
    sessionToken = "";
    currentActor = null;
    window.localStorage.removeItem("troop883-auth-token");
  }
}
async function postJson(url, payload) {
  const response = await fetch(url, { method: "POST", headers: authHeaders({ "Content-Type": "application/json" }), body: JSON.stringify(payload) });
  if (response.status === 401 || response.status === 403) {
    await loadData();
    renderAccessDenied();
    throw new Error(`Request denied for ${url}`);
  }
  if (!response.ok) { throw new Error(`Request failed for ${url}`); }
}
async function saveScouts() { await postJson("/api/scouts", { scouts: scouts.map(serializeScout) }); }
async function savePatrols() {
  storePatrolsSnapshot();
  try {
    await postJson("/api/patrols", { patrols: patrols.map(serializePatrol) });
    return true;
  } catch (error) {
    return false;
  }
}
async function saveAdults() { await postJson("/api/adults", { adults: adults.map(serializeAdult) }); }
async function saveAdultLeaders() { sortAdultLeaders(); await postJson("/api/adult-leaders", { adultLeaders: adultLeaders.map(serializeAdultLeader) }); }
async function saveAdultScoutRelationships() { await postJson("/api/adult-scout-relationships", { adultScoutRelationships: adultScoutRelationships.map(serializeAdultScoutRelationship) }); }
function nextAdultId() { const max = adults.reduce((highest, adult) => { const match = String(adult.id || "").match(/adult-(\d+)/); return Math.max(highest, match ? Number(match[1]) : 0); }, 0); return `adult-${max + 1}`; }
async function saveHolidays() { await postJson("/api/holidays", { holidays: holidays.map(serializeHoliday) }); }
function nextHolidayId() { const max = holidays.reduce((highest, holiday) => { const match = String(holiday.id || "").match(/holiday-(\d+)/); return Math.max(highest, match ? Number(match[1]) : 0); }, 0); return `holiday-${max + 1}`; }
function getHolidayById(holidayId) { return holidays.find((holiday) => holiday.id === holidayId); }
function getSortedHolidays() { return [...holidays].sort((a, b) => (parseDateKey(a.date)?.getTime() || 0) - (parseDateKey(b.date)?.getTime() || 0) || a.name.localeCompare(b.name)); }
function formatHolidayDateRange(holiday) { if (!holiday?.date) return "Date not set"; if (!holiday.endDate || holiday.endDate === holiday.date) return formatFullDate(holiday.date); return `${formatFullDate(holiday.date)} - ${formatFullDate(holiday.endDate)}`; }
function publicEventsUrl() { const params = new URLSearchParams({ startDate: formatDateKey(getEventRangeStart()), endDate: formatDateKey(getEventRangeEnd()), page: "1", pageSize: "100" }); return `/api/public?${params.toString()}`; }
function getCalendarMonthRange(monthKey) {
  const [year, month] = String(monthKey || "").split("-").map(Number);
  if (!year || !month) return null;
  return {
    startDate: formatDateKey(new Date(year, month - 1, 1)),
    endDate: formatDateKey(new Date(year, month, 0)),
  };
}
function calendarEventsUrl(monthKey) {
  const range = getCalendarMonthRange(monthKey);
  if (!range) return "";
  const params = new URLSearchParams({ ...range, page: "1", pageSize: "100" });
  return `/api/events?${params.toString()}`;
}
async function loadCalendarMonthEvents(monthKey) {
  if (!/^\d{4}-\d{2}$/.test(String(monthKey || "")) || loadedCalendarMonths.has(monthKey)) return;
  const response = await fetch(calendarEventsUrl(monthKey), { cache: "no-store", headers: authHeaders() });
  if (!response.ok) throw new Error(`Could not load events for ${monthKey}`);
  const payload = await response.json();
  const incomingEvents = Array.isArray(payload.events) ? payload.events : Array.isArray(payload.data?.events) ? payload.data.events : [];
  mergeLoadedEvents(incomingEvents);
  loadedCalendarMonths.add(monthKey);
  rebuildDerivedData();
}
async function openCalendarMonth(monthKey, dateKey = "") {
  if (!/^\d{4}-\d{2}$/.test(String(monthKey || ""))) return;
  const selectedDate = getSelectedCalendarDate();
  setSelectedEventMonth(monthKey);
  setSelectedCalendarDate(dateKey || (selectedDate.startsWith(monthKey) ? selectedDate : `${monthKey}-01`));
  try {
    await loadCalendarMonthEvents(monthKey);
  } catch (error) {
    console.warn(error);
  }
  renderRoute();
}
async function loadEventData(fallbackEvents = []) { return Array.isArray(fallbackEvents) ? fallbackEvents : []; }
function resetOrmBackedData() {
  scouts = [];
  adults = [];
  adultLeaders = [];
  adultScoutRelationships = [];
  patrols = [];
  roster = [];
  groupedByPatrol = [];
  savedParentGuardians = [];
  scoutLeadershipGroups = [];
  events = [];
  holidays = [];
  loadedCalendarMonths.clear();
  hydratedPublicEventIds.clear();
}
async function loadData() {
  resetOrmBackedData();
  let data = {};
  let loadError = null;

  try {
    await loadCurrentActor();
    const response = await fetch(sessionToken ? "/api/me/dashboard" : publicEventsUrl(), { cache: "no-store", headers: authHeaders() });
    if (!response.ok) {
      throw new Error("Requested troop data is not available for this account.");
    }
    const payload = await response.json();
    if (payload.actor) currentActor = payload.actor;
    data = payload.data || payload;
  } catch (error) {
    loadError = error;
    if (!sessionToken) {
      currentActor = null;
    }
  }

  scouts = (Array.isArray(data.scouts) ? data.scouts : []).map(normalizeScout);
  adults = uniqueBy((Array.isArray(data.adults) ? data.adults : []).map(normalizeAdult), (adult) => adult.id);
  adultLeaders = (Array.isArray(data.adultLeaders) ? data.adultLeaders : []).map(normalizeAdultLeader);
  adultScoutRelationships = (Array.isArray(data.adultScoutRelationships) ? data.adultScoutRelationships : []).map(normalizeAdultScoutRelationship);
  holidays = (Array.isArray(data.holidays) ? data.holidays : []).map(normalizeHoliday).filter((holiday) => holiday.date);
  patrols = uniqueBy((Array.isArray(data.patrols) ? data.patrols : []).map(normalizePatrol).filter((patrol) => patrol.name), (patrol) => patrol.name.toLowerCase());

  const incomingEvents = (await loadEventData(Array.isArray(data.events) ? data.events : [])).map(normalizeEvent);
  loadEvents(incomingEvents);
  rebuildDerivedData();
  if ((window.location.hash || "").startsWith("#/events/calendar")) {
    await loadCalendarMonthEvents(getSelectedEventMonth());
  }
  const detailEventId = getEventDetailRouteId();
  if (detailEventId) {
    await hydratePublicCalendarEventMedia(detailEventId);
  }

  if (!getActiveScoutId() && roster[0]?.id) {
    setActiveScoutId(roster[0].id);
  }

  if (loadError && !incomingEvents.length && sessionToken) {
    throw loadError;
  }
}
const app = document.getElementById("app");
const headerActions = document.querySelector(".header-actions");
const modeSelect = {
  get value() { return getCurrentMode(); },
  set value(value) {},
  addEventListener() {},
  options: [],
};
const canSeeOrgChart = () => hasAnyRole(["adult_leader", "administrator"]);
function renderIdentityControls() {
  const existing = document.querySelector("[data-auth-session]");
  if (existing) existing.remove();
  if (!headerActions) return;
  const viewer = getCurrentViewerIdentity();
  const markup = viewer
    ? `<div class="view-toggle" data-auth-session><span>${viewer.role}</span><strong>${viewer.name}</strong><button class="button secondary" type="button" data-logout>Log out</button></div>`
    : `<details class="login-panel" data-auth-session><summary><span>Email login</span></summary><form class="view-toggle login-form" data-login-form><span>Member login</span><input type="email" data-login-email placeholder="email@example.com" aria-label="Email" autocomplete="username" /><div class="password-field"><input type="password" data-login-password placeholder="Password optional locally" aria-label="Password" autocomplete="current-password" /><button class="password-toggle" type="button" data-toggle-password aria-label="Show password">Show</button></div><input type="text" data-login-otp placeholder="MFA code" aria-label="MFA code" autocomplete="one-time-code" /><button class="button primary" type="submit">Log in</button></form></details>`;
  headerActions.insertAdjacentHTML("afterbegin", markup);
}
const topNav = () => { const currentHash = window.location.hash || "#/"; return `<nav class="top-nav"><a class="nav-pill${currentHash === "#/" || currentHash === "" ? " is-active" : ""}" href="#/">Home</a><a class="nav-pill${currentHash.startsWith("#/events") ? " is-active" : ""}" href="#/events">Events</a><a class="nav-pill${currentHash.startsWith("#/resources") ? " is-active" : ""}" href="#/resources">Resources</a>${currentActor?.authenticated ? `<a class="nav-pill${currentHash.startsWith("#/scribe/attendance") ? " is-active" : ""}" href="#/scribe/attendance">Scribe Attendance</a>` : ""}${canEditScouts() ? `<a class="nav-pill${currentHash === "#/scouts" || currentHash.startsWith("#/scouts/") ? " is-active" : ""}" href="#/scouts">Scouts</a><a class="nav-pill${currentHash.startsWith("#/patrols") ? " is-active" : ""}" href="#/patrols">Patrols</a>` : ""}${canSeeOrgChart() ? `<a class="nav-pill${currentHash.startsWith("#/holidays") ? " is-active" : ""}" href="#/holidays">Holidays</a><a class="nav-pill${currentHash === "#/adult" || currentHash === "#/adults" || currentHash.startsWith("#/adults/") ? " is-active" : ""}" href="#/adults">Adults</a><a class="nav-pill${currentHash.startsWith("#/org-chart") ? " is-active" : ""}" href="#/org-chart">Org Chart</a>` : ""}<span class="nav-note">${currentActor?.authenticated ? `Signed in as ${getCurrentMode()}` : "Public visitor"}</span></nav>`; };
const renderEventCard = (event) => { const mediaItems = getDisplayMediaItems(event); return `<article class="event-card${isAdultEvent(event) ? " adult-event-theme" : ""}"><div class="image-wrap">${mediaItems.length > 1 ? `<div class="carousel" data-index="0"><div class="carousel-track">${mediaItems.map((item, index) => renderEventCardMedia(event, item, index, index === 0)).join("")}</div><button class="carousel-button prev" type="button" aria-label="Previous media">&#8249;</button><button class="carousel-button next" type="button" aria-label="Next media">&#8250;</button><div class="carousel-dots">${mediaItems.map((_, index) => `<button class="carousel-dot${index === 0 ? " is-active" : ""}" type="button" data-slide="${index}" aria-label="Go to media ${index + 1}"></button>`).join("")}</div></div>` : renderEventCardMedia(event, mediaItems[0], 0, null)}<span class="category-pill">${event.category}</span></div><div class="event-content"><p class="event-date">${event.dateLabel}</p><h3><a class="text-link" href="#/events/${event.id}">${event.title}</a></h3><p class="event-description">${event.description}</p><div class="event-meta"><span>${event.location}</span><span>${event.audience}</span></div></div></article>`; };
const renderParentEventCard = (event, registeredScouts = []) => { const mediaItems = getDisplayMediaItems(event); return `<article class="event-card${isAdultEvent(event) ? " adult-event-theme" : ""}"><div class="image-wrap">${mediaItems.length > 1 ? `<div class="carousel" data-index="0"><div class="carousel-track">${mediaItems.map((item, index) => renderEventCardMedia(event, item, index, index === 0)).join("")}</div><button class="carousel-button prev" type="button" aria-label="Previous media">&#8249;</button><button class="carousel-button next" type="button" aria-label="Next media">&#8250;</button><div class="carousel-dots">${mediaItems.map((_, index) => `<button class="carousel-dot${index === 0 ? " is-active" : ""}" type="button" data-slide="${index}" aria-label="Go to media ${index + 1}"></button>`).join("")}</div></div>` : renderEventCardMedia(event, mediaItems[0], 0, null)}<span class="category-pill">${event.category}</span></div><div class="event-content"><p class="event-date">${event.dateLabel}</p><h3><a class="text-link" href="#/events/${event.id}">${event.title}</a></h3><p class="event-description">${event.description}</p><div class="event-meta"><span>${event.location}</span><span>${event.audience}</span></div><div class="registered-scouts"><span class="registered-scouts-label">${registeredScouts.length === 1 ? "Registered scout" : "Registered scouts"}</span>${registeredScouts.map((scout) => `<span class="registered-scout-chip">${scout.name}</span>`).join("")}</div></div></article>`; };
const renderEventDetail = (event) => { const leadMedia = getDisplayMediaItems(event)[0] || normalizeGalleryItem({ src: event.image }, 0); return `<article class="detail-panel${isAdultEvent(event) ? " adult-event-theme" : ""}" id="${event.id}">${renderGalleryMedia(leadMedia, getGalleryDisplayTitle(event, leadMedia, 0)).replace('class="event-gallery-media"', 'class="detail-image"')}<div class="detail-body"><p class="event-date">${event.dateLabel}</p><h3>${event.title}</h3><p class="event-description">${event.description}</p><div class="event-meta"><span>${event.category}</span><span>${event.location}</span><span>${event.audience}</span></div><div class="detail-note">${event.detailNote}</div></div></article>`; };
const renderLeadershipSummary = () => `<article class="panel"><div class="panel-heading"><h3>Leadership coverage</h3><p>Youth and adult leadership assignments loaded into the prototype.</p></div><ul class="detail-list"><li>Scout leadership positions filled: ${roster.filter((scout) => scout.leadershipRole).length}</li><li>Adult leadership positions filled: ${adultLeaders.length}</li><li><a class="text-link" href="#/org-chart">Open troop org chart</a></li></ul></article>`;
function renderAdultScoutRosterPanel({ showFilter = true } = {}) {
  const groups = groupedByPatrol.filter((group) => group.scouts.length);
  const filterMarkup = showFilter ? `<div class="inline-filter"><label><span>Filter scouts</span><input type="search" data-scout-filter placeholder="Name, patrol, or rank" aria-label="Filter scouts by name, patrol, or rank" /></label><p class="section-copy" data-scout-filter-count>${roster.length} scouts grouped by current patrol assignment.</p></div>` : "";
  return `<section class="section"><div class="section-heading"><div><p class="eyebrow">Scouts</p><div class="all-scouts-title-row"><h2>All scouts</h2>${filterMarkup}</div></div></div><div class="scout-roster-grid" data-scout-filter-scope>${groups.map((group) => { const patrolName = getPatrolDisplayName(group.name); return `<article class="panel scout-roster-card" data-scout-patrol-card data-scout-patrol="${patrolName.toLowerCase()}"><div class="panel-heading"><h3>${patrolName}${group.name ? " Patrol" : ""}</h3><p>${group.scouts.length} scout${group.scouts.length === 1 ? "" : "s"}</p></div><div class="adult-children-list">${sortScoutsForPatrolRoster(group.scouts).map((scout) => `<span class="child-chip scout-roster-chip" data-scout-filter-item data-scout-name="${scout.name.toLowerCase()}" data-scout-patrol="${patrolName.toLowerCase()}" data-scout-rank="${String(scout.rank || "").toLowerCase()}">${renderScoutName(scout, { className: "text-link" })}<small>${scout.rank}${scout.leadershipRole ? ` - ${scout.leadershipRole}` : ""}</small></span>`).join("")}</div></article>`; }).join("")}</div></section>`;
}
function renderScoutsRoute() {
  if (!canEditScouts()) { return renderAccessDenied(); }
  app.innerHTML = `${topNav()}<section class="dashboard-banner"><div><p class="eyebrow">Scouts</p><h2>Scout records</h2><p class="intro compact">Adult leaders can review every scout, open the editable scout record, and see patrol, rank, leadership, and linked adult information.</p></div><div class="status-chip"><span>Route</span><strong>/scouts</strong></div></section><section class="section"><div class="section-heading"><div><p class="eyebrow">Directory</p><div class="all-scouts-title-row"><h2>All scouts</h2><div class="inline-filter"><label><span>Filter scouts</span><input type="search" data-scout-filter placeholder="Name, patrol, or rank" aria-label="Filter scouts by name, patrol, or rank" /></label><p class="section-copy" data-scout-filter-count>${roster.length} scout records</p></div></div></div><div class="directory-tools"><div class="scribe-actions"><a class="button secondary" href="#/patrols">Manage patrols</a><a class="button secondary" href="#/org-chart/edit-scouts">Edit scout org chart</a></div></div></div><div class="panel"><div class="panel-heading"><h3>${roster.length} scout records</h3><p>Open any scout to edit details, patrol assignment, and leadership position.</p></div><div class="table-wrap"><table class="data-table scout-directory-table" data-scout-filter-scope><thead><tr><th aria-label="Actions"></th><th>Scout</th><th>Patrol</th><th>Rank</th><th>Linked adults</th></tr></thead><tbody>${sortScoutsByRankWithinPatrol(roster).map((scout) => { const patrolName = getPatrolDisplayName(scout.patrol); const scoutLabel = getScoutDirectoryName(scout); return `<tr data-scout-filter-item data-scout-name="${`${scout.name} ${getScoutNickname(scout)}`.toLowerCase()}" data-scout-patrol="${patrolName.toLowerCase()}" data-scout-rank="${String(scout.rank || "").toLowerCase()}"><td>${renderScoutDirectoryActionCell(scout)}</td><td>${renderScoutDirectoryNameCell(scout, scoutLabel)}</td><td>${patrolName}</td><td>${scout.rank}</td><td>${scout.parents.length ? `<div class="adult-children-list compact">${scout.parents.map((parent) => `<span class="child-chip"><a class="text-link" href="#/adults/${parent.adultId}">${parent.relationship}: ${parent.name}</a></span>`).join("")}</div>` : "No linked adults"}</td></tr>`; }).join("")}</tbody></table></div></div></section>${renderAdultScoutRosterPanel({ showFilter: false })}`;
}
function renderResourcesRoute() { app.innerHTML = `${topNav()}<section class="dashboard-banner"><div><p class="eyebrow">Resources</p><h2>Downloadable troop resources</h2><p class="intro compact">Printable and editable files families can save for merit badge preparation.</p></div><div class="status-chip"><span>Route</span><strong>/resources</strong></div></section><section class="section"><div class="panel"><div class="panel-heading"><h3>Chess Merit Badge readiness checklist</h3><p>Use the PDF for printing or the Markdown file for editing.</p></div><div class="scribe-actions"><a class="button secondary" href="resources/chess_merit_badge_checklist.pdf" download>Download PDF</a><a class="button secondary" href="resources/chess_merit_badge_checklist.md" download>Download Markdown</a></div></div></section>`; }
function renderLandingScrollerCard(event, index, currentIndex) {
  const mediaItems = getDisplayMediaItems(event);
  const isCurrent = index === currentIndex;
  return `<article class="event-card landing-event-card${isAdultEvent(event) ? " adult-event-theme" : ""}${isCurrent ? " is-current" : ""}" data-upcoming-card="${index}"${isCurrent ? " data-upcoming-current" : ""}><div class="image-wrap">${mediaItems.length > 1 ? `<div class="carousel" data-index="0"><div class="carousel-track">${mediaItems.map((item, mediaIndex) => renderEventCardMedia(event, item, mediaIndex, mediaIndex === 0)).join("")}</div><button class="carousel-button prev" type="button" aria-label="Previous media">&#8249;</button><button class="carousel-button next" type="button" aria-label="Next media">&#8250;</button><div class="carousel-dots">${mediaItems.map((_, mediaIndex) => `<button class="carousel-dot${mediaIndex === 0 ? " is-active" : ""}" type="button" data-slide="${mediaIndex}" aria-label="Go to media ${mediaIndex + 1}"></button>`).join("")}</div></div>` : renderEventCardMedia(event, mediaItems[0], 0, null)}<span class="category-pill">${event.category}</span></div><div class="event-content"><p class="event-date">${event.dateLabel || formatEventListDate(event)}</p><h3><a class="text-link" href="#/events/${event.id}">${event.title}</a></h3><p class="event-description">${event.description || "More troop event details are coming soon."}</p><div class="event-meta"><span>${event.location || event.homeBase || "Location TBD"}</span><span>${event.audience || "Troop"}</span></div><a class="button primary landing-event-button" href="#/events/${event.id}">View details</a></div></article>`;
}
function renderPublic() {
  const sortedEvents = getSortedEvents();
  const upcoming = sortedEvents.filter((event) => isUpcomingEvent(event));
  const nextEvent = upcoming[0] || null;
  const nextEventLocation = nextEvent?.location || nextEvent?.homeBase || "";
  const landingEvents = getLandingEventWindow();
  const currentEventIndex = getCurrentEventIndex(landingEvents);
  const rangeLabel = `${getEventRangeStart().toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${getEventRangeEnd().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  app.innerHTML = `${topNav()}<section class="hero"><div class="hero-copy"><p class="eyebrow">Public landing page</p><h2>Adventure, leadership, and a troop community that families can join.</h2><p>This non-logged-in version highlights troop events in a two-month window on either side of today, presents event imagery, and invites families to explore the full event details.</p></div><div class="hero-card"><p class="hero-card-label">Next upcoming event</p><h3>${nextEvent ? `<a class="text-link" href="#/events/${nextEvent.id}">${nextEvent.title}</a>` : "No event scheduled"}</h3><p class="hero-event-meta">${nextEvent ? `${nextEvent.dateLabel} &bull; ${nextEvent.location}` : "Check back soon for the next troop event."}</p><p>${nextEvent ? nextEvent.description : "The troop calendar is ready for the next event update."}</p>${nextEventLocation ? `<div class="hero-card-map"><div class="hero-card-map-frame"><iframe class="hero-card-map-embed" src="${mapUrlForLocation(nextEventLocation)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Map for ${nextEventLocation}"></iframe><a class="hero-card-map-overlay" href="${directionsUrlForLocation(nextEventLocation)}" target="_blank" rel="noreferrer" aria-label="Open directions to ${nextEventLocation}"><span>Directions</span></a></div><a class="hero-card-map-link" href="${directionsUrlForLocation(nextEventLocation)}" target="_blank" rel="noreferrer">Open directions to ${nextEventLocation}</a></div>` : ""}</div></section><section class="section upcoming-events-section" id="upcoming-events"><div class="section-heading centered-events-heading"><div><p class="eyebrow">Upcoming Events</p><h2>Troop calendar highlights</h2></div><p class="section-copy">${rangeLabel}</p></div><div class="upcoming-scroller-shell"><button class="event-scroll-button previous" type="button" data-event-scroll="-1" aria-label="Browse earlier events">&#8249;</button><div class="upcoming-event-scroller" data-upcoming-scroller>${landingEvents.map((event, index) => renderLandingScrollerCard(event, index, currentEventIndex)).join("") || `<article class="panel empty-events-panel"><div class="panel-heading"><h3>No events in this window</h3><p>Check back soon for updated troop calendar details.</p></div></article>`}</div><button class="event-scroll-button next" type="button" data-event-scroll="1" aria-label="Browse later events">&#8250;</button></div>${landingEvents.length ? `<div class="event-scroll-dots" aria-label="Event position">${landingEvents.map((_, index) => `<span class="event-scroll-dot${index === currentEventIndex ? " is-active" : ""}"></span>`).join("")}</div>` : ""}</section>`;
  requestUpcomingScrollerCenter();
}
function renderDashboard(mode) { const config = dashboards[mode]; const scribePanel = canSeeOrgChart() ? `<article class="panel"><div class="panel-heading"><h3>Adult leader tools</h3><p>Prototype route family requested in the requirements.</p></div><ul class="detail-list"><li><a class="text-link" href="#/scribe/attendance">Scribe attendance</a></li><li><a class="text-link" href="#/holidays">Holiday blackouts</a></li><li><a class="text-link" href="#/adults">Adult records</a></li><li><a class="text-link" href="#/org-chart">Troop org chart</a></li><li><a class="text-link" href="#/org-chart/edit-scouts">Edit scout org chart</a></li><li><a class="text-link" href="#/org-chart/edit-adults">Edit adult org chart</a></li></ul></article>` : ""; const adultScoutRosterSection = canSeeOrgChart() ? renderAdultScoutRosterPanel() : ""; const parentEventGroups = mode === "parent" ? getParentDashboardEventGroups() : null; const eventPreviewSection = mode === "parent" ? `<section class="section"><div class="section-heading"><div><p class="eyebrow">Events</p><h2>Event detail preview</h2></div><p class="section-copy">${parentEventGroups?.linkedScouts?.length ? "Recent and upcoming events for the scouts linked to this parent view." : "Link a scout to this parent to show family-relevant events here."}</p></div><div class="feature-grid"><div class="feature-column"><article class="panel"><div class="panel-heading"><h3>Last three weeks</h3><p>Up to two recent events tied to your registered scouts.</p></div>${parentEventGroups?.recent?.length ? `<div class="event-grid parent-event-grid">${parentEventGroups.recent.map(({ event, registeredScouts }) => renderParentEventCard(event, registeredScouts)).join("")}</div>` : `<p class="event-description">No linked-scout events were found in the last three weeks.</p>`}</article></div><div class="feature-column"><article class="panel"><div class="panel-heading"><h3>Next eight weeks</h3><p>Upcoming events for your linked scouts, with each registered child shown on the card.</p></div>${parentEventGroups?.upcoming?.length ? `<div class="event-grid parent-event-grid">${parentEventGroups.upcoming.map(({ event, registeredScouts }) => renderParentEventCard(event, registeredScouts)).join("")}</div>` : `<p class="event-description">No linked-scout events were found in the next eight weeks.</p>`}</article></div></div></section>` : `<section class="section"><div class="section-heading"><div><p class="eyebrow">Events</p><h2>Event detail preview</h2></div><p class="section-copy">Each event includes a direct route to richer details.</p></div><div class="event-grid">${getEventDetailPreviewEvents().map(renderEventCard).join("")}</div></section>`; app.innerHTML = `${topNav()}<section class="dashboard-banner"><div><p class="eyebrow">${config.eyebrow}</p><h2>${config.title}</h2><p class="intro compact">${config.intro}</p></div><div class="status-chip"><span>Post-login destination</span><strong>Role-based dashboard</strong></div></section><section class="section dashboard-grid"><article class="panel"><div class="panel-heading"><h3>Today</h3><p>Personalized access driven by role.</p></div><ul class="detail-list">${config.tasks.map((task) => `<li>${task}</li>`).join("")}</ul></article><article class="panel"><div class="panel-heading"><h3>Attendance decisions</h3><p>Current rules resolved from the updated requirements.</p></div><ul class="detail-list"><li>Statuses: Present, Absent</li><li>Non-regular-meeting attendance can be marked by any adult leader</li><li>Regular meeting attendance continues to support the Scribe workflow</li></ul></article><article class="panel"><div class="panel-heading"><h3>Reports</h3><p>Visibility follows access to the underlying troop data.</p></div><ul class="detail-list">${config.reports.map((report) => `<li>${report}</li>`).join("")}</ul></article><article class="panel"><div class="panel-heading"><h3>Calendar sync behavior</h3><p>Direct Google Calendar changes should flow into the site.</p></div><div class="sync-card"><div><span class="sync-label">Edited outside the site</span><strong>Reflect updated details</strong></div><div><span class="sync-label">Deleted outside the site</span><strong>Remove from the site view</strong></div></div></article>${canSeeOrgChart() ? renderLeadershipSummary() : ""}${scribePanel}</section>${eventPreviewSection}${adultScoutRosterSection}`; }
function renderEventsList() { if (!canSeeOrgChart()) { renderAccessDenied(); return; } const sortedEvents = [...getSortedEvents()].reverse(); app.innerHTML = `${topNav()}<section class="dashboard-banner"><div><p class="eyebrow">Events</p><h2>Editable event list</h2><p class="intro compact">Adult leaders can review the full imported schedule in one list and jump directly into any event editor.</p></div><div class="status-chip"><span>Route</span><strong>/events</strong></div></section><section class="section"><div class="section-heading"><div><p class="eyebrow">Manage events</p><h2>All scheduled events</h2></div><div class="scribe-actions"><a class="button secondary" href="#/events/calendar">Open calendar view</a></div></div><div class="panel"><div class="panel-heading"><h3>${sortedEvents.length} events loaded</h3><p>Newest start date first. Use Edit to open the existing event detail editor for any row.</p></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Title</th><th>Dates</th><th>Category</th><th>Location</th><th>Audience</th><th>Edit</th></tr></thead><tbody>${sortedEvents.map((event) => `<tr><td>${event.title}</td><td>${event.dateLabel || "-"}</td><td>${event.category || "-"}</td><td>${event.location || "-"}</td><td>${event.audience || "-"}</td><td><a class="text-link" href="#/events/${event.id}">Edit</a></td></tr>`).join("")}</tbody></table></div></div></section>`; }
function renderEventsIndex() {
  const selectedMonth = ensureSelectedMonth();
  if (!selectedMonth) {
    app.innerHTML = `${topNav()}<section class="dashboard-banner"><div><p class="eyebrow">Events</p><h2>Troop 883 monthly calendar</h2><p class="intro compact">Event data is loading or temporarily unavailable.</p></div><div class="status-chip"><span>Route</span><strong>/events/calendar</strong></div></section><section class="section"><article class="panel"><div class="panel-heading"><h3>No events loaded</h3><p>Refresh the page or try the calendar again shortly.</p></div></article></section>`;
    return;
  }
  const selectedDate = getSelectedCalendarDate();
  const selectedDateObj = parseDateKey(selectedDate) || prototypeToday;
  const [selectedYear, selectedMonthNumber] = selectedMonth.split("-").map(Number);
  const monthDate = new Date(selectedYear, selectedMonthNumber - 1, 1);
  const previousMonth = new Date(selectedYear, selectedMonthNumber - 2, 1);
  const nextMonth = new Date(selectedYear, selectedMonthNumber, 1);
  const todayMonthKey = getMonthKeyForDate(prototypeToday);
  const monthEvents = events
    .filter((event) => eventOccursInMonth(event, selectedYear, selectedMonthNumber - 1))
    .sort((a, b) => (parseEventStartDate(a)?.getTime() || 0) - (parseEventStartDate(b)?.getTime() || 0));
  const selectedDateEvents = events
    .filter((event) => eventOccursOnDate(event, selectedDateObj))
    .sort((a, b) => (parseEventStartDate(a)?.getTime() || 0) - (parseEventStartDate(b)?.getTime() || 0));
  const storedSelectedEventId = getSelectedCalendarEventId();
  const selectedCalendarEvent = monthEvents.find((event) => event.id === storedSelectedEventId) || selectedDateEvents[0] || monthEvents[0] || null;
  if (selectedCalendarEvent?.id !== storedSelectedEventId) setSelectedCalendarEventId(selectedCalendarEvent?.id || "");
  const calendarCells = buildCalendarCells(selectedMonth);
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const availableYears = [...new Set([prototypeToday.getFullYear() - 1, prototypeToday.getFullYear(), prototypeToday.getFullYear() + 1, ...events.map((event) => parseEventStartDate(event)?.getFullYear()).filter(Boolean)])].sort((a, b) => a - b);

  app.innerHTML = `${topNav()}<section class="dashboard-banner"><div><p class="eyebrow">Events</p><h2>Troop 883 monthly calendar</h2><p class="intro compact">The calendar opens with today highlighted, supports month-to-month navigation, and lets adult leaders insert a new event directly from any date cell.</p></div><div class="status-chip"><span>Route</span><strong>/events/calendar</strong></div></section><section class="section"><div class="section-heading"><div><p class="eyebrow">Calendar</p><h2>${formatMonthLabel(selectedMonth)}</h2></div><p class="section-copy">${canSeeOrgChart() ? "Adult leaders can select any day, add a new event from the plus icon, open an existing event to edit it, or switch to the default list view." : "Select any day to review what is scheduled, then open an event for full details."}</p></div>${canSeeOrgChart() ? `<div class="scribe-actions"><a class="button secondary" href="#/events">Open editable list view</a></div>` : ""}<div class="calendar-toolbar"><div class="calendar-nav"><button class="button secondary" type="button" data-calendar-nav="${getMonthKeyForDate(previousMonth)}">${previousMonth.toLocaleDateString("en-US", { month: "long" })}</button><button class="button ${selectedMonth === todayMonthKey ? "primary" : "secondary"}" type="button" data-calendar-nav="${todayMonthKey}" data-calendar-date="${getTodayDateKey()}">${prototypeToday.toLocaleDateString("en-US", { month: "long", day: "numeric" })}</button><button class="button secondary" type="button" data-calendar-nav="${getMonthKeyForDate(nextMonth)}">${nextMonth.toLocaleDateString("en-US", { month: "long" })}</button></div><div class="calendar-jump"><label class="view-toggle calendar-select"><span>Month</span><select data-calendar-month aria-label="Select calendar month">${Array.from({ length: 12 }, (_, index) => `<option value="${String(index + 1).padStart(2, "0")}"${index === monthDate.getMonth() ? " selected" : ""}>${new Date(2026, index, 1).toLocaleDateString("en-US", { month: "long" })}</option>`).join("")}</select></label><label class="view-toggle calendar-select"><span>Year</span><select data-calendar-year aria-label="Select calendar year">${availableYears.map((year) => `<option value="${year}"${year === monthDate.getFullYear() ? " selected" : ""}>${year}</option>`).join("")}</select></label></div></div><div class="calendar-grid"><div class="calendar-weekdays">${weekdays.map((day) => `<div class="calendar-weekday">${day}</div>`).join("")}</div><div class="calendar-cells">${calendarCells.map((cell) => {
    if (cell.empty) return `<div class="calendar-cell is-empty"></div>`;
    const dateKey = `${selectedMonth}-${String(cell.day).padStart(2, "0")}`;
    const isToday = dateKey === getTodayDateKey();
    const isSelected = dateKey === selectedDate;
    return `<div class="calendar-cell${isToday ? " is-today" : ""}${isSelected ? " is-selected" : ""}"><div class="calendar-cell-top"><button class="calendar-day-button" type="button" data-calendar-date="${dateKey}" aria-label="Open ${formatFullDate(dateKey)}">${cell.day}</button>${canSeeOrgChart() ? `<button class="icon-button add calendar-add-button" type="button" data-add-event-date="${dateKey}" aria-label="Add event on ${formatFullDate(dateKey)}">+</button>` : ""}</div><div class="calendar-events">${cell.events.map((event) => `<button class="calendar-event${selectedCalendarEvent?.id === event.id ? " is-active" : ""}${isAdultEvent(event) ? " adult-event-theme" : ""}" type="button" data-calendar-event="${event.id}" data-calendar-date="${dateKey}">${event.title}</button>`).join("")}</div></div>`;
  }).join("")}</div></div></section><section class="section"><div class="section-heading"><div><p class="eyebrow">Event details</p><h2>${selectedCalendarEvent ? selectedCalendarEvent.title : "Calendar event details"}</h2></div><p class="section-copy">${selectedCalendarEvent ? "This panel updates when you choose a different event from the calendar." : "Select an event from the calendar to review the key details without leaving the page."}</p></div>${renderCalendarEventShowcase(selectedCalendarEvent)}</section><section class="section feature-grid"><div class="feature-column"><article class="panel"><div class="panel-heading"><h3>${formatFullDate(selectedDate)}</h3><p>${selectedDateEvents.length ? `${selectedDateEvents.length} event${selectedDateEvents.length === 1 ? "" : "s"} scheduled` : "No events are scheduled for this date yet."}</p></div>${selectedDateEvents.length ? `<div class="detail-stack">${selectedDateEvents.map(renderCalendarExpandableEvent).join("")}</div>` : `<p class="event-description">Choose another day, or ${canSeeOrgChart() ? "use the plus button in the calendar grid to insert a new event on this date." : "check another month for more troop activity."}</p>`}</article></div><div class="feature-column"><article class="panel"><div class="panel-heading"><h3>${formatMonthLabel(selectedMonth)} overview</h3><p>${monthEvents.length} event${monthEvents.length === 1 ? "" : "s"} currently visible this month.</p></div><div class="detail-stack">${monthEvents.map(renderCalendarExpandableEvent).join("") || `<article class="month-summary-card"><p class="event-description">No events are loaded for this month yet.</p></article>`}</div></article></div></section>`;
  flushSelectedCalendarEventScroll();
}
function renderEventRoute(eventId) {
  const event = getEventById(eventId);
  if (!event) { renderNotFound(); return; }
  eventEditorSaveStatus = "saved";
  const visitorView = !canSeeOrgChart();
  const gallery = getDisplayMediaItems(event);
  const audienceOptions = eventAudienceOptions.includes(event.audience) ? eventAudienceOptions : [...eventAudienceOptions, event.audience].filter(Boolean);
  const monthlyPattern = event.repeatMonthlyPattern || "date";
  const monthlyOrdinal = event.repeatMonthlyOrdinal || "third";
  const monthlyWeekday = event.repeatMonthlyWeekday || "monday";
  const repeatSummary = formatRepeatSummary(event);
  const repeatUntilValue = formatDateTimeLocalValue(event.repeatUntil);
  const startValue = formatDateTimeLocalValue(event.startDate);
  const endValue = formatDateTimeLocalValue(event.endDate || event.startDate);
  const activities = event.activities || [];
  const activitiesMarkup = activities.length ? activities.map((activity, index) => {
    const activityStart = formatDateTimeLocalValue(activity.startDate);
    const activityEnd = formatDateTimeLocalValue(activity.endDate || activity.startDate);
    return `<article class="month-summary-card"><div class="panel-heading"><h3>${visitorView ? (activity.description || `Activity ${index + 1}`) : `Activity ${index + 1}`}</h3>${!visitorView ? `<button class="icon-button" type="button" data-remove-activity="${activity.id}" aria-label="Remove activity ${index + 1}">&times;</button>` : ""}</div>${visitorView ? `<p class="event-description">${activity.description || "No activity description yet."}</p><ul class="detail-list"><li>Location: ${activity.location || "Location TBD"}</li><li>Starts: ${formatExactEventDateTime(activity.startDate)}</li><li>Ends: ${formatExactEventDateTime(activity.endDate || activity.startDate)}</li></ul>` : `<div class="table-wrap"><table class="data-table compact"><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody><tr><td>Description</td><td><input type="text" data-activity-description="${activity.id}" value="${activity.description}" aria-label="Activity description" /></td></tr><tr><td>Location</td><td><input type="text" data-activity-location="${activity.id}" value="${activity.location}" aria-label="Activity location" /></td></tr><tr><td>Start</td><td><input type="datetime-local" data-activity-start="${activity.id}" value="${activityStart}" aria-label="Activity start date and time" /></td></tr><tr><td>End</td><td><input type="datetime-local" data-activity-end="${activity.id}" value="${activityEnd}" aria-label="Activity end date and time" /></td></tr></tbody></table></div>`}</article>`;
  }).join("") : `<article class="month-summary-card"><p class="event-description">${visitorView ? "No activities are listed for this event yet." : "No activities yet. Use Add activity to create the first one."}</p></article>`;
  const repeatRows = event.repeatEnabled ? `<tr><td>Repeat frequency</td><td><select data-event-edit-repeat-frequency aria-label="Event repeat frequency"><option value="daily"${event.repeatFrequency === "daily" ? " selected" : ""}>Daily</option><option value="weekly"${event.repeatFrequency === "weekly" ? " selected" : ""}>Weekly</option><option value="monthly"${event.repeatFrequency === "monthly" ? " selected" : ""}>Monthly</option></select></td></tr><tr><td>Repeat interval</td><td><input type="number" min="1" step="1" data-event-edit-repeat-interval value="${event.repeatInterval || 1}" aria-label="Repeat every number of intervals" /></td></tr><tr><td>Monthly repeat rule</td><td><select data-event-edit-repeat-monthly-pattern aria-label="Monthly repeat pattern"><option value="date"${monthlyPattern === "date" ? " selected" : ""}>Same date each month</option><option value="nth-weekday"${monthlyPattern === "nth-weekday" ? " selected" : ""}>Nth weekday of the month</option></select></td></tr><tr><td>Monthly ordinal</td><td><select data-event-edit-repeat-monthly-ordinal aria-label="Monthly repeat ordinal"><option value="first"${monthlyOrdinal === "first" ? " selected" : ""}>First</option><option value="second"${monthlyOrdinal === "second" ? " selected" : ""}>Second</option><option value="third"${monthlyOrdinal === "third" ? " selected" : ""}>Third</option><option value="fourth"${monthlyOrdinal === "fourth" ? " selected" : ""}>Fourth</option><option value="last"${monthlyOrdinal === "last" ? " selected" : ""}>Last</option></select></td></tr><tr><td>Monthly weekday</td><td><select data-event-edit-repeat-monthly-weekday aria-label="Monthly repeat weekday"><option value="sunday"${monthlyWeekday === "sunday" ? " selected" : ""}>Sunday</option><option value="monday"${monthlyWeekday === "monday" ? " selected" : ""}>Monday</option><option value="tuesday"${monthlyWeekday === "tuesday" ? " selected" : ""}>Tuesday</option><option value="wednesday"${monthlyWeekday === "wednesday" ? " selected" : ""}>Wednesday</option><option value="thursday"${monthlyWeekday === "thursday" ? " selected" : ""}>Thursday</option><option value="friday"${monthlyWeekday === "friday" ? " selected" : ""}>Friday</option><option value="saturday"${monthlyWeekday === "saturday" ? " selected" : ""}>Saturday</option></select></td></tr><tr><td>Repeat until</td><td><input type="datetime-local" data-event-edit-repeat-until value="${repeatUntilValue}" aria-label="Repeat until date and time" /></td></tr>` : "";
  app.innerHTML = `${topNav()}<section class="event-route-hero"><div class="event-route-copy"><p class="eyebrow">${visitorView ? "Event details" : "Edit event"}</p><h2>${event.title}</h2><p class="intro compact">${visitorView ? "Public and non-adult-leader viewers see the full event story, home base, activities, and gallery here." : "Adult leaders can edit the event details, home base, activities, add images or videos, copy the event into a new future draft, or remove it when it should no longer appear on the calendar."}</p><div class="event-meta"><span>${event.category}</span><span>${event.dateLabel}</span><span>${event.homeBase || "Home base TBD"}</span>${event.repeatEnabled ? `<span>${repeatSummary}</span>` : ""}</div></div><div class="status-chip"><span>Route</span><strong>/events/${event.id}</strong></div></section>${visitorView ? `<section class="section event-route-grid"><article class="panel event-story"><div class="panel-heading"><h3>${event.title}</h3><p>${event.description}</p></div><div class="event-meta"><span>${event.audience}</span><span>${event.dateLabel}</span>${event.repeatEnabled ? `<span>${repeatSummary}</span>` : ""}</div><ul class="detail-list"><li>Location from where all activities will start: ${event.homeBase || "Home base TBD"}</li><li>Event starts: ${formatExactEventDateTime(event.startDate)}</li><li>Event ends: ${formatExactEventDateTime(event.endDate || event.startDate)}</li>${event.repeatEnabled ? `<li>${repeatSummary}</li>` : ""}</ul><div class="detail-note">${event.detailNote}</div></article><article class="panel map-panel"><div class="panel-heading"><h3>Home base</h3><p>Location from where all activities will start</p></div><iframe class="event-map" src="${mapUrlForLocation(event.homeBase || "")}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Map for ${event.homeBase || "home base"}"></iframe></article></section><section class="section"><div class="section-heading"><div><p class="eyebrow">Activities</p><h2>Event activity list</h2></div><p class="section-copy">Each activity can have its own location and start/end time.</p></div><div class="detail-stack">${activitiesMarkup}</div></section><section class="section"><div class="section-heading"><div><p class="eyebrow">Gallery</p><h2>Event media</h2></div><p class="section-copy">Each image or video can carry its own caption, comments, and reactions.</p></div><div class="event-gallery-grid">${gallery.map((image, index) => renderGalleryImageCard(event, image, index, false)).join("")}</div></section>` : `<section class="section event-route-grid"><article class="panel"><div class="panel-heading"><h3 class="event-content-heading"><span>Event content</span><span class="event-save-status" data-event-save-status="${eventEditorSaveStatus}">${eventEditorStatusLabel()}</span></h3><p>Changes save automatically after 0.5 seconds of inactivity.</p></div><div class="table-wrap"><table class="data-table compact"><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody><tr><td>Title</td><td><input type="text" data-event-edit-title value="${event.title}" aria-label="Event title" /></td></tr><tr><td>Category</td><td><input type="text" data-event-edit-category value="${event.category}" aria-label="Event category" /></td></tr><tr><td>Start</td><td><input type="datetime-local" data-event-edit-start value="${startValue}" aria-label="Event start date and time" /></td></tr><tr><td>End</td><td><input type="datetime-local" data-event-edit-end value="${endValue}" aria-label="Event end date and time" /></td></tr><tr><td>Home base</td><td><input type="text" data-event-edit-home-base value="${event.homeBase || ""}" aria-label="Location from where all activities will start" title="Location from where all activities will start" /></td></tr><tr><td>Audience</td><td><select data-event-edit-audience aria-label="Event audience">${audienceOptions.map((audience) => `<option value="${audience}"${audience === event.audience ? " selected" : ""}>${audience}</option>`).join("")}</select></td></tr><tr><td>Description</td><td><textarea data-event-edit-description aria-label="Event description">${event.description}</textarea></td></tr><tr><td>Detail note</td><td><textarea data-event-edit-note aria-label="Event detail note">${event.detailNote}</textarea></td></tr><tr><td>Upcoming</td><td><select data-event-edit-upcoming aria-label="Event upcoming status"><option value="true"${event.upcoming ? " selected" : ""}>Upcoming</option><option value="false"${!event.upcoming ? " selected" : ""}>Recent / past</option></select></td></tr><tr><td>Repeatable</td><td><select data-event-edit-repeat-enabled aria-label="Whether this event repeats"><option value="false"${!event.repeatEnabled ? " selected" : ""}>No</option><option value="true"${event.repeatEnabled ? " selected" : ""}>Yes</option></select></td></tr>${repeatRows}</tbody></table></div><div class="event-editor-actions"><button class="button secondary" type="button" data-add-activity="${event.id}">Add activity</button><button class="button secondary" type="button" data-copy-event="${event.id}">Copy as new event</button><button class="button danger" type="button" data-delete-event="${event.id}">Remove event</button></div></article><article class="panel"><div class="panel-heading"><h3>Visitor gallery</h3><p>Upload one or more image or video files at once. Items are stored oldest to newest by upload time; the selected primary item still displays first.</p></div><label class="button secondary upload-button"><input class="visually-hidden-file-input" type="file" data-event-image-upload accept="image/*,video/*" multiple />Upload media</label><div class="event-gallery-grid">${gallery.map((image, index) => renderGalleryImageCard(event, image, index, true)).join("")}</div></article></section><section class="section"><div class="panel map-panel"><div class="panel-heading"><h3>Home base map preview</h3><p>Location from where all activities will start</p></div><iframe class="event-map" src="${mapUrlForLocation(event.homeBase || "")}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Map for ${event.homeBase || "home base"}"></iframe></div></section><section class="section"><div class="section-heading"><div><p class="eyebrow">Activities</p><h2>Edit event activities</h2></div><p class="section-copy">Each activity can have its own description, location, and start/end date and time.</p></div><div class="detail-stack">${activitiesMarkup}</div></section>`}`;
}
function renderScribeIndex() { if (canSeeOrgChart()) { app.innerHTML = `${topNav()}<section class="dashboard-banner"><div><p class="eyebrow">Scribe attendance</p><h2>Adult leader attendance spreadsheet</h2><p class="intro compact">This view shows all scouts in the first column and meeting dates across the top, with the most recent meeting on the far right.</p></div><div class="status-chip"><span>Route</span><strong>/scribe/attendance</strong></div></section>${renderAdultLeaderAttendanceMatrix()}<section class="section dashboard-grid"><article class="panel"><div class="panel-heading"><h3>Attendance routes</h3><p>Additional attendance workflows remain available from here.</p></div><ul class="detail-list"><li><a class="text-link" href="#/scribe/attendance/history">Attendance history</a></li><li><a class="text-link" href="#/scribe/attendance/reports/monthly">Monthly report</a></li><li><a class="text-link" href="#/scribe/attendance/print">Printable attendance sheet</a></li><li><a class="text-link" href="#/scribe/attendance/upload">Upload completed sheet</a></li></ul></article><article class="panel"><div class="panel-heading"><h3>Roster summary</h3><p>${roster.length} scouts with parents/guardians loaded for review.</p></div><ul class="detail-list"><li>Total scouts: ${roster.length}</li><li>Patrols: ${patrolNames.join(", ")}</li><li>Leadership positions assigned: ${roster.filter((scout) => scout.leadershipRole).length}</li></ul></article></section>`; return; } app.innerHTML = `${topNav()}<section class="dashboard-banner"><div><p class="eyebrow">Scribe attendance</p><h2>Regular meeting attendance workspace</h2><p class="intro compact">This route family models the dedicated Scribe workflow for meeting attendance, print sheets, uploads, history, and monthly reporting.</p></div><div class="status-chip"><span>Route</span><strong>/scribe/attendance</strong></div></section><section class="section dashboard-grid"><article class="panel"><div class="panel-heading"><h3>Route family</h3><p>Available pages in the prototype.</p></div><ul class="detail-list"><li><a class="text-link" href="#/scribe/attendance/event/troop-meeting-stem">Meeting attendance sheet</a></li><li><a class="text-link" href="#/scribe/attendance/print">Printable attendance sheet</a></li><li><a class="text-link" href="#/scribe/attendance/upload">Upload completed sheet</a></li><li><a class="text-link" href="#/scribe/attendance/history">Attendance history</a></li><li><a class="text-link" href="#/scribe/attendance/reports/monthly">Monthly report</a></li></ul></article><article class="panel"><div class="panel-heading"><h3>Roster summary</h3><p>${roster.length} scouts with parents/guardians loaded for review.</p></div><ul class="detail-list"><li>Total scouts: ${roster.length}</li><li>Patrols: ${patrolNames.join(", ")}</li><li>Leadership positions assigned: ${roster.filter((scout) => scout.leadershipRole).length}</li></ul></article><article class="panel"><div class="panel-heading"><h3>Current meeting</h3><p>Sample attendance event.</p></div><ul class="detail-list"><li>Event: Regular Meeting: STEM Challenge Night</li><li>Date: Apr 8, 2026</li><li>Statuses: Present / Absent</li></ul></article></section>`; }
function renderScribeEvent() { app.innerHTML = `${topNav()}<section class="section-heading"><div><p class="eyebrow">Scribe attendance</p><h2>Regular Meeting: STEM Challenge Night</h2></div><p class="section-copy">Scouts grouped by patrol with Unassigned support available when needed.</p></section><div class="scribe-actions"><a class="button secondary" href="#/scribe/attendance/print">Print sheet</a><a class="button secondary" href="#/scribe/attendance/upload">Upload completed sheet</a><a class="button secondary" href="#/scribe/attendance/history">View history</a></div>${groupedByPatrol.map((group) => `<section class="section"><div class="panel"><div class="panel-heading"><h3>${getPatrolDisplayName(group.name)}${group.name ? " Patrol" : ""}</h3><p>${group.scouts.length} scouts</p></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Scout</th><th>Gender</th><th>Rank</th><th>Leadership</th><th>Attendance</th><th>Contacts</th></tr></thead><tbody>${group.scouts.map((scout) => `<tr><td>${renderScoutName(scout, { className: "text-link" })}</td><td>${scout.gender}</td><td>${scout.rank}</td><td>${scout.leadershipRole || "-"}</td><td><span class="attendance-badge ${scout.attendance === "Present" ? "present" : "absent"}">${scout.attendance}</span></td><td>${scout.parents.map((parent) => `${parent.relationship}: ${parent.name}`).join("<br />")}</td></tr>`).join("")}</tbody></table></div></div></section>`).join("")}`; }
function renderScribePrint() { app.innerHTML = `${topNav()}<section class="dashboard-banner"><div><p class="eyebrow">Scribe print view</p><h2>Printable attendance sheet</h2><p class="intro compact">A simple meeting-date roster grouped by patrol with a check-in or initials column.</p></div><div class="status-chip"><span>Route</span><strong>/scribe/attendance/:eventId/print</strong></div></section>${groupedByPatrol.map((group) => `<section class="section"><div class="panel print-sheet"><div class="panel-heading"><h3>${getPatrolDisplayName(group.name)}${group.name ? " Patrol" : ""}</h3><p>Meeting date: Apr 8, 2026</p></div><div class="table-wrap"><table class="data-table compact"><thead><tr><th>Name</th><th>Leadership</th><th>Initials / Check-in</th></tr></thead><tbody>${group.scouts.map((scout) => `<tr><td>${renderScoutName(scout, { className: "text-link" })}</td><td>${scout.leadershipRole || "-"}</td><td class="blank-cell"></td></tr>`).join("")}</tbody></table></div></div></section>`).join("")}`; }
function renderScribeUpload() { app.innerHTML = `${topNav()}<section class="dashboard-banner"><div><p class="eyebrow">Scribe upload</p><h2>Upload completed attendance sheets</h2><p class="intro compact">Prototype workflow: upload sheet, parse initials/checkmarks, review matches, then confirm save.</p></div><div class="status-chip"><span>Route</span><strong>/scribe/attendance/:eventId/upload</strong></div></section><section class="section dashboard-grid"><article class="panel"><div class="panel-heading"><h3>Workflow</h3><p>Recommended MVP review flow.</p></div><ol class="detail-list"><li>Upload one or more completed attendance sheets</li><li>Parse initials and checkmarks</li><li>Review proposed matches against scouts</li><li>Confirm final save</li></ol></article><article class="panel"><div class="panel-heading"><h3>Sample parsed rows</h3><p>Preview of a manual review screen.</p></div><ul class="detail-list"><li>Aiden Carter -> Present</li><li>Maya Thompson -> Present</li><li>Ezra Peterson -> Absent</li><li>Quinn Foster -> Present</li></ul></article></section>`; }
function renderScribeHistory() { app.innerHTML = `${topNav()}<section class="dashboard-banner"><div><p class="eyebrow">Scribe history</p><h2>Attendance history visibility</h2><p class="intro compact">History is visible to the Scribe, Adult Scout Leaders, and Administrators. Click a month to expand a tree view of that month’s attendance items, then open an item to see the full attendance details.</p></div><div class="status-chip"><span>Route</span><strong>/scribe/attendance/history</strong></div></section><section class="section"><div class="table-wrap"><table class="data-table history-table"><thead><tr><th>Month</th><th>Present</th><th>Absent</th><th>Visible to</th></tr></thead><tbody>${attendanceHistory.map((row) => `${`<tr class="history-month-row" data-toggle-attendance-month="${row.id}"><td><span class="tree-toggle">${expandedAttendanceMonths.has(row.id) ? "&#9662;" : "&#9656;"}</span>${row.month}</td><td>${row.present}</td><td>${row.absent}</td><td>Scribe, Adult Scout Leaders, Administrators</td></tr>`}${expandedAttendanceMonths.has(row.id) ? row.items.map((item) => `<tr class="history-child-row"><td colspan="4"><a class="history-item-tree" href="#/scribe/attendance/history/item/${item.id}"><span class="tree-branch">&#9492;</span><span><strong>${item.title}</strong><small>${item.dateLabel} • Present: ${item.present} • Absent: ${item.absent}</small></span></a></td></tr>`).join("") : ""}`).join("")}</tbody></table></div></section>`; }
function renderScribeHistoryItem(itemId) { const item = getAttendanceHistoryItem(itemId); if (!item) { renderNotFound(); return; } app.innerHTML = `${topNav()}<section class="dashboard-banner"><div><p class="eyebrow">Attendance item</p><h2>${item.title}</h2><p class="intro compact">Detailed attendance view for the selected item in ${item.month}.</p></div><div class="status-chip"><span>Route</span><strong>/scribe/attendance/history/item/${item.id}</strong></div></section><div class="scribe-actions"><a class="button secondary" href="#/scribe/attendance/history">Back to history</a>${item.eventId ? `<a class="button secondary" href="#/events/${item.eventId}">Open event page</a>` : ""}</div><section class="section dashboard-grid"><article class="panel"><div class="panel-heading"><h3>Attendance summary</h3><p>${item.dateLabel}</p></div><ul class="detail-list"><li>Present: ${item.present}</li><li>Absent: ${item.absent}</li><li>Month: ${item.month}</li></ul></article><article class="panel"><div class="panel-heading"><h3>Visibility</h3><p>Who can view this attendance item.</p></div><ul class="detail-list"><li>Scribe</li><li>Adult Scout Leaders</li><li>Administrators</li></ul></article></section>${renderAttendanceRowsForItem(item)}`; }
function renderScribeMonthly() { app.innerHTML = `${topNav()}<section class="dashboard-banner"><div><p class="eyebrow">Monthly report</p><h2>Regular meeting attendance by month</h2><p class="intro compact">Current members only, grouped by current patrol membership, with patrol-less scouts appearing in Unassigned when needed.</p></div><div class="status-chip"><span>Route</span><strong>/scribe/attendance/reports/monthly</strong></div></section><section class="section dashboard-grid">${attendanceHistory.map((row) => `<article class="panel"><div class="panel-heading"><h3>${row.month}</h3><p>Org-chart grouped attendance snapshot</p></div><ul class="detail-list"><li>Present: ${row.present}</li><li>Absent: ${row.absent}</li><li>Current members only</li></ul></article>`).join("")}</section><section class="section"><div class="panel"><div class="panel-heading"><h3>Loaded scout roster</h3><p>${roster.length} scouts with linked parent/guardian contacts and leadership assignments.</p></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Scout</th><th>Patrol</th><th>Gender</th><th>Rank</th><th>Leadership</th><th>Parent / Guardian 1</th><th>Parent / Guardian 2</th></tr></thead><tbody>${roster.map((scout) => `<tr><td>${renderScoutName(scout, { className: "text-link" })}</td><td>${getPatrolDisplayName(scout.patrol)}</td><td>${scout.gender}</td><td>${scout.rank}</td><td>${scout.leadershipRole || "-"}</td><td>${scout.parents[0]?.name || "-"}</td><td>${scout.parents[1]?.name || "-"}</td></tr>`).join("")}</tbody></table></div></div></section>`; }
function renderOrgChart() { if (!canSeeOrgChart()) { return renderAccessDenied(); } const troopYouthMembers = getTroopYouthLeadershipMembers(); const patrolLeadershipGroups = getPatrolLeadershipGroups(); app.innerHTML = `${topNav()}<section class="dashboard-banner"><div><p class="eyebrow">Org chart</p><h2>Troop 883 leadership structure</h2><p class="intro compact">Adult leaders can review both the youth leadership chain and the adult leadership/committee structure from one route.</p></div><div class="status-chip"><span>Route</span><strong>/org-chart</strong></div></section><section class="section dashboard-grid"><article class="panel"><div class="panel-heading"><h3>Edit org chart</h3><p>Manage leadership assignments from dedicated edit routes.</p></div><div class="scribe-actions"><a class="button secondary" href="#/org-chart/edit-scouts">Edit scout org chart</a><a class="button secondary" href="#/org-chart/edit-adults">Edit adult org chart</a></div></article></section><section class="section"><div class="section-heading"><div><p class="eyebrow">Scout leadership</p><h2>Youth leadership org chart</h2></div><p class="section-copy">Patrol leaders and troop youth officers are assigned from the active scout roster.</p></div><div class="org-grid scout-org-grid"><article class="panel"><div class="panel-heading"><h3>Troop youth leadership</h3><p>${troopYouthMembers.length} assigned scouts in leadership order.</p></div><div class="org-stack troop-leadership-stack">${troopYouthMembers.map(renderTroopYouthLeadershipCard).join("")}</div></article><article class="panel"><div class="panel-heading"><h3>Patrol leadership</h3><p>${patrolLeadershipGroups.length} patrol leadership teams grouped by patch.</p></div><div class="patrol-leadership-grid">${patrolLeadershipGroups.map(renderPatrolLeadershipCard).join("")}</div></article></div></section><section class="section"><div class="section-heading"><div><p class="eyebrow">Adult leadership</p><h2>Adult org chart</h2></div><p class="section-copy">Adult positions include program-side and committee-side reporting lines, with role emblems shown beside each leader.</p></div><div class="org-grid"><article class="panel"><div class="panel-heading"><h3>Program leadership</h3><p>Scout-facing adult leaders</p></div><div class="org-stack">${adultLeaders.filter((leader) => ["Scoutmaster", "Assistant Scoutmaster"].includes(leader.role)).map((leader) => `<div class="org-card"><strong>${leader.role}</strong>${renderAdultLeaderIdentity(leader)}<small>Reports to: ${defaultReportsTo(leader.role)}</small></div>`).join("")}</div></article><article class="panel"><div class="panel-heading"><h3>Committee leadership</h3><p>Administrative and support roles</p></div><div class="org-stack">${adultLeaders.filter((leader) => !["Scoutmaster", "Assistant Scoutmaster"].includes(leader.role)).map((leader) => `<div class="org-card"><strong>${leader.role}</strong>${renderAdultLeaderIdentity(leader)}<small>Reports to: ${defaultReportsTo(leader.role)}</small></div>`).join("")}</div></article></div></section>`; }
function renderAdultOrgChartEditor() { if (!canSeeOrgChart()) { return renderAccessDenied(); } const availableAdults = getAvailableAdultsForLeadership(); app.innerHTML = `${topNav()}<section class="dashboard-banner"><div><p class="eyebrow">Edit adult org chart</p><h2>Adult leadership assignments</h2><p class="intro compact">Adult assignments save back to CSV when a control loses focus or an add/remove action is completed.</p></div><div class="status-chip"><span>Route</span><strong>/org-chart/edit-adults</strong></div></section><section class="section dashboard-grid"><article class="panel"><div class="panel-heading"><h3>Current adult assignments</h3><p>The Adult column opens the linked adult record in a new tab. The Current role dropdown saves on blur. Use the plus icon to add another adult leader from saved adults, or type a brand-new adult name.</p></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Adult</th><th>Current role</th><th>Remove</th></tr></thead><tbody>${adultLeaders.map((leader, index) => `<tr><td>${renderAdultLeaderLink(leader)}</td><td><select data-adult-role-index="${index}" aria-label="Change role for ${leader.name}">${adultRoleOptions.map((role) => `<option value="${role}"${role === leader.role ? " selected" : ""}>${role}</option>`).join("")}</select></td><td><button class="icon-button" data-remove-adult-index="${index}" type="button" aria-label="Remove ${leader.name} from adult leaders">&times;</button></td></tr>`).join("")}${showAddAdultRow ? `<tr><td><span class="leader-identity"><img class="leader-emblem" src="${scoutOrgLogo}" alt="Scout.org logo" /><input type="text" data-add-adult-input list="available-adult-options" placeholder="Start typing an adult name" aria-label="Choose or enter adult leader" /><datalist id="available-adult-options">${availableAdults.map((adult) => `<option value="${adult.name}"></option>`).join("")}</datalist></span></td><td><select data-add-adult-role aria-label="Choose role for new adult leader">${adultRoleOptions.map((role) => `<option value="${role}"${role === "Committee Member" ? " selected" : ""}>${role}</option>`).join("")}</select></td><td><button class="icon-button add" data-cancel-add-adult type="button" aria-label="Cancel adding adult leader">&times;</button></td></tr>` : `<tr><td><button class="icon-button add" data-show-add-adult type="button" aria-label="Add adult leader">+</button></td><td colspan="2">Add adult leader from saved adults or type a new adult name</td></tr>`}</tbody></table></div></article></section><section class="section"><div class="panel"><div class="panel-heading"><h3>Add new adult</h3><p>New adults are saved to the master adult list so they can later be selected as parents/guardians or adult leaders.</p></div><div class="table-wrap"><table class="data-table compact"><thead><tr><th>Name</th><th>Relationship</th><th>Email</th><th>Home phone</th><th>Cell phone</th><th>Add</th></tr></thead><tbody><tr><td><input type="text" data-new-adult-name placeholder="Adult name" /></td><td><select data-new-adult-relationship><option value="Adult leader">Adult leader</option><option value="Parent">Parent</option><option value="Guardian">Guardian</option><option value="Committee Member">Committee Member</option></select></td><td><input type="email" data-new-adult-email placeholder="adult@example.com" /></td><td><input type="tel" data-new-adult-home-phone placeholder="Home phone" /></td><td><input type="tel" data-new-adult-cell-phone placeholder="Cell phone" /></td><td><button class="icon-button add" data-save-new-adult type="button" aria-label="Save new adult">+</button></td></tr></tbody></table></div><p class="section-copy">Saved adults: ${getSavedAdultPeople().map((adult) => adult.name).join(", ")}</p></div></section>`; }
function renderAdultsRoute(routeLabel = "/adults") {
  if (!canSeeOrgChart()) { return renderAccessDenied(); }
  const sortedAdults = getSavedAdultPeople();
  app.innerHTML = `${topNav()}<section class="dashboard-banner"><div><p class="eyebrow">Adults</p><h2>Adult records</h2><p class="intro compact">Adult leaders can review every adult, open their editable record, manage linked children, and assign a leadership position.</p></div><div class="status-chip"><span>Route</span><strong>${routeLabel}</strong></div></section><section class="section"><div class="section-heading"><div><p class="eyebrow">Directory</p><h2>All adults</h2></div><div class="scribe-actions"><a class="button secondary" href="#/org-chart/edit-adults">Add adult leader</a></div></div><div class="panel"><div class="panel-heading"><h3>${sortedAdults.length} adult records</h3><p>Open any adult to edit contact information, linked scouts, and leadership assignment.</p></div><div class="table-wrap"><table class="data-table adult-directory-table"><thead><tr><th aria-label="Actions"></th><th>Adult</th><th>Contact</th><th>Leadership position</th><th>Children</th></tr></thead><tbody>${sortedAdults.map((adult) => { const leaderAssignment = getAdultLeaderAssignment(adult.id); const linkedScouts = getScoutsForAdult(adult); const phoneNumbers = [[adult.homePhone, "(h)"], [adult.cellPhone, "(m)"]].filter(([phone]) => phone).map(([phone, label]) => `${phone} ${label}`).join(" "); return `<tr><td>${renderAdultDirectoryActionCell(adult, leaderAssignment)}</td><td><a class="text-link" href="#/adults/${adult.id}">${adult.name}</a></td><td><div class="contact-stack"><span>${adult.email || "-"}</span><span>${phoneNumbers || "-"}</span></div></td><td>${leaderAssignment?.role || "Not assigned"}</td><td>${linkedScouts.length ? `<div class="adult-children-list compact">${linkedScouts.map((scout) => `<span class="child-chip">${renderScoutName(scout, { className: "text-link" })}</span>`).join("")}</div>` : "No linked scouts"}</td></tr>`; }).join("")}</tbody></table></div></div></section>`;
}
function renderAdultRecordEditor(adultId) { const adult = adults.find((entry) => entry.id === adultId); if (!adult) { renderNotFound(); return; } const leaderAssignment = getAdultLeaderAssignment(adult.id); const linkedScouts = getScoutsForAdult(adult); const availableScouts = getAvailableScoutsForAdult(adult); app.innerHTML = `${topNav()}<section class="dashboard-banner"><div><p class="eyebrow">Adult record</p><h2>${adult.name}</h2><p class="intro compact">Update the adult record here. Changes save back to the master adults list when a field loses focus.</p></div><div class="status-chip"><span>Route</span><strong>/adults/${adult.id}</strong></div></section><section class="section"><div class="panel"><div class="panel-heading"><h3>Adult details</h3><p>This record is linked to leadership assignments, parent/guardian references, and future troop access decisions.</p></div><div class="table-wrap"><table class="data-table compact"><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody><tr><td>Name</td><td><input type="text" data-adult-edit-name value="${adult.name}" aria-label="Adult name" /></td></tr><tr><td>Email</td><td><input type="email" data-adult-edit-email value="${adult.email}" aria-label="Adult email" /></td></tr><tr><td>Home phone</td><td><input type="tel" data-adult-edit-home-phone value="${adult.homePhone || ""}" aria-label="Adult home phone number" /></td></tr><tr><td>Cell phone</td><td><input type="tel" data-adult-edit-cell-phone value="${adult.cellPhone || ""}" aria-label="Adult cell phone number" /></td></tr><tr><td>Adult leader position</td><td>${canSeeOrgChart() ? `<select data-adult-edit-role aria-label="Adult leader position"><option value="">Not assigned</option>${adultRoleOptions.map((role) => `<option value="${role}"${leaderAssignment?.role === role ? " selected" : ""}>${role}</option>`).join("")}</select>` : `${leaderAssignment?.role || "Not assigned"}`}</td></tr><tr><td>Children</td><td>${linkedScouts.length ? `<div class="adult-children-list">${linkedScouts.map((scout) => `<span class="child-chip">${renderScoutName(scout)}${canSeeOrgChart() ? ` <button class="icon-button mini" data-remove-child-scout="${scout.id}" type="button" aria-label="Remove ${scout.name} from ${adult.name}'s children">&times;</button>` : ""}</span>`).join("")}</div>` : `No linked scouts`}${canSeeOrgChart() ? `<div class="adult-child-add"><select data-add-child-scout aria-label="Select scout to add as child"><option value="">Select scout</option>${availableScouts.map((scout) => `<option value="${scout.id}">${scout.name}</option>`).join("")}</select><button class="icon-button add" data-save-child-link type="button" aria-label="Add selected scout as child">+</button></div>` : ""}</td></tr></tbody></table></div></div></section>`; }
function renderHolidayRows() {
  const sortedHolidays = getSortedHolidays();
  if (!sortedHolidays.length) {
    return `<tr><td colspan="6">No holiday blackout dates are stored yet.</td></tr>`;
  }
  return sortedHolidays.map((holiday) => `<tr><td><a class="text-link" href="#/holidays/${holiday.id}">${holiday.name}</a></td><td>${formatHolidayDateRange(holiday)}</td><td>${holiday.placedBy || "-"}</td><td>${holiday.role || "-"}</td><td>${holiday.note || "-"}</td><td><div class="table-action-row"><a class="text-link" href="#/holidays/${holiday.id}">View</a>${canSeeOrgChart() ? `<button class="icon-button mini" data-delete-holiday="${holiday.id}" type="button" aria-label="Remove ${holiday.name}">&times;</button>` : ""}</div></td></tr>`).join("");
}
function renderHolidaysRoute() {
  const sortedHolidays = getSortedHolidays();
  app.innerHTML = `${topNav()}<section class="dashboard-banner"><div><p class="eyebrow">Holidays</p><h2>Holiday blackout dates</h2><p class="intro compact">Custom holidays and closure dates mark days when scouting events should not be scheduled.</p></div><div class="status-chip"><span>Route</span><strong>/holidays</strong></div></section><section class="section"><div class="section-heading"><div><p class="eyebrow">Custom holiday table</p><h2>${sortedHolidays.length} stored blackout date${sortedHolidays.length === 1 ? "" : "s"}</h2></div>${canSeeOrgChart() ? `<div class="scribe-actions"><a class="button secondary" href="#/holidays/new">Add custom holiday</a></div>` : ""}</div><div class="panel"><div class="panel-heading"><h3>Dates without scouting events</h3><p>${canSeeOrgChart() ? "Use this list to keep holidays and other custom no-event dates visible to adult schedulers." : "Sign in as an adult leader or administrator to add, edit, or remove blackout dates."}</p></div><div class="table-wrap"><table class="data-table holiday-table"><thead><tr><th>Holiday</th><th>Date range</th><th>Placed by</th><th>Role</th><th>Note</th><th>Actions</th></tr></thead><tbody>${renderHolidayRows()}</tbody></table></div></div></section>`;
}
function renderHolidayEditor(holidayId) {
  const isNew = holidayId === "new";
  if (isNew && !canSeeOrgChart()) { return renderAccessDenied(); }
  const holiday = isNew ? normalizeHoliday({ id: nextHolidayId(), date: getTodayDateKey(), endDate: getTodayDateKey(), role: modeSelect.value === "admin" ? "Administrator" : "Adult leader" }) : getHolidayById(holidayId);
  if (!holiday) { renderNotFound(); return; }
  const canManage = canSeeOrgChart();
  app.innerHTML = `${topNav()}<section class="dashboard-banner"><div><p class="eyebrow">Holiday record</p><h2>${isNew ? "Add custom holiday" : holiday.name}</h2><p class="intro compact">These blackout dates are intended for days when troop events should not be created.</p></div><div class="status-chip"><span>Route</span><strong>/holidays/${isNew ? "new" : holiday.id}</strong></div></section><section class="section"><div class="panel"><div class="panel-heading"><h3>${isNew ? "New holiday" : "Holiday details"}</h3><p>${canManage ? (isNew ? "Enter the custom holiday details, then save it to the holiday table." : "Edit the holiday details, or remove this blackout date from the table.") : "Sign in as an adult leader or administrator to edit this blackout date."}</p></div><div class="table-wrap"><table class="data-table compact"><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody><tr><td>Name</td><td>${canManage ? `<input type="text" data-holiday-name value="${holiday.name}" aria-label="Holiday name" />` : holiday.name}</td></tr><tr><td>Start date</td><td>${canManage ? `<input type="date" data-holiday-date value="${holiday.date}" aria-label="Holiday start date" />` : formatFullDate(holiday.date)}</td></tr><tr><td>End date</td><td>${canManage ? `<input type="date" data-holiday-end-date value="${holiday.endDate || holiday.date}" aria-label="Holiday end date" />` : formatFullDate(holiday.endDate || holiday.date)}</td></tr><tr><td>Placed by</td><td>${canManage ? `<input type="text" data-holiday-placed-by value="${holiday.placedBy}" placeholder="Adult leader or administrator name" aria-label="Placed by" />` : (holiday.placedBy || "-")}</td></tr><tr><td>Role</td><td>${canManage ? `<select data-holiday-role aria-label="Holiday placer role"><option value="Adult leader"${holiday.role === "Adult leader" ? " selected" : ""}>Adult leader</option><option value="Administrator"${holiday.role === "Administrator" ? " selected" : ""}>Administrator</option></select>` : (holiday.role || "-")}</td></tr><tr><td>Note</td><td>${canManage ? `<textarea data-holiday-note aria-label="Holiday note">${holiday.note}</textarea>` : (holiday.note || "-")}</td></tr></tbody></table></div><div class="holiday-editor-actions"><a class="button secondary" href="#/holidays">Back to holidays</a>${canManage ? `<button class="button primary" data-save-holiday="${holiday.id}" data-holiday-new="${isNew}" type="button">Save holiday</button>${isNew ? "" : `<button class="button danger" data-delete-holiday="${holiday.id}" type="button">Remove holiday</button>`}` : ""}</div></div></section>`;
}
function renderScoutOrgChartEditor() { if (!canEditScouts()) { return renderAccessDenied(); } app.innerHTML = `${topNav()}<section class="dashboard-banner"><div><p class="eyebrow">Edit scout org chart</p><h2>Scout leadership assignments</h2><p class="intro compact">This editor route is limited to adult leaders and administrators and is the entry point for changing patrol and youth leadership assignments.</p></div><div class="status-chip"><span>Route</span><strong>/org-chart/edit-scouts</strong></div></section><section class="section dashboard-grid"><article class="panel"><div class="panel-heading"><h3>Linked parents and guardians</h3><p>Scout records pull parent and guardian links from the separate relationship list, so edits stay available from either the adult or scout side.</p></div><div class="table-wrap"><table class="data-table compact"><thead><tr><th>Saved parent/guardian</th><th>Relationship</th><th>Email</th></tr></thead><tbody>${savedParentGuardians.map((parent) => `<tr><td>${parent.name}</td><td>${parent.relationship}</td><td>${parent.email}</td></tr>`).join("")}</tbody></table></div></article></section><section class="section"><div class="panel"><div class="panel-heading"><h3>Current scout assignments</h3><p>Select any scout to edit patrol, patrol badge association, and leadership role.</p></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Scout</th><th>Parents</th><th>Patrol</th><th>Current role</th><th>Badge</th></tr></thead><tbody>${roster.map((scout) => `<tr><td><a class="text-link" href="#/scouts/${scout.id}" target="_blank" rel="noreferrer">${scout.name}</a></td><td>${scout.parents.length ? scout.parents.map((parent) => `${parent.relationship}: ${parent.name}`).join("<br />") : "No linked adults"}</td><td>${getPatrolDisplayName(scout.patrol)}</td><td>${scout.leadershipRole || "Not assigned"}</td><td><span class="leader-identity"><img class="leader-emblem" src="${getPatrolBadgeImage(scout.patrol)}" alt="${getPatrolDisplayName(scout.patrol)} badge" /><span>${scout.patrol ? scout.patrolBadge : unassignedPatrolLabel}</span></span></td></tr>`).join("")}</tbody></table></div></div></section>`; }
function renderScoutRecordEditor(scoutId) {
  const scout = roster.find((entry) => entry.id === scoutId);
  if (!scout) { renderNotFound(); return; }
  if (!canEditScoutRecord(scoutId)) {
    renderFriendlyAccessMessage("Looks like you are flailing a bit. This scout record can only be opened by the matching signed-in scout, a linked parent, an adult leader, or an administrator.");
    return;
  }
  scoutRecordSaveStatus = "saved";
  const editorLabel = canSeeOrgChart()
    ? "Adult leaders and administrators can edit this scout record."
    : modeSelect.value === "parent"
      ? "Linked parents can update this scout record."
      : "The logged-in scout can edit their own record.";
  app.innerHTML = `${topNav()}<section class="dashboard-banner"><div><p class="eyebrow">Scout record</p><h2>${scout.name}</h2><p class="intro compact">${editorLabel} Text fields and selections save on blur.</p></div><div class="status-chip"><span>Route</span><strong>/scouts/${scout.id}</strong></div></section><section class="section"><div class="panel"><div class="panel-heading"><h3 class="record-content-heading"><span>Scout details</span><span class="record-save-status" data-scout-save-status="${scoutRecordSaveStatus}">${scoutRecordStatusLabel()}</span></h3><p>Parents and guardians shown here are sourced from the separate adult-scout relationship file.</p></div><div class="table-wrap"><table class="data-table compact"><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody><tr><td>Avatar</td><td><label class="scout-avatar-editor" aria-label="Change avatar for ${scout.name}"><img class="scout-avatar large" data-scout-avatar-preview src="${getScoutAvatar(scout)}" alt="${scout.name} avatar preview" /><span>Change avatar</span><input class="visually-hidden-file-input" type="file" data-scout-avatar-upload accept="image/*" /></label></td></tr><tr><td>Name</td><td><div class="scout-name-editor"><label><span>First name</span><input type="text" data-scout-edit-first-name value="${getScoutFirstName(scout)}" aria-label="Scout first name" /></label><label><span>Last name</span><input type="text" data-scout-edit-last-name value="${getScoutLastName(scout)}" aria-label="Scout last name" /></label></div></td></tr><tr><td>Nickname</td><td><input type="text" data-scout-edit-nickname value="${getScoutNickname(scout)}" aria-label="Scout nickname" /></td></tr><tr><td>Gender</td><td><select data-scout-edit-gender aria-label="Scout gender"><option value="male"${scout.gender === "male" ? " selected" : ""}>male</option><option value="female"${scout.gender === "female" ? " selected" : ""}>female</option><option value="not specified"${scout.gender === "not specified" ? " selected" : ""}>not specified</option></select></td></tr><tr><td>Rank</td><td><select data-scout-edit-rank aria-label="Scout rank">${scoutRankOptions.map((rank) => `<option value="${rank}"${rank === scout.rank ? " selected" : ""}>${rank}</option>`).join("")}</select></td></tr><tr><td>Parents / guardians</td><td>${scout.parents.length ? scout.parents.map((parent) => `<a class="text-link" href="#/adults/${parent.adultId}" target="_blank" rel="noreferrer">${parent.relationship}: ${parent.name}</a>`).join("<br />") : "No linked adults"}</td></tr><tr><td>Patrol</td><td><div class="scout-patrol-editor"><select data-scout-edit-patrol aria-label="Scout patrol">${getPatrolNameList([], { includeUnassigned: true }).map((patrol) => `<option value="${patrol}"${patrol === scout.patrol ? " selected" : ""}>${getPatrolDisplayName(patrol)}</option>`).join("")}</select><img class="leader-emblem scout-patrol-badge-preview" data-scout-patrol-badge-preview src="${getPatrolBadgeImage(scout.patrol)}" alt="${getPatrolDisplayName(scout.patrol)} badge" /></div></td></tr><tr><td>Leadership position</td><td><select data-scout-edit-role aria-label="Scout leadership position">${scoutLeadershipOptions.map((role) => `<option value="${role}"${role === scout.leadershipRole ? " selected" : ""}>${role || "Not assigned"}</option>`).join("")}</select></td></tr></tbody></table></div></div></section>`;
}
function renderFriendlyAccessMessage(message = "Looks like you are flailing a bit. This page needs a signed-in account with the right troop role or linked-scout relationship.") {
  app.innerHTML = `${topNav()}<section class="dashboard-banner"><div><p class="eyebrow">Restricted route</p><h2>We cannot open that page</h2><p class="intro compact">${message}</p><div class="scribe-actions"><a class="button primary" href="#/">Return Home</a></div></div><div class="status-chip"><span>Access</span><strong>Restricted</strong></div></section>`;
}
function renderAccessDenied() { renderFriendlyAccessMessage(); }
function renderNotFound() { app.innerHTML = `${topNav()}<section class="dashboard-banner"><div><p class="eyebrow">Prototype route</p><h2>Page not found</h2><p class="intro compact">Try the Home, Scribe Attendance, or Org Chart routes from the navigation above.</p></div></section>`; }
function renderRoute() { renderIdentityControls(); const hash = window.location.hash || "#/"; if (!currentActor?.authenticated && (hash.startsWith("#/scribe/") || hash.startsWith("#/scouts") || hash.startsWith("#/patrols") || hash.startsWith("#/adults") || hash.startsWith("#/org-chart") || hash.startsWith("#/holidays"))) { renderAccessDenied(); applyTitleAttributes(); return; } if (hash === "#/" || hash === "") { if (modeSelect.value === "public") { renderPublic(); applyTitleAttributes(); return; } renderDashboard(modeSelect.value); applyTitleAttributes(); return; } if (hash === "#/resources") { renderResourcesRoute(); applyTitleAttributes(); return; } if (hash === "#/events") { if (canSeeOrgChart()) { renderEventsList(); applyTitleAttributes(); return; } renderEventsIndex(); applyTitleAttributes(); return; } if (hash === "#/events/calendar") { renderEventsIndex(); applyTitleAttributes(); return; } if (hash === "#/events/list") { renderEventsList(); applyTitleAttributes(); return; } if (hash.startsWith("#/events/")) { renderEventRoute(hash.replace("#/events/", "")); applyTitleAttributes(); return; } if (hash === "#/scribe/attendance") { renderScribeIndex(); applyTitleAttributes(); return; } if (hash === "#/scribe/attendance/event/troop-meeting-stem") { renderScribeEvent(); applyTitleAttributes(); return; } if (hash === "#/scribe/attendance/print") { renderScribePrint(); applyTitleAttributes(); return; } if (hash === "#/scribe/attendance/upload") { renderScribeUpload(); applyTitleAttributes(); return; } if (hash === "#/scribe/attendance/history") { renderScribeHistory(); applyTitleAttributes(); return; } if (hash.startsWith("#/scribe/attendance/history/item/")) { renderScribeHistoryItem(hash.replace("#/scribe/attendance/history/item/", "")); applyTitleAttributes(); return; } if (hash === "#/scribe/attendance/reports/monthly") { renderScribeMonthly(); applyTitleAttributes(); return; } if (hash === "#/scouts") { renderScoutsRoute(); applyTitleAttributes(); return; } if (hash === "#/patrols") { renderPatrolsRoute(); applyTitleAttributes(); return; } if (hash === "#/holdays") { window.location.hash = "#/holidays"; return; } if (hash === "#/holidays") { renderHolidaysRoute(); applyTitleAttributes(); return; } if (hash.startsWith("#/holidays/")) { renderHolidayEditor(hash.replace("#/holidays/", "")); applyTitleAttributes(); return; } if (hash === "#/adult") { window.location.hash = "#/adults"; return; } if (hash === "#/adults") { renderAdultsRoute(); applyTitleAttributes(); return; } if (hash === "#/org-chart") { renderOrgChart(); applyTitleAttributes(); return; } if (hash === "#/org-chart/edit-scouts") { renderScoutOrgChartEditor(); applyTitleAttributes(); return; } if (hash === "#/org-chart/edit-adults") { renderAdultOrgChartEditor(); applyTitleAttributes(); return; } if (hash.startsWith("#/adults/")) { renderAdultRecordEditor(hash.replace("#/adults/", "")); applyTitleAttributes(); return; } if (hash.startsWith("#/scouts/")) { renderScoutRecordEditor(hash.replace("#/scouts/", "")); applyTitleAttributes(); return; } renderNotFound(); applyTitleAttributes(); }
function applyScoutFilter(input) {
  const section = input.closest(".section");
  const scope = section?.querySelector("[data-scout-filter-scope]");
  if (!scope) return;
  const query = input.value.trim().toLowerCase();
  const items = [...scope.querySelectorAll("[data-scout-filter-item]")];
  let visibleCount = 0;

  items.forEach((item) => {
    const haystack = `${item.dataset.scoutName || ""} ${item.dataset.scoutPatrol || ""} ${item.dataset.scoutRank || ""}`;
    const isVisible = !query || haystack.includes(query);
    item.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  scope.querySelectorAll("[data-scout-patrol-card]").forEach((card) => {
    const cardPatrolMatches = !query || String(card.dataset.scoutPatrol || "").includes(query);
    const visibleScouts = [...card.querySelectorAll("[data-scout-filter-item]")].filter((item) => !item.hidden);
    card.hidden = !cardPatrolMatches && !visibleScouts.length;
  });

  const count = section.querySelector("[data-scout-filter-count]");
  if (count) {
    count.textContent = query ? `${visibleCount} matching scout${visibleCount === 1 ? "" : "s"}` : `${items.length} scout${items.length === 1 ? "" : "s"}`;
  }
}
function updateCarousel(carousel, index) { const slides = [...carousel.querySelectorAll(".carousel-slide")]; const dots = [...carousel.querySelectorAll(".carousel-dot")]; const nextIndex = (index + slides.length) % slides.length; carousel.dataset.index = String(nextIndex); slides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === nextIndex)); dots.forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === nextIndex)); }
modeSelect.addEventListener("change", () => { window.localStorage.setItem("troop883-view-mode", modeSelect.value); renderRoute(); });
document.addEventListener("submit", async (event) => {
  const form = event.target.closest("[data-login-form]");
  if (!form) return;
  event.preventDefault();
  const email = form.querySelector("[data-login-email]")?.value.trim();
  const password = form.querySelector("[data-login-password]")?.value || "";
  const otp = form.querySelector("[data-login-otp]")?.value.trim();
  form.querySelector("[data-login-error]")?.remove();
  const response = await fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credentials: { email }, password, otp }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    form.insertAdjacentHTML("beforeend", `<span class="nav-note" data-login-error>${payload.error || "Login failed"}</span>`);
    return;
  }
  sessionToken = payload.session?.token || "";
  window.localStorage.setItem("troop883-auth-token", sessionToken);
  currentActor = { authenticated: true, account: payload.account, ...payload.access };
  await loadData();
  renderRoute();
});
function shouldUseDefaultButtonClickFeedback(button) {
  if (!button || button.disabled || button.classList.contains("is-clicked")) return false;
  if (!button.matches(".button")) return false;
  if (button.closest("[data-login-form]")) return false;
  if (button.matches("[data-toggle-password], [data-gallery-reaction], .image-reaction-button")) return false;
  return true;
}
document.addEventListener("click", (event) => {
  const button = event.target.closest("button.button, a.button");
  if (!shouldUseDefaultButtonClickFeedback(button)) return;
  button.classList.add("is-clicked");
  button.setAttribute("aria-disabled", "true");
  if (button.tagName === "BUTTON") button.disabled = true;
}, true);
document.addEventListener("click", async (event) => {
  const passwordToggle = event.target.closest("[data-toggle-password]");
  if (passwordToggle) {
    const passwordInput = passwordToggle.closest(".password-field")?.querySelector("[data-login-password]");
    const showing = passwordInput?.type === "text";
    if (passwordInput) {
      passwordInput.type = showing ? "password" : "text";
      passwordToggle.textContent = showing ? "Show" : "Hide";
      passwordToggle.setAttribute("aria-label", showing ? "Show password" : "Hide password");
    }
    return;
  }
  if (!event.target.closest("[data-logout]")) return;
  sessionToken = "";
  currentActor = null;
  window.localStorage.removeItem("troop883-auth-token");
  await loadData();
  window.location.hash = "#/";
  renderRoute();
});
document.addEventListener("change", async (event) => {
  const scoutSessionSelect = event.target.closest("#activeScoutSelect");
  if (!scoutSessionSelect) return;
  setActiveScoutId(scoutSessionSelect.value);
  if (window.location.hash.startsWith("#/scouts/")) {
    window.location.hash = `#/scouts/${scoutSessionSelect.value}`;
    return;
  }
  renderRoute();
});
document.addEventListener("click", async (event) => {
  const attendanceWindowButton = event.target.closest("[data-attendance-window]");
  if (attendanceWindowButton) {
    const attendanceItems = getAttendanceHistoryItemsSorted();
    const visibleCount = 4;
    const currentStart = getAttendanceWindowStart(attendanceItems.length, visibleCount);
    const delta = attendanceWindowButton.dataset.attendanceWindow === "left" ? -visibleCount : visibleCount;
    const maxStart = Math.max(0, attendanceItems.length - visibleCount);
    setAttendanceWindowStart(Math.min(Math.max(0, currentStart + delta), maxStart));
    renderRoute();
    return;
  }

  const calendarNavButton = event.target.closest("[data-calendar-nav]");
  if (calendarNavButton) {
    await openCalendarMonth(calendarNavButton.dataset.calendarNav, calendarNavButton.dataset.calendarDate);
    return;
  }

  const calendarEventButton = event.target.closest("[data-calendar-event]");
  if (calendarEventButton) {
    setSelectedCalendarEventId(calendarEventButton.dataset.calendarEvent);
    if (calendarEventButton.dataset.calendarDate) {
      setSelectedCalendarDate(calendarEventButton.dataset.calendarDate);
      setSelectedEventMonth(calendarEventButton.dataset.calendarDate.slice(0, 7));
    }
    await hydratePublicCalendarEventMedia(calendarEventButton.dataset.calendarEvent);
    requestSelectedCalendarEventScroll();
    renderRoute();
    return;
  }

  const calendarDateButton = event.target.closest("[data-calendar-date]");
  if (calendarDateButton) {
    const dateKey = calendarDateButton.dataset.calendarDate;
    setSelectedCalendarDate(dateKey);
    setSelectedEventMonth(dateKey.slice(0, 7));
    const date = parseDateKey(dateKey);
    const firstEventForDate = date ? events.filter((item) => eventOccursOnDate(item, date)).sort((a, b) => (parseEventStartDate(a)?.getTime() || 0) - (parseEventStartDate(b)?.getTime() || 0))[0] : null;
    setSelectedCalendarEventId(firstEventForDate?.id || "");
    renderRoute();
    return;
  }
});
window.addEventListener("hashchange", async () => {
  if ((window.location.hash || "").startsWith("#/events/calendar")) {
    try {
      await loadCalendarMonthEvents(getSelectedEventMonth());
    } catch (error) {
      console.warn(error);
    }
  }
  const detailEventId = getEventDetailRouteId();
  if (detailEventId) {
    await hydratePublicCalendarEventMedia(detailEventId);
  }
  renderRoute();
  hydrateLandingEventWindowMedia().catch(() => {});
});
document.addEventListener("click", async (event) => {
  const showAddPatrolButton = event.target.closest("[data-show-add-patrol]");
  if (showAddPatrolButton) {
    if (!canEditScouts()) return;
    showAddPatrolRow = true;
    renderRoute();
    return;
  }

  const savePatrolsButton = event.target.closest("[data-save-patrols]");
  if (savePatrolsButton) {
    if (!canEditScouts()) return;
    try {
      await savePatrolEditorChanges();
    } catch (error) {
      window.alert(error?.message || "Could not save patrol changes.");
    }
    return;
  }

  const removePatrolButton = event.target.closest("[data-toggle-remove-patrol]");
  if (removePatrolButton) {
    if (!canEditScouts()) return;
    const row = removePatrolButton.closest("[data-patrol-row]");
    if (!row) return;
    const isNewRow = !row.dataset.patrolOriginal;
    if (isNewRow && !row.querySelector("[data-patrol-name]")?.value.trim()) {
      row.remove();
      return;
    }
    const nextRemoved = row.dataset.patrolRemoved !== "true";
    row.dataset.patrolRemoved = String(nextRemoved);
    row.classList.toggle("is-marked-for-removal", nextRemoved);
    removePatrolButton.textContent = nextRemoved ? "Keep patrol" : "Remove patrol";
    return;
  }

  const removeScoutFromPatrolButton = event.target.closest("[data-remove-scout-from-patrol]");
  if (removeScoutFromPatrolButton) {
    if (!canEditScouts()) return;
    const row = removeScoutFromPatrolButton.closest("[data-patrol-row]");
    if (!row) return;
    const scoutId = removeScoutFromPatrolButton.dataset.removeScoutFromPatrol;
    const removedScoutIds = new Set(String(row.dataset.removedScoutIds || "").split(",").map((value) => value.trim()).filter(Boolean));
    removedScoutIds.add(scoutId);
    row.dataset.removedScoutIds = [...removedScoutIds].join(",");
    row.querySelector(`[data-patrol-scout-chip="${scoutId}"]`)?.remove();
    const patrolLeaderSelect = row.querySelector("[data-patrol-leader]");
    const assistantPatrolLeaderSelect = row.querySelector("[data-assistant-patrol-leader]");
    if (patrolLeaderSelect?.value === scoutId) patrolLeaderSelect.value = "";
    if (assistantPatrolLeaderSelect?.value === scoutId) assistantPatrolLeaderSelect.value = "";
    removeScoutFromPatrolLeaderChoices(row, scoutId);
    if (!row.querySelector("[data-patrol-scout-chip]")) {
      const scoutList = row.querySelector(".patrol-scout-list");
      if (scoutList) scoutList.innerHTML = `<span class="section-copy">No scouts assigned yet</span>`;
    }
    const removedScout = roster.find((entry) => entry.id === scoutId) || scouts.find((entry) => entry.id === scoutId);
    if (removedScout) {
      document.querySelectorAll("[data-patrol-row]").forEach((patrolRow) => {
        const select = patrolRow.querySelector("[data-patrol-insert-scout]");
        const addList = patrolRow.querySelector("[data-patrol-add-list]");
        if (select?.querySelector(`option[value="${scoutId}"]`)) return;
        if (select) {
          select.insertAdjacentHTML("beforeend", `<option value="${removedScout.id}">${removedScout.name} - ${removedScout.rank}</option>`);
        } else if (addList) {
          addList.innerHTML = `<select data-patrol-insert-scout aria-label="Select unassigned scout to add"><option value="">Select unassigned scout</option><option value="${removedScout.id}">${removedScout.name} - ${removedScout.rank}</option></select>`;
        }
        patrolRow.querySelector("[data-show-patrol-add-list]")?.removeAttribute("disabled");
      });
    }
    return;
  }

  const showPatrolAddListButton = event.target.closest("[data-show-patrol-add-list]");
  if (showPatrolAddListButton) {
    if (!canEditScouts()) return;
    const row = showPatrolAddListButton.closest("[data-patrol-row]");
    const list = row?.querySelector("[data-patrol-add-list]");
    if (!list) return;
    list.classList.toggle("is-hidden");
    return;
  }

  const insertScoutIntoPatrolButton = event.target.closest("[data-insert-scout-into-patrol]");
  if (insertScoutIntoPatrolButton) {
    if (!canEditScouts()) return;
    const row = insertScoutIntoPatrolButton.closest("[data-patrol-row]");
    if (!row) return;
    const select = row.querySelector("[data-patrol-insert-scout]");
    addScoutToPatrolRow(row, select?.value || "");
    return;
  }

  const openCardMediaButton = event.target.closest("[data-open-card-media]");
  if (openCardMediaButton) {
    openMediaLightbox(openCardMediaButton.dataset.openCardMedia, Number(openCardMediaButton.dataset.openCardMediaIndex || 0));
    return;
  }

  const closeMediaLightboxButton = event.target.closest("[data-close-media-lightbox]");
  if (closeMediaLightboxButton) {
    closeMediaLightbox();
    return;
  }

  const addEventButton = event.target.closest("[data-add-event-date]");
  if (addEventButton) {
    if (!canSeeOrgChart()) return;
    const createdEvent = await createEventForDate(addEventButton.dataset.addEventDate);
    window.location.hash = `#/events/${createdEvent.id}`;
    return;
  }

  const saveHolidayButton = event.target.closest("[data-save-holiday]");
  if (saveHolidayButton) {
    if (!canSeeOrgChart()) return;
    const holiday = normalizeHoliday({
      id: saveHolidayButton.dataset.saveHoliday || nextHolidayId(),
      name: document.querySelector("[data-holiday-name]")?.value.trim() || "Custom holiday",
      date: document.querySelector("[data-holiday-date]")?.value || getTodayDateKey(),
      endDate: document.querySelector("[data-holiday-end-date]")?.value || document.querySelector("[data-holiday-date]")?.value || getTodayDateKey(),
      placedBy: document.querySelector("[data-holiday-placed-by]")?.value.trim() || "",
      role: document.querySelector("[data-holiday-role]")?.value || "Adult leader",
      note: document.querySelector("[data-holiday-note]")?.value.trim() || "",
    });
    holidays = holidays.filter((item) => item.id !== holiday.id);
    holidays.push(holiday);
    await saveHolidays();
    window.location.hash = `#/holidays/${holiday.id}`;
    renderRoute();
    return;
  }

  const deleteHolidayButton = event.target.closest("[data-delete-holiday]");
  if (deleteHolidayButton) {
    if (!canSeeOrgChart()) return;
    holidays = holidays.filter((item) => item.id !== deleteHolidayButton.dataset.deleteHoliday);
    await saveHolidays();
    window.location.hash = "#/holidays";
    renderRoute();
    return;
  }

  const addActivityButton = event.target.closest("[data-add-activity]");
  if (addActivityButton) {
    if (!canSeeOrgChart()) return;
    const currentEvent = getEventById(addActivityButton.dataset.addActivity);
    if (!currentEvent) return;
    const activityId = nextActivityId(currentEvent);
    currentEvent.activities = [...(currentEvent.activities || []), normalizeActivity({ id: activityId, description: "", location: currentEvent.homeBase || "", startDate: currentEvent.startDate, endDate: currentEvent.endDate || currentEvent.startDate })];
    await saveEvents();
    renderRoute();
    return;
  }

  const copyEventButton = event.target.closest("[data-copy-event]");
  if (copyEventButton) {
    if (!canSeeOrgChart()) return;
    const sourceEventId = copyEventButton.dataset.copyEvent;
    syncEventFromEditor(sourceEventId);
    const duplicatedEvent = await duplicateEventAsFuture(sourceEventId);
    if (!duplicatedEvent) return;
    window.location.hash = `#/events/${duplicatedEvent.id}`;
    return;
  }

  const removeActivityButton = event.target.closest("[data-remove-activity]");
  if (removeActivityButton) {
    if (!canSeeOrgChart()) return;
    const eventId = (window.location.hash || "").replace("#/events/", "");
    const currentEvent = getEventById(eventId);
    if (!currentEvent) return;
    currentEvent.activities = (currentEvent.activities || []).filter((activity) => activity.id !== removeActivityButton.dataset.removeActivity);
    await saveEvents();
    renderRoute();
    return;
  }

  const makePrimaryImageButton = event.target.closest("[data-make-primary-image]");
  if (makePrimaryImageButton) {
    if (!canSeeOrgChart()) return;
    const eventId = (window.location.hash || "").replace("#/events/", "");
    const currentEvent = syncEventFromEditor(eventId);
    if (!currentEvent) return;
    const gallery = [...(currentEvent.gallery || [])];
    const imageIndex = gallery.findIndex((image) => image.id === makePrimaryImageButton.dataset.makePrimaryImage);
    if (imageIndex < 0 || !gallery[imageIndex]) return;
    currentEvent.image = gallery[imageIndex].src || scoutOrgLogo;
    currentEvent.gallery = sortGalleryByDateTime(gallery);
    setGalleryImagesInEditor(currentEvent.gallery);
    await saveEvents();
    renderRoute();
    return;
  }

  const removeGalleryImageButton = event.target.closest("[data-remove-gallery-image]");
  if (removeGalleryImageButton) {
    if (!canSeeOrgChart()) return;
    const eventId = (window.location.hash || "").replace("#/events/", "");
    const currentEvent = syncEventFromEditor(eventId);
    if (!currentEvent) return;
    const imageId = removeGalleryImageButton.dataset.removeGalleryImage;
    currentEvent.gallery = sortGalleryByDateTime((currentEvent.gallery || []).filter((image) => image.id !== imageId));
    if (!currentEvent.gallery.length) currentEvent.gallery = [normalizeGalleryItem({ src: scoutOrgLogo }, 0)];
    if (!currentEvent.gallery.some((image) => image.src === currentEvent.image)) currentEvent.image = currentEvent.gallery[0]?.src || scoutOrgLogo;
    setGalleryImagesInEditor(currentEvent.gallery);
    await saveEvents();
    renderRoute();
    return;
  }

  const galleryReactionButton = event.target.closest("[data-gallery-reaction]");
  if (galleryReactionButton) {
    const eventId = (window.location.hash || "").replace("#/events/", "");
    const currentEvent = getEventById(eventId);
    const viewer = getCurrentViewerIdentity();
    if (!currentEvent || !viewer) return;
    const image = getGalleryImageById(currentEvent, galleryReactionButton.dataset.galleryImageId);
    if (!image) return;
    const reactionType = galleryReactionButton.dataset.galleryReaction;
    const alreadyActive = (image.reactions?.[reactionType] || []).includes(viewer.id);
    toggleGalleryReaction(image, alreadyActive ? "" : reactionType, viewer.id);
    await saveEvents();
    renderRoute();
    return;
  }

  const addGalleryCommentButton = event.target.closest("[data-add-gallery-comment]");
  if (addGalleryCommentButton) {
    const eventId = (window.location.hash || "").replace("#/events/", "");
    const currentEvent = getEventById(eventId);
    const viewer = getCurrentViewerIdentity();
    if (!currentEvent || !viewer) return;
    const image = getGalleryImageById(currentEvent, addGalleryCommentButton.dataset.addGalleryComment);
    const input = document.querySelector(`[data-gallery-comment-input="${addGalleryCommentButton.dataset.addGalleryComment}"]`);
    const text = input?.value.trim();
    if (!image || !text) return;
    image.comments = [...(image.comments || []), normalizeImageComment({ id: nextGalleryCommentId(image), authorId: viewer.id, authorName: viewer.name, createdAt: new Date().toISOString(), text }, (image.comments || []).length)];
    if (input) input.value = "";
    await saveEvents();
    renderRoute();
    return;
  }

  const removeGalleryCommentButton = event.target.closest("[data-remove-gallery-comment]");
  if (removeGalleryCommentButton) {
    const eventId = (window.location.hash || "").replace("#/events/", "");
    const currentEvent = getEventById(eventId);
    if (!currentEvent) return;
    const image = getGalleryImageById(currentEvent, removeGalleryCommentButton.dataset.galleryImageId);
    if (!image) return;
    const comment = (image.comments || []).find((entry) => entry.id === removeGalleryCommentButton.dataset.removeGalleryComment);
    if (!comment || !canRemoveGalleryComment(comment)) return;
    image.comments = (image.comments || []).filter((entry) => entry.id !== removeGalleryCommentButton.dataset.removeGalleryComment);
    await saveEvents();
    renderRoute();
    return;
  }

  const deleteEventButton = event.target.closest("[data-delete-event]");
  if (deleteEventButton) {
    if (!canSeeOrgChart()) return;
    events = events.filter((item) => item.id !== deleteEventButton.dataset.deleteEvent);
    await saveEvents();
    window.location.hash = "#/events";
    return;
  }

  const historyToggle = event.target.closest("[data-toggle-attendance-month]");
  if (historyToggle) {
    const monthId = historyToggle.dataset.toggleAttendanceMonth;
    if (expandedAttendanceMonths.has(monthId)) {
      expandedAttendanceMonths.delete(monthId);
    } else {
      expandedAttendanceMonths.add(monthId);
    }
    renderRoute();
    return;
  }

  const eventScrollButton = event.target.closest("[data-event-scroll]");
  if (eventScrollButton) {
    scrollUpcomingEvents(Number(eventScrollButton.dataset.eventScroll || 1));
    return;
  }

  const prevButton = event.target.closest(".carousel-button.prev");
  const nextButton = event.target.closest(".carousel-button.next");
  const dotButton = event.target.closest(".carousel-dot");

  if (prevButton || nextButton || dotButton) {
    const carousel = event.target.closest(".carousel");
    if (!carousel) return;
    const currentIndex = Number(carousel.dataset.index || 0);
    if (prevButton) return updateCarousel(carousel, currentIndex - 1);
    if (nextButton) return updateCarousel(carousel, currentIndex + 1);
    updateCarousel(carousel, Number(dotButton.dataset.slide));
    return;
  }

  if (event.target.closest("[data-show-add-adult]")) {
    showAddAdultRow = true;
    renderRoute();
    return;
  }

  if (event.target.closest("[data-cancel-add-adult]")) {
    showAddAdultRow = false;
    renderRoute();
    return;
  }

  const removeButton = event.target.closest("[data-remove-adult-index]");
  if (removeButton) {
    adultLeaders.splice(Number(removeButton.dataset.removeAdultIndex), 1);
    await saveAdultLeaders();
    rebuildDerivedData();
    renderRoute();
    return;
  }

  if (event.target.closest("[data-save-new-adult]")) {
    const nameInput = document.querySelector("[data-new-adult-name]");
    const relationshipInput = document.querySelector("[data-new-adult-relationship]");
    const emailInput = document.querySelector("[data-new-adult-email]");
    const homePhoneInput = document.querySelector("[data-new-adult-home-phone]");
    const cellPhoneInput = document.querySelector("[data-new-adult-cell-phone]");
    const name = nameInput?.value.trim();

    if (!name) return;
    if (adults.some((adult) => adult.name.toLowerCase() === name.toLowerCase())) return;

    adults.push({
      id: nextAdultId(),
      name,
      relationship: relationshipInput?.value || "Adult leader",
      email: emailInput?.value.trim() || `${slugifyName(name)}@example.com`,
      homePhone: homePhoneInput?.value.trim() || "",
      cellPhone: cellPhoneInput?.value.trim() || "",
    });
    await saveAdults();
    rebuildDerivedData();
    renderRoute();
  }

  const removeChildButton = event.target.closest("[data-remove-child-scout]");
  if (removeChildButton) {
    const adultId = (window.location.hash || "").replace("#/adults/", "");
    const adult = adults.find((entry) => entry.id === adultId);
    const scout = scouts.find((entry) => entry.id === removeChildButton.dataset.removeChildScout);
    if (!adult || !scout) return;
    adultScoutRelationships = adultScoutRelationships.filter((relationship) => !(relationship.adultId === adult.id && relationship.scoutId === scout.id));
    await saveAdultScoutRelationships();
    rebuildDerivedData();
    renderRoute();
    return;
  }

  if (event.target.closest("[data-save-child-link]")) {
    const adultId = (window.location.hash || "").replace("#/adults/", "");
    const adult = adults.find((entry) => entry.id === adultId);
    const scoutId = document.querySelector("[data-add-child-scout]")?.value;
    const scout = scouts.find((entry) => entry.id === scoutId);
    if (!adult || !scout) return;
    if (!adultScoutRelationships.some((relationship) => relationship.adultId === adult.id && relationship.scoutId === scout.id)) {
      const currentCount = adultScoutRelationships.filter((relationship) => relationship.scoutId === scout.id).length;
      adultScoutRelationships.push({
        adultId: adult.id,
        scoutId: scout.id,
        relationship: adult.relationship === "Guardian" ? "Guardian" : "Parent",
        priority: String(currentCount + 1),
      });
      await saveAdultScoutRelationships();
      rebuildDerivedData();
      renderRoute();
    }
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMediaLightbox();
});
document.addEventListener("focusout", async (event) => {
  const eventEditorField = event.target.closest(eventEditorFieldSelector);
  if (eventEditorField) {
    const eventId = (window.location.hash || "").replace("#/events/", "");
    if (!eventId || !canSeeOrgChart()) return;
    await flushEventAutosave(eventId);
    return;
  }

  const roleSelect = event.target.closest("[data-adult-role-index]");
  if (roleSelect) {
    const index = Number(roleSelect.dataset.adultRoleIndex);
    if (!Number.isNaN(index) && adultLeaders[index]) {
      adultLeaders[index].role = roleSelect.value;
      await saveAdultLeaders();
      rebuildDerivedData();
      renderRoute();
    }
    return;
  }

  const addAdultInput = event.target.closest("[data-add-adult-input]");
  if (addAdultInput) {
    const typedName = addAdultInput.value.trim();
    if (!typedName) return;
    let adult = findAdultByName(typedName);
    if (!adult) {
      adult = {
        id: nextAdultId(),
        name: typedName,
        relationship: "Adult leader",
        email: `${slugifyName(typedName)}@example.com`,
        homePhone: "",
        cellPhone: "",
      };
      adults.push(adult);
      await saveAdults();
    }
    const role = document.querySelector("[data-add-adult-role]")?.value || "Committee Member";
    if (adultLeaders.some((leader) => leader.adultId === adult.id)) {
      showAddAdultRow = false;
      rebuildDerivedData();
      renderRoute();
      return;
    }
    adultLeaders.push({
      adultId: adult.id,
      name: adult.name,
      role,
    });
    showAddAdultRow = false;
    await saveAdultLeaders();
    rebuildDerivedData();
    renderRoute();
  }

  const adultNameInput = event.target.closest("[data-adult-edit-name]");
  const adultEmailInput = event.target.closest("[data-adult-edit-email]");
  const adultHomePhoneInput = event.target.closest("[data-adult-edit-home-phone]");
  const adultCellPhoneInput = event.target.closest("[data-adult-edit-cell-phone]");
  if (adultNameInput || adultEmailInput || adultHomePhoneInput || adultCellPhoneInput) {
    const adultId = (window.location.hash || "").replace("#/adults/", "");
    const adult = adults.find((entry) => entry.id === adultId);
    if (!adult) return;
    const nextName = document.querySelector("[data-adult-edit-name]")?.value.trim();
    const nextEmail = document.querySelector("[data-adult-edit-email]")?.value.trim() || `${slugifyName(nextName || adult.name)}@example.com`;
    const nextHomePhone = document.querySelector("[data-adult-edit-home-phone]")?.value.trim() || "";
    const nextCellPhone = document.querySelector("[data-adult-edit-cell-phone]")?.value.trim() || "";
    const previousName = adult.name;
    if (nextName) {
      adult.name = nextName;
    }
    adult.email = nextEmail;
    adult.homePhone = nextHomePhone;
    adult.cellPhone = nextCellPhone;
    await saveAdults();
    rebuildDerivedData();
    renderRoute();
    return;
  }

  const adultRoleInput = event.target.closest("[data-adult-edit-role]");
  if (adultRoleInput) {
    const adultId = (window.location.hash || "").replace("#/adults/", "");
    if (!adultId || !canSeeOrgChart()) return;
    const nextRole = adultRoleInput.value;
    adultLeaders = adultLeaders.filter((leader) => leader.adultId !== adultId);
    if (nextRole) {
      const adult = adults.find((entry) => entry.id === adultId);
      adultLeaders.push({ adultId, name: adult?.name || "Unknown adult", role: nextRole });
    }
    await saveAdultLeaders();
    rebuildDerivedData();
    renderRoute();
    return;
  }

  const scoutFirstNameInput = event.target.closest("[data-scout-edit-first-name]");
  const scoutLastNameInput = event.target.closest("[data-scout-edit-last-name]");
  const scoutNicknameInput = event.target.closest("[data-scout-edit-nickname]");
  const scoutGenderInput = event.target.closest("[data-scout-edit-gender]");
  const scoutRankInput = event.target.closest("[data-scout-edit-rank]");
  const scoutPatrolInput = event.target.closest("[data-scout-edit-patrol]");
  const scoutRoleInput = event.target.closest("[data-scout-edit-role]");
  if (scoutFirstNameInput || scoutLastNameInput || scoutNicknameInput || scoutGenderInput || scoutRankInput || scoutPatrolInput || scoutRoleInput) {
    const scoutId = (window.location.hash || "").replace("#/scouts/", "");
    if (!scoutId || !canEditScoutRecord(scoutId)) return;
    const scout = scouts.find((entry) => entry.id === scoutId);
    if (!scout) return;
    setScoutRecordSaveStatus("saving");
    try {
      const nextFirstName = document.querySelector("[data-scout-edit-first-name]")?.value.trim();
      const nextLastName = document.querySelector("[data-scout-edit-last-name]")?.value.trim();
      const nextNickname = document.querySelector("[data-scout-edit-nickname]")?.value.trim();
      const nextGender = document.querySelector("[data-scout-edit-gender]")?.value.trim();
      const nextRank = document.querySelector("[data-scout-edit-rank]")?.value.trim();
      const nextPatrol = document.querySelector("[data-scout-edit-patrol]")?.value ?? scout.patrol;
      const requestedRole = document.querySelector("[data-scout-edit-role]")?.value || "";
      const nextRole = !String(nextPatrol || "").trim() && isPatrolSpecificRole(requestedRole) ? "" : requestedRole;
      scout.firstName = nextFirstName || getScoutFirstName(scout);
      scout.lastName = nextLastName || "";
      scout.name = [scout.firstName, scout.lastName].filter(Boolean).join(" ");
      scout.nickname = nextNickname || getDefaultScoutNickname(scout);
      scout.gender = nextGender || "not specified";
      scout.rank = nextRank || "Scout";
      scout.patrol = nextPatrol;
      scout.patrolBadge = getPatrolBadgeValue(nextPatrol, scout.patrolBadge);
      scout.leadershipRole = nextRole;
      await saveScouts();
      setScoutRecordSaveStatus("saved");
      rebuildDerivedData();
      renderRoute();
    } catch (error) {
      setScoutRecordSaveStatus("dirty");
      throw error;
    }
    return;
  }

});
document.addEventListener("input", (event) => {
  const scoutFilterInput = event.target.closest("[data-scout-filter]");
  if (scoutFilterInput) {
    applyScoutFilter(scoutFilterInput);
    return;
  }

  const patrolBadgeInput = event.target.closest("[data-patrol-badge]");
  if (patrolBadgeInput) {
    setPatrolBadgePreview(patrolBadgeInput);
    return;
  }

  const scoutRecordInput = event.target.closest("[data-scout-edit-first-name], [data-scout-edit-last-name], [data-scout-edit-nickname]");
  if (scoutRecordInput) {
    setScoutRecordSaveStatus("dirty");
    return;
  }

  const eventEditorField = event.target.closest(eventEditorFieldSelector);
  if (!eventEditorField) return;
  const eventId = (window.location.hash || "").replace("#/events/", "");
  queueEventAutosave(eventId, 500);
});
document.addEventListener("change", async (event) => {
  const scoutPatrolSelect = event.target.closest("[data-scout-edit-patrol]");
  if (scoutPatrolSelect) {
    setScoutPatrolBadgePreview(scoutPatrolSelect);
    setScoutRecordSaveStatus("dirty");
    return;
  }

  const scoutRecordSelect = event.target.closest("[data-scout-edit-gender], [data-scout-edit-rank], [data-scout-edit-role]");
  if (scoutRecordSelect) {
    setScoutRecordSaveStatus("dirty");
    return;
  }

  const patrolInsertScoutSelect = event.target.closest("[data-patrol-insert-scout]");
  if (patrolInsertScoutSelect) {
    if (!canEditScouts()) return;
    const row = patrolInsertScoutSelect.closest("[data-patrol-row]");
    const scoutId = patrolInsertScoutSelect.value || "";
    if (addScoutToPatrolRow(row, scoutId)) {
      patrolInsertScoutSelect.value = "";
    }
    return;
  }

  const patrolBadgeInput = event.target.closest("[data-patrol-badge]");
  if (patrolBadgeInput) {
    setPatrolBadgePreview(patrolBadgeInput);
    return;
  }
  const eventEditorField = event.target.closest(eventEditorFieldSelector);
  if (!eventEditorField) return;
  const eventId = (window.location.hash || "").replace("#/events/", "");
  if (eventEditorField.matches("[data-event-edit-repeat-enabled]")) {
    setEventEditorSaveStatus("dirty");
    setEventEditorSaveStatus("saving");
    try {
      syncEventFromEditor(eventId);
      await saveEvents();
      setEventEditorSaveStatus("saved");
      renderRoute();
    } catch (error) {
      setEventEditorSaveStatus("dirty");
      throw error;
    }
    return;
  }
  queueEventAutosave(eventId, 500);
});
document.addEventListener("change", async (event) => {
  const scoutAvatarUploadInput = event.target.closest("[data-scout-avatar-upload]");
  if (scoutAvatarUploadInput) {
    const file = [...(scoutAvatarUploadInput.files || [])].find((entry) => /^image\//.test(String(entry.type || "")));
    const scoutId = (window.location.hash || "").replace("#/scouts/", "");
    const avatarPreview = document.querySelector("[data-scout-avatar-preview]");
    if (!file || !scoutId || !avatarPreview || !canEditScoutRecord(scoutId)) return;
    setScoutRecordSaveStatus("dirty");
    readFileAsDataUrl(file)
      .then(async (item) => {
        const scout = scouts.find((entry) => entry.id === scoutId);
        if (!scout) return;
        setScoutRecordSaveStatus("saving");
        scout.avatar = item.src;
        avatarPreview.src = item.src;
        scoutAvatarUploadInput.value = "";
        await saveScouts();
        setScoutRecordSaveStatus("saved");
        rebuildDerivedData();
        renderRoute();
      })
      .catch(() => setScoutRecordSaveStatus("dirty"));
    return;
  }

  const patrolBadgeUploadInput = event.target.closest("[data-patrol-badge-upload]");
  if (patrolBadgeUploadInput) {
    const file = [...(patrolBadgeUploadInput.files || [])].find((entry) => /^image\//.test(String(entry.type || "")));
    const badgeInput = patrolBadgeUploadInput.closest("[data-patrol-row]")?.querySelector("[data-patrol-badge]");
    if (!file || !badgeInput || !canEditScouts()) return;
    readFileAsDataUrl(file)
      .then((item) => {
        badgeInput.value = item.src;
        setPatrolBadgePreview(badgeInput);
        patrolBadgeUploadInput.value = "";
      })
      .catch(() => {});
    return;
  }
  const eventImageUploadInput = event.target.closest("[data-event-image-upload]");
  if (eventImageUploadInput) {
    const files = [...(eventImageUploadInput.files || [])].filter((file) => /^(image|video)\//.test(String(file.type || "")));
    const eventId = (window.location.hash || "").replace("#/events/", "");
    if (!files.length || !eventId || !canSeeOrgChart()) return;
    const uploadBatchTime = Date.now();
    Promise.all(files.map((file, index) => Promise.all([readFileAsDataUrl(file), readImageDateTime(file)]).then(([item, imageDateTime]) => {
      const lastModified = file.lastModified ? new Date(file.lastModified).toISOString() : "";
      return {
        ...item,
        id: `image-${uploadBatchTime}-${index + 1}`,
        imageDateTime: imageDateTime || lastModified,
        capturedAt: imageDateTime || lastModified,
        uploadedAt: new Date(uploadBatchTime + index).toISOString(),
        originalName: file.name || "",
        lastModified,
      };
    })))
      .then(async (mediaItems) => {
        const currentEvent = syncEventFromEditor(eventId);
        if (!currentEvent) return;
        currentEvent.gallery = sortGalleryByDateTime([...(currentEvent.gallery || []), ...mediaItems.map((item, index) => normalizeGalleryItem(item, (currentEvent.gallery || []).length + index))]);
        if (!currentEvent.gallery.some((item) => item.src === currentEvent.image)) currentEvent.image = currentEvent.gallery[0]?.src || scoutOrgLogo;
        setGalleryImagesInEditor(currentEvent.gallery);
        eventImageUploadInput.value = "";
        await saveEvents();
        renderRoute();
      })
      .catch(() => {});
    return;
  }

  const monthSelect = event.target.closest("[data-calendar-month]");
  const yearSelect = event.target.closest("[data-calendar-year]");
  if (!monthSelect && !yearSelect) return;
  const nextMonth = document.querySelector("[data-calendar-month]")?.value || String(prototypeToday.getMonth() + 1).padStart(2, "0");
  const nextYear = document.querySelector("[data-calendar-year]")?.value || String(prototypeToday.getFullYear());
  const monthKey = `${nextYear}-${nextMonth}`;
  const selectedDate = getSelectedCalendarDate();
  const nextDateKey = selectedDate.startsWith(monthKey) ? selectedDate : `${monthKey}-01`;
  await openCalendarMonth(monthKey, nextDateKey);
});
loadData()
  .then(() => {
    rebuildDerivedData();
    renderRoute();
    hydrateLandingEventWindowMedia().catch(() => {});
  })
  .catch(async (error) => {
    const fallbackEvents = (await loadEventData([])).map(normalizeEvent);
    if (fallbackEvents.length) {
      loadEvents(fallbackEvents);
      rebuildDerivedData();
      renderRoute();
      return;
    }
    renderFriendlyAccessMessage("Looks like you are flailing a bit. We could not open the requested troop data with this account. Return home and try a public page, or sign in with an account that has the right role.");
  });
