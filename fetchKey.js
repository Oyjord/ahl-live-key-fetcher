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
    const match = reqUrl.match(/key=([a-f0-9]{32})/);
    if (match) {
      extractedKey = match[1];
    }
  });

  await page.goto(url, { waitUntil: 'networkidle2' });

  await browser.close();

  if (!extractedKey) throw new Error('Key not found via network interception');
  return extractedKey;
}

module.exports = fetchKey;

if (require.main === module) {
  const gameId = process.argv[2];
  fetchKey(gameId).then(console.log).catch(console.error);
}
