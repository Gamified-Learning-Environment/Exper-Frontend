// User profile page with tabs for profile, achievements, and category progress
'use client'

import { useState } from 'react';
import { useAuth } from '@/contexts/auth.context';
import PlayerProfile from "@/components/shared/PlayerProfile";
import Achievements from "@/components/shared/Achievements";
import CategoryProgress from "@/components/shared/CategoryProgress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, ChartLine, User } from 'lucide-react';

// ProfilePage component
export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  if (!user) { // If user is not logged in, show loading spinner
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg text-center">
          <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-800">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Render user profile page
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold text-purple-900">Your Profile</h1>
      
      {/* Tabs for profile, achievements, and category progress */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Achievements
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <ChartLine className="w-4 h-4" /> Category Progress
          </TabsTrigger>
        </TabsList>
        
        {/* Profile, achievements, and category progress content */}
        <TabsContent value="profile" className="space-y-6">
          <PlayerProfile />
        </TabsContent>
        
        <TabsContent value="achievements">
          <Achievements />
        </TabsContent>
        
        <TabsContent value="progress">
          <CategoryProgress />
        </TabsContent>
      </Tabs>
    </div>
  );
}