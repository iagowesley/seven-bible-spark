import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import QuizComponent from "@/components/study/QuizComponent";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BookOpen, CheckCircle, MessageSquare, Download, ArrowLeft, Calendar, X, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserProgress, saveComment, getCommentsByLessonId, Comment } from "@/models/userProgress";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

const getFormattedDate = (dayOfWeek: string) => {
  const fixedDates: {[key: string]: Date} = {
    "sabado": new Date(2024, 3, 5),  
    "domingo": new Date(2024, 3, 6), 
    "segunda": new Date(2024, 3, 7), 
    "terca": new Date(2024, 3, 8),   
    "quarta": new Date(2024, 3, 9),  
    "quinta": new Date(2024, 3, 10), 
    "sexta": new Date(2024, 3, 11)  
  };
  
  if (!fixedDates.hasOwnProperty(dayOfWeek)) {
    return "";
  }
  
  const dayNames: {[key: string]: string} = {
    "sabado": "sábado",
    "domingo": "domingo",
    "segunda": "segunda-feira",
    "terca": "terça-feira",
    "quarta": "quarta-feira",
    "quinta": "quinta-feira",
    "sexta": "sexta-feira"
  };
  
  const date = fixedDates[dayOfWeek];
  const day = date.getDate();
  const month = date.toLocaleDateString('pt-BR', { month: 'long' });
  
  return `${day} de ${month} - ${dayNames[dayOfWeek]}`;
};

const lessonData = {
  id: "2",
  title: "O início do altar",
  description: "",
  content: ``,
  progress: 65,
  duration: "15 min",
  points: 80,
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
  questions: [
    {
      id: "domingo_q1",
      text: "Na história do monitor de internato, o que foi roubado pelo calouro?",
      options: [
        { id: "a", text: "Dinheiro e objetos de valor" },
        { id: "b", text: "Roupas, incluindo roupa íntima" },
        { id: "c", text: "Material de estudo e livros" },
        { id: "d", text: "Apenas camisas coloridas" },
      ],
      correctOptionId: "b",
    },
    {
      id: "domingo_q2",
      text: "De acordo com o texto, o que Adão e Eva usaram para se cobrir após o pecado?",
      options: [
        { id: "a", text: "Peles de animais" },
        { id: "b", text: "Folhas de figueira" },
        { id: "c", text: "Ramos de oliveira" },
        { id: "d", text: "Roupas tecidas" },
      ],
      correctOptionId: "b",
    },
    {
      id: "domingo_q3",
      text: "Qual ato da graça de Deus inaugura o altar de sacrifício nas Escrituras?",
      options: [
        { id: "a", text: "A expulsão de Adão e Eva do Éden" },
        { id: "b", text: "A promessa de um Salvador" },
        { id: "c", text: "A fabricação de roupas de peles para Adão e Eva" },
        { id: "d", text: "O envio de um anjo para guardar o Éden" },
      ],
      correctOptionId: "c",
    },
    {
      id: "domingo_q4",
      text: "Qual é a principal reflexão que o autor faz sobre a história do roubo?",
      options: [
        { id: "a", text: "Os perigos da vida universitária" },
        { id: "b", text: "A importância de proteger seus pertences" },
        { id: "c", text: "O que os seres humanos são capazes de fazer para se cobrir" },
        { id: "d", text: "Como lidar com estudantes problemáticos" },
      ],
      correctOptionId: "c",
    },
    {
      id: "domingo_q5",
      text: "Em qual versículo bíblico se encontra a referência às vestes feitas por Deus para Adão e Eva?",
      options: [
        { id: "a", text: "Gênesis 3:7" },
        { id: "b", text: "Gênesis 3:21" },
        { id: "c", text: "Gênesis 3:15" },
        { id: "d", text: "Gênesis 3:24" },
      ],
      correctOptionId: "b",
    },
    {
      id: "domingo_q6",
      text: "Qual leitura adicional é recomendada na seção 'Mergulhe + fundo'?",
      options: [
        { id: "a", text: "Patriarcas e Profetas, capítulo 3: 'A tentação e a queda'" },
        { id: "b", text: "Patriarcas e Profetas, capítulo 4: 'O plano da redenção'" },
        { id: "c", text: "O Desejado de Todas as Nações, capítulo 1" },
        { id: "d", text: "O Grande Conflito, introdução" },
      ],
      correctOptionId: "b",
    },
    {
      id: "segunda_q1",
      text: "Qual foi a reação imediata de Adão e Eva após o pecado?",
      options: [
        { id: "a", text: "Sentiram alegria" },
        { id: "b", text: "Sentiram fome" },
        { id: "c", text: "Sentiram vergonha e se esconderam" },
        { id: "d", text: "Planejaram fugir do Éden" },
      ],
      correctOptionId: "c",
    },
    {
      id: "segunda_q2",
      text: "Segundo o texto, o que o pecado adicionou à realidade que até então era perfeita?",
      options: [
        { id: "a", text: "Conhecimento" },
        { id: "b", text: "Liberdade" },
        { id: "c", text: "Morte" },
        { id: "d", text: "Criatividade" },
      ],
      correctOptionId: "c",
    },
    {
      id: "segunda_q3",
      text: "Em Gênesis 3:21, qual esperança Deus ofereceu a Adão e Eva?",
      options: [
        { id: "a", text: "Fez roupas de pele para eles" },
        { id: "b", text: "Permitiu que continuassem no Éden" },
        { id: "c", text: "Ensinou-os a cultivar alimentos" },
        { id: "d", text: "Deu-lhes acesso limitado à árvore da vida" },
      ],
      correctOptionId: "a",
    },
    {
      id: "segunda_q4",
      text: "De acordo com Levítico 17:11, o que está no sangue?",
      options: [
        { id: "a", text: "A pureza" },
        { id: "b", text: "A vida da carne" },
        { id: "c", text: "O perdão" },
        { id: "d", text: "A salvação" },
      ],
      correctOptionId: "b",
    },
    {
      id: "segunda_q5",
      text: "Qual é o significado do altar do Éden no contexto do sistema do santuário?",
      options: [
        { id: "a", text: "Era apenas um símbolo sem importância prática" },
        { id: "b", text: "Introduziu o conceito de expiação substitutiva" },
        { id: "c", text: "Ensinava apenas sobre higiene e saúde" },
        { id: "d", text: "Demonstrava a superioridade dos animais sobre os humanos" },
      ],
      correctOptionId: "b",
    },
    {
      id: "segunda_q6",
      text: "Segundo o texto, o que Jesus, o Cordeiro de Deus, fez pelo pecado da humanidade?",
      options: [
        { id: "a", text: "Apenas mostrou o exemplo de uma vida perfeita" },
        { id: "b", text: "Pagou o preço para perdoar e remover completamente os pecados" },
        { id: "c", text: "Ensinou como podemos expiar nossos próprios pecados" },
        { id: "d", text: "Eliminou a necessidade de arrependimento" },
      ],
      correctOptionId: "b",
    },
    {
      id: "terca_q1",
      text: "Quantas vezes a Bíblia menciona altares?",
      options: [
        { id: "a", text: "Menos de 100 vezes" },
        { id: "b", text: "Cerca de 200 vezes" },
        { id: "c", text: "Mais de 400 vezes" },
        { id: "d", text: "Mais de 1000 vezes" },
      ],
      correctOptionId: "c",
    },
    {
      id: "terca_q2",
      text: "Qual é a primeira referência explícita a um altar na Bíblia?",
      options: [
        { id: "a", text: "Quando Caim e Abel ofereceram sacrifícios" },
        { id: "b", text: "Quando Noé construiu um altar após o dilúvio" },
        { id: "c", text: "Quando Abraão construiu um altar em Canaã" },
        { id: "d", text: "Quando Moisés recebeu instruções para o tabernáculo" },
      ],
      correctOptionId: "b",
    },
    {
      id: "terca_q3",
      text: "O que é secundário na história do Éden, segundo o texto?",
      options: [
        { id: "a", text: "O pecado de Adão e Eva" },
        { id: "b", text: "O altar" },
        { id: "c", text: "A expulsão do jardim" },
        { id: "d", text: "A promessa do Messias" },
      ],
      correctOptionId: "b",
    },
    {
      id: "terca_q4",
      text: "Qual é o foco principal na história do Éden, conforme mencionado no texto?",
      options: [
        { id: "a", text: "A desobediência humana" },
        { id: "b", text: "As consequências do pecado" },
        { id: "c", text: "As roupas de pele urgentemente necessárias" },
        { id: "d", text: "A maldição da terra" },
      ],
      correctOptionId: "c",
    },
    {
      id: "terca_q5",
      text: "Segundo o texto, quando foi concebido o plano da salvação?",
      options: [
        { id: "a", text: "Após a queda de Adão e Eva" },
        { id: "b", text: "Durante a criação do mundo" },
        { id: "c", text: "No tempo de Abraão" },
        { id: "d", text: "Desde eras eternas, antes da criação" },
      ],
      correctOptionId: "d",
    },
    {
      id: "terca_q6",
      text: "O que o altar do Éden revela sobre Deus, segundo o texto?",
      options: [
        { id: "a", text: "Sua ira contra o pecado" },
        { id: "b", text: "Seu amor, comprometimento e entrega às Suas criaturas" },
        { id: "c", text: "Sua impaciência com os seres humanos" },
        { id: "d", text: "Seu desejo de punir os transgressores" },
      ],
      correctOptionId: "b",
    },
    {
      id: "quarta_q1",
      text: "Qual característica do par edênico é destacada quando Deus os abordou após a queda?",
      options: [
        { id: "a", text: "O senso de autorresponsabilidade foi zero" },
        { id: "b", text: "A capacidade de argumentação" },
        { id: "c", text: "A inteligência para inventar desculpas" },
        { id: "d", text: "A sinceridade em reconhecer o erro" },
      ],
      correctOptionId: "a",
    },
    {
      id: "quarta_q2",
      text: "Qual comportamento humano, presente desde o início da história pós-pecado, é mencionado no texto?",
      options: [
        { id: "a", text: "A capacidade de perdoar" },
        { id: "b", text: "A terceirização da culpa" },
        { id: "c", text: "O desejo de se esconder" },
        { id: "d", text: "A busca por conhecimento" },
      ],
      correctOptionId: "b",
    },
    {
      id: "quarta_q3",
      text: "Como o texto descreve a abordagem de Deus quando questionou Adão e Eva?",
      options: [
        { id: "a", text: "Abusiva e violenta" },
        { id: "b", text: "Fez perguntas sem ofender ou ferir" },
        { id: "c", text: "Demonstrou ira e irritação" },
        { id: "d", text: "Ignorou completamente o que aconteceu" },
      ],
      correctOptionId: "b",
    },
    {
      id: "quarta_q4",
      text: "O que Deus colocou imediatamente em prática após o pecado, segundo o texto?",
      options: [
        { id: "a", text: "Um novo sistema de educação" },
        { id: "b", text: "Uma nova criação" },
        { id: "c", text: "O evangelho eterno" },
        { id: "d", text: "Um novo jardim" },
      ],
      correctOptionId: "c",
    },
    {
      id: "quarta_q5",
      text: "Por que Deus retirou Adão e Eva do jardim, segundo a lição?",
      options: [
        { id: "a", text: "Como forma de punição" },
        { id: "b", text: "Para que não se tornassem pecadores eternos pelo contato com a árvore da vida" },
        { id: "c", text: "Para que aprendessem a sobreviver sozinhos" },
        { id: "d", text: "Para que outros humanos pudessem entrar no jardim" },
      ],
      correctOptionId: "b",
    },
    {
      id: "quarta_q6",
      text: "O que a seção de estudo pede para analisar nos versículos bíblicos citados?",
      options: [
        { id: "a", text: "Os tipos de pecados cometidos" },
        { id: "b", text: "As promessas divinas" },
        { id: "c", text: "O propósito e o significado dos altares" },
        { id: "d", text: "A genealogia dos patriarcas" },
      ],
      correctOptionId: "c",
    },
    {
      id: "quinta_q1",
      text: "Qual era a condição dos tênis do filho do autor?",
      options: [
        { id: "a", text: "Novos" },
        { id: "b", text: "Molhados" },
        { id: "c", text: "Bem sujos" },
        { id: "d", text: "Rasgados" },
      ],
      correctOptionId: "c",
    },
    {
      id: "quinta_q2",
      text: "O que o autor estava realmente ensinando ao seu filho ao limpar os tênis?",
      options: [
        { id: "a", text: "Apenas uma habilidade doméstica" },
        { id: "b", text: "A importância da higiene" },
        { id: "c", text: "Um exemplo a seguir" },
        { id: "d", text: "A economizar dinheiro" },
      ],
      correctOptionId: "c",
    },
    {
      id: "quinta_q3",
      text: "De acordo com o texto, qual é o propósito das ações de Deus em relação aos humanos?",
      options: [
        { id: "a", text: "Apenas castigar o pecado" },
        { id: "b", text: "Servir como exemplo para seguirmos" },
        { id: "c", text: "Mostrar Seu poder" },
        { id: "d", text: "Estabelecer regras rígidas" },
      ],
      correctOptionId: "b",
    },
    {
      id: "quinta_q4",
      text: "O que Deus precisou fazer para cobrir Adão e Eva?",
      options: [
        { id: "a", text: "Criar novas roupas do nada" },
        { id: "b", text: "Pegar folhas de figueira" },
        { id: "c", text: "Matar um animal inocente" },
        { id: "d", text: "Perdoá-los sem nenhuma ação" },
      ],
      correctOptionId: "c",
    },
    {
      id: "quinta_q5",
      text: "Qual princípio o rei Davi entendeu, segundo o texto?",
      options: [
        { id: "a", text: "Que sacrifícios devem ter um custo pessoal" },
        { id: "b", text: "Que não é necessário fazer sacrifícios" },
        { id: "c", text: "Que sacrifícios são apenas simbólicos" },
        { id: "d", text: "Que os sacrifícios devem ser feitos em público" },
      ],
      correctOptionId: "a",
    },
    {
      id: "quinta_q6",
      text: "De acordo com o texto, o que são altares?",
      options: [
        { id: "a", text: "Lugares de comunhão" },
        { id: "b", text: "Locais para construção" },
        { id: "c", text: "Objetos decorativos" },
        { id: "d", text: "Lugares de sacrifício" },
      ],
      correctOptionId: "d",
    },
    {
      id: "sexta_q1",
      text: "Segundo o texto de Ellen G. White, o que Jesus Cristo preparou?",
      options: [
        { id: "a", text: "Um novo jardim" },
        { id: "b", text: "O manto de Sua própria justiça" },
        { id: "c", text: "Uma nova lei" },
        { id: "d", text: "Um lugar no céu" },
      ],
      correctOptionId: "b",
    },
    {
      id: "sexta_q2",
      text: "O que, segundo o texto, nunca cobrirá nossa nudez espiritual?",
      options: [
        { id: "a", text: "Boas obras" },
        { id: "b", text: "Arrependimento superficial" },
        { id: "c", text: "Um abrigo de folhas de figueiras" },
        { id: "d", text: "Doações à igreja" },
      ],
      correctOptionId: "c",
    },
    {
      id: "sexta_q3",
      text: "De acordo com a citação, o que Deus vê quando olha para o pecador arrependido coberto pela justiça de Cristo?",
      options: [
        { id: "a", text: "Os pecados do passado" },
        { id: "b", text: "As folhas de figueira" },
        { id: "c", text: "A culpa e a vergonha" },
        { id: "d", text: "A própria justiça de Cristo" },
      ],
      correctOptionId: "d",
    },
    {
      id: "sexta_q4",
      text: "O que aconteceu com a lei de Deus no plano da salvação, segundo o texto?",
      options: [
        { id: "a", text: "Foi abolida" },
        { id: "b", text: "Foi modificada" },
        { id: "c", text: "Foi mantida em toda sua santa dignidade" },
        { id: "d", text: "Foi substituída pelo amor" },
      ],
      correctOptionId: "c",
    },
    {
      id: "sexta_q5",
      text: "Como o texto define o pecado?",
      options: [
        { id: "a", text: "Um erro de julgamento" },
        { id: "b", text: "Deslealdade para com Deus e transgressão da lei" },
        { id: "c", text: "Um problema psicológico" },
        { id: "d", text: "Uma fraqueza humana" },
      ],
      correctOptionId: "b",
    },
    {
      id: "sexta_q6",
      text: "Qual é o primeiro item das perguntas para discussão em classe?",
      options: [
        { id: "a", text: "Quais são os pecados mais graves?" },
        { id: "b", text: "Que paralelos você vê entre o animal morto por Deus no Éden e Jesus Cristo?" },
        { id: "c", text: "Como a igreja deve lidar com os pecadores?" },
        { id: "d", text: "Qual é o propósito da vida cristã?" },
      ],
      correctOptionId: "b",
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
  const [impressions, setImpressions] = useState("");
  const [isBibleTextOpen, setIsBibleTextOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const anonymousUser = { id: 'anonymous-user' };

  const { data: userProgressData, isLoading } = useQuery({
    queryKey: ['lessonProgress', id],
    queryFn: async () => {
      if (!id) return null;
      
      try {
        const allProgress = JSON.parse(localStorage.getItem('local_user_progress') || '[]');
        const lessonProgress = allProgress.find(p => p.lesson_id === id && p.user_id === anonymousUser.id);
        return lessonProgress || null;
      } catch (e) {
        console.error("Erro ao buscar progresso:", e);
        return null;
      }
    },
    enabled: !!id,
  });

  const { data: lessonComments = [], refetch: refetchComments } = useQuery({
    queryKey: ['lessonComments', id],
    queryFn: () => id ? getCommentsByLessonId(id) : Promise.resolve([]),
    enabled: !!id
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ progress, completed, pointsEarned }: { 
      progress: number; 
      completed: boolean;
      pointsEarned: number;
    }) => {
      if (!id) return;
      return updateUserProgress(anonymousUser.id, id, progress, completed, pointsEarned);
    },
    onSuccess: () => {
      console.log("Progress updated successfully");
    },
    onError: (error) => {
      console.error("Error updating progress:", error);
    }
  });

  const saveCommentMutation = useMutation({
    mutationFn: async (comment: Omit<Comment, 'id' | 'created_at'>) => {
      return saveComment(comment);
    },
    onSuccess: () => {
      setNewComment("");
      refetchComments();
      toast({
        title: "Comentário enviado",
        description: "Seu comentário foi adicionado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao salvar comentário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar seu comentário. Por favor, tente novamente.",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (id) {
      setFormattedDate(getFormattedDate(id));
      setDescription(id === "sabado" ? "O início do altar" : "");
    }
    
    if (userProgressData) {
      setProgress(userProgressData.progress);
      setIsCompleted(userProgressData.completed);
      setQuizEnabled(id !== "sabado" && userProgressData.progress >= 50);
    }
  }, [id, userProgressData]);
  
  useEffect(() => {
    if (!id) return;
    
    const contentElement = document.getElementById('lesson-content');
    if (!contentElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = contentElement;
      const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
      
      const newProgress = Math.max(
        Math.min(Math.round(scrolled), 100),
        isCompleted ? 100 : (progress < 50 ? 0 : progress)
      );
      
      if (newProgress > progress && !isCompleted) {
        setProgress(newProgress);
        
        if (newProgress >= 50) {
          setQuizEnabled(true);
        }
        
        updateProgressMutation.mutate({ 
          progress: newProgress, 
          completed: false,
          pointsEarned: 0
        });
      }
    };
    
    contentElement.addEventListener('scroll', handleScroll);
    return () => contentElement.removeEventListener('scroll', handleScroll);
  }, [id, progress, isCompleted, updateProgressMutation]);

  const enhancedQuestions = id === "domingo" 
    ? lessonData.questions.filter(q => q.id.startsWith("domingo_"))
    : id === "segunda"
    ? lessonData.questions.filter(q => q.id.startsWith("segunda_"))
    : id === "terca"
    ? lessonData.questions.filter(q => q.id.startsWith("terca_"))
    : id === "quarta"
    ? lessonData.questions.filter(q => q.id.startsWith("quarta_"))
    : id === "quinta"
    ? lessonData.questions.filter(q => q.id.startsWith("quinta_"))
    : id === "sexta"
    ? lessonData.questions.filter(q => q.id.startsWith("sexta_"))
    : [];

  const handleQuizComplete = (score: number) => {
    const totalQuestions = 6;
    const percentage = Math.round((score / totalQuestions) * 100);
    const completed = percentage >= 70;
    setIsCompleted(completed);
    setProgress(100);
    
    if (id) {
      updateProgressMutation.mutate({
        progress: 100,
        completed,
        pointsEarned: lessonData.points
      });
    }
    
    toast({
      title: completed ? "Lição concluída!" : "Quiz finalizado",
      description: completed 
        ? "Parabéns! Você completou esta lição com sucesso." 
        : `Você acertou ${score} de ${totalQuestions} questões.`,
    });
  };

  const enableQuiz = () => {
    setQuizEnabled(true);
    setActiveTab("quiz");
  };

  const handleSubmitComment = () => {
    if (!id || !newComment.trim()) return;
    
    saveCommentMutation.mutate({
      user_id: anonymousUser.id,
      lesson_id: id,
      author: 'Visitante',
      text: newComment.trim()
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="seven-container">
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
                  <h1 className="text-3xl font-bold mb-3 font-serif">{
                    id === "domingo" ? "Expostos" : 
                    id === "segunda" ? "Roupas para o pecado" :
                    id === "terca" ? "Tempo, pensamento e ação" :
                    id === "quarta" ? "Momento hipertexto" :
                    id === "quinta" ? "comPARTILHE" :
                    id === "sexta" ? "Um manto próprio" :
                    lessonData.title
                  }</h1>
                  <p className="text-muted-foreground mb-4 font-sans">{description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>Lição jovem</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  {/* Botão Salvar offline removido */}
                </div>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={`grid ${id === "sabado" ? "grid-cols-2" : "grid-cols-3"} mb-6`}>
              <TabsTrigger value="content" className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" /> Conteúdo
              </TabsTrigger>
              {id !== "sabado" && (
              <TabsTrigger 
                value="quiz" 
                disabled={!quizEnabled} 
                className="flex items-center gap-1"
              >
                <CheckCircle className="h-4 w-4" /> Quiz
              </TabsTrigger>
              )}
              <TabsTrigger value="discussion" className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" /> Discussão
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="content">
              <div 
                id="lesson-content" 
                className="bg-card p-6 rounded-lg shadow-sm border border-border overflow-y-auto max-h-[600px] font-sans"
              >
                {id === "sabado" && (
                  <div className="mb-6">
                    <div className="rounded-lg overflow-hidden mb-6">
                      <img 
                        src="/tirinhas/02.png" 
                        alt="Tirinha Bíblica da Semana" 
                        className="w-full object-contain min-h-[680px] sm:min-h-[500px]"
                        style={{ maxHeight: "auto" }}
                      />
                    </div>

                    <h2 className="text-2xl font-bold mb-4 font-serif">O início do altar</h2>
                    
                    <div className="mb-6">
                      <p className="mb-4 font-sans">A partir da tirinha, do texto-chave e do título, anote suas primeiras impressões sobre o que trata a lição:</p>
                      <textarea 
                        className="w-full p-3 border-0 border-b-2 border-[#a37fb9]/30 bg-background/50 focus:outline-none focus:border-[#a37fb9] transition-colors duration-300 rounded-none resize-none"
                        rows={4}
                        placeholder="Digite suas impressões aqui..."
                        value={impressions}
                        onChange={(e) => setImpressions(e.target.value)}
                      ></textarea>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-2 font-serif">Leia o texto bíblico desta semana:</h3>
                      <Button 
                        variant="outline" 
                        className="p-4 bg-muted rounded-lg w-full text-left flex justify-between items-center"
                        onClick={() => setIsBibleTextOpen(true)}
                      >
                        <span>Gn 3:16-24</span>
                        <span className="text-sm text-muted-foreground">Clique para ler</span>
                      </Button>
                      
                      <Dialog open={isBibleTextOpen} onOpenChange={setIsBibleTextOpen}>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Gênesis 3:16-24</DialogTitle>
                            <DialogDescription>Versão Almeida Revista e Atualizada</DialogDescription>
                          </DialogHeader>
                          <div className="mt-4 text-lg space-y-4">
                            <p><strong>16</strong> E à mulher disse: Multiplicarei grandemente a dor da tua gestação; em dor darás à luz filhos. O teu desejo será para o teu marido, e ele te dominará.</p>
                            <p><strong>17</strong> E ao homem disse: Visto que atendeste a voz de tua mulher e comeste da árvore que eu te ordenara não comer, maldita é a terra por tua causa; em fadiga comerás dela todos os dias da tua vida.</p>
                            <p><strong>18</strong> Ela produzirá também cardos e abrolhos, e tu comerás das plantas do campo.</p>
                            <p><strong>19</strong> Do suor do teu rosto comerás o teu pão, até que tornes à terra, pois dela foste tomado; porquanto tu és pó e ao pó tornarás.</p>
                            <p><strong>20</strong> E deu o homem o nome de Eva a sua mulher, por ser a mãe de todos os seres humanos.</p>
                            <p><strong>21</strong> Fez o SENHOR Deus vestimenta de peles para Adão e sua mulher e os vestiu.</p>
                            <p><strong>22</strong> Então, disse o SENHOR Deus: Eis que o homem se tornou como um de nós, conhecedor do bem e do mal; assim, que não estenda a mão, e tome também da árvore da vida, e coma, e viva eternamente.</p>
                            <p><strong>23</strong> O SENHOR Deus, por isso, o lançou fora do jardim do Éden, a fim de lavrar a terra de que fora tomado.</p>
                            <p><strong>24</strong> E, expulso o homem, colocou querubins ao oriente do jardim do Éden e o refulgir de uma espada que se revolvia, para guardar o caminho da árvore da vida.</p>
                          </div>
                          <DialogClose asChild>
                            <Button variant="outline" className="mt-4">Fechar</Button>
                          </DialogClose>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-2 font-serif">Pesquise em comentários bíblicos, livros denominacionais e de Ellen G. White sobre temas contidos neste texto:</h3>
                      <p className="p-4 bg-muted rounded-lg font-sans">Gn 3:16-24</p>
                    </div>
                    
                    <div className="bg-accent/15 p-6 rounded-lg mt-6 border-l-4 border-accent">
                      <h3 className="text-xl font-bold mb-2 font-serif">Nosso resumo</h3>
                      <p>A tirinha bíblica desta semana ilustra o momento crucial em que Deus providenciou a primeira cobertura para o pecado humano. A imagem retrata o contraste entre a tentativa humana de se cobrir com folhas de figueira (insuficiente) e a cobertura divina através do sacrifício. Este momento marca o início do sistema sacrificial na Bíblia, quando Deus estabeleceu o primeiro "altar" implícito ao matar um animal para vestir Adão e Eva. A tirinha nos ensina que desde o começo da história humana, Deus já demonstrava que o pecado exige um sacrifício, e que apenas uma cobertura providenciada por Ele seria suficiente - apontando para o futuro sacrifício de Cristo.</p>
                    </div>
                  </div>
                )}
                {id === "domingo" && (
                  <div className="mb-6">
                    <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-p:font-sans">
                      <p>No meu segundo ano de faculdade, eu era monitor de internato, tendo 24 calouros sob meus cuidados. O grupo geralmente era muito bom, mas havia alguns não tão bons, como pude descobrir de perto em uma tarde de sexta-feira.</p>
                      
                      <p>Eu tinha ido à lavanderia para lavar minhas roupas, como já havia feito muitas vezes antes. Separei as roupas brancas das coloridas, apliquei sabão, amaciante e alvejante como meus pais tinham me ensinado. Depois de lavar tudo, coloquei minhas peças na secadora e saí da lavanderia para fazer algumas coisas antes do sábado. Quando voltei para pegar as roupas, algo me deixou atordoado: todas elas haviam sumido – até a roupa íntima. Sério isso? Quem furtaria roupa íntima?</p>
                      
                      <p>Mais tarde, no culto de sexta-feira à noite, vi um calouro vestindo uma das minhas camisas. Eu sabia que era minha porque ninguém mais no campus tinha uma igual àquela. Quando o confrontei, ele alegou que era dele, que a havia trazido de casa. Por um momento decidi deixar para lá, mas depois pensei em uma forma de descobrir quem era o ladrão. Mais tarde, naquela noite, fui conversar com o monitor de sua ala e juntos verificamos seu quarto. Todas as minhas roupas estavam ali dobradas e guardadas nas gavetas da cômoda – incluindo a roupa íntima!</p>
                      
                      <p>Ao refletir sobre essa experiência, não posso deixar de me perguntar <span className="bg-yellow-100 p-1 rounded font-medium">o que nós, seres humanos, somos capazes de fazer para nos cobrir.</span></p>
                      
                      <p>Depois de cair em pecado, Adão e Eva criaram vestes de folhas de figueira para cobrir sua nudez (Gn 3:7), mas Deus não aprovou a ideia. Então <span className="bg-yellow-100 p-1 rounded font-medium">fez "roupas de peles" para eles (v. 21), cobrindo seus corpos e seus pecados. Esse magnífico ato da graça de Deus inaugura o altar de sacrifício nas Escrituras.</span></p>
                      
                      <div className="bg-muted p-4 rounded-lg mt-6">
                        <h3 className="text-xl font-semibold mb-2">Mergulhe + fundo</h3>
                        <p>Leia, de Ellen G. White, Patriarcas e Profetas, capítulo 4: "O plano da redenção"</p>
                      </div>
                      
                      <div className="bg-accent/15 p-6 rounded-lg mt-6 border-l-4 border-accent">
                        <h3 className="text-xl font-bold mb-2 font-serif">Nosso resumo</h3>
                        <p>A lição de domingo ilustra, através da história do roubo das roupas no internato, como os seres humanos tentam se "cobrir" de maneiras inadequadas. Assim como o calouro roubou roupas para se vestir, Adão e Eva tentaram cobrir sua nudez com folhas de figueira após o pecado. Ambas as situações representam nossas tentativas inadequadas de esconder nossos erros e vergonha. O contraste é evidente quando Deus providencia "roupas de peles" para o casal, demonstrando que apenas um sacrifício pode adequadamente cobrir o pecado. Este ato de Deus introduz o primeiro altar implícito das Escrituras, onde a morte de um animal inocente prefigurava o sacrifício de Cristo para cobrir nossos pecados.</p>
                      </div>
                    </div>
                  </div>
                )}
                {id === "segunda" && (
                  <div className="mb-6">
                    <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-p:font-sans">
                      <p>O pecado de Adão e Eva rompeu o relacionamento deles com Deus, roubando sua inocência e paz de espírito. Um sentimento imediato de vergonha os dominou, e eles se esconderam de Deus (Gn 3:8). <span className="bg-yellow-100 p-1 rounded font-medium">O pecado também adicionou a realidade da morte ao que até então era perfeito.</span> Deus tinha avisado Adão e Eva de que se comessem da árvore do conhecimento do bem e do mal, certamente morreriam, mas essa ideia era bastante abstrata para eles. Eles não conheciam por experiência própria o pecado e suas consequências.</p>
                      
                      <p>Gênesis 3:16-24 descreve o que Adão e Eva sofreriam como resultado da desobediência. A vida seria difícil e dolorosa. Por último, estavam destinados a retornar ao solo quando morressem. Os primeiros humanos perderiam seu lar, a comunhão face a face com Deus e o acesso à árvore da vida (Gn 3:22-24). Que bola de neve de sofrimento causado pelos prazeres momentâneos do pecado!</p>
                      
                      <p>Em meio a esses efeitos devastadores, Deus ofereceu a Adão e Eva uma gigantesca esperança em Gênesis 3:21. Ele fez roupas de pele e os vestiu. As vestes de pele que Deus fez exigiram a morte de um animal. <span className="bg-yellow-100 p-1 rounded font-medium">Levítico 17:11 nos ajuda a entender por que essa morte era necessária: "Porque a vida da carne está no sangue. Eu o tenho dado a vocês sobre o altar, para fazer expiação pela vida de vocês, porque é o sangue que fará expiação pela vida." Sem o derramamento de sangue, o pecado não pode ser perdoado e removido (Hb 9:22).</span> Deus não estava cobrindo apenas a nudez de Adão e Eva, mas especialmente a pecaminosidade deles.</p>
                      
                      <p>No Éden, Deus introduziu o primeiro altar no qual os animais seriam sacrificados em lugar do pecador, para fazer expiação por ele. <span className="bg-yellow-100 p-1 rounded font-medium">O conceito de expiação substitutiva mais tarde se tornou o fundamento de todo o sistema do santuário.</span> O altar do Éden, que deu origem às roupas de Adão e Eva, antecipava a morte de Jesus no altar da cruz – um sacrifício que deu a cada um de nós o manto da justiça de Cristo. O próprio Jesus, o Cordeiro de Deus (Jo 1:29), pagou o preço pelo pecado da humanidade (Mt 20:28) – não simplesmente para que nossos pecados fossem perdoados, mas para removê-los completamente. É por isso que a morte de Cristo é o sacrifício perfeito e definitivo, que substitui todos os outros (Hb 9:23-25).</p>
                      
                      <p>Os altares são lugares de amor, adoração, sacrifício, compromisso e entrega – tudo o que Deus demonstrou plenamente no Éden. O que o pecado tirou de Adão e Eva, Deus, no altar do Éden, prometeu restaurar.</p>
                      
                      <div className="bg-muted p-4 rounded-lg mt-6">
                        <h3 className="text-xl font-semibold mb-2">Pense</h3>
                        <p>Qual é a conexão entre sacrifício e amor? Explique.</p>
                      </div>
                      
                      <div className="bg-accent/15 p-6 rounded-lg mt-6 border-l-4 border-accent">
                        <h3 className="text-xl font-bold mb-2 font-serif">Nosso resumo</h3>
                        <p>A lição de segunda-feira detalha as devastadoras consequências do pecado: vergonha, dor, trabalho árduo e morte. O relacionamento de Adão e Eva com Deus foi rompido, e eles perderam seu lar no Éden e o acesso à árvore da vida. Porém, no meio desta tragédia, Deus oferece esperança através das "roupas de pele" - um ato que exigiu a morte sacrificial de um animal. Este texto nos ensina o princípio fundamental de que "sem derramamento de sangue não há remissão de pecados" (Hebreus 9:22). O altar do Éden introduziu o conceito de expiação substitutiva que fundamentaria todo o sistema do santuário e apontaria para o sacrifício definitivo de Cristo - o único que remove completamente o pecado, não apenas o cobre temporariamente.</p>
                      </div>
                    </div>
                  </div>
                )}
                {id === "terca" && (
                  <div className="mb-6">
                    <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-p:font-sans">
                      <p>A Bíblia menciona altares mais de 400 vezes. A primeira referência explícita a um altar ocorre em Gênesis 8:20, quando "Noé levantou um altar ao Senhor e, tomando de animais puros e de aves puras, ofereceu holocaustos sobre o altar". Esse ato de adoração foi a resposta do patriarca à extraordinária libertação divina durante o dilúvio.</p>
                      
                      <p>Em contraste com a maioria dos altares do Antigo Testamento, na história do Éden, o altar é secundário; o foco está nas roupas de pele urgentemente necessárias (Gn 3:21). <span className="bg-yellow-100 p-1 rounded font-medium">Essas peles fornecem evidências inegáveis de que um animal morreu em favor dos seres humanos. O símbolo de um "Cordeiro que foi morto" em favor dos pecadores pode ser rastreado à "criação do mundo", na história do Éden (Ap 13:8, NVI).</span> Isso é profundamente significativo!</p>
                      
                      <p>Ellen White escreveu: "Diante de Deus, todas as Suas obras são conhecidas e, <span className="bg-yellow-100 p-1 rounded font-medium">desde eras eternas, o concerto da graça (favor imerecido) existiu na mente de Deus. É conhecido como o concerto eterno, pois o plano da salvação não foi concebido após a queda do ser humano</span>, mas foi ele 'guardado em silêncio desde os tempos eternos, [...] agora, tornou-se manifesto e foi dado a conhecer por meio das Escrituras proféticas, segundo o mandamento do Deus eterno, para a obediência da fé, entre todas as nações'" (Rm 16:25, 26; A Verdade Sobre os Anjos [CPB, 2022], p. 18).</p>
                      
                      <p>Deus poderia ter destruído Adão, Eva, a Terra e todos os seres vivos. Em vez disso, antes mesmo que o mundo fosse criado, Ele planejou realizar uma intervenção em favor da humanidade caída (Ef 1:4-6). <span className="bg-yellow-100 p-1 rounded font-medium">O altar do Éden não foi uma ideia que Deus teve depois que Adão e Eva pecaram.</span> O fato de que Deus dedicou tempo, pensamento e ação para reconciliar seres humanos caídos Consigo mesmo é uma demonstração inquestionável de Seu amor, comprometimento e entrega às Suas criaturas. Assim, quando reservamos um tempo para pensar em nossa devoção ao Senhor e fazemos planos para nos encontrarmos com Ele, montamos um altar que revela quem Ele é.</p>
                      
                      <p>No altar do Éden, Deus pagou um alto preço para reconciliar os seres humanos perdidos com Ele, e esse foi apenas o começo da demonstração de Seu amor sacrificial por nós. O sacrifício feito no Éden foi apenas uma pálida sombra do verdadeiro e completo sacrifício que seria feito por Jesus na cruz.</p>
                      
                      <div className="bg-muted p-4 rounded-lg mt-6">
                        <h3 className="text-xl font-semibold mb-2">Pense</h3>
                        <p>Deus planejou sua salvação muito antes de você nascer. Como saber disso muda sua vida?</p>
                      </div>
                      
                      <div className="bg-accent/15 p-6 rounded-lg mt-6 border-l-4 border-accent">
                        <h3 className="text-xl font-bold mb-2 font-serif">Nosso resumo</h3>
                        <p>A lição de terça-feira revela a profundidade do plano divino de salvação, mostrando que o altar do Éden não foi uma solução improvisada após o pecado, mas parte de um "concerto eterno" planejado desde antes da criação. Embora a primeira menção explícita a um altar na Bíblia seja a de Noé após o dilúvio, o sacrifício implícito no Éden (quando Deus matou animais para vestir Adão e Eva) representa a primeira manifestação deste plano. As peles dos animais sacrificados evidenciam que desde o princípio, o "Cordeiro de Deus" já estava designado para morrer pelos pecadores. Esta lição nos ensina que a salvação não foi um plano de contingência, mas uma demonstração do amor eterno de Deus, planejado muito antes de nossa existência.</p>
                      </div>
                    </div>
                  </div>
                )}
                {id === "quarta" && (
                  <div className="mb-6">
                    <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-p:font-sans">
                      <p>A história da tragédia humana aponta características que parecem nos acompanhar através dos séculos. <span className="bg-yellow-100 p-1 rounded font-medium">O senso de autorresponsabilidade do par edênico foi zero quando Deus os abordou após a queda.</span></p>
                      
                      <p>A terceirização da culpa, tão comum em nossos dias, já aconteceu lá no início da história pós-pecado. É até compreensível que tenhamos receio de dizer a verdade e admitir um erro para outras pessoas, afinal podemos sofrer todo tipo de repulsa, retaliação, julgamentos.</p>
                      
                      <p>Mas, ao reler a história da queda e de como Deus os questionou, é possível notar que não há nenhum abuso da parte Dele. <span className="bg-yellow-100 p-1 rounded font-medium">Ele fez perguntas, Ele chamou à consciência os fatos, mas em nenhum momento Deus os ofendeu ou feriu.</span></p>
                      
                      <p>Ao contrário, Ele estabeleceu o altar, colocando imediatamente em prática o evangelho eterno – pronto desde antes da fundação do mundo.</p>
                      
                      <p><span className="bg-yellow-100 p-1 rounded font-medium">Deus os cobriu, mas Deus também os retirou do jardim a fim de que não se tornassem pecadores eternos pelo contato com a árvore da vida.</span></p>
                      
                      <p>Deus pensou em tudo!</p>
                      
                      <div className="bg-muted p-4 rounded-lg mt-6 mb-6">
                        <h3 className="text-xl font-semibold mb-2">O que os seguintes versículos e histórias nos ensinam sobre o propósito e o significado dos altares?</h3>
                        
                        <div className="mt-4">
                          <h4 className="font-semibold">Ato de adoração:</h4>
                          <ul className="list-disc list-inside pl-4 space-y-2 mt-2">
                            <li>Gn 26:23-25; 35:3</li>
                            <li>Jz 6:22-27</li>
                            <li>1Rs 8:22, 54</li>
                          </ul>
                        </div>
                        
                        <div className="mt-4">
                          <h4 className="font-semibold">A ordem para construir:</h4>
                          <ul className="list-disc list-inside pl-4 space-y-2 mt-2">
                            <li>Êx 27:1-8; 30:1</li>
                            <li>Dt 27:4-7</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-accent/15 p-6 rounded-lg mt-6 border-l-4 border-accent">
                        <h3 className="text-xl font-bold mb-2 font-serif">Nosso resumo</h3>
                        <p>A lição de quarta-feira examina o comportamento humano após o pecado, destacando nossa tendência de evitar responsabilidade e transferir culpa - atitudes presentes desde Adão e Eva. O texto mostra como Deus abordou os primeiros humanos sem abuso ou acusação, mas através de perguntas que os levaram à consciência. Mais importante, Deus imediatamente implementou o "evangelho eterno" através do altar do Éden. A expulsão do jardim, muitas vezes vista apenas como punição, foi na verdade um ato de misericórdia para impedir que os humanos se tornassem "pecadores eternos" ao comerem da árvore da vida em seu estado caído. Esta lição nos leva a examinar os altares bíblicos como expressões de adoração e como locais estabelecidos por ordem divina, revelando a sabedoria de Deus em Seu plano para nossa redenção.</p>
                      </div>
                    </div>
                  </div>
                )}
                {id === "quinta" && (
                  <div className="mb-6">
                    <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-p:font-sans">
                      <p>Certo dia, vi os tênis sujos do meu filho de 15 anos na porta da frente da nossa casa. Chamei-o e disse: "DJ, seus calçados estão bem sujos."</p>
                      
                      <p>Ele assentiu com um olhar que parecia dizer: "Não tenho ideia do que fazer sobre isso."</p>
                      
                      <p>Essa foi minha deixa para apresentar meu plano: "Vamos limpar essas coisas, e elas ficarão novas de novo." Ele se animou, mas questionou como faríamos isso.</p>
                      
                      <p>Peguei um pouco de sabão líquido e uma escova, e fomos até a pia. Comecei a esfregar como se minha vida dependesse disso. Eu tinha aprendido a lavar os tênis com meu pai e meus irmãos mais velhos, e estava determinado a passar essa habilidade para meu filho.</p>
                      
                      <p>Depois que terminei, dei a ele o outro tênis para lavar e, com esforço e dedicação, o par de calçados anteriormente sujos ficou incrível. <span className="bg-yellow-100 p-1 rounded font-medium">Mesmo que na época meu filho não soubesse, eu estava fazendo muito mais do que apenas lavar sapatos; estava dando a ele um exemplo a seguir.</span></p>
                      
                      <p><span className="bg-yellow-100 p-1 rounded font-medium">Raramente Deus faz algo pelos seres humanos que não sirva como exemplo para seguirmos.</span> Acredito que esse também foi o caso no altar que Ele construiu no Éden. O amor, a entrega e o comprometimento de Deus com a salvação da humanidade O levaram a realizar ações dolorosas para fazer expiação pelo pecado de Adão e Eva. Para cobrir Adão e Eva, Deus teve que matar um animal inocente – talvez mais de um. A verdade é que raramente fazemos algum sacrifício por Deus, e, quando achamos que estamos fazendo isso, às vezes não nos custa nada. <span className="bg-yellow-100 p-1 rounded font-medium">O rei Davi entendeu esse princípio e se recusou a apresentar a Deus um sacrifício que não lhe custasse nada (1Cr 21:24).</span></p>
                      
                      <p>Do que você está disposto a abrir mão por Deus? Que atitude ou pensamento você está disposto a mudar para obedecer ao Senhor? <span className="bg-yellow-100 p-1 rounded font-medium">Altares são lugares de sacrifício. Algo precisa morrer se desejamos viver em comunhão íntima com Deus.</span></p>
                      
                      <div className="bg-muted p-4 rounded-lg mt-6">
                        <h3 className="text-xl font-semibold mb-2">Pense</h3>
                        <p>O que Deus sacrificou para salvar você? Que tipos de sacrifícios devemos fazer em resposta?</p>
                      </div>
                      
                      <div className="bg-accent/15 p-6 rounded-lg mt-6 border-l-4 border-accent">
                        <h3 className="text-xl font-bold mb-2 font-serif">Nosso resumo</h3>
                        <p>A lição de quinta-feira, através da história do pai ensinando o filho a limpar tênis sujos, ilustra como Deus não apenas nos resgata, mas nos dá exemplos a seguir. Assim como o pai estava transmitindo mais que uma habilidade doméstica, mas um modelo de vida, as ações de Deus no Éden tinham propósito didático. O altar do Éden revela que o amor e compromisso divinos exigiram um sacrifício doloroso: a morte de um animal inocente para cobrir o pecado humano. Esta lição desafia nossa compreensão de sacrifício, lembrando-nos do princípio expresso por Davi, que se recusou a oferecer a Deus algo que não lhe custasse nada (1Cr 21:24). O texto nos convida a refletir: do que estamos disposto a abrir mão por Deus? Que atitudes precisam "morrer" em nós para vivermos em comunhão mais íntima com Ele?</p>
                      </div>
                    </div>
                  </div>
                )}
                {id === "sexta" && (
                  <div className="mb-6">
                    <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-p:font-sans">
                      <div className="bg-muted/40 p-5 rounded-lg border-l-4 border-[#a37fb9] mb-6">
                        <blockquote className="not-italic text-slate-700 dark:text-slate-300">
                          <p className="font-serif">"O Senhor Jesus Cristo preparou uma vestimenta – o manto de Sua própria justiça – que Ele colocará sobre toda pessoa arrependida e crente que a receberá pela fé. Disse João: 'Eis o Cordeiro de Deus, que tira
