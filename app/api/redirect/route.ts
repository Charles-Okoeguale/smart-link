import { findUrlByShortCode, saveAnalytics, getAllUrls, AnalyticsData, UrlData, detectPlatform } from '../../../lib/database';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface UserLocation {
  ip: string;
  country: string;
  countryName: string;
  city: string;
  region: string;
}

interface RedirectRequest {
  shortCode: string;
  userLocation: UserLocation;
  userAgent: string;
  timestamp: string;
}

interface RoutingInfo {
  original: string;
  final: string;
  appliedRule: string;
  userCountry: string;
  platform: string;
  routingKey: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RedirectRequest = await request.json();
    const { shortCode, userLocation, userAgent, timestamp } = body;

    // Find the URL data
    const urlData = findUrlByShortCode(shortCode);
    
    if (!urlData) {
      return NextResponse.json(
        { success: false, error: 'Short URL not found' },
        { status: 404 }
      );
    }

    // Detect platform type
    const platform = detectPlatform(userAgent);

    // Apply platform routing logic
    let targetUrl = urlData.originalUrl;
    let appliedRule = 'default';
    let routingKey = '';
    
    if (urlData.platformRouting && urlData.routingRules && Object.keys(urlData.routingRules).length > 0) {
      // Check for platform-specific route
      const platformKey = platform.toUpperCase();
      
      if (urlData.routingRules[platformKey]) {
        targetUrl = urlData.routingRules[platformKey];
        appliedRule = 'platform_routed';
        routingKey = platformKey;
      }
      // Fallback to default route
      else if (urlData.routingRules.DEFAULT) {
        targetUrl = urlData.routingRules.DEFAULT;
        appliedRule = 'default_routed';
        routingKey = 'DEFAULT';
      }
    }

    // Add tracking parameters to the target URL
    const url = new URL(targetUrl);
    url.searchParams.set('utm_campaign', urlData.campaignId);
    url.searchParams.set('utm_source', 'shortlink');
    url.searchParams.set('utm_medium', 'link');
    url.searchParams.set('creator_id', urlData.creatorId);
    url.searchParams.set('click_id', `${shortCode}_${Date.now()}`);
    url.searchParams.set('platform', platform);
    url.searchParams.set('country', userLocation.country);
    
    targetUrl = url.toString();

    // Save analytics data
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
      routingRule: appliedRule,
      platform: platform
    };

    saveAnalytics(analyticsData);

    // Update click count for the URL
    const allUrls = getAllUrls();
    const updatedUrls = allUrls.map((url: UrlData) => {
      if (url.shortCode === shortCode) {
        return { ...url, clickCount: (url.clickCount || 0) + 1 };
      }
      return url;
    });
    
    // Save updated URLs (this is a simple approach for POC)
    // In production, you'd want atomic updates
    fs.writeFileSync(
      path.join(process.cwd(), 'data', 'urls.json'),
      JSON.stringify(updatedUrls, null, 2),
      'utf8'
    );

    const routing: RoutingInfo = {
      original: urlData.originalUrl,
      final: targetUrl,
      appliedRule,
      userCountry: userLocation.country,
      platform,
      routingKey
    };

    return NextResponse.json({
      success: true,
      targetUrl,
      routing
    });

  } catch (error) {
    console.error('Error processing redirect:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 