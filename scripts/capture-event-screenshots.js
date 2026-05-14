const { chromium } = require("playwright");
const path = require("path");

const targetUrl =
	process.env.TARGET_URL ||
	"http://host.docker.internal:4177/#/events/camping-12";
const outputDir =
	process.env.OUTPUT_DIR || path.join(process.cwd(), "screenshots");

const viewports = [
	{ name: "desktop", width: 1440, height: 1100 },
	{ name: "tablet", width: 834, height: 1112 },
	{ name: "mobile", width: 390, height: 844 },
];

(async () => {
	const browser = await chromium.launch({ headless: true });

	for (const viewport of viewports) {
		const page = await browser.newPage({
			viewport: { width: viewport.width, height: viewport.height },
			deviceScaleFactor: 1,
		});

		await page.goto(targetUrl, {
			waitUntil: "networkidle",
			timeout: 30000,
		});
		await page.waitForSelector("#app", { timeout: 10000 });
		await page.waitForTimeout(1000);
		await page.screenshot({
			path: path.join(
				outputDir,
				`event-camping-12-${viewport.name}.png`,
			),
			fullPage: true,
		});
		await page.close();
	}

	await browser.close();
})();
