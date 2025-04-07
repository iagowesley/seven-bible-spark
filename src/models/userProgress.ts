// Interface mantida para compatibilidade com componentes existentes
export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  progress: number;
  completed: boolean;
  last_accessed: string;
  points_earned: number;
}

export interface Comment {
  id: string;
  user_id: string;
  lesson_id: string;
  author: string;
  text: string;
  created_at: string;
}

// Chaves do localStorage
const PROGRESS_KEY = 'local_user_progress';
const COMMENTS_KEY = 'local_comments';
const DEFAULT_USER_ID = 'anonymous-user';

// Funções para gerenciar o cache local
const getLocalProgress = (): UserProgress[] => {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]');
  } catch (error) {
    console.error('Erro ao ler progresso do localStorage:', error);
    return [];
  }
};

const saveLocalProgress = (progress: UserProgress[]): void => {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Erro ao salvar progresso no localStorage:', error);
  }
};

const getLocalComments = (): Comment[] => {
  try {
    return JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
  } catch (error) {
    console.error('Erro ao ler comentários do localStorage:', error);
    return [];
  }
};

const saveLocalComments = (comments: Comment[]): void => {
  try {
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
  } catch (error) {
    console.error('Erro ao salvar comentários no localStorage:', error);
  }
};

// Função para obter progresso do usuário (agora sempre o usuário anônimo)
export const getUserProgress = async (): Promise<UserProgress[]> => {
  return getLocalProgress();
};

// Função para atualizar progresso
export const updateUserProgress = async (
  userId: string = DEFAULT_USER_ID,
  lessonId: string,
  progress: number,
  completed: boolean = false,
  pointsEarned: number = 0
): Promise<UserProgress> => {
  const allProgress = getLocalProgress();
  const existingIndex = allProgress.findIndex(
    p => p.user_id === userId && p.lesson_id === lessonId
  );
  
  const now = new Date().toISOString();
  
  if (existingIndex >= 0) {
    // Atualizar registro existente
    const updatedProgress = {
      ...allProgress[existingIndex],
      progress,
      completed: completed || allProgress[existingIndex].completed,
      last_accessed: now,
      points_earned: completed ? pointsEarned : allProgress[existingIndex].points_earned,
    };
    
    allProgress[existingIndex] = updatedProgress;
    saveLocalProgress(allProgress);
    
    return updatedProgress;
  } else {
    // Criar novo registro
    const newProgress: UserProgress = {
      id: `local_${Date.now()}`,
      user_id: userId,
      lesson_id: lessonId,
      progress,
      completed,
      last_accessed: now,
      points_earned: completed ? pointsEarned : 0
    };
    
    allProgress.push(newProgress);
    saveLocalProgress(allProgress);
    
    return newProgress;
  }
};

// Função para obter total de lições completas
export const getTotalCompletedLessons = (userId: string = DEFAULT_USER_ID): number => {
  const allProgress = getLocalProgress();
  return allProgress
    .filter(p => p.user_id === userId && p.completed)
    .length;
};

// Função para obter total de pontos
export const getTotalPoints = (userId: string = DEFAULT_USER_ID): number => {
  const allProgress = getLocalProgress();
  return allProgress
    .filter(p => p.user_id === userId)
    .reduce((sum, item) => sum + (item.points_earned || 0), 0);
};

// Função para calcular dias consecutivos
export const getStreakDays = (userId: string = DEFAULT_USER_ID): number => {
  const allProgress = getLocalProgress();
  const userProgress = allProgress.filter(p => p.user_id === userId);
  
  if (!userProgress.length) return 0;
  
  // Ordenar por data de acesso mais recente
  const sortedProgress = [...userProgress].sort((a, b) => 
    new Date(b.last_accessed).getTime() - new Date(a.last_accessed).getTime()
  );
  
  let streak = 1;
  let currentDate = new Date(sortedProgress[0].last_accessed);
  
  for (let i = 1; i < sortedProgress.length; i++) {
    const prevDate = new Date(sortedProgress[i].last_accessed);
    const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }
  
  return streak;
};

// Função para salvar comentário
export const saveComment = async (comment: Omit<Comment, 'id' | 'created_at'>): Promise<Comment> => {
  const allComments = getLocalComments();
  
  const newComment: Comment = {
    id: `local_${Date.now()}`,
    ...comment,
    created_at: new Date().toISOString()
  };
  
  allComments.push(newComment);
  saveLocalComments(allComments);
  
  return newComment;
};

// Função para obter comentários por lição
export const getCommentsByLessonId = async (lessonId: string): Promise<Comment[]> => {
  const allComments = getLocalComments();
  return allComments
    .filter(c => c.lesson_id === lessonId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};
