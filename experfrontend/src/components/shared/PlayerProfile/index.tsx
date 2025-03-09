'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { GamificationService } from '@/services/gamification.service';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface PlayerData {
  current_level: number;
  username: string;
  level_progress: number;
  xp: number;
  next_level_xp: number;
  streaks?: { current_streak: number }[];
}

interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface Challenge {
  _id: string;
  title: string;
  description: string;
  reward_xp: number;
}
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function PlayerProfile() {
  const { user } = useAuth();
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!user?._id) return;
      
      setLoading(true);
      try {
        // Fetch player profile data
        const data = await GamificationService.getPlayerProfile(user._id);
        setPlayerData(data);
        
        // Fetch achievements
        const playerAchievements = await GamificationService.getPlayerAchievements(user._id);
        setAchievements(playerAchievements);
        
        // Fetch active challenges
        const activeChallenges = await GamificationService.getActiveChallenges();
        setChallenges(activeChallenges);
      } catch (err) {
        console.error("Error fetching player data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlayerData();
  }, [user?._id]);
  
  if (loading) return <div>Loading profile...</div>;
  if (!playerData) return <div>No profile data found</div>;
  
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-purple-600 text-white rounded-full">
            <span className="text-2xl">Lvl {playerData.current_level}</span>
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-bold">{playerData.username || user?.username}</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Level {playerData.current_level}</span>
                <span>Level {playerData.current_level + 1}</span>
              </div>
              <Progress 
                value={playerData.level_progress} 
                className="h-2 bg-purple-100" 
              />
              <div className="text-sm text-purple-700">
                {Math.round(playerData.xp)} / {Math.round(playerData.next_level_xp)} XP
              </div>
            </div>
          </div>
        </div>
        
        {/* Streak indicator */}
        {playerData.streaks && playerData.streaks.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <div className="bg-orange-500 text-white p-1 rounded-md">
              <span className="text-lg">🔥</span>
            </div>
            <span className="text-sm font-medium">
              {playerData.streaks[0].current_streak} day streak
            </span>
          </div>
        )}
      </Card>
      
      <Tabs defaultValue="achievements">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>
        
        <TabsContent value="achievements" className="mt-4">
          <div className="grid grid-cols-2 gap-3">
            {achievements.map(a => (
              <Badge key={a.id} variant="outline" className="p-2 justify-start">
                <span className="mr-2">{a.icon}</span>
                <div>
                  <div className="font-medium">{a.title}</div>
                  <div className="text-xs text-gray-500">{a.description}</div>
                </div>
              </Badge>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="challenges" className="mt-4">
          <div className="space-y-3">
            {challenges.map(c => (
              <Card key={c._id} className="p-3">
                <h4 className="font-medium">{c.title}</h4>
                <p className="text-sm text-gray-600">{c.description}</p>
                <div className="mt-2 text-xs">
                  Reward: {c.reward_xp} XP
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}