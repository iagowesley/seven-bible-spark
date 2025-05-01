import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { v4 as uuidv4 } from 'uuid';

export type Trimestre = Tables<'trimestres'>;

// Buscar todos os trimestres
export const listarTrimestres = async (): Promise<Trimestre[]> => {
  const { data, error } = await supabase
    .from('trimestres')
    .select('*')
    .order('ano', { ascending: false })
    .order('nome');
    
  if (error) {
    console.error('Erro ao listar trimestres:', error);
    throw error;
  }
  
  return data || [];
};

// Buscar um trimestre específico
export const obterTrimestre = async (id: string): Promise<Trimestre | null> => {
  const { data, error } = await supabase
    .from('trimestres')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Erro ao obter trimestre:', error);
    throw error;
  }
  
  return data;
};

// Fazer upload de imagem para o trimestre
export const uploadImagemTrimestre = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `trimestre_${uuidv4()}.${fileExt}`;
  const filePath = `trimestres/${fileName}`;
  
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

// Criar um novo trimestre
export const criarTrimestre = async (
  trimestre: { nome: string; ano: number; trimestre: string },
  imagem?: File
): Promise<Trimestre> => {
  let imgUrl = null;
  
  if (imagem) {
    imgUrl = await uploadImagemTrimestre(imagem);
  }
  
  const { data, error } = await supabase
    .from('trimestres')
    .insert([{
      ...trimestre,
      img_url: imgUrl
    }])
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao criar trimestre:', error);
    throw error;
  }
  
  return data;
};

// Atualizar um trimestre existente
export const atualizarTrimestre = async (
  id: string, 
  trimestre: { nome?: string; ano?: number; trimestre?: string; img_url?: string | null },
  imagem?: File
): Promise<Trimestre> => {
  let dadosAtualizados = { ...trimestre };
  
  if (imagem) {
    const imgUrl = await uploadImagemTrimestre(imagem);
    dadosAtualizados = {
      ...dadosAtualizados,
      img_url: imgUrl
    };
  }
  
  const { data, error } = await supabase
    .from('trimestres')
    .update(dadosAtualizados)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao atualizar trimestre:', error);
    throw error;
  }
  
  return data;
};

// Excluir um trimestre
export const excluirTrimestre = async (id: string): Promise<void> => {
  // Primeiro, obtém o trimestre para obter a URL da imagem
  const trimestre = await obterTrimestre(id);
  
  // Exclui o trimestre
  const { error } = await supabase
    .from('trimestres')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Erro ao excluir trimestre:', error);
    throw error;
  }
  
  // Se houver uma imagem associada, exclui ela também
  if (trimestre?.img_url) {
    try {
      const pathMatch = trimestre.img_url.match(/\/images\/([^?]+)/);
      if (pathMatch && pathMatch[1]) {
        const filePath = pathMatch[1];
        await supabase.storage.from('images').remove([filePath]);
      }
    } catch (storageError) {
      console.error('Erro ao excluir imagem do trimestre:', storageError);
      // Não impede o fluxo se a imagem não puder ser excluída
    }
  }
}; 