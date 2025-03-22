'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth.context';
import { GamificationService } from '@/services/gamification.service';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from '@/components/ui/card';
import { Trophy, Star, Brain, BookOpen, Flame, Medal, User, ArrowUpRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

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
  profileImage?: string;
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

  // Navigate to player profile
  const navigateToProfile = (userId: string) => {
    router.push(`/user/${userId}`);
  };

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
        return 0;
    }
  });

  // Get medal for top ranks
  const getMedalForRank = (rank: number) => {
    switch (rank) {
      case 0:
        return { icon: '🥇', color: 'text-yellow-500' };
      case 1:
        return { icon: '🥈', color: 'text-gray-400' };
      case 2:
        return { icon: '🥉', color: 'text-amber-700' };
      default:
        return { icon: null, color: '' };
    }
  };

  // Get label for sorting criteria
  const getSortLabel = (criteria: SortCriteria): string => {
    switch (criteria) {
      case 'level': return 'Level';
      case 'xp': return 'Experience';
      case 'streak': return 'Daily Streak';
      case 'quizzes': return 'Quizzes';
      case 'perfect': return 'Perfect Scores';
      case 'achievements': return 'Achievements';
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Card className="w-full bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-purple-900 flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" /> Global Leaderboard
          </CardTitle>
          <div className="mt-4">
            <Skeleton className="h-10 w-full" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="w-full bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center text-red-900">
            Error Loading Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-red-800">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4 mx-auto block"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
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
                <Medal className="h-4 w-4" /> Achievements
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
            <div className="col-span-1 text-center">
              {sortBy === 'level' || sortBy === 'xp' ? 'Streak' :
               sortBy === 'streak' ? 'Quizzes' :
               sortBy === 'quizzes' ? 'Perfect' :
               sortBy === 'perfect' ? 'Badges' : 'XP'}
            </div>
            <div className="col-span-2 text-center">
              {getSortLabel(sortBy)}
            </div>
            <div className="col-span-1"></div>
          </div>
          
          {/* Player Rows */}
          {sortedPlayers.map((player, index) => {
            const isCurrentUser = user?._id === player._id;
            const medal = getMedalForRank(index);
            
            return (
              <div 
                key={player._id}
                className={`grid grid-cols-12 py-3 items-center rounded-lg transition-colors
                  ${isCurrentUser ? 'bg-purple-100' : 'bg-white hover:bg-purple-50'}`}
              >
                {/* Rank */}
                <div className="col-span-1 flex justify-center">
                  {index < 3 ? (
                    <span className={`text-xl ${medal.color}`}>
                      {medal.icon}
                    </span>
                  ) : (
                    <span className="font-semibold text-gray-600">{index + 1}</span>
                  )}
                </div>
                
                {/* Player Name and Avatar */}
                <div className="col-span-5 md:col-span-4 flex items-center gap-3">
                  <Avatar className={`w-10 h-10 ${index < 3 ? 'ring-2 ring-offset-2 ' + 
                    (index === 0 ? 'ring-yellow-400' : 
                     index === 1 ? 'ring-gray-300' : 
                     'ring-amber-600') : ''}`}
                  >
                    {player.profileImage && <AvatarImage src={player.profileImage} />}
                    <AvatarFallback className={`text-purple-700 ${index < 3 ? 'bg-purple-200' : 'bg-purple-100'}`}>
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
                <div className="col-span-1 text-center">
                  {sortBy === 'level' || sortBy === 'xp' ? player.streakDays :
                   sortBy === 'streak' ? player.quizzesCompleted :
                   sortBy === 'quizzes' ? player.quizzesPerfect :
                   sortBy === 'perfect' ? player.totalAchievements : 
                   player.xp}
                </div>
                
                {/* Primary Stat (what we're sorting by) */}
                <div className="col-span-2 text-center font-bold">
                  <Badge 
                    className={`${index < 3 ? 'bg-gradient-to-r ' + 
                      (index === 0 ? 'from-yellow-400 to-amber-500' : 
                      index === 1 ? 'from-gray-300 to-gray-400' : 
                      'from-amber-600 to-amber-700') : ''}`}
                    variant={index < 3 ? "default" : "outline"}
                  >
                    {sortBy === 'level' ? player.level :
                     sortBy === 'xp' ? player.xp.toLocaleString() :
                     sortBy === 'streak' ? player.streakDays :
                     sortBy === 'quizzes' ? player.quizzesCompleted :
                     sortBy === 'perfect' ? player.quizzesPerfect :
                     player.totalAchievements}
                  </Badge>
                </div>
                
                {/* View Profile Button */}
                <div className="col-span-1 text-right">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="p-1 h-auto"
                    onClick={() => navigateToProfile(player.user_id)}
                    aria-label={`View ${player.username}'s profile`}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
          
          {sortedPlayers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No players available on the leaderboard
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-center text-sm text-gray-500">
        Leaderboard updates daily • Showing top {sortedPlayers.length} players
      </CardFooter>
    </Card>
  );
}