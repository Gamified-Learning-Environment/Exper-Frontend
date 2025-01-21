'use client'; // use client to import modules from the client folder, helps to avoid SSR issues

import Link from 'next/link'
import Image from 'next/image'
import React, { useState} from 'react'
import NavItems from './NavItems'
import MobileNav from './MobileNav'

// Auth imports
import { useAuth } from '@/contexts/auth.context';
import UserButton from './UserButton';
import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';

// level widget & achievements imports
import { Progress } from '../ui/progress'; 
import { Crown, Star, Target, Trophy, Flame, Zap } from 'lucide-react';

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

const LevelWidget = () => { // placeholder Level widget component
  // Level and percentage progress, hardcoded for now
  const level = 15;
  const progress = 65;

  return ( // return Level widget
    <div className="hidden md:flex items-center gap-3 rounded-full bg-white/20 px-6 py-3 backdrop-blur-sm">
      {/* Level number */}
      <span className="text-3xl font-bold text-white">
        {level}
      </span>
      
      {/* Progress container */}
      <div className="flex flex-col justify-center min-w-[160px]">
        <Progress 
          value={progress}
          className="h-1.5 w-full"
        />
        {/* Progress text */}
        <span className="text-xs text-white/70 mt-1">
          {progress}% to next level
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
          <div className="relative">
            <Image 
              src="/assets/images/logo.svg" 
              alt="Exper logo" 
              width={128} 
              height={38}
              className="drop-shadow-lg filter brightness-105 rounded-lg" 
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:space-x-4 lg:space-x-6">
          <NavItems /> {/* NavItems component */}
        </nav>

        {/* Achievements Banner */}
        <AchievementBanner />
        
        {/* Add Level Widget here */}
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