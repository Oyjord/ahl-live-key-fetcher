const puppeteer = require('puppeteer');

async function fetchKey(gameId) {
  const url = `https://theahl.com/stats/game-center/${gameId}`;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  const key = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script'));
    for (let script of scripts) {
      const match = script.textContent.match(/key=([a-f0-9]{32})/);
      if (match) return match[1];
    }
    return null;
  });

  await browser.close();
  if (!key) throw new Error('Key not found');
  return key;
}

module.exports = fetchKey;

// Run standalone
if (require.main === module) {
  const gameId = process.argv[2];
  fetchKey(gameId).then(console.log).catch(console.error);
}
