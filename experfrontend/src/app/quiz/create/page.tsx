'use client';

import QuizForm from '@/components/shared/QuizForm';

export default function CreateQuizPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Quiz</h1>
      <QuizForm />
    </div>
  );
}