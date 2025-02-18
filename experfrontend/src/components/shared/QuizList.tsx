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
      const response = await fetch(`http://localhost:9090/api/quiz/${quizId}`, {
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

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('http://localhost:9090/api/categories');
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
        let url = 'http://localhost:9090/api/quizzes';
        
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
      {/* Category Filter Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎮</span>
            <h2 className="text-xl font-bold text-purple-800">
              {selectedCategory ? selectedCategory : 'All Categories'}
            </h2>
          </div>
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
        </div>
      </div>

      {/* Quiz Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <Card key={quiz._id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
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
            <CardFooter className="bg-gray-50 flex justify-between p-4">
              <Button 
                onClick={() => handlePreview(quiz)}
                variant="outline"
                className="hover:bg-purple-50"
              >
                Preview 👀
              </Button>
              <Button 
                onClick={() => router.push(`/quiz/${quiz._id}`)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
              >
                Start Quiz 🚀
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

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