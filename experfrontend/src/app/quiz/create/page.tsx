'use client'; // use client to import modules from the client folder, helps to avoid SSR issues

import dynamic from 'next/dynamic'; 
import { Suspense } from 'react'; // Import Suspense for lazy loading

// Dynamically import with SSR disabled
const NewQuizForm = dynamic(
  () => import('@/components/shared/NewQuizForm'),
  { ssr: false }
);


export default function CreateQuizPage() { // Create Quiz Page component
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Quiz</h1>
      <Suspense fallback={<div>Loading form...</div>}>
        <NewQuizForm />
      </Suspense>
    </div>
  );
}