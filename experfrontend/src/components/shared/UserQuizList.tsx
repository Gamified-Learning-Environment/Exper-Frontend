'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { useAuth } from '@/contexts/auth.context';

// Quiz interface
interface Quiz {
  id: string;
  title: string;
  description: string;
}

// UserQuizList component
export default function UserQuizList() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
          <CardFooter>
            <Button onClick={() => router.push(`/quiz/${quiz.id}`)}>View Quiz</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}