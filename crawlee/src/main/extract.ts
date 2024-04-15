import {
  BrowserName,
  createPlaywrightRouter,
  DeviceCategory,
  PlaywrightCrawler,
  RobotsFile,
} from "crawlee";
import { dataset } from "./dataset";

const router = createPlaywrightRouter();
const startUrls = ["https://stackoverflow.com/questions"];
const robotsUrl = "https://stackoverflow.com/robots.txt";
const crawler = new PlaywrightCrawler({
  requestHandler: router,
  minConcurrency: 1,
  maxConcurrency: 1,
  maxRequestsPerMinute: 60,
  headless: true,
  browserPoolOptions: {
    fingerprintOptions: {
      fingerprintGeneratorOptions: {
        browsers: [BrowserName.chrome, BrowserName.firefox],
        devices: [DeviceCategory.desktop],
        locales: ["en-US"],
      },
    },
  },
  preNavigationHooks: [
    async ({ blockRequests }) => {
      await blockRequests({
        extraUrlPatterns: [".mp4", ".webp", ".webm"],
      });
    },
  ],
});
const robotsFile = await RobotsFile.find(robotsUrl);
const visitedUrls = new Set<string>();
const respectRobotsFile = false;

router.addDefaultHandler(async ({ log, page, enqueueLinks }) => {
  const anchors = await page.locator("a").all();
  const hrefs: Array<string> = [];
  for (const anchor of anchors) {
    const href = await anchor.getAttribute("href");
    if (!href) return;
    const isAllowed = robotsFile.isAllowed(href) || !respectRobotsFile;
    if (isAllowed && !visitedUrls.has(href)) {
      hrefs.push(href);
    }
  }

  const currentUrl = page.url();
  log.info(`Crawled ${currentUrl}`);
  if (robotsFile.isAllowed(currentUrl) && !visitedUrls.has(currentUrl)) {
    visitedUrls.add(currentUrl);
    const innerText = await page.innerText("*");
    await dataset.pushData({
      link: currentUrl,
      innerText: innerText.replaceAll("\n", " "),
    });
    await enqueueLinks({ strategy: "same-domain", urls: hrefs });
  }
});

await crawler.run(startUrls);
