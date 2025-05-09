-- Criar a tabela de ranking para o quiz
CREATE TABLE IF NOT EXISTS public.quiz_ranking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  semana_id TEXT NOT NULL,
  pontuacao INTEGER NOT NULL,
  acertos INTEGER NOT NULL,
  total_perguntas INTEGER NOT NULL,
  data_realizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garante que cada usuário só responde uma vez por semana
  CONSTRAINT unique_user_semana UNIQUE (user_id, semana_id)
);

-- Criar índices para consultas mais rápidas
CREATE INDEX idx_quiz_ranking_pontuacao ON public.quiz_ranking (semana_id, pontuacao DESC);
CREATE INDEX idx_quiz_ranking_user ON public.quiz_ranking (user_id);

-- Permissões para usuários anônimos (necessárias para a aplicação funcionar sem login)
ALTER TABLE public.quiz_ranking ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura anônima
CREATE POLICY "Permitir leitura anônima do ranking" 
ON public.quiz_ranking FOR SELECT 
TO anon
USING (true);

-- Política para permitir inserção por usuários anônimos
CREATE POLICY "Permitir inserção anônima no ranking" 
ON public.quiz_ranking FOR INSERT 
TO anon
WITH CHECK (true);

-- Comentários da tabela para documentação
COMMENT ON TABLE public.quiz_ranking IS 'Armazena os resultados dos quizzes realizados pelos usuários';
COMMENT ON COLUMN public.quiz_ranking.user_id IS 'ID do usuário que respondeu o quiz (gerado automaticamente no cliente)';
COMMENT ON COLUMN public.quiz_ranking.user_name IS 'Nome fornecido pelo usuário ao realizar o quiz';
COMMENT ON COLUMN public.quiz_ranking.semana_id IS 'ID da semana/lição relacionada ao quiz';
COMMENT ON COLUMN public.quiz_ranking.pontuacao IS 'Pontuação obtida pelo usuário (0-100%)';
COMMENT ON COLUMN public.quiz_ranking.acertos IS 'Número de questões que o usuário acertou';
COMMENT ON COLUMN public.quiz_ranking.total_perguntas IS 'Número total de perguntas no quiz';
COMMENT ON COLUMN public.quiz_ranking.data_realizacao IS 'Data e hora em que o quiz foi respondido'; 