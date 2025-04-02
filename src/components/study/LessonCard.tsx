
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Award } from "lucide-react";
import { Link } from "react-router-dom";

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

  const bgGradient = getDayColor(id);

  return (
    <Card className="overflow-hidden card-hover">
      <div 
        className={`h-40 bg-muted bg-cover bg-center`}
        style={image ? { backgroundImage: `url(${image})` } : {}}
      >
        {!image && (
          <div className={`h-full flex items-center justify-center bg-gradient-to-r ${bgGradient}`}>
            <BookOpen className="h-12 w-12 text-white opacity-80" />
          </div>
        )}
      </div>
      
      <CardHeader>
        <CardTitle className="line-clamp-1">{title}</CardTitle>
        {progress > 0 && (
          <div className="mt-2">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {progress}% completo
            </p>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <p className="text-muted-foreground text-sm line-clamp-3 mb-3">
          {description}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="h-3 w-3" />
            <span>{points} pontos</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button asChild className="w-full rounded-full" variant="default">
          <Link to={`/estudos/${id}`}>
            {progress > 0 ? "Continuar Estudo" : "Estudar Agora"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LessonCard;
