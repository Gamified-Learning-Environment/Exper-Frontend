'use client'; // use client to import modules from the client folder, helps to avoid SSR issues

import Link from 'next/link'
import Image from 'next/image'
import React, { useState} from 'react'
import NavItems from './NavItems'
import MobileNav from './MobileNav'
import { useEffect } from 'react';

// Auth imports
import { useAuth } from '@/contexts/auth.context';
import UserButton from './UserButton';
import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';

// level widget & achievements imports
import { Progress } from '../ui/progress'; 
import { Crown, Star, Target, Trophy, Flame, Zap } from 'lucide-react';
import { GamificationService } from '@/services/gamification.service';

// Lottie animation import for logo
import ExperCompassAnim from "../animations/ExperCompassAnim";

const AchievementBanner = () => {  // Placeholder achievements
  const achievements = [ 
    { icon: Crown, label: 'Quiz Master', color: 'text-yellow-400' },
    { icon: Star, label: '5 Day Streak', color: 'text-purple-400' },
    { icon: Target, label: 'Perfect Score', color: 'text-green-400' },
    { icon: Trophy, label: 'Champion', color: 'text-blue-400' },
    { icon: Flame, label: 'On Fire', color: 'text-red-400' },
  ];

  return ( // Achievements banner
    <div className="hidden md:flex items-center gap-6 rounded-full bg-white/20 px-6 py-3 backdrop-blur-sm">
      {achievements.map((achievement, index) => ( // Map through achievements
        <div
          key={index}
          className="group relative flex items-center justify-center"
        >
          {/* Achievement icon */}
          <achievement.icon 
            className={`h-7 w-7 ${achievement.color} transition-all hover:scale-150`}  
          />
          {/* Tooltip */}
          <span className="absolute -bottom-10 scale-0 rounded bg-black/75 px-3 py-2 text-sm text-white transition-all group-hover:scale-75">
            {achievement.label}
          </span>
        </div>
      ))}
    </div>
  );
};

// Level Widget for displaying user level and progress
const LevelWidget = () => {
  const { user } = useAuth();
  const [playerStats, setPlayerStats] = useState<{
    level: number;
    xp: number;
    totalXpRequired: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { // Fetch player stats on component mount
    const fetchPlayerStats = async () => {
      if (!user?._id) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Get player stats from gamification service
        const stats = await GamificationService.getPlayerStats(user._id);
        setPlayerStats(stats);
      } catch (err) {
        console.error("Error fetching player level stats:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlayerStats();
  }, [user?._id]);

  // Calculate progress percentage
  const progressPercentage = playerStats 
    ? Math.round((playerStats.xp / playerStats.totalXpRequired) * 100)
    : 0;

  // If no user is logged in or stats are loading, return empty
  if (!user || isLoading) {
    return null;
  }

  return ( // Return level widget
    <div className="hidden md:flex items-center gap-3 rounded-full bg-white/20 px-6 py-3 backdrop-blur-sm">
      {/* Level number */}
      <span className="text-3xl font-bold text-white">
        {playerStats?.level || 1}
      </span>
      
      {/* Progress container */}
      <div className="flex flex-col justify-center min-w-[160px]">
        <Progress 
          value={progressPercentage}
          className="h-1.5 w-full"
        />
        {/* Progress text */}
        <span className="text-xs text-white/70 mt-1">
          {progressPercentage}% to level {(playerStats?.level || 1) + 1}
        </span>
      </div>
    </div>
  );
};

const Header = () => { // Header component
  // Auth state
  const { isAuthenticated, user, logout } = useAuth();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  return ( // return Header
    <header className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 shadow-lg">
      <div className="wrapper flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="relative w-38 transform transition hover:scale-105">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-lg -m-2"></div>
            <div className="logo-container h-16 w-16 flex items-center justify-center">
              <ExperCompassAnim />
            </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:space-x-4 lg:space-x-6">
          <NavItems /> {/* NavItems component */}
        </nav>

        {/* Achievements Banner */}
        <AchievementBanner />
        
        {/* Level Widget here */}
        <LevelWidget />

       {/* Auth Buttons */}
       <div className="flex items-center space-x-4">
          <MobileNav />
          <div className="flex items-center gap-4">
            {isAuthenticated ? ( // Check if user is authenticated
              <UserButton 
                user={user!}
                onSignOut={logout}
              />
            ) : ( // Show Sign In and Sign Up buttons
              <>
                <button
                  onClick={() => setIsLoginOpen(true)} // Open login modal
                  className="text-sm font-medium text-white hover:text-yellow-300 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsRegisterOpen(true)} // Open register modal
                  className="transform rounded-full bg-yellow-400 px-6 py-2 text-sm font-bold text-purple-900 shadow-md transition hover:scale-105 hover:bg-yellow-300"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl p-6 shadow-2xl transform transition hover:scale-[1.01]">
            <LoginForm onClose={() => setIsLoginOpen(false)} />
          </div>
        </div>
      )}

      {/* Register Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl p-6 shadow-2xl transform transition hover:scale-[1.01]">
            <RegisterForm onClose={() => setIsRegisterOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}

export default Header