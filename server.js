import express from 'express';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.json());
app.use(express.static('.'));

const links = new Map();
const clicks = new Map();

app.post('/create-link', (req, res) => {
  const { iosUrl, androidUrl, desktopUrl } = req.body;
  const id = nanoid(6);
  links.set(id, { iosUrl, androidUrl, desktopUrl });
  res.json({ shortUrl: `http://localhost:3000/${id}` });
});

app.get('/:id', (req, res) => {
  const link = links.get(req.params.id);
  
  if (!link) {
    return res.status(404).send('Link not found');
  }

  const timestamps = clicks.get(req.params.id) || [];
  timestamps.push(new Date());
  clicks.set(req.params.id, timestamps);

  const userAgent = req.headers['user-agent'];
  const isMobile = /iPhone|Android/i.test(userAgent);
  const isIOS = /iPhone/i.test(userAgent);
  
  const targetUrl = isMobile 
    ? (isIOS ? link.iosUrl : link.androidUrl) 
    : link.desktopUrl;
  
  res.redirect(targetUrl);
});

app.get('/analytics/:id', (req, res) => {
  const clickData = clicks.get(req.params.id) || [];
  res.json({ 
    clicks: clickData.length,
    timestamps: clickData 
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, () => console.log('PoC running on http://localhost:3000')); 