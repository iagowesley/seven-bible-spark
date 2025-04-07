import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { updateUserProgress } from "@/models/userProgress";

type Question = {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
};

type QuizProps = {
  questions: Question[];
  onComplete: (score: number) => void;
  lessonId: string; // Adicionando lessonId para salvar o progresso
};

const QuizComponent: React.FC<QuizProps> = ({ questions, onComplete, lessonId }) => {
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
      const finalScore = score + (selectedOption === currentQuestion.correctOptionId ? 1 : 0);
      const percentage = Math.round((finalScore / questions.length) * 100);
      
      // Atualizar o progresso do usuário na lição
      updateUserProgress('anonymous-user', lessonId, 100, percentage >= 50, finalScore * 10)
        .then(() => {
          console.log(`Progresso atualizado para a lição ${lessonId}: ${percentage}% de acerto`);
          onComplete(finalScore);
        })
        .catch(error => {
          console.error("Erro ao atualizar progresso:", error);
        });
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  if (quizCompleted) {
    const finalScore = score + (selectedOption === currentQuestion.correctOptionId ? 1 : 0);
    const percentage = Math.round((finalScore / questions.length) * 100);
    
    return (
      <Card className="modern-card animate-fade-in">
        <CardHeader>
          <CardTitle className="text-center font-normal">Quiz Concluído!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="w-24 h-24 rounded-circle bg-muted flex items-center justify-center mx-auto mb-6">
            {percentage >= 70 ? (
              <CheckCircle className="h-12 w-12 text-green-500" />
            ) : (
              <XCircle className="h-12 w-12 text-destructive" />
            )}
          </div>
          <h3 className="text-2xl font-normal mb-2">Sua pontuação: {percentage}%</h3>
          <p className="text-muted-foreground font-light">
            Você acertou {finalScore} de {questions.length} questões
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-3">
          <Button
            variant="outline"
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
          <Button
            variant="modern"
            onClick={() => {
              // Navegar para o próximo dia
              const days = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
              const currentPath = window.location.pathname;
              const currentDay = currentPath.split('/').pop();
              
              if (currentDay && days.includes(currentDay)) {
                const currentIndex = days.indexOf(currentDay);
                if (currentIndex < days.length - 1) {
                  const nextDay = days[currentIndex + 1];
                  window.location.href = `/estudos/${nextDay}`;
                }
              }
            }}
            className="flex items-center"
          >
            Próximo Dia <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="modern-card animate-fade-in">
      <CardHeader>
        <CardTitle className="font-normal">
          Questão {currentQuestionIndex + 1} de {questions.length}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-lg font-normal mb-4">{currentQuestion.text}</h3>
          
          <RadioGroup value={selectedOption} className="space-y-3">
            {currentQuestion.options.map((option) => (
              <div
                key={option.id}
                className={`flex items-center space-x-2 border p-3 transition-colors ${
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
                  className="flex-grow cursor-pointer py-1 font-light"
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
          variant="outline"
          disabled={currentQuestionIndex === 0}
          onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>
        {!answerChecked ? (
          <Button variant="modern" onClick={checkAnswer} className="flex items-center">
            <Check className="h-4 w-4 mr-2" />
            Verificar
          </Button>
        ) : (
          <Button variant="modern" onClick={nextQuestion} className="flex items-center">
            {isLastQuestion ? "Finalizar" : "Próxima"}
            {!isLastQuestion && <ArrowRight className="h-4 w-4 ml-2" />}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default QuizComponent;
