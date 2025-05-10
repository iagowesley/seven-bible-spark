import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, XCircle, ArrowRight, Trophy, AlertTriangle, Info, User, Calendar } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { obterSemana } from "@/models/semanaService";
import { listarLicoesPorSemana } from "@/models/licaoService";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import {
  hasUserCompletedQuiz,
  saveQuizScore,
  getQuizTopRanking,
  isUserInTopRanking,
  getUserRankingPosition,
  QuizRanking
} from "@/models/quizRanking";

import Ranking from "@/components/ui/ranking";

// Tipo das perguntas do quiz
interface QuizQuestion {
  id: number;
  day: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

// Tipo para o estado da resposta do usuário
interface UserAnswer {
  questionId: number;
  selectedOption: number | null;
  isCorrect: boolean | null;
}

const QuizPage: React.FC = () => {
  const { semanaId = "" } = useParams<{ semanaId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [semanaTitle, setSemanaTitle] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  // Estados para o sistema de ranking
  const [showWarningDialog, setShowWarningDialog] = useState(true);
  const [userName, setUserName] = useState("");
  const [userNameSubmitted, setUserNameSubmitted] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [topRanking, setTopRanking] = useState<any[]>([]);
  const [userRanking, setUserRanking] = useState<number | null>(null);
  const [isInTopRanking, setIsInTopRanking] = useState(false);
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
          
          // Verificar se o usuário está no top 10
          const isInTop = await isUserInTopRanking(storedUserId, semanaId);
          setIsInTopRanking(isInTop);
          
          // Buscar a posição do usuário
          const position = await getUserRankingPosition(storedUserId, semanaId);
          setUserRanking(position);
          
          // Carregar o ranking
          const ranking = await getQuizTopRanking(semanaId);
          setTopRanking(ranking);
          setShowRanking(true);
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
        
        // Desativar o quiz para todas as semanas temporariamente
        setError("Quiz temporariamente indisponível. Estamos trabalhando em novos conteúdos para melhorar sua experiência!");
        return;
        
        // O código abaixo não será executado enquanto o quiz estiver desativado
        // Buscar lições para gerar perguntas do quiz
        const licoes = await listarLicoesPorSemana(semanaId);
        
        if (licoes.length === 0) {
          setError("Nenhuma lição encontrada para esta semana. As lições precisam ser cadastradas antes de realizar o quiz.");
          return;
        }
        
        // Verificar se as lições têm os dias de domingo a sexta
        const diasNecessarios = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta"];
        const diasDisponíveis = licoes.map(licao => licao.dia);
        
        const diasFaltantes = diasNecessarios.filter(dia => !diasDisponíveis.includes(dia));
        
        if (diasFaltantes.length > 0) {
          console.warn(`Dias faltantes no quiz: ${diasFaltantes.join(", ")}`);
        }
        
        // Gerar perguntas baseadas nas lições
        try {
          const quizQuestions = generateQuestions(licoes);
          
          if (quizQuestions.length === 0) {
            setError("Não foi possível gerar perguntas para o quiz. Verifique se as lições estão completas.");
            return;
          }
          
          setQuestions(quizQuestions);
          
          // Inicializar as respostas do usuário
          const initialUserAnswers = quizQuestions.map(q => ({
            questionId: q.id,
            selectedOption: null,
            isCorrect: null
          }));
          setUserAnswers(initialUserAnswers);
        } catch (e) {
          console.error("Erro ao gerar perguntas:", e);
          setError("Ocorreu um erro ao gerar as perguntas do quiz. Tente novamente mais tarde.");
        }
        
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
  
  // Função para gerar as perguntas do quiz com base nas lições
  const generateQuestions = (licoes: any[]): QuizQuestion[] => {
    // Organizar lições por dia
    const licoesPorDia = licoes.reduce((acc, licao) => {
      if (licao.dia !== "sabado") {
        if (!acc[licao.dia]) acc[licao.dia] = [];
        acc[licao.dia].push(licao);
      }
      return acc;
    }, {} as Record<string, any[]>);
    
    // Dias da semana para processamento
    const diasSemana = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta"];
    
    // Usar conjunto fixo de perguntas específicas para todas as semanas
    const perguntasFixas: QuizQuestion[] = [
      // Domingo
      {
        id: 1,
        day: "domingo",
        question: "Qual era o título principal da lição de domingo?",
        options: [
          // A primeira opção será substituída pelo título real da lição
          "[Título da lição de domingo]",
          "Oração no Monte",
          "Compromisso para a Vida",
          "Adoração Verdadeira"
        ],
        correctAnswer: 0
      },
      {
        id: 2,
        day: "domingo",
        question: "Segundo a lição de domingo, qual destes é o principal objetivo do altar espiritual?",
        options: [
          "Comunhão diária com Deus",
          "Demonstração pública de fé",
          "Obtenção de bênçãos materiais",
          "Cumprir uma obrigação religiosa"
        ],
        correctAnswer: 0
      },
      
      // Segunda
      {
        id: 3,
        day: "segunda",
        question: "Na lição de segunda-feira, qual personagem bíblico foi apresentado como exemplo de restaurador do altar?",
        options: [
          "Elias no Monte Carmelo",
          "Abraão no Monte Moriá",
          "Josué após a travessia do Jordão",
          "Samuel em Mispa"
        ],
        correctAnswer: 0
      },
      {
        id: 4,
        day: "segunda",
        question: "De acordo com a lição de segunda-feira, o que Elias fez antes de pedir o fogo do céu?",
        options: [
          "Restaurou o altar quebrado",
          "Ofereceu sacrifícios caros",
          "Realizou um jejum de 40 dias",
          "Convocou todo o povo para orar"
        ],
        correctAnswer: 0
      },
      
      // Terça
      {
        id: 5,
        day: "terca",
        question: "Segundo a lição de terça-feira, qual é o maior obstáculo para manter um altar espiritual ativo hoje?",
        options: [
          "A rotina acelerada e as distrações tecnológicas",
          "A falta de interesse em assuntos espirituais",
          "O materialismo e o consumismo excessivos",
          "A ausência de disciplina pessoal"
        ],
        correctAnswer: 0
      },
      {
        id: 6,
        day: "terca",
        question: "Conforme a lição de terça-feira, qual deve ser a frequência ideal para momentos de devoção pessoal?",
        options: [
          "Diária",
          "Semanal",
          "Mensal",
          "Quando sentir necessidade"
        ],
        correctAnswer: 0
      },
      
      // Quarta
      {
        id: 7,
        day: "quarta",
        question: "De acordo com a lição de quarta-feira, qual é o papel da família na manutenção do altar espiritual?",
        options: [
          "Ser o primeiro círculo de influência espiritual e prática da fé",
          "Complementar o ensino dado pela igreja nos finais de semana",
          "Terceirizar a educação espiritual para escolas confessionais",
          "Organizar eventos religiosos em datas comemorativas"
        ],
        correctAnswer: 0
      },
      {
        id: 8,
        day: "quarta",
        question: "Qual prática familiar foi especificamente recomendada na lição de quarta-feira?",
        options: [
          "Culto familiar diário",
          "Leitura individual da Bíblia",
          "Participação exclusiva nos cultos de sábado",
          "Memorização semanal de versículos"
        ],
        correctAnswer: 0
      },
      
      // Quinta
      {
        id: 9,
        day: "quinta",
        question: "Na lição de quinta-feira, qual local bíblico foi citado como cenário da restauração do altar por Elias?",
        options: [
          "Monte Carmelo, durante o confronto com os profetas de Baal",
          "Samaria, na presença do rei Acabe",
          "Vale do Jordão, depois da seca de três anos e meio",
          "Sarepta, na casa da viúva"
        ],
        correctAnswer: 0
      },
      {
        id: 10,
        day: "quinta",
        question: "Conforme a lição de quinta-feira, quantas vezes Elias derramou água sobre o sacrifício?",
        options: [
          "Três vezes",
          "Uma vez",
          "Sete vezes",
          "Nenhuma vez"
        ],
        correctAnswer: 0
      },
      
      // Sexta
      {
        id: 11,
        day: "sexta",
        question: "De acordo com a lição de sexta-feira, qual foi o resultado imediato da oração de Elias no Monte Carmelo?",
        options: [
          "Fogo do Senhor desceu e consumiu o holocausto, a lenha, as pedras e a água",
          "Começou a chover, encerrando a seca de três anos e meio",
          "O povo clamou: 'O Senhor é Deus! O Senhor é Deus!'",
          "Os profetas de Baal foram capturados no ribeiro de Quisom"
        ],
        correctAnswer: 0
      },
      {
        id: 12,
        day: "sexta",
        question: "Segundo a conclusão da lição de sexta-feira, o que devemos fazer para restaurar nosso altar pessoal?",
        options: [
          "Estabelecer um tempo diário específico para oração e estudo da Bíblia",
          "Participar de mais atividades na igreja",
          "Realizar projetos de evangelismo",
          "Fazer doações para causas religiosas"
        ],
        correctAnswer: 0
      }
    ];
    
    // Preencher a primeira opção com o título real das lições onde aplicável
    diasSemana.forEach(dia => {
      if (licoesPorDia[dia] && licoesPorDia[dia].length > 0) {
        const licao = licoesPorDia[dia][0];
        
        // Para a primeira pergunta de cada dia (sobre o título)
        const perguntaTitulo = perguntasFixas.find(p => p.day === dia && p.id % 2 === 1);
        if (perguntaTitulo && licao.titulo_dia) {
          perguntaTitulo.options[0] = licao.titulo_dia;
        }
      }
    });
    
    // Filtrar apenas as perguntas para os dias que temos lições
    const perguntasFiltradas = perguntasFixas.filter(pergunta => {
      return licoesPorDia[pergunta.day] && licoesPorDia[pergunta.day].length > 0;
    });
    
    // Garantir que todas as perguntas tenham os campos esperados e que os índices estejam corretos
    return perguntasFiltradas.map((q, idx) => ({
      ...q,
      id: idx + 1,
      correctAnswer: q.correctAnswer
    }));
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
  
  const handleSubmitUserName = () => {
    if (!userName.trim()) {
      toast({
        title: "Instagram obrigatório",
        description: "Por favor, digite seu @Instagram para continuar",
        variant: "destructive",
      });
      return;
    }
    
    // Validar que começa com @
    let instagramUsername = userName.trim();
    if (!instagramUsername.startsWith('@')) {
      instagramUsername = '@' + instagramUsername;
      setUserName(instagramUsername);
    }
    
    // Salvar o nome do usuário no localStorage
    localStorage.setItem('quiz_user_name', instagramUsername);
    
    // Iniciar o quiz e registrar o tempo inicial
    setUserNameSubmitted(true);
    setShowWarningDialog(false);
    setQuizStartTime(Date.now());
  };
  
  const loadRanking = async () => {
    if (!semanaId) return;
    
    try {
      const ranking = await getQuizTopRanking(semanaId);
      setTopRanking(ranking);
    } catch (err) {
      console.error("Erro ao carregar ranking:", err);
    }
  };
  
  const handleAnswerSelect = (optionIndex: number) => {
    // Evitar alteração após verificar a resposta
    if (userAnswers[currentQuestionIndex].isCorrect !== null) return;
    
    // Atualizar o estado das respostas do usuário
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestionIndex] = {
      ...updatedAnswers[currentQuestionIndex],
      selectedOption: optionIndex
    };
    
    setUserAnswers(updatedAnswers);
  };
  
  const handleNextQuestion = () => {
    // Verificar se há uma resposta selecionada
    if (userAnswers[currentQuestionIndex].selectedOption === null) {
      toast({
        title: "Selecione uma resposta",
        description: "Por favor, selecione uma opção para continuar",
        variant: "destructive",
      });
      return;
    }
    
    // Verificar se a resposta está correta
    const currentQuestion = questions[currentQuestionIndex];
    const selectedOption = userAnswers[currentQuestionIndex].selectedOption;
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    
    // Atualizar o estado das respostas do usuário com o resultado da verificação
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestionIndex] = {
      ...updatedAnswers[currentQuestionIndex],
      isCorrect: isCorrect
    };
    
    setUserAnswers(updatedAnswers);
    
    // Se for a última questão, concluir o quiz e registrar o tempo final
    if (currentQuestionIndex === questions.length - 1) {
      const endTime = Date.now();
      setQuizEndTime(endTime);
      
      // Calcular a duração do quiz em segundos
      if (quizStartTime) {
        const durationInSeconds = Math.floor((endTime - quizStartTime) / 1000);
        setQuizDuration(durationInSeconds);
      }
      
      setQuizCompleted(true);
    } else {
      // Avançar para a próxima questão
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const calculateScore = () => {
    const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
    return {
      correctCount: correctAnswers,
      percentage: Math.round((correctAnswers / questions.length) * 100)
    };
  };
  
  const handleRestartQuiz = () => {
    // Impedir reinício já que o quiz só pode ser respondido uma vez
    toast({
      title: "Operação não permitida",
      description: "Você só pode responder o quiz uma vez. Seu resultado já foi registrado.",
      variant: "destructive",
    });
  };
  
  const handleFinishQuiz = async () => {
    if (quizCompleted && !showRanking) {
      // Salvar a pontuação no ranking
      try {
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
          // Buscar a posição do usuário no ranking
          if (result.ranking) {
            setUserRanking(result.ranking);
            setIsInTopRanking(result.ranking <= 10);
          }
          
          // Carregar o ranking
          await loadRanking();
          setShowRanking(true);
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
    } else if (showRanking) {
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
                
                {showRanking && (
                  <div className="mt-8">
                    <Ranking 
                      rankings={topRanking}
                      currentUserId={userId}
                      userRanking={userRanking}
                      isInTopRanking={isInTopRanking}
                    />
                  </div>
                )}
                
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
              {showRanking ? (
                <div className="w-full max-w-2xl mx-auto">
                  <Ranking 
                    rankings={topRanking}
                    currentUserId={userId}
                    userRanking={userRanking}
                    isInTopRanking={isInTopRanking}
                    title="Seu resultado no ranking"
                    description="Veja como você se posicionou em relação aos demais participantes"
                  />
                </div>
              ) : (
                <>
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
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-center gap-4">
              {showRanking ? (
                <Button onClick={handleFinishQuiz}>
                  Voltar para Estudos
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleRestartQuiz}
                    className="hidden" // Escondido pois o quiz só pode ser feito uma vez
                  >
                    Tentar Novamente
                  </Button>
                  <Button onClick={handleFinishQuiz}>
                    Ver Ranking
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        </div>
        <Footer />
      </>
    );
  }
  
  // Dialog de aviso
  if (showWarningDialog && !error) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-10 px-4 max-w-6xl">
          <Button variant="ghost" onClick={voltar} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Estudos
          </Button>
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{semanaTitle}</h1>
            <p className="text-muted-foreground">
              Teste seus conhecimentos sobre as lições dessa semana.
            </p>
          </div>
          
          <Card className="border-yellow-200 dark:border-yellow-800 shadow-md">
            <CardHeader className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-100 dark:border-yellow-800/30">
              <CardTitle className="flex items-center text-yellow-800 dark:text-yellow-300">
                <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                Atenção! Você só pode responder uma vez
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-6 space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Este quiz só pode ser respondido <strong>uma única vez</strong>. Sua pontuação será salva e você poderá ver sua posição no ranking.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Os 10 melhores resultados aparecerão no ranking. Estude bem antes de começar!
                </p>
                  
                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30 text-blue-800 dark:text-blue-300">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-sm">
                    Dica: Revise todas as lições da semana antes de iniciar o quiz para obter a melhor pontuação possível.
                  </AlertDescription>
                </Alert>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">
                  Digite seu @Instagram para o ranking:
                </label>
                <div className="flex gap-3">
                  <Input 
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="@seunome"
                    className="flex-1"
                    autoFocus
                  />
                  <Button 
                    onClick={handleSubmitUserName}
                    className="bg-primary hover:bg-primary/90"
                  >
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
  const currentQuestion = questions[currentQuestionIndex];
  const currentUserAnswer = userAnswers[currentQuestionIndex];
  
  return (
    <>
      <Navbar />
      <div className="container mx-auto py-10 px-4 max-w-6xl">
        <Button variant="ghost" onClick={voltar} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Estudos
        </Button>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{semanaTitle}</h1>
          <p className="text-muted-foreground">
            Teste seus conhecimentos sobre as lições dessa semana.
          </p>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : questions.length === 0 ? (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Sem perguntas disponíveis</AlertTitle>
            <AlertDescription>
              Não foi possível gerar perguntas para este quiz. Verifique se todas as lições foram cadastradas.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {quizCompleted ? (
              <Card className="modern-card shadow-lg border border-primary/10">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
                  <CardTitle className="text-center text-2xl">Resultados do Quiz</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                      {calculateScore().percentage >= 70 ? (
                        <CheckCircle className="h-16 w-16 text-green-500" />
                      ) : calculateScore().percentage >= 50 ? (
                        <CheckCircle className="h-16 w-16 text-amber-500" />
                      ) : (
                        <XCircle className="h-16 w-16 text-destructive" />
                      )}
                    </div>
                    <h2 className="text-3xl font-bold mb-2">{calculateScore().percentage}%</h2>
                    <p className="text-muted-foreground">
                      Você acertou {calculateScore().correctCount} de {questions.length} questões
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold border-b pb-2">Resumo das respostas:</h3>
                    {questions.map((question, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${userAnswers[index].isCorrect ? 'border-green-200 bg-green-50 dark:bg-green-900/10' : 'border-red-200 bg-red-50 dark:bg-red-900/10'}`}>
                        <div className="flex items-start gap-2 mb-2">
                          {userAnswers[index].isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                          )}
                          <div className="font-medium">{processText(question.question)}</div>
                        </div>
                        
                        <div className="pl-7 text-sm">
                          <p className="mb-1">
                            <span className="font-medium">Sua resposta:</span> {userAnswers[index].selectedOption !== null ? processText(question.options[userAnswers[index].selectedOption]) : "Sem resposta"}
                          </p>
                          {!userAnswers[index].isCorrect && (
                            <p className="text-green-600 dark:text-green-400">
                              <span className="font-medium">Resposta correta:</span> {processText(question.options[question.correctAnswer])}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 p-6">
                  <Button 
                    variant="outline"
                    onClick={handleRestartQuiz}
                    className="w-full sm:w-auto"
                  >
                    Tentar Novamente
                  </Button>
                  <Button 
                    variant="modern"
                    onClick={handleFinishQuiz}
                    className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white"
                  >
                    Concluir Estudo
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card className="modern-card shadow-lg border border-primary/10">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg p-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Questão {currentQuestionIndex + 1} de {questions.length}</span>
                    <span className="text-sm text-muted-foreground">
                      Acertos: {userAnswers.filter(a => a.isCorrect === true).length} / {currentQuestionIndex}
                    </span>
                  </div>
                  <Progress value={(currentQuestionIndex / questions.length) * 100} className="h-2 mt-4 mb-6" />
                  <div className="text-lg font-medium">
                    {processText(questions[currentQuestionIndex].question)}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <RadioGroup 
                    value={userAnswers[currentQuestionIndex].selectedOption !== null ? 
                      userAnswers[currentQuestionIndex].selectedOption.toString() : undefined}
                    className="space-y-3"
                  >
                    {questions[currentQuestionIndex].options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`flex items-start space-x-3 border p-4 rounded-md transition-all ${
                          userAnswers[currentQuestionIndex].selectedOption === optionIndex && 
                          userAnswers[currentQuestionIndex].isCorrect !== null
                            ? userAnswers[currentQuestionIndex].isCorrect
                              ? "border-green-500 bg-green-50 dark:bg-green-900/10 shadow-sm"
                              : "border-red-500 bg-red-50 dark:bg-red-900/10 shadow-sm"
                            : userAnswers[currentQuestionIndex].selectedOption === optionIndex
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "hover:bg-muted/50 border-muted-foreground/20"
                        } cursor-pointer`}
                        onClick={() => handleAnswerSelect(optionIndex)}
                      >
                        <RadioGroupItem
                          value={optionIndex.toString()}
                          id={`option-${optionIndex}`}
                          disabled={userAnswers[currentQuestionIndex].isCorrect !== null}
                          className="mt-1"
                        />
                        <Label
                          htmlFor={`option-${optionIndex}`}
                          className="flex-grow cursor-pointer leading-relaxed font-light"
                        >
                          {processText(option)}
                        </Label>
                        {userAnswers[currentQuestionIndex].isCorrect !== null &&
                          optionIndex === questions[currentQuestionIndex].correctAnswer && (
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          )}
                        {userAnswers[currentQuestionIndex].isCorrect === false &&
                          userAnswers[currentQuestionIndex].selectedOption === optionIndex && (
                            <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                          )}
                      </div>
                    ))}
                  </RadioGroup>
                  
                  {userAnswers[currentQuestionIndex].isCorrect !== null && (
                    <div className={`mt-4 p-3 rounded-md ${
                      userAnswers[currentQuestionIndex].isCorrect
                        ? "bg-green-50 dark:bg-green-900/10 border-green-200"
                        : "bg-red-50 dark:bg-red-900/10 border-red-200"
                      } border`}
                    >
                      <p className={`text-sm font-medium ${
                        userAnswers[currentQuestionIndex].isCorrect
                          ? "text-green-700 dark:text-green-300"
                          : "text-red-700 dark:text-red-300"
                        }`}
                      >
                        {userAnswers[currentQuestionIndex].isCorrect
                          ? "Parabéns! Esta é a resposta correta."
                          : `Incorreto. A resposta correta é: ${questions[currentQuestionIndex].options[questions[currentQuestionIndex].correctAnswer]}`
                        }
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between p-6">
                  <Button 
                    variant="ghost"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="w-24"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Anterior
                  </Button>
                  
                  <Button 
                    variant="modern"
                    onClick={handleNextQuestion}
                    className="w-24 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white"
                  >
                    {userAnswers[currentQuestionIndex].isCorrect !== null
                      ? currentQuestionIndex === questions.length - 1
                        ? "Finalizar"
                        : "Próxima"
                      : "Verificar"
                    }
                    {userAnswers[currentQuestionIndex].isCorrect !== null && 
                     currentQuestionIndex < questions.length - 1 && 
                     <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default QuizPage; 