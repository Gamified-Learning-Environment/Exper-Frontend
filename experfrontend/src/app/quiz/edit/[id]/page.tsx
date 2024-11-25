'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import EditQuizForm from '@/components/shared/EditQuizForm';

export default function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizId, setQuizId] = useState<string | null>(null);

  useEffect(() => {
    async function unwrapParams() {
      const unwrappedParams = await params;
      setQuizId(unwrappedParams.id);

    }

    unwrapParams();
  }, [params]);

  useEffect(() => {
    async function fetchQuiz() {
      if (!quizId) return;

      try {
        const response = await fetch(`http://localhost:9090/api/quiz/${quizId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch quiz');
        }
        const data = await response.json();
        setQuiz(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch quiz');
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [quizId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!quiz) {
    return <div>Quiz not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Quiz</h1>
      <EditQuizForm quiz={quiz} />
    </div>
  );
}