import { useQuizForm } from './hooks/useQuizForm';
import { BasicInfoSection } from './components/BasicInfoSection';
//import { AISection } from './components/AISection';
//import { QuestionForm } from './components/QuestionForm';
//import { QuestionPreview } from './components/QuestionPreview';
//import { LoadingIndicator } from './components/LoadingIndicator';
import type { QuizFormProps } from './types';
import { Card } from '@/components/ui/card';
import { CardFooter } from '@/components/ui/card';

export const QuizForm = ({ onClose, quiz }: QuizFormProps) => {
    const {
      formState,
      handlers
    } = useQuizForm(quiz);

    return (
        <Card className="w-full max-w-4xl mx-auto p-6 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-xl">
            <form>
                <BasicInfoSection {...formState} {...handlers} />
                
                {/*</form>{formState.useAI ? (
                    <AISection {...formState} {...handlers} />
                ) : (
                    formState.questions.map((question, index) => (
                    <QuestionForm
                        key={question.id}
                        question={question}
                        index={index}
                        {...handlers}
                    />
                    ))
                )}*/}

                
                {/*{formState.showPreview && (
                    //<QuestionPreview
                        //questions={formState.questions}
                        //validationFeedback={formState.validationFeedback}
                    ///>
                )}*/}

                {/*{formState.isGenerating && <LoadingIndicator />}*/}

                <CardFooter>
                    {/* Exiting footer goes here*/}
                </CardFooter>
            </form>
        </Card>
    );
};