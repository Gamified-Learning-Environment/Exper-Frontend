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
      return await response.json();
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

      if (!activeCampaign) return null;
        
        // Format to match frontend interface
        return {
            id: activeCampaign.campaign.campaign_id,
            title: activeCampaign.campaign.title,
            description: activeCampaign.campaign.description,
            theme: {
                primaryColor: activeCampaign.campaign.theme.primaryColor,
                secondaryColor: activeCampaign.campaign.theme.secondaryColor,
                backgroundImage: activeCampaign.campaign.theme.backgroundImage || '',
                icon: ''
            },
            quests: activeCampaign.quests.map((q: any) => ({
                id: q.id,
                title: q.title,
                description: q.description,
                completed: q.completed,
                locked: q.order > activeCampaign.currentQuestIndex,
                progress: q.completed ? 100 : 0,
                objectives: [],
                rewards: { xp: 0 }
            })),
            progress: activeCampaign.progress,
            currentQuestIndex: activeCampaign.currentQuestIndex,
            completed: false
        };
    } catch (error) {
      console.error('Error fetching user campaigns:', error);
      return [];
    }
  }
  
  static async setActiveCampaign(userId: string, campaignId: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/campaigns/${campaignId}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to activate campaign');
      return await response.json();
    } catch (error) {
      console.error('Error activating campaign:', error);
      return { success: false, error: 'Failed to activate campaign' };
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
        const response = await fetch(`${API_URL}/users/${userId}/campaigns/${campaignId}/activate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to activate campaign');
        return await response.json();
    } catch (error) {
        console.error('Error activating campaign:', error);
        return { success: false, error: 'Failed to activate campaign' };
    }
  }
}