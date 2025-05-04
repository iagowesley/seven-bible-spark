import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Interface para comentário
export interface Comentario {
  id: string;
  semana_id: string;
  licao_dia: string;
  nome: string;
  localidade: string;
  texto: string;
  data_criacao: string;
}

// Interface para criação de comentário
export interface NovoComentario {
  semana_id: string;
  licao_dia: string;
  nome: string;
  localidade: string;
  texto: string;
}

/**
 * Lista todos os comentários para uma lição específica
 * @param semanaId ID da semana
 * @param licaoDia Dia da lição (ex: 'domingo', 'segunda', etc.)
 * @returns Lista de comentários ordenada por data de criação (mais recente primeiro)
 */
export const listarComentarios = async (semanaId: string, licaoDia: string): Promise<Comentario[]> => {
  try {
    // @ts-ignore - Ignorando erros de tipo já que a tabela será criada no Supabase
    const { data, error } = await supabase
      .from('comentarios')
      .select('*')
      .eq('semana_id', semanaId)
      .eq('licao_dia', licaoDia)
      .order('data_criacao', { ascending: false });
      
    if (error) {
      console.error('Erro ao listar comentários:', error);
      throw new Error('Não foi possível carregar os comentários');
    }
    
    return (data || []) as Comentario[];
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    throw new Error('Erro ao buscar comentários');
  }
};

/**
 * Adiciona um novo comentário
 * @param comentario Dados do novo comentário
 * @returns O comentário adicionado
 */
export const adicionarComentario = async (comentario: NovoComentario): Promise<Comentario> => {
  try {
    const novoComentario = {
      id: uuidv4(), // Gera um ID único
      ...comentario,
      data_criacao: new Date().toISOString()
    };
    
    // @ts-ignore - Ignorando erros de tipo já que a tabela será criada no Supabase
    const { data, error } = await supabase
      .from('comentarios')
      .insert([novoComentario])
      .select()
      .single();
      
    if (error) {
      console.error('Erro ao adicionar comentário:', error);
      throw new Error('Não foi possível adicionar o comentário');
    }
    
    return data as unknown as Comentario;
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    throw new Error('Erro ao salvar o comentário');
  }
};

/**
 * Exclui um comentário pelo ID
 * @param comentarioId ID do comentário a ser excluído
 */
export const excluirComentario = async (comentarioId: string): Promise<void> => {
  try {
    // @ts-ignore - Ignorando erros de tipo já que a tabela será criada no Supabase
    const { error } = await supabase
      .from('comentarios')
      .delete()
      .eq('id', comentarioId);
      
    if (error) {
      console.error('Erro ao excluir comentário:', error);
      throw new Error('Não foi possível excluir o comentário');
    }
  } catch (error) {
    console.error('Erro ao excluir comentário:', error);
    throw new Error('Erro ao excluir o comentário');
  }
}; 