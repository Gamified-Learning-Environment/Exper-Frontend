'use client'; // use client to import modules from the client folder, helps to avoid SSR issues

import NewQuizForm from '@/components/shared/NewQuizForm'; // New Quiz Form component from components/shared folder

export default function CreateQuizPage() { // Create Quiz Page component
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Quiz</h1>
      <NewQuizForm />
    </div>
  );
}