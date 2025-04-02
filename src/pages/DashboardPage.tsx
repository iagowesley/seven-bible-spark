
import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProgressCard from "@/components/study/ProgressCard";
import LessonCard from "@/components/study/LessonCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, BookMarkedIcon, BookIcon, AwardIcon } from "lucide-react";

// Dados fictícios
const recentLessons = [
  {
    id: "2",
    title: "Fé e Obras",
    description: "Um estudo sobre a relação entre fé e obras na vida cristã, baseado nas cartas de Tiago e Paulo.",
    duration: "15 min",
    points: 80,
    progress: 65,
  },
  {
    id: "5",
    title: "Criação vs. Evolução",
    description: "Uma análise crítica e bíblica sobre o debate entre criacionismo e evolucionismo, e como defender nossa fé.",
    duration: "40 min",
    points: 200,
    progress: 25,
  },
];

const completedLessons = [
  {
    id: "4",
    title: "Os Dons Espirituais",
    description: "Entenda o que são os dons espirituais, como descobrir seus dons e usá-los para edificação da igreja e glória de Deus.",
    duration: "30 min",
    points: 150,
    progress: 100,
  },
];

const achievements = [
  {
    title: "Primeiro Estudo",
    description: "Complete sua primeira lição",
    icon: <BookIcon className="h-6 w-6 text-seven-blue" />,
    unlocked: true,
    points: 50,
  },
  {
    title: "Estudante Dedicado",
    description: "Complete 5 lições",
    icon: <BookMarkedIcon className="h-6 w-6 text-seven-purple" />,
    unlocked: false,
    progress: 20,
    points: 200,
  },
  {
    title: "Assiduidade",
    description: "Estude por 7 dias consecutivos",
    icon: <CalendarIcon className="h-6 w-6 text-seven-gold" />,
    unlocked: false,
    progress: 43,
    points: 300,
  },
];

const DashboardPage = () => {
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
            <ProgressCard 
              totalPoints={350} 
              completedLessons={1} 
              streakDays={3} 
            />
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
                {completedLessons.map((lesson) => (
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
              {completedLessons.length === 0 && (
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
                            {achievement.progress}% completo
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
