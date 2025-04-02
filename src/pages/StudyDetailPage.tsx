
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import QuizComponent from "@/components/study/QuizComponent";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BookOpen, CheckCircle, MessageSquare, Download, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [progress, setProgress] = useState(lessonData.progress);
  const [isCompleted, setIsCompleted] = useState(false);
  const { toast } = useToast();

  const handleQuizComplete = (score: number) => {
    const percentage = Math.round((score / lessonData.questions.length) * 100);
    setIsCompleted(true);
    setProgress(100);
    
    toast({
      title: "Lição concluída!",
      description: `Você ganhou ${lessonData.points} pontos por completar esta lição.`,
    });
  };

  const handleDownload = () => {
    toast({
      title: "Lição salva para modo offline",
      description: "Você pode acessar esta lição mesmo sem conexão com a internet.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="seven-container">
          {/* Cabeçalho */}
          <div className="mb-6">
            <Link to="/estudos" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar para Estudos
            </Link>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-1">{lessonData.title}</h1>
                <p className="text-muted-foreground">{lessonData.description}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleDownload} className="rounded-full">
                  <Download className="h-4 w-4 mr-1" /> Salvar Offline
                </Button>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1 text-sm">
                <span>Progresso</span>
                <span>{isCompleted ? "Completo" : `${progress}%`}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
          
          {/* Conteúdo em abas */}
          <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="content" className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" /> Conteúdo
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> Quiz
              </TabsTrigger>
              <TabsTrigger value="discussion" className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" /> Discussão
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="content">
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div 
                  className="prose prose-lg max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: lessonData.content }}
                />
                
                <div className="mt-8 flex justify-end">
                  <Button onClick={() => setActiveTab("quiz")} className="rounded-full">
                    Continuar para o Quiz
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="quiz">
              <QuizComponent 
                questions={lessonData.questions} 
                onComplete={handleQuizComplete} 
              />
            </TabsContent>
            
            <TabsContent value="discussion">
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Discussão</h2>
                
                <div className="space-y-4 mb-6">
                  {lessonData.comments.map((comment, index) => (
                    <div key={index} className="p-4 bg-muted/50 rounded-lg">
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
