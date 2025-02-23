// Manages the main quiz form for creating a quiz, containing the basic info section, AI section, and question form.
// The form is managed by the useQuizForm hook, which handles the form state and form handlers.
// The form state and handlers are passed down to the respective sections and question form components.
// The form also contains a preview of the questions and a loading indicator when generating questions.

import { useQuizForm } from './hooks/useQuizForm';
import { BasicInfoSection } from './components/BasicInfoSection';
import { AISection } from './components/AISection';
import { QuestionForm } from './components/QuestionForm';
import { QuestionPreview } from './components/QuestionPreview';
//import { LoadingIndicator } from './components/LoadingIndicator';
import type { QuizFormProps } from './types';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const QuizForm = ({ onClose, quiz }: QuizFormProps) => {
    const {
      formState,
      handlers
    } = useQuizForm(quiz);

    return (
        <Card className="w-full max-w-4xl mx-auto p-6 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-xl">
            <form onSubmit={handlers.handleSubmit}>
                <BasicInfoSection {...formState} {...handlers} />
                
                {formState.useAI ? (
                    <AISection {...formState} {...handlers} />
                ) : (
                    formState.questions.map((question, index) => (
                        <QuestionForm
                            key={question.id}
                            question={question}
                            index={index}
                            imageLoading={formState.imageLoading}
                            {...handlers}
                        />
                    ))
                )}

                
                {formState.showPreview && (
                    <QuestionPreview
                        questions={formState.questions}
                        validationFeedback={formState.validationFeedback}
                        onRegenerate={handlers.generateQuizWithAI}
                    />
                )}

                {/*{formState.isGenerating && <LoadingIndicator />}*/}

                <CardFooter>
                    {/* Quiz form footer */}
                    <CardFooter className="flex justify-between pt-6">
                    <div className="flex gap-2">
                    <Button 
                        type="button" 
                        onClick={handlers.handleAddQuestion} 
                        variant="outline"
                        className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 border-2 border-indigo-300"
                    >
                        Add Question ✨
                    </Button>
                    <Button
                        type="button"
                        onClick={() => handlers.handleRemoveQuestion(formState.questions.length - 1)}
                        variant="outline"
                        className="bg-red-100 hover:bg-red-200 text-red-700 border-2 border-red-300"
                        disabled={formState.questions.length <= 1}
                    >
                        Remove Question 🗑️
                    </Button>
                    </div>
                    <Button 
                    type="submit" 
                    disabled={formState.isGenerating}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
                    >
                    Submit Quiz
                    </Button>
                    </CardFooter>
                </CardFooter>
            </form>
        </Card>
    );
};