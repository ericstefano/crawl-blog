import { createPlaywrightRouter, PlaywrightCrawler, RobotsFile } from "crawlee";
import { dataset } from "./export";

const router = createPlaywrightRouter();
const domain = "stackoverflow.com";
const start_urls = ["https://stackoverflow.com/questions"];
const unique_urls = new Set();
const visited_urls = new Set();

let robots: null | RobotsFile = null;

router.addDefaultHandler(async ({ enqueueLinks }) => {
  robots = await RobotsFile.find("https://stackoverflow.com/robots.txt");
  await enqueueLinks({ strategy: "same-domain", label: "CRAWLING" });
});

router.addHandler("CRAWLING", async ({ page, response, log, enqueueLinks }) => {
  const links = await page.locator("a").all();
  const hrefs = [];
  for (const link of links) {
    const href = await link.getAttribute("href");
    const parsed = href?.trim();
    const innerText = await page.innerText("*");
    const isAllowed = robots?.isAllowed(href || "");
    if (parsed?.includes(domain) && !unique_urls.has(parsed) && isAllowed) {
      await dataset.pushData({
        link: parsed,
        plainText: innerText.replaceAll("\n", " "),
      });
      unique_urls.add(parsed);
      hrefs.push(parsed);
      log.info(`Saved ${parsed}`);
    }
  }

  if (response && !visited_urls.has(response.url().trim())) {
    const trimmed = response.url().trim();
    log.info(`Visited ${trimmed}`);
    visited_urls.add(trimmed);
    await enqueueLinks({ strategy: "same-domain", urls: hrefs });
  }
});

const crawler = new PlaywrightCrawler({
  requestHandler: router,
  minConcurrency: 3,
  maxConcurrency: 3,
  maxRequestsPerMinute: 120,
  headless: true,
});

await crawler.run(start_urls);
