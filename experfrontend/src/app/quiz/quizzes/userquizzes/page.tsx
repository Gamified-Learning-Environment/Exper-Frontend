'use client'; // use client to import modules from the client folder, helps to avoid SSR issues

import QuizList from "@/components/shared/QuizList"; // UserQuizList component from components/shared folder

export default function UserQuizzesPage() { // UserQuizzesPage component for displaying user quizzes specific to the user
  return ( 
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">My Quizzes</h1>
        <QuizList userOnly /> {/* Display the UserQuizList component */}
    </div>
  );
}