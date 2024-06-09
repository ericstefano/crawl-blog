import {
  BrowserName,
  createPlaywrightRouter,
  DeviceCategory,
  PlaywrightCrawler,
  RobotsFile,
} from "crawlee";
import { dataset } from "./dataset";

const router = createPlaywrightRouter();
const startUrls = ["https://stackoverflow.com/questions?tab=Frequent"];
const robotsUrl = "https://stackoverflow.com/questions/robots.txt";
const robotsFile = await RobotsFile.find(robotsUrl);
const visitedUrls = new Set<string>();
const respectRobotsFile = false;
const contentSelector = "div#content"
const excludedSavePatterns = ['&page=', '&pageSize=', '?tab=']
const crawler = new PlaywrightCrawler({
  requestHandler: router,
  minConcurrency: 1,
  maxConcurrency: 1,
  maxRequestsPerMinute: 45,
  headless: true,
  browserPoolOptions: {
    fingerprintOptions: {
      fingerprintGeneratorOptions: {
        browsers: [BrowserName.chrome],
        devices: [DeviceCategory.desktop],
        locales: ["en-US"],
      },
    },
  },
  preNavigationHooks: [
    async ({ blockRequests }) => {
      await blockRequests({
        urlPatterns: ['.css', '.mp4', '.pdf', '.woff', '.zip', '.jpeg', 'jpg', '.wepb', '.webm']
      });
    },
  ],
});

function isExcludedFromSavePatterns(url: string) {
  return excludedSavePatterns.some((pattern) => url.includes(pattern))
}

function isUrlAllowed(url: string) {
  return (!respectRobotsFile || robotsFile.isAllowed(url)) && !visitedUrls.has(url)
}

router.addDefaultHandler(async ({ log, page, enqueueLinks }) => {
  const currentUrl = page.url();
  log.info(`Crawled ${currentUrl}`);

  if (isUrlAllowed(currentUrl)) {
    visitedUrls.add(currentUrl);

    if (!isExcludedFromSavePatterns(currentUrl)) {
      const innerText = await page.innerText(contentSelector);
      await dataset.pushData({
        link: currentUrl,
        innerText: innerText.replaceAll("\n", " "),
      });
      log.info(`Saved ${currentUrl}`);
    }
    await enqueueLinks({ strategy: "same-domain", selector: 'h3 a.s-link', forefront: true });
    await enqueueLinks({ strategy: "same-domain", selector: 'a.s-pagination--item.js-pagination-item' });
  }
});

await crawler.run(startUrls);
