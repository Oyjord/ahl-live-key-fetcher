const puppeteer = require('puppeteer');

async function fetchKey(gameId) {
  const url = `https://theahl.com/stats/game-center/${gameId}`;
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  let extractedKey = null;

  // Intercept network requests
  page.on('request', request => {
    const reqUrl = request.url();
    if (reqUrl.includes('lscluster.hockeytech.com/feed/index.php')) {
      const match = reqUrl.match(/key=([a-f0-9]{32})/);
      if (match) {
        extractedKey = match[1];
      }
    }
  });

  await page.goto(url, { waitUntil: 'networkidle2' });

  // Wait up to 15 seconds for network or DOM injection
  const maxWait = 15000;
  const pollInterval = 250;
  let waited = 0;

  while (!extractedKey && waited < maxWait) {
    // Try DOM and storage inspection
    const keyFromDOM = await page.evaluate(() => {
      // Inline scripts
      const scripts = Array.from(document.querySelectorAll('script'));
      for (let script of scripts) {
        const match = script.textContent.match(/key=([a-f0-9]{32})/);
        if (match) return match[1];
      }

      // Full HTML scan
      const html = document.documentElement.innerHTML;
      const matchHtml = html.match(/key=([a-f0-9]{32})/);
      if (matchHtml) return matchHtml[1];

      // localStorage
      for (let k of Object.keys(localStorage)) {
        const val = localStorage.getItem(k);
        const match = val && val.match(/key=([a-f0-9]{32})/);
        if (match) return match[1];
      }

      // sessionStorage
      for (let k of Object.keys(sessionStorage)) {
        const val = sessionStorage.getItem(k);
        const match = val && val.match(/key=([a-f0-9]{32})/);
        if (match) return match[1];
      }

      return null;
    });

    if (keyFromDOM) {
      extractedKey = keyFromDOM;
      break;
    }

    await new Promise(res => setTimeout(res, pollInterval));
    waited += pollInterval;
  }

  await browser.close();

  if (!extractedKey) throw new Error('Key not found after waiting');
  return extractedKey;
}

module.exports = fetchKey;

if (require.main === module) {
  const gameId = process.argv[2];
  fetchKey(gameId).then(console.log).catch(console.error);
}
