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
import { BookOpen, ArrowRight, CheckCircle, Trophy, Calendar, BookMarked, Award, Star, Flame, BarChart as BarChartIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const COLORS = ['#a37fb9', '#8a63a8', '#734d93', '#5c377e', '#452269'];

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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Cabeçalho com efeito de destaque */}
          <div className="relative mb-10 md:mb-12 pb-4 border-b border-muted/30">
            <div className="absolute top-0 left-0 w-20 h-20 bg-[#a37fb9]/10 rounded-full -z-10 blur-xl"></div>
            <div className="absolute top-10 right-10 w-32 h-32 bg-blue-500/5 rounded-full -z-10 blur-xl"></div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#a37fb9] to-[#8a63a8]">
              Dashboard Espiritual
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl">
              Acompanhe seu progresso nos estudos bíblicos e visualize seu crescimento espiritual
            </p>
          </div>
          
          {isLoading ? (
              <div className="h-56 flex items-center justify-center">
              <Spinner />
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Card de Progresso Geral */}
              <Card className="modern-card shadow-sm border-t-4 border-t-[#a37fb9] hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Trophy className="h-5 w-5 text-[#a37fb9]" />
                    Progresso Geral
                  </CardTitle>
                  <CardDescription>Seu avanço nesta semana de estudos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-end justify-between">
                      <span className="text-3xl font-bold">{calcularProgressoGeral()}%</span>
                      <span className="text-sm text-muted-foreground">de 100%</span>
                    </div>
                    <Progress value={calcularProgressoGeral()} className="h-2" />
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle className={`h-4 w-4 mr-1 ${completedLessonsCount > 0 ? 'text-green-500' : 'text-muted-foreground'}`} />
                      <span>{completedLessonsCount} de 7 lições concluídas</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Card de Conquistas */}
              <Card className="modern-card shadow-sm border-t-4 border-t-blue-500 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="h-5 w-5 text-blue-500" />
                    Suas Conquistas
                  </CardTitle>
                  <CardDescription>Recompensas pelo seu esforço</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-amber-500" />
                        <span>Pontos Acumulados</span>
                      </div>
                      <Badge variant="outline" className="font-bold">{pointsEarned || 0}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flame className="h-5 w-5 text-orange-500" />
                        <span>Sequência de Estudos</span>
                      </div>
                      <Badge variant="outline" className="font-bold">{streakDays || 0} dias</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookMarked className="h-5 w-5 text-green-500" />
                        <span>Lições Completadas</span>
                      </div>
                      <Badge variant="outline" className="font-bold">{completedLessonsCount || 0}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Card do Próximo Estudo */}
              <Card className="modern-card shadow-sm border-t-4 border-t-purple-500 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    Próximo Estudo
                  </CardTitle>
                  <CardDescription>Seu progresso na jornada espiritual</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex flex-col gap-4">
                    <div className="p-4 bg-muted/30 rounded-md">
                      <h3 className="font-medium mb-1 capitalize">
                        {getNextLesson() === "terca" ? "Terça-feira" : 
                         getNextLesson() === "sabado" ? "Sábado" : 
                         getNextLesson() + "-feira"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Próxima lição a ser estudada
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Calendário Semanal */}
              <Card className="modern-card shadow-sm border-t-4 border-t-green-500 hover:shadow-md transition-shadow md:col-span-2 lg:col-span-3">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-green-500" />
                    Calendário de Estudos
                  </CardTitle>
                  <CardDescription>Progresso diário desta semana</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-3 p-2">
                    {weeklyProgress.map((day) => (
                      <div 
                        key={day.dia}
                        className={`aspect-square flex flex-col items-center justify-center rounded-md ${
                          day.concluido 
                            ? 'bg-green-100 dark:bg-green-900/30' 
                            : day.progresso > 0 
                              ? 'bg-amber-100 dark:bg-amber-900/30' 
                              : 'bg-muted/30'
                        }`}
                      >
                        <span className="text-sm font-medium mb-1">{day.name}</span>
                        {day.concluido ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : day.progresso > 0 ? (
                          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">{day.progresso}%</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Botões de navegação */}
          <div className="flex justify-center mt-8">
            <Link to="/estudos">
              <Button variant="outline" className="gap-2">
                Ver todos os estudos
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
