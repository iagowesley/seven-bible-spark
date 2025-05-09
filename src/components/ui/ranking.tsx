import React from 'react';
import { Trophy, Medal, User } from 'lucide-react';
import { QuizRanking } from '@/models/quizRanking';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';

interface RankingProps {
  rankings: QuizRanking[];
  currentUserId?: string;
  userRanking?: number | null;
  isInTopRanking?: boolean;
  title?: string;
  description?: string;
  showPositionMessage?: boolean;
  className?: string;
}

const Ranking: React.FC<RankingProps> = ({
  rankings,
  currentUserId,
  userRanking,
  isInTopRanking,
  title = "Ranking do Quiz",
  description,
  showPositionMessage = true,
  className = "",
}) => {
  return (
    <Card className={`border-yellow-200/50 dark:border-yellow-800 shadow-sm ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-center text-xl font-bold">
          <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-center">{description}</CardDescription>
        )}
      </CardHeader>
      
      <CardContent>
        {showPositionMessage && userRanking !== undefined && (
          <div className="mb-4">
            {isInTopRanking ? (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                <p className="text-green-700 dark:text-green-300 text-center font-medium">
                  Parabéns! Você está na posição #{userRanking} do ranking!
                </p>
              </div>
            ) : userRanking ? (
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-md border border-orange-200 dark:border-orange-800">
                <p className="text-orange-700 dark:text-orange-300 text-center">
                  Você está na posição #{userRanking}, fora do Top 10.
                </p>
              </div>
            ) : null}
          </div>
        )}
        
        <div className="overflow-hidden rounded-lg border shadow-sm bg-white dark:bg-gray-800">
          <div className="bg-primary/10 p-3">
            <div className="grid grid-cols-12 gap-1 font-semibold text-sm">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-4 sm:col-span-5">Instagram</div>
              <div className="col-span-2 text-center hidden sm:block">Acertos</div>
              <div className="col-span-2 text-center hidden sm:block">Total</div>
              <div className="col-span-3 sm:col-span-2 text-center">Pontos</div>
              <div className="col-span-4 sm:hidden text-center">Acertos</div>
            </div>
          </div>
          
          <div className="divide-y">
            {rankings.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Nenhum resultado registrado ainda.
              </div>
            ) : (
              rankings.map((rank, index) => (
                <div 
                  key={rank.id} 
                  className={`grid grid-cols-12 gap-1 p-3 text-sm ${
                    rank.user_id === currentUserId 
                      ? 'bg-primary/5 font-medium' 
                      : index === 0 ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''
                  }`}
                >
                  <div className="col-span-1 text-center">
                    {index === 0 ? (
                      <Medal className="h-4 w-4 text-yellow-500 mx-auto" />
                    ) : index === 1 ? (
                      <Medal className="h-4 w-4 text-gray-400 mx-auto" />
                    ) : index === 2 ? (
                      <Medal className="h-4 w-4 text-amber-600 mx-auto" />
                    ) : (
                      <span className="font-bold">{index + 1}</span>
                    )}
                  </div>
                  <div className="col-span-4 sm:col-span-5 truncate flex items-center">
                    {rank.user_id === currentUserId ? (
                      <span className="font-medium">{rank.user_name}</span>
                    ) : (
                      rank.user_name
                    )}
                  </div>
                  <div className="col-span-2 text-center hidden sm:block">
                    {rank.acertos}
                  </div>
                  <div className="col-span-2 text-center hidden sm:block">
                    {rank.total_perguntas}
                  </div>
                  <div className="col-span-3 sm:col-span-2 text-center font-semibold">
                    {rank.pontuacao}%
                    {rank.tempo_realizacao !== null && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                        {formatTime(rank.tempo_realizacao)}
                      </div>
                    )}
                  </div>
                  <div className="col-span-4 sm:hidden text-center text-xs">
                    {rank.acertos}/{rank.total_perguntas}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Função para formatar o tempo em minutos e segundos
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

export default Ranking; 