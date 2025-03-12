// Campaign component for tracking an managing user progress in campaigns

'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { GamificationService } from '@/services/gamification.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sword, Star, MapPin, Trophy, Gift, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { CampaignMap } from './CampaignMap';
import { QuestCard } from './QuestCard';
import { RewardDisplay } from './RewardDisplay';
import { CampaignCard } from './CampaignCard';
import { CampaignSelector } from './CampaignSelector';
import { QuestRewardPopup } from './QuestRewardPopup';
import { motion } from 'framer-motion';
import { QuestProgressManager } from '@/services/QuestProgressManager';

// Campaign and quest interfaces
interface Quest {
  id: string;
  title: string;
  description: string;
  objectives?: {
    type: string;
    description: string;
    current: number;
    required: number;
  }[];
  rewards?: {
    xp: number;
    customization?: {
      type: string;
      id: string;
      name: string;
      icon: string;
    }[];
  };
  completed: boolean;
  locked: boolean;
}

interface Campaign {
    id: string;
    title: string;
    description: string;
    theme: {
        primaryColor: string;
        secondaryColor: string;
        icon: string;
        backgroundImage: string;
    };
    quests: Quest[];
    progress: number;
    currentQuestIndex: number;
    completed: boolean;
}

export default function Campaigns() {
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("active");
    const [rewardPopup, setRewardPopup] = useState<{
      isOpen: boolean;
      quest: any;
    }>({
      isOpen: false,
      quest: null
    });

    useEffect(() => { // Load campaigns and active campaign on component mount
        const loadCampaigns = async () => {
          if (!user?._id) return;
          
          try {
            setIsLoading(true);
            // Get all available campaigns
            const availableCampaigns = await GamificationService.getCampaigns(user._id);
            setCampaigns(availableCampaigns || []);
            
            // Get user's active campaign
            const userActiveCampaign = await GamificationService.getUserActiveCampaign(user._id);      
            setActiveCampaign(userActiveCampaign);

            console.log('Loaded campaigns:', availableCampaigns);
            console.log('Active campaign:', userActiveCampaign);
          } catch (err) {
            console.error("Error loading campaigns:", err);
          } finally {
            setIsLoading(false);
          }
        };
        
        loadCampaigns();
    }, [user?._id]);

    const activateCampaign = async (campaignId: string) => {
        if (!user?._id) {
          console.error("Cannot activate campaign: User ID is undefined");
          return;
        }

        console.log(`Activating campaign ${campaignId} for user ${user._id}`);
        
        try {
          setIsLoading(true);
          const result = await GamificationService.activateCampaign(user._id, campaignId);
          console.log("Activation result:", result);
          
          // Refresh the active campaign
          const updatedActiveCampaign = await GamificationService.getUserActiveCampaign(user._id);
          console.log("Updated active campaign:", updatedActiveCampaign);
          
          setActiveCampaign(updatedActiveCampaign);
          setActiveTab("active");
        } catch (err) {
            console.error("Error activating campaign:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshCampaigns = async () => {
        if (!user?._id) return;
        
        try {
            setIsLoading(true);
            const availableCampaigns = await GamificationService.getCampaigns(user._id);
            const userActiveCampaign = await GamificationService.getUserActiveCampaign(user._id);
            
            setCampaigns(availableCampaigns);
            setActiveCampaign(userActiveCampaign);
        } catch (err) {
            console.error("Error refreshing campaigns:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const startQuest = async (questId: string) => {
      if (!user?._id || !activeCampaign) return;
      
      try {
        // If the quest is the current quest, you can use this to track 
        // a "start_quest" action if needed
        if (activeCampaign.quests[activeCampaign.currentQuestIndex].id === questId) {
          await QuestProgressManager.trackAction({
            userId: user._id,
            actionType: 'start_quest' as any,
            metadata: { questId }
          });
          
          // Refresh campaigns to get updated quest progress
          refreshCampaigns();
        }
      } catch (error) {
        console.error("Error starting quest:", error);
      }
    };

    if (isLoading) {
        return (
          <div className="flex justify-center py-12">
            <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
          </div>
        );
    }
    return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-6 shadow-lg text-white">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sword className="h-6 w-6" />
              Campaign Adventures
            </h2>
            <p className="mt-2 text-white/90">Embark on quests, earn rewards, and become a quiz legend!</p>
          </div>
          
          <Tabs 
                value={activeTab} 
                onValueChange={(value) => {
                    setActiveTab(value);
                    if (value === "active" || value === "completed") {
                        refreshCampaigns();
                    }
                }} 
                className="w-full"
            >
            <TabsList className="mb-6">
              <TabsTrigger value="active" className="flex items-center gap-2">
                <Star className="w-4 h-4" /> Active Campaign
              </TabsTrigger>
              <TabsTrigger value="available" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Available Campaigns
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" /> Completed Campaigns
              </TabsTrigger>
            </TabsList>
            
            {/* Active Campaign Tab */}
            <TabsContent value="active" className="space-y-8">
              {activeCampaign ? (
                <>
                  <div className="relative rounded-xl overflow-hidden">
                    <div 
                      className="h-48 bg-cover bg-center" 
                      style={{ 
                        backgroundImage: `url(${activeCampaign.theme.backgroundImage})`,
                        backgroundColor: activeCampaign.theme.primaryColor 
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                      <h3 className="text-3xl font-bold text-white">{activeCampaign.title}</h3>
                      <p className="text-white/80 mt-2">{activeCampaign.description}</p>
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-white mb-1">
                          <span>Progress</span>
                          <span>{activeCampaign.progress}%</span>
                        </div>
                        <Progress 
                          value={activeCampaign.progress} 
                          className="h-2.5 bg-white/20" 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-4">
                    <h3 className="text-xl font-bold text-purple-800 mb-6">Your Quest Journey</h3>
                    <CampaignMap campaign={activeCampaign} />
                  </div>
                  
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-purple-800">Current Quest</h3>
                    <QuestCard 
                      quest={activeCampaign.quests[activeCampaign.currentQuestIndex]}
                      index={activeCampaign.currentQuestIndex}
                      themeColor={activeCampaign.theme.primaryColor}
                      onStartQuest={startQuest}
                    />
                    
                    {activeCampaign.currentQuestIndex > 0 && (
                      <div className="mt-8">
                        <h3 className="text-xl font-bold text-purple-800 mb-4">Completed Quests</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {activeCampaign.quests
                            .filter((q) => q.completed)
                            .map((quest, index) => (
                              <QuestCard 
                                key={quest.id} 
                                quest={quest}
                                index={index}
                                themeColor={activeCampaign.theme.primaryColor}
                                isCompleted
                              />
                            ))}
                        </div>
                      </div>
                    )}
                    
                    {activeCampaign.currentQuestIndex < activeCampaign.quests.length - 1 && (
                      <div className="mt-8">
                        <h3 className="text-xl font-bold text-purple-800 mb-4">Upcoming Quests</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {activeCampaign.quests
                            .slice(activeCampaign.currentQuestIndex + 1)
                            .map((quest, index) => (
                              <QuestCard 
                                key={quest.id} 
                                quest={quest}
                                index={activeCampaign.currentQuestIndex + index + 1}
                                themeColor={activeCampaign.theme.primaryColor}
                                isLocked
                              />
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-16 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border-2 border-dashed border-purple-200">
                  <MapPin className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-purple-800">No Active Campaign</h3>
                  <p className="text-purple-600 mt-2">Explore available campaigns and start your journey!</p>
                  <Button 
                    onClick={() => setActiveTab("available")}
                    className="mt-6 bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                  >
                    Find a Campaign <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </TabsContent>
            
            {/* Available Campaigns Tab */}
            <TabsContent value="available" className="space-y-6">
              {campaigns.filter(c => !c.completed).length > 0 ? (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-purple-100">
                  <CampaignSelector 
                    campaigns={campaigns.filter(c => !c.completed)} 
                    onSelect={activateCampaign} 
                    activeId={activeCampaign?.id} 
                  />
                </div>
              ) : (
                <div className="text-center py-16 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border-2 border-dashed border-purple-200">
                  <MapPin className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-purple-800">No Campaigns Available</h3>
                  <p className="text-purple-600 mt-2">You've completed all available campaigns!</p>
                </div>
              )}
            </TabsContent>
            
            {/* Completed Campaigns Tab */}
            <TabsContent value="completed" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {campaigns
                  .filter(c => c.completed)
                  .map((campaign, index) => (
                    <CampaignCard 
                      key={campaign.id || `campaign-${index}`} 
                      campaign={campaign} 
                      isCompleted
                    />
                  ))}
              </div>
              
              {campaigns.filter(c => c.completed).length === 0 && (
                <div className="text-center py-16 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border-2 border-dashed border-purple-200">
                  <Trophy className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-purple-800">No Completed Campaigns</h3>
                  <p className="text-purple-600 mt-2">Start your first campaign adventure!</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {rewardPopup.quest && (
            <QuestRewardPopup
              isOpen={rewardPopup.isOpen}
              onClose={() => setRewardPopup({ isOpen: false, quest: rewardPopup.quest })}
              quest={rewardPopup.quest}
            />
          )}

        </div>
      );
    }
