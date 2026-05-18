// Event, calendar, reservation, and event-gallery functionality used by app.js.
// Loaded before app.js so these browser globals are available to the main router.
let renderCalendarHighlightsSectionFromLib = null;
let attachLeadershipPositionFieldHandlersFromLib = null;
let collectLeadershipPositionValuesFromLib = null;
let normalizeLeadershipPositionsFromLib = null;
let renderLeadershipPositionFieldFromLib = null;
const scoutsLibReady = import("./scouts-lib/index.js")
	.then((module) => {
		renderCalendarHighlightsSectionFromLib =
			module.renderCalendarHighlightsSection;
		attachLeadershipPositionFieldHandlersFromLib =
			module.attachLeadershipPositionFieldHandlers;
		collectLeadershipPositionValuesFromLib =
			module.collectLeadershipPositionValues;
		normalizeLeadershipPositionsFromLib =
			module.normalizeLeadershipPositions;
		renderLeadershipPositionFieldFromLib =
			module.renderLeadershipPositionField;
		if (attachLeadershipPositionFieldHandlersFromLib) {
			attachLeadershipPositionFieldHandlersFromLib(document);
		}
	})
	.catch((error) => {
		console.warn("Could not load scouts-lib calendar highlights.", error);
	});

// Normalizes location text and applies the shared Saint Joseph location alias.
function normalizeEventLocation(value) {
	const normalized = String(value || "").trim();
	const compact = normalized.toLowerCase().replace(/\s+/g, " ");
	return compact === "st. joseph" ||
		compact === "st joseph" ||
		compact === "saint joseph"
		? saintJosephLocation
		: normalized;
}
// Normalizes activity data into the shape used by event views.
function normalizeActivity(record, index = 0) {
	return {
		id: record.id || `activity-${index + 1}`,
		description: record.description || "",
		location: normalizeEventLocation(record.location || ""),
		startDate: record.startDate || "",
		endDate: record.endDate || "",
	};
}
// Creates the default reaction buckets used by gallery media.
function createEmptyReactions() {
	return { like: [], love: [], laugh: [], disappointed: [] };
}
// Normalizes image reactions data into the shape used by event views.
function normalizeImageReactions(record) {
	const reactions = createEmptyReactions();
	imageReactionTypes.forEach((reaction) => {
		reactions[reaction] = Array.isArray(record?.[reaction])
			? record[reaction].filter(Boolean)
			: [];
	});
	return reactions;
}
// Normalizes image comment data into the shape used by event views.
function normalizeImageComment(comment, index = 0) {
	return {
		id: comment?.id || `comment-${index + 1}`,
		authorId: comment?.authorId || "",
		authorName: comment?.authorName || "Unknown user",
		createdAt: comment?.createdAt || new Date().toISOString(),
		text: comment?.text || "",
	};
}
// Infers registration person type when source data does not provide it.
function inferRegistrationPersonType(personId) {
	if (scouts.some((scout) => scout.id === personId)) {
		return "scout";
	}
	if (adults.some((adult) => adult.id === personId)) {
		return "adult";
	}
	return "member";
}
// Normalizes event registration data into the shape used by event views.
function normalizeEventRegistration(record = {}) {
	const personId = String(record.personId || record.id || "").trim();
	const personType =
		String(record.personType || record.type || "").trim() ||
		inferRegistrationPersonType(personId);
	return {
		eventId: String(record.eventId || "").trim(),
		personType,
		personId,
		name: String(record.name || "").trim(),
		registeredBy: String(
			record.registeredBy || record.registeredByPersonId || "",
		).trim(),
		registeredAt: String(record.registeredAt || "").trim(),
	};
}
// Detects media type from file or URL metadata.
function detectMediaType(value, mimeType = "") {
	if (String(mimeType).startsWith("video/")) {
		return "video";
	}
	if (String(mimeType).startsWith("image/")) {
		return "image";
	}
	if (/^data:video\//i.test(String(value || ""))) {
		return "video";
	}
	if (/^data:image\//i.test(String(value || ""))) {
		return "image";
	}
	if (/\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(String(value || ""))) {
		return "video";
	}
	return "image";
}
// Normalizes gallery item data into the shape used by event views.
function normalizeGalleryItem(item, index = 0) {
	if (typeof item === "string") {
		return {
			id: `image-${index + 1}`,
			src: item,
			mediaType: detectMediaType(item),
			title: "",
			description: "",
			imageDateTime: "",
			capturedAt: "",
			uploadedAt: "",
			comments: [],
			reactions: createEmptyReactions(),
		};
	}
	return {
		id: item?.id || `image-${index + 1}`,
		src: item?.src || item?.image || "",
		mediaType:
			item?.mediaType ||
			detectMediaType(
				item?.src || item?.image || "",
				item?.mimeType || "",
			),
		title: item?.title || "",
		description: item?.description || "",
		imageDateTime:
			item?.imageDateTime ||
			item?.capturedAt ||
			item?.dateTaken ||
			"",
		capturedAt:
			item?.capturedAt ||
			item?.imageDateTime ||
			item?.dateTaken ||
			"",
		uploadedAt:
			item?.uploadedAt || item?.createdAt || item?.datetime || "",
		originalName: item?.originalName || item?.fileName || "",
		lastModified: item?.lastModified || "",
		comments: Array.isArray(item?.comments)
			? item.comments.map((comment, commentIndex) =>
					normalizeImageComment(comment, commentIndex),
				)
			: [],
		reactions: normalizeImageReactions(item?.reactions || item),
	};
}
// Gets gallery item date time for event routing, rendering, or filtering.
function getGalleryItemDateTime(item, index = 0) {
	const timestamp = Date.parse(
		item?.imageDateTime ||
			item?.capturedAt ||
			item?.dateTaken ||
			item?.lastModified ||
			item?.uploadedAt ||
			item?.createdAt ||
			item?.datetime ||
			"",
	);
	return Number.isFinite(timestamp) ? timestamp : index;
}
// Sorts gallery by date time into the display order used by the UI.
function sortGalleryByDateTime(items) {
	return (Array.isArray(items) ? items : [])
		.map((item, index) => ({
			item: normalizeGalleryItem(item, index),
			index,
		}))
		.filter(({ item }) => item.src)
		.sort(
			(a, b) =>
				getGalleryItemDateTime(a.item, a.index) -
					getGalleryItemDateTime(b.item, b.index) ||
				a.index - b.index,
		)
		.map(({ item }, index) => ({
			...item,
			id: item.id || `image-${index + 1}`,
		}));
}
// Normalizes event data into the shape used by event views.
function normalizeEvent(record) {
	const rawGallery = Array.isArray(record.gallery)
		? record.gallery.filter(Boolean)
		: String(record.gallery || "")
				.split(/\r?\n/)
				.map((image) => image.trim())
				.filter(Boolean);
	const image =
		record.image ||
		(typeof rawGallery[0] === "string"
			? rawGallery[0]
			: rawGallery[0]?.src) ||
		"";
	const homeBase = normalizeEventLocation(
		record.homeBase || record.location || "",
	);
	const activities = Array.isArray(record.activities)
		? record.activities.map((activity, index) =>
				normalizeActivity(activity, index),
			)
		: [];
	const gallery = sortGalleryByDateTime(
		rawGallery.map((item, index) =>
			normalizeGalleryItem(item, index),
		),
	);
	const repeatEnabled =
		typeof record.repeatEnabled === "boolean"
			? record.repeatEnabled
			: String(record.repeatEnabled).toLowerCase() === "true";
	const repeatInterval = Math.max(
		1,
		Number(record.repeatInterval) || 1,
	);
	const registrations = Array.isArray(record.registrations)
		? record.registrations
				.map(normalizeEventRegistration)
				.filter((registration) => registration.personId)
		: [];
	const registrationRequired =
		typeof record.registrationRequired === "boolean"
			? record.registrationRequired
			: ["true", "yes", "1", "t", "y"].includes(
					String(
						record.registrationRequired ??
							record.registration_required ??
							record.registerRequired ??
							record.requiresRegistration ??
							record.register ??
							"",
					).toLowerCase(),
				);
	return {
		id: record.id,
		title: record.title || "Untitled event",
		category: record.category || "Event",
		startDate: record.startDate || "",
		endDate: record.endDate || "",
		dateLabel: record.dateLabel || "",
		homeBase,
		location: homeBase,
		audience: record.audience || "",
		description: record.description || "",
		detailNote: record.detailNote || "",
		activities,
		image,
		gallery: gallery.length
			? gallery
			: image
				? [normalizeGalleryItem({ src: image }, 0)]
				: [],
		registrationRequired,
		registrations,
		upcoming:
			typeof record.upcoming === "boolean"
				? record.upcoming
				: String(record.upcoming).toLowerCase() === "true",
		repeatEnabled,
		repeatFrequency: record.repeatFrequency || "weekly",
		repeatInterval,
		repeatUntil: record.repeatUntil || "",
		repeatMonthlyPattern: record.repeatMonthlyPattern || "date",
		repeatMonthlyOrdinal: record.repeatMonthlyOrdinal || "third",
		repeatMonthlyWeekday: record.repeatMonthlyWeekday || "monday",
	};
}
// Gets gallery images from editor for event routing, rendering, or filtering.
function getGalleryImagesFromEditor() {
	return sortGalleryByDateTime(
		[...document.querySelectorAll("[data-gallery-item]")]
			.map((item, index) => {
				const currentEvent = getEventById(getEventDetailRouteId());
				const existing =
					currentEvent?.gallery?.find(
						(galleryItem) =>
							galleryItem.id === item.dataset.galleryItem,
					) ||
					normalizeGalleryItem(
						{ src: item.dataset.gallerySrc },
						index,
					);
				const nextDescription =
					item
						.querySelector("[data-gallery-description]")
						?.value.trim() || "";
				const nextTitle =
					nextDescription ||
					item.querySelector("[data-gallery-title]")?.value.trim() ||
					"";
				return {
					...existing,
					src: item.dataset.gallerySrc || existing.src,
					title: nextTitle,
					description: nextDescription,
				};
			})
			.filter((item) => item.src),
	);
}
// Sets gallery images in editor for the current event UI state.
function setGalleryImagesInEditor(images) {
	const galleryItems = sortGalleryByDateTime(images);
	const eventId = getEventDetailRouteId();
	const currentEvent = getEventById(eventId);
	if (currentEvent) {
		currentEvent.gallery = galleryItems;
		if (!currentEvent.image) {
			currentEvent.image = galleryItems[0]?.src || "";
		}
	}
}
// Parses exif date time into a usable JavaScript value.
function parseExifDateTime(value) {
	const match = String(value || "")
		.trim()
		.match(/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
	if (!match) {
		return "";
	}
	const [, year, month, day, hour, minute, second] = match;
	const date = new Date(
		Number(year),
		Number(month) - 1,
		Number(day),
		Number(hour),
		Number(minute),
		Number(second),
	);
	return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}
// Reads exif ascii from browser file or binary data.
function readExifAscii(
	dataView,
	tiffStart,
	entryOffset,
	littleEndian,
) {
	const type = dataView.getUint16(entryOffset + 2, littleEndian);
	const count = dataView.getUint32(entryOffset + 4, littleEndian);
	if (type !== 2 || !count) {
		return "";
	}
	const valueOffset =
		count <= 4
			? entryOffset + 8
			: tiffStart + dataView.getUint32(entryOffset + 8, littleEndian);
	if (valueOffset < 0 || valueOffset + count > dataView.byteLength) {
		return "";
	}
	let value = "";
	for (let index = 0; index < count; index += 1) {
		const charCode = dataView.getUint8(valueOffset + index);
		if (!charCode) {
			break;
		}
		value += String.fromCharCode(charCode);
	}
	return value;
}
// Reads exif ifd from browser file or binary data.
function readExifIfd(dataView, tiffStart, ifdOffset, littleEndian) {
	const offset = tiffStart + ifdOffset;
	if (offset < 0 || offset + 2 > dataView.byteLength) {
		return {};
	}
	const tags = {};
	const entries = dataView.getUint16(offset, littleEndian);
	for (let index = 0; index < entries; index += 1) {
		const entryOffset = offset + 2 + index * 12;
		if (entryOffset + 12 > dataView.byteLength) {
			break;
		}
		const tag = dataView.getUint16(entryOffset, littleEndian);
		if (tag === 0x0132 || tag === 0x9003 || tag === 0x9004) {
			tags[tag] = readExifAscii(
				dataView,
				tiffStart,
				entryOffset,
				littleEndian,
			);
		}
		if (tag === 0x8769) {
			tags.exifIfdOffset = dataView.getUint32(
				entryOffset + 8,
				littleEndian,
			);
		}
	}
	return tags;
}
// Reads image date time from browser file or binary data.
async function readImageDateTime(file) {
	const lastModified = file?.lastModified
		? new Date(file.lastModified).toISOString()
		: "";
	if (
		!/^image\/jpe?g$/i.test(String(file?.type || "")) ||
		!file?.slice
	) {
		return lastModified;
	}
	try {
		const buffer = await file.slice(0, 262144).arrayBuffer();
		const dataView = new DataView(buffer);
		if (dataView.getUint16(0) !== 0xffd8) {
			return lastModified;
		}
		let offset = 2;
		while (offset + 4 < dataView.byteLength) {
			if (dataView.getUint8(offset) !== 0xff) {
				break;
			}
			const marker = dataView.getUint8(offset + 1);
			const segmentLength = dataView.getUint16(offset + 2);
			if (
				marker === 0xe1 &&
				offset + 4 + segmentLength <= dataView.byteLength
			) {
				const exifHeader = [0, 1, 2, 3, 4, 5]
					.map((index) =>
						String.fromCharCode(
							dataView.getUint8(offset + 4 + index),
						),
					)
					.join("");
				if (exifHeader === "Exif\0\0") {
					const tiffStart = offset + 10;
					const littleEndian =
						dataView.getUint16(tiffStart) === 0x4949;
					if (
						dataView.getUint16(tiffStart + 2, littleEndian) !== 42
					) {
						return lastModified;
					}
					const firstIfdOffset = dataView.getUint32(
						tiffStart + 4,
						littleEndian,
					);
					const rootTags = readExifIfd(
						dataView,
						tiffStart,
						firstIfdOffset,
						littleEndian,
					);
					const exifTags = rootTags.exifIfdOffset
						? readExifIfd(
								dataView,
								tiffStart,
								rootTags.exifIfdOffset,
								littleEndian,
							)
						: {};
					return (
						parseExifDateTime(
							exifTags[0x9003] ||
								exifTags[0x9004] ||
								rootTags[0x0132],
						) || lastModified
					);
				}
			}
			offset += 2 + segmentLength;
		}
	} catch (error) {}
	return lastModified;
}
// Reads file as data url from browser file or binary data.
function readFileAsDataUrl(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () =>
			resolve({
				src: String(reader.result || ""),
				mediaType: detectMediaType(reader.result, file.type),
			});
		reader.onerror = () =>
			reject(reader.error || new Error("Could not read file"));
		reader.readAsDataURL(file);
	});
}
// Keeps the patrol persistence hook available for shared save flows.
function storePatrolsSnapshot() {}
// Keeps the event persistence hook available after event state changes.
function storeEventsSnapshot() {
	return true;
}
// Loads local event registrations into the event state used by the app.
function loadLocalEventRegistrations() {
	try {
		const parsed = JSON.parse(
			window.localStorage.getItem(eventRegistrationStorageKey) ||
				"{}",
		);
		return parsed && typeof parsed === "object" ? parsed : {};
	} catch (error) {
		return {};
	}
}
// Saves local event registrations changes back to local or API storage.
function saveLocalEventRegistrations() {
	const payload = Object.fromEntries(
		events.map((event) => [
			event.id,
			(event.registrations || [])
				.map(normalizeEventRegistration)
				.filter((registration) => registration.personId),
		]),
	);
	try {
		window.localStorage.setItem(
			eventRegistrationStorageKey,
			JSON.stringify(payload),
		);
	} catch (error) {}
}
// Merges local event registrations into events into the current event state.
function mergeLocalEventRegistrationsIntoEvents() {
	const stored = loadLocalEventRegistrations();
	events = events.map((event) => {
		const localRegistrations = Array.isArray(stored[event.id])
			? stored[event.id]
					.map(normalizeEventRegistration)
					.filter((registration) => registration.personId)
			: [];
		if (!localRegistrations.length) {
			return event;
		}
		const registrationsByKey = new Map(
			[...(event.registrations || []), ...localRegistrations].map(
				(registration) => [
					`${registration.personType}:${registration.personId}`,
					registration,
				],
			),
		);
		return {
			...event,
			registrations: [...registrationsByKey.values()],
		};
	});
}
// Merges event registrations into events into the current event state.
function mergeEventRegistrationsIntoEvents(registrations = []) {
	const registrationsByEvent = new Map();
	(Array.isArray(registrations) ? registrations : [])
		.map(normalizeEventRegistration)
		.filter(
			(registration) => registration.eventId && registration.personId,
		)
		.forEach((registration) => {
			const existing =
				registrationsByEvent.get(registration.eventId) || [];
			existing.push({
				...registration,
				personType:
					registration.personType === "member"
						? inferRegistrationPersonType(registration.personId)
						: registration.personType,
			});
			registrationsByEvent.set(registration.eventId, existing);
		});
	events = events.map((event) => {
		const incoming = registrationsByEvent.get(event.id) || [];
		if (!incoming.length) {
			return event;
		}
		const registrationsByKey = new Map(
			[...(event.registrations || []), ...incoming].map(
				(registration) => [
					`${registration.personType}:${registration.personId}`,
					registration,
				],
			),
		);
		return {
			...event,
			registrations: [...registrationsByKey.values()],
		};
	});
}
// Saves events changes back to local or API storage.
async function saveEvents() {
	events = events.map((event) => {
		const gallery = sortGalleryByDateTime(event.gallery || []);
		const image = event.image || gallery[0]?.src || "";
		return { ...event, image, gallery };
	});
	await postJson("/api/events", {
		events: events.map((event) => ({ ...event })),
	});
	storeEventsSnapshot();
}
// Builds or checks event editor status label behavior.
function eventEditorStatusLabel(status = eventEditorSaveStatus) {
	return status === "dirty"
		? "Dirty"
		: status === "saving"
			? "Saving"
			: "Saved";
}
// Sets event editor save status for the current event UI state.
function setEventEditorSaveStatus(status) {
	eventEditorSaveStatus = status;
	const indicator = document.querySelector(
		"[data-event-save-status]",
	);
	if (!indicator) {
		return;
	}
	indicator.dataset.eventSaveStatus = status;
	indicator.textContent = eventEditorStatusLabel(status);
}
// Handles scout record status label for event-related UI behavior.
function scoutRecordStatusLabel(status = scoutRecordSaveStatus) {
	return status === "dirty"
		? "Dirty"
		: status === "saving"
			? "Saving"
			: "Saved";
}
// Sets scout record save status for the current event UI state.
function setScoutRecordSaveStatus(status) {
	scoutRecordSaveStatus = status;
	const indicator = document.querySelector(
		"[data-scout-save-status]",
	);
	if (!indicator) {
		return;
	}
	indicator.dataset.scoutSaveStatus = status;
	indicator.textContent = scoutRecordStatusLabel(status);
}
// Handles adult record status label for event-related UI behavior.
function adultRecordStatusLabel(status = adultRecordSaveStatus) {
	return status === "dirty"
		? "Dirty"
		: status === "saving"
			? "Saving"
			: "Saved";
}
// Sets adult record save status for the current event UI state.
function setAdultRecordSaveStatus(status) {
	adultRecordSaveStatus = status;
	const indicator = document.querySelector(
		"[data-adult-save-status]",
	);
	if (!indicator) {
		return;
	}
	indicator.dataset.adultSaveStatus = status;
	indicator.textContent = adultRecordStatusLabel(status);
}
// Syncs event from editor from the editable form into event state.
function syncEventFromEditor(eventId) {
	const event = getEventById(eventId);
	if (!event) {
		return null;
	}
	const nextStartValue =
		document.querySelector("[data-event-edit-start]")?.value.trim() ||
		event.startDate;
	const rawEndValue = document
		.querySelector("[data-event-edit-end]")
		?.value.trim();
	const nextEndValue = rawEndValue || nextStartValue;
	const nextGallery = getGalleryImagesFromEditor();
	event.title =
		document.querySelector("[data-event-edit-title]")?.value.trim() ||
		event.title;
	event.category =
		document
			.querySelector("[data-event-edit-category]")
			?.value.trim() || event.category;
	event.startDate = nextStartValue;
	event.endDate = nextEndValue;
	event.dateLabel = formatEventDateLabelFromRange(
		nextStartValue,
		nextEndValue,
	);
	event.homeBase = normalizeEventLocation(
		document
			.querySelector("[data-event-edit-home-base]")
			?.value.trim() || event.homeBase,
	);
	event.location = event.homeBase;
	event.audience =
		document
			.querySelector("[data-event-edit-audience]")
			?.value.trim() || event.audience;
	event.description =
		document
			.querySelector("[data-event-edit-description]")
			?.value.trim() || event.description;
	event.detailNote =
		document.querySelector("[data-event-edit-note]")?.value.trim() ||
		event.detailNote;
	const registrationRequiredInput = document.querySelector(
		"[data-event-edit-registration-required]",
	);
	if (registrationRequiredInput) {
		event.registrationRequired = registrationRequiredInput.checked;
	}
	event.upcoming =
		(document.querySelector("[data-event-edit-upcoming]")?.value ||
			String(event.upcoming)) === "true";
	event.repeatEnabled =
		(document.querySelector("[data-event-edit-repeat-enabled]")
			?.value || String(event.repeatEnabled)) === "true";
	event.repeatFrequency =
		document.querySelector("[data-event-edit-repeat-frequency]")
			?.value ||
		event.repeatFrequency ||
		"weekly";
	event.repeatInterval = Math.max(
		1,
		Number(
			document.querySelector("[data-event-edit-repeat-interval]")
				?.value ||
				event.repeatInterval ||
				1,
		),
	);
	event.repeatUntil =
		document
			.querySelector("[data-event-edit-repeat-until]")
			?.value.trim() || "";
	event.repeatMonthlyPattern =
		document.querySelector("[data-event-edit-repeat-monthly-pattern]")
			?.value ||
		event.repeatMonthlyPattern ||
		"date";
	event.repeatMonthlyOrdinal =
		document.querySelector("[data-event-edit-repeat-monthly-ordinal]")
			?.value ||
		event.repeatMonthlyOrdinal ||
		"third";
	event.repeatMonthlyWeekday =
		document.querySelector("[data-event-edit-repeat-monthly-weekday]")
			?.value ||
		event.repeatMonthlyWeekday ||
		"monday";
	event.activities = (event.activities || []).map(
		(activity, index) => {
			const nextActivityStart =
				document
					.querySelector(`[data-activity-start="${activity.id}"]`)
					?.value.trim() ||
				activity.startDate ||
				event.startDate;
			const nextActivityEnd =
				document
					.querySelector(`[data-activity-end="${activity.id}"]`)
					?.value.trim() ||
				activity.endDate ||
				nextActivityStart;
			return normalizeActivity(
				{
					id: activity.id || `activity-${index + 1}`,
					description:
						document
							.querySelector(
								`[data-activity-description="${activity.id}"]`,
							)
							?.value.trim() || activity.description,
					location: normalizeEventLocation(
						document
							.querySelector(
								`[data-activity-location="${activity.id}"]`,
							)
							?.value.trim() || activity.location,
					),
					startDate: nextActivityStart,
					endDate: nextActivityEnd,
				},
				index,
			);
		},
	);
	if (nextGallery.length) {
		event.gallery = sortGalleryByDateTime(nextGallery);
		if (!event.gallery.some((item) => item.src === event.image)) {
			event.image = event.gallery[0]?.src || "";
		}
	}
	const syncedEvent = normalizeEvent(event);
	const existingEventIndex = events.findIndex(
		(item) => item.id === syncedEvent.id,
	);
	if (existingEventIndex >= 0) {
		events = events.map((item, index) =>
			index === existingEventIndex ? syncedEvent : item,
		);
	} else {
		events = [...events, syncedEvent];
	}
	if (currentRouteEvent?.id === syncedEvent.id) {
		currentRouteEvent = syncedEvent;
	}
	return event;
}
// Queues event autosave so edits can be saved after input settles.
function queueEventAutosave(eventId, delay = 2000) {
	if (!eventId || !canSeeOrgChart()) {
		return;
	}
	setEventEditorSaveStatus("dirty");
	if (eventAutosaveTimer) {
		window.clearTimeout(eventAutosaveTimer);
	}
	eventAutosaveTimer = window.setTimeout(async () => {
		try {
			if (typeof clearEditableError === "function") {
				clearEditableError();
			}
			setEventEditorSaveStatus("saving");
			syncEventFromEditor(eventId);
			await saveEvents();
			setEventEditorSaveStatus("saved");
		} catch (error) {
			setEventEditorSaveStatus("dirty");
			if (typeof setEditableError === "function") {
				setEditableError(error, "Could not save this event.");
			}
		} finally {
			eventAutosaveTimer = null;
		}
	}, delay);
}
// Flushes event autosave immediately when pending work must finish.
async function flushEventAutosave(eventId) {
	if (!eventId || !canSeeOrgChart()) {
		return;
	}
	if (eventAutosaveTimer) {
		window.clearTimeout(eventAutosaveTimer);
		eventAutosaveTimer = null;
	}
	setEventEditorSaveStatus("saving");
	try {
		if (typeof clearEditableError === "function") {
			clearEditableError();
		}
		syncEventFromEditor(eventId);
		await saveEvents();
		setEventEditorSaveStatus("saved");
	} catch (error) {
		setEventEditorSaveStatus("dirty");
		if (typeof setEditableError === "function") {
			setEditableError(error, "Could not save this event.");
		}
	}
}
// Loads events into the event state used by the app.
function loadEvents(initialEvents = []) {
	events = Array.isArray(initialEvents)
		? initialEvents.map(normalizeEvent)
		: [];
	mergeLocalEventRegistrationsIntoEvents();
	storeEventsSnapshot();
}
// Checks whether primary event media is present.
function hasPrimaryEventMedia(event) {
	const image = String(event?.image || "").trim();
	const gallery = Array.isArray(event?.gallery) ? event.gallery : [];
	return (
		Boolean(image && image !== scoutOrgLogo) ||
		gallery.some((item) => {
			const src = normalizeGalleryItem(item).src;
			return src && src !== scoutOrgLogo;
		})
	);
}
// Merges loaded events into the current event state.
function mergeLoadedEvents(incomingEvents = []) {
	const nextEventsById = new Map(
		events.map((event) => [String(event.id), event]),
	);
	incomingEvents.map(normalizeEvent).forEach((event) => {
		if (!event.id) {
			return;
		}
		const existing = nextEventsById.get(String(event.id));
		const registrations = event.registrations?.length
			? event.registrations
			: existing?.registrations || [];
		if (
			existing &&
			hasPrimaryEventMedia(existing) &&
			!hasPrimaryEventMedia(event)
		) {
			nextEventsById.set(String(event.id), {
				...event,
				image: existing.image,
				gallery: existing.gallery,
				registrations,
			});
			return;
		}
		nextEventsById.set(String(event.id), { ...event, registrations });
	});
	events = [...nextEventsById.values()];
	mergeLocalEventRegistrationsIntoEvents();
	storeEventsSnapshot();
}
// Gets event by id for event routing, rendering, or filtering.
function getEventById(eventId) {
	return (
		(currentRouteEvent?.id === eventId ? currentRouteEvent : null) ||
		events.find((event) => event.id === eventId)
	);
}
// Builds map url for location for embedded map display.
function mapUrlForLocation(location) {
	return `https://www.google.com/maps?q=${encodeURIComponent(normalizeEventLocation(location))}&output=embed`;
}
// Builds directions url for location for opening directions in Google Maps.
function directionsUrlForLocation(location) {
	return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(normalizeEventLocation(location))}`;
}
// Formats repeat summary for display or form fields.
function formatRepeatSummary(event) {
	if (!event?.repeatEnabled) {
		return "";
	}
	const interval = Math.max(1, Number(event.repeatInterval) || 1);
	const frequency = String(
		event.repeatFrequency || "weekly",
	).toLowerCase();
	const unitLookup = {
		daily: "day",
		weekly: "week",
		monthly: "month",
	};
	const unit = unitLookup[frequency] || "week";
	let everyLabel =
		interval === 1
			? `Repeats ${frequency}`
			: `Repeats every ${interval} ${unit}`;
	if (
		frequency === "monthly" &&
		event.repeatMonthlyPattern === "nth-weekday"
	) {
		const ordinalLabel = String(
			event.repeatMonthlyOrdinal || "third",
		);
		const weekdayLabel = String(
			event.repeatMonthlyWeekday || "monday",
		);
		everyLabel =
			interval === 1
				? `Repeats on the ${ordinalLabel} ${weekdayLabel} of each month`
				: `Repeats on the ${ordinalLabel} ${weekdayLabel} every ${interval} months`;
	}
	return event.repeatUntil
		? `${everyLabel} until ${formatExactEventDateTime(event.repeatUntil)}`
		: everyLabel;
}
const monthLookup = {
	jan: 0,
	january: 0,
	feb: 1,
	february: 1,
	mar: 2,
	march: 2,
	apr: 3,
	april: 3,
	may: 4,
	jun: 5,
	june: 5,
	jul: 6,
	july: 6,
	aug: 7,
	august: 7,
	sep: 8,
	sept: 8,
	september: 8,
	oct: 9,
	october: 9,
	nov: 10,
	november: 10,
	dec: 11,
	december: 11,
};
// Parses event start date into a usable JavaScript value.
function parseEventStartDate(event) {
	if (event.startDate) {
		const dateOnlyMatch = String(event.startDate).match(
			/^(\d{4})-(\d{2})-(\d{2})$/,
		);
		if (dateOnlyMatch) {
			return new Date(
				Number(dateOnlyMatch[1]),
				Number(dateOnlyMatch[2]) - 1,
				Number(dateOnlyMatch[3]),
			);
		}
		const parsed = new Date(event.startDate);
		if (!Number.isNaN(parsed.getTime())) {
			return parsed;
		}
	}
	const normalized = String(event.dateLabel || "")
		.replace(",", "")
		.trim();
	const match = normalized.match(/^([A-Za-z]+)\s+(\d{1,2})/);
	if (!match) {
		return null;
	}
	const month = monthLookup[match[1].toLowerCase()];
	if (month === undefined) {
		return null;
	}
	const yearMatch = normalized.match(/(\d{4})/);
	const year = yearMatch ? Number(yearMatch[1]) : 2026;
	return new Date(year, month, Number(match[2]));
}
// Parses event end date into a usable JavaScript value.
function parseEventEndDate(event) {
	if (event.endDate) {
		const dateOnlyMatch = String(event.endDate).match(
			/^(\d{4})-(\d{2})-(\d{2})$/,
		);
		if (dateOnlyMatch) {
			return new Date(
				Number(dateOnlyMatch[1]),
				Number(dateOnlyMatch[2]) - 1,
				Number(dateOnlyMatch[3]),
			);
		}
		const parsed = new Date(event.endDate);
		if (!Number.isNaN(parsed.getTime())) {
			return parsed;
		}
	}
	return parseEventStartDate(event);
}
// Returns a date normalized to midnight for date-only comparisons.
function startOfDay(date) {
	return new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
	);
}
// Checks whether upcoming event applies.
function isUpcomingEvent(event) {
	const comparisonDate = startOfDay(prototypeToday).getTime();
	const endDate =
		parseEventEndDate(event) || parseEventStartDate(event);
	if (!endDate) {
		return false;
	}
	return startOfDay(endDate).getTime() >= comparisonDate;
}
const publicFutureScheduleLabel = "";
const publicFutureLocationLabel = "";
// Determines whether the event UI should hide public future event info.
function shouldHidePublicFutureEventInfo(event) {
	return !currentActor?.authenticated && isUpcomingEvent(event);
}
// Builds or checks event display date label behavior.
function eventDisplayDateLabel(event) {
	return shouldHidePublicFutureEventInfo(event)
		? publicFutureScheduleLabel
		: event.dateLabel || formatEventListDate(event);
}
// Builds or checks event display location label behavior.
function eventDisplayLocationLabel(event) {
	return shouldHidePublicFutureEventInfo(event)
		? publicFutureLocationLabel
		: event.location || event.homeBase || "Location TBD";
}
// Builds or checks event display home base label behavior.
function eventDisplayHomeBaseLabel(event) {
	return shouldHidePublicFutureEventInfo(event)
		? publicFutureLocationLabel
		: event.homeBase || "Home base TBD";
}
// Builds or checks event display start label behavior.
function eventDisplayStartLabel(event) {
	return shouldHidePublicFutureEventInfo(event)
		? publicFutureScheduleLabel
		: formatExactEventDateTime(event.startDate);
}
// Builds or checks event display end label behavior.
function eventDisplayEndLabel(event) {
	return shouldHidePublicFutureEventInfo(event)
		? publicFutureScheduleLabel
		: formatExactEventDateTime(event.endDate || event.startDate);
}
// Builds display values for activity display date label rows.
function activityDisplayDateLabel(activity, event) {
	return shouldHidePublicFutureEventInfo(event)
		? publicFutureScheduleLabel
		: `${formatExactEventDateTime(activity.startDate)}${activity.endDate ? ` - ${formatExactEventDateTime(activity.endDate)}` : ""}`;
}
// Builds display values for activity display location label rows.
function activityDisplayLocationLabel(activity, event) {
	return shouldHidePublicFutureEventInfo(event)
		? publicFutureLocationLabel
		: activity.location || "Location TBD";
}
// Handles display repeat summary for event-related UI behavior.
function displayRepeatSummary(event) {
	return shouldHidePublicFutureEventInfo(event)
		? ""
		: formatRepeatSummary(event);
}
// Determines whether the event UI should show public event map.
function shouldShowPublicEventMap(event) {
	return (
		!shouldHidePublicFutureEventInfo(event) &&
		Boolean(event.homeBase || event.location)
	);
}
// Builds or checks event overlaps date range behavior.
function eventOverlapsDateRange(event, startDate, endDate) {
	const rangeStart = parseDateKey(startDate);
	const rangeEnd = parseDateKey(endDate);
	const eventStart = parseEventStartDate(event);
	const eventEnd = parseEventEndDate(event) || eventStart;
	if (!rangeStart || !rangeEnd || !eventStart || !eventEnd) {
		return false;
	}
	return (
		startOfDay(eventStart).getTime() <=
			startOfDay(rangeEnd).getTime() &&
		startOfDay(eventEnd).getTime() >= startOfDay(rangeStart).getTime()
	);
}
// Truncates card activity label for compact event cards.
function truncateCardActivityLabel(text, maxLength = 25) {
	const normalized = String(text || "").trim();
	if (!normalized) {
		return "";
	}
	if (normalized.length <= maxLength) {
		return normalized;
	}
	return `${normalized.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}
// Builds card activity labels for event card summaries.
function cardActivityLabels(event) {
	return (event?.activities || [])
		.map((activity) =>
			truncateCardActivityLabel(activity?.description),
		)
		.filter(Boolean)
		.slice(0, 3);
}
// Builds or checks event card date label behavior.
function eventCardDateLabel(event) {
	if (shouldHidePublicFutureEventInfo(event)) {
		return "";
	}
	return String(
		event?.dateLabel || formatEventListDate(event) || "",
	).trim();
}
// Renders landing event date label markup for the event UI.
function renderLandingEventDateLabel(dateLabel) {
	const label = String(dateLabel || "").trim();
	if (!label) {
		return "";
	}
	const rangeParts = label.split(" - ");
	if (rangeParts.length > 1) {
		return `<span class="landing-event-date-stack">
<span>${rangeParts[0]}</span>
<span>- ${rangeParts.slice(1).join(" - ")}</span>
</span>`;
	}
	const dateTimeMatch = label.match(/^(.+\d{4}),\s*(.+)$/);
	if (dateTimeMatch) {
		return `<span class="landing-event-date-stack">
<span>${dateTimeMatch[1]}</span>
<span>${dateTimeMatch[2]}</span>
</span>`;
	}
	return `<span class="landing-event-date-stack">
<span>${label}</span>
</span>`;
}
// Builds or checks event card location label behavior.
function eventCardLocationLabel(event) {
	if (shouldHidePublicFutureEventInfo(event)) {
		return "";
	}
	return String(event?.location || event?.homeBase || "").trim();
}
// Determines whether the event UI should skip event card navigation.
function shouldSkipEventCardNavigation(target) {
	return Boolean(
		target?.closest(
			"button, a, input, select, textarea, summary, details, [data-slide], [data-open-card-media]",
		),
	);
}
// Checks whether walkersville event applies.
function isWalkersvilleEvent(event) {
	const homeBase = String(event?.homeBase || event?.location || "")
		.trim()
		.toLowerCase();
	return (
		homeBase.includes("walkersville") ||
		homeBase.includes("walersville")
	);
}
// Checks whether sandy point event applies.
function isSandyPointEvent(event) {
	const homeBase = String(event?.homeBase || event?.location || "")
		.trim()
		.toLowerCase();
	return homeBase.includes("sandy point state park");
}
// Gets walkersville default gallery item for event routing, rendering, or filtering.
function getWalkersvilleDefaultGalleryItem() {
	const sourceEvent = events.find(
		(event) =>
			isWalkersvilleEvent(event) && hasPrimaryEventMedia(event),
	);
	if (!sourceEvent) {
		return null;
	}
	if (sourceEvent.image) {
		const sourcePrimary = (sourceEvent.gallery || []).find(
			(item) => normalizeGalleryItem(item).src === sourceEvent.image,
		);
		return normalizeGalleryItem(
			sourcePrimary || {
				src: sourceEvent.image,
				title: sourceEvent.title,
				description: sourceEvent.description,
			},
			0,
		);
	}
	const sourceGallery = sourceEvent.gallery || [];
	if (!sourceGallery.length) {
		return null;
	}
	return normalizeGalleryItem(sourceGallery[0], 0);
}
// Gets sandy point default gallery item for event routing, rendering, or filtering.
function getSandyPointDefaultGalleryItem() {
	return normalizeGalleryItem(
		{
			src: "https://dnr.maryland.gov/publiclands/PublishingImages/sandy-point-drone-photo.jpg",
			title: "Sandy Point State Park",
			description: "Sandy Point State Park",
		},
		0,
	);
}
// Gets display media items for event routing, rendering, or filtering.
function getDisplayMediaItems(event) {
	const mediaItems = event?.gallery?.length
		? sortGalleryByDateTime(event.gallery)
		: [];
	if (
		event?.image &&
		!mediaItems.some((item) => item.src === event.image)
	) {
		mediaItems.unshift(
			normalizeGalleryItem(
				{
					src: event.image,
					title: event.title,
					description: event.description,
				},
				0,
			),
		);
	}
	if (!mediaItems.length) {
		mediaItems.push(normalizeGalleryItem({ src: scoutOrgLogo }, 0));
	}
	const primaryIndex = mediaItems.findIndex(
		(item) => item.src === event?.image,
	);
	if (primaryIndex > 0) {
		const [primaryItem] = mediaItems.splice(primaryIndex, 1);
		mediaItems.unshift(primaryItem);
	}
	if (isSandyPointEvent(event)) {
		const sandyPointDefault = getSandyPointDefaultGalleryItem();
		return [
			sandyPointDefault,
			...mediaItems.filter(
				(item) => item?.src && item.src !== sandyPointDefault.src,
			),
		];
	}
	if (
		!isUpcomingEvent(event) ||
		!isWalkersvilleEvent(event) ||
		hasPrimaryEventMedia(event)
	) {
		return mediaItems;
	}
	const walkersvilleDefault = getWalkersvilleDefaultGalleryItem();
	if (!walkersvilleDefault?.src) {
		return mediaItems;
	}
	return [
		walkersvilleDefault,
		...mediaItems.filter(
			(item) => item?.src && item.src !== walkersvilleDefault.src,
		),
	];
}
// Gets monthly ordinal weekday date for event routing, rendering, or filtering.
function getMonthlyOrdinalWeekdayDate(year, month, ordinal, weekday) {
	const weekdayLookup = {
		sunday: 0,
		monday: 1,
		tuesday: 2,
		wednesday: 3,
		thursday: 4,
		friday: 5,
		saturday: 6,
	};
	const targetWeekday =
		weekdayLookup[String(weekday || "").toLowerCase()];
	if (targetWeekday === undefined) {
		return null;
	}
	const dates = [];
	for (
		let day = 1;
		day <= new Date(year, month + 1, 0).getDate();
		day += 1
	) {
		const candidate = new Date(year, month, day);
		if (candidate.getDay() === targetWeekday) {
			dates.push(candidate);
		}
	}
	if (!dates.length) {
		return null;
	}
	if (String(ordinal || "").toLowerCase() === "last") {
		return dates[dates.length - 1];
	}
	const ordinalLookup = { first: 0, second: 1, third: 2, fourth: 3 };
	const ordinalIndex =
		ordinalLookup[String(ordinal || "").toLowerCase()];
	return ordinalIndex === undefined
		? null
		: dates[ordinalIndex] || null;
}
// Checks whether occurs on recurring rule for recurrence calculations.
function occursOnRecurringRule(event, date, start, end) {
	const targetDay = startOfDay(date);
	const startDay = startOfDay(start);
	const endDay = startOfDay(end);
	if (targetDay.getTime() < startDay.getTime()) {
		return false;
	}
	if (event.repeatUntil) {
		const repeatUntil = new Date(event.repeatUntil);
		if (
			!Number.isNaN(repeatUntil.getTime()) &&
			targetDay.getTime() > startOfDay(repeatUntil).getTime()
		) {
			return false;
		}
	}
	const eventDurationDays = Math.max(
		0,
		Math.round(
			(endDay.getTime() - startDay.getTime()) / (24 * 60 * 60 * 1000),
		),
	);
	const frequency = String(
		event.repeatFrequency || "weekly",
	).toLowerCase();
	const interval = Math.max(1, Number(event.repeatInterval) || 1);
	if (frequency === "daily") {
		const dayDiff = Math.round(
			(targetDay.getTime() - startDay.getTime()) /
				(24 * 60 * 60 * 1000),
		);
		return (
			dayDiff % interval >= 0 &&
			dayDiff % interval <= eventDurationDays
		);
	}
	if (frequency === "weekly") {
		const dayDiff = Math.round(
			(targetDay.getTime() - startDay.getTime()) /
				(24 * 60 * 60 * 1000),
		);
		const weekDiff = Math.floor(dayDiff / 7);
		if (weekDiff < 0 || weekDiff % interval !== 0) {
			return false;
		}
		const occurrenceStart = new Date(
			startDay.getFullYear(),
			startDay.getMonth(),
			startDay.getDate() + weekDiff * 7,
		);
		const occurrenceEnd = new Date(
			occurrenceStart.getFullYear(),
			occurrenceStart.getMonth(),
			occurrenceStart.getDate() + eventDurationDays,
		);
		return (
			targetDay.getTime() >= occurrenceStart.getTime() &&
			targetDay.getTime() <= occurrenceEnd.getTime()
		);
	}
	if (frequency === "monthly") {
		const monthDiff =
			(targetDay.getFullYear() - startDay.getFullYear()) * 12 +
			(targetDay.getMonth() - startDay.getMonth());
		if (monthDiff < 0 || monthDiff % interval !== 0) {
			return false;
		}
		let occurrenceStart = null;
		if (event.repeatMonthlyPattern === "nth-weekday") {
			occurrenceStart = getMonthlyOrdinalWeekdayDate(
				targetDay.getFullYear(),
				targetDay.getMonth(),
				event.repeatMonthlyOrdinal,
				event.repeatMonthlyWeekday,
			);
			if (!occurrenceStart) {
				return false;
			}
			occurrenceStart.setHours(
				start.getHours(),
				start.getMinutes(),
				start.getSeconds(),
				start.getMilliseconds(),
			);
		} else {
			const dayOfMonth = Math.min(
				startDay.getDate(),
				new Date(
					targetDay.getFullYear(),
					targetDay.getMonth() + 1,
					0,
				).getDate(),
			);
			occurrenceStart = new Date(
				targetDay.getFullYear(),
				targetDay.getMonth(),
				dayOfMonth,
				start.getHours(),
				start.getMinutes(),
				start.getSeconds(),
				start.getMilliseconds(),
			);
		}
		const occurrenceStartDay = startOfDay(occurrenceStart);
		const occurrenceEndDay = new Date(
			occurrenceStartDay.getFullYear(),
			occurrenceStartDay.getMonth(),
			occurrenceStartDay.getDate() + eventDurationDays,
		);
		return (
			targetDay.getTime() >= occurrenceStartDay.getTime() &&
			targetDay.getTime() <= occurrenceEndDay.getTime()
		);
	}
	return false;
}
// Builds or checks event occurs on date behavior.
function eventOccursOnDate(event, date) {
	const start = parseEventStartDate(event);
	const end = parseEventEndDate(event);
	if (!start || !end || !date) {
		return false;
	}
	if (event.repeatEnabled) {
		return occursOnRecurringRule(event, date, start, end);
	}
	const target = startOfDay(date).getTime();
	return (
		target >= startOfDay(start).getTime() &&
		target <= startOfDay(end).getTime()
	);
}
// Builds or checks event for calendar date behavior.
function eventForCalendarDate(event, date) {
	if (
		!event?.repeatEnabled ||
		!date ||
		!eventOccursOnDate(event, date)
	) {
		return event;
	}
	const start = parseEventStartDate(event);
	const end = parseEventEndDate(event) || start;
	if (!start || !end) {
		return event;
	}
	const durationMs = end.getTime() - start.getTime();
	const occurrenceStart = new Date(date);
	occurrenceStart.setHours(
		start.getHours(),
		start.getMinutes(),
		start.getSeconds(),
		start.getMilliseconds(),
	);
	const occurrenceEnd = new Date(
		occurrenceStart.getTime() + durationMs,
	);
	return {
		...event,
		startDate: formatDateTimeLocalValue(
			occurrenceStart.toISOString(),
		),
		endDate: formatDateTimeLocalValue(occurrenceEnd.toISOString()),
		dateLabel: formatEventDateLabelFromRange(
			formatDateTimeLocalValue(occurrenceStart.toISOString()),
			formatDateTimeLocalValue(occurrenceEnd.toISOString()),
		),
	};
}
// Builds or checks event occurs in month behavior.
function eventOccursInMonth(event, year, month) {
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	for (let day = 1; day <= daysInMonth; day += 1) {
		if (eventOccursOnDate(event, new Date(year, month, day))) {
			return true;
		}
	}
	return false;
}
// Formats date time local value for display or form fields.
function formatDateTimeLocalValue(value) {
	const parsed = value ? new Date(value) : null;
	if (!parsed || Number.isNaN(parsed.getTime())) {
		return "";
	}
	return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}T${String(parsed.getHours()).padStart(2, "0")}:${String(parsed.getMinutes()).padStart(2, "0")}`;
}
// Formats event date label from range for display or form fields.
function formatEventDateLabelFromRange(startValue, endValue) {
	const start = startValue ? new Date(startValue) : null;
	const end = endValue ? new Date(endValue) : null;
	if (!start || Number.isNaN(start.getTime())) {
		return "";
	}
	const startHasTime = String(startValue || "").includes("T");
	const endHasTime = String(endValue || "").includes("T");
	const dateOptions = {
		month: "short",
		day: "numeric",
		year: "numeric",
	};
	const timeOptions = { hour: "numeric", minute: "2-digit" };
	const startDateText = start.toLocaleDateString(
		"en-US",
		dateOptions,
	);
	if (!end || Number.isNaN(end.getTime())) {
		return startHasTime
			? `${startDateText}, ${start.toLocaleTimeString("en-US", timeOptions)}`
			: startDateText;
	}
	const sameDay =
		start.getFullYear() === end.getFullYear() &&
		start.getMonth() === end.getMonth() &&
		start.getDate() === end.getDate();
	if (sameDay)
		return startHasTime || endHasTime
			? `${startDateText}, ${start.toLocaleTimeString("en-US", timeOptions)}-${end.toLocaleTimeString("en-US", timeOptions)}`
			: startDateText;
	const endDateText = end.toLocaleDateString("en-US", dateOptions);
	return `${startDateText} - ${endDateText}`;
}
// Formats exact event date time for display or form fields.
function formatExactEventDateTime(value) {
	const parsed = value ? new Date(value) : null;
	if (!parsed || Number.isNaN(parsed.getTime())) {
		return "Not set";
	}
	const hasTime = String(value || "").includes("T");
	return hasTime
		? parsed.toLocaleString("en-US", {
				weekday: "short",
				month: "short",
				day: "numeric",
				year: "numeric",
				hour: "numeric",
				minute: "2-digit",
			})
		: parsed.toLocaleDateString("en-US", {
				weekday: "short",
				month: "short",
				day: "numeric",
				year: "numeric",
			});
}
// Formats event review date time range for display or form fields.
function formatEventReviewDateTimeRange(event) {
	const startValue = event?.startDate || "";
	const endValue = event?.endDate || event?.startDate || "";
	const start = startValue ? new Date(startValue) : null;
	const end = endValue ? new Date(endValue) : null;
	if (!start || Number.isNaN(start.getTime())) {
		return "Date not set";
	}
	const dateOptions = {
		weekday: "short",
		month: "short",
		day: "numeric",
		year: "numeric",
	};
	const timeOptions = { hour: "numeric", minute: "2-digit" };
	const startHasTime = String(startValue).includes("T");
	const endHasTime = String(endValue).includes("T");
	const startDateText = start.toLocaleDateString(
		"en-US",
		dateOptions,
	);
	if (!end || Number.isNaN(end.getTime())) {
		return startHasTime
			? `${startDateText}, ${start.toLocaleTimeString("en-US", timeOptions)}`
			: startDateText;
	}
	const sameDay =
		start.getFullYear() === end.getFullYear() &&
		start.getMonth() === end.getMonth() &&
		start.getDate() === end.getDate();
	if (sameDay) {
		if (startHasTime || endHasTime)
			return `${startDateText}, ${start.toLocaleTimeString("en-US", timeOptions)} - ${end.toLocaleTimeString("en-US", timeOptions)}`;
		return startDateText;
	}
	return `${formatExactEventDateTime(startValue)} - ${formatExactEventDateTime(endValue)}`;
}
// Computes the next activity id value.
function nextActivityId(event) {
	const used = new Set(
		(event.activities || []).map((activity) => activity.id),
	);
	let counter = (event.activities || []).length + 1;
	while (used.has(`activity-${counter}`)) counter += 1;
	return `activity-${counter}`;
}
// Renders activity summary markup for the event UI.
function renderActivitySummary(activity) {
	return `<article class="month-summary-card">
<div class="panel-heading">
<h3>${activity.description || "Activity"}</h3>
<p>${formatExactEventDateTime(activity.startDate)} - ${formatExactEventDateTime(activity.endDate || activity.startDate)}</p>
</div>
<div class="event-meta">
<span>${activity.location || "Location TBD"}</span>
</div>
</article>`;
}
// Renders calendar expandable event markup for the event UI.
function renderCalendarExpandableEvent(event) {
	return `<details class="month-summary-card event-expand-card">
<summary>
<div class="panel-heading">
<h3>${event.title}</h3>
<p>${event.dateLabel} • ${event.homeBase || "Home base TBD"}</p>
</div>
</summary>
<div class="detail-stack">
<p class="event-description">${event.description}</p>
<div class="event-meta">
<span>${event.category}</span>
<span>${event.audience}</span>${event.repeatEnabled ? `<span>${formatRepeatSummary(event)}</span>` : ""}</div>
<ul class="detail-list">
<li>Location from where all activities will start: ${event.homeBase || "Home base TBD"}</li>
<li>Starts: ${formatExactEventDateTime(event.startDate)}</li>
<li>Ends: ${formatExactEventDateTime(event.endDate || event.startDate)}</li>${event.repeatEnabled ? `<li>${formatRepeatSummary(event)}</li>` : ""}</ul>${event.activities?.length ? `<div class="detail-stack"><h4>Activities</h4>${event.activities.map(renderActivitySummary).join("")}</div>` : ""}<div class="scribe-actions">
<a class="text-link" href="#/events/${event.id}">Open event page</a>
</div>
</div>
</details>`;
}
// Gets event month key for event routing, rendering, or filtering.
function getEventMonthKey(event) {
	const date = parseEventStartDate(event);
	if (!date) {
		return "";
	}
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
// Formats month label for display or form fields.
function formatMonthLabel(monthKey) {
	const [year, month] = monthKey.split("-").map(Number);
	return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
		month: "long",
		year: "numeric",
	});
}
// Gets event months for event routing, rendering, or filtering.
function getEventMonths() {
	const months = new Set();
	events.forEach((event) => {
		const start = parseEventStartDate(event);
		if (!start) {
			return;
		}
		const startMonthKey = getMonthKeyForDate(start);
		months.add(startMonthKey);
		if (!event.repeatEnabled) {
			return;
		}
		const repeatUntil = event.repeatUntil
			? new Date(event.repeatUntil)
			: null;
		const fallbackEnd = new Date(
			prototypeToday.getFullYear() + 1,
			prototypeToday.getMonth(),
			1,
		);
		const limit =
			repeatUntil && !Number.isNaN(repeatUntil.getTime())
				? repeatUntil
				: fallbackEnd;
		let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
		const limitMonth = new Date(
			limit.getFullYear(),
			limit.getMonth(),
			1,
		);
		while (cursor.getTime() <= limitMonth.getTime()) {
			months.add(getMonthKeyForDate(cursor));
			cursor = new Date(
				cursor.getFullYear(),
				cursor.getMonth() + 1,
				1,
			);
		}
	});
	return [...months].sort();
}
// Gets sorted events for event routing, rendering, or filtering.
function getSortedEvents() {
	return [...events].sort(
		(a, b) =>
			(parseEventStartDate(a)?.getTime() || 0) -
			(parseEventStartDate(b)?.getTime() || 0),
	);
}
// Gets selected event month for event routing, rendering, or filtering.
function getSelectedEventMonth() {
	const months = getEventMonths();
	const saved = window.localStorage.getItem("troop883-events-month");
	if (saved && /^\d{4}-\d{2}$/.test(saved)) {
		return saved;
	}
	const todayMonth = getMonthKeyForDate(prototypeToday);
	if (months.includes(todayMonth)) {
		return todayMonth;
	}
	const nextUpcoming = getSortedEvents().find((event) =>
		isUpcomingEvent(event),
	);
	return (
		getEventMonthKey(nextUpcoming) || months[months.length - 1] || ""
	);
}
// Sets selected event month for the current event UI state.
function setSelectedEventMonth(monthKey) {
	if (monthKey) {
		window.localStorage.setItem("troop883-events-month", monthKey);
	}
}
// Gets today date key for event routing, rendering, or filtering.
function getTodayDateKey() {
	return `${prototypeToday.getFullYear()}-${String(prototypeToday.getMonth() + 1).padStart(2, "0")}-${String(prototypeToday.getDate()).padStart(2, "0")}`;
}
// Formats date key for display or form fields.
function formatDateKey(date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
// Parses date key into a usable JavaScript value.
function parseDateKey(dateKey) {
	const [year, month, day] = String(dateKey || "")
		.split("-")
		.map(Number);
	if (!year || !month || !day) {
		return null;
	}
	return new Date(year, month - 1, day);
}
// Gets current month range for event routing, rendering, or filtering.
function getCurrentMonthRange() {
	const start = new Date(
		prototypeToday.getFullYear(),
		prototypeToday.getMonth(),
		1,
	);
	const end = new Date(
		prototypeToday.getFullYear(),
		prototypeToday.getMonth() + 1,
		0,
	);
	return {
		startDate: formatDateKey(start),
		endDate: formatDateKey(end),
	};
}
// Normalizes date range data into the shape used by event views.
function normalizeDateRange(startDate, endDate) {
	const currentMonth = getCurrentMonthRange();
	const start =
		parseDateKey(startDate) || parseDateKey(currentMonth.startDate);
	const end =
		parseDateKey(endDate) || parseDateKey(currentMonth.endDate);
	if (start && end && start.getTime() > end.getTime()) {
		return {
			startDate: formatDateKey(end),
			endDate: formatDateKey(start),
		};
	}
	return {
		startDate: formatDateKey(start),
		endDate: formatDateKey(end),
	};
}
// Gets hash search params for event routing, rendering, or filtering.
function getHashSearchParams(routePrefix) {
	const hash = window.location.hash || "";
	const query = hash.startsWith(routePrefix)
		? hash.slice(routePrefix.length)
		: "";
	return new URLSearchParams(
		query.startsWith("?") ? query.slice(1) : query,
	);
}
// Gets reservation route range for event routing, rendering, or filtering.
function getReservationRouteRange() {
	const params = getHashSearchParams("#/reservations");
	return normalizeDateRange(
		params.get("startDate"),
		params.get("endDate"),
	);
}
// Builds or reads reservation route url for reservation routes.
function reservationRouteUrl(startDate, endDate) {
	const range = normalizeDateRange(startDate, endDate);
	const params = new URLSearchParams(range);
	return `#/reservations?${params.toString()}`;
}
// Builds or reads reservation event route url for reservation routes.
function reservationEventRouteUrl(eventId, startDate, endDate) {
	const range = normalizeDateRange(startDate, endDate);
	const params = new URLSearchParams(range);
	return `#/reservations/${encodeURIComponent(eventId)}?${params.toString()}`;
}
// Gets reservation event route id for event routing, rendering, or filtering.
function getReservationEventRouteId() {
	const hash = window.location.hash || "";
	if (!hash.startsWith("#/reservations/")) {
		return "";
	}
	const path = hash.slice("#/reservations/".length).split("?")[0];
	return decodeURIComponent(path);
}
// Builds or reads reservation route has explicit range for reservation routes.
function reservationRouteHasExplicitRange() {
	const params = getHashSearchParams("#/reservations");
	return Boolean(params.get("startDate") && params.get("endDate"));
}
// Gets month key for date for event routing, rendering, or filtering.
function getMonthKeyForDate(date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
// Gets selected calendar date for event routing, rendering, or filtering.
function getSelectedCalendarDate() {
	return (
		window.localStorage.getItem("troop883-selected-date") ||
		getTodayDateKey()
	);
}
// Sets selected calendar date for the current event UI state.
function setSelectedCalendarDate(dateKey) {
	if (dateKey) {
		window.localStorage.setItem("troop883-selected-date", dateKey);
	}
}
// Gets selected calendar event id for event routing, rendering, or filtering.
function getSelectedCalendarEventId() {
	return (
		window.localStorage.getItem("troop883-selected-event-id") || ""
	);
}
// Sets selected calendar event id for the current event UI state.
function setSelectedCalendarEventId(eventId) {
	if (eventId) {
		window.localStorage.setItem(
			"troop883-selected-event-id",
			eventId,
		);
		return;
	}
	window.localStorage.removeItem("troop883-selected-event-id");
}
// Hydrates public calendar event media with richer data from the API.
async function hydratePublicCalendarEventMedia(
	eventId,
	{ force = false } = {},
) {
	if (!eventId || sessionToken) {
		return;
	}
	if (hydratedPublicEventIds.has(String(eventId))) {
		return;
	}
	const event = getEventById(eventId);
	if (!event) {
		return;
	}
	if (
		!force &&
		event.image &&
		event.image !== scoutOrgLogo &&
		(event.gallery || []).some(
			(item) => normalizeGalleryItem(item).src === event.image,
		)
	) {
		return;
	}
	try {
		const response = await fetch(
			`/api/events/${encodeURIComponent(eventId)}?includeMedia=true`,
			{ cache: "no-store" },
		);
		if (!response.ok) {
			return;
		}
		const payload = await response.json();
		const hydrated = normalizeEvent(payload.data || payload);
		const target = getEventById(eventId);
		if (!target) {
			mergeLoadedEvents([hydrated]);
			return;
		}
		target.image = hydrated.image || target.image;
		target.gallery = hydrated.gallery?.length
			? hydrated.gallery
			: target.gallery;
		hydratedPublicEventIds.add(String(eventId));
	} catch (error) {}
}
// Loads the current route event directly from scouts-landing and scouts-orm.
async function loadEventRouteData(eventId) {
	if (!eventId) {
		return null;
	}
	const routeUrl = currentActor?.authenticated
		? `/api/events/${encodeURIComponent(eventId)}?includeMedia=true`
		: `/api/public/events/${encodeURIComponent(eventId)}`;
	const response = await fetch(routeUrl, {
		cache: "no-store",
		headers: authHeaders(),
	});
	if (!response.ok) {
		throw new Error(`Could not load event ${eventId}`);
	}
	const payload = await response.json();
	const rawEvent = payload.data || payload.event || payload;
	if (!rawEvent || !rawEvent.id) {
		return null;
	}
	currentRouteEvent = rawEvent;
	if (currentActor?.authenticated) {
		mergeLoadedEvents([normalizeEvent(rawEvent)]);
	}
	return rawEvent;
}
// Hydrates landing event window media with richer data from the API.
async function hydrateLandingEventWindowMedia() {
	if (
		sessionToken ||
		!["#/", "", "#"].includes(window.location.hash || "#/")
	) {
		return;
	}
	const eventIds = getLandingEventWindow()
		.map((event) => event.id)
		.filter(Boolean);
	const pendingIds = eventIds.filter(
		(eventId) => !hydratedPublicEventIds.has(String(eventId)),
	);
	if (!pendingIds.length) {
		return;
	}
	await Promise.all(
		pendingIds.map((eventId) =>
			hydratePublicCalendarEventMedia(eventId, { force: true }),
		),
	);
	if (!["#/", "", "#"].includes(window.location.hash || "#/")) {
		return;
	}
	rebuildDerivedData();
	renderRoute();
}
// Gets event detail route id for event routing, rendering, or filtering.
function getEventDetailRouteId() {
	return getEventRouteParts().id;
}
// Gets event route parts for event routing, rendering, or filtering.
function getEventRouteParts() {
	const hash = window.location.hash || "";
	if (
		!hash.startsWith("#/events/") ||
		hash === "#/events/calendar" ||
		hash === "#/events/list"
	) {
		return { id: "", edit: false };
	}
	const rawRoute = hash.replace("#/events/", "");
	const [pathPart, queryPart = ""] = rawRoute.split("?");
	const edit =
		pathPart.endsWith("/edit") ||
		new URLSearchParams(queryPart).get("edit") === "true";
	const id = pathPart.replace(/\/edit$/, "");
	return { id, edit };
}
// Checks whether event edit route applies.
function isEventEditRoute() {
	return getEventRouteParts().edit;
}
// Scrolls selected calendar event into view in the event UI.
function scrollSelectedCalendarEventIntoView() {
	const scrollToShowcase = () => {
		const showcase = document.querySelector(
			"[data-calendar-event-showcase]",
		);
		if (!showcase) {
			return;
		}
		showcase.setAttribute("tabindex", "-1");
		showcase.focus({ preventScroll: false });
		const top =
			showcase.getBoundingClientRect().top + window.scrollY - 16;
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
// Requests selected calendar event scroll after the next render frame.
function requestSelectedCalendarEventScroll() {
	pendingCalendarEventScroll = true;
}
// Flushes selected calendar event scroll immediately when pending work must finish.
function flushSelectedCalendarEventScroll() {
	if (!pendingCalendarEventScroll) {
		return;
	}
	pendingCalendarEventScroll = false;
	scrollSelectedCalendarEventIntoView();
}
// Ensures selected month is selected before rendering.
function ensureSelectedMonth() {
	const resolvedMonth = getSelectedEventMonth();
	if (resolvedMonth) {
		window.localStorage.setItem(
			"troop883-events-month",
			resolvedMonth,
		);
		const selectedDate = getSelectedCalendarDate();
		if (!selectedDate.startsWith(resolvedMonth)) {
			const firstEvent = getSortedEvents().find(
				(event) => getEventMonthKey(event) === resolvedMonth,
			);
			const fallbackDateKey = firstEvent
				? formatDateKey(parseEventStartDate(firstEvent))
				: `${resolvedMonth}-01`;
			window.localStorage.setItem(
				"troop883-selected-date",
				resolvedMonth === getMonthKeyForDate(prototypeToday)
					? getTodayDateKey()
					: fallbackDateKey,
			);
		}
	}
	return resolvedMonth;
}
// Formats full date for display or form fields.
function formatFullDate(dateKey) {
	const date = parseDateKey(dateKey);
	return date
		? date.toLocaleDateString("en-US", {
				weekday: "long",
				month: "long",
				day: "numeric",
				year: "numeric",
			})
		: "";
}
// Formats date label from key for display or form fields.
function formatDateLabelFromKey(dateKey) {
	const date = parseDateKey(dateKey);
	return date
		? date.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
			})
		: "";
}
// Computes the next event id value.
function nextEventId() {
	const existing = new Set(events.map((event) => event.id));
	let counter = events.length + 1;
	while (existing.has(`event-${counter}`)) counter += 1;
	return `event-${counter}`;
}
// Formats event storage value for display or form fields.
function formatEventStorageValue(date, includeTime) {
	if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
		return "";
	}
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	if (!includeTime) {
		return `${year}-${month}-${day}`;
	}
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	return `${year}-${month}-${day}T${hours}:${minutes}`;
}
// Gets future event schedule for event routing, rendering, or filtering.
function getFutureEventSchedule(startValue, endValue) {
	const sourceStart = startValue ? new Date(startValue) : null;
	const sourceEnd = endValue ? new Date(endValue) : null;
	const startHasTime = String(startValue || "").includes("T");
	const endHasTime = String(endValue || "").includes("T");
	const durationMs =
		sourceStart &&
		sourceEnd &&
		!Number.isNaN(sourceStart.getTime()) &&
		!Number.isNaN(sourceEnd.getTime())
			? Math.max(0, sourceEnd.getTime() - sourceStart.getTime())
			: 9 * 60 * 60 * 1000;
	const nextStart =
		sourceStart && !Number.isNaN(sourceStart.getTime())
			? new Date(sourceStart)
			: new Date(
					prototypeToday.getFullYear(),
					prototypeToday.getMonth(),
					prototypeToday.getDate(),
					8,
					0,
					0,
					0,
				);
	do {
		nextStart.setDate(nextStart.getDate() + 7);
	} while (
		startOfDay(nextStart).getTime() <=
		startOfDay(prototypeToday).getTime()
	);
	const nextEnd = new Date(nextStart.getTime() + durationMs);
	const nextStartValue = formatEventStorageValue(
		nextStart,
		startHasTime,
	);
	const nextEndValue = formatEventStorageValue(
		nextEnd,
		endHasTime || startHasTime,
	);
	return {
		startDate: nextStartValue,
		endDate: nextEndValue,
		dateLabel: formatEventDateLabelFromRange(
			nextStartValue,
			nextEndValue,
		),
	};
}
// Clones gallery item for event so duplicated events keep independent media.
function cloneGalleryItemForEvent(item, index) {
	const normalized = normalizeGalleryItem(item, index);
	return {
		...normalized,
		id: `image-${Date.now()}-${index + 1}`,
		comments: (normalized.comments || []).map(
			(comment, commentIndex) =>
				normalizeImageComment(
					{ ...comment, id: `comment-${commentIndex + 1}` },
					commentIndex,
				),
		),
		reactions: normalizeImageReactions(
			normalized.reactions || normalized,
		),
	};
}
// Duplicates event as future as a new future event.
async function duplicateEventAsFuture(sourceEventId) {
	const sourceEvent = getEventById(sourceEventId);
	if (!sourceEvent) {
		return null;
	}
	const schedule = getFutureEventSchedule(
		sourceEvent.startDate,
		sourceEvent.endDate || sourceEvent.startDate,
	);
	const duplicate = normalizeEvent({
		...sourceEvent,
		id: nextEventId(),
		title: `Copy of ${sourceEvent.title}`,
		startDate: schedule.startDate,
		endDate: schedule.endDate,
		dateLabel: schedule.dateLabel,
		upcoming: true,
		activities: (sourceEvent.activities || []).map(
			(activity, index) =>
				normalizeActivity(
					{ ...activity, id: `activity-${index + 1}` },
					index,
				),
		),
		gallery: (sourceEvent.gallery || []).map((item, index) =>
			cloneGalleryItemForEvent(item, index),
		),
	});
	duplicate.image =
		duplicate.gallery[0]?.src || sourceEvent.image || scoutOrgLogo;
	events = [...events, duplicate];
	await saveEvents();
	const startDate = parseEventStartDate(duplicate) || prototypeToday;
	setSelectedEventMonth(getMonthKeyForDate(startDate));
	setSelectedCalendarDate(formatDateKey(startDate));
	setSelectedCalendarEventId(duplicate.id);
	return duplicate;
}
// Creates event for date defaults for new event records.
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
		detailNote:
			"Use this page to finish the event details and visitor-facing notes.",
		activities: [],
		image: scoutOrgLogo,
		gallery: [scoutOrgLogo],
		upcoming:
			parseDateKey(dateKey)?.getTime() >=
			new Date(
				prototypeToday.getFullYear(),
				prototypeToday.getMonth(),
				prototypeToday.getDate(),
			).getTime(),
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
	setSelectedEventMonth(
		getMonthKeyForDate(parseDateKey(dateKey) || prototypeToday),
	);
	setSelectedCalendarDate(dateKey);
	setSelectedCalendarEventId(event.id);
	return event;
}
// Renders calendar event showcase markup for the event UI.
function renderCalendarEventShowcase(event) {
	if (!event) {
		return `<article class="panel calendar-event-showcase empty" data-calendar-event-showcase>
<div class="panel-heading">
<h3>Select an event</h3>
<p>Click any event on the calendar to see the full event summary here.</p>
</div>
<p class="event-description">The calendar stays in place while this panel updates with the chosen event's details.</p>
</article>`;
	}
	const activities = event.activities || [];
	const gallery = getDisplayMediaItems(event).filter(
		(item) => item?.src,
	);
	const leadMedia =
		gallery[0] ||
		normalizeGalleryItem({ src: event.image || scoutOrgLogo }, 0);
	const leadMediaMarkup = renderGalleryMedia(
		leadMedia,
		getGalleryDisplayTitle(event, leadMedia, 0),
	).replace(
		'class="event-gallery-media"',
		'class="calendar-event-image"',
	);
	const locationIcon = `<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
<path d="M12 2a7 7 0 0 1 7 7c0 4.95-5.06 10.7-6.34 12.08a.9.9 0 0 1-1.32 0C10.06 19.7 5 13.95 5 9a7 7 0 0 1 7-7Zm0 9.5A2.5 2.5 0 1 0 12 6a2.5 2.5 0 0 0 0 5.5Z" fill="currentColor"/>
</svg>`;
	const calendarIcon = `<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
<path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8ZM5 6a1 1 0 0 0-1 1v1h16V7a1 1 0 0 0-1-1H5Z" fill="currentColor"/>
</svg>`;
	const activitiesMarkup = activities.length
		? `<div class="calendar-event-sections single">
<section class="panel">
<div class="panel-heading">
<h3>Activities</h3>
<p>${activities.length} planned item${activities.length === 1 ? "" : "s"}</p>
</div>
<div class="detail-stack">${activities.map((activity) => `<article class="month-summary-card"><div class="panel-heading"><h3>${activity.description || "Activity"}</h3><p>${formatEventReviewDateTimeRange(activity)}</p></div><div class="event-meta"><span>${activity.location || "Location TBD"}</span></div></article>`).join("")}</div>
</section>
</div>`
		: "";
	return `<article class="calendar-event-showcase${isAdultEvent(event) ? " adult-event-theme" : ""}" data-calendar-event-showcase>
<div class="calendar-event-hero">
<div class="calendar-event-image-wrap">${leadMediaMarkup}</div>
<div class="calendar-event-copy">
<p class="eyebrow">Selected event</p>
<div class="calendar-event-title-row">
<h3>${event.title}</h3>
<div class="event-meta compact">
<span>${event.category || "Event"}</span>
<span>${event.audience || "Audience TBD"}</span>${event.repeatEnabled ? `<span>${formatRepeatSummary(event)}</span>` : ""}</div>
</div>
<p class="event-description">${event.description || "No event description yet."}</p>
<div class="calendar-event-review-meta">
<div class="calendar-event-icon-row">
<span class="calendar-event-review-icon">${locationIcon}</span>
<strong>${event.homeBase || "Home base TBD"}</strong>
</div>
<div class="calendar-event-icon-row">
<span class="calendar-event-review-icon">${calendarIcon}</span>
<strong>${formatEventReviewDateTimeRange(event)}</strong>
</div>
</div>
<div class="detail-note">${event.detailNote || "No additional event note yet."}</div>
<div class="scribe-actions">
<a class="button secondary" href="#/events/${event.id}">Open full event page</a>${canSeeOrgChart() ? `<a class="button secondary" href="#/events/${event.id}?edit=true">Edit event</a>` : ""}</div>
</div>
</div>${activitiesMarkup}</article>`;
}
// Renders image reaction buttons markup for the event UI.
function renderImageReactionButtons(image) {
	const viewer = getCurrentViewerIdentity();
	return `<div class="image-reaction-row">${imageReactionTypes
		.map((reactionType) => {
			const count = (image.reactions?.[reactionType] || []).length;
			const isActive = viewer
				? (image.reactions?.[reactionType] || []).includes(viewer.id)
				: false;
			const label =
				reactionType === "disappointed"
					? "Disappointed"
					: reactionType.charAt(0).toUpperCase() +
						reactionType.slice(1);
			return `<button class="button secondary image-reaction-button${isActive ? " is-active" : ""}" type="button" data-gallery-reaction="${reactionType}" data-gallery-image-id="${image.id}"${canInteractWithGallerySocial() ? "" : " disabled"}>${label}${count ? ` (${count})` : ""}</button>`;
		})
		.join("")}</div>`;
}
// Renders image comments markup for the event UI.
function renderImageComments(image) {
	const comments = image.comments || [];
	return `<div class="image-comments">
<div class="panel-heading compact">
<h4>Comments</h4>
<p>${comments.length ? `${comments.length} comment${comments.length === 1 ? "" : "s"}` : "No comments yet."}</p>
</div>${
		comments.length
			? `<div class="image-comment-list">${comments
					.map(
						(comment) => `<article class="image-comment">
<div class="image-comment-meta">
<strong>${comment.authorName}</strong>
<span>${formatCommentDateTime(comment.createdAt)}</span>
</div>
<p>${comment.text}</p>${canRemoveGalleryComment(comment) ? `<button class="text-link image-comment-remove" type="button" data-remove-gallery-comment="${comment.id}" data-gallery-image-id="${image.id}">Remove comment</button>` : ""}</article>`,
					)
					.join("")}</div>`
			: `<p class="event-description">Be the first to comment on this image.</p>`
	}${canInteractWithGallerySocial() ? `<div class="image-comment-form"><textarea data-gallery-comment-input="${image.id}" aria-label="Write a comment for ${image.title || `image ${image.id}`}" placeholder="Add a comment"></textarea><button class="button secondary" type="button" data-add-gallery-comment="${image.id}">Post comment</button></div>` : `<p class="event-description">Sign in to comment or react.</p>`}</div>`;
}
// Renders gallery media markup for the event UI.
function renderGalleryMedia(image, title) {
	if (image.mediaType === "video") {
		return `<video class="event-gallery-media" controls preload="metadata" playsinline title="${title}" src="${image.src}">
</video>`;
	}
	return `<img class="event-gallery-media" src="${image.src}" alt="${title}" />`;
}
// Closes media lightbox UI state.
function closeMediaLightbox() {
	document.querySelector("[data-media-lightbox]")?.remove();
	document.body.classList.remove("media-lightbox-open");
}
// Opens media lightbox and loads any needed event data.
function openMediaLightbox(eventId, mediaIndex) {
	const event = getEventById(eventId);
	const mediaItems = getDisplayMediaItems(event);
	const item = mediaItems[mediaIndex];
	if (!event || !item) {
		return;
	}
	closeMediaLightbox();
	const mediaMarkup =
		item.mediaType === "video"
			? `<video class="media-lightbox-media" controls autoplay preload="metadata" playsinline>
</video>`
			: `<img class="media-lightbox-media" src="${item.src}" alt="${event.title}" />`;
	document.body.insertAdjacentHTML(
		"beforeend",
		`<div class="media-lightbox" data-media-lightbox>
<button class="media-lightbox-backdrop" type="button" data-close-media-lightbox aria-label="Close media viewer">
</button>
<div class="media-lightbox-dialog">
<button class="media-lightbox-close" type="button" data-close-media-lightbox aria-label="Close media viewer">&times;</button>${mediaMarkup}<p class="media-lightbox-caption">${getGalleryDisplayTitle(event, item, mediaIndex)}</p>
</div>
</div>`,
	);
	document.body.classList.add("media-lightbox-open");
	if (item.mediaType === "video") {
		const lightboxVideo = document.querySelector(
			".media-lightbox-media",
		);
		if (lightboxVideo) {
			lightboxVideo.src = item.src;
			lightboxVideo.load();
			lightboxVideo.play().catch(() => {});
		}
	}
}
// Renders event card media markup for the event UI.
function renderEventCardMedia(event, item, index, active) {
	if (item.mediaType === "video") {
		const activeClass = active === null || active ? " is-active" : "";
		return `<div class="event-card-video-shell carousel-slide${activeClass}">
<div class="event-card-video-preview${activeClass}">
<div class="event-card-video-badge">Video</div>
<p>${getGalleryDisplayTitle(event, item, index)}</p>
<button class="media-popout-button" type="button" data-open-card-media="${event.id}" data-open-card-media-index="${index}">Open video</button>
</div>
</div>`;
	}
	if (active !== null) {
		return `<img src="${item.src}" alt="${event.title} photo ${index + 1}" class="carousel-image carousel-slide${active ? " is-active" : ""}" />`;
	}
	return `<img src="${item.src}" alt="${event.title} event image" />`;
}
// Checks whether adult event applies.
function isAdultEvent(event) {
	return (
		String(event?.audience || "")
			.trim()
			.toLowerCase() === "adults"
	);
}
// Gets gallery display title for event routing, rendering, or filtering.
function getGalleryDisplayTitle(event, image, index) {
	const mediaLabel = image.mediaType === "video" ? "video" : "photo";
	return (
		image.description ||
		image.title ||
		`${event.title} ${mediaLabel} ${index + 1}`
	);
}
// Renders gallery image card markup for the event UI.
function renderGalleryImageCard(event, image, index, editable) {
	const mediaLabel = image.mediaType === "video" ? "video" : "image";
	const displayTitle = getGalleryDisplayTitle(event, image, index);
	const displayDescription =
		image.description ||
		(editable
			? "Add a short caption or context for this image."
			: "No image description yet.");
	return `<figure class="event-gallery-item${editable ? " event-gallery-item-editable image-social-card" : " image-social-card"}" data-gallery-item="${image.id}" data-gallery-src="${image.src}">${renderGalleryMedia(image, displayTitle)}${editable ? `<figcaption><input type="text" data-gallery-title="${image.id}" value="${displayTitle}" placeholder="${image.mediaType === "video" ? "Video title" : "Image title"}" aria-label="Title for ${mediaLabel} ${index + 1}" /><textarea data-gallery-description="${image.id}" placeholder="${image.mediaType === "video" ? "Video description" : "Image description"}" aria-label="Description for ${mediaLabel} ${index + 1}">${image.description}</textarea><p class="gallery-primary-note">${index === 0 ? "Primary event image" : "Choose this item only if you want it to become the primary event image."}</p><div class="gallery-item-actions"><button class="button secondary gallery-action-button" type="button" data-make-primary-image="${image.id}">${index === 0 ? "Primary event image" : "Set as primary event image"}</button><button class="button danger gallery-action-button" type="button" data-remove-gallery-image="${image.id}">Remove</button></div>${renderImageReactionButtons(image)}${renderImageComments(image)}</figcaption>` : `<figcaption><strong>${displayTitle}</strong><p>${displayDescription}</p>${renderImageReactionButtons(image)}${renderImageComments(image)}</figcaption>`}</figure>`;
}
// Gets gallery image by id for event routing, rendering, or filtering.
function getGalleryImageById(event, imageId) {
	return (
		(event.gallery || []).find((image) => image.id === imageId) ||
		null
	);
}
// Builds calendar cells for event display.
function buildCalendarCells(monthKey) {
	const [year, month] = monthKey.split("-").map(Number);
	const firstDay = new Date(year, month - 1, 1);
	const daysInMonth = new Date(year, month, 0).getDate();
	const startOffset = firstDay.getDay();
	const eventsByDay = new Map();
	for (let day = 1; day <= daysInMonth; day += 1) {
		const currentDate = new Date(year, month - 1, day);
		eventsByDay.set(
			day,
			events
				.filter((event) => eventOccursOnDate(event, currentDate))
				.sort(
					(a, b) =>
						(parseEventStartDate(a)?.getTime() || 0) -
						(parseEventStartDate(b)?.getTime() || 0),
				),
		);
	}
	const cells = [];
	for (let index = 0; index < startOffset; index += 1)
		cells.push({ empty: true, key: `empty-${index}` });
	for (let day = 1; day <= daysInMonth; day += 1)
		cells.push({
			empty: false,
			day,
			events: eventsByDay.get(day) || [],
			key: `day-${day}`,
		});
	while (cells.length % 7 !== 0)
		cells.push({ empty: true, key: `tail-${cells.length}` });
	return cells;
}
// Formats event list date for display or form fields.
function formatEventListDate(event) {
	const date = parseEventStartDate(event);
	return date
		? date.toLocaleDateString("en-US", {
				weekday: "short",
				month: "short",
				day: "numeric",
			})
		: event.dateLabel;
}
// Adds months while preserving calendar semantics.
function addMonths(date, months) {
	const next = new Date(date);
	const day = next.getDate();
	next.setMonth(next.getMonth() + months);
	if (next.getDate() !== day) {
		next.setDate(0);
	}
	return next;
}
// Gets event range start for event routing, rendering, or filtering.
function getEventRangeStart() {
	return startOfDay(addMonths(prototypeToday, -2));
}
// Gets event range end for event routing, rendering, or filtering.
function getEventRangeEnd() {
	const end = addMonths(prototypeToday, 2);
	end.setHours(23, 59, 59, 999);
	return end;
}
// Gets rolling event list for event routing, rendering, or filtering.
function getRollingEventList(direction) {
	const today = startOfDay(prototypeToday);
	const rangeStart = getEventRangeStart();
	const rangeEnd = getEventRangeEnd();
	return events
		.filter((event) => {
			const date = parseEventStartDate(event);
			if (!date) {
				return false;
			}
			const time = date.getTime();
			if (direction === "past") {
				return time < today.getTime() && time >= rangeStart.getTime();
			}
			return time >= today.getTime() && time <= rangeEnd.getTime();
		})
		.sort((a, b) =>
			direction === "past"
				? (parseEventStartDate(b)?.getTime() || 0) -
					(parseEventStartDate(a)?.getTime() || 0)
				: (parseEventStartDate(a)?.getTime() || 0) -
					(parseEventStartDate(b)?.getTime() || 0),
		)
		.slice(0, 3);
}
// Gets landing event window for event routing, rendering, or filtering.
function getCalendarHighlightDataset(options = {}) {
	const sourceEvents = options.sourceEvents || getSortedEvents();
	const rangeStart = options.rangeStart || getEventRangeStart();
	const rangeEnd = options.rangeEnd || getEventRangeEnd();
	return [...sourceEvents].filter((event) => {
		const start = parseEventStartDate(event);
		const end = parseEventEndDate(event) || start;
		if (!start || !end) {
			return false;
		}
		return (
			start.getTime() <= rangeEnd.getTime() &&
			end.getTime() >= rangeStart.getTime()
		);
	});
}
// Gets landing event window for event routing, rendering, or filtering.
function getLandingEventWindow() {
	return getCalendarHighlightDataset();
}
// Gets current event index for event routing, rendering, or filtering.
function getCurrentEventIndex(items) {
	const today = startOfDay(prototypeToday).getTime();
	const upcomingIndex = items.findIndex(
		(event) => (parseEventStartDate(event)?.getTime() || 0) >= today,
	);
	return upcomingIndex >= 0
		? upcomingIndex
		: Math.max(0, items.length - 1);
}
// Requests upcoming scroller center after the next render frame.
function requestUpcomingScrollerCenter() {
	window.requestAnimationFrame(() => {
		const scroller = document.querySelector(
			"[data-upcoming-scroller]",
		);
		const target = document.querySelector("[data-upcoming-current]");
		if (!scroller || !target) {
			return;
		}
		const vertical =
			scroller.scrollHeight > scroller.clientHeight &&
			scroller.scrollWidth <= scroller.clientWidth + 4;
		if (vertical) {
			scroller.scrollTop =
				target.offsetTop -
				(scroller.clientHeight - target.clientHeight) / 2;
			return;
		}
		scroller.scrollLeft =
			target.offsetLeft -
			(scroller.clientWidth - target.clientWidth) / 2;
	});
}
// Scrolls upcoming events in the event UI.
function scrollUpcomingEvents(direction) {
	const scroller = document.querySelector("[data-upcoming-scroller]");
	const current =
		document.querySelector("[data-upcoming-current]") ||
		scroller?.querySelector("[data-upcoming-card]");
	if (!scroller || !current) {
		return;
	}
	const step = Math.round(
		(current.getBoundingClientRect().width || 320) + 20,
	);
	const vertical =
		scroller.scrollHeight > scroller.clientHeight &&
		scroller.scrollWidth <= scroller.clientWidth + 4;
	scroller.scrollBy({
		left: vertical ? 0 : direction * step,
		top: vertical ? direction * step : 0,
		behavior: "smooth",
	});
}
// Renders the landing-page calendar highlight carousel.
function renderTroopCalendarHighlightsSection() {
	const landingEvents = getLandingEventWindow();
	const currentEventIndex = getCurrentEventIndex(landingEvents);
	const rangeLabel = `${getEventRangeStart().toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${getEventRangeEnd().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
	return renderCalendarHighlightsSectionFromLib({
		events: landingEvents,
		currentIndex: currentEventIndex,
		title: "Troop calendar highlights",  // change title if want to have something different
		eyebrow: "Current Events",
		rangeLabel,
		cardRenderer: renderLandingScrollerCard,
	});
}
// Gets event detail preview events for event routing, rendering, or filtering.
function getEventDetailPreviewEvents() {
	const sortedEvents = getSortedEvents();
	const recentEvents = sortedEvents
		.filter((event) => !isUpcomingEvent(event))
		.slice(-2);
	const upcomingEvents = sortedEvents
		.filter((event) => isUpcomingEvent(event))
		.slice(0, 2);
	return [...recentEvents, ...upcomingEvents];
}

// Builds the public events API URL for the rolling landing-page event window.
function publicEventsUrl() {
	const params = new URLSearchParams({
		startDate: formatDateKey(getEventRangeStart()),
		endDate: formatDateKey(getEventRangeEnd()),
		page: "1",
		pageSize: "100",
	});
	return `/api/public?${params.toString()}`;
}
// Builds the initial public data URL for the current route.
function publicInitialDataUrl() {
	const eventId = getEventDetailRouteId();
	return eventId
		? `/api/events/${encodeURIComponent(eventId)}`
		: publicEventsUrl();
}
// Gets calendar month range for event routing, rendering, or filtering.
function getCalendarMonthRange(monthKey) {
	const [year, month] = String(monthKey || "")
		.split("-")
		.map(Number);
	if (!year || !month) {
		return null;
	}
	return {
		startDate: formatDateKey(new Date(year, month - 1, 1)),
		endDate: formatDateKey(new Date(year, month, 0)),
	};
}
// Builds calendar events url for calendar event loading.
function calendarEventsUrl(monthKey) {
	const range = getCalendarMonthRange(monthKey);
	if (!range) {
		return "";
	}
	const params = new URLSearchParams({
		...range,
		page: "1",
		pageSize: "100",
	});
	return `/api/events?${params.toString()}`;
}
// Builds or checks events range url behavior.
function eventsRangeUrl(startDate, endDate) {
	const params = new URLSearchParams({
		startDate,
		endDate,
		page: "1",
		pageSize: "100",
	});
	return `/api/events?${params.toString()}`;
}
// Loads calendar month events into the event state used by the app.
async function loadCalendarMonthEvents(monthKey) {
	if (
		!/^\d{4}-\d{2}$/.test(String(monthKey || "")) ||
		loadedCalendarMonths.has(monthKey)
	) {
		return;
	}
	const response = await fetch(calendarEventsUrl(monthKey), {
		cache: "no-store",
		headers: authHeaders(),
	});
	if (!response.ok) {
		throw new Error(`Could not load events for ${monthKey}`);
	}
	const payload = await response.json();
	const incomingEvents = Array.isArray(payload.events)
		? payload.events
		: Array.isArray(payload.data?.events)
			? payload.data.events
			: [];
	mergeLoadedEvents(incomingEvents);
	loadedCalendarMonths.add(monthKey);
	rebuildDerivedData();
}
// Loads reservation range events into the event state used by the app.
async function loadReservationRangeEvents() {
	const { startDate, endDate } = getReservationRouteRange();
	const response = await fetch(eventsRangeUrl(startDate, endDate), {
		cache: "no-store",
		headers: authHeaders(),
	});
	if (!response.ok) {
		throw new Error(
			`Could not load reservations for ${startDate} through ${endDate}`,
		);
	}
	const payload = await response.json();
	const incomingEvents = Array.isArray(payload.events)
		? payload.events
		: Array.isArray(payload.data?.events)
			? payload.data.events
			: [];
	mergeLoadedEvents(incomingEvents);
	rebuildDerivedData();
}
// Opens calendar month and loads any needed event data.
async function openCalendarMonth(monthKey, dateKey = "") {
	if (!/^\d{4}-\d{2}$/.test(String(monthKey || ""))) {
		return;
	}
	const selectedDate = getSelectedCalendarDate();
	setSelectedEventMonth(monthKey);
	setSelectedCalendarDate(
		dateKey ||
			(selectedDate.startsWith(monthKey)
				? selectedDate
				: `${monthKey}-01`),
	);
	setAppLoading("Loading calendar");
	try {
		await loadCalendarMonthEvents(monthKey);
	} catch (error) {
		console.warn(error);
	} finally {
		clearAppLoading();
	}
	renderRoute();
}
// Loads event data into the event state used by the app.
async function loadEventData(fallbackEvents = []) {
	return Array.isArray(fallbackEvents) ? fallbackEvents : [];
}

// Renders event card markup for the event UI.
const renderEventCard = (event) => {
	const mediaItems = getDisplayMediaItems(event);
	return `<article class="event-card${isAdultEvent(event) ? " adult-event-theme" : ""}">
<div class="image-wrap">${
		mediaItems.length > 1
			? `<div class="carousel" data-index="0"><div class="carousel-track">${mediaItems.map((item, index) => renderEventCardMedia(event, item, index, index === 0)).join("")}</div><button class="carousel-button prev" type="button" aria-label="Previous media">&#8249;</button><button class="carousel-button next" type="button" aria-label="Next media">&#8250;</button><div class="carousel-dots">${mediaItems
					.map(
						(
							_,
							index,
						) => `<button class="carousel-dot${index === 0 ? " is-active" : ""}" type="button" data-slide="${index}" aria-label="Go to media ${index + 1}">
</button>`,
					)
					.join("")}</div></div>`
			: renderEventCardMedia(event, mediaItems[0], 0, null)
	}<span class="category-pill">${event.category}</span>
</div>
<div class="event-content">
<p class="event-date">${event.dateLabel}</p>
<h3>
<a class="text-link" href="#/events/${event.id}">${event.title}</a>
</h3>
<p class="event-description">${event.description}</p>
<div class="event-meta">
<span>${event.location}</span>
<span>${event.audience}</span>
</div>
</div>
</article>`;
};
// Renders parent event card markup for the event UI.
const renderParentEventCard = (event, registeredScouts = []) => {
	const mediaItems = getDisplayMediaItems(event);
	return `<article class="event-card${isAdultEvent(event) ? " adult-event-theme" : ""}">
<div class="image-wrap">${
		mediaItems.length > 1
			? `<div class="carousel" data-index="0"><div class="carousel-track">${mediaItems.map((item, index) => renderEventCardMedia(event, item, index, index === 0)).join("")}</div><button class="carousel-button prev" type="button" aria-label="Previous media">&#8249;</button><button class="carousel-button next" type="button" aria-label="Next media">&#8250;</button><div class="carousel-dots">${mediaItems
					.map(
						(
							_,
							index,
						) => `<button class="carousel-dot${index === 0 ? " is-active" : ""}" type="button" data-slide="${index}" aria-label="Go to media ${index + 1}">
</button>`,
					)
					.join("")}</div></div>`
			: renderEventCardMedia(event, mediaItems[0], 0, null)
	}<span class="category-pill">${event.category}</span>
</div>
<div class="event-content">
<p class="event-date">${event.dateLabel}</p>
<h3>
<a class="text-link" href="#/events/${event.id}">${event.title}</a>
</h3>
<p class="event-description">${event.description}</p>
<div class="event-meta">
<span>${event.location}</span>
<span>${event.audience}</span>
</div>
<div class="registered-scouts">
<span class="registered-scouts-label">${registeredScouts.length === 1 ? "Registered scout" : "Registered scouts"}</span>${registeredScouts.map((scout) => `<span class="registered-scout-chip">${scout.name}</span>`).join("")}</div>
</div>
</article>`;
};
// Renders event detail markup for the event UI.
const renderEventDetail = (event) => {
	const leadMedia =
		getDisplayMediaItems(event)[0] ||
		normalizeGalleryItem({ src: event.image }, 0);
	return `<article class="detail-panel${isAdultEvent(event) ? " adult-event-theme" : ""}" id="${event.id}">${renderGalleryMedia(leadMedia, getGalleryDisplayTitle(event, leadMedia, 0)).replace('class="event-gallery-media"', 'class="detail-image"')}<div class="detail-body">
<p class="event-date">${event.dateLabel}</p>
<h3>${event.title}</h3>
<p class="event-description">${event.description}</p>
<div class="event-meta">
<span>${event.category}</span>
<span>${event.location}</span>
<span>${event.audience}</span>
</div>
<div class="detail-note">${event.detailNote}</div>
</div>
</article>`;
};

// Renders landing scroller card markup for the event UI.
function renderLandingScrollerCard(event, index, currentIndex) {
	const mediaItems = getDisplayMediaItems(event);
	const isCurrent = index === currentIndex;
	const activityLabels = cardActivityLabels(event);
	const locationLabel = eventCardLocationLabel(event);
	const dateLabel = eventCardDateLabel(event);
	const scheduleItemClass = dateLabel
		? "landing-event-meta-item is-date"
		: "landing-event-meta-item is-date is-empty";
	const locationItemClass = locationLabel
		? "landing-event-meta-item"
		: "landing-event-meta-item is-empty";
	return `<article class="event-card landing-event-card${isAdultEvent(event) ? " adult-event-theme" : ""}${isCurrent ? " is-current" : ""}" data-upcoming-card="${index}"${isCurrent ? " data-upcoming-current" : ""} data-open-event-card="#/events/${event.id}" tabindex="0" role="link" aria-label="Open event ${event.title}">
<div class="image-wrap">${
		mediaItems.length > 1
			? `<div class="carousel" data-index="0"><div class="carousel-track">${mediaItems.map((item, mediaIndex) => renderEventCardMedia(event, item, mediaIndex, mediaIndex === 0)).join("")}</div><button class="carousel-button prev" type="button" aria-label="Previous media">&#8249;</button><button class="carousel-button next" type="button" aria-label="Next media">&#8250;</button><div class="carousel-dots">${mediaItems
					.map(
						(
							_,
							mediaIndex,
						) => `<button class="carousel-dot${mediaIndex === 0 ? " is-active" : ""}" type="button" data-slide="${mediaIndex}" aria-label="Go to media ${mediaIndex + 1}">
</button>`,
					)
					.join("")}</div></div>`
			: renderEventCardMedia(event, mediaItems[0], 0, null)
	}<span class="category-pill">${event.category}</span>
</div>
<div class="event-content landing-event-content">
<h3>${event.title}</h3>
<p class="event-description">${event.description || "More troop event details are coming soon."}</p>
<div class="landing-event-activities-wrap">${activityLabels.length ? `<ul class="landing-event-activities">${activityLabels.map((label) => `<li title="${label}">${label}</li>`).join("")}</ul>` : `<div class="landing-event-activities-empty" aria-hidden="true"></div>`}</div>
<div class="landing-event-footer">
<div class="${scheduleItemClass}"${dateLabel ? ` title="${dateLabel}"` : ""}>
<span class="landing-event-meta-icon" aria-hidden="true">
<svg viewBox="0 0 24 24" focusable="false">
<path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8ZM5 6a1 1 0 0 0-1 1v1h16V7a1 1 0 0 0-1-1H5Z" fill="currentColor"/>
</svg>
</span>${renderLandingEventDateLabel(dateLabel)}</div>
<div class="${locationItemClass}"${locationLabel ? ` title="${locationLabel}"` : ""}>
<span class="landing-event-meta-icon" aria-hidden="true">
<svg viewBox="0 0 24 24" focusable="false">
<path d="M12 2a7 7 0 0 1 7 7c0 4.95-5.06 10.7-6.34 12.08a.9.9 0 0 1-1.32 0C10.06 19.7 5 13.95 5 9a7 7 0 0 1 7-7Zm0 9.5A2.5 2.5 0 1 0 12 6a2.5 2.5 0 0 0 0 5.5Z" fill="currentColor"/>
</svg>
</span>
<span class="landing-event-meta-text">${locationLabel}</span>
</div>
</div>
</div>
</article>`;
}
// Renders public markup for the event UI.
function renderPublic() {
	const sortedEvents = getSortedEvents();
	const upcoming = sortedEvents.filter((event) =>
		isUpcomingEvent(event),
	);
	const nextEvent = upcoming[0] || null;
	const nextEventLocation =
		nextEvent?.location || nextEvent?.homeBase || "";

	app.innerHTML = `${topNav()}<section class="hero">
<div class="hero-copy">
<p class="eyebrow">Public landing page</p>
<h2>Adventure, leadership, and a troop community that families can join.</h2>
<p>This non-logged-in version highlights troop events in a two-month window on either side of today, presents event imagery, and invites families to explore the full event details.</p>
</div>
<div class="hero-card">
<p class="hero-card-label">Next upcoming event</p>
<h3>${nextEvent ? `<a class="text-link" href="#/events/${nextEvent.id}">${nextEvent.title}</a>` : "No event scheduled"}</h3>
<p class="hero-event-meta">${nextEvent ? `${nextEvent.dateLabel} &bull; ${nextEvent.location}` : "Check back soon for the next troop event."}</p>
<p>${nextEvent ? nextEvent.description : "The troop calendar is ready for the next event update."}</p>${nextEventLocation ? `<div class="hero-card-map"><div class="hero-card-map-frame"><iframe class="hero-card-map-embed" src="${mapUrlForLocation(nextEventLocation)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Map for ${nextEventLocation}"></iframe><a class="hero-card-map-overlay" href="${directionsUrlForLocation(nextEventLocation)}" target="_blank" rel="noreferrer" aria-label="Open directions to ${nextEventLocation}"><span>Directions</span></a></div><a class="hero-card-map-link" href="${directionsUrlForLocation(nextEventLocation)}" target="_blank" rel="noreferrer">Open directions to ${nextEventLocation}</a></div>` : ""}</div>
</section>
${renderTroopCalendarHighlightsSection()}`;
	requestUpcomingScrollerCenter();
}

// Counts event reservations for reservation summaries.
function countEventReservations(event) {
	const registrations = event.registrations || [];
	const scoutIds = new Set(
		registrations
			.filter((registration) => registration.personType === "scout")
			.map((registration) => registration.personId),
	);
	const adultIds = new Set(
		registrations
			.filter(
				(registration) =>
					registration.personType === "adult" ||
					registration.personType === "member",
			)
			.map((registration) => registration.personId),
	);
	return { scouts: scoutIds.size, adults: adultIds.size };
}
// Renders reservation person row markup for the event UI.
function renderReservationPersonRow(event, person) {
	const checked = isPersonRegisteredForEvent(event, person)
		? " checked"
		: "";
	return `<label class="reservation-person-row">
<input type="checkbox" data-reservation-person-toggle data-event-id="${event.id}" data-person-id="${person.personId}" data-person-type="${person.personType}"${checked} />
<span>
<strong>${person.name}</strong>
<small>${person.detail || person.personType}</small>
</span>
</label>`;
}
// Renders reservations route markup for the event UI.
function renderReservationsRoute() {
	if (!canSeeOrgChart()) {
		renderAccessDenied();
		return;
	}
	const { startDate, endDate } = getReservationRouteRange();
	if (!reservationRouteHasExplicitRange()) {
		window.location.hash = reservationRouteUrl(startDate, endDate);
		return;
	}
	const rangeEvents = getSortedEvents().filter((event) =>
		eventOverlapsDateRange(event, startDate, endDate),
	);
	const totalScouts = roster.length;
	const totalAdults = adults.length;
	app.innerHTML = `${topNav()}<section class="dashboard-banner">
<div>
<p class="eyebrow">Reservations</p>
<h2>Event reservations</h2>
<p class="intro compact">Review reservation counts for events in the selected date range.</p>
</div>
<div class="status-chip">
<span>Route</span>
<strong>/reservations</strong>
</div>
</section>
<section class="section">
<div class="panel">
<div class="panel-heading">
<h3>Date range</h3>
<p>Changing either date updates the URL and reloads this page for the selected range.</p>
</div>
<div class="reservation-range-controls">
<label>
<span>Start date</span>
<input type="date" data-reservation-start-date value="${startDate}" aria-label="Reservation start date" />
</label>
<label>
<span>End date</span>
<input type="date" data-reservation-end-date value="${endDate}" aria-label="Reservation end date" />
</label>
</div>
</div>
</section>
<section class="section">
<div class="panel">
<div class="panel-heading">
<h3>${rangeEvents.length} event${rangeEvents.length === 1 ? "" : "s"} found</h3>
<p>Totals use the current troop roster available to this account.</p>
</div>
<div class="table-wrap">
<table class="data-table">
<thead>
<tr>
<th>Event</th>
<th>Date</th>
<th>Location</th>
<th>Scouts reserved</th>
<th>Adults reserved</th>
</tr>
</thead>
<tbody>${
		rangeEvents
			.map((event) => {
				if (!event.registrationRequired) {
					return `<tr><td>${event.title}</td><td>${event.dateLabel || formatEventListDate(event) || "-"}</td><td>${event.homeBase || event.location || "-"}</td><td></td><td></td></tr>`;
				}
				const counts = countEventReservations(event);
				const requiredCellStyle =
					'style="background: #435a48; color: #fffaf0; border-bottom-color: rgba(255, 255, 255, 0.18);"';
				const requiredLinkStyle = 'style="color: #fffaf0;"';
				return `<tr class="reservation-required-row"><td ${requiredCellStyle}><a class="text-link" ${requiredLinkStyle} href="${reservationEventRouteUrl(event.id, startDate, endDate)}">${event.title}</a></td><td ${requiredCellStyle}><a class="text-link" ${requiredLinkStyle} href="${reservationEventRouteUrl(event.id, startDate, endDate)}">${event.dateLabel || formatEventListDate(event) || "-"}</a></td><td ${requiredCellStyle}><a class="text-link" ${requiredLinkStyle} href="${reservationEventRouteUrl(event.id, startDate, endDate)}">${event.homeBase || event.location || "-"}</a></td><td ${requiredCellStyle}><a class="text-link" ${requiredLinkStyle} href="${reservationEventRouteUrl(event.id, startDate, endDate)}"><strong>${counts.scouts}</strong> / ${totalScouts}</a></td><td ${requiredCellStyle}><a class="text-link" ${requiredLinkStyle} href="${reservationEventRouteUrl(event.id, startDate, endDate)}"><strong>${counts.adults}</strong> / ${totalAdults}</a></td></tr>`;
			})
			.join("") ||
		`<tr><td colspan="5">No events were found for this date range.</td></tr>`
	}</tbody>
</table>
</div>
</div>
</section>`;
}
// Renders reservation event route markup for the event UI.
function renderReservationEventRoute(eventId) {
	if (!canSeeOrgChart()) {
		renderAccessDenied();
		return;
	}
	const event = getEventById(eventId);
	const { startDate, endDate } = getReservationRouteRange();
	if (!event) {
		renderNotFound();
		return;
	}
	const scoutPeople = [...roster]
		.sort((a, b) =>
			`${getScoutLastName(a)} ${getScoutFirstName(a)} ${getScoutNickname(a)}`.localeCompare(
				`${getScoutLastName(b)} ${getScoutFirstName(b)} ${getScoutNickname(b)}`,
				undefined,
				{ sensitivity: "base", numeric: true },
			),
		)
		.map(personFromScout)
		.filter(Boolean);
	const adultPeople = adults
		.map((adult) =>
			personFromAdult(
				adult,
				adult.relationship ||
					getAdultLeaderAssignment(adult.id)?.role ||
					"Adult",
			),
		)
		.filter(Boolean);
	app.innerHTML = `${topNav()}<section class="dashboard-banner">
<div>
<p class="eyebrow">Reservations</p>
<h2>${event.title}</h2>
<p class="intro compact">${event.dateLabel || formatEventListDate(event) || "Date TBD"}${event.homeBase || event.location ? ` &bull; ${event.homeBase || event.location}` : ""}</p>
<div class="scribe-actions">
<a class="button secondary" href="${reservationRouteUrl(startDate, endDate)}">Back to reservation list</a>
<a class="button secondary" href="#/events/${event.id}">View event</a>
</div>
</div>
<div class="status-chip">
<span>Reserved</span>
<strong>${countEventReservations(event).scouts} scouts / ${countEventReservations(event).adults} adults</strong>
</div>
</section>
<section class="section reservation-error-section">${typeof renderEditableError === "function" ? renderEditableError() : ""}</section>
<section class="section reservation-editor-grid">
<div class="panel">
<div class="panel-heading">
<h3>Scouts</h3>
<p>${countEventReservations(event).scouts} of ${scoutPeople.length} scouts reserved a spot.</p>
</div>
<div class="reservation-person-list">${scoutPeople.map((person) => renderReservationPersonRow(event, person)).join("") || `<p class="event-description">No scouts are loaded.</p>`}</div>
</div>
<div class="panel">
<div class="panel-heading">
<h3>Adults</h3>
<p>${countEventReservations(event).adults} of ${adultPeople.length} adults reserved a spot.</p>
</div>
<div class="reservation-person-list">${adultPeople.map((person) => renderReservationPersonRow(event, person)).join("") || `<p class="event-description">No adults are loaded.</p>`}</div>
</div>
</section>`;
}
// Renders events list markup for the event UI.
function renderEventListIndicators(event) {
	const indicators = [];
	if (event.registrationRequired) {
		indicators.push(`<span class="event-list-indicator reservation" title="Reservation required" aria-label="Reservation required">
<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path d="M7 3h10a2 2 0 0 1 2 2v16l-3-2-3 2-3-2-3 2-2-1.4V5a2 2 0 0 1 2-2Zm1 5h8V6H8v2Zm0 4h8v-2H8v2Zm0 4h5v-2H8v2Z" fill="currentColor"/></svg>
</span>`);
	}
	if (event.homeBase || event.location) {
		indicators.push(`<span class="event-list-indicator location" title="Location available" aria-label="Location available">
<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" fill="currentColor"/></svg>
</span>`);
	}
	if (event.repeatEnabled) {
		indicators.push(`<span class="event-list-indicator repeat" title="Repeating event" aria-label="Repeating event">
<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path d="M7 7h9.2l-2.6-2.6L15 3l5 5-5 5-1.4-1.4L16.2 9H7a3 3 0 0 0-3 3v1H2v-1a5 5 0 0 1 5-5Zm10 10H7.8l2.6 2.6L9 21l-5-5 5-5 1.4 1.4L7.8 15H17a3 3 0 0 0 3-3v-1h2v1a5 5 0 0 1-5 5Z" fill="currentColor"/></svg>
</span>`);
	}
	if (!indicators.length) return "";
	return `<span class="event-list-indicators">${indicators.join("")}</span>`;
}
function renderEventsList() {
	if (!canSeeOrgChart()) {
		renderAccessDenied();
		return;
	}
	const sortedEvents = [...getSortedEvents()].reverse();
	app.innerHTML = `${topNav()}<section class="dashboard-banner">
<div>
<p class="eyebrow">Events</p>
<h2>Editable event list</h2>
<p class="intro compact">Adult leaders can review the full imported schedule in one list and jump directly into any event editor.</p>
</div>
<div class="status-chip">
<span>Route</span>
<strong>/events</strong>
</div>
</section>
<section class="section">
<div class="section-heading">
<div>
<p class="eyebrow">Manage events</p>
<h2>All scheduled events</h2>
</div>
<div class="scribe-actions">
<a class="button secondary" href="#/events/calendar">Open calendar view</a>
</div>
</div>
<div class="panel events-list-panel">
<div class="panel-heading">
<h3>${sortedEvents.length} events loaded</h3>
<p>Newest start date first. Use View for the display page or Edit to open the editor.</p>
</div>
<div class="table-wrap events-table-wrap">
<table class="data-table events-list-table">
<thead>
<tr>
<th>Title</th>
<th>Dates</th>
<th>Category</th>
<th>Location</th>
<th>Audience</th>
<th>Actions</th>
</tr>
</thead>
<tbody>${sortedEvents.map((event) => `<tr><td data-label="Title"><span class="event-list-title">${event.title}</span>${renderEventListIndicators(event)}</td><td data-label="Dates">${event.dateLabel || "-"}</td><td data-label="Category">${event.category || "-"}</td><td data-label="Location">${event.location || "-"}</td><td data-label="Audience">${event.audience || "-"}</td><td data-label="Actions"><div class="table-action-row events-table-actions"><a class="text-link" href="#/events/${event.id}">View</a><a class="text-link" href="#/events/${event.id}?edit=true">Edit</a><button class="icon-button remove-record-icon mini" type="button" data-delete-event="${event.id}" aria-label="Remove ${event.title}" title="Remove ${event.title}">${typeof renderTrashIcon === "function" ? renderTrashIcon() : "&times;"}</button></div></td></tr>`).join("")}</tbody>
</table>
</div>
</div>
</section>`;
}
// Renders events index markup for the event UI.
function renderEventsIndex() {
	const selectedMonth = ensureSelectedMonth();
	if (!selectedMonth) {
		app.innerHTML = `${topNav()}<section class="dashboard-banner">
<div>
<p class="eyebrow">Events</p>
<h2>Troop 883 monthly calendar</h2>
<p class="intro compact">Event data is loading or temporarily unavailable.</p>
</div>
<div class="status-chip">
<span>Route</span>
<strong>/events/calendar</strong>
</div>
</section>
<section class="section">
<article class="panel">
<div class="panel-heading">
<h3>No events loaded</h3>
<p>Refresh the page or try the calendar again shortly.</p>
</div>
</article>
</section>`;
		return;
	}
	const selectedDate = getSelectedCalendarDate();
	const selectedDateObj =
		parseDateKey(selectedDate) || prototypeToday;
	const [selectedYear, selectedMonthNumber] = selectedMonth
		.split("-")
		.map(Number);
	const monthDate = new Date(
		selectedYear,
		selectedMonthNumber - 1,
		1,
	);
	const previousMonth = new Date(
		selectedYear,
		selectedMonthNumber - 2,
		1,
	);
	const nextMonth = new Date(selectedYear, selectedMonthNumber, 1);
	const todayMonthKey = getMonthKeyForDate(prototypeToday);
	const monthEvents = events
		.filter((event) =>
			eventOccursInMonth(
				event,
				selectedYear,
				selectedMonthNumber - 1,
			),
		)
		.sort(
			(a, b) =>
				(parseEventStartDate(a)?.getTime() || 0) -
				(parseEventStartDate(b)?.getTime() || 0),
		);
	const selectedDateEvents = events
		.filter((event) => eventOccursOnDate(event, selectedDateObj))
		.sort(
			(a, b) =>
				(parseEventStartDate(a)?.getTime() || 0) -
				(parseEventStartDate(b)?.getTime() || 0),
		);
	const storedSelectedEventId = getSelectedCalendarEventId();
	const selectedCalendarBaseEvent =
		selectedDateEvents.find(
			(event) => event.id === storedSelectedEventId,
		) ||
		selectedDateEvents[0] ||
		monthEvents[0] ||
		null;
	const selectedCalendarEvent = selectedCalendarBaseEvent
		? eventForCalendarDate(selectedCalendarBaseEvent, selectedDateObj)
		: null;
	if (selectedCalendarBaseEvent?.id !== storedSelectedEventId) {
		setSelectedCalendarEventId(selectedCalendarBaseEvent?.id || "");
	}
	const calendarCells = buildCalendarCells(selectedMonth);
	const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	const availableYears = [
		...new Set([
			prototypeToday.getFullYear() - 1,
			prototypeToday.getFullYear(),
			prototypeToday.getFullYear() + 1,
			...events
				.map((event) => parseEventStartDate(event)?.getFullYear())
				.filter(Boolean),
		]),
	].sort((a, b) => a - b);

	app.innerHTML = `${topNav()}<section class="dashboard-banner">
<div>
<p class="eyebrow">Events</p>
<h2>Troop 883 monthly calendar</h2>
<p class="intro compact">The calendar opens with today highlighted, supports month-to-month navigation, and lets adult leaders insert a new event directly from any date cell.</p>
</div>
<div class="status-chip">
<span>Route</span>
<strong>/events/calendar</strong>
</div>
</section>
<section class="section">
<div class="section-heading">
<div>
<p class="eyebrow">Calendar</p>
<h2>${formatMonthLabel(selectedMonth)}</h2>
</div>
<p class="section-copy">${canSeeOrgChart() ? "Adult leaders can select any day, add a new event from the plus icon, open an existing event to edit it, or switch to the default list view." : "Select any day to review what is scheduled, then open an event for full details."}</p>
</div>${canSeeOrgChart() ? `<div class="scribe-actions"><a class="button secondary" href="#/events">Open editable list view</a></div>` : ""}<div class="calendar-toolbar">
<div class="calendar-nav">
<button class="button secondary" type="button" data-calendar-nav="${getMonthKeyForDate(previousMonth)}">${previousMonth.toLocaleDateString("en-US", { month: "long" })}</button>
<button class="button ${selectedMonth === todayMonthKey ? "primary" : "secondary"}" type="button" data-calendar-nav="${todayMonthKey}" data-calendar-date="${getTodayDateKey()}">${prototypeToday.toLocaleDateString("en-US", { month: "long", day: "numeric" })}</button>
<button class="button secondary" type="button" data-calendar-nav="${getMonthKeyForDate(nextMonth)}">${nextMonth.toLocaleDateString("en-US", { month: "long" })}</button>
</div>
<div class="calendar-jump">
<label class="view-toggle calendar-select">
<span>Month</span>
<select data-calendar-month aria-label="Select calendar month">${Array.from({ length: 12 }, (_, index) => `<option value="${String(index + 1).padStart(2, "0")}"${index === monthDate.getMonth() ? " selected" : ""}>${new Date(2026, index, 1).toLocaleDateString("en-US", { month: "long" })}</option>`).join("")}</select>
</label>
<label class="view-toggle calendar-select">
<span>Year</span>
<select data-calendar-year aria-label="Select calendar year">${availableYears.map((year) => `<option value="${year}"${year === monthDate.getFullYear() ? " selected" : ""}>${year}</option>`).join("")}</select>
</label>
</div>
</div>
<div class="calendar-grid">
<div class="calendar-weekdays">${weekdays.map((day) => `<div class="calendar-weekday">${day}</div>`).join("")}</div>
<div class="calendar-cells">${calendarCells
		.map((cell) => {
			if (cell.empty) {
				return `<div class="calendar-cell is-empty"></div>`;
			}
			const dateKey = `${selectedMonth}-${String(cell.day).padStart(2, "0")}`;
			const isToday = dateKey === getTodayDateKey();
			const isSelected = dateKey === selectedDate;
			return `<div class="calendar-cell${isToday ? " is-today" : ""}${isSelected ? " is-selected" : ""}"><div class="calendar-cell-top"><button class="calendar-day-button" type="button" data-calendar-date="${dateKey}" aria-label="Open ${formatFullDate(dateKey)}">${cell.day}</button>${canSeeOrgChart() ? `<button class="icon-button add calendar-add-button" type="button" data-add-event-date="${dateKey}" aria-label="Add event on ${formatFullDate(dateKey)}">+</button>` : ""}</div><div class="calendar-events">${cell.events.map((event) => `<button class="calendar-event${selectedCalendarEvent?.id === event.id ? " is-active" : ""}${isAdultEvent(event) ? " adult-event-theme" : ""}" type="button" data-calendar-event="${event.id}" data-calendar-date="${dateKey}">${event.title}</button>`).join("")}</div></div>`;
		})
		.join("")}</div>
</div>
</section>
<section class="section">
<div class="section-heading">
<div>
<p class="eyebrow">Event details</p>
<h2>${selectedCalendarEvent ? selectedCalendarEvent.title : "Calendar event details"}</h2>
</div>
<p class="section-copy">${selectedCalendarEvent ? "This panel updates when you choose a different event from the calendar." : "Select an event from the calendar to review the key details without leaving the page."}</p>
</div>${renderCalendarEventShowcase(selectedCalendarEvent)}</section>`;
	flushSelectedCalendarEventScroll();
}
// Renders event route markup for the event UI.
function renderEventRoute(eventId) {
	const event = getEventById(eventId);
	if (!event) {
		renderNotFound();
		return;
	}
	eventEditorSaveStatus = "saved";
	const editMode = canSeeOrgChart() && isEventEditRoute();
	const visitorView = !editMode;
	const gallery = visitorView
		? getDisplayMediaItems(event)
		: event.gallery?.length
			? sortGalleryByDateTime(event.gallery)
			: event.image
				? [normalizeGalleryItem({ src: event.image }, 0)]
				: [];
	const audienceOptions = eventAudienceOptions.includes(
		event.audience,
	)
		? eventAudienceOptions
		: [...eventAudienceOptions, event.audience].filter(Boolean);
	const monthlyPattern = event.repeatMonthlyPattern || "date";
	const monthlyOrdinal = event.repeatMonthlyOrdinal || "third";
	const monthlyWeekday = event.repeatMonthlyWeekday || "monday";
	const repeatSummary = formatRepeatSummary(event);
	const repeatUntilValue = formatDateTimeLocalValue(
		event.repeatUntil,
	);
	const startValue = formatDateTimeLocalValue(event.startDate);
	const endValue = formatDateTimeLocalValue(
		event.endDate || event.startDate,
	);
	const activities = event.activities || [];
	const displayActivities = visitorView
		? activities.filter((activity) =>
				[activity.description, activity.location].some((value) =>
					String(value || "").trim(),
				),
			)
		: activities;
	const activitiesMarkup = displayActivities.length
		? displayActivities
				.map((activity, index) => {
					const activityStart = formatDateTimeLocalValue(
						activity.startDate,
					);
					const activityEnd = formatDateTimeLocalValue(
						activity.endDate || activity.startDate,
					);
					return `<article class="month-summary-card event-activity-card">
<div class="panel-heading">
<h3>${visitorView ? activity.description || `Activity ${index + 1}` : `Activity ${index + 1}`}</h3>${!visitorView ? `<button class="icon-button" type="button" data-remove-activity="${activity.id}" aria-label="Remove activity ${index + 1}">&times;</button>` : ""}</div>${visitorView ? `<p class="event-description">${activity.description || "No activity description yet."}</p><ul class="detail-list"><li>Location: ${activity.location || "Location TBD"}</li><li>Starts: ${formatExactEventDateTime(activity.startDate)}</li><li>Ends: ${formatExactEventDateTime(activity.endDate || activity.startDate)}</li></ul>` : `<div class="table-wrap responsive-detail-table-wrap"><table class="data-table compact responsive-detail-table event-activity-table"><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody><tr><td data-label="Field">Description</td><td data-label="Value"><input type="text" data-activity-description="${activity.id}" value="${activity.description}" aria-label="Activity description" /></td></tr><tr><td data-label="Field">Location</td><td data-label="Value"><input type="text" data-activity-location="${activity.id}" value="${activity.location}" aria-label="Activity location" /></td></tr><tr><td data-label="Field">Start</td><td data-label="Value"><input type="datetime-local" data-activity-start="${activity.id}" value="${activityStart}" aria-label="Activity start date and time" /></td></tr><tr><td data-label="Field">End</td><td data-label="Value"><input type="datetime-local" data-activity-end="${activity.id}" value="${activityEnd}" aria-label="Activity end date and time" /></td></tr></tbody></table></div>`}</article>`;
				})
				.join("")
		: `<article class="month-summary-card event-activity-card">
<p class="event-description">${visitorView ? "No activities are listed for this event yet." : "No activities yet. Use Add activity to create the first one."}</p>
</article>`;
	const visitorActivitiesSection = displayActivities.length
		? `<section class="section">
<div class="section-heading">
<div>
<p class="eyebrow">Activities</p>
<h2>Event activity list</h2>
</div>
<p class="section-copy">Each activity can have its own location and start/end time.</p>
</div>
<div class="detail-stack">${activitiesMarkup}</div>
</section>`
		: "";
	const repeatRows = event.repeatEnabled
		? `<tr>
<td data-label="Field">Repeat frequency</td>
<td data-label="Value">
<select data-event-edit-repeat-frequency aria-label="Event repeat frequency">
<option value="daily"${event.repeatFrequency === "daily" ? " selected" : ""}>Daily</option>
<option value="weekly"${event.repeatFrequency === "weekly" ? " selected" : ""}>Weekly</option>
<option value="monthly"${event.repeatFrequency === "monthly" ? " selected" : ""}>Monthly</option>
</select>
</td>
</tr>
<tr>
<td data-label="Field">Repeat interval</td>
<td data-label="Value">
<input type="number" min="1" step="1" data-event-edit-repeat-interval value="${event.repeatInterval || 1}" aria-label="Repeat every number of intervals" />
</td>
</tr>
<tr>
<td data-label="Field">Monthly repeat rule</td>
<td data-label="Value">
<select data-event-edit-repeat-monthly-pattern aria-label="Monthly repeat pattern">
<option value="date"${monthlyPattern === "date" ? " selected" : ""}>Same date each month</option>
<option value="nth-weekday"${monthlyPattern === "nth-weekday" ? " selected" : ""}>Nth weekday of the month</option>
</select>
</td>
</tr>
<tr>
<td data-label="Field">Monthly ordinal</td>
<td data-label="Value">
<select data-event-edit-repeat-monthly-ordinal aria-label="Monthly repeat ordinal">
<option value="first"${monthlyOrdinal === "first" ? " selected" : ""}>First</option>
<option value="second"${monthlyOrdinal === "second" ? " selected" : ""}>Second</option>
<option value="third"${monthlyOrdinal === "third" ? " selected" : ""}>Third</option>
<option value="fourth"${monthlyOrdinal === "fourth" ? " selected" : ""}>Fourth</option>
<option value="last"${monthlyOrdinal === "last" ? " selected" : ""}>Last</option>
</select>
</td>
</tr>
<tr>
<td data-label="Field">Monthly weekday</td>
<td data-label="Value">
<select data-event-edit-repeat-monthly-weekday aria-label="Monthly repeat weekday">
<option value="sunday"${monthlyWeekday === "sunday" ? " selected" : ""}>Sunday</option>
<option value="monday"${monthlyWeekday === "monday" ? " selected" : ""}>Monday</option>
<option value="tuesday"${monthlyWeekday === "tuesday" ? " selected" : ""}>Tuesday</option>
<option value="wednesday"${monthlyWeekday === "wednesday" ? " selected" : ""}>Wednesday</option>
<option value="thursday"${monthlyWeekday === "thursday" ? " selected" : ""}>Thursday</option>
<option value="friday"${monthlyWeekday === "friday" ? " selected" : ""}>Friday</option>
<option value="saturday"${monthlyWeekday === "saturday" ? " selected" : ""}>Saturday</option>
</select>
</td>
</tr>
<tr>
<td data-label="Field">Repeat until</td>
<td data-label="Value">
<input type="datetime-local" data-event-edit-repeat-until value="${repeatUntilValue}" aria-label="Repeat until date and time" />
</td>
</tr>`
		: "";
	const registrationMarkup = renderEventRegistrationPanel(event);
	const eventHomeBase = String(
		visitorView
			? event.homeBase || ""
			: event.homeBase || event.location || "",
	).trim();
	const eventHasDateValues = Boolean(
		String(event.startDate || "").trim() ||
			String(event.endDate || "").trim(),
	);
	const heroHomeBaseMarkup = eventHomeBase
		? `<span>${eventHomeBase}</span>`
		: "";
	const heroDateMarkup =
		visitorView && !eventHasDateValues
			? ""
			: `<span>${event.dateLabel}</span>`;
	const visitorSummaryMarkup =
		visitorView && event.location
			? `<p class="event-summary"><strong>Summary</strong><span>${event.category} event scheduled for ${event.location}.</span></p>`
			: "";
	const visitorHomeBaseListItem = eventHomeBase
		? `<li>Location from where all activities will start: ${eventHomeBase}</li>`
		: "";
	const visitorDateListItems = eventHasDateValues
		? `<li>Event starts: ${formatExactEventDateTime(
				event.startDate,
			)}</li><li>Event ends: ${formatExactEventDateTime(
				event.endDate || event.startDate,
			)}</li>`
		: "";
	const visitorHomeBasePanel = eventHomeBase
		? `<article class="panel map-panel">
<div class="panel-heading">
<h3>Home base</h3>
<p>Location from where all activities will start</p>
</div>
<iframe class="event-map" src="${mapUrlForLocation(eventHomeBase)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Map for ${eventHomeBase}"></iframe>
</article>`
		: "";
	app.innerHTML = `${topNav()}<section class="event-route-hero">
<div class="event-route-copy">
<p class="eyebrow">${visitorView ? "Event details" : "Edit event"}</p>
<h2>${event.title}</h2>
<p class="intro compact">${visitorView ? "Public and non-adult-leader viewers see the full event story, home base, activities, and gallery here." : "Adult leaders can edit the event details, home base, activities, add images or videos, copy the event into a new future draft, or remove it when it should no longer appear on the calendar."}</p>
<div class="event-meta">
<span>${event.category}</span>
${heroDateMarkup}
${heroHomeBaseMarkup}${event.repeatEnabled ? `<span>${repeatSummary}</span>` : ""}</div>
</div>
<div class="status-chip">
<span>Route</span>
<strong>/events/${event.id}</strong>
</div>
</section>${registrationMarkup}${
		visitorView
			? `<section class="section event-route-grid"><article class="panel event-story"><div class="panel-heading"><h3>${event.title}</h3><p>${event.description}</p></div>${visitorSummaryMarkup}<div class="event-meta"><span>${event.audience}</span>${heroDateMarkup}${event.repeatEnabled ? `<span>${repeatSummary}</span>` : ""}</div><ul class="detail-list">${visitorHomeBaseListItem}${visitorDateListItems}${event.repeatEnabled ? `<li>${repeatSummary}</li>` : ""}</ul><div class="detail-note">${event.detailNote}</div>${
					canSeeOrgChart()
						? `<div class="scribe-actions">
<a class="button secondary" href="#/events/${event.id}?edit=true">Edit</a>
</div>`
						: ""
				}</article>${visitorHomeBasePanel}</section>${visitorActivitiesSection}<section class="section"><div class="section-heading"><div><p class="eyebrow">Gallery</p><h2>Event media</h2></div><p class="section-copy">Each image or video can carry its own caption, comments, and reactions.</p></div><div class="event-gallery-grid">${gallery.map((image, index) => renderGalleryImageCard(event, image, index, false)).join("")}</div></section>`
			: `<section class="section event-route-grid event-editor-grid"><article class="panel event-editor-panel"><div class="panel-heading"><h3 class="event-content-heading"><span>Event content</span><span class="event-save-status" data-event-save-status="${eventEditorSaveStatus}">${eventEditorStatusLabel()}</span></h3><p>Changes save automatically 2 seconds after the last change.</p>${typeof renderEditableError === "function" ? renderEditableError() : ""}</div><div class="table-wrap responsive-detail-table-wrap"><table class="data-table compact responsive-detail-table event-edit-table"><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody><tr><td data-label="Field">Title</td><td data-label="Value"><input type="text" data-event-edit-title value="${event.title}" aria-label="Event title" /></td></tr><tr><td data-label="Field">Category</td><td data-label="Value"><input type="text" data-event-edit-category value="${event.category}" aria-label="Event category" /></td></tr><tr><td data-label="Field">Start</td><td data-label="Value"><input type="datetime-local" data-event-edit-start value="${startValue}" aria-label="Event start date and time" /></td></tr><tr><td data-label="Field">End</td><td data-label="Value"><input type="datetime-local" data-event-edit-end value="${endValue}" aria-label="Event end date and time" /></td></tr><tr><td data-label="Field">Home base</td><td data-label="Value"><input type="text" data-event-edit-home-base value="${event.homeBase || ""}" aria-label="Location from where all activities will start" title="Location from where all activities will start" /></td></tr><tr><td data-label="Field">Audience</td><td data-label="Value"><select data-event-edit-audience aria-label="Event audience">${audienceOptions.map((audience) => `<option value="${audience}"${audience === event.audience ? " selected" : ""}>${audience}</option>`).join("")}</select></td></tr><tr><td data-label="Field">Description</td><td data-label="Value"><textarea data-event-edit-description aria-label="Event description">${event.description}</textarea></td></tr><tr><td data-label="Field">Detail note</td><td data-label="Value"><textarea data-event-edit-note aria-label="Event detail note">${event.detailNote}</textarea></td></tr><tr><td data-label="Field">Reservation</td><td data-label="Value"><label class="reservation-required-toggle"><input type="checkbox" data-event-edit-registration-required aria-label="Reservation required for this event"${event.registrationRequired ? " checked" : ""} /><span>Reservation required</span></label></td></tr><tr><td data-label="Field">Upcoming</td><td data-label="Value"><select data-event-edit-upcoming aria-label="Event upcoming status"><option value="true"${event.upcoming ? " selected" : ""}>Upcoming</option><option value="false"${!event.upcoming ? " selected" : ""}>Recent / past</option></select></td></tr><tr><td data-label="Field">Repeatable</td><td data-label="Value"><select data-event-edit-repeat-enabled aria-label="Whether this event repeats"><option value="false"${!event.repeatEnabled ? " selected" : ""}>No</option><option value="true"${event.repeatEnabled ? " selected" : ""}>Yes</option></select></td></tr>${repeatRows}</tbody></table></div><div class="event-editor-actions"><button class="button secondary" type="button" data-add-activity="${event.id}">Add activity</button><button class="button secondary" type="button" data-copy-event="${event.id}">Copy as new event</button><button class="button danger" type="button" data-delete-event="${event.id}">Remove event</button></div></article><article class="panel event-gallery-panel"><div class="panel-heading"><h3>Visitor gallery</h3><p>Upload one or more image or video files at once. Items are stored oldest to newest by upload time; the selected primary item still displays first.</p></div><label class="button secondary upload-button"><input class="visually-hidden-file-input" type="file" data-event-image-upload accept="image/*,video/*" multiple />Upload media</label><div class="event-gallery-grid">${gallery.map((image, index) => renderGalleryImageCard(event, image, index, true)).join("")}</div></article></section><section class="section"><div class="panel map-panel event-map-panel"><div class="panel-heading"><h3>Home base map preview</h3><p>Location from where all activities will start</p></div><iframe class="event-map" src="${mapUrlForLocation(event.homeBase || "")}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Map for ${event.homeBase || "home base"}"></iframe></div></section><section class="section event-activities-section"><div class="section-heading"><div><p class="eyebrow">Activities</p><h2>Edit event activities</h2></div><p class="section-copy">Each activity can have its own description, location, and start/end date and time.</p></div><div class="detail-stack event-activity-list">${activitiesMarkup}</div></section>`
	}`;
}

// Builds or checks event registration key behavior.
function eventRegistrationKey(person) {
	return `${person.personType}:${person.personId}`;
}
// Builds person from scout from roster records for reservations.
function personFromScout(scout) {
	return scout
		? {
				personType: "scout",
				personId: scout.id,
				name: scout.name,
				detail: scout.patrol ? `${scout.patrol} Patrol` : "Scout",
			}
		: null;
}
// Builds person from adult from roster records for reservations.
function personFromAdult(adult, detail = "") {
	return adult
		? {
				personType: "adult",
				personId: adult.id,
				name: adult.name,
				detail: detail || adult.relationship || "Adult",
			}
		: null;
}
// Checks whether person registered for event applies.
function isPersonRegisteredForEvent(event, person) {
	if (!event || !person) {
		return false;
	}
	const key = eventRegistrationKey(person);
	return (event.registrations || []).some(
		(registration) => eventRegistrationKey(registration) === key,
	);
}
// Registers person for event in the event reservation list.
function registerPersonForEvent(event, person) {
	if (
		!event ||
		!person ||
		isPersonRegisteredForEvent(event, person)
	) {
		return false;
	}
	const viewer = getCurrentViewerIdentity();
	event.registrations = [
		...(event.registrations || []),
		normalizeEventRegistration({
			...person,
			registeredBy: viewer?.id || "",
			registeredAt: new Date().toISOString(),
		}),
	];
	return true;
}
// Removes person for event from the event reservation list.
function unregisterPersonForEvent(event, person) {
	if (!event || !person) {
		return false;
	}
	const key = eventRegistrationKey(person);
	const nextRegistrations = (event.registrations || []).filter(
		(registration) => eventRegistrationKey(registration) !== key,
	);
	if (
		nextRegistrations.length === (event.registrations || []).length
	) {
		return false;
	}
	event.registrations = nextRegistrations;
	return true;
}
// Saves person event reservation changes back to local or API storage.
async function savePersonEventReservation(event, person, reserved) {
	if (!event || !person) {
		throw new Error("A reservation needs both an event and a person.");
	}
	const method = reserved ? "POST" : "DELETE";
	const response = await fetch(
		`/api/events/${encodeURIComponent(event.id)}/reservations/${encodeURIComponent(person.personId)}`,
		{
			method,
			headers: authHeaders({ "Content-Type": "application/json" }),
			body: reserved
				? JSON.stringify({ personType: person.personType })
				: undefined,
		},
	);
	if (!response.ok) {
		const responseText = await response.text().catch(() => "");
		let message = responseText;
		try {
			const parsed = JSON.parse(responseText || "{}");
			message = parsed.error || parsed.message || responseText;
		} catch (error) {}
		throw new Error(
			message ||
				`Could not ${reserved ? "save" : "remove"} the reservation.`,
		);
	}
	if (reserved) {
		registerPersonForEvent(event, person);
	} else {
		unregisterPersonForEvent(event, person);
	}
	saveLocalEventRegistrations();
	return true;
}
// Saves event registrations changes back to local or API storage.
async function saveEventRegistrations() {
	saveLocalEventRegistrations();
	try {
		const response = await fetch("/api/events", {
			method: "POST",
			headers: authHeaders({ "Content-Type": "application/json" }),
			body: JSON.stringify({
				events: events.map((event) => ({ ...event })),
			}),
		});
		return response.ok;
	} catch (error) {
		return false;
	}
}
// Gets parent linked scouts for event routing, rendering, or filtering.
function getParentLinkedScouts() {
	const currentAdult = getCurrentAdultRecord();
	if (currentAdult) {
		return getScoutsForAdult(currentAdult);
	}
	const actorScoutIds = new Set(
		(currentActor?.relationships || [])
			.map(
				(relationship) =>
					relationship.scoutPersonId || relationship.scoutId,
			)
			.filter(Boolean),
	);
	return actorScoutIds.size
		? scouts.filter((scout) => actorScoutIds.has(scout.id))
		: getLinkedScoutsForCurrentParent();
}
// Gets associated adults for scouts for event routing, rendering, or filtering.
function getAssociatedAdultsForScouts(linkedScouts = []) {
	const linkedScoutIds = new Set(
		linkedScouts.map((scout) => scout.id),
	);
	const adultIds = new Set(
		adultScoutRelationships
			.filter(
				(relationship) =>
					linkedScoutIds.has(relationship.scoutId) &&
					/parent|guardian/i.test(relationship.relationship || ""),
			)
			.map((relationship) => relationship.adultId),
	);
	return adults.filter((adult) => adultIds.has(adult.id));
}
// Gets registration people for current actor for event routing, rendering, or filtering.
function getRegistrationPeopleForCurrentActor() {
	if (!currentActor?.authenticated) {
		return [];
	}
	const people = [];
	const scout = getCurrentScoutRecord();
	const adult = getCurrentAdultRecord();
	if (scout) {
		people.push(personFromScout(scout));
	}
	if (adult) {
		people.push(personFromAdult(adult, "You"));
	}
	if (!scout && !adult) {
		const viewer = getCurrentViewerIdentity();
		if (viewer) {
			people.push({
				personType: "member",
				personId: viewer.id,
				name: viewer.name,
				detail: "You",
			});
		}
	}
	if (hasRole("parent")) {
		const linkedScouts = getParentLinkedScouts();
		linkedScouts.forEach((linkedScout) =>
			people.push(personFromScout(linkedScout)),
		);
		getAssociatedAdultsForScouts(linkedScouts).forEach(
			(associatedAdult) =>
				people.push(
					personFromAdult(
						associatedAdult,
						associatedAdult.id === adult?.id
							? "You"
							: "Associated parent",
					),
				),
		);
	}
	return uniqueBy(people.filter(Boolean), eventRegistrationKey);
}
// Renders registration action markup for the event UI.
function renderRegistrationAction(event, person) {
	const registered = isPersonRegisteredForEvent(event, person);
	return `<button class="text-link event-registration-link${registered ? " is-registered" : ""}" type="button" data-event-register="${event.id}" data-register-person-type="${person.personType}" data-register-person-id="${person.personId}" aria-pressed="${registered ? "true" : "false"}">${registered ? "registered" : "register"}</button>`;
}
// Renders event registration panel markup for the event UI.
function renderEventRegistrationPanel(event) {
	if (!event?.registrationRequired) {
		return "";
	}
	if (!currentActor?.authenticated) {
		return "";
	}
	const people = getRegistrationPeopleForCurrentActor();
	if (!people.length) {
		return "";
	}
	return `<section class="section">
<article class="panel event-registration-panel">
<div class="panel-heading">
<h3>Registration</h3>
<p>Signed-in members can see whether each accessible person is registered for this event.</p>
</div>
<div class="event-registration-list">${people.map((person) => `<div class="event-registration-row"><div><strong>${person.name}</strong><span>${person.detail || person.personType}</span></div>${renderRegistrationAction(event, person)}</div>`).join("")}</div>
</article>
</section>`;
}
// Gets scout detail reservation range for event routing, rendering, or filtering.
function getScoutReservationRange() {
	const start = startOfDay(addMonths(prototypeToday, -1));
	const end = addMonths(prototypeToday, 3);
	end.setHours(23, 59, 59, 999);
	return {
		startDate: formatDateKey(start),
		endDate: formatDateKey(end),
	};
}
// Gets adult detail reservation range for event routing, rendering, or filtering.
function getAdultReservationRange() {
	return getScoutReservationRange();
}
// Gets event list for scout detail reservations.
function getScoutReservationEventsForRange(eventsForRange, scout, range) {
	if (!scout || !range?.startDate || !range?.endDate) {
		return [];
	}
	return [...(Array.isArray(eventsForRange) ? eventsForRange : [])]
		.filter(
			(event) =>
				event?.registrationRequired &&
				eventMatchesScoutRegistration(event, scout) &&
				eventOverlapsDateRange(
					event,
					range.startDate,
					range.endDate,
				),
		)
		.sort(
			(a, b) =>
				(parseEventStartDate(a)?.getTime() || 0) -
				(parseEventStartDate(b)?.getTime() || 0),
		);
}
// Gets event list for adult detail reservations.
function getAdultReservationEventsForRange(eventsForRange, adult, range) {
	if (!adult || !range?.startDate || !range?.endDate) {
		return [];
	}
	return [...(Array.isArray(eventsForRange) ? eventsForRange : [])]
		.filter(
			(event) =>
				event?.registrationRequired &&
				eventMatchesAdultRegistration(event, adult) &&
				eventOverlapsDateRange(
					event,
					range.startDate,
					range.endDate,
				),
		)
		.sort(
			(a, b) =>
				(parseEventStartDate(a)?.getTime() || 0) -
				(parseEventStartDate(b)?.getTime() || 0),
		);
}
// Renders a reservation row for a person detail panel.
function renderPersonEventReservationRow(event, person, dataAttributes = "") {
	const registered = isPersonRegisteredForEvent(event, person);
	const buttonLabel = registered
		? "Cancel reservation"
		: "Reserve a spot";
	return `<div class="event-registration-row scout-reservation-row">
<div>
<strong><a class="text-link" href="#/events/${event.id}">${event.title}</a></strong>
<span>${event.dateLabel || formatEventListDate(event) || "Date TBD"}${event.homeBase || event.location ? ` &bull; ${event.homeBase || event.location}` : ""}</span>
</div>
<div class="scout-reservation-action" data-scout-reservation-action>
<button class="scout-reservation-button${registered ? " is-registered" : ""}" type="button" ${dataAttributes} data-reservation-next-state="${registered ? "false" : "true"}" aria-pressed="${registered ? "true" : "false"}">${buttonLabel}</button>
</div>
</div>`;
}
// Renders scout detail event reservation markup.
function renderEventReservationSection(options = {}) {
	const scout = options.scout || null;
	if (!scout) {
		return "";
	}
	const range = options.range || getScoutReservationRange();
	const reservationEvents = getScoutReservationEventsForRange(
		options.events || [],
		scout,
		range,
	);
	const person = personFromScout(scout);
	const rangeLabel = `${formatFullDate(range.startDate)} - ${formatFullDate(range.endDate)}`;
	const eventRows = reservationEvents
		.map((event) => {
			return renderPersonEventReservationRow(
				event,
				person,
				`data-scout-event-reserve="${event.id}" data-reservation-scout-id="${scout.id}"`,
			);
		})
		.join("");
	return `<section class="section">
<article class="panel event-registration-panel scout-reservation-panel">
<div class="panel-heading">
<h3>Event reservations</h3>
<p>Reservation-required events for ${scout.name} from ${rangeLabel}.</p>
</div>
<div class="event-registration-list">${eventRows || `<p class="event-description">No reservation-required events match this scout in this date range.</p>`}</div>
</article>
</section>`;
}
// Renders adult detail event reservation markup.
function renderAdultEventReservationSection(options = {}) {
	const adult = options.adult || null;
	if (!adult) {
		return "";
	}
	const range = options.range || getAdultReservationRange();
	const reservationEvents = getAdultReservationEventsForRange(
		options.events || [],
		adult,
		range,
	);
	const person = personFromAdult(
		adult,
		getAdultLeaderAssignment(adult.id)?.role || adult.relationship,
	);
	const rangeLabel = `${formatFullDate(range.startDate)} - ${formatFullDate(range.endDate)}`;
	const eventRows = reservationEvents
		.map((event) =>
			renderPersonEventReservationRow(
				event,
				person,
				`data-adult-event-reserve="${event.id}" data-reservation-adult-id="${adult.id}"`,
			),
		)
		.join("");
	return `<section class="section">
<article class="panel event-registration-panel scout-reservation-panel">
<div class="panel-heading">
<h3>Event reservations</h3>
<p>Reservation-required events for ${adult.name} from ${rangeLabel}.</p>
</div>
<div class="event-registration-list">${eventRows || `<p class="event-description">No reservation-required events match this adult in this date range.</p>`}</div>
</article>
</section>`;
}
// Gets active parent adult for event routing, rendering, or filtering.
function getActiveParentAdult() {
	return (
		savedParentGuardians.find(
			(adult) => getScoutsForAdult(adult).length,
		) ||
		savedParentGuardians[0] ||
		null
	);
}
// Gets linked scouts for current parent for event routing, rendering, or filtering.
function getLinkedScoutsForCurrentParent() {
	const activeParent = getActiveParentAdult();
	return activeParent ? getScoutsForAdult(activeParent) : [];
}
// Builds or checks event text for registration behavior.
function eventTextForRegistration(event) {
	return [
		event?.title,
		event?.description,
		event?.detailNote,
		event?.homeBase,
		event?.location,
		...(event?.activities || []).flatMap((activity) => [
			activity?.description,
			activity?.location,
		]),
	]
		.filter(Boolean)
		.join(" ")
		.toLowerCase();
}
// Builds or checks event matches scout registration behavior.
function eventMatchesScoutRegistration(event, scout) {
	if (!event || !scout) {
		return false;
	}
	const audience = String(event.audience || "")
		.trim()
		.toLowerCase();
	if (audience === "adults") {
		return false;
	}
	if (!audience || audience === "troop" || audience === "unit") {
		return true;
	}
	const eventText = eventTextForRegistration(event);
	if (audience === "patrol") {
		return eventText.includes(
			String(scout.patrol || "").toLowerCase(),
		);
	}
	if (audience === "individuals") {
		return eventText.includes(String(scout.name || "").toLowerCase());
	}
	return false;
}
// Builds or checks event matches adult registration behavior.
function eventMatchesAdultRegistration(event, adult) {
	if (!event || !adult) {
		return false;
	}
	const audience = String(event.audience || "")
		.trim()
		.toLowerCase();
	if (!audience || audience === "troop" || audience === "unit") {
		return true;
	}
	if (audience === "adults") {
		return true;
	}
	if (audience === "individuals") {
		return eventTextForRegistration(event).includes(
			String(adult.name || "").toLowerCase(),
		);
	}
	return false;
}
// Gets registered children for event for event routing, rendering, or filtering.
function getRegisteredChildrenForEvent(
	event,
	linkedScouts = getLinkedScoutsForCurrentParent(),
) {
	return linkedScouts.filter((scout) =>
		eventMatchesScoutRegistration(event, scout),
	);
}
// Gets parent dashboard event groups for event routing, rendering, or filtering.
function getParentDashboardEventGroups() {
	const linkedScouts = getLinkedScoutsForCurrentParent();
	const today = startOfDay(prototypeToday);
	const recentWindowStart = new Date(today);
	recentWindowStart.setDate(recentWindowStart.getDate() - 21);
	const upcomingWindowEnd = new Date(today);
	upcomingWindowEnd.setDate(upcomingWindowEnd.getDate() + 56);
	const relevantEvents = events
		.map((event) => ({
			event,
			registeredScouts: getRegisteredChildrenForEvent(
				event,
				linkedScouts,
			),
		}))
		.filter(({ registeredScouts }) => registeredScouts.length);
	const recent = relevantEvents
		.filter(({ event }) => {
			const endDate =
				parseEventEndDate(event) || parseEventStartDate(event);
			if (!endDate) {
				return false;
			}
			const endDay = startOfDay(endDate).getTime();
			return (
				endDay < today.getTime() &&
				endDay >= recentWindowStart.getTime()
			);
		})
		.sort(
			(a, b) =>
				(parseEventEndDate(b.event)?.getTime() ||
					parseEventStartDate(b.event)?.getTime() ||
					0) -
				(parseEventEndDate(a.event)?.getTime() ||
					parseEventStartDate(a.event)?.getTime() ||
					0),
		)
		.slice(0, 2);
	const upcoming = relevantEvents
		.filter(({ event }) => {
			const startDate = parseEventStartDate(event);
			if (!startDate) {
				return false;
			}
			const startDay = startOfDay(startDate).getTime();
			return (
				startDay >= today.getTime() &&
				startDay <= upcomingWindowEnd.getTime()
			);
		})
		.sort(
			(a, b) =>
				(parseEventStartDate(a.event)?.getTime() || 0) -
				(parseEventStartDate(b.event)?.getTime() || 0),
		);
	return { linkedScouts, recent, upcoming };
}
// Checks whether the current viewer can interact with gallery social.
function canInteractWithGallerySocial() {
	return Boolean(getCurrentViewerIdentity());
}
// Checks whether the current viewer can moderate gallery comments.
function canModerateGalleryComments() {
	return canSeeOrgChart();
}
// Checks whether the current viewer can remove gallery comment.
function canRemoveGalleryComment(comment) {
	const viewer = getCurrentViewerIdentity();
	return Boolean(
		viewer &&
			(viewer.id === comment.authorId ||
				canModerateGalleryComments()),
	);
}
// Formats comment date time for display or form fields.
function formatCommentDateTime(value) {
	const parsed = value ? new Date(value) : null;
	if (!parsed || Number.isNaN(parsed.getTime())) {
		return "Just now";
	}
	return parsed.toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}
// Computes the next gallery comment id value.
function nextGalleryCommentId(image) {
	const used = new Set(
		(image.comments || []).map((comment) => comment.id),
	);
	let counter = (image.comments || []).length + 1;
	while (used.has(`comment-${counter}`)) counter += 1;
	return `comment-${counter}`;
}
// Toggles gallery reaction for the current viewer.
function toggleGalleryReaction(image, reactionType, viewerId) {
	image.reactions = normalizeImageReactions(image.reactions);
	imageReactionTypes.forEach((type) => {
		image.reactions[type] = (image.reactions[type] || []).filter(
			(id) => id !== viewerId,
		);
	});
	if (reactionType) {
		image.reactions[reactionType] = [
			...(image.reactions[reactionType] || []),
			viewerId,
		];
	}
}
