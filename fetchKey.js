const puppeteer = require('puppeteer');

async function fetchKey(gameId) {
  const url = `https://theahl.com/stats/game-center/${gameId}`;
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  let extractedKey = null;

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

  // Wait up to 10 seconds for key to appear
  const maxWait = 10000;
  const pollInterval = 250;
  let waited = 0;

  while (!extractedKey && waited < maxWait) {
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
