
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
  // Datas fixas para cada dia da semana
  const fixedDates: {[key: string]: Date} = {
    "sabado": new Date(2024, 3, 5),  // 5 de abril de 2024
    "domingo": new Date(2024, 3, 6), // 6 de abril de 2024
    "segunda": new Date(2024, 3, 7), // 7 de abril de 2024
    "terca": new Date(2024, 3, 8),   // 8 de abril de 2024
    "quarta": new Date(2024, 3, 9),  // 9 de abril de 2024
    "quinta": new Date(2024, 3, 10), // 10 de abril de 2024
    "sexta": new Date(2024, 3, 11)   // 11 de abril de 2024
  };
  
  if (!fixedDates.hasOwnProperty(dayOfWeek)) {
    return "";
  }
  
  // Mapeamento para nomes dos dias da semana em português
  const dayNames: {[key: string]: string} = {
    "sabado": "sábado",
    "domingo": "domingo",
    "segunda": "segunda-feira",
    "terca": "terça-feira",
    "quarta": "quarta-feira",
    "quinta": "quinta-feira",
    "sexta": "sexta-feira"
  };
  
  // Data formatada como "6 de abril - domingo"
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
  
  // Usuário anônimo fixo
  const anonymousUser = { id: 'anonymous-user' };

  const { data: userProgressData, isLoading } = useQuery({
    queryKey: ['lessonProgress', id],
    queryFn: async () => {
      if (!id) return null;
      
      try {
        // Obter progresso do localStorage
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
    const totalQuestions = 6; // Agora cada dia tem exatamente 6 perguntas
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
                  <p>Conteúdo da lição para o sábado.</p>
                )}
                {id === "domingo" && (
                  <p>Conteúdo da lição para o domingo.</p>
                )}
                {id === "segunda" && (
                  <p>Conteúdo da lição para a segunda-feira.</p>
                )}
                {id === "terca" && (
                  <p>Conteúdo da lição para a terça-feira.</p>
                )}
                {id === "quarta" && (
                  <p>Conteúdo da lição para a quarta-feira.</p>
                )}
                {id === "quinta" && (
                  <p>Conteúdo da lição para a quinta-feira.</p>
                )}
                {id === "sexta" && (
                  <p>Conteúdo da lição para a sexta-feira.</p>
                )}
              </div>
              
              {!isCompleted && id !== "sabado" && progress >= 50 && (
                <div className="mt-6 text-center">
                  <Button onClick={enableQuiz}>
                    Responder o Quiz
                  </Button>
                </div>
              )}
              
              {progress > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progresso: {progress}%</span>
                    {isCompleted && <span className="text-green-600">Completado!</span>}
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </TabsContent>
            
            {id !== "sabado" && (
              <TabsContent value="quiz" className="min-h-[400px]">
                {quizEnabled ? (
                  <QuizComponent 
                    questions={enhancedQuestions} 
                    lessonId={id || ""}
                    onComplete={handleQuizComplete} 
                  />
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground mb-4">
                      Leia pelo menos 50% do conteúdo para desbloquear o quiz.
                    </p>
                    <Button variant="outline" onClick={() => setActiveTab("content")}>
                      Voltar para o conteúdo
                    </Button>
                  </div>
                )}
              </TabsContent>
            )}
            
            <TabsContent value="discussion">
              <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
                <h3 className="text-xl font-bold mb-4">Discussão</h3>
                
                <div className="mb-6">
                  <textarea
                    className="w-full border border-border rounded-md p-3 min-h-[100px]"
                    placeholder="Compartilhe suas impressões ou faça perguntas sobre esta lição..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <div className="flex justify-end mt-2">
                    <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
                      Enviar Comentário
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {lessonComments.length > 0 ? (
                    lessonComments.map((comment) => (
                      <div key={comment.id} className="border-b border-border pb-4">
                        <div className="flex justify-between items-start">
                          <div className="font-medium">{comment.author}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <p className="mt-2 text-sm">{comment.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-6">
                      Ainda não há comentários para esta lição. Seja o primeiro a comentar!
                    </p>
                  )}
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
