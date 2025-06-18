// Simple in-memory storage for development, Vercel KV for production
// This removes all file system dependencies

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
  
  if (ua.includes('iphone') || 
      ua.includes('ipad') || 
      ua.includes('ipod') ||
      (ua.includes('macintosh') && ua.includes('mobile'))) {
    return 'ios';
  }
  
  if (ua.includes('android')) {
    return 'android';
  }
  
  return 'web';
}

// Simple in-memory storage for development
const memoryUrls: UrlData[] = [];
const memoryAnalytics: AnalyticsData[] = [];

// Initialize with demo data
if (memoryUrls.length === 0) {
  memoryUrls.push({
    shortCode: 'demo123',
    originalUrl: 'https://example.com/landing',
    campaignId: 'demo-campaign',
    creatorId: 'poc-creator',
    routingRules: {
      IOS: 'https://apps.apple.com/app/example',
      ANDROID: 'https://play.google.com/store/apps/details?id=com.example',
      WEB: 'https://example.com/landing'
    },
    platformRouting: true,
    createdAt: new Date().toISOString(),
    clickCount: 0
  });
}

// URL Database Operations
export function getAllUrls(): UrlData[] {
  return memoryUrls;
}

export function saveUrl(urlData: UrlData): UrlData {
  memoryUrls.push(urlData);
  return urlData;
}

export function findUrlByShortCode(shortCode: string): UrlData | null {
  return memoryUrls.find(url => url.shortCode === shortCode) || null;
}

export function updateUrlClickCount(shortCode: string): void {
  const url = memoryUrls.find(url => url.shortCode === shortCode);
  if (url) {
    url.clickCount++;
  }
}

// Analytics Database Operations
export function getAllAnalytics(): AnalyticsData[] {
  return memoryAnalytics;
}

export function saveAnalytics(analyticsData: AnalyticsData): AnalyticsData {
  memoryAnalytics.push(analyticsData);
  return analyticsData;
}

export function getAnalyticsByShortCode(shortCode: string): AnalyticsData[] {
  return memoryAnalytics.filter(item => item.shortCode === shortCode);
}

export function getAnalyticsByCampaign(campaignId: string): AnalyticsData[] {
  return memoryAnalytics.filter(item => item.campaignId === campaignId);
} 