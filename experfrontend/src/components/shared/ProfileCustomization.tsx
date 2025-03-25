'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from 'lucide-react';
import { CustomizationService, UserCustomization } from '@/services/customization.service';
import { GamificationService } from '@/services/gamification.service';
import BadgeSelector from './Badges/BadgeSelector';

// Profile badge interface
interface Badge {
    id: string;
    name: string;
    icon: string;
    category: string;
    earned: boolean;
    description: string;
    rarity: string;
  }

// Enhanced theme customization interface with more options
interface ThemeCustomization {
  primaryColor: string;
  accentColor: string;
  cardStyle: 'default' | 'rounded' | 'sharp';
  showLevel: boolean;
  showStreaks: boolean;
  showAchievements: boolean;
  backgroundPattern?: string; 
  fontStyle?: string;
}

interface ProfileCustomizationProps {
  userId: string;
}

export default function ProfileCustomization({ userId }: ProfileCustomizationProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Theme customization settings
  const [theme, setTheme] = useState<ThemeCustomization>({
    primaryColor: '#8b5cf6', // Default purple
    accentColor: '#f0abfc', // Default accent
    cardStyle: 'default',
    showLevel: true,
    showStreaks: true,
    showAchievements: true,
    backgroundPattern: 'none',
    fontStyle: 'default'
  });
  
  // Available badges grouped by category
  const [badgesByCategory, setBadgesByCategory] = useState<Record<string, Badge[]>>({});
  // Selected badges
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  // Available user badges (that they've earned)
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  
  // Background pattern options
  const backgroundPatterns = [
    { id: 'none', name: 'None', value: 'none' },
    { id: 'dots', name: 'Dots', value: 'radial-gradient(#8881 1px, transparent 1px)' },
    { id: 'lines', name: 'Lines', value: 'linear-gradient(to right, #8881 1px, transparent 1px)' },
    { id: 'grid', name: 'Grid', value: 'linear-gradient(#8881 1px, transparent 1px), linear-gradient(to right, #8881 1px, transparent 1px)' },
    { id: 'waves', name: 'Waves', value: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'20\' viewBox=\'0 0 100 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M21.184 20c.357-.13.72-.264.888-.14 1.24.19 1.9.334 2.15.334 1.05 0 1.74-.17 2.91-.51.588-.155 1.177-.317 1.766-.473a37.4 37.4 0 0 1 2.427-.584c1.142-.23 2.307-.447 3.005-.528.986-.112 2.3.02 3.175.08 1.11.063 2.365.17 3.46.208 1.33.046 2.925.084 4.19.085h.017c1.402 0 2.89-.025 4.209-.075 1.096-.034 2.35-.857 3.46-.12.847-.063 2.984.332 3.97.442a60.46 60.46 0 0 1 4.193.856c1.45.355 2.683.713 3.89 1.08a11.08 11.08 0 0 0 2.235.433c1.973.354 3.386-1.294 4.802-2.843C63.417 13.94 68.997 5.535 77.74 3.04c2.812-.81 5.656-1.144 8.094.235.78.437 1.504.88 1.97 1.394 1.38 1.505 2.25 3.07 2.94 4.426.58 1.136 1.122 2.203 1.933 2.73.896.584 2.578.887 3.538 1.064 3.81.704 8.015.74 13.07 2.27 1.224.37 2.4.793 3.567 1.27.513.206 1.05.422 1.483.58.225.097.427.18.6.237.257.136.91.246 1.064.254\' fill=\'none\' stroke=\'%23888\' stroke-opacity=\'.2\' stroke-width=\'2\'/%3E%3C/svg%3E")' }
  ];
  
  // Font style options
  const fontStyles = [
    { id: 'default', name: 'Default', value: 'inherit' },
    { id: 'modern', name: 'Modern', value: "'Poppins', sans-serif" },
    { id: 'classic', name: 'Classic', value: "'Georgia', serif" },
    { id: 'playful', name: 'Playful', value: "'Comic Sans MS', cursive" },
    { id: 'elegant', name: 'Elegant', value: "'Playfair Display', serif" }
  ];
  
  useEffect(() => {
    async function fetchUserCustomization() {
      try {
        setIsLoading(true);
        
        // Fetch user's earned badges first
        const userBadges = await GamificationService.getUserBadges(userId);
        console.log("API returned badges:", userBadges); // Debug log

        const userEarnedBadgeIds = userBadges
            .filter((badge: any) => badge.earned)
            .map((badge: any) => {
            // Check if badge has badge_id or id property
            return badge.badge_id || badge.id;
            });

        console.log("Extracted earned badge IDs:", userEarnedBadgeIds); // Debug log
        setEarnedBadges(userEarnedBadgeIds);
        
        // Fetch user's current customization settings
        const userCustomizationData = await CustomizationService.getUserCustomization(userId);
        if (userCustomizationData.theme) {
          setTheme(prev => ({
            ...prev,
            ...userCustomizationData.theme
          }));
        }
        
        if (userCustomizationData.displayBadges) {
          setSelectedBadges(userCustomizationData.displayBadges);
        }
        
        // Fetch available display badges
        const availableBadges = await fetchDisplayBadges();
        
        // Mark which ones the user has earned
        const badgesWithEarnedStatus: Badge[] = availableBadges.map((badge: Badge) => ({
          ...badge,
          earned: userEarnedBadgeIds.includes(badge.id)
        }));
        
        // Group badges by category
        const groupedBadges = badgesWithEarnedStatus.reduce((acc, badge) => {
          if (!acc[badge.category]) {
            acc[badge.category] = [];
          }
          acc[badge.category].push(badge);
          return acc;
        }, {} as Record<string, Badge[]>);
        
        setBadgesByCategory(groupedBadges);
        
        // Set active category to the first one
        if (Object.keys(groupedBadges).length > 0) {
          setActiveCategory(Object.keys(groupedBadges)[0]);
        }
      } catch (err) {
        console.error("Error fetching customization data:", err);
        setNotification({
          type: 'error',
          message: 'Failed to load customization settings'
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUserCustomization();
  }, [userId]);
  
  async function fetchDisplayBadges() {
    // Use the badges we already fetched from the API
    const userBadges = await GamificationService.getUserBadges(userId);
    
    // Convert them to the format expected by the UI
    // Interface for the badge structure from the API
    interface BadgeFromAPI {
      badge_id: string;
      name: string;
      icon: string;
      category: string;
      description: string;
      rarity: string;
      earned: boolean;
    }

    // Function implementation with types
    return userBadges.map((badge: BadgeFromAPI): Badge => ({
      id: badge.badge_id,
      name: badge.name,
      icon: badge.icon,
      category: badge.category,
      description: badge.description,
      rarity: badge.rarity,
      earned: badge.earned
    }));
  }
  
  // Handle theme changes
  const handleThemeChange = (key: keyof ThemeCustomization, value: any) => {
    setTheme(prev => ({ ...prev, [key]: value }));
  };
  
  // Toggle badge selection
  const toggleBadge = (badgeId: string) => {
    setSelectedBadges(prev => {
      if (prev.includes(badgeId)) {
        return prev.filter(id => id !== badgeId);
      } else {
        // Limit to max 10 badges
        if (prev.length >= 10) {
          setNotification({
            type: 'error',
            message: 'You can display a maximum of 10 badges'
          });
          setTimeout(() => setNotification(null), 3000);
          return prev;
        }
        return [...prev, badgeId];
      }
    });
  };
  
  // Save customizations
  const saveCustomization = async () => {
    try {
      setIsSaving(true);
      
      // Prepare data for API
      const customizationData: UserCustomization = {
        theme: theme,
        displayBadges: selectedBadges
      };
      
      // Call API to save customization
      await CustomizationService.saveUserCustomization(userId, customizationData);
      
      setNotification({
        type: 'success',
        message: 'Profile customization saved successfully!'
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error("Error saving customization:", err);
      setNotification({
        type: 'error',
        message: 'Failed to save customization settings'
      });
      // Clear error notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle>Profile Customization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Customization</CardTitle>
      </CardHeader>
      <CardContent>
        {notification && (
          <Alert className={`mb-6 ${notification.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? 
                <CheckCircle className="h-4 w-4 text-green-600" /> : 
                <AlertCircle className="h-4 w-4 text-red-600" />
              }
              <AlertDescription className={notification.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                {notification.message}
              </AlertDescription>
            </div>
          </Alert>
        )}
        
        <Tabs defaultValue="theme">
          <TabsList className="mb-6">
            <TabsTrigger value="theme">Theme & Layout</TabsTrigger>
            <TabsTrigger value="badges">Display Badges</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          {/* Theme Customization */}
          <TabsContent value="theme">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Color Scheme</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={theme.primaryColor}
                        onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                        className="w-12 h-10"
                      />
                      <span className="text-sm">{theme.primaryColor}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="accentColor"
                        type="color"
                        value={theme.accentColor}
                        onChange={(e) => handleThemeChange('accentColor', e.target.value)}
                        className="w-12 h-10"
                      />
                      <span className="text-sm">{theme.accentColor}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-3">Card Style</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div 
                    className={`p-4 border rounded-md text-center cursor-pointer ${theme.cardStyle === 'default' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
                    onClick={() => handleThemeChange('cardStyle', 'default')}
                  >
                    <div className="h-20 border rounded-lg mb-2 flex items-center justify-center">
                      Default
                    </div>
                    <div className="text-sm">Default</div>
                  </div>
                  
                  <div 
                    className={`p-4 border rounded-md text-center cursor-pointer ${theme.cardStyle === 'rounded' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
                    onClick={() => handleThemeChange('cardStyle', 'rounded')}
                  >
                    <div className="h-20 border rounded-2xl mb-2 flex items-center justify-center">
                      Rounded
                    </div>
                    <div className="text-sm">Rounded</div>
                  </div>
                  
                  <div 
                    className={`p-4 border rounded-md text-center cursor-pointer ${theme.cardStyle === 'sharp' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
                    onClick={() => handleThemeChange('cardStyle', 'sharp')}
                  >
                    <div className="h-20 border rounded-none mb-2 flex items-center justify-center">
                      Sharp
                    </div>
                    <div className="text-sm">Sharp</div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-3">Display Options</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showLevel">Show Level Progress</Label>
                    <Switch 
                      id="showLevel" 
                      checked={theme.showLevel}
                      onCheckedChange={(checked) => handleThemeChange('showLevel', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showStreaks">Show Streak Information</Label>
                    <Switch 
                      id="showStreaks" 
                      checked={theme.showStreaks}
                      onCheckedChange={(checked) => handleThemeChange('showStreaks', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showAchievements">Show Achievements Section</Label>
                    <Switch 
                      id="showAchievements" 
                      checked={theme.showAchievements}
                      onCheckedChange={(checked) => handleThemeChange('showAchievements', checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Display Badges Customization */}
          <TabsContent value="badges">
            <BadgeSelector 
                earnedBadges={earnedBadges}
                badges={Object.values(badgesByCategory).flat()}
                selectedBadges={selectedBadges}
                onChange={setSelectedBadges}
                maxBadges={10}
            />
            </TabsContent>
          
          {/* Advanced Customization */}
          <TabsContent value="advanced">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Background Pattern</h3>
                <RadioGroup 
                  value={theme.backgroundPattern || 'none'}
                  onValueChange={(value) => handleThemeChange('backgroundPattern', value)}
                  className="grid grid-cols-2 md:grid-cols-3 gap-4"
                >
                  {backgroundPatterns.map(pattern => (
                    <div key={pattern.id} className="flex items-start space-x-2">
                      <RadioGroupItem value={pattern.id} id={`pattern-${pattern.id}`} />
                      <div className="grid gap-1.5">
                        <Label htmlFor={`pattern-${pattern.id}`} className="font-normal">{pattern.name}</Label>
                        <div 
                          className="h-12 w-full border rounded-md" 
                          style={{ 
                            backgroundImage: pattern.value !== 'none' ? pattern.value : 'none',
                            backgroundSize: pattern.id === 'waves' ? '100px 20px' : '20px 20px'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-3">Font Style</h3>
                <Select 
                  value={theme.fontStyle || 'default'}
                  onValueChange={(value) => handleThemeChange('fontStyle', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a font style" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontStyles.map(font => (
                      <SelectItem 
                        key={font.id} 
                        value={font.id}
                        style={{ fontFamily: font.value }}
                      >
                        {font.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="mt-4 p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Preview:</h4>
                  <p style={{ fontFamily: fontStyles.find(f => f.id === theme.fontStyle)?.value || 'inherit' }}>
                    This is how your text will appear with the selected font style.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Preview Section */}
        <div className="mt-8 mb-8">
          <h3 className="text-lg font-medium mb-4">Preview</h3>
          <div 
            className="p-5 border transition-all"
            style={{ 
              backgroundColor: `${theme.primaryColor}10`, // 10% opacity
              borderRadius: theme.cardStyle === 'rounded' ? '1rem' : 
                           theme.cardStyle === 'sharp' ? '0' : '0.5rem',
              borderColor: theme.primaryColor,
              backgroundImage: theme.backgroundPattern && theme.backgroundPattern !== 'none' ? 
                backgroundPatterns.find(p => p.id === theme.backgroundPattern)?.value : 'none',
              backgroundSize: theme.backgroundPattern === 'waves' ? '100px 20px' : '20px 20px'
            }}
          >
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.values(badgesByCategory)
                .flat()
                .filter(badge => selectedBadges.includes(badge.id))
                .map(badge => (
                  <Badge 
                    key={badge.id}
                    style={{ 
                      backgroundColor: theme.primaryColor,
                      color: 'white'
                    }}
                  >
                    <span className="mr-2">{badge.icon}</span>
                    {badge.name}
                  </Badge>
                ))
              }
            </div>
            
            <div 
              className="bg-white p-4 rounded flex items-center gap-4"
              style={{ 
                fontFamily: fontStyles.find(f => f.id === theme.fontStyle)?.value || 'inherit',
                borderRadius: theme.cardStyle === 'rounded' ? '1rem' : 
                             theme.cardStyle === 'sharp' ? '0' : '0.5rem',
              }}
            >
              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xl">😎</span>
              </div>
              <div>
                <div className="font-bold text-lg">Your Username</div>
                <div className="text-sm text-gray-500">Level 15 Explorer</div>
              </div>
            </div>
            
            {theme.showLevel && (
              <div 
                className="mt-4 bg-white bg-opacity-70 rounded p-3"
                style={{ 
                  fontFamily: fontStyles.find(f => f.id === theme.fontStyle)?.value || 'inherit',
                  borderRadius: theme.cardStyle === 'rounded' ? '1rem' : 
                               theme.cardStyle === 'sharp' ? '0' : '0.5rem',
                }}
              >
                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{ width: '65%', backgroundColor: theme.primaryColor }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1 text-gray-600">
                  <span>2750/3000 XP</span>
                  <span>Next Level: 16</span>
                </div>
              </div>
            )}
            
            {theme.showStreaks && (
              <div 
                className="mt-3 p-3 rounded"
                style={{ 
                  backgroundColor: `${theme.accentColor}30`,
                  fontFamily: fontStyles.find(f => f.id === theme.fontStyle)?.value || 'inherit',
                  borderRadius: theme.cardStyle === 'rounded' ? '1rem' : 
                               theme.cardStyle === 'sharp' ? '0' : '0.5rem',
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔥</span>
                  <div className="text-sm">
                    <span className="font-bold">7 Day Streak!</span>
                    <div className="text-xs opacity-75">Keep it going!</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={saveCustomization} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}