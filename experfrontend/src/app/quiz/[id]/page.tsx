import Quiz from '@/components/shared/Quiz';

async function getQuiz(id: string) {
    const res = await fetch(`http://localhost:9090/api/quiz/${id}`); // fetch quiz data from API
    if (!res.ok) {
        throw new Error('Failed to fetch quiz');
    }
    return res.json();
}

export default async function QuizPage({ params }: {params: { id: Promise<string> }}) {
    const id = await params.id;
    const quiz = await getQuiz(id); // fetch quiz data

    return (
        <div className='container mx-auto py-8'>
            <h1 className='text-2xl font-bold mb-4'>{quiz.title}</h1>
            <Quiz quiz={quiz} />
        </div>
    );
}