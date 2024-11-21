'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';

// Quiz interface
interface Quiz {
  id: string;
  title: string;
  description: string;
}

// QuizList component
export default function QuizList() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const response = await fetch('http://localhost:9090/api/quizzes');
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

    fetchQuizzes();
  }, []);

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