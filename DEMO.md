# Demo Guide

## Test the URL Shortener System

### 1. Create a Short URL

**Example Input:**
- Original URL: `https://amazon.com/dp/B08N5WRWNW`
- Campaign ID: `black-friday-2024`
- Creator ID: `tech-reviewer-123`

**Geo-Routing Rules:**
- IN: `https://amazon.in/dp/B08N5WRWNW`
- UK: `https://amazon.co.uk/dp/B08N5WRWNW`
- DE: `https://amazon.de/dp/B08N5WRWNW`

### 2. Test the Redirect

1. Copy the generated short URL
2. Open it in a new browser window
3. Watch the geo-routing in action based on your location
4. Check that UTM parameters are added to the final URL

### 3. View Analytics

1. Enter the campaign ID: `black-friday-2024`
2. See click statistics, country breakdown, and recent clicks
3. Test from different locations (or use VPN) to see geo-routing

### 4. Expected Features Working

✅ **URL Shortening**: Generates unique 8-character codes
✅ **Geo-Routing**: Routes users based on their country
✅ **Click Tracking**: Records every click with location data
✅ **Campaign Attribution**: Adds UTM parameters to final URLs
✅ **Analytics Dashboard**: Real-time click statistics and geographic data
✅ **JSON Database**: Simple file-based storage for POC

### 5. Test URLs

You can test with these common e-commerce platforms:
- Amazon: Different country domains (.com, .in, .co.uk, .de)
- eBay: Different country sites
- Any product links with regional variations

The system will automatically detect user location using ipapi.co and route them to the appropriate URL while tracking all the analytics data. 