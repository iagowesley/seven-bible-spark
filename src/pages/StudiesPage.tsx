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
    points: 220,
    image: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=1080&auto=format&fit=crop"
  },
  {
    id: "domingo",
    title: "Domingo",
    description: "A origem do mal e o grande conflito: por que existe o sofrimento?",
    duration: "20 min",
    points: 100,
    image: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=1080&auto=format&fit=crop"
  },
  {
    id: "segunda",
    title: "Segunda-feira",
    description: "O plano da salvação: como Deus resolveu o problema do pecado através de Jesus.",
    duration: "15 min",
    points: 80,
    image: "https://images.unsplash.com/photo-1476041800959-2f6bb412c8ce?q=80&w=1080&auto=format&fit=crop"
  },
  {
    id: "terca",
    title: "Terça-feira",
    description: "A lei de Deus e o seu amor: como os mandamentos revelam o caráter divino.",
    duration: "25 min",
    points: 120,
    image: "https://images.unsplash.com/photo-1490127252417-7c393f993ee4?q=80&w=1080&auto=format&fit=crop"
  },
  {
    id: "quarta",
    title: "Quarta-feira",
    description: "O sábado e sua importância na adoração a Deus e descanso do ser humano.",
    duration: "30 min",
    points: 150,
    image: "https://images.unsplash.com/photo-1493836512294-502baa1986e2?q=80&w=1080&auto=format&fit=crop"
  },
  {
    id: "quinta",
    title: "Quinta-feira",
    description: "A oração e o estudo da Bíblia: como desenvolver um relacionamento com Deus.",
    duration: "40 min",
    points: 200,
    image: "https://images.unsplash.com/photo-1508963493744-76fce69379c0?q=80&w=1080&auto=format&fit=crop"
  },
  {
    id: "sexta",
    title: "Sexta-feira",
    description: "Vida cristã e testemunho: como viver e compartilhar a fé no dia a dia.",
    duration: "35 min",
    points: 180,
    image: "https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?q=80&w=1080&auto=format&fit=crop"
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
        <div className="seven-container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Lição da semana</h1>
            <p className="text-muted-foreground">
              Escolha o dia da semana para estudar a lição correspondente
            </p>
          </div>

          {/* Feedback quando todos os estudos foram completados */}
          {allLessonsCompleted && (
            <Card className="p-6 mb-8 bg-gradient-to-r from-seven-purple to-seven-blue text-white text-center">
              <div className="flex flex-col items-center justify-center">
                <Trophy className="h-16 w-16 mb-4 text-yellow-300" />
                <h2 className="text-2xl font-bold mb-2">Parabéns!</h2>
                <p className="text-lg mb-4">
                  Você completou todos os estudos desta semana! Continue firme em sua jornada espiritual.
                </p>
              </div>
            </Card>
          )}

          {/* Lista de lições por dia da semana */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessonsWithProgress.map((day) => (
              <LessonCard
                key={day.id}
                id={day.id}
                title={day.title}
                description={day.description}
                duration={day.duration}
                points={day.points}
                progress={day.progress}
                image={day.image}
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
