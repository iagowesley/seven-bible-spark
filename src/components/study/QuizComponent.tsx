
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle } from "lucide-react";

type Question = {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
};

type QuizProps = {
  questions: Question[];
  onComplete: (score: number) => void;
};

const QuizComponent: React.FC<QuizProps> = ({ questions, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [score, setScore] = useState(0);
  const [answerChecked, setAnswerChecked] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  
  const handleOptionSelect = (optionId: string) => {
    if (answerChecked) return;
    setSelectedOption(optionId);
  };
  
  const checkAnswer = () => {
    if (!selectedOption) {
      toast({
        title: "Selecione uma resposta",
        description: "Por favor, selecione uma opção para continuar",
        variant: "destructive",
      });
      return;
    }
    
    const isCorrect = selectedOption === currentQuestion.correctOptionId;
    
    if (isCorrect) {
      setScore(score + 1);
      toast({
        title: "Resposta correta!",
        description: "Parabéns! Você acertou a questão.",
        variant: "default",
      });
    } else {
      toast({
        title: "Resposta incorreta",
        description: "Tente novamente no próximo.",
        variant: "destructive",
      });
    }
    
    setAnswerChecked(true);
  };
  
  const nextQuestion = () => {
    setSelectedOption("");
    setAnswerChecked(false);
    
    if (isLastQuestion) {
      setQuizCompleted(true);
      onComplete(score + (selectedOption === currentQuestion.correctOptionId ? 1 : 0));
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  if (quizCompleted) {
    const finalScore = score + (selectedOption === currentQuestion.correctOptionId ? 1 : 0);
    const percentage = Math.round((finalScore / questions.length) * 100);
    
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-center">Quiz Concluído!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="w-24 h-24 rounded-circle bg-muted flex items-center justify-center mx-auto mb-6">
            {percentage >= 70 ? (
              <CheckCircle className="h-12 w-12 text-green-500" />
            ) : (
              <XCircle className="h-12 w-12 text-destructive" />
            )}
          </div>
          <h3 className="text-2xl font-bold mb-2">Sua pontuação: {percentage}%</h3>
          <p className="text-muted-foreground">
            Você acertou {finalScore} de {questions.length} questões
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            className="rounded-full"
            onClick={() => {
              // Reiniciar o quiz
              setCurrentQuestionIndex(0);
              setSelectedOption("");
              setScore(0);
              setAnswerChecked(false);
              setQuizCompleted(false);
            }}
          >
            Tentar Novamente
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>
          Questão {currentQuestionIndex + 1} de {questions.length}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">{currentQuestion.text}</h3>
          
          <RadioGroup value={selectedOption} className="space-y-3">
            {currentQuestion.options.map((option) => (
              <div
                key={option.id}
                className={`flex items-center space-x-2 border rounded-lg p-3 transition-colors ${
                  selectedOption === option.id && answerChecked
                    ? option.id === currentQuestion.correctOptionId
                      ? "border-green-500 bg-green-50 dark:bg-green-900/10"
                      : "border-red-500 bg-red-50 dark:bg-red-900/10"
                    : "hover:bg-muted"
                } ${selectedOption === option.id ? "border-primary" : ""}`}
                onClick={() => handleOptionSelect(option.id)}
              >
                <RadioGroupItem
                  value={option.id}
                  id={option.id}
                  disabled={answerChecked}
                />
                <Label
                  htmlFor={option.id}
                  className="flex-grow cursor-pointer py-1"
                >
                  {option.text}
                </Label>
                {answerChecked && option.id === currentQuestion.correctOptionId && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {answerChecked &&
                  selectedOption === option.id &&
                  option.id !== currentQuestion.correctOptionId && (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          className="rounded-full"
          variant="outline"
          disabled={currentQuestionIndex === 0}
          onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
        >
          Anterior
        </Button>
        {!answerChecked ? (
          <Button className="rounded-full" onClick={checkAnswer}>
            Verificar
          </Button>
        ) : (
          <Button className="rounded-full" onClick={nextQuestion}>
            {isLastQuestion ? "Finalizar" : "Próxima"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default QuizComponent;
