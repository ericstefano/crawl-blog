import { createPlaywrightRouter, Dataset, PlaywrightCrawler } from "crawlee";
const dataset = await Dataset.open("stackoverflow");
const router = createPlaywrightRouter();
const domain = "stackoverflow.com";
const start_urls = ["https://stackoverflow.com/questions"];
const unique_urls = new Set();
const visited_urls = new Set();

router.addDefaultHandler(async ({ enqueueLinks, page, response, log }) => {
  const links = await page.locator("a").all();
  for (const link of links) {
    const href = await link.getAttribute("href");
    const parsed = href?.trim();
    if (parsed?.includes(domain) && !unique_urls.has(parsed)) {
      await dataset.pushData({ link: parsed });
      unique_urls.add(parsed);
      log.info(`Saved ${parsed}`);
    }
  }

  if (response && !visited_urls.has(response.url().trim())) {
    const trimmed = response.url().trim();
    log.info(`Visited ${trimmed}`);
    visited_urls.add(trimmed);
    await enqueueLinks({ strategy: "same-domain" });
  }
});

const crawler = new PlaywrightCrawler({
  requestHandler: router,
  minConcurrency: 1,
  maxConcurrency: 1,
  maxRequestsPerMinute: 60,
  // maxRequestsPerCrawl: 5,
  headless: false,
});

await crawler.run(start_urls);
