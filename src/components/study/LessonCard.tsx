import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Award, Calendar, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

type LessonCardProps = {
  id: string;
  title: string;
  description: string;
  duration: string;
  points: number;
  progress?: number;
  image?: string;
};

const LessonCard: React.FC<LessonCardProps> = ({
  id,
  title,
  description,
  duration,
  points,
  progress = 0,
  image,
}) => {
  const { user } = useAuth();
  
  // Fetch user progress data for this lesson
  const { data: userProgress } = useQuery({
    queryKey: ['lessonProgress', id, user?.id],
    queryFn: async () => {
      if (!user) return { progress: 0 };
      
      const { data, error } = await supabase
        .from('user_progress')
        .select('progress')
        .eq('user_id', user.id)
        .eq('lesson_id', id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching user progress:", error);
        return { progress: 0 };
      }
      
      return data || { progress: 0 };
    },
    enabled: !!user,
  });
  
  // Use actual user progress data if available
  const currentProgress = userProgress?.progress || progress;

  // Cores personalizadas para cada dia da semana
  const getDayColor = (dayId: string): string => {
    switch (dayId) {
      case "domingo": return "from-red-500 to-orange-500";
      case "segunda": return "from-yellow-500 to-amber-500";
      case "terca": return "from-green-500 to-emerald-500";
      case "quarta": return "from-cyan-500 to-blue-500";
      case "quinta": return "from-blue-500 to-indigo-500";
      case "sexta": return "from-indigo-500 to-violet-500";
      case "sabado": return "from-purple-500 to-pink-500";
      default: return "from-seven-blue to-seven-purple";
    }
  };

  // Obter nome do dia em português
  const getDayName = (dayId: string): string => {
    switch (dayId) {
      case "domingo": return "Domingo";
      case "segunda": return "Segunda-feira";
      case "terca": return "Terça-feira";
      case "quarta": return "Quarta-feira";
      case "quinta": return "Quinta-feira";
      case "sexta": return "Sexta-feira";
      case "sabado": return "Sábado";
      default: return title;
    }
  };

  const dayName = getDayName(id);
  const bgGradient = getDayColor(id);

  return (
    <Card className="overflow-hidden modern-card hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-0 relative">
      {/* Bordas criativas e cantos decorativos */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Cantos decorativos */}
        <div className="absolute -top-1 -left-1 w-10 h-10">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white opacity-70"></div>
        </div>
        <div className="absolute -top-1 -right-1 w-10 h-10">
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white opacity-70"></div>
        </div>
        <div className="absolute -bottom-1 -left-1 w-10 h-10">
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white opacity-70"></div>
        </div>
        <div className="absolute -bottom-1 -right-1 w-10 h-10">
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white opacity-70"></div>
        </div>
        
        {/* Linha de borda lateral esquerda com gradiente */}
        <div className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-gradient-to-b from-transparent via-white to-transparent opacity-50"></div>
        
        {/* Linha de borda lateral direita com gradiente */}
        <div className="absolute right-0 top-1/4 bottom-1/4 w-0.5 bg-gradient-to-b from-transparent via-white to-transparent opacity-50"></div>
        
        {/* Borda superior com gradiente */}
        <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>
        
        {/* Borda inferior com gradiente */}
        <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>
      </div>
      
      <div className={`h-36 bg-gradient-to-r ${bgGradient} flex flex-col items-center justify-center text-white p-4 relative`}>
        {/* Efeito de brilho/reflexo - simula uma borda iluminada */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        
        {/* Linhas decorativas */}
        <div className="absolute top-0 right-0 w-8 h-8">
          <div className="absolute top-3 right-3 w-5 h-0.5 bg-white/40 rotate-45"></div>
          <div className="absolute top-3 right-3 w-0.5 h-5 bg-white/40 rotate-45"></div>
        </div>
        
        <Calendar className="h-10 w-10 text-white opacity-90 mb-2 drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]" />
        <h3 className="text-white font-medium text-xl mb-1 drop-shadow-[0_0_2px_rgba(0,0,0,0.3)]">{dayName}</h3>
        {currentProgress === 100 ? (
          <div className="bg-white/20 rounded-full px-3 py-1 text-xs backdrop-blur-sm shadow-inner">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Concluído
            </span>
          </div>
        ) : currentProgress > 0 ? (
          <div className="bg-white/20 rounded-full px-3 py-1 text-xs backdrop-blur-sm shadow-inner">
            <span>{currentProgress}% completo</span>
          </div>
        ) : null}
      </div>
      
      <CardContent className="pt-4 pb-2 relative">
        {/* Padrão sutil de fundo */}
        <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iIzMzMyIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIvPjwvZz48L3N2Zz4=')]"></div>
        
        <p className="text-sm line-clamp-3 mb-4 font-light relative z-10">
          {description}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground relative z-10">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{duration}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 relative z-10">
        <Button asChild className="w-full relative overflow-hidden group" variant="modern">
          <Link to={`/estudos/${id}`}>
            <span className="relative z-10">Estudar Agora</span>
            {/* Efeito de brilho no botão ao passar o mouse */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LessonCard;
