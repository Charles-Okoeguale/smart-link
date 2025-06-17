// In-memory storage (shared with other functions)
let links = new Map();
let clicks = new Map();

export default function handler(req, res) {
  const { id } = req.query;
  
  const link = links.get(id);
  
  if (!link) {
    return res.status(404).send('Link not found');
  }

  // Track click
  const timestamps = clicks.get(id) || [];
  timestamps.push(new Date());
  clicks.set(id, timestamps);

  // Detect device and redirect
  const userAgent = req.headers['user-agent'] || '';
  const isMobile = /iPhone|Android/i.test(userAgent);
  const isIOS = /iPhone/i.test(userAgent);
  
  const targetUrl = isMobile 
    ? (isIOS ? link.iosUrl : link.androidUrl) 
    : link.desktopUrl;
  
  res.redirect(302, targetUrl);
}