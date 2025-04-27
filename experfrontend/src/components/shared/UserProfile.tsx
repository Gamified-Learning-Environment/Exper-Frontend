'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Crown, Star, Target, Trophy, Flame, Zap, Brain, BookOpen, Award } from 'lucide-react';

interface Achievement {
  icon: any;
  label: string;
  description: string;
  color: string;
  earned: boolean;
  progress: number;
}

export default function UserProfile() {
  // Mock user data - was used in earlier iterations
  const [userData] = useState({
    username: "Shane Walsh",
    level: 15,
    xp: 2750,
    xpToNextLevel: 3000,
    quizzesCompleted: 47,
    averageScore: 85,
    streak: 7,
    achievements: [
      {
        icon: Crown,
        label: "Quiz Champion",
        description: "Complete 50 quizzes",
        color: "text-yellow-400",
        earned: false,
        progress: 94
      },
      {
        icon: Flame,
        label: "On Fire",
        description: "Maintain a 7-day streak",
        color: "text-red-500",
        earned: true,
        progress: 100
      },
      {
        icon: Target,
        label: "Perfectionist",
        description: "Score 100% on 10 quizzes",
        color: "text-green-500",
        earned: false,
        progress: 70
      }
    ] as Achievement[],
    badges: [
      {
        icon: Brain,
        label: "Knowledge Seeker",
        color: "bg-purple-500"
      },
      {
        icon: BookOpen,
        label: "Dedicated Learner",
        color: "bg-blue-500"
      },
      {
        icon: Award,
        label: "Expert",
        color: "bg-yellow-500"
      }
    ]
  });

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{userData.username}</h1>
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold">Level {userData.level}</span>
              <div className="h-8 w-px bg-white/20" />
              <span className="text-sm opacity-75">{userData.streak} Day Streak 🔥</span>
            </div>
          </div>
          <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-4xl">🎮</span>
          </div>
        </CardHeader>
      </Card>

      {/* XP Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>XP Progress</span>
              <span>{userData.xp} / {userData.xpToNextLevel}</span>
            </div>
            <Progress value={(userData.xp / userData.xpToNextLevel) * 100} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-green-700">{userData.quizzesCompleted}</h3>
              <p className="text-sm text-green-600">Quizzes Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-blue-700">{userData.averageScore}%</h3>
              <p className="text-sm text-blue-600">Average Score</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-yellow-700">{userData.streak}</h3>
              <p className="text-sm text-yellow-600">Day Streak</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Achievements</h2>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userData.achievements.map((achievement, index) => (
            <div key={index} className="flex items-center gap-4 p-4 rounded-lg border-2 transition-all hover:shadow-md">
              <div className={`p-3 rounded-full ${achievement.earned ? achievement.color : 'text-gray-400'}`}>
                <achievement.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{achievement.label}</h3>
                <p className="text-sm text-gray-500">{achievement.description}</p>
                <Progress value={achievement.progress} className="h-1 mt-2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Badges</h2>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          {userData.badges.map((badge, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className={`p-4 rounded-full ${badge.color}`}>
                <badge.icon className="w-8 h-8 text-white" />
              </div>
              <span className="text-sm font-medium">{badge.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}