// api/ingest.js  (Vercel serverless function)
const Parser = require('rss-parser');
const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const rssUrl =
      (req.query && req.query.url) ||
      process.env.RSS_URL ||
      'https://www.coindesk.com/arc/outboundfeeds/rss/';

    const parser = new Parser({
      headers: { 'User-Agent': 'PepeNewsBot/1.0' },
    });
    const feed = await parser.parseURL(rssUrl);

    // трошки контенту для превʼю
    const safeFetch = async (url) => {
      try {
        const r = await axios.get(url, { timeout: 8000 });
        const text = String(r.data || '').replace(/\s+/g, ' ');
        return text.slice(0, 800);
      } catch {
        return '';
      }
    };

    const items = [];
    for (const it of (feed.items || []).slice(0, 8)) {
      const preview = await safeFetch(it.link || '');
      items.push({
        title: it.title || '',
        link: it.link || '',
        pubDate: it.pubDate || '',
        preview: preview || it.contentSnippet || it.content || '',
      });
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).send(JSON.stringify({ items }));
  } catch (e) {
    res.status(500).send({ error: String(e?.message || e) });
  }
};
