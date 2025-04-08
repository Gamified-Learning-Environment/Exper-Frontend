'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { Button } from '../ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';

interface CategoryPreference {
    difficulty: 'beginner' | 'intermediate' | 'expert';
    questionCount: number;
}

interface Preferences {
    categories: {
        [key: string]: CategoryPreference;
    };
    defaultQuestionCount: number;
}

export default function PreferencesForm() {
  const { user, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<Preferences>({
      categories: {},
      defaultQuestionCount: 5,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Load categories
  useEffect(() => {
      const fetchCategories = async () => {
          try {
              const response = await fetch('http://localhost:9090/api/categories');
              if (!response.ok) throw new Error('Failed to fetch categories');
              const data = await response.json();
              setCategories(data);
          } catch (error) {
              console.error('Error fetching categories:', error);
          }
      };
      fetchCategories();
  }, []);

  // Load existing preferences
  useEffect(() => {
      const loadPreferences = async () => {
          if (!isAuthenticated || !user) {
              setLoading(false);
              return;
          }

          try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:8080';
              const response = await fetch(`${apiBaseUrl}/api/auth/preferences`, {
                  credentials: 'include',
                  method: 'GET',
                  headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json',
                  }
              });

              if (!response.ok) {
                  if (response.status === 401) {
                    setError('Session expired. Please log in again.');
                    return;
                  }
                  throw new Error('Failed to load preferences');
              }

              const data = await response.json();
              if (data.quizPreferences) {
                setPreferences({
                  defaultQuestionCount: data.quizPreferences.defaultQuestionCount || 5,
                  categories: data.quizPreferences.category || {}
                });
              }
          } catch (error) {
              console.error('Error loading preferences:', error);
              setError(error instanceof Error ? error.message : 'Failed to load preferences');
          } finally {
              setLoading(false);
          }
      };

      loadPreferences();
  }, [user, isAuthenticated]);

  // Save preferences
  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) {
          setError('You must be logged in to save preferences');
          return;
      }

      setSaveStatus('saving');
      setError(null);

      try {
          // Format preferences to match backend structure
          const preferencesData = {
              quizPreferences: {
                  category: preferences.categories,
                  defaultQuestionCount: preferences.defaultQuestionCount,
              }
          };

          const apiBaseUrl = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:8080';
          const response = await fetch(`${apiBaseUrl}/api/auth/preferences`, {
              method: 'PUT',
              credentials: 'include',
              headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(preferencesData)
          });

          if (!response.ok) {
              const errorData = await response.json().catch(() => null);
              throw new Error(errorData?.message || 'Failed to save preferences');
          }

          setSaveStatus('success');
          setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (error) {
          setSaveStatus('error');
          setError(error instanceof Error ? error.message : 'Failed to save preferences');
      }
  };

    if (!user) {
        return (
            <Card>
                <CardContent>
                    <p className="text-center text-gray-600">
                        Please log in to manage your quiz preferences.
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Add a loading state display
    if (loading) {
        return (
        <Card>
            <CardContent>
            <p className="text-center text-gray-600">Loading preferences...</p>
            </CardContent>
        </Card>
        );
    }

    return (
        <Card>
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <h2 className="text-2xl font-bold">Quiz Preferences</h2>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}
                    {saveStatus === 'success' && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                            Preferences saved successfully!
                        </div>
                    )}
                </CardHeader>
                
                <CardContent>
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Default Question Count</h3>
                            <Slider
                                value={[preferences.defaultQuestionCount]}
                                onValueChange={(value) => setPreferences({
                                    ...preferences,
                                    defaultQuestionCount: value[0]
                                })}
                                min={1}
                                max={20}
                                step={1}
                            />
                            <span className="text-sm text-gray-500">
                                {preferences.defaultQuestionCount} questions
                            </span>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Category Preferences</h3>
                            {categories.map((category) => (
                                <div key={category} className="space-y-2 p-4 border rounded">
                                    <h4 className="font-medium">{category}</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm">Difficulty</label>
                                            <Select
                                                value={preferences.categories[category]?.difficulty || 'intermediate'}
                                                onValueChange={(value: 'beginner' | 'intermediate' | 'expert') => 
                                                    setPreferences({
                                                        ...preferences,
                                                        categories: {
                                                            ...preferences.categories,
                                                            [category]: {
                                                                ...preferences.categories[category],
                                                                difficulty: value
                                                            }
                                                        }
                                                    })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select difficulty" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="beginner">Beginner</SelectItem>
                                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                                    <SelectItem value="expert">Expert</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        
                                        <div>
                                            <label className="text-sm">Question Count</label>
                                            <Slider
                                                value={[preferences.categories[category]?.questionCount || 5]}
                                                onValueChange={(value) => setPreferences({
                                                    ...preferences,
                                                    categories: {
                                                        ...preferences.categories,
                                                        [category]: {
                                                            ...preferences.categories[category],
                                                            questionCount: value[0]
                                                        }
                                                    }
                                                })}
                                                min={1}
                                                max={20}
                                                step={1}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>

                <CardFooter>
                    <Button 
                        type="submit" 
                        disabled={saveStatus === 'saving'}
                        className={`${
                            saveStatus === 'saving' 
                                ? 'opacity-50 cursor-not-allowed' 
                                : ''
                        }`}
                    >
                        {saveStatus === 'saving' ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin">⌛</span> 
                                Saving...
                            </span>
                        ) : 'Save Preferences'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}