import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle, XCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { toast } from "@/hooks/use-toast";

import { obterSemana } from "@/models/semanaService";
import { listarLicoesPorSemana } from "@/models/licaoService";
import {
  hasUserCompletedQuiz,
  saveQuizScore
} from "@/models/quizRanking";

// Tipo das perguntas do quiz
interface QuizQuestion {
  id: number;
  day: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

// Tipo para as respostas do usuário
interface UserAnswer {
  questionId: number;
  selectedOption: number | null;
  isCorrect: boolean | null;
}

const QuizPage: React.FC = () => {
  const { semanaId } = useParams<{ semanaId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [semanaTitle, setSemanaTitle] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  // Estados para o sistema do quiz
  const [showWarningDialog, setShowWarningDialog] = useState(true);
  const [userName, setUserName] = useState("");
  const [userNameSubmitted, setUserNameSubmitted] = useState(false);
  const [userId, setUserId] = useState<string>("");
  
  // Adicionar estas linhas no início do componente, logo após as declarações useState
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const [quizEndTime, setQuizEndTime] = useState<number | null>(null);
  const [quizDuration, setQuizDuration] = useState<number | null>(null);
  
  // Função para extrair informações relevantes de uma lição (movida para o escopo do componente)
  const extrairInformacoes = (licao: any) => {
    const textoCompleto = [licao.texto1 || "", licao.texto2 || "", licao.resumo || ""].join(" ");
    const palavrasChave = licao.hashtags ? licao.hashtags.split(' ') : [];
    return {
      titulo: licao.titulo_dia || "",
      subtitulo: licao.subtitulo_dia || "",
      texto: textoCompleto,
      hashtags: palavrasChave
    };
  };
  
  // Verificar se o usuário já completou o quiz
  useEffect(() => {
    const checkQuizCompletion = async () => {
      if (!semanaId) return;
      
      // Gerar um ID de usuário exclusivo e armazenar localmente se não existir
      let storedUserId = localStorage.getItem('quiz_user_id');
      if (!storedUserId) {
        storedUserId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('quiz_user_id', storedUserId);
      }
      setUserId(storedUserId);
      
      try {
        const hasCompleted = await hasUserCompletedQuiz(storedUserId, semanaId);
        
        if (hasCompleted) {
          setError("Você já respondeu a este quiz anteriormente. Cada usuário pode responder o quiz apenas uma vez.");
        }
      } catch (err) {
        console.error("Erro ao verificar conclusão do quiz:", err);
      }
    };
    
    checkQuizCompletion();
  }, [semanaId]);
  
  useEffect(() => {
    const carregarDados = async () => {
      if (!semanaId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Buscar detalhes da semana
        const semanaData = await obterSemana(semanaId);
        
        if (!semanaData) {
          setError("Semana não encontrada. Verifique se o estudo selecionado está disponível.");
          return;
        }
        
        setSemanaTitle(semanaData.titulo);
        
        // Verificar se é a semana 11 para usar o quiz personalizado  
        // Verifica pelo número da semana ou se contém "11" no título
        if (semanaData.numero === 11 || semanaData.titulo?.toLowerCase().includes("coração") || semanaData.titulo?.toLowerCase().includes("adoração")) {
          try {
            // Importar e usar o quiz personalizado da semana 11
            const { quizSemana11 } = await import("@/data/quizSemana11");
            
            // Converter para o formato esperado pelo sistema
            const quizQuestions = quizSemana11.map((q, index) => ({
              id: index + 1,
              day: q.day.toLowerCase(),
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer
            }));
            
            setQuestions(quizQuestions);
            
            // Inicializar as respostas do usuário
            const initialUserAnswers = quizQuestions.map(q => ({
              questionId: q.id,
              selectedOption: null,
              isCorrect: null
            }));
            setUserAnswers(initialUserAnswers);
            return;
          } catch (err) {
            console.error("Erro ao carregar quiz da semana 11:", err);
            setError("Erro ao carregar o quiz personalizado da semana 11. Tente novamente.");
            return;
          }
        }
        
        // Desativar o quiz para outras semanas temporariamente
        setError("Quiz temporariamente indisponível. Estamos trabalhando em novos conteúdos para melhorar sua experiência!");
        return;
        
      } catch (err) {
        console.error("Erro ao carregar dados do quiz:", err);
        setError("Não foi possível carregar o quiz desta lição. Verifique sua conexão e tente novamente.");
        
        toast({
          title: "Erro ao carregar quiz",
          description: "Ocorreu um problema ao buscar as informações para o quiz.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    carregarDados();
  }, [semanaId]);
  
  const processText = (text: string): React.ReactNode => {
    if (!text) return "";
    
    // Processar negrito
    let processed = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Processar sublinhado
    processed = processed.replace(/__([^_]+)__/g, '<u>$1</u>');
    
    // Processar destaque (amarelo)
    processed = processed.replace(/==(.*?)==/g, '<mark>$1</mark>');
    
    return <span dangerouslySetInnerHTML={{ __html: processed }} />;
  };
  
  const handleSubmitUserName = () => {
    if (userName.trim()) {
      localStorage.setItem('quiz_user_name', userName);
      setUserNameSubmitted(true);
      
      // Iniciar o quiz e registrar o tempo inicial
      setShowWarningDialog(false);
      setQuizStartTime(Date.now());
    } else {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, digite seu nome ou @Instagram para continuar.",
        variant: "destructive",
      });
    }
  };
  
  const handleAnswerSelect = (optionIndex: number) => {
    const updatedAnswers = [...userAnswers];
    const currentQuestion = questions[currentQuestionIndex];
    
    updatedAnswers[currentQuestionIndex] = {
      questionId: currentQuestion.id,
      selectedOption: optionIndex,
      isCorrect: optionIndex === currentQuestion.correctAnswer
    };
    
    setUserAnswers(updatedAnswers);
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Se for a última questão, concluir o quiz e registrar o tempo final
      const endTime = Date.now();
      setQuizEndTime(endTime);
      
      // Calcular a duração do quiz em segundos
      if (quizStartTime) {
        const durationInSeconds = Math.floor((endTime - quizStartTime) / 1000);
        setQuizDuration(durationInSeconds);
      }
      
      setQuizCompleted(true);
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const calculateScore = () => {
    const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
    const percentage = Math.round((correctAnswers / questions.length) * 100);
    return { correctAnswers, percentage };
  };
  
  const handleRestartQuiz = () => {
    // Impedir reinício já que o quiz só pode ser respondido uma vez
    toast({
      title: "Quiz já respondido",
      description: "Você só pode responder o quiz uma vez. Seu resultado já foi registrado.",
      variant: "destructive",
    });
  };
  
  const handleFinishQuiz = async () => {
    if (quizCompleted) {
      try {
        // Salvar a pontuação
        const score = calculateScore();
        const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
        
        // Usar o nome armazenado ou um valor padrão
        const storedName = localStorage.getItem('quiz_user_name') || userName || "Anônimo";
        
        const result = await saveQuizScore(
          userId,
          storedName,
          semanaId,
          score.percentage,
          correctAnswers,
          questions.length,
          quizDuration // Passar a duração do quiz em segundos
        );
        
        if (result.success) {
          toast({
            title: "Pontuação salva!",
            description: "Seu resultado foi registrado com sucesso.",
            variant: "default",
          });
          // Navegar de volta para a página de estudos
          navigate("/estudos");
        } else {
          toast({
            title: "Erro ao salvar pontuação",
            description: result.error || "Ocorreu um erro ao salvar sua pontuação.",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Erro ao finalizar quiz:", err);
        toast({
          title: "Erro ao finalizar quiz",
          description: "Ocorreu um erro ao processar seu resultado.",
          variant: "destructive",
        });
      }
    } else {
      // Navegar de volta para a página de estudos
      navigate("/estudos");
    }
  };
  
  const voltar = () => {
    navigate(`/estudos/${semanaId}/licao/sexta`);
  };
  
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-10 px-4 max-w-6xl">
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  if (error) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-10 px-4 max-w-6xl">
          <Button variant="ghost" onClick={voltar} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a lição
          </Button>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-center text-xl text-red-600">Quiz não disponível</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <Alert variant="destructive" className="mb-6">
                  <AlertTitle>Atenção</AlertTitle>
                  <AlertDescription className="text-base">{error}</AlertDescription>
                </Alert>
                
                <Button 
                  onClick={voltar} 
                  className="mt-6"
                >
                  Voltar para a lição
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }
  
  // Tela de resultados do quiz
  if (quizCompleted) {
    const score = calculateScore();
    const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
    
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-10 px-4 max-w-6xl">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Resultados do Quiz: {semanaTitle}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="mb-6">
                <div className="text-center mb-4">
                  <span className="text-4xl font-bold">{score.percentage}%</span>
                  <p className="text-muted-foreground">Pontuação</p>
                </div>
                <Progress value={score.percentage} className="w-64 h-2" />
              </div>
              
              <div className="text-center mb-8">
                <p className="text-lg">
                  Você acertou <span className="font-bold">{correctAnswers}</span> de <span className="font-bold">{questions.length}</span> perguntas
                </p>
              </div>
              
              <div className="space-y-6 w-full max-w-xl">
                {questions.map((question, index) => {
                  const userAnswer = userAnswers[index];
                  const isCorrect = userAnswer.isCorrect;
                  
                  return (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-2 mb-2">
                        {isCorrect ? (
                          <CheckCircle className="text-green-500 h-5 w-5 mt-1 shrink-0" />
                        ) : (
                          <XCircle className="text-red-500 h-5 w-5 mt-1 shrink-0" />
                        )}
                        <div>
                          <p className="font-medium">{index + 1}. {processText(question.question)}</p>
                          <p className="text-sm text-muted-foreground">
                            Dia: {question.day.charAt(0).toUpperCase() + question.day.slice(1)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="ml-7 mt-2">
                        <p className="text-sm">
                          <span className="font-medium">Sua resposta:</span>{" "}
                          {userAnswer.selectedOption !== null 
                            ? question.options[userAnswer.selectedOption] 
                            : "Sem resposta"}
                        </p>
                        
                        {!isCorrect && (
                          <p className="text-sm text-green-600 mt-1">
                            <span className="font-medium">Resposta correta:</span>{" "}
                            {question.options[question.correctAnswer]}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-4">
              <Button onClick={handleFinishQuiz}>
                Finalizar Quiz
              </Button>
            </CardFooter>
          </Card>
        </div>
        <Footer />
      </>
    );
  }
  
  // Tela de aviso antes de iniciar o quiz
  if (showWarningDialog) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-10 px-4 max-w-6xl">
          <Button variant="ghost" onClick={voltar} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a lição
          </Button>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Quiz: {semanaTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <Alert className="mb-6">
                  <AlertTitle>Instruções importantes</AlertTitle>
                  <AlertDescription className="text-base">
                    Este quiz só pode ser respondido <strong>uma única vez</strong>. Sua pontuação será salva automaticamente.
                    <br /><br />
                    <strong>Dica:</strong> Revise todas as lições da semana antes de iniciar o quiz para obter a melhor pontuação possível.
                  </AlertDescription>
                </Alert>
                
                <div className="max-w-md mx-auto space-y-4">
                  <div>
                    <Label htmlFor="userName">Digite seu @Instagram para o quiz:</Label>
                    <Input
                      id="userName"
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="@seunome ou Nome Completo"
                      className="mt-1"
                    />
                  </div>
                  
                  <Button onClick={handleSubmitUserName} size="lg" className="w-full">
                    Começar Quiz
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }
  
  // Tela do quiz
  if (questions.length === 0) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-10 px-4 max-w-6xl">
          <Button variant="ghost" onClick={voltar} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a lição
          </Button>
          
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                Não foi possível gerar perguntas para este quiz. Verifique se todas as lições foram cadastradas.
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = userAnswers[currentQuestionIndex];
  
  return (
    <>
      <Navbar />
      <div className="container mx-auto py-10 px-4 max-w-6xl">
        <Button variant="ghost" onClick={voltar} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para a lição
        </Button>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center mb-2">
              <Badge variant="outline">
                Pergunta {currentQuestionIndex + 1} de {questions.length}
              </Badge>
              <Badge variant="secondary">
                {currentQuestion.day.charAt(0).toUpperCase() + currentQuestion.day.slice(1)}
              </Badge>
            </div>
            <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="mb-4" />
            <CardTitle className="text-xl">{processText(currentQuestion.question)}</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-left p-4 rounded-lg border transition-all quiz-option ${
                    currentAnswer?.selectedOption === index
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                  {processText(option)}
                </button>
              ))}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
            
            <Button 
              onClick={handleNextQuestion}
              disabled={currentAnswer?.selectedOption === null}
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finalizar' : 'Próxima'}
              {currentQuestionIndex < questions.length - 1 && <ChevronRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </>
  );
};

export default QuizPage; 