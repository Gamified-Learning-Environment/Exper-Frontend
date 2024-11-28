import React from 'react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet"
import Image from 'next/image'
import { Separator } from '../ui/separator'
import NavItems from './NavItems'
  
const MobileNav = () => {
  return (
    <nav className="md:hidden">
        <Sheet>
            <SheetTrigger className="align-middle">
                <Image 
                    src="/assets/icons/menu.svg"
                    alt="menu"
                    width={24}
                    height={24}
                    className="cursor-pointer transition hover:opacity-70"
                />
            </SheetTrigger>
            <SheetContent className="flex flex-col gap-6 bg-gradient-to-b from-violet-500 to-fuchsia-500">
                <SheetHeader>
                    <SheetTitle className="text-2xl font-bold text-white">
                        Game Menu 🎮
                    </SheetTitle>
                    <SheetDescription className="text-white/80">
                        Choose your next adventure!
                    </SheetDescription>
                </SheetHeader>
                
                <Image 
                    src="/assets/images/logo.svg"
                    alt="Exper logo"
                    width={128}
                    height={38}
                    className="drop-shadow-lg transition hover:scale-105"
                />

                <Separator className="border-white/20" />

                <div className="flex flex-col gap-6">
                    <NavItems />
                </div>
            </SheetContent>
        </Sheet>
    </nav>
  )
}

export default MobileNav