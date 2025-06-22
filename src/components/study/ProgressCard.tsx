import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CalendarCheck, Calendar, Trophy, Award, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getUserProgress } from "@/models/userProgress";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type ProgressCardProps = {
  completedLessons: number;
};

const ProgressCard: React.FC<ProgressCardProps> = ({
  completedLessons,
}) => {
  // Usuário anônimo fixo
  const anonymousUserId = 'anonymous-user';
  
  // Lista de dias da semana e seus IDs correspondentes
  const weekDays = [
    { abbr: "Dom", id: "domingo" },
    { abbr: "Seg", id: "segunda" },
    { abbr: "Ter", id: "terca" },
    { abbr: "Qua", id: "quarta" },
    { abbr: "Qui", id: "quinta" },
    { abbr: "Sex", id: "sexta" },
    { abbr: "Sáb", id: "sabado" }
  ];
  
  // Buscar progresso do usuário
  const { data: userProgress = [], isLoading: isProgressLoading } = useQuery({
    queryKey: ['userProgressForDashboard'],
    queryFn: async () => {
      try {
        return getUserProgress();
      } catch (e) {
        console.error("Erro ao buscar progresso:", e);
        return [];
      }
    }
  });
  
  // Determinar quais dias foram estudados (onde o progresso >= 50%)
  const completedDayIds = userProgress
    .filter(progress => progress.completed)
    .map(progress => progress.lesson_id);
  
  // Calcular o progresso geral (porcentagem de dias concluídos)
  const calculaProgressoGeral = () => {
    const totalDias = 7;
    return Math.round((completedLessons / totalDias) * 100);
  };
  
  return (
    <Card className="modern-card border-t-4 border-t-[#337945] overflow-hidden relative">
      {/* Elementos decorativos */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#337945]/5 rounded-full -z-10 translate-x-1/2 -translate-y-1/2 blur-xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#337945]/5 rounded-full -z-10 -translate-x-1/3 translate-y-1/3 blur-lg"></div>
      
      <CardHeader className="border-b border-muted/30 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-normal tracking-wide flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#337945]" />
            Seu Progresso
          </CardTitle>
          {calculaProgressoGeral() >= 50 && (
            <Badge variant="outline" className="bg-gradient-to-r from-amber-400 to-amber-500 text-white border-0 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> 
              <span>{calculaProgressoGeral() >= 100 ? "Concluído" : "Em andamento"}</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="flex flex-col gap-6">
          {/* Barra de progresso geral */}
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-muted-foreground">Progresso total</span>
              <span className="text-sm font-medium">{calculaProgressoGeral()}%</span>
            </div>
            <Progress value={calculaProgressoGeral()} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">
              {completedLessons} de 7 lições concluídas
            </p>
          </div>
          
          {/* Dias da semana */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-xs font-normal mb-4 uppercase tracking-wider text-muted-foreground">Esta Semana</p>
            <div className="grid grid-cols-7 gap-1 md:flex md:justify-between">
              {weekDays.map((day) => (
                <div key={day.id} className="flex flex-col items-center">
                  <div 
                    className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center mb-1 rounded-full transition-all ${
                      completedDayIds.includes(day.id) 
                        ? 'bg-gradient-to-br from-[#337945] to-[#8fb775] text-white shadow-sm' 
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {completedDayIds.includes(day.id) ? (
                      <CalendarCheck className="h-4 w-4 md:h-5 md:w-5" />
                    ) : (
                      <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                    )}
                  </div>
                  <span className="text-xs font-light">{day.abbr}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Mensagem motivacional */}
          {calculaProgressoGeral() < 100 && (
            <div className="text-sm text-muted-foreground bg-[#337945]/5 p-3 rounded-md border border-[#337945]/20">
              {calculaProgressoGeral() === 0 ? (
                "Você ainda não começou. Inicie seu estudo!"
              ) : calculaProgressoGeral() < 50 ? (
                "Bom começo! Continue avançando em seus estudos."
              ) : (
                "Você está indo muito bem! Falta pouco para concluir."
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressCard;
