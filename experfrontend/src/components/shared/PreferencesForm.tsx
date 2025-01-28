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
    const { user } = useAuth();
    const [categories, setCategories] = useState<string[]>([]);
    const [preferences, setPreferences] = useState<Preferences>({
        categories: {},
        defaultQuestionCount: 5,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // fetch categories
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

    // Fetch existing preferences
    useEffect(() => {
        const fetchPreferences = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/auth/preferences');
            if (!response.ok) throw new Error('Failed to fetch preferences');
            const data = await response.json();
            setPreferences(data);
        } catch (error) {
            setError('Failed to fetch preferences');
        }
        };
        if (user) {
        fetchPreferences();
        }
    }, [user]);

    // save Preferences
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:8080/api/auth/preferences', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(preferences),
              });        

              if (!response.ok) throw new Error('Failed to save preferences');

              // Show success message or notification
              alert('Preferences updated successfully!');
            } catch (error) {
                setError(error instanceof Error ? error.message : 'Failed to update preferences');
            } finally {
                setLoading(false);
            }
    };

    return (
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <h2 className="text-2xl font-bold">Quiz Preferences</h2>
              {error && <p className="text-red-500">{error}</p>}
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
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Preferences'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      );
    }