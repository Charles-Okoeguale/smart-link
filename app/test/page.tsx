import Link from 'next/link';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Test Page - Vercel Deployment Working!
        </h1>
        <p className="text-gray-600">
          If you see this, your Next.js app is deployed correctly.
        </p>
        <Link 
          href="/"
          className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Go to Main App
        </Link>
      </div>
    </div>
  );
} 