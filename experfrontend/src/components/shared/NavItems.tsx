'use client'

import React from 'react'
import Link from 'next/link'
import { headerLinks } from '@/constants'
import { usePathname } from 'next/navigation';

const NavItems = () => {
  const pathname = usePathname();

  return (
    <ul className="md:flex-between flex w-full flex-col items-start gap-5 md:flex-row">
      {headerLinks.map((link) => {
        const isActive = pathname === link.route;
        return (
          <li key={link.route} className="nav-item">
            <Link 
              href={link.route} 
              className={`nav-link relative px-4 py-2 text-sm font-semibold transition-all duration-300 
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