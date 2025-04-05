
import { supabase, executeRawQuery } from "@/integrations/supabase/client";

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  progress: number;
  completed: boolean;
  last_accessed: string;
  points_earned: number;
}

// Funções para gerenciar o cache local
const CACHE_KEY = 'user_progress_cache';

const saveToLocalStorage = (userId: string, progress: UserProgress[]) => {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    cache[userId] = progress;
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error);
  }
};

const getFromLocalStorage = (userId: string): UserProgress[] => {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    return cache[userId] || [];
  } catch (error) {
    console.error('Erro ao ler do localStorage:', error);
    return [];
  }
};

export const getUserProgress = async (userId: string) => {
  // Primeiro, tenta obter do cache local
  const cachedProgress = getFromLocalStorage(userId);
  
  try {
    // Tenta buscar do Supabase
    const { data, error } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId);
      
    if (error) {
      console.error("Erro ao buscar progresso do Supabase:", error.message);
      return cachedProgress; // Retorna o cache se houver erro
    }
    
    // Atualiza o cache local com os dados mais recentes
    const progressData = data as UserProgress[];
    saveToLocalStorage(userId, progressData);
    
    return progressData;
  } catch (e) {
    console.error("Erro ao conectar ao Supabase:", e);
    // Retorna o cache em caso de erro de conexão
    return cachedProgress;
  }
};

export const updateUserProgress = async (
  userId: string,
  lessonId: string,
  progress: number,
  completed: boolean = false,
  pointsEarned: number = 0
) => {
  // Obter o progresso atual do cache
  const cachedProgress = getFromLocalStorage(userId);
  
  // Encontrar o registro existente no cache
  const existingIndex = cachedProgress.findIndex(
    p => p.user_id === userId && p.lesson_id === lessonId
  );
  
  // Criar objeto com os dados atualizados
  const updatedProgressData = {
    user_id: userId,
    lesson_id: lessonId,
    progress,
    completed: existingIndex >= 0 ? completed || cachedProgress[existingIndex].completed : completed,
    last_accessed: new Date().toISOString(),
    points_earned: existingIndex >= 0 && !completed ? cachedProgress[existingIndex].points_earned : pointsEarned,
  };
  
  // Atualizar no cache local primeiro
  if (existingIndex >= 0) {
    // Atualizar registro existente mantendo o ID
    const id = cachedProgress[existingIndex].id;
    cachedProgress[existingIndex] = { ...updatedProgressData, id };
  } else {
    // Criar um novo registro com ID temporário
    cachedProgress.push({ 
      ...updatedProgressData,
      id: `temp_${Date.now()}_${Math.random().toString(36).substring(2)}` 
    });
  }
  saveToLocalStorage(userId, cachedProgress);
  
  try {
    // Tenta atualizar no Supabase
    const { data: existingProgress } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .maybeSingle();
      
    if (existingProgress) {
      // Atualizar registro existente
      const { data, error } = await supabase
        .from("user_progress")
        .update({
          progress,
          completed: completed || existingProgress.completed,
          last_accessed: new Date().toISOString(),
          points_earned: completed ? pointsEarned : existingProgress.points_earned,
        })
        .eq("user_id", userId)
        .eq("lesson_id", lessonId)
        .select();
        
      if (error) {
        console.error("Erro ao atualizar no Supabase:", error.message);
        return cachedProgress.find(p => p.user_id === userId && p.lesson_id === lessonId);
      }
      
      // Atualizar cache com os dados confirmados
      const updatedCache = cachedProgress.map(p => {
        if (p.user_id === userId && p.lesson_id === lessonId) {
          return data[0];
        }
        return p;
      });
      saveToLocalStorage(userId, updatedCache);
      
      return data[0];
    } else {
      // Criar novo registro
      const { data, error } = await supabase
        .from("user_progress")
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          progress,
          completed,
          last_accessed: new Date().toISOString(),
          points_earned: completed ? pointsEarned : 0,
        })
        .select();
        
      if (error) {
        console.error("Erro ao inserir no Supabase:", error.message);
        return cachedProgress.find(p => p.user_id === userId && p.lesson_id === lessonId);
      }
      
      // Atualizar cache com os dados confirmados
      const updatedCache = cachedProgress.map(p => {
        if (p.user_id === userId && p.lesson_id === lessonId) {
          return data[0];
        }
        return p;
      });
      saveToLocalStorage(userId, updatedCache);
      
      return data[0];
    }
  } catch (e) {
    console.error("Erro ao conectar ao Supabase:", e);
    // Retornar os dados do cache em caso de erro
    return cachedProgress.find(p => p.user_id === userId && p.lesson_id === lessonId);
  }
};

export const getTotalCompletedLessons = async (userId: string) => {
  // Obter dados do cache
  const cachedProgress = getFromLocalStorage(userId);
  const cachedCount = cachedProgress.filter(p => p.progress >= 50).length;
  
  try {
    // Tentar buscar do Supabase
    const { data, error, count } = await supabase
      .from("user_progress")
      .select("*", { count: 'exact' })
      .eq("user_id", userId)
      .gte("progress", 50);
      
    if (error) {
      console.error("Erro ao buscar contagem do Supabase:", error.message);
      return cachedCount;
    }
    
    // Atualizar cache com os dados recentes
    saveToLocalStorage(userId, data as UserProgress[]);
    
    return count || 0;
  } catch (e) {
    console.error("Erro ao conectar ao Supabase:", e);
    return cachedCount;
  }
};

export const getTotalPoints = async (userId: string) => {
  // Calcular pontos do cache
  const cachedProgress = getFromLocalStorage(userId);
  const cachedPoints = cachedProgress.reduce((sum, item) => sum + (item.points_earned || 0), 0);
  
  try {
    const { data, error } = await supabase
      .from("user_progress")
      .select("points_earned")
      .eq("user_id", userId);
      
    if (error) {
      console.error("Erro ao buscar pontos do Supabase:", error.message);
      return cachedPoints;
    }
    
    return data.reduce((sum, item) => sum + (item.points_earned || 0), 0);
  } catch (e) {
    console.error("Erro ao conectar ao Supabase:", e);
    return cachedPoints;
  }
};

export const getStreakDays = async (userId: string) => {
  // Obter dados do cache
  const cachedProgress = getFromLocalStorage(userId);
  
  try {
    const { data, error } = await supabase
      .from("user_progress")
      .select("last_accessed")
      .eq("user_id", userId)
      .order("last_accessed", { ascending: false });
      
    if (error) {
      console.error("Erro ao buscar streak do Supabase:", error.message);
      
      // Calcular streak do cache
      if (!cachedProgress.length) return 0;
      
      // Ordenar por data de acesso mais recente
      const sortedCache = [...cachedProgress].sort((a, b) => 
        new Date(b.last_accessed).getTime() - new Date(a.last_accessed).getTime()
      );
      
      let streak = 1;
      let currentDate = new Date(sortedCache[0].last_accessed);
      
      for (let i = 1; i < sortedCache.length; i++) {
        const prevDate = new Date(sortedCache[i].last_accessed);
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
    }
    
    if (!data.length) return 0;
    
    // Calcular streak baseado em dias consecutivos
    let streak = 1;
    let currentDate = new Date(data[0].last_accessed);
    
    for (let i = 1; i < data.length; i++) {
      const prevDate = new Date(data[i].last_accessed);
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
  } catch (e) {
    console.error("Erro ao conectar ao Supabase:", e);
    
    // Calcular streak do cache em caso de erro
    if (!cachedProgress.length) return 0;
    
    // Ordenar por data de acesso mais recente
    const sortedCache = [...cachedProgress].sort((a, b) => 
      new Date(b.last_accessed).getTime() - new Date(a.last_accessed).getTime()
    );
    
    let streak = 1;
    let currentDate = new Date(sortedCache[0].last_accessed);
    
    for (let i = 1; i < sortedCache.length; i++) {
      const prevDate = new Date(sortedCache[i].last_accessed);
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
  }
};

// Define interface for comments separately from Supabase types
export interface Comment {
  id?: string;
  user_id: string;
  lesson_id: string;
  author: string;
  text: string;
  created_at: string;
}

// Use custom fetch for comments since they're not in the type definitions
export const saveComment = async (comment: Omit<Comment, 'id' | 'created_at'>) => {
  try {
    // Use executeRawQuery with any casting to bypass type checking
    const result = await executeRawQuery('insert_comment', {
      user_id_param: comment.user_id,
      lesson_id_param: comment.lesson_id,
      author_param: comment.author,
      text_param: comment.text
    });
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    // Handle potentially null data safely
    const commentId = result.data && typeof result.data === 'object' && 'id' in result.data 
      ? result.data.id 
      : `temp_${Date.now()}`;
      
    return {
      ...comment,
      id: commentId,
      created_at: new Date().toISOString()
    } as Comment;
  } catch (e: any) {
    console.error("Erro ao salvar comentário:", e);
    throw e;
  }
};

export const getCommentsByLessonId = async (lessonId: string) => {
  try {
    // Use executeRawQuery with any casting to bypass type checking
    const result = await executeRawQuery('get_comments_by_lesson', { 
      lesson_id_param: lessonId 
    });
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    // Handle null data case
    if (!result.data || !Array.isArray(result.data)) {
      return [];
    }
    
    // Map the raw data to our Comment interface
    return result.data.map(item => ({
      id: item.id,
      user_id: item.user_id,
      lesson_id: item.lesson_id,
      author: item.author,
      text: item.text,
      created_at: item.created_at
    })) as Comment[];
  } catch (e) {
    console.error("Erro ao buscar comentários:", e);
    return [];
  }
};
