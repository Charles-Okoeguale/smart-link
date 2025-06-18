# Smart Link Generator - React + Express

A modern campaign URL shortener built with React, TypeScript, Express, and Node.js. Create smart short URLs with automatic platform routing, geo-detection, and comprehensive analytics.

## 🚀 Features

- **Platform Routing**: Automatically route iOS users to App Store, Android users to Google Play, and desktop users to websites
- **Geo-Detection**: Automatic IP-based country detection using ipapi.co
- **Campaign Analytics**: Track clicks by platform, country, dates with real-time dashboard
- **Smart Routing**: Perfect for app promotion campaigns and cross-platform marketing
- **TypeScript**: Full type safety throughout the codebase
- **Vercel Ready**: Optimized for seamless deployment

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router
- **Backend**: Express.js, Node.js, TypeScript
- **Database**: JSON files (for POC/demo purposes)
- **Deployment**: Vercel
- **API**: RESTful endpoints with proper error handling

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd smart-link-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```
   This starts both the React dev server (port 3000) and Express server (port 3001) concurrently.

## 🚀 Deployment to Vercel

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

   Or connect your GitHub repository to Vercel for automatic deployments.

## 📊 API Endpoints

### POST /api/shorten
Create a new short URL with platform routing rules.

**Request Body:**
```json
{
  "originalUrl": "https://example.com/landing",
  "campaignId": "demo-campaign-123",
  "creatorId": "poc-creator",
  "routingRules": {
    "ios": "https://apps.apple.com/app/example",
    "android": "https://play.google.com/store/apps/details?id=com.example",
    "web": "https://example.com/web"
  },
  "platformRouting": true
}
```

### POST /api/redirect
Handle redirect with analytics tracking.

**Request Body:**
```json
{
  "shortCode": "abc123",
  "userLocation": {
    "country": "US",
    "countryName": "United States",
    "city": "New York",
    "region": "NY"
  },
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/analytics?campaignId=demo-campaign
Get analytics data for a campaign.

## 🎯 Use Cases

- **App Promotion**: Route mobile users to app stores, desktop to landing pages
- **Campaign Attribution**: Track performance across platforms and regions
- **A/B Testing**: Route users to different destinations based on platform
- **Geo-targeting**: Automatically detect user location for regional campaigns

## 📁 Project Structure

```
smart-link-generator/
├── api/
│   └── server.ts           # Express server with all API routes
├── src/
│   ├── components/
│   │   ├── Home.tsx        # Main dashboard component
│   │   └── RedirectPage.tsx # URL redirect handler

│   ├── App.tsx             # React app with routing
│   ├── main.tsx            # React entry point
│   └── index.css           # Global styles
├── data/
│   ├── urls.json           # URL mappings storage
│   └── analytics.json      # Analytics data storage
├── public/
│   └── favicon.ico         # App favicon
├── index.html              # HTML template
├── vite.config.ts          # Vite configuration
├── vercel.json             # Vercel deployment config
└── package.json            # Dependencies and scripts
```

## 🔧 Development

- **Frontend Development**: `npm run client:dev` (Vite dev server)
- **Backend Development**: `npm run server:dev` (Express with tsx watch)
- **Full Stack**: `npm run dev` (Both servers concurrently)
- **Type Checking**: `npm run type-check`
- **Build**: `npm run build`

## 🎨 Demo & Testing

The application includes pre-filled demo data for easy testing:

1. **Default Campaign**: `demo-campaign-{month}{day}`
2. **Platform URLs**: Pre-configured App Store, Google Play, and web URLs
3. **Analytics**: Sample click data for testing dashboard functionality

## 🚀 Production Considerations

For production use, consider upgrading from JSON file storage to:

- **Database**: PostgreSQL, MongoDB, or Prisma with Vercel Storage
- **KV Storage**: Vercel KV for simple key-value data
- **External Services**: Dedicated database services for better scalability

## 📄 License

This project is for demonstration purposes. Feel free to modify and use for your own projects.

---

**Built with ❤️ for modern web applications**
