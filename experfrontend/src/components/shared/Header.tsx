'use client';

import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
//import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Button } from '../ui/button'
import NavItems from './NavItems'
import MobileNav from './MobileNav'
import { useAuth } from '@/contexts/auth.context';


const Header = () => {
  const { isAuthenticated, user } = useAuth();
  
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
          // Show user button when authenticated
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">Welcome</span>
            <Button onClick={() => {/* handle logout */}}>Logout</Button>
          </div>
        ) : (
          // Show login/signup buttons when not authenticated  
          <>
            <Link 
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Sign In
            </Link>
            <Link
              href="/register" 
              className="text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
        </div>
      </div>
    </header>
  );
}

export default Header