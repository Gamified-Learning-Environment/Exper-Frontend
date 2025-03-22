import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ProfileBadgeProps {
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  rarity: string;
}

export function ProfileBadge({ name, description, icon, earned = true, rarity = 'common' }: ProfileBadgeProps) {
  // Map rarity to visual styles
  const rarityStyles = {
    common: "bg-slate-500 hover:bg-slate-600",
    uncommon: "bg-green-600 hover:bg-green-700",
    rare: "bg-blue-600 hover:bg-blue-700",
    epic: "bg-purple-600 hover:bg-purple-700",
    legendary: "bg-amber-500 hover:bg-amber-600"
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm",
              earned 
                ? rarityStyles[rarity as keyof typeof rarityStyles] || rarityStyles.common
                : "bg-gray-300 opacity-40",
              earned && "cursor-pointer transform hover:scale-110"
            )}
          >
            <span className="text-white text-sm">{icon}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-black text-white border-none p-2 max-w-[200px]">
          <div className="text-center">
            <p className={cn(
              "font-bold mb-1",
              rarity === "legendary" && "text-amber-400",
              rarity === "epic" && "text-purple-300",
              rarity === "rare" && "text-blue-300",
              rarity === "uncommon" && "text-green-300",
            )}>{name}</p>
            <p className="text-xs opacity-80">{description}</p>
            {!earned && <p className="text-xs mt-1 opacity-60 italic">Not yet earned</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}