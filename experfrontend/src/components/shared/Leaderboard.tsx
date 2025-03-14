'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth.context';
import { GamificationService } from '@/services/gamification.service';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Trophy, Star, Brain, BookOpen, Flame, Medal } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Define interface for player data in leaderboard
interface LeaderboardPlayer {
  _id: string;
  username: string;
  email: string;
  level: number;
  xp: number;
  streakDays: number;
  quizzesCompleted: number;
  quizzesPerfect: number;
  totalAchievements: number;
}

// Define sorting criteria types
type SortCriteria = 'level' | 'xp' | 'streak' | 'quizzes' | 'perfect' | 'achievements';

export default function Leaderboard() {
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [sortBy, setSortBy] = useState<SortCriteria>('level');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setIsLoading(true);
        // Fetch leaderboard data from your gamification service
        const data = await GamificationService.getLeaderboard();
        setPlayers(data);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("Failed to load leaderboard data");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchLeaderboard();
  }, []);

  // Sort players based on selected criteria
  const sortedPlayers = [...players].sort((a, b) => {
    switch (sortBy) {
      case 'level':
        return b.level - a.level || b.xp - a.xp;
      case 'xp':
        return b.xp - a.xp;
      case 'streak':
        return b.streakDays - a.streakDays;
      case 'quizzes':
        return b.quizzesCompleted - a.quizzesCompleted;
      case 'perfect':
        return b.quizzesPerfect - a.quizzesPerfect;
      case 'achievements':
        return b.totalAchievements - a.totalAchievements;
      default:
        return b.level - a.level;
    }
  });

  // Handle player profile navigation
  const navigateToProfile = (playerId: string) => {
    router.push(`/user/${playerId}`);
  };

  // Get medal color and icon for top 3 ranks
  const getMedalForRank = (rank: number) => {
    switch (rank) {
      case 0:
        return { color: "text-yellow-500", icon: <Trophy className="h-5 w-5" /> };
      case 1:
        return { color: "text-gray-400", icon: <Medal className="h-5 w-5" /> };
      case 2:
        return { color: "text-amber-700", icon: <Medal className="h-5 w-5" /> };
      default:
        return { color: "text-purple-600", icon: null };
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-purple-800">Loading leaderboard...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-10 text-red-600">
            <p>Error: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-purple-900 flex items-center justify-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" /> Global Leaderboard
        </CardTitle>
        
        {/* Sorting tabs */}
        <div className="mt-4">
          <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as SortCriteria)}>
            <TabsList className="grid grid-cols-3 md:grid-cols-6">
              <TabsTrigger value="level" className="flex items-center gap-1">
                <Brain className="h-4 w-4" /> Level
              </TabsTrigger>
              <TabsTrigger value="xp" className="flex items-center gap-1">
                <Star className="h-4 w-4" /> XP
              </TabsTrigger>
              <TabsTrigger value="streak" className="flex items-center gap-1">
                <Flame className="h-4 w-4" /> Streak
              </TabsTrigger>
              <TabsTrigger value="quizzes" className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" /> Quizzes
              </TabsTrigger>
              <TabsTrigger value="perfect" className="flex items-center gap-1">
                <Trophy className="h-4 w-4" /> Perfect
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center gap-1">
                <Medal className="h-4 w-4" /> Badges
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Table Headers */}
          <div className="grid grid-cols-12 text-sm font-medium text-purple-900 py-2 border-b-2 border-purple-200">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-5 md:col-span-4">Player</div>
            <div className="col-span-2 text-center">Level</div>
            <div className="col-span-2 text-center hidden md:block">XP</div>
            <div className="col-span-2 text-center">
              {sortBy === 'level' || sortBy === 'xp' ? 'Streak' :
               sortBy === 'streak' ? 'Quizzes' :
               sortBy === 'quizzes' ? 'Perfect' :
               sortBy === 'perfect' ? 'Badges' : 'XP'}
            </div>
            <div className="col-span-2 text-center">
              {sortBy}
            </div>
          </div>
          
          {/* Player Rows */}
          {sortedPlayers.map((player, index) => {
            const isCurrentUser = user?._id === player._id;
            const medal = getMedalForRank(index);
            
            return (
              <div 
                key={player._id}
                onClick={() => navigateToProfile(player._id)}
                className={`grid grid-cols-12 py-3 items-center rounded-lg transition-colors cursor-pointer
                  ${isCurrentUser ? 'bg-purple-100 hover:bg-purple-200' : 'hover:bg-purple-50'}`}
              >
                {/* Rank */}
                <div className="col-span-1 flex justify-center">
                  {index < 3 ? (
                    <span className={`${medal.color}`}>
                      {medal.icon}
                    </span>
                  ) : (
                    <span className="font-semibold text-gray-600">{index + 1}</span>
                  )}
                </div>
                
                {/* Player Name and Avatar */}
                <div className="col-span-5 md:col-span-4 flex items-center gap-3">
                  <Avatar className="w-8 h-8 bg-purple-200">
                    <AvatarFallback className="text-purple-700">
                      {player.username?.charAt(0) || player.email?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium truncate">
                      {player.username || player.email?.split('@')[0]}
                    </span>
                    {isCurrentUser && (
                      <Badge variant="secondary" className="w-fit text-xs">You</Badge>
                    )}
                  </div>
                </div>
                
                {/* Level */}
                <div className="col-span-2 text-center">
                  <span className="font-bold">{player.level}</span>
                </div>
                
                {/* XP (hidden on mobile) */}
                <div className="col-span-2 text-center hidden md:block">
                  <span>{player.xp.toLocaleString()}</span>
                </div>
                
                {/* Secondary Stat */}
                <div className="col-span-2 text-center">
                  {sortBy === 'level' || sortBy === 'xp' ? player.streakDays :
                   sortBy === 'streak' ? player.quizzesCompleted :
                   sortBy === 'quizzes' ? player.quizzesPerfect :
                   sortBy === 'perfect' ? player.totalAchievements : 
                   player.xp}
                </div>
                
                {/* Primary Stat (what we're sorting by) */}
                <div className="col-span-2 text-center font-bold">
                  {sortBy === 'level' ? player.level :
                   sortBy === 'xp' ? player.xp.toLocaleString() :
                   sortBy === 'streak' ? player.streakDays :
                   sortBy === 'quizzes' ? player.quizzesCompleted :
                   sortBy === 'perfect' ? player.quizzesPerfect :
                   player.totalAchievements}
                </div>
              </div>
            );
          })}
          
          {sortedPlayers.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No leaderboard data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}