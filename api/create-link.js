import { nanoid } from 'nanoid';

// In-memory storage (for demo purposes)
let links = new Map();

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { iosUrl, androidUrl, desktopUrl } = req.body;
  
  if (!iosUrl || !androidUrl) {
    return res.status(400).json({ error: 'iOS and Android URLs are required' });
  }

  const id = nanoid(6);
  links.set(id, { iosUrl, androidUrl, desktopUrl });
  
  const baseUrl = `https://${req.headers.host}`;
  res.json({ shortUrl: `${baseUrl}/${id}` });
}