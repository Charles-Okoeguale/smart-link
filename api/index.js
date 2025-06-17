import { nanoid } from 'nanoid';

// In-memory storage
let links = new Map();
let clicks = new Map();

export default function handler(req, res) {
  const { method } = req;
  const url = req.url || '';

  console.log('Request:', method, url); // Debug log

  // Handle API routes first
  if (method === 'POST' && (url === '/api/index.js' || url === '/api' || url === '/' || url.includes('index.js'))) {
    // Create link
    const { action, iosUrl, androidUrl, desktopUrl } = req.body;
    
    if (!iosUrl || !androidUrl) {
      return res.status(400).json({ error: 'iOS and Android URLs are required' });
    }

    const id = nanoid(6);
    links.set(id, { iosUrl, androidUrl, desktopUrl });
    return res.json({ shortUrl: `https://${req.headers.host}/${id}` });
  }

  // Handle analytics
  if (method === 'GET' && url.includes('/analytics/')) {
    const linkId = url.split('/analytics/')[1];
    const clickData = clicks.get(linkId) || [];
    return res.json({ 
      clicks: clickData.length,
      timestamps: clickData 
    });
  }

  // Handle main page
  if (method === 'GET' && (url === '/' || url === '/api/index.js' || url.includes('index.js'))) {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Smart Links PoC</title>
    <style>
        body { font-family: Arial; max-width: 600px; margin: 50px auto; padding: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #0056b3; }
        #result { margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 4px; display: none; }
        .result-link { word-break: break-all; color: #007bff; text-decoration: none; }
        .analytics { margin-top: 10px; padding: 10px; background: #e9ecef; border-radius: 4px; font-size: 14px; }
    </style>
</head>
<body>
    <h1>Smart Links PoC</h1>
    <p>Create smart links that redirect users to different URLs based on their device type.</p>
    
    <form id="linkForm">
        <div class="form-group">
            <label>iOS URL:</label>
            <input type="url" id="iosUrl" placeholder="https://apps.apple.com/app/..." required>
        </div>
        <div class="form-group">
            <label>Android URL:</label>
            <input type="url" id="androidUrl" placeholder="https://play.google.com/store/apps/..." required>
        </div>
        <div class="form-group">
            <label>Desktop URL (optional):</label>
            <input type="url" id="desktopUrl" placeholder="https://example.com">
        </div>
        <button type="submit">Generate Smart Link</button>
    </form>
    
    <div id="result">
        <h3>Generated Smart Link:</h3>
        <a id="generatedLink" href="#" target="_blank"></a>
        <div class="analytics" id="analytics"></div>
        <button onclick="checkAnalytics()" style="margin-top: 10px;">Check Analytics</button>
    </div>

    <script>
        let currentLinkId = null;
        
        document.getElementById('linkForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const iosUrl = document.getElementById('iosUrl').value;
            const androidUrl = document.getElementById('androidUrl').value;
            const desktopUrl = document.getElementById('desktopUrl').value || 'https://fallback.com';
            
            try {
                console.log('Sending request...'); // Debug
                
                const response = await fetch(window.location.href, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ 
                        action: 'create', 
                        iosUrl, 
                        androidUrl, 
                        desktopUrl 
                    })
                });
                
                console.log('Response status:', response.status); // Debug
                
                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(\`HTTP \${response.status}: \${text}\`);
                }
                
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await response.text();
                    throw new Error(\`Expected JSON but got: \${text.substring(0, 100)}...\`);
                }
                
                const data = await response.json();
                currentLinkId = data.shortUrl.split('/').pop();
                
                document.getElementById('generatedLink').href = data.shortUrl;
                document.getElementById('generatedLink').textContent = data.shortUrl;
                document.getElementById('result').style.display = 'block';
                document.getElementById('analytics').innerHTML = '<strong>Analytics:</strong> Click count will appear here after clicks';
                
            } catch (error) {
                console.error('Full error:', error); // Debug
                alert('Error generating link: ' + error.message);
            }
        });

        async function checkAnalytics() {
            if (!currentLinkId) return;
            
            try {
                const response = await fetch(\`\${window.location.href}analytics/\${currentLinkId}\`);
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
    return res.send(htmlContent);
  }

  // Handle redirects - only if it's a GET request and looks like a link ID
  if (method === 'GET' && url !== '/' && !url.includes('analytics') && !url.includes('api')) {
    const linkId = url.startsWith('/') ? url.slice(1) : url;
    
    if (linkId && links.has(linkId)) {
      const link = links.get(linkId);
      
      // Track click
      const timestamps = clicks.get(linkId) || [];
      timestamps.push(new Date());
      clicks.set(linkId, timestamps);

      // Detect device
      const userAgent = req.headers['user-agent'] || '';
      const isMobile = /iPhone|Android/i.test(userAgent);
      const isIOS = /iPhone/i.test(userAgent);
      
      const targetUrl = isMobile 
        ? (isIOS ? link.iosUrl : link.androidUrl) 
        : link.desktopUrl;
      
      return res.redirect(302, targetUrl);
    }
  }

  // Default 404
  res.status(404).json({ error: 'Not found' });
}