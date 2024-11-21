'use client';

import UserQuizList from "@/components/shared/UserQuizList";

export default function UserQuizzesPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">My Quizzes</h1>
        <UserQuizList />
    </div>
  );
}