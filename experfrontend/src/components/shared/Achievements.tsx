// Achievements component to display all achievements, unlocked achievements and locked achievements
import { useEffect, useState } from 'react';
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
    dateUnlocked?: string; // Optional, only present if achievement is unlocked
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
    const [achievements, setAchievements] = useState<Achievement[]>([]); // State to store all achievements
    const [userAchievements, setUserAchievements] = useState<Achievement[]>([]); // State to store user's earned achievements
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAchievements = async () => {
            if (!user?._id) return;

            try {
                setIsLoading(true);

                // Get all achievements from gamification service
                const allAchievements = await GamificationService.getAchievements();
                setAchievements(allAchievements);

                // Get user's earned achievements
                const earned = await GamificationService.getUserAchievements(user._id);
                setUserAchievements(earned);

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

    // check if an achievement is earned
    const isAchievementEarned = (achievementId: string) => { 
        return userAchievements.some(a => a.achievement_id === achievementId || a._id === achievementId); // .some returns true if at least one element in the array passes the test
    };

    // Get the date of unlocking for an achievement
    const getUnlockDate = (achievementId: string) => {
        const achievement = userAchievements.find(a => a._id === achievementId);
        return achievement?.dateUnlocked ? new Date(achievement.dateUnlocked).toLocaleDateString() : null;
    };

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

    const calculateProgress = (achievement: Achievement): number => {
      if (!achievement.condition || !user?._id) return 0;
      if (isAchievementEarned(achievement._id)) return 100;
      
      const { condition } = achievement;
      
      // Get the relevant stats
      const stats = {
          quizzes_completed: userAchievements.length,
          perfect_scores: userAchievements.filter(a => a.title.includes("Perfect")).length,
          streak_days: userAchievements.find(a => a.title.includes("Streak"))?.dateUnlocked ? 
              parseInt(userAchievements.find(a => a.title.includes("Streak"))?.description.match(/\d+/)?.[0] || "0") : 0,
          unique_categories: new Set(userAchievements.map(a => a.achievement_id?.split('-')[0])).size,
          level: parseInt(userAchievements.find(a => a.title.includes("Level"))?.description.match(/\d+/)?.[0] || "1"),
      };
      
      // Calculate progress based on condition type
      if (condition.quizzes_completed) {
          return Math.min(100, Math.round((stats.quizzes_completed / condition.quizzes_completed) * 100));
      } else if (condition.perfect_scores) {
          return Math.min(100, Math.round((stats.perfect_scores / condition.perfect_scores) * 100));
      } else if (condition.streak_days) {
          return Math.min(100, Math.round((stats.streak_days / condition.streak_days) * 100));
      } else if (condition.unique_categories) {
          return Math.min(100, Math.round((stats.unique_categories / condition.unique_categories) * 100));
      } else if (condition.level) {
          return Math.min(100, Math.round((stats.level / condition.level) * 100));
      } else if (condition.perfect_score) {
          // Binary condition - either 0% or 100%
          return 0;
      }
      
      return 0;
    };

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
                {achievements.map(achievement => {
                  const earned = isAchievementEarned(achievement._id);
                  const unlockDate = getUnlockDate(achievement._id);
                  
                  return (
                    <Card 
                      key={achievement._id} 
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
                                <span>{calculateProgress(achievement)}%</span>
                              </div>
                              <Progress 
                                value={calculateProgress(achievement)} 
                                className={`h-2 mt-1 ${calculateProgress(achievement) > 0 ? "bg-gradient-to-r from-purple-500 to-indigo-500" : "bg-gray-300"}`}
                              />
                            </div>
                          )}

                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                              +{achievement.xp_reward} XP
                            </span>
                            {unlockDate && (
                              <span className="text-xs text-gray-500">
                                Unlocked: {unlockDate}
                              </span>
                            )}
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
                  userAchievements.map(achievement => (
                    <Card key={achievement._id} className="p-4 border-2 border-yellow-400 bg-yellow-50">
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
                            {achievement.dateUnlocked && (
                              <span className="text-xs text-gray-500">
                                Unlocked: {new Date(achievement.dateUnlocked).toLocaleDateString()}
                              </span>
                            )}
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
                  .filter(achievement => !isAchievementEarned(achievement._id))
                  .map(achievement => {
                    const progress = calculateProgress(achievement);

                    return (
                      <Card key={achievement._id} className="p-4 border-2 border-gray-200 hover:border-purple-200">
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
                                {achievement.requirement}
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