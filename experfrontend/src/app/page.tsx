'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Target, Flame, Brain } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { GamificationService } from '@/services/gamification.service';
import CategoryProgress from '@/components/shared/CategoryProgress';
import Dashboard from "@/components/shared/Dashboard";
import Achievements from "@/components/shared/Achievements";
import Leaderboard from "@/components/shared/Leaderboard";

export default function Home() {
  const { user } = useAuth();
  const [playerStats, setPlayerStats] = useState<any>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [trackedChallenges, setTrackedChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  console.log("User Service URL:", process.env.NEXT_PUBLIC_USER_SERVICE_URL);

  useEffect(() => {
    const fetchGamificationData = async () => {
      if (!user?._id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get player stats (level, xp, streak)
        const stats = await GamificationService.getPlayerStats(user._id);
        setPlayerStats(stats);
      
      } catch (err) {
        console.error("Error fetching gamification data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGamificationData();
  }, [user?._id]);
  // Calculate the streak values
  const currentStreak = playerStats?.streakDays || 0;
  const nextMilestone = Math.ceil(currentStreak / 7) * 7;
  const streakProgress = ((currentStreak % 7) / 7) * 100;
  const daysToMilestone = nextMilestone - currentStreak;
  
  // Calculate level progress
  const level = playerStats?.level || 1;
  const currentXP = playerStats?.xp || 0;
  const requiredXP = playerStats?.totalXpRequired || 500;
  const levelProgress = Math.round((currentXP / requiredXP) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-purple-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="flex flex-col justify-center space-y-6">
              <h1 className="text-4xl font-extrabold text-white md:text-5xl">
                Learn & Play,
                <span className="block text-yellow-300">Level Up Every Day!</span>
              </h1>
              <p className="text-lg text-white/90 md:text-xl">
                Turn your study notes into exciting quizzes. Earn points, unlock achievements, and make learning fun!
              </p>
              <div className="flex gap-4">
                <a
                  href="/quiz/create"
                  className="transform rounded-full bg-yellow-400 px-8 py-4 text-lg font-bold text-purple-900 shadow-lg transition hover:scale-105 hover:bg-yellow-300"
                >
                  Create Quiz 🎮
                </a>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <img
                src="/assets/images/learning.png"
                alt="Learning"
                className="w-full max-w-md transform rounded-2xl shadow-2xl transition hover:rotate-2"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Gamification Preview Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            
            {/* Current Streak Card */}
            <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <Flame className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-700">Current Streak</h3>
                  <p className="text-sm text-red-600">
                    {loading ? "Loading..." : `${currentStreak} Days! 🔥`}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
              <Progress 
                  value={loading ? 0 : streakProgress} 
                  className="h-2 mb-2" 
                />
                <p className="text-sm text-red-600">
                  {loading 
                    ? "Loading streak data..." 
                    : daysToMilestone > 0
                      ? `${daysToMilestone} days until next reward!`
                      : "You've hit a streak milestone! Claim your reward!"}
                </p>
              </CardContent>
            </Card>

            {/* Level Progress Card */}
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Brain className="w-8 h-8 text-purple-500" />
                </div>
                <div>
                <h3 className="text-xl font-bold text-purple-700">
                    {loading ? "Level" : `Level ${level}`}
                  </h3>
                  <p className="text-sm text-purple-600">
                    {loading ? "Loading..." : `${currentXP} / ${requiredXP} XP`}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
              <Progress 
                  value={loading ? 0 : levelProgress} 
                  className="h-2 mb-2" 
                />
                <p className="text-sm text-purple-600">
                  {loading 
                    ? "Loading level data..." 
                    : levelProgress >= 90
                      ? `Almost at Level ${level + 1}!`
                      : `${requiredXP - currentXP} XP needed for Level ${level + 1}`}
                </p>
              </CardContent>
            </Card>
          </div>

          <div>
            <Dashboard />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <CategoryProgress />
          </div>

          <div>
            <Leaderboard />
          </div>

          {/* Recent Achievements Preview */}
          <div className="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-purple-900 mb-6">Recent Achievements 🏆</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {[
                { icon: Trophy, label: "Quiz Master", color: "bg-yellow-500" },
                { icon: Flame, label: "Week Streak", color: "bg-red-500" },
                { icon: Target, label: "Perfect Score", color: "bg-green-500" },
                { icon: Star, label: "Rising Star", color: "bg-blue-500" },
              ].map((achievement, index) => (
                <div key={index} className="flex flex-col items-center gap-2 min-w-[100px]">
                  <div className={`p-4 rounded-full ${achievement.color}`}>
                    <achievement.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{achievement.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="py-12">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-purple-900 mb-6">My Achievements</h1>
            <Achievements />
        </div>
      </section>

      {/* Quiz Carousel Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-3xl font-bold text-purple-900">
            Popular Quizzes 🌟
          </h2>
          <div className="flex overflow-x-auto pb-8 pt-4 scrollbar-hide">
            <div className="flex gap-6">
              {/* Example Quiz Tiles */}
              <QuizTile
                title="Programming Basics"
                difficulty="Easy"
                questions={10}
                color="bg-green-400"
              />
              <QuizTile
                title="Data Structures"
                difficulty="Medium"
                questions={15}
                color="bg-yellow-400"
              />
              <QuizTile
                title="Algorithms"
                difficulty="Hard"
                questions={20}
                color="bg-red-400"
              />
              <QuizTile
                title="Mathematics"
                difficulty="Easy"
                questions={10}
                color="bg-blue-400"
              />
              <QuizTile
                title="Physics"
                difficulty="Medium"
                questions={15}
                color="bg-purple-400"
              />
              <QuizTile
                title="Chemistry"
                difficulty="Hard"
                questions={20}
                color="bg-pink-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-3xl font-bold text-purple-900">
            Explore Topics 🚀
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            <CategoryTile title="Computer Science" icon="💻" color="bg-blue-400" />
            <CategoryTile title="Mathematics" icon="🔢" color="bg-green-400" />
            <CategoryTile title="Physics" icon="⚡" color="bg-yellow-400" />
            <CategoryTile title="Chemistry" icon="🧪" color="bg-pink-400" />
          </div>
        </div>
      </section>
    </div>
  );
}

// Quiz Tile Component
function QuizTile({ title, difficulty, questions, color }: {
  title: string;
  difficulty: string;
  questions: number;
  color: string;
}) {
  return (
    <div className={`${color} flex min-w-[280px] flex-col rounded-2xl p-6 shadow-lg transition hover:scale-105`}>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <div className="mt-4 flex items-center justify-between text-white/90">
        <span>{difficulty}</span>
        <span>{questions} Questions</span>
      </div>
      <button className="mt-4 rounded-full bg-white/20 px-4 py-2 font-semibold text-white backdrop-blur-sm hover:bg-white/30">
        Start Quiz
      </button>
    </div>
  );
}

// Category Tile Component
function CategoryTile({ title, icon, color }: {
  title: string;
  icon: string;
  color: string;
}) {
  return (
    <div className={`${color} flex flex-col items-center rounded-2xl p-6 text-center shadow-lg transition hover:scale-105`}>
      <span className="text-4xl">{icon}</span>
      <h3 className="mt-2 font-bold text-white">{title}</h3>
    </div>
  );
}
