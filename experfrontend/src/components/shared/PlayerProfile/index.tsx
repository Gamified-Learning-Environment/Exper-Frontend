import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { GamificationService } from '@/services/gamification.service';
import { CustomizationService } from '@/services/customization.service';
import { UserCustomization } from '@/services/customization.service';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Brain, Star, Flame, Trophy, BookOpen } from 'lucide-react';
import { BadgesDisplay } from '@/components/shared/Badges/BadgesDisplay';

interface PlayerStats {
  level: number;
  xp: number;
  totalXpRequired: number;
  streakDays: number;
  quizzesCompleted: number;
  quizzesPerfect: number;
  totalAchievements: number;
  categoryProgress: {
    category: string;
    level: number;
    xp: number;
    totalXpRequired: number;
  }[];
}

interface UserInfo {
  _id: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}

interface PlayerProfileProps {
  userId?: string;
}

export default function PlayerProfile({ userId }: PlayerProfileProps) {
  const { user } = useAuth();
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [profileUser, setProfileUser] = useState<UserInfo | null>(null);
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userCustomization, setUserCustomization] = useState<UserCustomization | null>(null);

  // Determine which user ID to use: the prop (if provided) or the current user
  const targetUserId = userId || user?._id;
  
  useEffect(() => {
    const fetchPlayerStats = async () => {
      if (!targetUserId) return;
      
      try {
        setIsLoading(true);
        setImageError(false);
        setProfileImage(undefined); // Reset profile image state

        // Get player stats from gamification service
        const stats = await GamificationService.getPlayerStats(targetUserId);
        setPlayerStats(stats);

        // Handle different cases for fetching user profile image
        if (userId && userId !== user?._id) {
          // Case 1: Viewing someone else's profile
          try {
            // Use User Management Service to get user info
            const response = await fetch(`http://localhost:8080/api/auth/users/${userId}`);
            if (!response.ok) {
              throw new Error('Failed to fetch user information');
            }
            const userData = await response.json();
            console.log("Fetched other user data:", userData);
            
            setProfileUser(userData);
            
            // Set profile image if available
            if (userData && userData.imageUrl) {
              console.log("Setting other user image URL:", userData.imageUrl);
              setProfileImage(userData.imageUrl);
            }
          } catch (err) {
            console.error("Error fetching user profile:", err);
          }
        } else if (user) {
          // Case 2: Viewing your own profile
          console.log("Using current user data:", user);
          
          // If viewing your own profile, use data from auth context
          if (user.imageUrl) {
            console.log("Setting own image URL:", user.imageUrl);
            setProfileImage(user.imageUrl);
          } else {
            // Extra fallback - fetch your own user data if imageUrl is missing
            try {
              const response = await fetch(`http://localhost:8080/api/auth/users/${user._id}`);
              if (response.ok) {
                const userData = await response.json();
                console.log("Fetched own user data:", userData);
                if (userData.imageUrl) {
                  console.log("Setting own image URL from API:", userData.imageUrl);
                  setProfileImage(userData.imageUrl);
                }
              }
            } catch (err) {
              console.error("Error fetching own user profile:", err);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching player stats:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlayerStats();
    // Set up interval to refresh stats every minute (optional)
    const intervalId = setInterval(fetchPlayerStats, 60000);
    
    return () => clearInterval(intervalId);
  }, [targetUserId, userId, user?._id]);

  useEffect(() => { // Fetch user customization data
    async function fetchCustomization() {
      if (!userId) return;
      
      try {
        const customization = await CustomizationService.getUserCustomization(userId);
        setUserCustomization(customization);
      } catch (err) {
        console.error("Error fetching user customization:", err);
      }
    }
    
    fetchCustomization();
  }, [userId]);

  // Determine which user object to display
  // If viewing someone else's profile, use the fetched profile data
  // Otherwise use the current logged-in user data
  const displayUser = userId && userId !== user?._id ? profileUser : user;
  
  if (isLoading) {
    return <div className="h-48 flex items-center justify-center">Loading profile data...</div>;
  }
  
  if (!playerStats || !targetUserId) {
    return (
      <Card className="bg-white border-2 border-purple-100">
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Player profile unavailable</p>
        </CardContent>
      </Card>
    );
  }

  // Get the image URL from either the profile image state or displayUser
  const imageUrl = profileImage || displayUser?.imageUrl;
  console.log("Using image URL:", imageUrl);
  
  return (
    <Card style={{
      backgroundColor: userCustomization?.theme?.backgroundPattern ? 'transparent' : undefined,
      backgroundImage: userCustomization?.theme?.backgroundPattern !== 'none' ? 
        getBackgroundPatternStyle(userCustomization?.theme?.backgroundPattern) : undefined,
      borderRadius: getCardBorderRadius(userCustomization?.theme?.cardStyle),
      fontFamily: getFontFamily(userCustomization?.theme?.fontStyle),
    }}>
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 text-white">
        <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-white/30">
            {!imageError && imageUrl ? (
              <img
                src={imageUrl}
                alt={displayUser?.username || "User profile"}
                className="h-full w-full object-cover"
                onError={() => {
                  console.error("Image failed to load:", imageUrl);
                  setImageError(true);
                }}
              />
            ) : (
              <div className="h-full w-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                {displayUser?.username?.charAt(0) || displayUser?.email?.charAt(0) || "U"}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{displayUser?.username || displayUser?.email || "Player"}</h2>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span className="text-white/90">Level {playerStats.level} Explorer</span>
            </div>
          </div>
          <div className="flex items-center mt-1">
            <BadgesDisplay userId={targetUserId} compact={true} />
          </div>
        </div>
      </div>
      
      <CardContent className="p-6 space-y-6">
        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-semibold text-purple-800">Level {playerStats.level}</span>
            <span className="font-semibold text-purple-800">Level {playerStats.level + 1}</span>
          </div>
          <Progress 
            value={(playerStats.xp / playerStats.totalXpRequired) * 100}
            className="h-3"
          />
          <div className="flex justify-between text-sm text-purple-600">
            <span>{playerStats.xp} XP</span>
            <span>{playerStats.totalXpRequired} XP</span>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-purple-100 flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <Flame className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Current Streak</div>
              <div className="font-bold text-lg">{playerStats.streakDays} Days</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-purple-100 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <BookOpen className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Quizzes</div>
              <div className="font-bold text-lg">{playerStats.quizzesCompleted}</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-purple-100 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-full">
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Perfect Scores</div>
              <div className="font-bold text-lg">{playerStats.quizzesPerfect}</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-purple-100 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Star className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Achievements</div>
              <div className="font-bold text-lg">{playerStats.totalAchievements}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold text-purple-800 mb-4">Category Mastery</h3>
          
          {playerStats?.categoryProgress && playerStats.categoryProgress.length > 0 ? (
            <div className="space-y-4">
              {playerStats.categoryProgress
                .sort((a, b) => b.level - a.level) // Sort by level, highest first
                .map((category) => (
                  <div key={category.category} className="bg-purple-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📚</span>
                        <div>
                          <h4 className="font-bold text-purple-800">{category.category}</h4>
                          <span className="text-sm text-purple-600">Level {category.level}</span>
                        </div>
                      </div>
                      <span className="bg-purple-100 px-2 py-1 rounded-full text-sm font-medium">
                        {category.xp} / {category.totalXpRequired} XP
                      </span>
                    </div>
                    
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-600"
                        style={{ width: `${(category.xp / category.totalXpRequired) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center p-6 text-gray-500">
              <p>Complete quizzes in different categories to see your mastery levels!</p>
            </div>
          )}
        </div>
        
      </CardContent>
    </Card>
  );

  // Helper functions for styles
function getCardBorderRadius(cardStyle?: string) {
  switch (cardStyle) {
    case 'rounded': return '1rem';
    case 'sharp': return '0';
    default: return '0.5rem';
  }
}

function getFontFamily(fontStyle?: string) {
  switch (fontStyle) {
    case 'modern': return "'Poppins', sans-serif";
    case 'classic': return "'Georgia', serif";
    case 'playful': return "'Comic Sans MS', cursive";
    case 'elegant': return "'Playfair Display', serif";
    default: return 'inherit';
  }
}

function getBackgroundPatternStyle(pattern?: string) {
  switch (pattern) {
    case 'dots': return 'radial-gradient(#8881 1px, transparent 1px)';
    case 'lines': return 'linear-gradient(to right, #8881 1px, transparent 1px)';
    case 'grid': return 'linear-gradient(#8881 1px, transparent 1px), linear-gradient(to right, #8881 1px, transparent 1px)';
    case 'waves': return 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'20\' viewBox=\'0 0 100 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M21.184 20c.357-.13.72-.264.888-.14 1.24.19 1.9.334 2.15.334 1.05 0 1.74-.17 2.91-.51.588-.155 1.177-.317 1.766-.473a37.4 37.4 0 0 1 2.427-.584c1.142-.23 2.307-.447 3.005-.528.986-.112 2.3.02 3.175.08 1.11.063 2.365.17 3.46.208 1.33.046 2.925.084 4.19.085h.017c1.402 0 2.89-.025 4.209-.075 1.096-.034 2.35-.857 3.46-.12.847-.063 2.984.332 3.97.442a60.46 60.46 0 0 1 4.193.856c1.45.355 2.683.713 3.89 1.08a11.08 11.08 0 0 0 2.235.433c1.973.354 3.386-1.294 4.802-2.843C63.417 13.94 68.997 5.535 77.74 3.04c2.812-.81 5.656-1.144 8.094.235.78.437 1.504.88 1.97 1.394 1.38 1.505 2.25 3.07 2.94 4.426.58 1.136 1.122 2.203 1.933 2.73.896.584 2.578.887 3.538 1.064 3.81.704 8.015.74 13.07 2.27 1.224.37 2.4.793 3.567 1.27.513.206 1.05.422 1.483.58.225.097.427.18.6.237.257.136.91.246 1.064.254\' fill=\'none\' stroke=\'%23888\' stroke-opacity=\'.2\' stroke-width=\'2\'/%3E%3C/svg%3E")';
    default: return 'none';
  }
}
}