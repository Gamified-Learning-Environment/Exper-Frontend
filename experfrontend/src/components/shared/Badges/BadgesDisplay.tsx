import React, { useState, useEffect } from 'react';
import { ProfileBadge } from './ProfileBadge';
import { GamificationService } from '@/services/gamification.service';
import { useAuth } from '@/contexts/auth.context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface BadgeType {
  badge_id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  earned: boolean;
}

interface BadgesDisplayProps {
  userId?: string;
  compact?: boolean;
}

export function BadgesDisplay({ userId, compact = false }: BadgesDisplayProps) {
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  const displayUserId = userId || user?._id;
  
  useEffect(() => {
    async function fetchBadges() {
      if (!displayUserId) return;
      
      try {
        setIsLoading(true);
        const userBadges = await GamificationService.getUserBadges(displayUserId);
        setBadges(userBadges);
        
        const uniqueCategories = Array.from(
          new Set<string>(userBadges.map((badge: BadgeType) => badge.category))
        );
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Error fetching badges:", err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchBadges();
  }, [displayUserId]);

  // Discord-like compact display for profile headers
  if (compact) {
    const earnedBadges = badges.filter(badge => badge.earned);
    
    if (isLoading) {
      return (
        <div className="flex gap-1">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="w-6 h-6 rounded-full" />
          ))}
        </div>
      );
    }
    
    if (earnedBadges.length === 0) {
      return null; // Don't show anything if no badges earned
    }
    
    return (
      <div className="flex gap-1 items-center">
        {earnedBadges.slice(0, 5).map(badge => (
          <ProfileBadge
            key={badge.badge_id}
            name={badge.name}
            description={badge.description}
            icon={badge.icon}
            earned={badge.earned}
            rarity={badge.rarity}
          />
        ))}
        {earnedBadges.length > 5 && (
          <div className="text-xs text-gray-500 ml-1">
            +{earnedBadges.length - 5}
          </div>
        )}
      </div>
    );
  }

  // Full badge display for dedicated badge section
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-4">
            {Array(12).fill(0).map((_, i) => (
              <Skeleton key={i} className="w-8 h-8 rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Badges
          <span className="text-sm font-normal text-muted-foreground">
            {badges.filter(badge => badge.earned).length} of {badges.length} earned
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {categories.length > 1 ? (
          <Tabs defaultValue={categories[0]}>
            <TabsList className="mb-4">
              {categories.map(category => (
                <TabsTrigger key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {categories.map(category => (
              <TabsContent key={category} value={category} className="pt-2">
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-4">
                  {badges
                    .filter(badge => badge.category === category)
                    .map(badge => (
                      <ProfileBadge
                        key={badge.badge_id}
                        name={badge.name}
                        description={badge.description}
                        icon={badge.icon}
                        earned={badge.earned}
                        rarity={badge.rarity}
                      />
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-4">
            {badges.map(badge => (
              <ProfileBadge
                key={badge.badge_id}
                name={badge.name}
                description={badge.description}
                icon={badge.icon}
                earned={badge.earned}
                rarity={badge.rarity}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}