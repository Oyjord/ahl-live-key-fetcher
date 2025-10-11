const axios = require('axios');

async function getLiveFeed(gameId, key) {
  const url = `https://lscluster.hockeytech.com/feed/index.php?feed=statviewfeed&view=gameSummary&game_id=${gameId}&key=${key}&site_id=3&client_code=ahl&lang=en`;
  const headers = {
    'Accept': 'application/json',
    'Referer': 'https://theahl.com/',
    'Origin': 'https://theahl.com',
    'User-Agent': 'Mozilla/5.0'
  };

  const response = await axios.get(url, { headers });
  return response.data;
}

module.exports = getLiveFeed;
