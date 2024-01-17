const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let currentURL;

    await page.goto(  'https://www.starbucks.co.uk/menu/drinks/espresso-drinks');


var links = await page.$$eval('div > div > div > main > div > section > div > div > div > div > div > ul > li > ul > div > ul > li > a', links => {
    return links.map(links => links.href);
});


   console.log(links)
  await browser.close();
})();