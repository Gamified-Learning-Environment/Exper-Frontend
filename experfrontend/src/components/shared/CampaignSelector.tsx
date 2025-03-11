import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface CampaignSelectorProps {
    campaigns: Array<{
        id: string;
        title: string;
        description: string;
        theme: {
            primaryColor: string;
            secondaryColor: string;
            backgroundImage?: string;
        };
        quests: any[];
        progress: number;
        }>;
    onSelect: (campaignId: string) => void;
    activeId?: string;
}

export function CampaignSelector({ campaigns, onSelect, activeId }: CampaignSelectorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // If there's an active campaign, set it as the current one
    if (activeId) {
      const activeIndex = campaigns.findIndex(c => c.id === activeId);
      if (activeIndex >= 0) {
        setCurrentIndex(activeIndex);
      }
    }
  }, [campaigns, activeId]);
  
  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No campaigns available</p>
      </div>
    );
  }
  
  const campaign = campaigns[currentIndex];
  
  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % campaigns.length);
  };
  
  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + campaigns.length) % campaigns.length);
  };

  const isActive = campaign.id === activeId;
  const questCount = campaign.quests?.length || 0; // Safely access quests length

  console.log("Campaign selector - activeId:", activeId);
  console.log("Current campaign id:", campaign?.id);
  console.log("Is active:", isActive);
  
  return (
    <div className="py-6 relative">
      {/* Navigation buttons */}
      {campaigns.length > 1 && (
        <>
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 border-purple-200 shadow-md hover:bg-purple-50"
            onClick={goPrev}
          >
            <ChevronLeft className="h-5 w-5 text-purple-700" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 border-purple-200 shadow-md hover:bg-purple-50"
            onClick={goNext}
          >
            <ChevronRight className="h-5 w-5 text-purple-700" />
          </Button>
        </>
      )}
      
      {/* Campaign card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={campaign.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="overflow-hidden border-0 shadow-lg">
            <div 
              className="h-64 bg-cover bg-center relative"
              style={{ 
                backgroundImage: campaign.theme.backgroundImage ? 
                  `url(${campaign.theme.backgroundImage})` : 
                  `linear-gradient(135deg, ${campaign.theme.primaryColor || '#6366f1'}, ${campaign.theme.secondaryColor || '#8b5cf6'})`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <h2 className="text-3xl font-bold mb-2">{campaign.title}</h2>
                  <p className="text-white/80 mb-4 text-lg">{campaign.description}</p>
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                      {questCount} Quests
                    </div>
                    {isActive && (
                      <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-900" />
                        Active
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">Quests</div>
                  <div className="text-2xl font-bold text-purple-900">{questCount}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">Progress</div>
                  <div className="text-2xl font-bold text-purple-900">{campaign.progress}%</div>
                </div>
                <div className="text-center hidden sm:block">
                  <div className="text-sm text-gray-500 mb-1">Rewards</div>
                  <div className="text-2xl font-bold text-amber-500">✨</div>
                </div>
              </div>
              
              <Progress
                value={campaign.progress || 0}
                className="h-2.5 mb-6"
              />
              
              <Button
                className="w-full py-6 text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all"
                size="lg"
                disabled={isActive}
                onClick={() => {
                  if (campaign?.id) {
                    console.log("Starting campaign with ID:", campaign.id);
                    onSelect(campaign.id);
                  } else {
                    console.error("Campaign ID is undefined");
                  }
                }}
              >
                {isActive ? (
                  <>
                    Current Campaign <Star className="ml-2 h-4 w-4 fill-white" />
                  </>
                ) : (
                  <>
                    Start Adventure <Play className="ml-2 h-4 w-4 fill-white" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
      
      {/* Campaign indicators */}
      {campaigns.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {campaigns.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === currentIndex 
                  ? 'bg-purple-600 w-6'
                  : 'bg-purple-200 hover:bg-purple-300'
              }`}
              aria-label={`Go to campaign ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}