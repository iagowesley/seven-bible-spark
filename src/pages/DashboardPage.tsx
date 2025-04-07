
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getTotalCompletedLessons, getTotalPoints, getStreakDays, getUserProgress } from '../models/userProgress';
import { getLessons } from '../data/studies';
import ProgressCard from '../components/study/ProgressCard';
import Spinner from "../components/ui/Spinner";
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
        return getUserProgress();
      } catch (e) {
        console.error("Erro ao buscar progresso:", e);
        return [];
      }
    }
  });

  const { data: completedLessonsCount, isLoading: isCompletedLoading } = useQuery({
    queryKey: ['completed-lessons-count'],
    queryFn: async () => getTotalCompletedLessons(anonymousUserId)
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
          <div className="max-w-xl mx-auto">
            {isProgressLoading || isCompletedLoading ? (
              <div className="h-56 flex items-center justify-center">
                <Spinner />
              </div>
            ) : (
              <ProgressCard 
                completedLessons={completedLessonsCount || 0} 
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
