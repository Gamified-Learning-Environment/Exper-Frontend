'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { GamificationService } from '@/services/gamification.service';
import PlayerProfile from "@/components/shared/PlayerProfile";
import Achievements from "@/components/shared/Achievements";
import CategoryProgress from "@/components/shared/CategoryProgress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, ChartLine, User } from 'lucide-react';

// Define interface for user profile data
interface UserProfile {
  _id: string;
  username: string;
  email: string;
}

export default function UserProfilePage() {
  const { id } = useParams();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    async function fetchUserProfile() {
      if (!id) return;

      try {
        setIsLoading(true);
        // Fetch user profile data
        const userData = await GamificationService.getUserProfile(id as string);
        setUserProfile(userData);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load user profile");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUserProfile();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg text-center">
          <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-800">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
          <h1 className="text-2xl font-bold text-red-700 mb-2">Error</h1>
          <p className="text-red-600">{error || "User profile not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold text-purple-900">
        {userProfile.username || userProfile.email.split('@')[0]}'s Profile
      </h1>
      
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
        
        <TabsContent value="profile" className="space-y-6">
          <PlayerProfile userId={id as string} />
        </TabsContent>
        
        <TabsContent value="achievements">
          <Achievements userId={id as string} />
        </TabsContent>
        
        <TabsContent value="progress">
          <CategoryProgress userId={id as string} />
        </TabsContent>
      </Tabs>
    </div>
  );
}