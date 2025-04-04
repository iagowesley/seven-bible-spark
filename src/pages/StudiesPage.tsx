import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LessonCard from "@/components/study/LessonCard";
import { Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="seven-container px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Lições da semana</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Escolha o dia da semana para estudar a lição correspondente
            </p>
          </div>

          {/* Feedback quando todos os estudos foram completados */}
          {allLessonsCompleted && (
            <Card className="p-6 mb-8 bg-gradient-to-r from-[#a37fb9] to-[#7957a0] text-white text-center">
              <div className="flex flex-col items-center justify-center">
                <Trophy className="h-12 w-12 md:h-16 md:w-16 mb-4 text-yellow-300" />
                <h2 className="text-xl md:text-2xl font-bold mb-2">Parabéns!</h2>
                <p className="text-base md:text-lg mb-4">
                  Você completou todos os estudos desta semana! Continue firme em sua jornada espiritual.
                </p>
              </div>
            </Card>
          )}

          {/* Lista de lições por dia da semana */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {lessonsWithProgress.map((day) => (
              <LessonCard
                key={day.id}
                id={day.id}
                title={day.title}
                description={day.description}
                duration={day.duration}
                points={day.points}
                progress={day.progress}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudiesPage;
