'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import Image from 'next/image';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from '@/contexts/auth.context';
import { UserIcon, StarIcon, PencilIcon, TrashIcon, ExternalLinkIcon } from 'lucide-react';
import { Search } from 'lucide-react';
import { Input } from '../ui/input'; 

const API_URL = process.env.NEXT_PUBLIC_QUIZ_SERVICE_URL || 'http://localhost:9090';

// Quiz Question interface
interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string | string[];
}

// Quiz interface
interface Quiz {
  _id: string;
  id: string;
  title: string;
  description: string;
  category?: string;
  difficulty?: string;
  questions: QuizQuestion[];
  userId?: string;
}

// QuizList component
export default function QuizList({ userOnly= false }: {userOnly?: boolean}) { // userOnly prop for checking user quizzes
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // State to store user information
  const [userMap, setUserMap] = useState<Record<string, { username: string }>>({});

  // Filter view mode
  const [viewMode, setViewMode] = useState<'all' | 'mine' | 'community'>('all');

  // QuizList header colors
  const gradientColors = [
    "from-purple-500 to-indigo-600", // Original purple
    "from-blue-500 to-cyan-600",     // Blue
    "from-green-500 to-emerald-600", // Green
    "from-orange-500 to-red-600",    // Orange
    "from-pink-500 to-rose-600",     // Pink
    "from-teal-500 to-cyan-600",     // Teal
  ];

  // Add these handler functions before the return statement
  const handlePreview = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQuiz(null);
  };

  const handleDelete = async (quizId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/quiz/${quizId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete quiz');
      }

      // Close the modal
      setIsModalOpen(false);

      // Remove the deleted quiz from the list
      setQuizzes(quizzes.filter((quiz) => quiz.id !== quizId));

      // Refresh the page
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete quiz');
    }
  };

  const handleClone = async (quizToClone: Quiz) => {
    try {
      // Create a clone object without the ID fields
      const cloneData = {
        title: `Copy of ${quizToClone.title}`,
        description: quizToClone.description,
        category: quizToClone.category,
        difficulty: quizToClone.difficulty,
        userId: user?._id, // Set current user as owner
        questions: quizToClone.questions.map(q => ({
          ...q,
          id: undefined // Let backend generate new IDs
        }))
      };
      
      // Make API call to create the cloned quiz
      const response = await fetch(`${API_URL}/api/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cloneData),
      });
  
      if (!response.ok) {
        throw new Error('Failed to clone quiz');
      }
  
      const clonedQuiz = await response.json();
      
      // Close modal if open
      if (isModalOpen) {
        setIsModalOpen(false);
      }
      
      // Show success message and redirect to edit page
      alert('Quiz cloned successfully! You can now edit your copy.');
      router.push(`/quiz/edit/${clonedQuiz._id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to clone quiz');
    }
  };

  // Filter quizzes based on search term, category, and user
  const filterQuizzes = (quiz: Quiz) => {
    // Search term filter - check if search term is in title or description
    const matchesSearch = !searchTerm || 
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Category filter
    const matchesCategory = !selectedCategory || 
      selectedCategory === 'all' || 
      quiz.category === selectedCategory;
    
    // User filter based on view mode
    let matchesUser = true;
    if (viewMode === 'mine') {
      matchesUser = user ? quiz.userId === user._id : false;
    } else if (viewMode === 'community') {
      matchesUser = user ? quiz.userId !== user._id : true;
    } else if (viewMode === 'all' && !userOnly) {
      // In 'all' view on the main page, apply specific section filtering later
      matchesUser = true;
    } else if (userOnly) {
      // On userOnly pages, only show user's quizzes
      matchesUser = user ? quiz.userId === user._id : false;
    }
    
    return matchesSearch && matchesCategory && matchesUser;
  };

  // Function to fetch user data for all quiz creators
  useEffect(() => {
    async function fetchUserData() {
      if (!quizzes.length) return;
      
      try {
        // Get unique user IDs from quizzes
        const userIds = Array.from(new Set(
          quizzes.filter(quiz => quiz.userId && quiz.userId !== user?._id)
            .map(quiz => quiz.userId)
        ));
        
        if (!userIds.length) return;
        
        // Create a map of promises for each user
        const userPromises = userIds.map(async (userId) => {
          try { 
            const apiBaseUrl = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:8080';
            const response = await fetch(`${apiBaseUrl}/api/auth/users/${userId}`);
            if (!response.ok) return [userId, { username: 'Unknown User' }];
            
            const userData = await response.json();
            return [userId, { 
              username: userData.username || userData.email?.split('@')[0] || 'Unknown User' 
            }];
          } catch (err) {
            console.error("Error fetching user data:", err);
            return [userId, { username: 'Unknown User' }];
          }
        });
        
        // Resolve all promises
        const userEntries = await Promise.all(userPromises);
        const newUserMap = Object.fromEntries(userEntries);
        
        setUserMap(newUserMap);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    }
    
    fetchUserData();
  }, [quizzes, user]);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch(`${API_URL}/api/categories`);
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }
    fetchCategories();
  }, []);

  // Fetch quizzes with optional category filter
  useEffect(() => {
    async function fetchQuizzes() {
      try {
        let url = `${API_URL}/api/quizzes`;
        
        // Category filter if selected
        if (selectedCategory && selectedCategory !== 'all') {
          url += `/category/${selectedCategory}`;
        }
        
        // User filter if userOnly is true
        if (userOnly && user?._id) {
          url += `${url.includes('?') ? '&' : '?'}userId=${user._id}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch quizzes');
        }
        const data = await response.json();
        setQuizzes(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch quizzes');
      } finally {
        setLoading(false);
      }
    }
    if (!userOnly || (userOnly && user)) {
      fetchQuizzes();
    }
  }, [selectedCategory, user, userOnly]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-purple-600 font-medium">Loading awesome quizzes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 p-6 rounded-xl text-center">
        <p className="text-red-600">Oops! {error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again 🔄
        </Button>
      </div>
    );
  }

  return (
      <div className="space-y-8">

        {/* Category and View Mode Filter Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl shadow-md">

          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-purple-400" />
            </div>
            <Input
              type="text"
              placeholder="Search quizzes by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-2 border-purple-200 focus:border-purple-400 rounded-lg py-2 w-full placeholder:text-purple-300"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-400 hover:text-purple-600"
                aria-label="Clear search"
              >
                <span className="text-lg">✕</span>
              </button>
            )}
          </div>

          {searchTerm && ( // Search indicator
            <div className="mb-4 flex items-center">
              <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full flex items-center">
                <span>Searching for: "{searchTerm}"</span>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="ml-2 h-4 w-4 rounded-full bg-purple-200 flex items-center justify-center text-xs hover:bg-purple-300"
                >
                  ✕
                </button>
              </span>
            </div>
          )}

          {/* No Results state */}
          {quizzes.filter(filterQuizzes).length === 0 && ( // No results state
            <div className="mt-8 py-12 flex flex-col items-center justify-center bg-purple-50 border-2 border-purple-200 rounded-xl text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-purple-800 mb-2">No Quizzes Found</h3>
              <p className="text-purple-600 mb-4 max-w-md">
                {searchTerm 
                  ? `No quizzes match "${searchTerm}"` 
                  : "No quizzes match your current filters"}
              </p>
              <div className="flex gap-2">
                {searchTerm && (
                  <Button 
                    onClick={() => setSearchTerm('')}
                    variant="outline"
                    className="border-purple-300 hover:bg-purple-100"
                  >
                    Clear Search
                  </Button>
                )}
                {selectedCategory && selectedCategory !== 'all' && (
                  <Button 
                    onClick={() => setSelectedCategory('all')}
                    variant="outline"
                    className="border-purple-300 hover:bg-purple-100"
                  >
                    All Categories
                  </Button>
                )}
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setViewMode('all');
                  }}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
                >
                  Reset All Filters
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎮</span>
              <h2 className="text-xl font-bold text-purple-800">
                {selectedCategory ? selectedCategory : 'All Categories'}
              </h2>
            </div>
            <div className="flex gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px] bg-white border-2 border-purple-200 hover:border-purple-400 transition-all">
                  <SelectValue placeholder="Choose Category 📚" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="flex items-center gap-2">
                    <span>🌟</span> All Categories
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="flex items-center gap-2">
                      <span>📚</span> {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
    
              {/* View Mode Selector */}
              {user && (
                <div className="bg-white rounded-md border-2 border-purple-200 p-1 flex">
                  <button
                    onClick={() => setViewMode('all')}
                    className={`px-3 py-1 rounded-md text-sm transition-all ${
                      viewMode === 'all' 
                        ? 'bg-purple-600 text-white' 
                        : 'hover:bg-purple-50'
                    }`}
                  >
                    All Quizzes
                  </button>
                  <button
                    onClick={() => setViewMode('mine')}
                    className={`px-3 py-1 rounded-md text-sm transition-all ${
                      viewMode === 'mine' 
                        ? 'bg-purple-600 text-white' 
                        : 'hover:bg-purple-50'
                    }`}
                  >
                    My Quizzes
                  </button>
                  <button
                    onClick={() => setViewMode('community')}
                    className={`px-3 py-1 rounded-md text-sm transition-all ${
                      viewMode === 'community' 
                        ? 'bg-purple-600 text-white' 
                        : 'hover:bg-purple-50'
                    }`}
                  >
                    Community
                  </button>
                </div>
              )}
            </div>
          </div>
    
          {/* Conditional section headers */}
          {user && viewMode === 'mine' && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 mt-4 flex items-center gap-3">
              <span className="p-2 bg-yellow-200 rounded-full">👑</span>
              <div>
                <h3 className="font-bold text-yellow-800">My Created Quizzes</h3>
                <p className="text-sm text-yellow-700">Quizzes you've created for the community</p>
              </div>
            </div>
          )}
        </div>
    
        {/* Quiz Groups - My Quizzes and Community Quizzes */}
        <div className="space-y-10">
          {/* Quiz Grid */}
          {(!user || viewMode !== 'community') && (
            <div className="space-y-4">
              {user && viewMode === 'all' && (
                <h3 className="text-xl font-bold text-purple-800 flex items-center gap-2">
                  <StarIcon className="h-5 w-5" /> My Quizzes
                </h3>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes
                  .filter(quiz => {
                    // Base filtering with our common filter function
                    const passesBasicFilters = filterQuizzes(quiz);
                    
                    if (!user) return true;
                    if (viewMode === 'mine') return quiz.userId === user._id;
                    if (viewMode === 'all' && !userOnly) return quiz.userId === user._id;
                    if (viewMode === 'all' && !userOnly) {
                      return passesBasicFilters && quiz.userId === user?._id;
                    }
                    return passesBasicFilters;
                  })
                  .map((quiz) => {
                    const isOwnQuiz = user && quiz.userId === user._id;
                    
                    // If we're in 'all' mode and this isn't the user's quiz, don't show it in this section
                    if (viewMode === 'all' && !isOwnQuiz && !userOnly) return null;
                    
                    return (
                      <Card 
                        key={quiz._id} 
                        className={`group transition-all duration-300 hover:-translate-y-1 overflow-hidden ${
                          isOwnQuiz 
                            ? 'hover:shadow-xl hover:shadow-yellow-200/30 border-2 border-yellow-200' 
                            : 'hover:shadow-xl'
                        }`}
                      >
                        <CardHeader className={`bg-gradient-to-br ${gradientColors[Math.floor(Math.random() * gradientColors.length)]} text-white`}>
                          <div className="flex justify-between items-start">
                            <CardTitle className="flex items-center gap-2">
                              {isOwnQuiz && <span className="text-lg">👑</span>}
                              <span>{quiz.title}</span>
                            </CardTitle>
                            
                            {isOwnQuiz && (
                              <div className="bg-yellow-300 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                <UserIcon className="h-3 w-3" /> My Quiz
                              </div>
                            )}
                          </div>
                          
                          {quiz.category && (
                            <Badge className="bg-white/20 hover:bg-white/30 transition-colors text-white">
                              {quiz.category}
                            </Badge>
                          )}
                        </CardHeader>
                        
                        <CardContent className="pt-6">
                          <CardDescription className="text-gray-600">
                            {quiz.description}
                          </CardDescription>
                          
                          {/* Show quiz creator info if not the current user's quiz */}
                          {!isOwnQuiz && quiz.userId && userMap[quiz.userId] && (
                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <UserIcon className="h-4 w-4 text-purple-500" />
                                <span>Created by: <span className="font-medium text-purple-700">{userMap[quiz.userId].username}</span></span>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="flex items-center gap-1 text-purple-600 hover:text-purple-800"
                                onClick={() => router.push(`/user/${quiz.userId}`)}
                              >
                                <span className="text-xs">View Profile</span>
                                <ExternalLinkIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          )}

                          {/* Additional quiz info */}
                          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <span>📝</span> {quiz.questions?.length || 0} Questions
                            </span>
                            <span className="flex items-center gap-1">
                              <span>🎯</span> {quiz.difficulty || 'Mixed'} Level
                            </span>
                          </div>
                        </CardContent>
                        
                        <CardFooter className={`${isOwnQuiz ? 'bg-yellow-50' : 'bg-gray-50'} p-4`}>
                          <div className="flex justify-between items-center w-full">
                            <Button 
                              onClick={() => handlePreview(quiz)}
                              variant="outline"
                              className="hover:bg-purple-50"
                            >
                              Preview 👀
                            </Button>
                            <Button
                              onClick={() => handleClone(quiz)}
                              variant="outline"
                              className="border-blue-200 hover:bg-blue-50 text-blue-700"
                            >
                              <span className="flex items-center gap-1">
                                📋 Clone
                              </span>
                            </Button>

                            {isOwnQuiz ? (
                              <div className="flex gap-2">
                                <Button 
                                  size="icon"
                                  variant="outline"
                                  className="h-9 w-9 border-yellow-300 hover:bg-yellow-50"
                                  onClick={() => router.push(`/quiz/edit/${quiz._id}`)}
                                >
                                  <PencilIcon className="h-4 w-4 text-yellow-600" />
                                </Button>
                                <Button 
                                  onClick={() => router.push(`/quiz/${quiz._id}`)}
                                  className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-600 hover:to-amber-600"
                                >
                                  Start 🚀
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                onClick={() => router.push(`/quiz/${quiz._id}`)}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
                              >
                                Start Quiz 🚀
                              </Button>
                            )}
                          </div>
                        </CardFooter>
                      </Card>
                    );
                  })
                  .filter(Boolean)} {/* Filter out any null elements */}
              </div>
            </div>
          )}
    
          {/* Community Quizzes */}
          {user && (viewMode === 'all' || viewMode === 'community') && !userOnly && (
            <div className="space-y-4">
              {viewMode === 'all' && (
                <h3 className="text-xl font-bold text-purple-800 flex items-center gap-2 pt-6">
                  <span>🌍</span> Community Quizzes
                </h3>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes
                  .filter(quiz => {
                    // Base filtering with our common filter function
                    const passesBasicFilters = filterQuizzes(quiz);
                    
                    // This section only shows community quizzes
                    return passesBasicFilters && (!user || quiz.userId !== user._id);
                  })
                  .map((quiz) => {
                    const isOwnQuiz = user && quiz.userId === user._id;

                    return (
                      <Card 
                        key={quiz._id} 
                        className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                      >
                        <CardHeader className={`bg-gradient-to-br ${gradientColors[Math.floor(Math.random() * gradientColors.length)]} text-white`}>
                          <CardTitle className="flex items-center gap-2">
                            <span className="text-2xl">✨</span>
                            {quiz.title}
                          </CardTitle>
                          {quiz.category && (
                            <Badge className="bg-white/20 hover:bg-white/30 transition-colors text-white">
                              {quiz.category}
                            </Badge>
                          )}
                        </CardHeader>
                        
                        <CardContent className="pt-6">
                          <CardDescription className="text-gray-600">
                            {quiz.description}
                          </CardDescription>

                          {/* Show quiz creator info if not the current user's quiz */}
                          {!isOwnQuiz && quiz.userId && userMap[quiz.userId] && (
                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <UserIcon className="h-4 w-4 text-purple-500" />
                                <span>Created by: <span className="font-medium text-purple-700">{userMap[quiz.userId].username}</span></span>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="flex items-center gap-1 text-purple-600 hover:text-purple-800"
                                onClick={() => router.push(`/user/${quiz.userId}`)}
                              >
                                <span className="text-xs">View Profile</span>
                                <ExternalLinkIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          )}

                          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <span>📝</span> {quiz.questions?.length || 0} Questions
                            </span>
                            <span className="flex items-center gap-1">
                              <span>🎯</span> {quiz.difficulty || 'Mixed'} Level
                            </span>
                          </div>
                        </CardContent>
                        
                        <CardFooter className="bg-gray-50 flex justify-between p-4">
                          <Button 
                            onClick={() => handlePreview(quiz)}
                            variant="outline"
                            className="hover:bg-purple-50"
                          >
                            Preview 👀
                          </Button>
                          {user && (
                            <Button
                              onClick={() => handleClone(quiz)}
                              variant="outline"
                              className="border-blue-200 hover:bg-blue-50 text-blue-700"
                            >
                              <span className="flex items-center gap-1">
                                📋 Clone
                              </span>
                            </Button>
                          )}
                          <Button 
                            onClick={() => router.push(`/quiz/${quiz._id}`)}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
                          >
                            Start Quiz 🚀
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
    
        {/* Preview Modal (unchanged) */}
        {/* Preview Modal */}
        {isModalOpen && selectedQuiz && (
          <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-purple-800 flex items-center gap-2">
                  <span>🎮</span> {selectedQuiz.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <p className="text-gray-600">{selectedQuiz.description}</p>

                {/* Add creator info in the modal too */}
                {user && selectedQuiz.userId && selectedQuiz.userId !== user._id && userMap[selectedQuiz.userId] && (
                  <div className="flex items-center justify-between bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-purple-500" />
                      <span className="text-purple-700">Created by: <span className="font-medium">{userMap[selectedQuiz.userId].username}</span></span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1 border-purple-300 text-purple-700"
                      onClick={() => {
                        handleCloseModal();
                        router.push(`/user/${selectedQuiz.userId}`);
                      }}
                    >
                      View Profile
                      <ExternalLinkIcon className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-purple-800">Preview Questions</h3>
                  <ul className="space-y-4">
                    {selectedQuiz.questions?.slice(0,3).map((question, idx) => (
                      <li key={idx} className="bg-purple-50 p-4 rounded-lg border-2 border-purple-100">
                        <p className="font-medium text-purple-900 mb-2">
                          <span className="text-purple-500">#{idx + 1}</span> {question.question}
                        </p>
                        <ul className="grid grid-cols-2 gap-2">
                          {question.options.map((option, index) => (
                            <li key={index} className="bg-white p-2 rounded border border-purple-200 text-sm">
                              {option}
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                  {(selectedQuiz.questions?.length ?? 0) > 3 && (
                    <p className="text-sm text-gray-500 italic">
                      Showing first 3 of {selectedQuiz.questions?.length} questions
                    </p>
                  )}
                </div>

                {/* Action Buttons - Only shows edit and delete for user's own quizzes */}
                <div className="flex justify-end space-x-2 mt-4">
                  {user && selectedQuiz.userId === user._id && (
                    <>
                      <Button onClick={() => router.push(`/quiz/edit/${selectedQuiz._id}`)}>
                        Edit ✏️
                      </Button>
                      <Button onClick={() => handleDelete(selectedQuiz._id)} className="bg-red-500 hover:bg-red-600 text-white">
                        Delete 🗑️
                      </Button>
                    </>
                  )}
                  <Button onClick={handleCloseModal}>Close</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }