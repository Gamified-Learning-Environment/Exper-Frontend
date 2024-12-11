'use client'; // use client to import modules from the client folder, helps to avoid SSR issues

// imports
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { useAuth } from '@/contexts/auth.context';
import Modal from '@/components/ui/modal';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// Quiz interface
interface Quiz {
  _id: any;
  id: string;
  title: string;
  description: string;
  category?: string;
  questions: QuizQuestion[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

// UserQuizList component
export default function UserQuizList() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const router = useRouter();
  const { user } = useAuth();

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

  // Fetch user quizzes with optional category filter
  useEffect(() => {
    async function fetchUserQuizzes() {
      try {
        let url = `http://localhost:9090/api/quizzes?userId=${user?.id}`;
        if (selectedCategory) {
          url += `&category=${selectedCategory}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch user quizzes');
        }
        const data = await response.json();
        setQuizzes(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch user quizzes');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchUserQuizzes();
    }
  }, [user, selectedCategory]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

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

  return (
    <div className="space-y-6">
        <label className="text-sm font-medium">Category</label>
      <div className="flex gap-4 items-center">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <Card key={quiz._id} className="p-4">
            <CardHeader>
              <CardTitle>{quiz.title}</CardTitle>
              {quiz.category && (
                <Badge variant="outline" className="w-fit">
                  {quiz.category}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <CardDescription>{quiz.description}</CardDescription>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={() => handlePreview(quiz)}>Preview</Button>
              <Button onClick={() => router.push(`/quiz/${quiz._id}`)}>
                View Quiz
              </Button>
            </CardFooter>
          </Card>
        ))}

      {/* Modal to display quiz details */}
      {isModalOpen && selectedQuiz && (
        <Modal onClose={handleCloseModal}>
          <div className="space-y-4">
            <h2 className='text-xl font-bold mb-4'>{selectedQuiz.title}</h2>
            <p className='mb-4'>{selectedQuiz.description}</p>
            <ul className='mb-4 space-y-2'>
              {selectedQuiz.questions?.slice(0,3).map((question) => (
                <li key={question.id} className='mb-2'>
                  <strong>{question.question}</strong>
                  <ul className='list-disc list-inside pl-4'>
                    {question.options.map((option, index) => (
                    <li key={index}>{option}</li>
                  ))}
                  </ul>
                </li>
              ))}
            </ul>
              <div className='flex justify-end space-x-2'>
                <Button onClick={() => router.push(`/quiz/${selectedQuiz._id}`)}>View Quiz</Button>
                <Button onClick={handleCloseModal}>Close</Button>
                <Button onClick={() => router.push(`/quiz/edit/${selectedQuiz._id}`)}>Edit</Button>
                <Button onClick={() => handleDelete(selectedQuiz._id)}>Delete</Button>
              </div>
        </div>
        </Modal>
      )}
    </div>
  </div>
  );
}