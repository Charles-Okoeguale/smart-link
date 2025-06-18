import { getAllAnalytics, getAnalyticsByCampaign, getAnalyticsByShortCode, AnalyticsData } from '../../../lib/database';
import { NextRequest, NextResponse } from 'next/server';

interface AnalyticsSummary {
  totalClicks: number;
  uniqueCountries: number;
  clicksByCountry: Record<string, number>;
  clicksByDate: Record<string, number>;
  clicksByPlatform: Record<string, number>;
  platformCountryBreakdown: Record<string, Record<string, number>>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    const shortCode = searchParams.get('shortCode');

    let analytics: AnalyticsData[];

    if (campaignId) {
      analytics = getAnalyticsByCampaign(campaignId);
    } else if (shortCode) {
      analytics = getAnalyticsByShortCode(shortCode);
    } else {
      analytics = getAllAnalytics();
    }

    // Calculate summary statistics
    const totalClicks = analytics.length;
    const uniqueCountries = [...new Set(analytics.map(item => item.country))].length;
    
    const clicksByCountry = analytics.reduce((acc: Record<string, number>, item) => {
      acc[item.country] = (acc[item.country] || 0) + 1;
      return acc;
    }, {});

    const clicksByDate = analytics.reduce((acc: Record<string, number>, item) => {
      const date = item.timestamp.split('T')[0]; // Get date part only
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Changed: Platform analytics instead of device
    const clicksByPlatform = analytics.reduce((acc: Record<string, number>, item) => {
      const platform = item.platform || 'unknown';
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {});

    // Changed: Platform + Country breakdown
    const platformCountryBreakdown = analytics.reduce((acc: Record<string, Record<string, number>>, item) => {
      const platform = item.platform || 'unknown';
      const country = item.country || 'unknown';
      
      if (!acc[platform]) acc[platform] = {};
      acc[platform][country] = (acc[platform][country] || 0) + 1;
      return acc;
    }, {});

    const summary: AnalyticsSummary = {
      totalClicks,
      uniqueCountries,
      clicksByCountry,
      clicksByDate,
      clicksByPlatform,
      platformCountryBreakdown
    };

    return NextResponse.json({
      success: true,
      analytics,
      summary
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 