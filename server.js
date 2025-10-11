const express = require('express');
const fetchKey = require('./fetchKey');
const getLiveFeed = require('./getLiveFeed');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/live/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    const key = await fetchKey(gameId);
    const data = await getLiveFeed(gameId, key);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
