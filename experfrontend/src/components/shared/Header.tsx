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
    <header className="w-full border-b">
      <div className="wrapper flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="w-36">
          <Image 
            src="/assets/images/logo.svg" 
            alt="Exper logo" 
            width={128} 
            height={38} 
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
          <>
            <UserButton 
              user={user!}
              onSignOut={logout}
            />
          </>
        ) : (
          <>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Sign In
            </button>
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
        </div>
      </div>

      {/* Register Modal */}

      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-lg">
            <button
              onClick={() => setIsLoginOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
            <LoginForm onClose={() => setIsLoginOpen(false)} />
          </div>
        </div>
      )}

      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-lg">
            <button
              onClick={() => setIsRegisterOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
            <RegisterForm onClose={() => setIsRegisterOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}

export default Header