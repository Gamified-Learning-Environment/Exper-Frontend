// src/components/Dashboard/index.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { GamificationService } from '@/services/gamification.service';
import PlayerProfile from '@/components/shared/PlayerProfile';
import { Card } from '@/components/ui/card';

interface Challenge {
  _id: string;
  title: string;
  description: string;
  reward_xp: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;
      
      try {
        const activeChallenges = await GamificationService.getActiveChallenges();
        setChallenges(activeChallenges);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };
    
    fetchData();
  }, [user?._id]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <h2 className="text-2xl font-bold text-purple-800">Active Challenges</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {challenges.map(challenge => (
            <Card key={challenge._id} className="p-4 border-2 border-purple-200 hover:border-purple-400 transition-colors">
              <h3 className="text-lg font-bold text-purple-700">{challenge.title}</h3>
              <p className="text-gray-600">{challenge.description}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm font-medium">Reward: {challenge.reward_xp} XP</span>
                <button 
                  className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200"
                  onClick={() => user && GamificationService.completeChallenge(user._id, challenge._id)}
                >
                  Complete
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      <div>
        <PlayerProfile />
      </div>
    </div>
  );
}