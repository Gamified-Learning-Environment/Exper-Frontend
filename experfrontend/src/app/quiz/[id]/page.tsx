import NewQuiz from '@/components/shared/NewQuiz'; // Quiz component from components/shared folder

const API_URL = process.env.NEXT_PUBLIC_QUIZ_SERVICE_URL || 'http://localhost:9090';

async function getQuiz(id: string) { // Fetch quiz data from API
    const res = await fetch(`${API_URL}/api/quiz/${id}`, {
        cache: 'no-store', // Disable caching for this request to always get the latest data - Turn off later
    }); 

    if (!res.ok) { // Check if response is ok
        throw new Error(`Quiz not found (${res.status})`);
    }
    return res.json();
}

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) { // QuizPage component taking in id as a parameter
    try { // Try to fetch quiz data
        const { id } = await params;
        const quiz = await getQuiz(id);
        
        return ( // Return the quiz component
          <div className='container mx-auto py-8'>
            <h1 className='text-2xl font-bold mb-4'>{quiz.title}</h1>
            <p className="mb-4">{quiz.description}</p>
            <NewQuiz quiz={quiz}/> {/* Pass quiz data to component and associated User ID */}
          </div>
        );
      } catch (error) {
        return (
          <div className='container mx-auto py-8'>
            <h1 className='text-2xl font-bold mb-4 text-red-600'>Error Loading Quiz</h1>
            <p>{error instanceof Error ? error.message : 'Failed to load quiz'}</p>
          </div>
        );
      }
}