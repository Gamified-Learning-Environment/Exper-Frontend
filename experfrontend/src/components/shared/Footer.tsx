import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const Footer = () => { // Footer component
  return (
    <footer className="bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 py-6 text-white">
      <div className="wrapper flex-between flex flex-col gap-4 p-5 text-center sm:flex-row">
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

        { /* Footer content */ }
        <div className="flex flex-col gap-2">
          <p className="text-white/90">2024 Exper. Level up your learning journey!</p>
          <div className="flex justify-center gap-4">
            <a href="https://github.com/Gamified-Learning-Environment" 
               className="text-white/90 hover:text-yellow-300 transition"
               target="_blank" 
               rel="noopener noreferrer">
              GitHub
            </a>
            <a href="#" 
               className="text-white/90 hover:text-yellow-300 transition">
              About
            </a>
            <a href="#" 
               className="text-white/90 hover:text-yellow-300 transition">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer