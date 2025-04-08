'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-100 to-purple-100 p-4">
      <div className="text-center max-w-md bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg">
        <h1 className="text-4xl font-extrabold text-purple-900 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-purple-700 mb-6">Page Not Found</h2>
        <p className="text-gray-600 mb-8">Sorry, we couldn't find the page you're looking for.</p>
        <div className="space-y-4">
          <Link 
            href="/" 
            className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Return to Home
          </Link>
          <Link 
            href="/quiz/quizzes" 
            className="block w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Explore Quizzes
          </Link>
        </div>
      </div>
    </div>
  );
}