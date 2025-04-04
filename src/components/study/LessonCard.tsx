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
      <div 
        className={`h-48 bg-muted bg-cover bg-center`}
        style={image ? { backgroundImage: `url(${image})` } : {}}
      >
        {!image && (
          <div className={`h-full flex items-center justify-center bg-gradient-to-r ${bgGradient}`}>
            <div className="text-center">
              <Calendar className="h-12 w-12 text-white opacity-90 mx-auto mb-1" />
              <h3 className="text-white font-normal text-xl">{dayName}</h3>
            </div>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="line-clamp-1 text-xl font-normal">{title}</CardTitle>
          {currentProgress > 0 && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-muted-foreground text-sm line-clamp-3 mb-3 font-light">
          {description}
        </p>
        <div className="flex items-center text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{duration}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
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
