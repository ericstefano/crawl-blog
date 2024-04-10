import { createPlaywrightRouter, Dataset, PlaywrightCrawler } from "crawlee";
const BLOG_POST = "BLOG_POST";
const dataset = await Dataset.open("akita");
const router = createPlaywrightRouter();

router.addDefaultHandler(async ({ enqueueLinks }) => {
  await enqueueLinks({
    selector: "div.texts > a",
    label: BLOG_POST,
  });
});

router.addHandler(BLOG_POST, async ({ page, log }) => {
  log.info("Crawled " + page.url());

  const title = await page.locator("div.post-title > h3").innerText();
  const date_string = await page.locator('div.post-title > h4').innerText();
  const post = {
    date_string,
    title,
  };
  log.info("Collected " + JSON.stringify(post));
  await dataset.pushData(post);
  await dataset.exportToJSON("akita");
});

const crawler = new PlaywrightCrawler({
  requestHandler: router,
  minConcurrency: 1,
  maxConcurrency: 1,
  maxRequestsPerMinute: 60,
  //   maxRequestsPerCrawl: 5,
  headless: false,
});

await crawler.run(["https://www.akitaonrails.com/"]);
