
import { supabase } from "@/integrations/supabase/client";

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  progress: number;
  completed: boolean;
  last_accessed: string;
  points_earned: number;
}

export const getUserProgress = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId);
    
  if (error) {
    throw new Error(error.message);
  }
  
  return data as UserProgress[];
};

export const updateUserProgress = async (
  userId: string,
  lessonId: string,
  progress: number,
  completed: boolean = false,
  pointsEarned: number = 0
) => {
  const { data: existingProgress } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .maybeSingle();
    
  if (existingProgress) {
    // Update existing progress
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
      throw new Error(error.message);
    }
    
    return data;
  } else {
    // Create new progress entry
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
      throw new Error(error.message);
    }
    
    return data;
  }
};

export const getTotalCompletedLessons = async (userId: string) => {
  const { data, error, count } = await supabase
    .from("user_progress")
    .select("*", { count: 'exact' })
    .eq("user_id", userId)
    .eq("completed", true);
    
  if (error) {
    throw new Error(error.message);
  }
  
  return count || 0;
};

export const getTotalPoints = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_progress")
    .select("points_earned")
    .eq("user_id", userId);
    
  if (error) {
    throw new Error(error.message);
  }
  
  return data.reduce((sum, item) => sum + (item.points_earned || 0), 0);
};

export const getStreakDays = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_progress")
    .select("last_accessed")
    .eq("user_id", userId)
    .order("last_accessed", { ascending: false });
    
  if (error) {
    throw new Error(error.message);
  }
  
  if (!data.length) return 0;
  
  // Calculate streak based on consecutive days
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
};
