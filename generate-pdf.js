const puppeteer = require('puppeteer');

const LOCALHOST = 'http://0.0.0.0:8080';

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(LOCALHOST, { waitUntil: 'networkidle2' });
    // page.pdf() is currently supported only in headless mode.
    // @see https://bugs.chromium.org/p/chromium/issues/detail?id=753118
    await page.pdf({
      path: 'cv.pdf',
      format: 'A4',
      margin: {
        top: '1.5cm',
        left: '1.5cm',
        right: '1.5cm',
        bottom: '1.5cm'
      },
    });

    await browser.close();
  } catch (err) {
    console.error(err);
  }
})();
