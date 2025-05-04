-- SQL para criar uma tabela de comentários no Supabase
-- Esta tabela armazenará os comentários dos usuários associados às lições diárias

-- Criar tabela de comentários (apenas se não existir)
CREATE TABLE IF NOT EXISTS public.comentarios (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  semana_id TEXT NOT NULL,
  licao_dia TEXT NOT NULL,
  nome TEXT NOT NULL CHECK (length(nome) >= 2),
  localidade TEXT NOT NULL CHECK (length(localidade) >= 2),
  texto TEXT NOT NULL CHECK (length(texto) BETWEEN 3 AND 1000),
  data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Criar índices para melhorar a performance das consultas
CREATE INDEX IF NOT EXISTS comentarios_semana_id_idx ON public.comentarios (semana_id);
CREATE INDEX IF NOT EXISTS comentarios_licao_dia_idx ON public.comentarios (licao_dia);
CREATE INDEX IF NOT EXISTS comentarios_data_criacao_idx ON public.comentarios (data_criacao DESC);

-- Habilitar Row Level Security
ALTER TABLE public.comentarios ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes para evitar erros de duplicidade
DROP POLICY IF EXISTS "Qualquer pessoa pode ver comentários" ON public.comentarios;
DROP POLICY IF EXISTS "Usuários autenticados podem adicionar comentários" ON public.comentarios;
DROP POLICY IF EXISTS "Qualquer pessoa pode adicionar comentários" ON public.comentarios;

-- Criar políticas de segurança
-- Todo mundo pode ver comentários
CREATE POLICY "Qualquer pessoa pode ver comentários" 
ON public.comentarios FOR SELECT USING (true);

-- Qualquer pessoa (incluindo anônimos) pode adicionar comentários
CREATE POLICY "Qualquer pessoa pode adicionar comentários" 
ON public.comentarios FOR INSERT WITH CHECK (true);

-- Ninguém pode atualizar comentários (opcional - você pode habilitar ou não esta funcionalidade)
-- CREATE POLICY "Ninguém pode atualizar comentários" 
-- ON public.comentarios FOR UPDATE USING (false);

-- Ninguém pode excluir comentários (opcional - você pode habilitar ou não esta funcionalidade)
-- CREATE POLICY "Ninguém pode excluir comentários" 
-- ON public.comentarios FOR DELETE USING (false);

-- Exemplo de política para permitir apenas que o usuário admin exclua comentários
-- CREATE POLICY "Apenas admin pode excluir comentários" 
-- ON public.comentarios FOR DELETE USING (auth.uid() IN (SELECT id FROM auth.users WHERE email = 'admin@example.com'));

-- Remover função existente para evitar erros de duplicidade
DROP FUNCTION IF EXISTS listar_comentarios_por_licao(TEXT, TEXT);

-- Função para listar comentários por lição
CREATE OR REPLACE FUNCTION listar_comentarios_por_licao(semana_id_param TEXT, licao_dia_param TEXT)
RETURNS SETOF comentarios
LANGUAGE SQL
STABLE
AS $$
  SELECT * FROM comentarios 
  WHERE semana_id = semana_id_param 
  AND licao_dia = licao_dia_param
  ORDER BY data_criacao DESC;
$$; 