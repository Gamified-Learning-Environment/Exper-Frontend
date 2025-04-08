const API_URL = process.env.NEXT_PUBLIC_GAMIFICATION_SERVICE_URL || 'http://localhost:9091/api';
export interface UserCustomization {
  theme: {
    primaryColor: string;
    accentColor: string;
    cardStyle: 'default' | 'rounded' | 'sharp';
    showLevel: boolean;
    showStreaks: boolean;
    showAchievements: boolean;
    backgroundPattern?: string;
    fontStyle?: string;
  };
  displayBadges: string[];
}

export class CustomizationService {
  static async getUserCustomization(userId: string): Promise<UserCustomization> {
    try {
      const response = await fetch(`${API_URL}/player/${userId}/customization`);
      
      if (!response.ok) {
        // If the user doesn't have customizations yet, return defaults
        if (response.status === 404) {
          return this.getDefaultCustomization();
        }
        throw new Error('Failed to fetch customization');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user customization:', error);
      // Return default customization if there's an error
      return this.getDefaultCustomization();
    }
  }
  
  static async saveUserCustomization(userId: string, data: UserCustomization): Promise<UserCustomization> {
    try {
      const response = await fetch(`${API_URL}/player/${userId}/customization`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to save customization');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving customization:', error);
      throw error;
    }
  }
  
  static getDefaultCustomization(): UserCustomization {
    return {
      theme: {
        primaryColor: '#8b5cf6',
        accentColor: '#f0abfc',
        cardStyle: 'default',
        showLevel: true,
        showStreaks: true,
        showAchievements: true,
        backgroundPattern: 'none',
        fontStyle: 'default'
      },
      displayBadges: []
    };
  }
}