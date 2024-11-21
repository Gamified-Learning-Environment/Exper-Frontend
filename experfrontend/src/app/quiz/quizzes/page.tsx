'use client';

import QuizList from "@/components/shared/QuizList";

export default function QuizListPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Available Quizzes</h1>
      <QuizList />
    </div>
  );
}