'use client';

import Link from 'next/link'
import Image from 'next/image'
import React, { useState} from 'react'
import { Button } from '../ui/button'
import NavItems from './NavItems'
import MobileNav from './MobileNav'
import { useAuth } from '@/contexts/auth.context';
import UserButton from './UserButton';
import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  return (
    <header className="w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 shadow-lg">
      <div className="wrapper flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="w-36 transform transition hover:scale-105">
          <Image 
            src="/assets/images/logo.svg" 
            alt="Exper logo" 
            width={128} 
            height={38}
            className="drop-shadow-lg" 
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:space-x-6">
          <NavItems />
        </nav>

       {/* Auth Buttons */}
       <div className="flex items-center space-x-4">
          <MobileNav />
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <UserButton 
                user={user!}
                onSignOut={logout}
              />
            ) : (
              <>
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="text-sm font-medium text-white hover:text-yellow-300 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsRegisterOpen(true)}
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
          <div className="bg-white rounded-2xl p-6 shadow-2xl transform transition hover:scale-[1.01]">
            <button
              onClick={() => setIsLoginOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
            <LoginForm onClose={() => setIsLoginOpen(false)} />
          </div>
        </div>
      )}

      {/* Register Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-2xl transform transition hover:scale-[1.01]">
            <button
              onClick={() => setIsRegisterOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
            <RegisterForm onClose={() => setIsRegisterOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}

export default Header