import Quiz from '@/components/shared/Quiz';

async function getQuiz(id: string) {
    const res = await fetch(`http://localhost:9090/api/quiz/${id}`, {
        cache: 'no-store', // Disable caching for this request to always get the latest data - Turn off later
    }); // fetch quiz data from API

    if (!res.ok) {
        throw new Error(`Quiz not found (${res.status})`);
    }
    return res.json();
}

export default async function QuizPage({ params }: {params: { id: string }}) {
    try {
        const quiz = await getQuiz(params.id);
        
        return (
          <div className='container mx-auto py-8'>
            <h1 className='text-2xl font-bold mb-4'>{quiz.title}</h1>
            <Quiz quiz={quiz} />
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