import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type Licao = Tables<'licoes'>;

// Buscar todas as lições
export const listarLicoes = async (): Promise<Licao[]> => {
  const { data, error } = await supabase
    .from('licoes')
    .select('*');
    
  if (error) {
    console.error('Erro ao listar lições:', error);
    throw error;
  }
  
  return data || [];
};

// Buscar lições por semana
export const listarLicoesPorSemana = async (semanaId: string): Promise<Licao[]> => {
  const diasSemana = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
  
  const { data, error } = await supabase
    .from('licoes')
    .select('*')
    .eq('semana_id', semanaId);
    
  if (error) {
    console.error('Erro ao listar lições por semana:', error);
    throw error;
  }
  
  // Ordenar por dia da semana
  return (data || []).sort((a, b) => {
    return diasSemana.indexOf(a.dia) - diasSemana.indexOf(b.dia);
  });
};

// Buscar uma lição específica
export const obterLicao = async (id: string): Promise<Licao | null> => {
  const { data, error } = await supabase
    .from('licoes')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Erro ao obter lição:', error);
    throw error;
  }
  
  return data;
};

// Buscar uma lição por dia e semana
export const obterLicaoPorDiaSemana = async (semanaId: string, dia: string): Promise<Licao | null> => {
  const { data, error } = await supabase
    .from('licoes')
    .select('*')
    .eq('semana_id', semanaId)
    .eq('dia', dia)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      // Não encontrado - não é um erro crítico
      return null;
    }
    console.error('Erro ao obter lição por dia e semana:', error);
    throw error;
  }
  
  return data;
};

// Criar uma nova lição
export const criarLicao = async (licao: {
  semana_id: string;
  dia: string;
  texto1: string;
  texto2: string;
  resumo: string;
  hashtags: string;
  texto_biblico_chave: string | null;
  titulo_dia: string;
  subtitulo_dia: string | null;
  perguntas: string | null;
}): Promise<Licao> => {
  // Verifica se já existe uma lição para este dia e semana
  const licaoExistente = await obterLicaoPorDiaSemana(licao.semana_id, licao.dia);
  
  if (licaoExistente) {
    throw new Error(`Já existe uma lição para o dia ${licao.dia} nesta semana.`);
  }
  
  const { data, error } = await supabase
    .from('licoes')
    .insert([licao])
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao criar lição:', error);
    throw error;
  }
  
  return data;
};

// Atualizar uma lição existente
export const atualizarLicao = async (
  id: string,
  licao: {
    semana_id?: string;
    dia?: string;
    texto1?: string;
    texto2?: string;
    resumo?: string;
    hashtags?: string;
    texto_biblico_chave?: string | null;
    titulo_dia?: string;
    subtitulo_dia?: string | null;
    perguntas?: string | null;
  }
): Promise<Licao> => {
  const { data, error } = await supabase
    .from('licoes')
    .update(licao)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao atualizar lição:', error);
    throw error;
  }
  
  return data;
};

// Excluir uma lição
export const excluirLicao = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('licoes')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Erro ao excluir lição:', error);
    throw error;
  }
};

// Verificar se uma semana tem todas as lições de domingo até sexta cadastradas
export const verificarSemanaCompleta = async (semanaId: string): Promise<boolean> => {
  const licoes = await listarLicoesPorSemana(semanaId);
  const diasSemana = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta"];
  
  // Verifica se todos os dias da semana (de domingo até sexta) têm lições cadastradas
  return diasSemana.every(dia => 
    licoes.some(licao => licao.dia === dia)
  );
};

// Verificar se um trimestre tem semanas com lições cadastradas
export const obterSemanasDeTrimestre = async (trimestreId: string): Promise<{ id: string, titulo: string, completa: boolean, numero: number }[]> => {
  const { data: semanas, error } = await supabase
    .from('semanas')
    .select('*')
    .eq('trimestre_id', trimestreId)
    .order('numero');
    
  if (error) {
    console.error('Erro ao listar semanas do trimestre:', error);
    throw error;
  }
  
  if (!semanas || semanas.length === 0) {
    return [];
  }
  
  // Para cada semana, verificar se tem todas as lições
  const resultado = await Promise.all(
    semanas.map(async (semana) => {
      const completa = await verificarSemanaCompleta(semana.id);
      return {
        id: semana.id,
        titulo: semana.titulo,
        numero: semana.numero,
        completa
      };
    })
  );
  
  return resultado;
}; 