// Dashboard component for displaying user profile, challenges, achievements, etc.
// It fetches data from the GamificationService and displays it in a tabbed interface.

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { GamificationService } from '@/services/gamification.service';
import PlayerProfile from '@/components/shared/PlayerProfile';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Target, Flame, Brain, CheckCircle2 } from 'lucide-react';

interface Challenge {
  _id: string;
  title: string;
  description: string;
  reward_xp: number;
  category?: string;
  deadline?: string;
  progress?: number;
  isTracked?: boolean;
}

interface AchievementData {
  _id: string;
  title: string;
  description: string;
  icon: string;
  dateUnlocked: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [achievements, setAchievements] = useState<AchievementData[]>([]);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;
      
      try {
        setIsLoading(true);
        // Get achievements
        const userAchievements = await GamificationService.getUserAchievements(user._id);
        setAchievements(userAchievements);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user?._id]);
  
  const getIconForAchievement = (iconName: string) => {
    switch (iconName) {
      case '🏆': return <Trophy className="w-6 h-6 text-yellow-500" />;
      case '⭐': return <Star className="w-6 h-6 text-yellow-500" />;
      case '🎯': return <Target className="w-6 h-6 text-green-500" />;
      case '🔥': return <Flame className="w-6 h-6 text-red-500" />;
      case '🧠': return <Brain className="w-6 h-6 text-purple-500" />;
      default: return <Trophy className="w-6 h-6 text-yellow-500" />;
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center py-12">Loading dashboard data...</div>;
  }
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-3">
          <PlayerProfile />
        </div>
      </div>
    </div>
  );
}