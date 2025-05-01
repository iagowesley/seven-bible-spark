import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, ArrowLeft, ArrowRight, Check, AlertTriangle } from "lucide-react";
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
  lessonId: string;
};

// Função para processar texto com marcações de destaque
const processText = (text: string): React.ReactNode => {
  if (!text) return null;
  
  // Processa marcações para textos em negrito usando **texto**
  const boldPattern = /\*\*(.*?)\*\*/g;
  
  // Processa marcações para textos sublinhados usando __texto__
  const underlinePattern = /__([^_]+)__/g;
  
  // Processa marcações para textos com fundo destacado usando ==texto==
  const highlightPattern = /==(.*?)==/g;
  
  // Primeiro substitui marcações de destaque
  let processedText = text
    .replace(highlightPattern, '<span class="bg-yellow-100 dark:bg-yellow-900/30 px-1 py-0.5 rounded">$1</span>')
    .replace(boldPattern, '<strong class="font-semibold">$1</strong>')
    .replace(underlinePattern, '<span class="underline decoration-2 underline-offset-2">$1</span>');
    
  return <div dangerouslySetInnerHTML={{ __html: processedText }} />;
};

const QuizComponent: React.FC<QuizProps> = ({ questions, onComplete, lessonId }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [score, setScore] = useState(0);
  const [answerChecked, setAnswerChecked] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  
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
        description: "Reveja a questão e a resposta correta.",
        variant: "destructive",
      });
    }
    
    setAnswerChecked(true);
    setShowExplanation(true);
  };
  
  const nextQuestion = () => {
    setSelectedOption("");
    setAnswerChecked(false);
    setShowExplanation(false);
    
    if (isLastQuestion) {
      // Calcular pontuação final
      const finalScore = score + (selectedOption === currentQuestion.correctOptionId ? 1 : 0);
      const percentage = Math.round((finalScore / questions.length) * 100);
      
      // Guardar o progresso do usuário quando o quiz for concluído
      const isCompleted = percentage >= 50;
      updateUserProgress(
        'anonymous-user',
        lessonId,
        percentage,
        isCompleted,
        isCompleted ? 10 : 0
      ).then(() => {
        console.log(`Progresso da lição ${lessonId} salvo: ${percentage}%, completado: ${isCompleted}`);
      });
      
      setQuizCompleted(true);
      onComplete(finalScore);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const handleNavigateToNextDay = () => {
    // Navegar para o próximo dia
    const days = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
    const currentIndex = days.indexOf(lessonId);
    
    if (currentIndex < days.length - 1) {
      const nextDay = days[currentIndex + 1];
      window.location.href = `/estudos/${nextDay}`;
    }
  };
  
  if (quizCompleted) {
    const finalScore = score + (selectedOption === currentQuestion.correctOptionId ? 1 : 0);
    const percentage = Math.round((finalScore / questions.length) * 100);
    
    return (
      <Card className="modern-card animate-fade-in w-full sm:w-[90%] mx-auto shadow-lg border border-primary/10">
        <CardHeader className="px-4 sm:px-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
          <CardTitle className="text-center font-normal text-xl sm:text-2xl">Quiz Concluído!</CardTitle>
        </CardHeader>
        <CardContent className="text-center px-4 sm:px-6 py-4 sm:py-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6 shadow-inner">
            {percentage >= 70 ? (
              <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-green-500" />
            ) : percentage >= 50 ? (
              <Check className="h-10 w-10 sm:h-12 sm:w-12 text-amber-500" />
            ) : (
              <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-destructive" />
            )}
          </div>
          <h3 className="text-xl sm:text-2xl font-normal mb-2">Sua pontuação: {percentage}%</h3>
          <p className="text-muted-foreground font-light text-sm sm:text-base">
            Você acertou {finalScore} de {questions.length} questões
          </p>
          
          <div className="mt-6 p-4 bg-muted/50 rounded-lg text-left">
            <h4 className="font-medium mb-2">Análise de desempenho:</h4>
            {percentage >= 70 ? (
              <p className="text-green-600 dark:text-green-400">Excelente! Você demonstrou um ótimo entendimento das lições desta semana.</p>
            ) : percentage >= 50 ? (
              <p className="text-amber-600 dark:text-amber-400">Bom trabalho! Você compreendeu os pontos principais, mas ainda pode aprofundar em alguns temas.</p>
            ) : (
              <p className="text-rose-600 dark:text-rose-400">Recomendamos revisar as lições desta semana para consolidar o aprendizado.</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-3 px-4 sm:px-6 pb-5">
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
            className="w-full sm:w-auto"
          >
            Tentar Novamente
          </Button>
          <Button
            variant="modern"
            onClick={handleNavigateToNextDay}
            className="flex items-center w-full sm:w-auto justify-center bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white"
          >
            Próximo Dia <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="modern-card animate-fade-in w-full sm:w-[90%] mx-auto shadow-lg border border-primary/10">
      <CardHeader className="px-4 sm:px-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
        <CardTitle className="font-normal text-base sm:text-lg flex items-center justify-between">
          <span>Questão {currentQuestionIndex + 1} de {questions.length}</span>
          <span className="text-sm text-muted-foreground">Pontuação: {score}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pt-4 pb-2">
        <div className="mb-6">
          <h3 className="text-base sm:text-lg font-medium mb-4 leading-relaxed">
            {processText(currentQuestion.text)}
          </h3>
          
          <RadioGroup value={selectedOption} className="space-y-3">
            {currentQuestion.options.map((option) => (
              <div
                key={option.id}
                className={`flex items-start sm:items-center space-x-3 border p-3 sm:p-4 rounded-md transition-all ${
                  selectedOption === option.id && answerChecked
                    ? option.id === currentQuestion.correctOptionId
                      ? "border-green-500 bg-green-50 dark:bg-green-900/10 shadow-sm"
                      : "border-red-500 bg-red-50 dark:bg-red-900/10 shadow-sm"
                    : selectedOption === option.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "hover:bg-muted/50 border-muted-foreground/20"
                }`}
                onClick={() => handleOptionSelect(option.id)}
              >
                  <RadioGroupItem
                    value={option.id}
                    id={option.id}
                    disabled={answerChecked}
                  className="mt-1 sm:mt-0"
                  />
                <Label
                  htmlFor={option.id}
                  className="flex-grow cursor-pointer py-0 leading-relaxed font-light text-sm sm:text-base"
                >
                  {processText(option.text)}
                </Label>
                {answerChecked && option.id === currentQuestion.correctOptionId && (
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                )}
                {answerChecked &&
                  selectedOption === option.id &&
                  option.id !== currentQuestion.correctOptionId && (
                    <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5 sm:mt-0" />
                  )}
              </div>
            ))}
          </RadioGroup>
          
          {showExplanation && (
            <div className="mt-4 p-3 rounded-md bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Explicação:</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {selectedOption === currentQuestion.correctOptionId
                  ? "Parabéns! Esta é a resposta correta."
                  : `A resposta correta é: ${currentQuestion.options.find(o => o.id === currentQuestion.correctOptionId)?.text}`}
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 px-4 sm:px-6 pb-5">
        <Button
          variant="ghost"
          disabled={currentQuestionIndex === 0}
          onClick={() => {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            setSelectedOption("");
            setAnswerChecked(false);
            setShowExplanation(false);
          }}
          className="flex items-center w-full sm:w-auto justify-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>
        {!answerChecked ? (
          <Button 
            variant="modern" 
            onClick={checkAnswer} 
            className="flex items-center w-full sm:w-auto justify-center bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white"
          >
            <Check className="h-4 w-4 mr-2" />
            Verificar
          </Button>
        ) : (
          <Button 
            variant="modern" 
            onClick={nextQuestion} 
            className="flex items-center w-full sm:w-auto justify-center bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white"
          >
            {isLastQuestion ? "Finalizar" : "Próxima"}
            {!isLastQuestion && <ArrowRight className="h-4 w-4 ml-2" />}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default QuizComponent;
