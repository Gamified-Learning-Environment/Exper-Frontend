'use client' // use client to import modules from the client folder, helps to avoid SSR issues

import React from 'react'
import Link from 'next/link'
import { headerLinks } from '@/constants' // Import headerLinks from constants folder
import { usePathname } from 'next/navigation';

const NavItems = () => { // NavItems component to display navigation items
  const pathname = usePathname();

  return ( // Return navigation items
    <ul className="md:flex-between flex w-full flex-col items-start gap-5 md:flex-row">
      {headerLinks.map((link) => { // Map through headerLinks
        const isActive = pathname === link.route;
        return ( 
          <li key={link.route} className="nav-item w-full md:w-auto">
            <Link 
              href={link.route} 
              className={`nav-link relative whitespace-nowrap px-4 py-2 text-base md:text-sm lg:text-base font-semibold transition-all duration-300 block
                ${isActive 
                  ? 'text-yellow-300 after:absolute after:bottom-0 after:left-0 after:h-1 after:w-full after:rounded-full after:bg-yellow-300' 
                  : 'text-white/90 hover:text-yellow-300'}`}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  )
}

export default NavItems