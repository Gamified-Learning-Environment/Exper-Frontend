// Achievements component to display all achievements, unlocked achievements and locked achievements
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { GamificationService } from '@/services/gamification.service';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Brain, Star, Flame, Trophy, BookOpen, Target, CheckCircle2, Medal } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Achivements interface
interface Achievement {
    _id: string;
    title: string;
    description: string;
    icon: string;
    requirement: string;
    xp_reward: number;
    achievement_id?: string; // Optional, used when comparing achievements
    condition?: { // Optional, used to check if the achievement is earned, aids with progress
      quizzes_completed?: number;
      perfect_scores?: number;
      streak_days?: number;
      unique_categories?: number;
      level?: number;
      time_under?: number;
      perfect_score?: boolean;
  };
}

// Achievements component
export default function Achievements() {
    const { user } = useAuth(); // Get the user from the auth context
    const [playerStats, setPlayerStats] = useState<any>(null);
    const [achievements, setAchievements] = useState<Achievement[]>([]); // State to store all achievements
    const [userAchievements, setUserAchievements] = useState<Achievement[]>([]); // State to store user's earned achievements
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAchievements = async () => {
            if (!user?._id) return;

            try {
                setIsLoading(true);
                console.log("Fetching achievements for user:", user._id);

                // Get all achievements from gamification service
                const allAchievements = await GamificationService.getAchievements();
                console.log("All achievements:", allAchievements);
                setAchievements(allAchievements);

                // Get user's earned achievements
                const earnedAchievementIds = await GamificationService.getUserAchievements(user._id);
                console.log("User earned achievement IDs:", earnedAchievementIds);
                // Map IDs to full achievement objects
                let earnedAchievements;
                
                // Check if we received full objects or just IDs
                if (earnedAchievementIds.length > 0 && typeof earnedAchievementIds[0] === 'object' && 'title' in earnedAchievementIds[0]) {
                    // We have full objects already
                    earnedAchievements = earnedAchievementIds;
                } else {
                    // Map IDs to full achievement objects
                    earnedAchievements = allAchievements.filter(achievement => 
                        earnedAchievementIds.includes(achievement.achievement_id)
                    );
                }
                
                console.log("Processed user achievements:", earnedAchievements);
                setUserAchievements(earnedAchievements);

                // Get player stats for accurate progress calculation
                const stats = await GamificationService.getPlayerStats(user._id);
                //console.log("Player stats:", stats);
                setPlayerStats(stats);

            } catch (err) {
                console.error("Error fetching achievements:", err);
                setError("Failed to load achievements. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAchievements();
    }, [user?._id]);

    // Helper function to render the appopriate icon
    const getIconForAchievement = (iconName: string) => {
        switch (iconName) {
            case '🏆': return <Trophy className="w-6 h-6 text-yellow-500" />;
            case '⭐': return <Star className="w-6 h-6 text-yellow-500" />;
            case '🎯': return <Target className="w-6 h-6 text-green-500" />;
            case '🔥': return <Flame className="w-6 h-6 text-red-500" />;
            case '🧠': return <Brain className="w-6 h-6 text-purple-500" />;
            case '🥇': return <Medal className="w-6 h-6 text-amber-500" />;
            default: return <Trophy className="w-6 h-6 text-yellow-500" />;
        }
    };

    // Memoize expensive calculations - for performance optimization
    const userAchievementIds = useMemo(() => { 
      const ids = new Set<string>();
      
      if (!userAchievements || userAchievements.length === 0) return ids;
      
      // Handle if userAchievements contains objects
      if (typeof userAchievements[0] === 'object') {
        userAchievements.forEach(a => {
          if (a.achievement_id) ids.add(a.achievement_id);
          if (a._id) ids.add(a._id);
        });
        return ids;
      }
      
      // Handle if userAchievements contains strings (achievement_ids)
      userAchievements.forEach(id => ids.add(id));
      
      // Also add the corresponding _id values from achievements array
      achievements.forEach(a => {
        if (userAchievements.includes(a.achievement_id)) {
          ids.add(a._id);
        }
      });
      
      return ids;
    }, [userAchievements, achievements]);

    // check if an achievement is earned, memoized for performance
    const isAchievementEarned = useCallback((achievementId: string) => { 
      console.log(`Checking if achievement ${achievementId} is earned among:`, 
        userAchievements.map(ua => ({id: ua.achievement_id, _id: ua._id}))
      );
      
      if (!userAchievements || userAchievements.length === 0) return false;

      // Find the achievement by ID
      const achievement = achievements.find(a => 
        a._id === achievementId || a.achievement_id === achievementId
      );
      
      if (!achievement) return false;
      
      // Get the achievement ID we need to check for
      const targetId = achievement.achievement_id || achievement._id;
      
      // Check if this ID exists in user's earned achievements
      return userAchievements.some(ua => {
          if (typeof ua === 'string') {
              // If userAchievements contains string IDs
              return ua === targetId;
          } else {
              // If userAchievements contains objects
              return ua.achievement_id === targetId || ua._id === targetId;
          }
      });
    }, [userAchievements, achievements]);

    useEffect(() => {
      // Add this after setting userAchievements
      if (userAchievements && userAchievements.length > 0) {
        console.log("User achievement format check:", {
          isArray: Array.isArray(userAchievements),
          firstItemType: typeof userAchievements[0],
          sample: userAchievements[0],
          allAchievementsSample: achievements.length > 0 ? achievements[0] : null
        });
        
        // Check for any potential matches
        if (achievements.length > 0) {
          const firstUserAchievement = typeof userAchievements[0] === 'string' 
            ? userAchievements[0]
            : userAchievements[0].achievement_id;
            
          const matchingAchievement = achievements.find(a => a.achievement_id === firstUserAchievement);
          console.log("First achievement match check:", {
            userAchievementId: firstUserAchievement,
            matchFound: !!matchingAchievement,
            matchDetails: matchingAchievement
          });
        }
      }
    }, [userAchievements, achievements]);

    // Memoize progress calculations
    const progressMap = useMemo(() => {
        const map = new Map<string, number>();
        
        if (!user?._id) return map;
        
        for (const achievement of achievements) {
            if (userAchievementIds.has(achievement._id)) {
                map.set(achievement._id, 100);
                continue;
            }
            
            if (!achievement.condition) {
                map.set(achievement._id, 0);
                continue;
            }
            
            // Calculate progress with existing logic
            const { condition } = achievement;
            
            // Get stats once and store
            const streakAchievement = userAchievements.find(a => a?.title?.includes("Streak"));
            const levelAchievement = userAchievements.find(a => a?.title?.includes("Level"));
            
            const stats = playerStats || {
              quizzes_completed: 0,
              perfect_scores: 0,
              streak_days: 0,
              level: 1,
              unique_categories: 0
          };
            
            let progress = 0;
            
            // Your existing progress calculations
            if (condition.quizzes_completed) {
                progress = Math.min(100, Math.round((stats.quizzes_completed / condition.quizzes_completed) * 100));
            } else if (condition.perfect_scores) {
                progress = Math.min(100, Math.round((stats.perfect_scores / condition.perfect_scores) * 100));
            } else if (condition.streak_days) {
                progress = Math.min(100, Math.round((stats.streak_days / condition.streak_days) * 100));
            } else if (condition.unique_categories) {
                progress = Math.min(100, Math.round((stats.unique_categories / condition.unique_categories) * 100));
            } else if (condition.level) {
                progress = Math.min(100, Math.round((stats.level / condition.level) * 100));
            } 
            
            map.set(achievement._id, progress);
        }
        
        return map;
    }, [achievements, userAchievements, user?._id, userAchievementIds]);

    // Function to calculate progress for an achievement based on its conditions and user stats
    const calculateProgress = useCallback((achievement: Achievement): number => {
      return progressMap.get(achievement._id) || 0;
    }, [progressMap]);

    // Loading state while fetching achievements
    if (isLoading) {
        return (
          <div className="flex justify-center py-12">
            <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
          </div>
        );
    }

    if (error) { // If there is an error, display an error message
        return (
          <div className="bg-red-50 border-2 border-red-200 p-6 rounded-xl text-center">
            <p className="text-red-600">{error}</p>
          </div>
        );
    }

    return ( // Display the achievements
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl shadow-md">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏆</span>
                <h2 className="text-xl font-bold text-purple-800">Achievements Gallery</h2>
              </div>
              
              <div className="bg-white/80 px-4 py-2 rounded-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-medium text-purple-900">
                  {userAchievements.length} / {achievements.length} Unlocked
                </span>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Achievements</TabsTrigger>
              <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
              <TabsTrigger value="locked">Locked</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {achievements.map((achievement, index) => {
                  const earned = isAchievementEarned(achievement._id);
                  const progress = !earned ? calculateProgress(achievement) : 100;
                  
                  return (
                    <Card 
                      key={achievement.achievement_id || achievement._id || `all-achievement-${index}`} 
                      className={`p-4 border-2 transition-colors ${
                        earned 
                          ? 'border-yellow-400 bg-yellow-50' 
                          : 'border-gray-200 hover:border-purple-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-3 rounded-xl ${earned ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                          {getIconForAchievement(achievement.icon)}
                        </div>
                        <div>
                          <h3 className={`text-lg font-bold ${earned ? 'text-yellow-700' : 'text-gray-700'}`}>
                            {achievement.title}
                            {earned && <span className="ml-2 text-sm">✓</span>}
                          </h3>
                          <p className="text-gray-600 text-sm">{achievement.description}</p>

                          {/* Progress bar */}
                          {!earned && (
                            <div className="mt-2 mb-1">
                              <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>Progress</span>
                                <span>{progress}%</span>
                              </div>
                              <Progress 
                                value={progress} 
                                className={`h-2 mt-1 ${progress > 0 ? "bg-gradient-to-r from-purple-500 to-indigo-500" : "bg-gray-300"}`}
                              />
                            </div>
                          )}

                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                              +{achievement.xp_reward} XP
                            </span>
                            {!earned && (
                              <span className="text-xs text-gray-500">
                                {achievement.requirement}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="unlocked">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {userAchievements.length > 0 ? (
                  userAchievements.map((achievement, index) => (
                    <Card 
                      key={achievement.achievement_id || achievement._id || `achievement-${index}`} 
                      className="p-4 border-2 border-yellow-400 bg-yellow-50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-3 bg-yellow-100 rounded-xl">
                          {getIconForAchievement(achievement.icon)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-yellow-700">
                            {achievement.title} <span className="ml-1">✓</span>
                          </h3>
                          <p className="text-gray-600 text-sm">{achievement.description}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                              +{achievement.xp_reward} XP
                            </span>
                            
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    <p>No achievements unlocked yet.</p>
                    <p className="text-sm mt-2">Complete challenges and quizzes to earn achievements!</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="locked">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {achievements
                  .filter(achievement => !isAchievementEarned(achievement.achievement_id || achievement._id))
                  .map((achievement, index) => {
                    const progress = calculateProgress(achievement);

                    return (
                      <Card 
                        key={`locked-achievement-${index}`} 
                        className="p-4 border-2 border-gray-200 hover:border-purple-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-3 bg-gray-100 rounded-xl">
                            {getIconForAchievement(achievement.icon)}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-700">{achievement.title}</h3>
                            <p className="text-gray-600 text-sm">{achievement.description}</p>

                            {/* Progress bar */}
                            <div className="mt-2 mb-1">
                              <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>Progress</span>
                                <span>{progress}%</span>
                              </div>
                              <Progress 
                                value={progress} 
                                className={`h-2 mt-1 ${progress > 0 ? "bg-gradient-to-r from-purple-500 to-indigo-500" : "bg-gray-300"}`}
                              />
                            </div>

                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                                +{achievement.xp_reward} XP
                              </span>
                              <span className="text-xs text-gray-500">
                                {achievement.requirement || `Complete ${achievement.description}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
    );




}