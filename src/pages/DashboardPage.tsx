import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getTotalCompletedLessons, getTotalPoints, getStreakDays, getUserProgress, updateUserProgress } from '../models/userProgress';
import { getLessons } from '../data/studies';
import ProgressCard from '../components/study/ProgressCard';
import Spinner from "../components/ui/Spinner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowRight, CheckCircle, Trophy, Calendar, BookMarked, Award, Star, Flame, BarChart as BarChartIcon, CalendarRange } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';


const COLORS = ['#337945', '#8fb775', '#2d6537', '#4a7c55', '#1e5a26'];

const DashboardPage: React.FC = () => {
  const [selectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth] = useState<number>(new Date().getMonth());
  const currentDate = new Date();
  const anonymousUserId = 'anonymous-user';
  const [weeklyProgress, setWeeklyProgress] = useState<any[]>([]);


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
  
  const { data: pointsEarned, isLoading: isPointsLoading } = useQuery({
    queryKey: ['points-earned'],
    queryFn: async () => getTotalPoints(anonymousUserId)
  });
  
  const { data: streakDays, isLoading: isStreakLoading } = useQuery({
    queryKey: ['streak-days'],
    queryFn: async () => getStreakDays(anonymousUserId)
  });

  // Calcular progresso semanal para visualização
  useEffect(() => {
    if (progressData) {
      const diasSemana = [
        { dia: "domingo", nome: "Dom", ordem: 0 },
        { dia: "segunda", nome: "Seg", ordem: 1 },
        { dia: "terca", nome: "Ter", ordem: 2 },
        { dia: "quarta", nome: "Qua", ordem: 3 },
        { dia: "quinta", nome: "Qui", ordem: 4 },
        { dia: "sexta", nome: "Sex", ordem: 5 },
        { dia: "sabado", nome: "Sáb", ordem: 6 }
      ];
      
      const progressoSemanal = diasSemana.map(d => {
        const licao = progressData.find((p: any) => p.lesson_id === d.dia);
        return {
          name: d.nome,
          progresso: licao ? licao.progress : 0,
          concluido: licao ? licao.completed : false,
          ordem: d.ordem,
          dia: d.dia
        };
      }).sort((a, b) => a.ordem - b.ordem);
      
      setWeeklyProgress(progressoSemanal);
    }
  }, [progressData]);

  // Determinar qual é a próxima lição para o usuário
  const getNextLesson = () => {
    const days = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
    
    if (!progressData || progressData.length === 0) {
      return days[0]; // Se não houver progresso, comece pelo domingo
    }
    
    // Verificar a última lição concluída
    const completedLessons = progressData
      .filter((progress: any) => progress.completed)
      .map((progress: any) => progress.lesson_id);
    
    for (let i = 0; i < days.length; i++) {
      if (!completedLessons.includes(days[i])) {
        return days[i]; // Retornar o primeiro dia não concluído
      }
    }
    
    return days[0]; // Se todas foram concluídas, voltar ao início
  };
  
  // Calcular o progresso geral
  const calcularProgressoGeral = () => {
    if (!progressData) return 0;
    
    const totalDias = 7;
    const diasConcluidos = progressData.filter((p: any) => p.completed).length;
    
    return Math.round((diasConcluidos / totalDias) * 100);
  };

  // Customizar tooltip para gráficos
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border rounded shadow-sm">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm">
            Progresso: <span className="font-medium">{payload[0].value}%</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {payload[0].payload.concluido ? 'Concluído' : 'Não concluído'}
          </p>
        </div>
      );
    }
    return null;
  };
  
  const isLoading = isProgressLoading || isCompletedLoading || isPointsLoading || isStreakLoading;



  return (
    <>
      <Navbar />
      <div className="container mx-auto py-12 px-4 max-w-6xl min-h-[calc(100vh-80px)]">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-[#337945]">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Acompanhe seu progresso e conquistas</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#337945]"></div>
            </div>
          ) : (
            <>
              {/* Card de Lições Concluídas */}
              <div className="mb-6">
                <Card className="bg-gradient-to-br from-white to-[#f0faf2] dark:from-gray-900 dark:to-gray-800 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium text-[#337945]">
                      Lições Concluídas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {completedLessonsCount}
                      <span className="text-muted-foreground text-sm font-normal ml-1">/ 7</span>
                    </div>
                    <Progress value={(completedLessonsCount / 7) * 100} className="h-2 mt-2" />
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Progresso semanal */}
                <div className="md:col-span-7">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-[#337945] flex items-center">
                        <CalendarRange className="mr-2 h-5 w-5" />
                        Progresso Semanal
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {weeklyProgress.map((day, index) => (
                          <div key={index} className="flex items-center">
                            <div className="w-24 flex-shrink-0 text-sm font-medium">{day.name}</div>
                            <div className="flex-1 mx-2">
                              <Progress value={day.progresso} className="h-2" />
                            </div>
                            <div className="flex-shrink-0 w-16 text-right text-sm text-muted-foreground">
                              {day.progresso}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>


              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DashboardPage;
