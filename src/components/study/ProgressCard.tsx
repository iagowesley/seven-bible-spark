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
  const { data: userProgress = [], isLoading: isProgressLoading } = useQuery({
    queryKey: ['userProgressForDashboard', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        // Tentar buscar do Supabase primeiro
        const { data, error } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) {
          console.error("Error fetching user progress:", error);
          // Em caso de erro, tentar o cache local
          const cachedData = localStorage.getItem('user_progress_cache');
          if (cachedData) {
            try {
              const cache = JSON.parse(cachedData);
              return cache[user.id] || [];
            } catch (e) {
              console.error("Error parsing cache:", e);
            }
          }
          return [];
        }
        
        // Se obteve dados do Supabase, atualizar o cache
        if (data) {
          try {
            const cachedData = localStorage.getItem('user_progress_cache');
            const cache = cachedData ? JSON.parse(cachedData) : {};
            cache[user.id] = data;
            localStorage.setItem('user_progress_cache', JSON.stringify(cache));
          } catch (e) {
            console.error("Error updating cache:", e);
          }
        }
        
        return data || [];
      } catch (e) {
        console.error("Error connecting to Supabase:", e);
        
        // Em caso de erro de conexão, usar o cache
        try {
          const cachedData = localStorage.getItem('user_progress_cache');
          if (cachedData) {
            const cache = JSON.parse(cachedData);
            return cache[user.id] || [];
          }
        } catch (cacheError) {
          console.error("Error accessing cache:", cacheError);
        }
        
        return [];
      }
    },
    enabled: !!user
  });
  
  // Determinar quais dias foram estudados (onde o progresso >= 50%)
  const completedDayIds = userProgress
    .filter(progress => progress.progress >= 50)
    .map(progress => progress.lesson_id);
  
  return (
    <Card className="modern-card">
      <CardHeader className="border-b border-muted/30">
        <CardTitle className="text-xl font-normal tracking-wide">Seu Progresso</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-muted/30 border-l-4 border-[#a37fb9]">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#a37fb9]/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-[#a37fb9]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-light">Lições Completas</p>
              <p className="text-xl md:text-2xl font-light">{completedLessons}</p>
            </div>
          </div>
          
          <div className="p-3 md:p-5 bg-muted/30">
            <p className="text-xs md:text-sm font-normal mb-3 md:mb-4 uppercase tracking-wider text-muted-foreground">Esta Semana</p>
            <div className="grid grid-cols-7 gap-1 md:flex md:justify-between">
              {weekDays.map((day) => (
                <div key={day.id} className="flex flex-col items-center">
                  <div 
                    className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center mb-1 ${
                      completedDayIds.includes(day.id) 
                        ? 'bg-[#a37fb9] text-white' 
                        : 'bg-muted/50 text-muted-foreground'
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
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressCard;
