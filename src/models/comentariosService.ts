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
  curtidas?: number;
  curtido_pelo_usuario?: boolean;
}

// Interface para criação de comentário
export interface NovoComentario {
  semana_id: string;
  licao_dia: string;
  nome: string;
  localidade: string;
  texto: string;
}

// Interface para curtida de comentário
export interface CurtidaComentario {
  id: string;
  comentario_id: string;
  usuario_id: string;
  data_criacao: string;
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
    
    // Buscar as curtidas de cada comentário
    const comentarios = data || [];
    
    // Obter ID do usuário atual (usando um identificador anônimo armazenado localmente)
    const usuarioId = localStorage.getItem('usuario_anonimo_id') || criarUsuarioAnonimo();
    
    // Para cada comentário, buscar a contagem de curtidas
    for (const comentario of comentarios) {
      // Contar curtidas para este comentário
      // @ts-ignore - Ignorando erros de tipo já que a tabela será criada no Supabase
      const { count: contagemCurtidas, error: errorCurtidas } = await supabase
        .from('curtidas_comentarios')
        .select('id', { count: 'exact', head: false })
        .eq('comentario_id', comentario.id);
      
      // Verificar se o usuário atual curtiu este comentário
      // @ts-ignore - Ignorando erros de tipo já que a tabela será criada no Supabase
      const { data: curtidaUsuario, error: errorCurtidaUsuario } = await supabase
        .from('curtidas_comentarios')
        .select('id')
        .eq('comentario_id', comentario.id)
        .eq('usuario_id', usuarioId)
        .maybeSingle();
      
      if (errorCurtidas || errorCurtidaUsuario) {
        console.error('Erro ao buscar curtidas:', errorCurtidas || errorCurtidaUsuario);
      }
      
      // Adicionar informações de curtidas ao comentário
      // @ts-ignore - Ignorando erros de tipo já que estamos adicionando propriedades dinamicamente
      comentario.curtidas = contagemCurtidas || 0;
      // @ts-ignore - Ignorando erros de tipo já que estamos adicionando propriedades dinamicamente
      comentario.curtido_pelo_usuario = !!curtidaUsuario;
    }
    
    // @ts-ignore - Ignorando erros de tipo já que sabemos que os dados são compatíveis
    return comentarios as Comentario[];
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

/**
 * Curtir ou descurtir um comentário
 * @param comentarioId ID do comentário a ser curtido/descurtido
 * @returns True se o comentário foi curtido, false se foi descurtido
 */
export const curtirComentario = async (comentarioId: string): Promise<boolean> => {
  try {
    // Obter ID do usuário atual (usando um identificador anônimo armazenado localmente)
    const usuarioId = localStorage.getItem('usuario_anonimo_id') || criarUsuarioAnonimo();
    
    // Verificar se o usuário já curtiu este comentário
    // @ts-ignore - Ignorando erros de tipo já que a tabela será criada no Supabase
    const { data, error } = await supabase
      .from('curtidas_comentarios')
      .select('id')
      .eq('comentario_id', comentarioId)
      .eq('usuario_id', usuarioId)
      .maybeSingle();
      
    if (error) {
      console.error('Erro ao verificar curtida:', error);
      throw new Error('Não foi possível verificar se você já curtiu este comentário');
    }
    
    // Se o usuário já curtiu, remover a curtida
    if (data) {
      // @ts-ignore - Ignorando erros de tipo já que a tabela será criada no Supabase
      const { error: errorDelete } = await supabase
        .from('curtidas_comentarios')
        .delete()
        .eq('id', data.id);
        
      if (errorDelete) {
        console.error('Erro ao remover curtida:', errorDelete);
        throw new Error('Não foi possível remover sua curtida');
      }
      
      return false; // Indica que o comentário foi descurtido
    }
    
    // Se o usuário não curtiu, adicionar uma curtida
    const novaCurtida = {
      id: uuidv4(),
      comentario_id: comentarioId,
      usuario_id: usuarioId,
      data_criacao: new Date().toISOString()
    };
    
    // @ts-ignore - Ignorando erros de tipo já que a tabela será criada no Supabase
    const { error: errorInsert } = await supabase
      .from('curtidas_comentarios')
      .insert([novaCurtida]);
      
    if (errorInsert) {
      console.error('Erro ao adicionar curtida:', errorInsert);
      throw new Error('Não foi possível curtir este comentário');
    }
    
    return true; // Indica que o comentário foi curtido
  } catch (error) {
    console.error('Erro ao curtir comentário:', error);
    throw new Error('Erro ao curtir comentário');
  }
};

/**
 * Cria um ID de usuário anônimo e o armazena no localStorage
 * @returns ID de usuário anônimo
 */
const criarUsuarioAnonimo = (): string => {
  const usuarioId = uuidv4();
  localStorage.setItem('usuario_anonimo_id', usuarioId);
  return usuarioId;
}; 