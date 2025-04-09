'use client'; // use client to import modules from the client folder, helps to avoid SSR issues

const API_URL = process.env.NEXT_PUBLIC_QUIZ_SERVICE_URL || 'http://localhost:9090';

import { useEffect, useState } from 'react';
import EditQuizForm from '@/components/shared/EditQuizForm'; // Edit Quiz Form component from components/shared folder

interface Quiz {
  _id: string;
  id: string;
  title: string;
  description: string;
  questions: any[]; 

}

export default function EditQuizPage({ params }: { params: Promise<{ id: string }> }) { // Edit Quiz Page component
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizId, setQuizId] = useState<string | null>(null);

  useEffect(() => { // Unwrap the params and set the quiz id
    async function unwrapParams() {
      const unwrappedParams = await params;
      setQuizId(unwrappedParams.id);
    }
    unwrapParams();
  }, [params]);

  useEffect(() => { // Fetch quiz data
    async function fetchQuiz() {
      if (!quizId) return; // Return if quiz id is null

      try { // Try to fetch quiz data
        const response = await fetch(`${API_URL}/api/quiz/${quizId}`); // Fetch quiz data from API
        if (!response.ok) {
          throw new Error('Failed to fetch quiz');
        }
        const data = await response.json(); // Parse response data
        setQuiz(data); // Set updated quiz data
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch quiz');
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [quizId]);

  if (loading) { // Return loading message
    return <div>Loading...</div>;
  }

  if (error) { // Return error message
    return <div>Error: {error}</div>;
  }

  if (!quiz) { // Return quiz not found message
    return <div>Quiz not found</div>;
  }

  return ( // Return the Edit Quiz Form component
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Quiz</h1>
      <EditQuizForm quiz={quiz} />
    </div>
  );
}