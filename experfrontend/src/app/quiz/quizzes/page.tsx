'use client'; // use client to import modules from the client folder, helps to avoid SSR issues

import QuizList from "@/components/shared/QuizList"; // QuizList component from components/shared folder

export default function QuizListPage() { // QuizListPage component for displaying available quizzes, regardless of the user
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Available Quizzes</h1>
      <QuizList /> {/* Display the QuizList component */}
    </div>
  );
}