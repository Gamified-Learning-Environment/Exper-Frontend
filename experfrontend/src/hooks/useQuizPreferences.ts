import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth.context';

export function useQuizPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<{
    defaultQuestionCount: number;
    categories: {
      [key: string]: {
        difficulty: 'beginner' | 'intermediate' | 'expert';
        questionCount: number;
      };
    };
  }>({
    defaultQuestionCount: 5,
    categories: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:8080/api/auth/preferences', {
          credentials: 'include', // Important for session cookies
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch preferences');
        }

        const data = await response.json();
        setPreferences(data);
      } catch (error) {
        console.error('Error loading preferences:', error);
        setError(error instanceof Error ? error.message : 'Failed to load preferences');
        // Set default preferences on error
        setPreferences({
          defaultQuestionCount: 5,
          categories: {}
        });
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  return { preferences, loading, error };
}