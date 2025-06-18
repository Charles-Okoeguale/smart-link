'use client';

import { useState, useEffect } from 'react';

interface FormData {
  originalUrl: string;
  campaignId: string;
  creatorId: string;
  routingRules: Record<string, string>;
  platformRouting: boolean;
}

interface PlatformRule {
  platform: string;
  url: string;
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

const PLATFORMS = [
  { id: 'ios', name: 'Apple', icon: '🍎' },
  { id: 'android', name: 'Play Store', icon: '🤖' },
  { id: 'web', name: 'Web', icon: '🌐' }
];

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
    platformRouting: true // Enable by default for POC
  });
  
  const [platformRules, setPlatformRules] = useState<PlatformRule[]>([
    { platform: 'ios', url: 'https://apps.apple.com/app/example' },
    { platform: 'android', url: 'https://play.google.com/store/apps/details?id=com.example' },
    { platform: 'web', url: 'https://example.com/web' }
  ]); // Pre-filled platform rules for POC
  
  const [result, setResult] = useState<ShortenResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  // Auto-update original URL when first platform rule changes
  useEffect(() => {
    if (platformRules.length > 0 && platformRules[0].url && formData.platformRouting) {
      setFormData(prev => ({
        ...prev,
        originalUrl: platformRules[0].url || getDefaultOriginalUrl()
      }));
    }
  }, [platformRules, formData.platformRouting]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePlatformRuleChange = (index: number, field: keyof PlatformRule, value: string) => {
    const newRules = [...platformRules];
    newRules[index][field] = value;
    setPlatformRules(newRules);
  };

  const addPlatformRule = () => {
    setPlatformRules(prev => [...prev, { platform: 'android', url: '' }]);
  };

  const removePlatformRule = (index: number) => {
    if (platformRules.length > 1) {
      setPlatformRules(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      // Build routing rules from platform rules
      const routingRules: Record<string, string> = {};
      
      if (formData.platformRouting) {
        platformRules.forEach(rule => {
          if (rule.platform && rule.url) {
            // Platform routing: "IOS", "ANDROID", "WEB"
            routingRules[rule.platform.toUpperCase()] = rule.url;
          }
        });
      }

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
    <div className="min-h-screen bg-gray-50 py-12">
      <style jsx global>{`
        input::placeholder,
        textarea::placeholder {
          color: #9CA3AF !important;
          opacity: 1;
        }
        select {
          color: black !important;
        }
        select option {
          color: black !important;
        }
      `}</style>
      
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Campaign URL Shortener - POC
          </h1>
          <p className="text-lg text-gray-600">
            Quick demo: Platform routing with auto geo-detection
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* URL Generator Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6 text-black">Create Short URL</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* POC Notice */}
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  🚀 <strong>POC Mode:</strong> Default values are pre-filled for quick testing!
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Original URL (Fallback) *
                </label>
                <input
                  type="url"
                  name="originalUrl"
                  value={formData.originalUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/landing"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Auto-filled from first platform rule</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campaign ID *
                  </label>
                  <input
                    type="text"
                    name="campaignId"
                    value={formData.campaignId}
                    onChange={handleInputChange}
                    placeholder={getDefaultCampaignId()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Creator ID *
                  </label>
                  <input
                    type="text"
                    name="creatorId"
                    value={formData.creatorId}
                    onChange={handleInputChange}
                    placeholder={getDefaultCreatorId()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    required
                  />
                </div>
              </div>

              {/* Auto Geo-Detection Info */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-800 mb-1">🌍 Auto Geo-Detection</h3>
                <p className="text-xs text-green-600">
                  User location is automatically detected via IP address. No manual setup required!
                </p>
              </div>

              {/* Platform Routing - Always Enabled for POC */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="platformRouting"
                    checked={formData.platformRouting}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-blue-800">
                    Platform Routing Enabled 🍎🤖🌐
                  </span>
                </label>
                <p className="text-xs text-blue-600 mt-1">
                  Route users to different URLs based on their platform (iOS → App Store, Android → Play Store, Web → Website)
                </p>
              </div>

              {formData.platformRouting && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform-Specific URLs
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Pre-filled with example URLs - edit as needed for testing
                  </p>
                  
                  {platformRules.map((rule, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <select
                        value={rule.platform}
                        onChange={(e) => handlePlatformRuleChange(index, 'platform', e.target.value)}
                        className="w-36 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      >
                        {PLATFORMS.map(platform => (
                          <option key={platform.id} value={platform.id}>
                            {platform.icon} {platform.name}
                          </option>
                        ))}
                      </select>
                      
                      <input
                        type="url"
                        placeholder={
                          rule.platform === 'ios' 
                            ? "https://apps.apple.com/app/your-app" 
                            : rule.platform === 'android'
                            ? "https://play.google.com/store/apps/details?id=your.app"
                            : "https://yourwebsite.com/landing"
                        }
                        value={rule.url}
                        onChange={(e) => handlePlatformRuleChange(index, 'url', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      />
                      <button
                        type="button"
                        onClick={() => removePlatformRule(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addPlatformRule}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Platform Rule
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Short URL'}
              </button>
            </form>

            {result && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="font-semibold text-green-800 mb-2">Success!</h3>
                <p className="text-sm text-gray-700 mb-2">Your short URL:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={result.shortUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-black"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(result.shortUrl)}
                    className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  >
                    Copy
                  </button>
                </div>
                <div className="mt-3 text-xs text-gray-600">
                  <p>💡 <strong>Test tip:</strong> Open this link on different devices to see platform routing!</p>
                </div>
                <button
                  onClick={() => fetchAnalytics(formData.campaignId)}
                  className="mt-3 text-blue-600 hover:text-blue-800 text-sm"
                >
                  View Analytics →
                </button>
              </div>
            )}
          </div>

          {/* Analytics Panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6 text-black">Analytics Dashboard</h2>
            
            {!analytics ? (
              <div className="text-center text-gray-500 py-8">
                <p>Create a short URL or enter a campaign ID to view analytics</p>
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Enter Campaign ID"
                    defaultValue={getDefaultCampaignId()}
                    className="px-3 py-2 border border-gray-300 rounded-md mr-2 text-black"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                        fetchAnalytics((e.target as HTMLInputElement).value);
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement;
                      if (input && input.value) fetchAnalytics(input.value);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Load
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-black">Total Clicks</h3>
                    <p className="text-2xl font-bold text-black">
                      {analytics.summary.totalClicks}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-black">Countries</h3>
                    <p className="text-2xl font-bold text-black">
                      {analytics.summary.uniqueCountries}
                    </p>
                  </div>
                </div>

                {/* Platform Analytics */}
                <div>
                  <h3 className="font-semibold mb-2 text-black">Clicks by Platform</h3>
                  <div className="space-y-1">
                    {Object.entries(analytics.summary.clicksByPlatform).map(([platform, count]) => (
                      <div key={platform} className="flex justify-between text-sm text-black">
                        <span>
                          {platform === 'ios' ? '🍎' : platform === 'android' ? '🤖' : platform === 'web' ? '🌐' : '❓'} {platform}
                        </span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-black">Clicks by Country</h3>
                  <div className="space-y-1">
                    {Object.entries(analytics.summary.clicksByCountry).map(([country, count]) => (
                      <div key={country} className="flex justify-between text-sm text-black">
                        <span>{country || 'Unknown'}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-black">Recent Clicks</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {analytics.analytics.slice(-5).reverse().map((click: ClickData, index: number) => (
                      <div key={index} className="text-xs bg-gray-50 p-2 rounded text-black">
                        <div className="flex justify-between">
                          <span>{click.countryName || click.country}</span>
                          <span>
                            {click.platform === 'ios' ? '🍎' : click.platform === 'android' ? '🤖' : click.platform === 'web' ? '🌐' : '❓'}
                            {new Date(click.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-black opacity-70 truncate">
                          {click.city && `${click.city}, `}{click.region} • {click.routingRule}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* POC Testing Guide */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-black">🧪 POC Testing Guide</h2>
          <div className="space-y-3 text-sm text-black">
            <div>
              <strong>🌍 Auto Geo-Detection:</strong> User's country is automatically detected from their IP address
            </div>
            <div>
              <strong>📱 Platform Routing:</strong> Automatically route users based on their platform:
              <ul className="ml-4 mt-1">
                <li>• 🍎 iOS users → App Store links</li>
                <li>• 🤖 Android users → Google Play Store links</li>
                <li>• 🌐 Desktop/Web users → Website links</li>
              </ul>
            </div>
            <div>
              <strong>🚀 Quick Test:</strong> 
              <ol className="ml-4 mt-1">
                <li>1. Click "Create Short URL" with pre-filled values</li>
                <li>2. Copy the short URL and test on different devices</li>
                <li>3. Check analytics to see platform detection working</li>
              </ol>
            </div>
            <div>
              <strong>📊 Analytics:</strong> Track clicks, countries, platforms, and user behavior for each campaign
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 