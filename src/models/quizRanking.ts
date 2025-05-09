import { supabase } from "@/integrations/supabase/client";

// Interface para o ranking do quiz
export interface QuizRanking {
  id: string;
  user_id: string;
  user_name: string;
  semana_id: string;
  pontuacao: number;
  acertos: number;
  total_perguntas: number;
  data_realizacao: string;
}

// Função para salvar a pontuação de um usuário no ranking
export const saveQuizScore = async (
  userId: string,
  userName: string,
  semanaId: string,
  pontuacao: number,
  acertos: number,
  totalPerguntas: number
): Promise<{ success: boolean; ranking?: number; error?: string }> => {
  try {
    // Verificar se o usuário já respondeu a este quiz
    const { data: existingScore, error: checkError } = await supabase
      .from('quiz_ranking')
      .select('id')
      .eq('user_id', userId)
      .eq('semana_id', semanaId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = não encontrado
      console.error("Erro ao verificar pontuação existente:", checkError);
      return {
        success: false,
        error: "Erro ao verificar registros existentes. Tente novamente."
      };
    }

    if (existingScore) {
      return {
        success: false,
        error: "Você já respondeu a este quiz anteriormente."
      };
    }

    // Inserir a nova pontuação
    const { error: insertError } = await supabase
      .from('quiz_ranking')
      .insert({
        user_id: userId,
        user_name: userName,
        semana_id: semanaId,
        pontuacao,
        acertos,
        total_perguntas: totalPerguntas,
      });

    if (insertError) {
      console.error("Erro ao salvar pontuação:", insertError);
      return {
        success: false,
        error: "Não foi possível salvar sua pontuação. Tente novamente."
      };
    }

    // Buscar a posição do usuário no ranking
    const { data: rankings, error: rankError } = await supabase
      .from('quiz_ranking')
      .select('*')
      .eq('semana_id', semanaId)
      .order('pontuacao', { ascending: false })
      .order('data_realizacao', { ascending: true });

    if (rankError) {
      console.error("Erro ao buscar rankings:", rankError);
      return { success: true };
    }

    const userRanking = rankings?.findIndex(r => r.user_id === userId) ?? -1;

    return {
      success: true,
      ranking: userRanking !== -1 ? userRanking + 1 : undefined
    };
  } catch (error) {
    console.error("Erro ao processar ranking:", error);
    return {
      success: false,
      error: "Ocorreu um erro ao processar seu ranking."
    };
  }
};

// Função para obter o top 10 do ranking para uma semana específica
// Se semanaId for string vazia, retorna ranking global
export const getQuizTopRanking = async (semanaId: string): Promise<QuizRanking[]> => {
  try {
    let query = supabase
      .from('quiz_ranking')
      .select('*')
      .order('pontuacao', { ascending: false })
      .order('data_realizacao', { ascending: true })
      .limit(10);
    
    // Se for especificado um semanaId, filtra por ele
    if (semanaId) {
      query = query.eq('semana_id', semanaId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao buscar ranking:", error);
      return [];
    }

    return data as QuizRanking[];
  } catch (error) {
    console.error("Erro ao obter ranking:", error);
    return [];
  }
};

// Função para verificar se o usuário já respondeu ao quiz
export const hasUserCompletedQuiz = async (userId: string, semanaId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('quiz_ranking')
      .select('id')
      .eq('user_id', userId)
      .eq('semana_id', semanaId)
      .single();

    if (error) {
      // Se o erro for "não encontrado", significa que o usuário não completou
      if (error.code === 'PGRST116') {
        return false;
      }
      console.error("Erro ao verificar conclusão do quiz:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Erro ao verificar conclusão do quiz:", error);
    return false;
  }
};

// Função para verificar se o usuário está no top 10
export const isUserInTopRanking = async (userId: string, semanaId: string): Promise<boolean> => {
  try {
    const topRanking = await getQuizTopRanking(semanaId);
    return topRanking.some(item => item.user_id === userId);
  } catch (error) {
    console.error("Erro ao verificar posição no ranking:", error);
    return false;
  }
};

// Função para obter a posição atual do usuário
export const getUserRankingPosition = async (userId: string, semanaId: string): Promise<number | null> => {
  try {
    const { data: rankings, error } = await supabase
      .from('quiz_ranking')
      .select('*')
      .eq('semana_id', semanaId)
      .order('pontuacao', { ascending: false })
      .order('data_realizacao', { ascending: true });

    if (error || !rankings) {
      console.error("Erro ao obter rankings:", error);
      return null;
    }

    const userIndex = rankings.findIndex(r => r.user_id === userId);
    return userIndex !== -1 ? userIndex + 1 : null;
  } catch (error) {
    console.error("Erro ao obter posição no ranking:", error);
    return null;
  }
}; 