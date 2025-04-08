'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NotFound() {
  // Use client-side only rendering to avoid document reference issues
  const [mounted, setMounted] = useState(false);
  
  // Only run after client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Return nothing during SSR to prevent document errors
  if (!mounted) return null;
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-purple-800 mb-4">404 - Page Not Found</h1>
        <p className="text-gray-600 mb-8">The page you are looking for doesn't exist or has been moved.</p>
        <Link 
          href="/"
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}