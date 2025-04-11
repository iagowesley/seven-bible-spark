import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LessonCard from "@/components/study/LessonCard";
import { Trophy, CalendarDays, Sparkles, BookOpen, Clock, Star, Zap, Calendar, BookMarked, Heart, Gift, Flame, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

// Dados para os dias da semana
const weekDays = [
  {
    id: "sabado",
    title: "Sábado",
    description: "O início do altar",
    duration: "45 min",
    points: 220
  },
  {
    id: "domingo",
    title: "Domingo",
    description: "Expostos",
    duration: "20 min",
    points: 100
  },
  {
    id: "segunda",
    title: "Segunda-feira",
    description: "Roupas para o pecado",
    duration: "15 min",
    points: 80
  },
  {
    id: "terca",
    title: "Terça-feira",
    description: "Tempo, pensamento e ação",
    duration: "25 min",
    points: 120
  },
  {
    id: "quarta",
    title: "Quarta-feira",
    description: "Momento hipertexto",
    duration: "30 min",
    points: 150
  },
  {
    id: "quinta",
    title: "Quinta-feira",
    description: "comPARTILHE",
    duration: "40 min",
    points: 200
  },
  {
    id: "sexta",
    title: "Sexta-feira",
    description: "Um manto próprio",
    duration: "35 min",
    points: 180
  },
];

const StudiesPage = () => {
  const { user } = useAuth();

  // Fetch user progress for all lessons
  const { data: userProgress = [], isLoading } = useQuery({
    queryKey: ['userProgress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        const { data, error } = await supabase
          .from("user_progress")
          .select("*")
          .eq("user_id", user.id);
        
        if (error) {
          console.error("Error fetching user progress:", error);
          return [];
        }
        
        return data || [];
      } catch (error) {
        console.error("Error fetching user progress:", error);
        return [];
      }
    },
    enabled: !!user
  });

  // Prepare lessons with progress information
  const lessonsWithProgress = weekDays.map(lesson => {
    const progress = userProgress.find(p => p.lesson_id === lesson.id);
    return {
      ...lesson,
      progress: progress?.progress || 0,
      completed: progress?.completed || false
    };
  });

  // Check if all lessons are completed
  const allLessonsCompleted = lessonsWithProgress.every(lesson => lesson.completed);

  const [animateBackground, setAnimateBackground] = useState(false);

  // Efeito para animar o background após a página carregar
  useEffect(() => {
    setAnimateBackground(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-10 w-40 h-40 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20 blur-2xl"></div>
        <div className="absolute bottom-40 -right-10 w-60 h-60 bg-gradient-to-tr from-[#a37fb9] to-blue-300 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-tr from-yellow-200 to-orange-200 rounded-full opacity-20 blur-xl"></div>
        
        {/* Estrelas decorativas */}
        <div className="absolute top-1/4 right-10 text-yellow-400 animate-pulse z-30 text-lg">✦</div>
        <div className="absolute top-3/4 left-10 text-yellow-400 animate-bounce z-30 text-lg">✦</div>
        <div className="absolute bottom-1/3 right-1/4 text-purple-400 animate-pulse z-30 text-xl">★</div>
      </div>
      
      <Navbar />
      <main className="flex-grow py-8 relative z-10">
        <div className="seven-container px-4 sm:px-6">
          {/* Cabeçalho animado */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-purple-100 p-2 rounded-full">
                <BookMarked className="h-6 w-6 text-[#a37fb9]" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">Lições da semana</h1>
              <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
            </div>
            <div className="flex items-center">
              <div className="h-1 w-20 bg-gradient-to-r from-[#a37fb9] to-transparent mr-3"></div>
              <p className="text-sm md:text-base text-muted-foreground">
                Escolha o dia da semana para estudar a lição correspondente
              </p>
            </div>
          </motion.div>

          {/* Feedback quando todos os estudos foram completados */}
          {allLessonsCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="p-6 mb-8 bg-gradient-to-r from-[#a37fb9] to-[#7957a0] text-white text-center relative overflow-hidden">
                {/* Elementos decorativos */}
                <div className="absolute -top-6 -left-6 w-20 h-20 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
                <div className="absolute top-1/2 left-1/3 transform -translate-y-1/2 w-16 h-16 bg-white/5 rounded-full"></div>
                
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.8, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: 0.6,
                      type: "spring",
                      stiffness: 260,
                      damping: 20
                    }}
                  >
                    <Trophy className="h-12 w-12 md:h-16 md:w-16 mb-4 text-yellow-300 drop-shadow-glow" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.8 }}
                  >
                    <h2 className="text-xl md:text-2xl font-bold mb-2">Parabéns!</h2>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1 }}
                  >
                    <p className="text-base md:text-lg mb-4">
                      Você completou todos os estudos desta semana! Continue firme em sua jornada espiritual.
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                  >
                    <Button className="bg-white text-[#a37fb9] hover:bg-white/90">
                      Compartilhar conquista <Gift className="h-4 w-4 ml-2" />
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Lista de lições por dia da semana */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {lessonsWithProgress.map((day, index) => (
              <motion.div
                key={day.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <LessonCard
                  id={day.id}
                  title={day.title}
                  description={day.description}
                  duration={day.duration}
                  points={day.points}
                  progress={day.progress}
                />
              </motion.div>
            ))}
          </div>
          
          {/* Seção de dica do dia */}
          <motion.div 
            className="mt-12 bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-100 relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-yellow-200/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-300"></div>
            
            <div className="flex items-start gap-4 relative z-10">
              <div className="bg-gradient-to-br from-yellow-300 to-orange-300 p-3 rounded-full text-white shrink-0">
                <Flame className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  Dica <Sparkles className="h-4 w-4 ml-2 text-yellow-400" />
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Reserve um momento especial do seu dia para se dedicar ao estudo da lição. 
                  Consistência é a chave para um aprendizado efetivo e para manter uma conexão espiritual forte.
                </p>
                <div className="flex items-center text-sm text-yellow-600">
                  <Heart className="h-4 w-4 mr-1" />
                  <span>Compartilhado por nossa equipe</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudiesPage;
