import express from 'express';
import { nanoid } from 'nanoid';

const app = express();
app.use(express.json());

const links = new Map();
const clicks = new Map();

app.get('/', (req, res) => {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart Links PoC</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input[type="url"] { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        button { background-color: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        #result { margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 4px; display: none; }
        .result-link { word-break: break-all; color: #007bff; text-decoration: none; }
        .analytics { margin-top: 10px; padding: 10px; background-color: #e9ecef; border-radius: 4px; font-size: 14px; }
    </style>
</head>
<body>
    <h1>Smart Links PoC</h1>
    <p>Create smart links that redirect users to different URLs based on their device type.</p>
    
    <form id="linkForm">
        <div class="form-group">
            <label for="iosUrl">iOS URL:</label>
            <input type="url" id="iosUrl" name="iosUrl" placeholder="https://apps.apple.com/app/..." required>
        </div>
        <div class="form-group">
            <label for="androidUrl">Android URL:</label>
            <input type="url" id="androidUrl" name="androidUrl" placeholder="https://play.google.com/store/apps/..." required>
        </div>
        <div class="form-group">
            <label for="desktopUrl">Desktop URL (optional):</label>
            <input type="url" id="desktopUrl" name="desktopUrl" placeholder="https://example.com (fallback)">
        </div>
        <button type="submit">Generate Smart Link</button>
    </form>
    
    <div id="result">
        <h3>Generated Smart Link:</h3>
        <a id="generatedLink" class="result-link" href="#" target="_blank"></a>
        <div class="analytics" id="analytics"></div>
        <button onclick="checkAnalytics()" style="margin-top: 10px;">Check Analytics</button>
    </div>

    <script>
        let currentLinkId = null;
        document.getElementById('linkForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const iosUrl = formData.get('iosUrl');
            const androidUrl = formData.get('androidUrl');
            const desktopUrl = formData.get('desktopUrl') || 'https://fallback.com';
            
            try {
                const response = await fetch('/api/create-link', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ iosUrl, androidUrl, desktopUrl })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to create link');
                }
                
                const { shortUrl } = await response.json();
                currentLinkId = shortUrl.split('/').pop();
                document.getElementById('generatedLink').href = shortUrl;
                document.getElementById('generatedLink').textContent = shortUrl;
                document.getElementById('result').style.display = 'block';
                document.getElementById('analytics').innerHTML = '<strong>Analytics:</strong> Click count will appear here after clicks';
            } catch (error) {
                alert('Error generating link: ' + error.message);
            }
        });

        async function checkAnalytics() {
            if (!currentLinkId) return;
            try {
                const response = await fetch(\`/api/analytics/\${currentLinkId}\`);
                const data = await response.json();
                document.getElementById('analytics').innerHTML = \`
                    <strong>Analytics:</strong><br>
                    Total Clicks: \${data.clicks}<br>
                    Last Click: \${data.timestamps.length > 0 ? new Date(data.timestamps[data.timestamps.length - 1]).toLocaleString() : 'None'}
                \`;
            } catch (error) {
                console.error('Error fetching analytics:', error);
            }
        }
    </script>
</body>
</html>`;
  res.send(htmlContent);
});

app.post('/api/create-link', (req, res) => {
  const { iosUrl, androidUrl, desktopUrl } = req.body;
  const id = nanoid(6);
  links.set(id, { iosUrl, androidUrl, desktopUrl });
  res.json({ shortUrl: `https://${req.headers.host}/${id}` });
});

app.get('/api/analytics/:id', (req, res) => {
  const clickData = clicks.get(req.params.id) || [];
  res.json({ clicks: clickData.length, timestamps: clickData });
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

export default app;