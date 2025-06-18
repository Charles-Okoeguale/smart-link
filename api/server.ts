import express from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database paths
const DATA_DIR = path.join(process.cwd(), 'data');
const URLS_FILE = path.join(DATA_DIR, 'urls.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');

// Type definitions
interface UrlData {
  shortCode: string;
  originalUrl: string;
  campaignId: string;
  creatorId: string;
  routingRules: Record<string, string>;
  platformRouting: boolean;
  createdAt: string;
  clickCount: number;
}

interface AnalyticsData {
  shortCode: string;
  campaignId: string;
  creatorId: string;
  originalUrl: string;
  targetUrl: string;
  timestamp: string;
  userAgent: string;
  ip: string;
  country: string;
  countryName: string;
  city: string;
  region: string;
  routingRule: string;
  platform: string;
}

// Platform Detection Utility
function detectPlatform(userAgent: string): 'ios' | 'android' | 'web' {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod') ||
      (ua.includes('macintosh') && ua.includes('mobile'))) {
    return 'ios';
  }
  
  if (ua.includes('android')) {
    return 'android';
  }
  
  return 'web';
}

// Database utilities
function initializeDataFiles() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(URLS_FILE)) {
      fs.writeFileSync(URLS_FILE, JSON.stringify([
        {
          shortCode: 'demo123',
          originalUrl: 'https://example.com/landing',
          campaignId: 'demo-campaign',
          creatorId: 'poc-creator',
          routingRules: {
            ios: 'https://apps.apple.com/app/example',
            android: 'https://play.google.com/store/apps/details?id=com.example',
            web: 'https://example.com/landing'
          },
          platformRouting: true,
          createdAt: new Date().toISOString(),
          clickCount: 0
        }
      ], null, 2), 'utf8');
    }

    if (!fs.existsSync(ANALYTICS_FILE)) {
      fs.writeFileSync(ANALYTICS_FILE, JSON.stringify([
        {
          shortCode: 'demo123',
          campaignId: 'demo-campaign',
          creatorId: 'poc-creator',
          originalUrl: 'https://example.com/landing',
          targetUrl: 'https://example.com/landing',
          timestamp: new Date().toISOString(),
          userAgent: 'Demo User Agent',
          ip: '127.0.0.1',
          country: 'US',
          countryName: 'United States',
          city: 'Demo City',
          region: 'Demo Region',
          routingRule: 'web platform routing',
          platform: 'web'
        }
      ], null, 2), 'utf8');
    }
  } catch (error) {
    console.warn('Could not initialize data files:', error);
  }
}

function getAllUrls(): UrlData[] {
  try {
    const data = fs.readFileSync(URLS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading URLs:', error);
    return [];
  }
}

function saveUrl(urlData: UrlData): UrlData {
  try {
    const urls = getAllUrls();
    urls.push(urlData);
    fs.writeFileSync(URLS_FILE, JSON.stringify(urls, null, 2), 'utf8');
    return urlData;
  } catch (error) {
    console.error('Error saving URL:', error);
    return urlData; // Return data even if save fails
  }
}

function findUrlByShortCode(shortCode: string): UrlData | null {
  try {
    const urls = getAllUrls();
    return urls.find(url => url.shortCode === shortCode) || null;
  } catch (error) {
    console.error('Error finding URL:', error);
    return null;
  }
}

function getAllAnalytics(): AnalyticsData[] {
  try {
    const data = fs.readFileSync(ANALYTICS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading analytics:', error);
    return [];
  }
}

function saveAnalytics(analyticsData: AnalyticsData): AnalyticsData {
  try {
    const analytics = getAllAnalytics();
    analytics.push(analyticsData);
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(analytics, null, 2), 'utf8');
    return analyticsData;
  } catch (error) {
    console.error('Error saving analytics:', error);
    return analyticsData;
  }
}

// Initialize data files
initializeDataFiles();

// API Routes

// POST /api/shorten - Create short URL
app.post('/api/shorten', (req, res) => {
  try {
    const { originalUrl, campaignId, creatorId, routingRules, platformRouting } = req.body;

    if (!originalUrl || !campaignId || !creatorId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: originalUrl, campaignId, creatorId'
      });
    }

    const shortCode = nanoid(8);
    const urlData: UrlData = {
      shortCode,
      originalUrl,
      campaignId,
      creatorId,
      routingRules: routingRules || {},
      platformRouting: platformRouting || false,
      createdAt: new Date().toISOString(),
      clickCount: 0
    };

    const savedUrl = saveUrl(urlData);
    
    res.json({
      success: true,
      shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`,
      shortCode,
      data: savedUrl
    });
  } catch (error) {
    console.error('Error creating short URL:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/redirect - Handle redirect with analytics
app.post('/api/redirect', (req, res) => {
  try {
    const { shortCode, userLocation, userAgent, timestamp } = req.body;

    const urlData = findUrlByShortCode(shortCode);
    if (!urlData) {
      return res.json({
        success: false,
        error: 'Short URL not found'
      });
    }

    // Detect platform
    const platform = detectPlatform(userAgent);
    
    // Determine target URL based on platform routing
    let targetUrl = urlData.originalUrl;
    let routingRule = 'default url';

    if (urlData.platformRouting && urlData.routingRules) {
      const platformUrl = urlData.routingRules[platform] || urlData.routingRules[platform.toUpperCase()];
      if (platformUrl) {
        targetUrl = platformUrl;
        routingRule = `${platform} platform routing`;
      }
    }

    // Save analytics
    const analyticsData: AnalyticsData = {
      shortCode,
      campaignId: urlData.campaignId,
      creatorId: urlData.creatorId,
      originalUrl: urlData.originalUrl,
      targetUrl,
      timestamp,
      userAgent,
      ip: userLocation.ip,
      country: userLocation.country,
      countryName: userLocation.countryName,
      city: userLocation.city,
      region: userLocation.region,
      routingRule,
      platform
    };

    saveAnalytics(analyticsData);

    res.json({
      success: true,
      targetUrl,
      platform,
      routingRule
    });
  } catch (error) {
    console.error('Error processing redirect:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/analytics - Get analytics data
app.get('/api/analytics', (req, res) => {
  try {
    const { campaignId } = req.query;

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID is required'
      });
    }

    const allAnalytics = getAllAnalytics();
    const campaignAnalytics = allAnalytics.filter(item => item.campaignId === campaignId);

    // Calculate summary
    const summary = {
      totalClicks: campaignAnalytics.length,
      uniqueCountries: new Set(campaignAnalytics.map(item => item.country)).size,
      clicksByCountry: {} as Record<string, number>,
      clicksByDate: {} as Record<string, number>,
      clicksByPlatform: {} as Record<string, number>,
      platformCountryBreakdown: {} as Record<string, Record<string, number>>
    };

    campaignAnalytics.forEach(click => {
      // Count by country
      summary.clicksByCountry[click.countryName || click.country] = 
        (summary.clicksByCountry[click.countryName || click.country] || 0) + 1;

      // Count by platform
      summary.clicksByPlatform[click.platform] = 
        (summary.clicksByPlatform[click.platform] || 0) + 1;

      // Count by date
      const date = new Date(click.timestamp).toDateString();
      summary.clicksByDate[date] = (summary.clicksByDate[date] || 0) + 1;
    });

    res.json({
      analytics: campaignAnalytics,
      summary
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist/client')));
  
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../dist/client/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 