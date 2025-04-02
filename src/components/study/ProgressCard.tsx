
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, BookOpen, Target } from "lucide-react";

type ProgressCardProps = {
  totalPoints: number;
  completedLessons: number;
  streakDays: number;
};

const ProgressCard: React.FC<ProgressCardProps> = ({
  totalPoints,
  completedLessons,
  streakDays,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Seu Progresso</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-12 h-12 rounded-circle bg-primary/10 flex items-center justify-center">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total de Pontos</p>
              <p className="text-2xl font-semibold">{totalPoints}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-12 h-12 rounded-circle bg-seven-purple/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-seven-purple" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lições Completas</p>
              <p className="text-2xl font-semibold">{completedLessons}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-12 h-12 rounded-circle bg-seven-gold/10 flex items-center justify-center">
              <Target className="h-6 w-6 text-seven-gold" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dias Consecutivos</p>
              <p className="text-2xl font-semibold">{streakDays}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressCard;
