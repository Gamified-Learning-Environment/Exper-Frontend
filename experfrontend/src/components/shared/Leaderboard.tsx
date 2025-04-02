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
  user_id: string;
  username: string;
  email: string;
  level: number;
  xp: number;
  streakDays: number;
  quizzesCompleted: number;
  quizzesPerfect: number;
  totalAchievements: number;
  profileImage?: string;
  imageUrl?: string;
}

// Define sorting criteria types
type SortCriteria = 'level' | 'xp' | 'streak' | 'quizzes' | 'perfect' | 'achievements';

export default function Leaderboard() {
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [sortBy, setSortBy] = useState<SortCriteria>('level');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userImages, setUserImages] = useState<Record<string, string>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({}); 
  const { user } = useAuth();
  const router = useRouter();

  // Handle image load errors
  const handleImageError = (playerId: string) => {
    console.log(`Image error for player ${playerId}`);
    setImageErrors(prev => ({
      ...prev,
      [playerId]: true
    }));

    // When an image fails to load, try to fetch user info if we haven't already
    if (!userImages[playerId]) {
      fetchUserImage(playerId);
    }
  };

  // Fetch user image from auth service
  const fetchUserImage = async (userId: string) => {
    try {
      console.log(`Fetching user image for ${userId}`);
      const response = await fetch(`http://localhost:8080/api/auth/users/${userId}`);
      if (response.ok) {
        const userData = await response.json();
        if (userData.imageUrl) {
          console.log(`Found image URL for ${userId}:`, userData.imageUrl);
          setUserImages(prev => ({
            ...prev,
            [userId]: userData.imageUrl
          }));
          // Reset error state to try loading the new image
          setImageErrors(prev => ({
            ...prev,
            [userId]: false
          }));
        }
      }
    } catch (error) {
      console.error(`Error fetching user image for ${userId}:`, error);
    }
  };


  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setIsLoading(true);
        // Fetch leaderboard data from your gamification service
        const data = await GamificationService.getLeaderboard();
        // Map the data to match the LeaderboardPlayer interface
        const mappedData = data.map((player: any) => ({
          _id: player._id,
          user_id: typeof player.user_id === 'function' ? '' : player.user_id,
          username: player.username,
          email: player.email,
          level: player.level,
          xp: player.xp,
          streakDays: player.streakDays,
          quizzesCompleted: player.quizzesCompleted,
          quizzesPerfect: player.quizzesPerfect,
          totalAchievements: player.totalAchievements,
          profileImage: player.profileImage,
          imageUrl: player.imageUrl
        }));
        setPlayers(mappedData);


        // Pre-fetch user images for players without profile images
        const playersWithoutImages = data.filter(p => !p.profileImage && !p.imageUrl);
        console.log(`Found ${playersWithoutImages.length} players without images`);
        
        // Limit concurrent fetches to avoid overloading the server
        const fetchPromises = playersWithoutImages.slice(0, 10).map(player => {
          const userId = typeof player.user_id === 'function' ? '' : player.user_id;
          if (userId && typeof userId === 'string') {
            return fetchUserImage(userId);
          }
          return Promise.resolve(); // Return resolved promise for non-string values
        });
        await Promise.allSettled(fetchPromises);

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
        
        {/* Sorting tabs with pastel colors */}
        <div className="mt-4">
          <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as SortCriteria)}>
            <TabsList className="grid grid-cols-3 md:grid-cols-6 bg-white/70">
              <TabsTrigger value="level" className="flex items-center gap-1 data-[state=active]:bg-blue-100">
                <Brain className="h-4 w-4 text-blue-500" /> Level
              </TabsTrigger>
              <TabsTrigger value="xp" className="flex items-center gap-1 data-[state=active]:bg-green-100">
                <Star className="h-4 w-4 text-green-500" /> XP
              </TabsTrigger>
              <TabsTrigger value="streak" className="flex items-center gap-1 data-[state=active]:bg-orange-100">
                <Flame className="h-4 w-4 text-orange-500" /> Streak
              </TabsTrigger>
              <TabsTrigger value="quizzes" className="flex items-center gap-1 data-[state=active]:bg-indigo-100">
                <BookOpen className="h-4 w-4 text-indigo-500" /> Quizzes
              </TabsTrigger>
              <TabsTrigger value="perfect" className="flex items-center gap-1 data-[state=active]:bg-yellow-100">
                <Trophy className="h-4 w-4 text-yellow-500" /> Perfect
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center gap-1 data-[state=active]:bg-purple-100">
                <Medal className="h-4 w-4 text-purple-500" /> Achievements
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Table Headers with pastel background */}
          <div className="grid grid-cols-12 text-sm font-medium text-purple-900 py-3 border-b-2 border-purple-200 rounded-t-lg bg-gradient-to-r from-purple-100 to-indigo-100">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-5 md:col-span-4 pl-2">Player</div>
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
          
          {/* Player Rows with alternating pastel backgrounds */}
          {sortedPlayers.map((player, index) => {
            const isCurrentUser = user?._id === player._id;
            const medal = getMedalForRank(index);

            // Get player image URL - try all available sources
            const playerImageUrl = !imageErrors[player._id] && (
              player.profileImage || 
              player.imageUrl || 
              userImages[player.user_id]
            );
            
            // Get pastel colors based on category or rank
            const getRowColor = () => {
              if (isCurrentUser) return "bg-purple-100 border-purple-200 border-2";
              
              if (index % 2 === 0) {
                return "bg-white";
              } else {
                // Alternate pastel backgrounds based on sort category
                switch(sortBy) {
                  case 'level': return "bg-blue-50";
                  case 'xp': return "bg-green-50";
                  case 'streak': return "bg-orange-50";
                  case 'quizzes': return "bg-indigo-50";
                  case 'perfect': return "bg-yellow-50";
                  case 'achievements': return "bg-purple-50";
                  default: return "bg-gray-50";
                }
              }
            };

            // Get special styling for top 3 players
            const getTopPlayerStyle = () => {
              if (index === 0) return "shadow-xl bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 border";
              if (index === 1) return "shadow-md bg-gradient-to-r from-slate-50 to-gray-50 border-gray-200 border";
              if (index === 2) return "shadow-sm bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 border";
              return "";
            };
            
            return (
              <div 
                key={player._id}
                className={`grid grid-cols-12 py-3 items-center rounded-lg transition-colors
                  ${getRowColor()}
                  ${index < 3 ? getTopPlayerStyle() : ""}
                  hover:scale-[1.01] hover:shadow-md transition-all duration-200`}
              >
                {/* Rank with colorful badges for top players */}
                <div className="col-span-1 flex justify-center">
                  {index < 3 ? (
                    <span className={`flex items-center justify-center h-8 w-8 rounded-full ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-300 to-amber-400 text-yellow-800' : 
                      index === 1 ? 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700' : 
                      'bg-gradient-to-r from-amber-500 to-orange-500 text-amber-900'
                    } text-xl font-bold shadow-sm`}>
                      {medal.icon}
                    </span>
                  ) : (
                    <span className="font-semibold text-gray-600">{index + 1}</span>
                  )}
                </div>
                
                {/* Player Name and Avatar */}
                <div className="col-span-5 md:col-span-4 flex items-center gap-3">
                  <Avatar className={`w-10 h-10 ${index < 3 ? 'ring-2 ring-offset-2 ' + 
                    (index === 0 ? 'ring-yellow-400 shadow-yellow-200/30' : 
                    index === 1 ? 'ring-gray-300' : 
                    'ring-amber-600') : ''}`}
                  >
                    {playerImageUrl ? (
                      <AvatarImage 
                        src={playerImageUrl}
                        onError={() => handleImageError(player._id)}
                        alt={`${player.username || 'User'}'s avatar`}
                      />
                    ) : (
                      <AvatarFallback className={`text-purple-700 ${index < 3 ? 'bg-purple-200' : 'bg-purple-100'}`}>
                        {player.username?.charAt(0) || player.email?.charAt(0) || "?"}
                      </AvatarFallback>
                    )}
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
                  <span className="font-bold text-blue-700">{player.level}</span>
                </div>
                
                {/* XP (hidden on mobile) */}
                <div className="col-span-2 text-center hidden md:block">
                  <span className="text-green-700">{player.xp.toLocaleString()}</span>
                </div>
                
                {/* Secondary Stat */}
                <div className="col-span-1 text-center">
                  <span className={
                    sortBy === 'streak' ? 'text-orange-600' :
                    sortBy === 'quizzes' ? 'text-indigo-600' :
                    sortBy === 'perfect' ? 'text-yellow-600' :
                    'text-purple-600'
                  }>
                    {sortBy === 'level' || sortBy === 'xp' ? player.streakDays :
                    sortBy === 'streak' ? player.quizzesCompleted :
                    sortBy === 'quizzes' ? player.quizzesPerfect :
                    sortBy === 'perfect' ? player.totalAchievements : 
                    player.xp}
                  </span>
                </div>
                
                {/* Primary Stat (what we're sorting by) with enhanced badges */}
                <div className="col-span-2 text-center font-bold">
                  <Badge 
                    className={`${index < 3 ? 'bg-gradient-to-r shadow-sm ' + 
                      (index === 0 ? 'from-yellow-400 to-amber-500' : 
                      index === 1 ? 'from-gray-300 to-gray-400' : 
                      'from-amber-600 to-amber-700') : 
                      sortBy === 'level' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                      sortBy === 'xp' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                      sortBy === 'streak' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' : 
                      sortBy === 'quizzes' ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200' :
                      sortBy === 'perfect' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                      'bg-purple-100 text-purple-800 hover:bg-purple-200'
                    }`}
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
                <div className="col-span-12 flex items-center justify-end pr-2">
                  <Button 
                    variant="outline"
                    className={`rounded-full p-3 transition-all hover:scale-110 hover:shadow-md ${
                      index < 3 
                        ? `bg-white border-2 ${
                            index === 0 ? 'border-yellow-400 text-yellow-600' : 
                            index === 1 ? 'border-gray-300 text-gray-500' : 
                            'border-amber-500 text-amber-600'
                          }` 
                        : 'bg-white/80 border border-purple-200 text-purple-600 hover:bg-purple-50'
                    }`}
                    onClick={() => navigateToProfile(player.user_id)}
                    aria-label={`View ${player.username}'s profile`}
                  >
                    <ArrowUpRight className="h-6 w-6" />
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
      
      <CardFooter className="flex justify-center text-sm text-gray-500 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 rounded-b-lg border-t border-purple-100 py-3">
        Leaderboard updates daily • Showing top {sortedPlayers.length} players
      </CardFooter>
    </Card>
  );
}