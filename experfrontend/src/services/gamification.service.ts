// Gamification service for handling player stats, experience, streaks, achievements, and challenges

const API_URL = 'http://localhost:9091/api';

export class GamificationService {
    
  static async getPlayerStats(userId: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/stats`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch player stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching player stats:', error);
      // Return default stats
      return {
        level: 1,
        xp: 0,
        totalXpRequired: 500,
        streakDays: 0,
        quizzesCompleted: 0,
        quizzesPerfect: 0,
        totalAchievements: 0,
        categoryProgress: []
      };
    }
  }
    
  static async addExperience(userId: string, xp: number, category?: string): Promise<any> {
    try {
      console.log(`Calling gamification service at ${API_URL}/player/${userId}/xp`);
      const response = await fetch(`${API_URL}/player/${userId}/xp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xp, category }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response error:', response.status, errorText);
        throw new Error(`Server error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding experience:', error);
      // Return a default response instead of throwing
      return {
        xp_added: xp,
        new_xp: xp,
        new_level: 1,
        level_up: false
      };
    }
  }
    
  static async updateStreak(userId: string, category?: string): Promise<any> {
    try {
      console.log(`Calling gamification service at ${API_URL}/player/${userId}/streak`);
      // Fix: Add "player" to the path
      const response = await fetch(`${API_URL}/player/${userId}/streak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response error:', response.status, errorText);
        throw new Error(`Server error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating streak:', error);
      // Return a default response instead of throwing
      return {
        current_streak: 1,
        highest_streak: 1
      };
    }
  }
    
  static async getAchievements() {
    const response = await fetch(`${API_URL}/achievements`, {
      credentials: 'include'
    });
    return await response.json();
  }
    
  static async getUserAchievements(userId: string): Promise<any[]> {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/achievements`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch user achievements');
      return await response.json();
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      return [];
    }
  }

  static async checkAchievements(userId: string, data: any): Promise<any> {
    try {
      console.log('Checking achievements with data:', data);
      const response = await fetch(`${API_URL}/player/${userId}/check-achievements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response error:', response.status, errorText);
        // Return empty data instead of throwing to prevent quiz flow from breaking
        return { awarded_achievements: [] };
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error checking achievements:', error);
      return { awarded_achievements: [] };
    }
  }
    
  static async awardAchievement(userId: string, achievementId: string): Promise<any> {
    try {
      console.log(`Calling gamification service at ${API_URL}/player/${userId}/achievements`);
      // Fix: Add "player" to the path
      const response = await fetch(`${API_URL}/player/${userId}/achievements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Fix: Change achievement_Id to achievement_id
        body: JSON.stringify({ achievement_id: achievementId }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response error:', response.status, errorText);
        throw new Error(`Server error ${response.status}: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error awarding achievement:', error);
      // Return a default response instead of throwing
      return {
        achievement: {
          title: "Achievement Unlocked",
          description: "You earned an achievement"
        },
        xp_earned: 50,
        level_up: false
      };
    }
  }

  static async getCampaigns(userId: string): Promise<any[]> {
    try {
      const url = userId 
          ? `${API_URL}/campaigns?user_id=${userId}`
          : `${API_URL}/campaigns`;
          
      const response = await fetch(url, {
          credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      const campaigns = await response.json();

      // Ensure each campaign has the expected ID field
      return campaigns.map((campaign: any) => ({
        ...campaign,
        id: campaign.campaign_id || campaign._id,
      }));
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        return [];
    }
  }
  
  static async getUserActiveCampaign(userId: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/campaigns`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch user campaigns');

      // Get all campaigns
      const campaigns = await response.json();
        
      // Find the active campaign
      const activeCampaign = campaigns.find((campaign: any) => campaign.isActive === true);
      console.log("Found active campaign:", activeCampaign);

      if (!activeCampaign) return null;

      // Make sure quests is an array
      const quests = activeCampaign.quests || activeCampaign.campaign?.quests || [];
        
      // Format to match frontend interface
      return {
        id: activeCampaign.campaign?.campaign_id || activeCampaign.campaign_id,
        title: activeCampaign.campaign?.title || activeCampaign.title,
        description: activeCampaign.campaign?.description || activeCampaign.description,
        theme: {
            primaryColor: activeCampaign.campaign?.theme?.primaryColor || '#6366f1',
            secondaryColor: activeCampaign.campaign?.theme?.secondaryColor || '#8b5cf6',
            backgroundImage: activeCampaign.campaign?.theme?.backgroundImage || '',
            icon: ''
        },
        quests: Array.isArray(quests) ? quests.map((q: any) => ({
            id: q.quest_id || q.id,
            title: q.title,
            description: q.description,
            completed: q.completed || false,
            locked: q.order > (activeCampaign.currentQuestIndex || 0),
            progress: q.completed ? 100 : 0,
            objectives: q.objectives || []
        })) : [],
        progress: activeCampaign.progress || 0,
        currentQuestIndex: activeCampaign.currentQuestIndex || 0,
        completed: activeCampaign.completed || false
    };
    } catch (error) {
      console.error('Error fetching user campaigns:', error);
      return [];
    }
  }
  
  static async updateQuestProgress(userId: string, questId: string, objectiveType: string, progress: number = 1): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/quests/${questId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objective_type: objectiveType, progress }),
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to update quest progress');
      return await response.json();
    } catch (error) {
      console.error('Error updating quest progress:', error);
      return { success: false, error: 'Failed to update quest progress' };
    }
  }

  static async activateCampaign(userId: string, campaignId: string): Promise<any> {
    try {
        console.log(`Activating campaign ${campaignId} for user ${userId}`);

        // Get the complete campaign object first to get the correct ID
        const response1 = await fetch(`${API_URL}/campaigns/${campaignId}`, {
          credentials: 'include'
        });

        if (!response1.ok) {
          // If direct access fails, try alternate endpoint
          const campaigns = await this.getCampaigns(userId);
          const campaign = campaigns.find(c => c._id === campaignId || c.id === campaignId || c.campaign_id === campaignId);
          
          if (campaign) {
            // Use the proper campaign_id from the found campaign
            campaignId = campaign.campaign_id || campaignId;
          }
        } else {
          // Use campaign_id from response if available
          const campaignData = await response1.json();
          if (campaignData.campaign_id) {
            campaignId = campaignData.campaign_id;
          }
        }
        
        // Now use the proper ID for activation
        console.log(`Using campaign ID for activation: ${campaignId}`);
        const response = await fetch(`${API_URL}/users/${userId}/campaigns/${campaignId}/activate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });
        
        const data = await response.text();
        console.log("API response:", data);
        
        
        if (!response.ok) {
          console.error(`Failed to activate campaign: ${response.status} ${response.statusText}`);
          console.error("Response data:", data);
          throw new Error(`Failed to activate campaign: ${response.status}`);
        }
        // Try to parse as JSON if possible
        try {
          return JSON.parse(data);
        } catch (e) {
          return { success: true, message: data };
        }
    } catch (error) {
        console.error('Error activating campaign:', error);
        return { success: false, error: 'Failed to activate campaign' };
    }
  }

  // Check and update quest progress based on objective type and category
  static async checkAndUpdateQuestProgress(userId: string, objectiveType: string, progress = 1, category?: string): Promise<any> {
    try {
      // Get active campaign and current quest
      const activeCampaign = await this.getUserActiveCampaign(userId);
      if (!activeCampaign || !activeCampaign.quests || activeCampaign.quests.length === 0) return;
      
      // Find current quest
      const currentQuest = activeCampaign.quests.find(
        ( q: { completed: any; id: any; }) => !q.completed && q.id === activeCampaign.currentQuestId
      );
      
      if (!currentQuest) return;
      
      // Check if quest has this objective type
      const hasObjective = currentQuest.objectives?.some((obj: { type: string | string[]; category: string; }) => {
        // Check if category-specific objective
        if (category && obj.type.includes('category') && obj.category === category) {
          return true;
        }
        // Check regular objective
        return obj.type === objectiveType;
      });
      
      if (hasObjective) {
        // Determine correct objective type including category if needed
        const finalObjectiveType = category ? `${objectiveType}_category_${category}` : objectiveType;
        
        // Update quest progress
        await this.updateQuestProgress(userId, currentQuest.id, finalObjectiveType, progress);
        console.log(`Updated progress for ${finalObjectiveType}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Failed to check and update quest progress:", error);
      return false;
    }
  }
}