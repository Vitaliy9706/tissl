const app = require("express")();

let chrome = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require("chrome-aws-lambda");
  puppeteer = require("puppeteer-core");
} else {
  puppeteer = require("puppeteer");
}

app.get("/api", async (req, res) => {
  let options = {};

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    };
  }

  try {
    let browser = await puppeteer.launch(options);

    let page = await browser.newPage();
    await page.goto('https://hub.tissl.com/login?returnUrl=%2Fhome');
    await page.waitForSelector('input[formcontrolname="username"]');
  
    await page.type('input[formcontrolname="username"]', 'Vitaly');
    await page.type('input[formcontrolname="password"]', '123');
    await page.click('button.btn.btn-primary');

    await page.waitForNavigation();

    await page.goto('https://hub.tissl.com/report-centre/sales-percentage-vs-total');
    const token = await page.evaluate(() => {
      return localStorage.getItem('token');
    });
    res.send(token);
  } catch (err) {
    console.error(err);
    return null;
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});

module.exports = app;
