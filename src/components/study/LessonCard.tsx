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
    <Card className="overflow-hidden modern-card hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-0">
      <div className={`h-36 bg-gradient-to-r ${bgGradient} flex flex-col items-center justify-center text-white p-4`}>
        <Calendar className="h-10 w-10 text-white opacity-90 mb-2" />
        <h3 className="text-white font-medium text-xl mb-1">{dayName}</h3>
        {currentProgress === 100 ? (
          <div className="bg-white/20 rounded-full px-3 py-1 text-xs backdrop-blur-sm">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Concluído
            </span>
          </div>
        ) : currentProgress > 0 ? (
          <div className="bg-white/20 rounded-full px-3 py-1 text-xs backdrop-blur-sm">
            <span>{currentProgress}% completo</span>
          </div>
        ) : null}
      </div>
      
      <CardContent className="pt-4 pb-2">
        <p className="text-sm line-clamp-3 mb-4 font-light">
          {description}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{duration}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button asChild className="w-full" variant="modern">
          <Link to={`/estudos/${id}`}>
            Estudar Agora
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LessonCard;
