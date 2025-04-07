
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getTotalCompletedLessons, getTotalPoints, getStreakDays } from '../models/userProgress';
import { getLessons, studies } from '../data/studies';
import ProgressCard from '../components/study/ProgressCard';
import Spinner from '../components/ui/Spinner';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const DashboardPage: React.FC = () => {
  const [selectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth] = useState<number>(new Date().getMonth());
  const currentDate = new Date();
  const anonymousUserId = 'anonymous-user';

  // Buscar dados de progresso
  const { data: progressData, isLoading: isProgressLoading } = useQuery({
    queryKey: ['dashboard-progress'],
    queryFn: async () => {
      try {
        // Obter dados do localStorage
        const allProgress = JSON.parse(localStorage.getItem('local_user_progress') || '[]');
        return allProgress.filter(p => p.user_id === anonymousUserId);
      } catch (e) {
        console.error("Erro ao buscar progresso:", e);
        return [];
      }
    }
  });

  // Calcular lições completadas (progresso >= 50%)
  const completedLessons = progressData?.filter(lesson => lesson.completed) || [];
  const totalCompletedLessons = completedLessons.length;
  
  // Recuperar streaks e pontos
  const { data: streakDays = 0, isLoading: isStreakLoading } = useQuery({
    queryKey: ['user-streak'],
    queryFn: () => getStreakDays(anonymousUserId)
  });
  
  const { data: totalPoints = 0, isLoading: isPointsLoading } = useQuery({
    queryKey: ['user-points'],
    queryFn: () => getTotalPoints(anonymousUserId)
  });

  // Construir dados para o gráfico de progresso semanal
  const weekDays = [
    { name: "Dom", id: "domingo" },
    { name: "Seg", id: "segunda" },
    { name: "Ter", id: "terca" },
    { name: "Qua", id: "quarta" },
    { name: "Qui", id: "quinta" },
    { name: "Sex", id: "sexta" },
    { name: "Sáb", id: "sabado" }
  ];
  
  const weeklyProgressData = weekDays.map(day => {
    const dayProgress = progressData?.find(p => p.lesson_id === day.id);
    return {
      name: day.name,
      progresso: dayProgress ? dayProgress.progress : 0,
      completo: dayProgress?.completed ? 100 : 0
    };
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="seven-container px-4 sm:px-6">
          {/* Cabeçalho */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Seu dashboard</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Acompanhe seu progresso nos estudos
            </p>
          </div>
          
          {/* Card de Progresso */}
          <div className="max-w-full mx-auto mb-8">
            {isProgressLoading ? (
              <div className="h-56 bg-muted animate-pulse rounded-md"></div>
            ) : (
              <ProgressCard 
                completedLessons={totalCompletedLessons} 
              />
            )}
          </div>
          
          {/* Gráfico de Progresso Semanal */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Progresso Semanal</h2>
            <div className="bg-white p-4 rounded-lg shadow-sm h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyProgressData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="progresso" name="Progresso (%)" fill="#a37fb9" />
                  <Bar dataKey="completo" name="Completado" fill="#4ade80" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-5 rounded-lg shadow-sm flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-2">Lições Completas</h3>
              <p className="text-3xl font-bold text-[#a37fb9]">{totalCompletedLessons}</p>
              <p className="text-sm text-muted-foreground">de 7 lições</p>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-sm flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-2">Pontos Ganhos</h3>
              <p className="text-3xl font-bold text-[#a37fb9]">{totalPoints}</p>
              <p className="text-sm text-muted-foreground">continue estudando</p>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-sm flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-2">Dias Consecutivos</h3>
              <p className="text-3xl font-bold text-[#a37fb9]">{streakDays}</p>
              <p className="text-sm text-muted-foreground">mantenha o ritmo</p>
            </div>
          </div>
          
          {/* Link para continuar estudando */}
          <div className="text-center">
            <Link 
              to="/estudos" 
              className="inline-flex items-center px-6 py-3 bg-[#a37fb9] hover:bg-[#8a6aa0] text-white rounded-md transition-colors"
            >
              Continuar Estudando
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
