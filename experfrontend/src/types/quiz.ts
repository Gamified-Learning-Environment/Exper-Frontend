
// Quiz types

// QuizQuestion interface defines question structure in a quiz
interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    answer: string;
}

// Quiz interface defines the structure of a quiz itself
interface Quiz {
    id: string;
    name: string;
    questions: QuizQuestion[];
}