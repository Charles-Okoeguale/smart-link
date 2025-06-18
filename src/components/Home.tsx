import { useState } from 'react';

interface FormData {
  originalUrl: string;
  campaignId: string;
  creatorId: string;
  routingRules: Record<string, string>;
  platformRouting: boolean;
}



interface ShortenResult {
  success: boolean;
  shortUrl: string;
  shortCode: string;
  data: {
    shortCode: string;
    originalUrl: string;
    campaignId: string;
    creatorId: string;
    routingRules: Record<string, string>;
    platformRouting: boolean;
    createdAt: string;
    clickCount: number;
  };
}

interface AnalyticsSummary {
  totalClicks: number;
  uniqueCountries: number;
  clicksByCountry: Record<string, number>;
  clicksByDate: Record<string, number>;
  clicksByPlatform: Record<string, number>;
  platformCountryBreakdown: Record<string, Record<string, number>>;
}

interface ClickData {
  shortCode: string;
  campaignId: string;
  creatorId: string;
  timestamp: string;
  country: string;
  countryName: string;
  city: string;
  region: string;
  platform: string;
  routingRule: string;
}

interface AnalyticsData {
  analytics: ClickData[];
  summary: AnalyticsSummary;
}



// POC Smart Defaults - Easy testing!
const getDefaultCampaignId = () => `demo-campaign-${new Date().getMonth() + 1}${new Date().getDate()}`;
const getDefaultCreatorId = () => 'poc-creator';
const getDefaultOriginalUrl = () => 'https://example.com/landing';

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    originalUrl: getDefaultOriginalUrl(),
    campaignId: getDefaultCampaignId(),
    creatorId: getDefaultCreatorId(),
    routingRules: {},
    platformRouting: true
  });
  

  
  const [result, setResult] = useState<ShortenResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const routingRules: Record<string, string> = {};
      
      // Platform routing can be added here if needed

      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          routingRules
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data as ShortenResult);
      } else {
        alert('Error: ' + (data as { error: string }).error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create short URL');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/analytics?campaignId=${campaignId}`);
      const data: AnalyticsData = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Campaign URL Shortener - React POC
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            🚀 Generate smart short URLs with auto platform routing & geo-detection
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* URL Shortener Form */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-black">Create Smart Short URL</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Campaign ID *
                </label>
                <input
                  type="text"
                  name="campaignId"
                  value={formData.campaignId}
                  onChange={(e) => setFormData(prev => ({ ...prev, campaignId: e.target.value }))}
                  placeholder="demo-campaign-123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
              >
                {loading ? 'Creating...' : 'Create Short URL'}
              </button>
            </form>

            {result && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="font-semibold text-green-800 mb-2">Success!</h3>
                <p className="text-sm text-gray-700 mb-2">Your short URL:</p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    value={result.shortUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-black"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(result.shortUrl)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 whitespace-nowrap"
                  >
                    Copy URL
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Analytics Panel */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-black">Analytics Dashboard</h2>
            
            <div className="text-center text-gray-500 py-8">
              <p className="text-sm sm:text-base">Analytics will appear here after creating URLs</p>
              <button
                onClick={() => fetchAnalytics('demo-campaign')}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
              >
                Load Demo Analytics
              </button>
            </div>

            {analytics && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-black text-sm sm:text-base">Total Clicks</h3>
                    <p className="text-xl sm:text-2xl font-bold text-black">
                      {analytics.summary.totalClicks}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-black text-sm sm:text-base">Countries</h3>
                    <p className="text-xl sm:text-2xl font-bold text-black">
                      {analytics.summary.uniqueCountries}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 