'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { useAuth } from '@/contexts/auth.context';
import Modal from '@/components/ui/modal';

// Quiz interface
interface Quiz {
  id: string;
  title: string;
  description: string;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchUserQuizzes() {
      try {
        const response = await fetch(`http://localhost:9090/api/quizzes?userId=${user?.id}`);
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
  }, [user]);

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {quizzes.map((quiz) => (
        <Card key={quiz.id || `quiz-${Math.random()}`} className="p-4">
          <CardHeader>
            <CardTitle>{quiz.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>{quiz.description}</CardDescription>
          </CardContent>
          <CardFooter className='flex justify-between'>
            <Button onClick={() => handlePreview(quiz)} >Preview</Button>
            <Button onClick={() => router.push(`/quiz/${quiz.id}`)}>View Quiz</Button>
          </CardFooter>
        </Card>
      ))}
      {isModalOpen && selectedQuiz && (
        <Modal onClose={handleCloseModal}>
          <div className="space-y-4">
            <h2 className='text-xl font-bold mb-4'>{selectedQuiz.title}</h2>
            <p className='mb-4'>{selectedQuiz.description}</p>
            <ul className='mb-4 space-y-2'>
              {selectedQuiz.questions.slice(0,3).map((question) => (
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
                <Button onClick={() => router.push(`/quiz/${selectedQuiz.id}`)}>View Quiz</Button>
                <Button onClick={handleCloseModal}>Close</Button>
              </div>
        </div>
        </Modal>
      )}
    </div>
  );
}