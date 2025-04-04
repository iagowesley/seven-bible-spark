import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CalendarCheck, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type ProgressCardProps = {
  completedLessons: number;
};

const ProgressCard: React.FC<ProgressCardProps> = ({
  completedLessons,
}) => {
  const { user } = useAuth();
  
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
  
  // Buscar progresso real do usuário
  const { data: userProgress = [] } = useQuery({
    queryKey: ['userProgressForDashboard', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error("Error fetching user progress:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user
  });
  
  // Determinar quais dias foram estudados (onde o progresso >= 50%)
  const completedDayIds = userProgress
    .filter(progress => progress.progress >= 50)
    .map(progress => progress.lesson_id);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Seu Progresso</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-12 h-12 rounded-circle bg-seven-purple/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-seven-purple" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lições Completas</p>
              <p className="text-2xl font-semibold">{completedLessons}</p>
            </div>
          </div>
          
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-3">Esta Semana</p>
            <div className="flex justify-between">
              {weekDays.map((day) => (
                <div key={day.id} className="flex flex-col items-center">
                  <div 
                    className={`w-10 h-10 flex items-center justify-center rounded-full mb-1 ${
                      completedDayIds.includes(day.id) 
                        ? 'bg-green-500 text-white' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {completedDayIds.includes(day.id) ? (
                      <CalendarCheck className="h-5 w-5" />
                    ) : (
                      <Calendar className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-xs">{day.abbr}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressCard;
