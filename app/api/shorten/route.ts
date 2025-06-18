import { nanoid } from 'nanoid';
import { saveUrl, getAllUrls, UrlData } from '../../../lib/database';
import { NextRequest, NextResponse } from 'next/server';

interface ShortenRequest {
  originalUrl: string;
  campaignId: string;
  creatorId: string;
  routingRules?: Record<string, string>;
  platformRouting?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: ShortenRequest = await request.json();
    const { originalUrl, campaignId, creatorId, routingRules, platformRouting } = body;

    // Validate required fields
    if (!originalUrl || !campaignId || !creatorId) {
      return NextResponse.json(
        { error: 'Missing required fields: originalUrl, campaignId, creatorId' },
        { status: 400 }
      );
    }

    // Generate unique short code
    let shortCode: string = '';
    let isUnique = false;
    const existingUrls = getAllUrls();
    
    while (!isUnique) {
      shortCode = nanoid(8); // Generate 8-character code
      isUnique = !existingUrls.find(url => url.shortCode === shortCode);
    }

    // Create URL data object
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

    // Save to database
    const savedUrl = saveUrl(urlData);

    // Return the short URL
    const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${shortCode}`;

    return NextResponse.json({
      success: true,
      shortUrl,
      shortCode,
      data: savedUrl
    });

  } catch (error) {
    console.error('Error creating short URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 