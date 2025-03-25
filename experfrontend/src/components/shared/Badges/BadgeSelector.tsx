import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Lock, Info } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Badge {
  id: string;
  name: string;
  icon: string;
  category: string;
  earned: boolean;
  description: string;
  rarity: string;
}

interface BadgeSelectorProps {
  earnedBadges: string[];
  badges: Badge[];
  selectedBadges: string[];
  onChange: (selectedIds: string[]) => void;
  maxBadges?: number;
}

export default function BadgeSelector({
  earnedBadges,
  badges,
  selectedBadges,
  onChange,
  maxBadges = 10
}: BadgeSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Group badges by category
  const badgesByCategory = badges.reduce((acc, badge) => {
    if (!acc[badge.category]) {
      acc[badge.category] = [];
    }
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<string, Badge[]>);
  
  // Get all available categories
  const categories = Object.keys(badgesByCategory).sort();
  
  // Set active category if not set
  if (!activeCategory && categories.length > 0) {
    setActiveCategory(categories[0]);
  }
  
  const toggleBadge = (badgeId: string) => {
    if (!earnedBadges.includes(badgeId)) return; // Can't select unearned badges
    
    if (selectedBadges.includes(badgeId)) {
      onChange(selectedBadges.filter(id => id !== badgeId));
    } else {
      if (selectedBadges.length >= maxBadges) {
        return; // Max badges reached
      }
      onChange([...selectedBadges, badgeId]);
    }
  };
  
  // Get rarity color
  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'bg-gray-100 border-gray-200';
      case 'uncommon': return 'bg-green-100 border-green-200';
      case 'rare': return 'bg-blue-100 border-blue-200';
      case 'epic': return 'bg-purple-100 border-purple-200';
      case 'legendary': return 'bg-yellow-100 border-yellow-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">
          Your Achievement Badges
        </CardTitle>
        <div className="text-sm text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
          {selectedBadges.length}/{maxBadges} selected
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="categories">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="categories">By Category</TabsTrigger>
            <TabsTrigger value="earned">Earned ({earnedBadges.length})</TabsTrigger>
            <TabsTrigger value="selected">Selected ({selectedBadges.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories" className="space-y-4">
            {/* Category filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map(category => (
                <UIBadge
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </UIBadge>
              ))}
            </div>
            
            {/* Badge grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {activeCategory && badgesByCategory[activeCategory]?.map(badge => {
                const isSelected = selectedBadges.includes(badge.id);
                const isEarned = earnedBadges.includes(badge.id);
                
                return (
                  <TooltipProvider key={badge.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`
                            relative border rounded-lg p-3 transition-all
                            ${isEarned ? '' : 'opacity-50 grayscale'}
                            ${isSelected ? 'ring-2 ring-purple-500' : ''}
                            ${getRarityColor(badge.rarity)}
                            ${isEarned ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed'}
                          `}
                          onClick={() => isEarned && toggleBadge(badge.id)}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl">{badge.icon}</span>
                            <span className="text-xs font-medium text-center">{badge.name}</span>
                            <span className="text-[10px] capitalize px-2 py-0.5 rounded-full bg-white/50">
                              {badge.rarity}
                            </span>
                          </div>
                          
                          {isSelected && (
                            <div className="absolute -top-2 -right-2 h-5 w-5 bg-purple-600 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-3 w-3 text-white" />
                            </div>
                          )}
                          
                          {!isEarned && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/5">
                              <Lock className="h-4 w-4 text-gray-500" />
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="max-w-xs">
                          <p className="font-bold">{badge.name}</p>
                          <p className="text-xs">{badge.description}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {isEarned ? '✅ Earned' : '🔒 Not yet earned'}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="earned">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {badges
                .filter(badge => earnedBadges.includes(badge.id))
                .map(badge => {
                  const isSelected = selectedBadges.includes(badge.id);
                  
                  return (
                    <TooltipProvider key={badge.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`
                              relative border rounded-lg p-3 transition-all hover:shadow-md
                              ${isSelected ? 'ring-2 ring-purple-500' : ''}
                              ${getRarityColor(badge.rarity)}
                              cursor-pointer
                            `}
                            onClick={() => toggleBadge(badge.id)}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-2xl">{badge.icon}</span>
                              <span className="text-xs font-medium text-center">{badge.name}</span>
                              <span className="text-[10px] capitalize px-2 py-0.5 rounded-full bg-white/50">
                                {badge.rarity}
                              </span>
                            </div>
                            {isSelected && (
                              <div className="absolute -top-2 -right-2 h-5 w-5 bg-purple-600 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="max-w-xs">
                            <p className="font-bold">{badge.name}</p>
                            <p className="text-xs">{badge.description}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
            </div>
          </TabsContent>
          
          <TabsContent value="selected">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {badges
                .filter(badge => selectedBadges.includes(badge.id))
                .map(badge => (
                  <TooltipProvider key={badge.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`
                            relative border rounded-lg p-3 transition-all hover:shadow-md
                            ring-2 ring-purple-500 cursor-pointer
                            ${getRarityColor(badge.rarity)}
                          `}
                          onClick={() => toggleBadge(badge.id)}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl">{badge.icon}</span>
                            <span className="text-xs font-medium text-center">{badge.name}</span>
                            <span className="text-[10px] capitalize px-2 py-0.5 rounded-full bg-white/50">
                              {badge.rarity}
                            </span>
                          </div>
                          <div className="absolute -top-2 -right-2 h-5 w-5 bg-purple-600 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="max-w-xs">
                          <p className="font-bold">{badge.name}</p>
                          <p className="text-xs">{badge.description}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
            </div>
            
            {selectedBadges.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <Info className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No badges selected yet</p>
                <p className="text-sm">Select badges from the earned category to display on your profile</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between mt-6 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Earn more badges by completing achievements!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}