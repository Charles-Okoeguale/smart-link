import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const URLS_FILE = path.join(DATA_DIR, 'urls.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');

// Type definitions
export interface UrlData {
  shortCode: string;
  originalUrl: string;
  campaignId: string;
  creatorId: string;
  routingRules: Record<string, string>;
  platformRouting: boolean;
  createdAt: string;
  clickCount: number;
}

export interface AnalyticsData {
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
export function detectPlatform(userAgent: string): 'ios' | 'android' | 'web' {
  const ua = userAgent.toLowerCase();
  
  // Check for iOS first (iPhone, iPad, iPod)
  if (ua.includes('iphone') || 
      ua.includes('ipad') || 
      ua.includes('ipod') ||
      (ua.includes('macintosh') && ua.includes('mobile'))) {
    return 'ios';
  }
  
  // Check for Android
  if (ua.includes('android')) {
    return 'android';
  }
  
  // Default to web (desktop, other mobile browsers, etc.)
  return 'web';
}

// Platform routing uses simple keys: IOS, ANDROID, WEB
// Auto geo-detection means no manual country routing needed

// Initialize data files safely (only if they don't exist and we can write)
function initializeDataFiles() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(URLS_FILE)) {
      fs.writeFileSync(URLS_FILE, '[]', 'utf8');
    }

    if (!fs.existsSync(ANALYTICS_FILE)) {
      fs.writeFileSync(ANALYTICS_FILE, '[]', 'utf8');
    }
  } catch (error) {
    console.warn('Could not initialize data files (likely production environment):', error);
  }
}

// Only initialize in development
if (process.env.NODE_ENV !== 'production') {
  initializeDataFiles();
}

// URL Database Operations
export function getAllUrls(): UrlData[] {
  try {
    // In production, return demo data since file system is read-only
    if (process.env.NODE_ENV === 'production') {
      return [
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
      ];
    }
    
    const data = fs.readFileSync(URLS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading URLs:', error);
    return [];
  }
}

export function saveUrl(urlData: UrlData): UrlData {
  try {
    const urls = getAllUrls();
    urls.push(urlData);
    
    // In production, we'll simulate saving (data won't persist between serverless function calls)
    if (process.env.NODE_ENV === 'production') {
      console.log('Production mode: Simulating URL save', urlData);
      return urlData;
    }
    
    fs.writeFileSync(URLS_FILE, JSON.stringify(urls, null, 2), 'utf8');
    return urlData;
  } catch (error) {
    console.error('Error saving URL:', error);
    // In production, don't throw errors, just log and return
    if (process.env.NODE_ENV === 'production') {
      console.warn('Could not save URL in production environment');
      return urlData;
    }
    throw error;
  }
}

export function findUrlByShortCode(shortCode: string): UrlData | null {
  try {
    const urls = getAllUrls();
    return urls.find(url => url.shortCode === shortCode) || null;
  } catch (error) {
    console.error('Error finding URL:', error);
    return null;
  }
}

// Analytics Database Operations
export function getAllAnalytics(): AnalyticsData[] {
  try {
    // In production, return demo analytics data
    if (process.env.NODE_ENV === 'production') {
      return [
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
      ];
    }
    
    const data = fs.readFileSync(ANALYTICS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading analytics:', error);
    return [];
  }
}

export function saveAnalytics(analyticsData: AnalyticsData): AnalyticsData {
  try {
    const analytics = getAllAnalytics();
    analytics.push(analyticsData);
    
    // In production, we'll simulate saving (data won't persist between serverless function calls)
    if (process.env.NODE_ENV === 'production') {
      console.log('Production mode: Simulating analytics save', analyticsData);
      return analyticsData;
    }
    
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(analytics, null, 2), 'utf8');
    return analyticsData;
  } catch (error) {
    console.error('Error saving analytics:', error);
    // In production, don't throw errors, just log and return
    if (process.env.NODE_ENV === 'production') {
      console.warn('Could not save analytics in production environment');
      return analyticsData;
    }
    throw error;
  }
}

export function getAnalyticsByShortCode(shortCode: string): AnalyticsData[] {
  try {
    const analytics = getAllAnalytics();
    return analytics.filter(item => item.shortCode === shortCode);
  } catch (error) {
    console.error('Error getting analytics:', error);
    return [];
  }
}

export function getAnalyticsByCampaign(campaignId: string): AnalyticsData[] {
  try {
    const analytics = getAllAnalytics();
    return analytics.filter(item => item.campaignId === campaignId);
  } catch (error) {
    console.error('Error getting campaign analytics:', error);
    return [];
  }
} 