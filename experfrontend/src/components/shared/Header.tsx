import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Button } from '../ui/button'
import NavItems from './NavItems'
import MobileNav from './MobileNav'
import { SignInButton } from "@clerk/nextjs";

const Header = () => {
  return (
    <header className="w-full border-b">
      <div className="wrapper flex items-center justify-between">
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
        <SignedIn>
          <nav className="hidden md:flex max-w-xs">
            <NavItems />
          </nav>
        </SignedIn>

        {/* Auth Buttons */}
        <div className="flex justify-end gap-3">
          <SignedIn>
            <UserButton />
            <MobileNav />
          </SignedIn>
          <SignedOut>
            <Button asChild className="rounded-full" size="lg">
              <SignInButton />
            </Button>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}

export default Header