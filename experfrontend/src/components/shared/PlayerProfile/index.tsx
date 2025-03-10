import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { GamificationService } from '@/services/gamification.service';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Brain, Star, Flame, Trophy, BookOpen } from 'lucide-react';

interface PlayerStats {
  level: number;
  xp: number;
  totalXpRequired: number;
  streakDays: number;
  quizzesCompleted: number;
  quizzesPerfect: number;
  totalAchievements: number;
  categoryProgress: {
    category: string;
    level: number;
    xp: number;
    totalXpRequired: number;
  }[];
}

export default function PlayerProfile() {
  const { user } = useAuth();
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchPlayerStats = async () => {
      if (!user?._id) return;
      
      try {
        setIsLoading(true);
        // Get player stats from gamification service
        const stats = await GamificationService.getPlayerStats(user._id);
        setPlayerStats(stats);
      } catch (err) {
        console.error("Error fetching player stats:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlayerStats();
    // Set up interval to refresh stats every minute (optional)
    const intervalId = setInterval(fetchPlayerStats, 60000);
    
    return () => clearInterval(intervalId);
  }, [user?._id]);
  
  if (isLoading) {
    return <div className="h-48 flex items-center justify-center">Loading profile data...</div>;
  }
  
  if (!playerStats) {
    return (
      <Card className="bg-white border-2 border-purple-100">
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Player profile unavailable</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
            {user?.username?.charAt(0) || user?.email?.charAt(0) || "U"}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user?.username || user?.email || "Player"}</h2>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span className="text-white/90">Level {playerStats.level} Explorer</span>
            </div>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6 space-y-6">
        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-semibold text-purple-800">Level {playerStats.level}</span>
            <span className="font-semibold text-purple-800">Level {playerStats.level + 1}</span>
          </div>
          <Progress 
            value={(playerStats.xp / playerStats.totalXpRequired) * 100}
            className="h-3"
          />
          <div className="flex justify-between text-sm text-purple-600">
            <span>{playerStats.xp} XP</span>
            <span>{playerStats.totalXpRequired} XP</span>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-purple-100 flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <Flame className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Current Streak</div>
              <div className="font-bold text-lg">{playerStats.streakDays} Days</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-purple-100 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <BookOpen className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Quizzes</div>
              <div className="font-bold text-lg">{playerStats.quizzesCompleted}</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-purple-100 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-full">
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Perfect Scores</div>
              <div className="font-bold text-lg">{playerStats.quizzesPerfect}</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-purple-100 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Star className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Achievements</div>
              <div className="font-bold text-lg">{playerStats.totalAchievements}</div>
            </div>
          </div>
        </div>
        
        {/* Category Progress */}
        {playerStats.categoryProgress.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-purple-800">Category Progress</h3>
            <div className="space-y-3">
              {playerStats.categoryProgress.map((category, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{category.category}</span>
                    <span>Level {category.level}</span>
                  </div>
                  <Progress 
                    value={(category.xp / category.totalXpRequired) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}