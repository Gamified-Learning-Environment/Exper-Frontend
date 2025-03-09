// Complete the GamificationService class
export class GamificationService {
    private static BASE_URL = 'http://localhost:9091/api';
    
    static async getPlayerProfile(userId: string) {
      const response = await fetch(`${this.BASE_URL}/player/${userId}`, {
        credentials: 'include'
      });
      return await response.json();
    }
    
    static async addExperience(userId: string, amount: number, category?: string) {
      const response = await fetch(`${this.BASE_URL}/player/${userId}/xp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xp: amount, category }),
        credentials: 'include'
      });
      return await response.json();
    }
    
    static async updateStreak(userId: string, category?: string) {
      const response = await fetch(`${this.BASE_URL}/player/${userId}/streak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
        credentials: 'include'
      });
      return await response.json();
    }
    
    static async getAchievements() {
      const response = await fetch(`${this.BASE_URL}/achievements`, {
        credentials: 'include'
      });
      return await response.json();
    }
    
    static async getPlayerAchievements(userId: string) {
      const response = await fetch(`${this.BASE_URL}/player/${userId}/achievements`, {
        credentials: 'include'
      });
      return await response.json();
    }
    
    static async awardAchievement(userId: string, achievementId: string) {
      const response = await fetch(`${this.BASE_URL}/player/${userId}/achievements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ achievement_id: achievementId }),
        credentials: 'include'
      });
      return await response.json();
    }
    
    static async getActiveChallenges() {
      const response = await fetch(`${this.BASE_URL}/challenges`, {
        credentials: 'include'
      });
      return await response.json();
    }
    
    static async completeChallenge(userId: string, challengeId: string) {
      const response = await fetch(`${this.BASE_URL}/player/${userId}/challenges/${challengeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      return await response.json();
    }
  }