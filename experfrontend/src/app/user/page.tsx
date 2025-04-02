// User profile page with tabs for profile, achievements, and category progress
'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth.context';

export default function ProfileRedirect() {
  const router = useRouter();
  const { user } = useAuth();
  
  useEffect(() => {
    if (user?._id) {
      router.push(`/user/${user._id}`);
    }
  }, [user, router]);
  
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg text-center">
        <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-purple-800">Redirecting to your profile...</p>
      </div>
    </div>
  );
}