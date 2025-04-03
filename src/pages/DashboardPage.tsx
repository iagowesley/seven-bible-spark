
import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProgressCard from "@/components/study/ProgressCard";
import LessonCard from "@/components/study/LessonCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, BookMarkedIcon, BookIcon, AwardIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getUserProgress, getTotalPoints, getTotalCompletedLessons, getStreakDays } from "@/models/userProgress";
import { supabase } from "@/integrations/supabase/client";

// Dados fictícios de lições
const weekDays = [
  {
    id: "domingo",
    title: "Domingo",
    description: "A origem do mal e o grande conflito: por que existe o sofrimento?",
    duration: "20 min",
    points: 100,
  },
  {
    id: "segunda",
    title: "Segunda-feira",
    description: "O plano da salvação: como Deus resolveu o problema do pecado através de Jesus.",
    duration: "15 min",
    points: 80,
  },
  {
    id: "terca",
    title: "Terça-feira",
    description: "A lei de Deus e o seu amor: como os mandamentos revelam o caráter divino.",
    duration: "25 min",
    points: 120,
  },
  {
    id: "quarta",
    title: "Quarta-feira",
    description: "O sábado e sua importância na adoração a Deus e descanso do ser humano.",
    duration: "30 min",
    points: 150,
  },
  {
    id: "quinta",
    title: "Quinta-feira",
    description: "A oração e o estudo da Bíblia: como desenvolver um relacionamento com Deus.",
    duration: "40 min",
    points: 200,
  },
  {
    id: "sexta",
    title: "Sexta-feira",
    description: "Vida cristã e testemunho: como viver e compartilhar a fé no dia a dia.",
    duration: "35 min",
    points: 180,
  },
  {
    id: "sabado",
    title: "Sábado",
    description: "Resumo da semana: revisão e aplicação prática das lições aprendidas.",
    duration: "45 min",
    points: 220,
  },
];

const DashboardPage = () => {
  const { user } = useAuth();

  // Fetch user progress stats
  const { data: totalPoints = 0, isLoading: loadingPoints } = useQuery({
    queryKey: ['totalPoints', user?.id],
    queryFn: () => user ? getTotalPoints(user.id) : Promise.resolve(0),
    enabled: !!user
  });

  const { data: completedLessons = 0, isLoading: loadingCompleted } = useQuery({
    queryKey: ['completedLessons', user?.id],
    queryFn: () => user ? getTotalCompletedLessons(user.id) : Promise.resolve(0),
    enabled: !!user
  });

  const { data: streakDays = 0, isLoading: loadingStreak } = useQuery({
    queryKey: ['streakDays', user?.id],
    queryFn: () => user ? getStreakDays(user.id) : Promise.resolve(0),
    enabled: !!user
  });

  // Fetch user progress for all lessons
  const { data: userProgress = [], isLoading: loadingProgress } = useQuery({
    queryKey: ['userProgress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        return await getUserProgress(user.id);
      } catch (error) {
        console.error("Error fetching user progress:", error);
        return [];
      }
    },
    enabled: !!user
  });

  // Prepare lessons with progress information
  const recentLessons = weekDays
    .map(lesson => {
      const progress = userProgress.find(p => p.lesson_id === lesson.id);
      return {
        ...lesson,
        progress: progress?.progress || 0,
      };
    })
    .filter(lesson => lesson.progress > 0 && lesson.progress < 100)
    .sort((a, b) => b.progress - a.progress);

  const completedLessonsList = weekDays
    .map(lesson => {
      const progress = userProgress.find(p => p.lesson_id === lesson.id);
      return {
        ...lesson,
        progress: progress?.progress || 0,
      };
    })
    .filter(lesson => lesson.progress >= 100)
    .sort((a, b) => {
      const progressA = userProgress.find(p => p.lesson_id === a.id);
      const progressB = userProgress.find(p => p.lesson_id === b.id);
      return new Date(progressB?.last_accessed || 0).getTime() - 
             new Date(progressA?.last_accessed || 0).getTime();
    });

  // Achievement data
  const achievements = [
    {
      title: "Primeiro Estudo",
      description: "Complete sua primeira lição",
      icon: <BookIcon className="h-6 w-6 text-seven-blue" />,
      unlocked: completedLessons >= 1,
      points: 50,
    },
    {
      title: "Estudante Dedicado",
      description: "Complete 5 lições",
      icon: <BookMarkedIcon className="h-6 w-6 text-seven-purple" />,
      unlocked: completedLessons >= 5,
      progress: completedLessons < 5 ? (completedLessons / 5) * 100 : 100,
      points: 200,
    },
    {
      title: "Assiduidade",
      description: "Estude por 7 dias consecutivos",
      icon: <CalendarIcon className="h-6 w-6 text-seven-gold" />,
      unlocked: streakDays >= 7,
      progress: streakDays < 7 ? (streakDays / 7) * 100 : 100,
      points: 300,
    },
  ];

  const isLoading = loadingPoints || loadingCompleted || loadingStreak || loadingProgress;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="seven-container">
          {/* Cabeçalho */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Seu Dashboard</h1>
            <p className="text-muted-foreground">
              Acompanhe seu progresso e continue seus estudos
            </p>
          </div>
          
          {/* Card de Progresso */}
          <div className="mb-8">
            {isLoading ? (
              <div className="h-24 bg-muted animate-pulse rounded-md"></div>
            ) : (
              <ProgressCard 
                totalPoints={totalPoints} 
                completedLessons={completedLessons} 
                streakDays={streakDays} 
              />
            )}
          </div>
          
          {/* Conteúdo em abas */}
          <Tabs defaultValue="recent">
            <TabsList className="mb-6">
              <TabsTrigger value="recent">Estudos Recentes</TabsTrigger>
              <TabsTrigger value="completed">Completados</TabsTrigger>
              <TabsTrigger value="achievements">Conquistas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recent">
              <h2 className="text-xl font-semibold mb-4">Continue Estudando</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentLessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    id={lesson.id}
                    title={lesson.title}
                    description={lesson.description}
                    duration={lesson.duration}
                    points={lesson.points}
                    progress={lesson.progress}
                  />
                ))}
              </div>
              {recentLessons.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Você ainda não iniciou nenhum estudo
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed">
              <h2 className="text-xl font-semibold mb-4">Lições Completadas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedLessonsList.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    id={lesson.id}
                    title={lesson.title}
                    description={lesson.description}
                    duration={lesson.duration}
                    points={lesson.points}
                    progress={lesson.progress}
                  />
                ))}
              </div>
              {completedLessonsList.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Você ainda não completou nenhuma lição
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="achievements">
              <h2 className="text-xl font-semibold mb-4">Suas Conquistas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement, index) => (
                  <Card 
                    key={index} 
                    className={`overflow-hidden ${achievement.unlocked ? "border-seven-gold" : "opacity-80"}`}
                  >
                    <div className={`h-1 ${achievement.unlocked ? "bg-seven-gold" : "bg-muted"}`}></div>
                    <CardHeader className="flex flex-row items-center gap-3">
                      <div 
                        className={`w-12 h-12 rounded-circle flex items-center justify-center ${
                          achievement.unlocked 
                            ? "bg-seven-gold/10" 
                            : "bg-muted"
                        }`}
                      >
                        {achievement.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{achievement.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {achievement.points} pontos
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      {achievement.unlocked ? (
                        <div className="flex items-center text-seven-gold">
                          <AwardIcon className="h-4 w-4 mr-1" />
                          <span className="text-sm">Conquistado</span>
                        </div>
                      ) : achievement.progress ? (
                        <div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${achievement.progress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {Math.round(achievement.progress)}% completo
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Não conquistado
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
