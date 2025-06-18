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

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure files exist
if (!fs.existsSync(URLS_FILE)) {
  fs.writeFileSync(URLS_FILE, '[]', 'utf8');
}

if (!fs.existsSync(ANALYTICS_FILE)) {
  fs.writeFileSync(ANALYTICS_FILE, '[]', 'utf8');
}

// URL Database Operations
export function getAllUrls(): UrlData[] {
  try {
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
    fs.writeFileSync(URLS_FILE, JSON.stringify(urls, null, 2), 'utf8');
    return urlData;
  } catch (error) {
    console.error('Error saving URL:', error);
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
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(analytics, null, 2), 'utf8');
    return analyticsData;
  } catch (error) {
    console.error('Error saving analytics:', error);
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