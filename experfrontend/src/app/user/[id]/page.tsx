// User profile page with tabs for profile, achievements, and category progress
'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth.context';
import PlayerProfile from "@/components/shared/PlayerProfile";
import Achievements from "@/components/shared/Achievements";
import CategoryProgress from "@/components/shared/CategoryProgress";
import Campaigns from "@/components/shared/Campaigns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, ChartLine, User, Sword, Users } from 'lucide-react';


// ProfilePage component
export default function ProfilePage() {
    const { id } = useParams();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("profile");
    const [username, setUsername] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCurrentUser, setIsCurrentUser] = useState(false);

    useEffect(() => {
        async function fetchUserData() {
          if (!id) return;
          
          try {
            setIsLoading(true);
            // Check if this is the current user
            setIsCurrentUser(user?._id === id);
            
            // Fetch username from user service
            const response = await fetch(`http://localhost:8080/api/auth/users/${id}`);
            if (!response.ok) throw new Error('Failed to load user data');
            
            const userData = await response.json();
            setUsername(userData.username || userData.email?.split('@')[0] || 'User');
          } catch (err) {
            console.error("Error fetching user data:", err);
            setError("User not found");
          } finally {
            setIsLoading(false);
          }
        }
        
        fetchUserData();
    }, [id, user]);

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

    if (error) {
        return (
          <div className="container mx-auto px-4 py-8">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
              <h1 className="text-2xl font-bold text-red-700 mb-2">Error</h1>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        );
    }

    // Render user profile page
    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold text-purple-900">
        {isCurrentUser ? "Your Profile" : `${username}'s Profile`}
      </h1>
        
        {/* Tabs for profile, achievements, and category progress */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
                <Sword className="w-4 h-4" /> Campaigns
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

            <TabsContent value="campaigns">
            <Campaigns />
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