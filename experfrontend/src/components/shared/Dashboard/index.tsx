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
        // Get challenges
        const activeChallenges = await GamificationService.getActiveChallenges();
        
        // Get tracked challenges
        const trackedChallenges = await GamificationService.getTrackedChallenges(user._id);
        setSelectedChallenges(trackedChallenges.map(challenge => challenge._id));
        
        // Get achievements
        const userAchievements = await GamificationService.getUserAchievements(user._id);
        setAchievements(userAchievements);
        
        // Combine data
        const enhancedChallenges = activeChallenges.map(challenge => ({
          ...challenge,
          isTracked: trackedChallenges.some(tc => tc._id === challenge._id),
          progress: trackedChallenges.find(tc => tc._id === challenge._id)?.progress || 0
        }));
        
        setChallenges(enhancedChallenges);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user?._id]);

  const toggleChallengeTracking = async (challengeId: string) => {
    if (!user) return;
    
    try {
      const isCurrentlyTracked = selectedChallenges.includes(challengeId);
      
      if (isCurrentlyTracked) {
        await GamificationService.untrackChallenge(user._id, challengeId);
        setSelectedChallenges(prev => prev.filter(id => id !== challengeId));
      } else {
        // Check if max tracked challenges reached (limit to 3)
        if (selectedChallenges.length >= 3) {
          alert("You can only track up to 3 challenges at once. Please untrack one first.");
          return;
        }
        
        await GamificationService.trackChallenge(user._id, challengeId);
        setSelectedChallenges(prev => [...prev, challengeId]);
      }
      
      // Update UI
      setChallenges(challenges.map(challenge => 
        challenge._id === challengeId 
          ? {...challenge, isTracked: !challenge.isTracked}
          : challenge
      ));
    } catch (err) {
      console.error("Error toggling challenge tracking:", err);
    }
  };
  
  const handleCompleteChallenge = async (challengeId: string) => {
    if (!user) return;
    
    try {
      await GamificationService.completeChallenge(user._id, challengeId);
      
      // Update challenges list (remove completed challenge)
      setChallenges(prev => prev.filter(c => c._id !== challengeId));
      setSelectedChallenges(prev => prev.filter(id => id !== challengeId));
      
      // Optionally refresh achievements to show newly earned ones
      const userAchievements = await GamificationService.getUserAchievements(user._id);
      setAchievements(userAchievements);
    } catch (err) {
      console.error("Error completing challenge:", err);
    }
  };
  
  // Group challenges by category
  const categorizedChallenges = challenges.reduce((acc, challenge) => {
    const category = challenge.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(challenge);
    return acc;
  }, {} as Record<string, Challenge[]>);
  
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
        <div className="md:col-span-2">
          <PlayerProfile />
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow border-2 border-purple-100">
          <h2 className="text-xl font-bold text-purple-800 mb-4">Tracked Challenges</h2>
          
          {selectedChallenges.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No challenges tracked yet.</p>
              <p className="text-sm mt-2">Select challenges below to track your progress</p>
            </div>
          ) : (
            <div className="space-y-4">
              {challenges
                .filter(challenge => challenge.isTracked)
                .map(challenge => (
                  <div key={challenge._id} className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-purple-700">{challenge.title}</h3>
                      <button onClick={() => toggleChallengeTracking(challenge._id)} className="text-xs text-gray-500">
                        Untrack
                      </button>
                    </div>
                    
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-purple-600 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(challenge.progress || 0)}%</span>
                      </div>
                      <Progress value={challenge.progress || 0} className="h-2" />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Challenges</TabsTrigger>
          {Object.keys(categorizedChallenges).map(category => (
            <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {challenges.map(challenge => (
              <Card key={challenge._id} className={`p-4 border-2 transition-colors ${
                challenge.isTracked ? 'border-purple-400 bg-purple-50' : 'border-purple-200 hover:border-purple-300'
              }`}>
                <h3 className="text-lg font-bold text-purple-700">{challenge.title}</h3>
                <p className="text-gray-600 text-sm">{challenge.description}</p>
                
                {challenge.category && (
                  <div className="mt-2 mb-2">
                    <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                      {challenge.category}
                    </span>
                  </div>
                )}
                
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm font-medium">Reward: {challenge.reward_xp} XP</span>
                  <div className="flex gap-2">
                    <button 
                      className={`text-xs px-3 py-1 rounded-full ${
                        challenge.isTracked 
                          ? 'bg-purple-200 text-purple-800' 
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      }`}
                      onClick={() => toggleChallengeTracking(challenge._id)}
                    >
                      {challenge.isTracked ? 'Tracking' : 'Track'}
                    </button>
                    <button 
                      className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 flex items-center gap-1"
                      onClick={() => handleCompleteChallenge(challenge._id)}
                    >
                      <CheckCircle2 className="w-3 h-3" /> Complete
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {Object.entries(categorizedChallenges).map(([category, categoryToChallenges]) => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categoryToChallenges.map(challenge => (
                <Card key={challenge._id} className={`p-4 border-2 transition-colors ${
                  challenge.isTracked ? 'border-purple-400 bg-purple-50' : 'border-purple-200 hover:border-purple-300'
                }`}>
                  <h3 className="text-lg font-bold text-purple-700">{challenge.title}</h3>
                  <p className="text-gray-600 text-sm">{challenge.description}</p>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm font-medium">Reward: {challenge.reward_xp} XP</span>
                    <div className="flex gap-2">
                      <button 
                        className={`text-xs px-3 py-1 rounded-full ${
                          challenge.isTracked 
                            ? 'bg-purple-200 text-purple-800' 
                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        }`}
                        onClick={() => toggleChallengeTracking(challenge._id)}
                      >
                        {challenge.isTracked ? 'Tracking' : 'Track'}
                      </button>
                      <button 
                        className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 flex items-center gap-1"
                        onClick={() => handleCompleteChallenge(challenge._id)}
                      >
                        <CheckCircle2 className="w-3 h-3" /> Complete
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
        
        
      </Tabs>
    </div>
  );
}