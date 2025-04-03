
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import QuizComponent from "@/components/study/QuizComponent";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BookOpen, CheckCircle, MessageSquare, Download, ArrowLeft, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserProgress, getUserProgress } from "@/models/userProgress";
import { useQuery, useMutation } from "@tanstack/react-query";

// Função para obter a data formatada em português
const getFormattedDate = (dayOfWeek: string) => {
  const today = new Date();
  const daysMap: {[key: string]: number} = {
    "domingo": 0,
    "segunda": 1,
    "terca": 2,
    "quarta": 3,
    "quinta": 4,
    "sexta": 5,
    "sabado": 6
  };
  
  // Se não for um dia válido, retorna a data atual
  if (!daysMap.hasOwnProperty(dayOfWeek)) {
    return today.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  }
  
  // Ajusta para o dia da semana correspondente
  const dayDiff = daysMap[dayOfWeek] - today.getDay();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + dayDiff);
  
  // Retorna data formatada em português
  return targetDate.toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
};

// Dados fictícios
const lessonData = {
  id: "2",
  title: "Fé e Obras",
  description: "Um estudo sobre a relação entre fé e obras na vida cristã, baseado nas cartas de Tiago e Paulo.",
  content: `<h2>Introdução</h2>
  <p>A relação entre fé e obras é um dos temas mais debatidos no cristianismo. Enquanto Paulo parece enfatizar a salvação pela fé, Tiago destaca a importância das obras. Seriam esses ensinamentos contraditórios?</p>
  
  <h2>A Perspectiva de Paulo</h2>
  <p>Em Efésios 2:8-9, Paulo declara: "Porque pela graça sois salvos, por meio da fé; e isto não vem de vós, é dom de Deus. Não vem das obras, para que ninguém se glorie." Este texto fundamental estabelece que a salvação é um presente de Deus, recebido pela fé, e não algo que podemos conquistar através de nossas obras.</p>
  
  <h2>A Perspectiva de Tiago</h2>
  <p>Em Tiago 2:26, lemos: "Porque, assim como o corpo sem espírito está morto, assim também a fé sem obras é morta." Tiago não contradiz Paulo; ele está falando sobre a natureza da fé genuína – que sempre produz boas obras como seu fruto natural.</p>
  
  <h2>A Harmonia entre Fé e Obras</h2>
  <p>Paulo e Tiago estão abordando aspectos diferentes da mesma verdade. Paulo combate o legalismo – a ideia de que podemos ganhar a salvação. Tiago combate o antinomianismo – a ideia de que a fé não precisa mudar como vivemos.</p>
  
  <p>A verdadeira fé salvadora sempre produz boas obras. Somos salvos pela fé somente, mas a fé que salva nunca está sozinha – ela sempre vem acompanhada de obras.</p>
  
  <h2>Aplicação Prática</h2>
  <p>Como cristãos, devemos viver de maneira que nossa fé seja demonstrada por nossas ações. Não fazemos boas obras para sermos salvos, mas porque já fomos salvos. Nossas obras são evidências de nossa fé, não a base de nossa salvação.</p>
  
  <h2>Conclusão</h2>
  <p>Fé e obras andam juntas na vida cristã. A fé é a raiz, e as obras são o fruto. Confiamos completamente em Jesus para nossa salvação, e essa confiança transforma como vivemos no dia a dia.</p>`,
  progress: 65,
  duration: "15 min",
  points: 80,
  questions: [
    {
      id: "q1",
      text: "Qual apóstolo escreveu: 'Porque pela graça sois salvos, por meio da fé'?",
      options: [
        { id: "a", text: "Pedro" },
        { id: "b", text: "Paulo" },
        { id: "c", text: "Tiago" },
        { id: "d", text: "João" },
      ],
      correctOptionId: "b",
    },
    {
      id: "q2",
      text: "Segundo Tiago, a fé sem obras é:",
      options: [
        { id: "a", text: "Imperfeita" },
        { id: "b", text: "Fraca" },
        { id: "c", text: "Morta" },
        { id: "d", text: "Imatura" },
      ],
      correctOptionId: "c",
    },
    {
      id: "q3",
      text: "Qual é a relação correta entre fé e obras no cristianismo?",
      options: [
        { id: "a", text: "As obras nos salvam, a fé é secundária" },
        { id: "b", text: "A fé nos salva, as obras são evidências da fé" },
        { id: "c", text: "Fé e obras juntas nos salvam em igual medida" },
        { id: "d", text: "A fé é importante apenas no início da vida cristã" },
      ],
      correctOptionId: "b",
    },
    {
      id: "q4",
      text: "Qual livro da Bíblia contém a frase: 'Porque, assim como o corpo sem espírito está morto, assim também a fé sem obras é morta'?",
      options: [
        { id: "a", text: "Romanos" },
        { id: "b", text: "Efésios" },
        { id: "c", text: "Tiago" },
        { id: "d", text: "Hebreus" },
      ],
      correctOptionId: "c",
    },
    {
      id: "q5",
      text: "O que Paulo combate em seus escritos sobre a fé e a salvação?",
      options: [
        { id: "a", text: "O antinomianismo" },
        { id: "b", text: "O legalismo" },
        { id: "c", text: "O ateísmo" },
        { id: "d", text: "O gnosticismo" },
      ],
      correctOptionId: "b",
    },
    {
      id: "q6",
      text: "Como as obras funcionam na vida cristã?",
      options: [
        { id: "a", text: "Como base para a salvação" },
        { id: "b", text: "Como forma de ganhar o favor de Deus" },
        { id: "c", text: "Como evidências da fé genuína" },
        { id: "d", text: "Como algo opcional na vida cristã" },
      ],
      correctOptionId: "c",
    },
    {
      id: "q7",
      text: "Qual é a metáfora usada para descrever a relação entre fé e obras na conclusão do estudo?",
      options: [
        { id: "a", text: "Cabeça e coração" },
        { id: "b", text: "Raiz e fruto" },
        { id: "c", text: "Porta e caminho" },
        { id: "d", text: "Água e fogo" },
      ],
      correctOptionId: "b",
    },
  ],
  comments: [
    {
      author: "Maria Silva",
      text: "Este estudo me ajudou a entender melhor a relação entre fé e obras. Obrigada!",
      date: "2 dias atrás",
    },
    {
      author: "João Oliveira",
      text: "Gostaria de sugerir adicionar mais exemplos práticos de como viver essa fé ativa no dia a dia.",
      date: "5 dias atrás",
    },
  ],
};

const StudyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("content");
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [quizEnabled, setQuizEnabled] = useState(false);
  const [formattedDate, setFormattedDate] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch user progress for this lesson
  const { data: userProgressData, isLoading } = useQuery({
    queryKey: ['lessonProgress', id, user?.id],
    queryFn: async () => {
      if (!user || !id) return null;
      
      const { data, error } = await getUserProgress(user.id);
      
      if (error) {
        console.error("Error fetching user progress:", error);
        return null;
      }
      
      return data.find(p => p.lesson_id === id);
    },
    enabled: !!user && !!id,
  });

  // Update user progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({ progress, completed, pointsEarned }: { 
      progress: number; 
      completed: boolean;
      pointsEarned: number;
    }) => {
      if (!user || !id) return;
      return updateUserProgress(user.id, id, progress, completed, pointsEarned);
    },
    onSuccess: () => {
      console.log("Progress updated successfully");
    },
    onError: (error) => {
      console.error("Error updating progress:", error);
    }
  });

  useEffect(() => {
    if (id) {
      setFormattedDate(getFormattedDate(id));
    }
    
    // Set initial progress from user data
    if (userProgressData) {
      setProgress(userProgressData.progress);
      setIsCompleted(userProgressData.completed);
      setQuizEnabled(userProgressData.progress >= 50);
    }
  }, [id, userProgressData]);
  
  // Track reading progress
  useEffect(() => {
    if (!user || !id) return;
    
    const handleScroll = () => {
      const contentElement = document.getElementById('lesson-content');
      if (!contentElement) return;
      
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
      
      const newProgress = Math.max(
        Math.min(Math.round(scrolled), 100),
        isCompleted ? 100 : progress
      );
      
      if (newProgress > progress && newProgress >= 50) {
        setProgress(newProgress);
        setQuizEnabled(true);
        
        // Update progress in database if it improved
        updateProgressMutation.mutate({ 
          progress: newProgress, 
          completed: isCompleted,
          pointsEarned: isCompleted ? lessonData.points : 0
        });
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [user, id, progress, isCompleted, updateProgressMutation]);

  const handleQuizComplete = (score: number) => {
    const percentage = Math.round((score / lessonData.questions.length) * 100);
    const completed = percentage >= 70;
    setIsCompleted(completed);
    setProgress(100);
    
    // Update progress in database
    if (user && id) {
      updateProgressMutation.mutate({
        progress: 100,
        completed,
        pointsEarned: lessonData.points
      });
    }
    
    toast({
      title: completed ? "Lição concluída!" : "Quiz finalizado",
      description: completed 
        ? `Você ganhou ${lessonData.points} pontos por completar esta lição.` 
        : `Você acertou ${score} de ${lessonData.questions.length} questões.`,
    });
  };

  const handleDownload = () => {
    toast({
      title: "Lição salva para modo offline",
      description: "Você pode acessar esta lição mesmo sem conexão com a internet.",
    });
  };

  const enableQuiz = () => {
    setQuizEnabled(true);
    setActiveTab("quiz");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="seven-container">
          {/* Cabeçalho - Melhorado */}
          <div className="mb-6">
            <Link to="/estudos" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar para Estudos
            </Link>
            
            <div className="bg-card rounded-lg border border-border p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-accent">
                    <Calendar className="h-5 w-5" />
                    <span className="font-medium capitalize">{formattedDate}</span>
                  </div>
                  <h1 className="text-3xl font-bold mb-3">{lessonData.title}</h1>
                  <p className="text-muted-foreground mb-4">{lessonData.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>Lição Jovem</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>{lessonData.points} pontos</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button variant="outline" size="sm" onClick={handleDownload} className="rounded-full">
                    <Download className="h-4 w-4 mr-1" /> Salvar Offline
                  </Button>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-between mb-1 text-sm">
                  <span>Progresso</span>
                  <span>{isCompleted ? "Completo" : `${progress}%`}</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </div>
          
          {/* Conteúdo em abas */}
          <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="content" className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" /> Conteúdo
              </TabsTrigger>
              <TabsTrigger 
                value="quiz" 
                disabled={!quizEnabled} 
                className="flex items-center gap-1"
              >
                <CheckCircle className="h-4 w-4" /> Quiz
              </TabsTrigger>
              <TabsTrigger value="discussion" className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" /> Discussão
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="content">
              <div id="lesson-content" className="bg-card p-6 rounded-lg shadow-sm border border-border">
                <div 
                  className="prose prose-lg max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: lessonData.content }}
                />
                
                <div className="mt-8 flex justify-end">
                  <Button onClick={enableQuiz} className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    Continuar para o Quiz
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="quiz">
              {quizEnabled ? (
                <QuizComponent 
                  questions={lessonData.questions} 
                  onComplete={handleQuizComplete} 
                />
              ) : (
                <div className="bg-muted p-8 rounded-lg text-center">
                  <p className="text-muted-foreground mb-4">
                    Você precisa ler o conteúdo antes de acessar o quiz.
                  </p>
                  <Button onClick={() => setActiveTab("content")} className="rounded-full">
                    Voltar para o Conteúdo
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="discussion">
              <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
                <h2 className="text-xl font-semibold mb-4">Discussão</h2>
                
                <div className="space-y-4 mb-6">
                  {lessonData.comments.map((comment, index) => (
                    <div key={index} className="p-4 bg-muted/50 rounded-lg border border-border">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{comment.author}</span>
                        <span className="text-sm text-muted-foreground">{comment.date}</span>
                      </div>
                      <p>{comment.text}</p>
                    </div>
                  ))}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Adicionar comentário</h3>
                  <textarea 
                    className="w-full p-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    rows={3}
                    placeholder="Compartilhe seus pensamentos sobre esta lição..."
                  ></textarea>
                  <div className="mt-2 flex justify-end">
                    <Button className="rounded-full">Enviar</Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudyDetailPage;
