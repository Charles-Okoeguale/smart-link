'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RedirectPage() {
  const { shortCode } = useParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shortCode) return;

    const handleRedirect = async () => {
      try {
        // Get user's location via IP
        const locationResponse = await fetch('https://ipapi.co/json/');
        const locationData = await locationResponse.json();

        // Send redirect request to our API
        const redirectResponse = await fetch('/api/redirect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shortCode,
            userLocation: {
              ip: locationData.ip || 'unknown',
              country: locationData.country_code || 'unknown',
              countryName: locationData.country_name || 'Unknown',
              city: locationData.city || 'unknown',
              region: locationData.region || 'unknown'
            },
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          })
        });

        const result = await redirectResponse.json();

        if (result.success) {
          // Redirect to the target URL
          window.location.href = result.targetUrl;
        } else {
          setError(result.error || 'Short URL not found');
        }
      } catch (error) {
        console.error('Redirect error:', error);
        setError('Failed to process redirect');
      }
    };

    handleRedirect();
  }, [shortCode]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">URL Not Found</h1>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-4">
            Short code: <code className="bg-gray-100 px-2 py-1 rounded">{shortCode}</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Redirecting...</h1>
        <p className="text-gray-600">
          🌍 Detecting your location and platform...
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Routing you to the best experience for your platform
        </p>
        <p className="text-xs text-gray-400 mt-4">
          Code: <code>{shortCode}</code>
        </p>
      </div>
    </div>
  );
} 