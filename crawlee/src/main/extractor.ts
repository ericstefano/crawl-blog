import { createPlaywrightRouter, Dataset, PlaywrightCrawler, RobotsFile } from "crawlee";
const dataset = await Dataset.open("stackoverflow");
const router = createPlaywrightRouter();
const domain = "stackoverflow.com";
const start_urls = ["https://stackoverflow.com/questions"];
const unique_urls = new Set();
const visited_urls = new Set();

let robots: null | RobotsFile = null;

router.addDefaultHandler(async ({ enqueueLinks }) => {

  robots = await RobotsFile.find('https://stackoverflow.com/robots.txt');

  await enqueueLinks({ strategy: "same-domain", label: "crawling-link" });
});

router.addHandler("crawling-link", async ({ page, response, log, enqueueLinks }) => {

  const links = await page.locator("a").all()

  const hrefs = [];

  for (const link of links) {
    const href = await link.getAttribute("href");

    const parsed = href?.trim();
    const isAllowed = robots?.isAllowed(href || "")


    if (parsed?.includes(domain) && !unique_urls.has(parsed) && isAllowed) {
      await dataset.pushData({ link: parsed, plainText: await page.innerText("*") });
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
})

const crawler = new PlaywrightCrawler({
  requestHandler: router,
  minConcurrency: 1,
  maxConcurrency: 5,
  maxRequestsPerMinute: 60,
  headless: true,
});

await crawler.run(start_urls);
