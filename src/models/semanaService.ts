import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { v4 as uuidv4 } from 'uuid';

export type Semana = Tables<'semanas'>;

// Buscar todas as semanas
export const listarSemanas = async (): Promise<Semana[]> => {
  const { data, error } = await supabase
    .from('semanas')
    .select('*')
    .order('numero');
    
  if (error) {
    console.error('Erro ao listar semanas:', error);
    throw error;
  }
  
  return data || [];
};

// Buscar semanas por trimestre
export const listarSemanasPorTrimestre = async (trimestreId: string): Promise<Semana[]> => {
  const { data, error } = await supabase
    .from('semanas')
    .select('*')
    .eq('trimestre_id', trimestreId)
    .order('numero');
    
  if (error) {
    console.error('Erro ao listar semanas por trimestre:', error);
    throw error;
  }
  
  return data || [];
};

// Buscar uma semana específica
export const obterSemana = async (id: string): Promise<Semana | null> => {
  const { data, error } = await supabase
    .from('semanas')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Erro ao obter semana:', error);
    throw error;
  }
  
  return data;
};

// Fazer upload de imagem para o sábado
export const uploadImagemSabado = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `sabado_${uuidv4()}.${fileExt}`;
  const filePath = `semanas/${fileName}`;
  
  const { error: uploadError } = await supabase
    .storage
    .from('images')
    .upload(filePath, file);
    
  if (uploadError) {
    console.error('Erro ao fazer upload da imagem:', uploadError);
    throw uploadError;
  }
  
  const { data } = await supabase
    .storage
    .from('images')
    .getPublicUrl(filePath);
    
  return data.publicUrl;
};

// Criar uma nova semana
export const criarSemana = async (
  semana: {
    trimestre_id: string;
    numero: number;
    titulo: string;
    texto_biblico_chave: string;
    resumo: string;
  },
  imagemSabado?: File
): Promise<Semana> => {
  let imgSabadoUrl = null;
  
  if (imagemSabado) {
    imgSabadoUrl = await uploadImagemSabado(imagemSabado);
  }
  
  const { data, error } = await supabase
    .from('semanas')
    .insert([{
      ...semana,
      img_sabado_url: imgSabadoUrl
    }])
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao criar semana:', error);
    throw error;
  }
  
  return data;
};

// Atualizar uma semana existente
export const atualizarSemana = async (
  id: string,
  semana: {
    trimestre_id?: string;
    numero?: number;
    titulo?: string;
    texto_biblico_chave?: string;
    resumo?: string;
    img_sabado_url?: string | null;
  },
  imagemSabado?: File
): Promise<Semana> => {
  let dadosAtualizados = { ...semana };
  
  if (imagemSabado) {
    const imgSabadoUrl = await uploadImagemSabado(imagemSabado);
    dadosAtualizados = {
      ...dadosAtualizados,
      img_sabado_url: imgSabadoUrl
    };
  }
  
  const { data, error } = await supabase
    .from('semanas')
    .update(dadosAtualizados)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao atualizar semana:', error);
    throw error;
  }
  
  return data;
};

// Excluir uma semana
export const excluirSemana = async (id: string): Promise<void> => {
  // Primeiro, obtém a semana para obter a URL da imagem
  const semana = await obterSemana(id);
  
  // Exclui a semana
  const { error } = await supabase
    .from('semanas')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Erro ao excluir semana:', error);
    throw error;
  }
  
  // Se houver uma imagem associada, exclui ela também
  if (semana?.img_sabado_url) {
    try {
      const pathMatch = semana.img_sabado_url.match(/\/images\/([^?]+)/);
      if (pathMatch && pathMatch[1]) {
        const filePath = pathMatch[1];
        await supabase.storage.from('images').remove([filePath]);
      }
    } catch (storageError) {
      console.error('Erro ao excluir imagem da semana:', storageError);
      // Não impede o fluxo se a imagem não puder ser excluída
    }
  }
}; 