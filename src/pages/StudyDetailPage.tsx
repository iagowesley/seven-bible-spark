import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import QuizComponent from "@/components/study/QuizComponent";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BookOpen, CheckCircle, MessageSquare, Download, ArrowLeft, Calendar, X, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserProgress, saveComment, getCommentsByLessonId, Comment } from "@/models/userProgress";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

const getFormattedDate = (dayOfWeek: string) => {
  const fixedDates: {[key: string]: Date} = {
    "sabado": new Date(2024, 3, 19),  
    "domingo": new Date(2024, 3, 20), 
    "segunda": new Date(2024, 3, 21), 
    "terca": new Date(2024, 3, 22),   
    "quarta": new Date(2024, 3, 23),  
    "quinta": new Date(2024, 3, 24), 
    "sexta": new Date(2024, 3, 25)  
  };
  
  if (!fixedDates.hasOwnProperty(dayOfWeek)) {
    return "";
  }
  
  const dayNames: {[key: string]: string} = {
    "sabado": "sábado",
    "domingo": "domingo",
    "segunda": "segunda-feira",
    "terca": "terça-feira",
    "quarta": "quarta-feira",
    "quinta": "quinta-feira",
    "sexta": "sexta-feira"
  };
  
  const date = fixedDates[dayOfWeek];
  const day = date.getDate();
  const month = date.toLocaleDateString('pt-BR', { month: 'long' });
  
  return `${day} de ${month} - ${dayNames[dayOfWeek]}`;
};

const lessonData = {
  id: "2",
  title: "Um lugar para Mim",
  description: "",
  content: ``,
  progress: 65,
  duration: "15 min",
  points: 80,
  comments: [
    {
      author: "Maria Silva",
      text: "Este estudo me ajudou a entender melhor a relação entre fé e obras. Obrigada!",
      date: "2 dias atrás",
    },
    {
      author: "João Oliveira",
      text: "Gostaria de sugerir adicionar mais exemplos práticos de como viver essa fé ativa no dia a dia.",
      date: "5 dias atrás",
    },
  ],
  questions: [
    {
      id: "domingo_q1",
      text: "Na experiência do autor, o que fez com que ele e sua esposa percebessem que o apartamento alugado não era um verdadeiro lar?",
      options: [
        { id: "a", text: "A falta de espaço" },
        { id: "b", text: "Os problemas com o sistema de ar-condicionado compartilhado" },
        { id: "c", text: "O preço do aluguel era muito alto" },
        { id: "d", text: "A distância do trabalho" },
      ],
      correctOptionId: "b",
    },
    {
      id: "domingo_q2",
      text: "O que o autor e sua esposa sentiam em sua nova casa própria, mesmo sem móveis ou cortinas?",
      options: [
        { id: "a", text: "Preocupação com os gastos futuros" },
        { id: "b", text: "Arrependimento pela mudança" },
        { id: "c", text: "Alegria, pois estavam finalmente em casa" },
        { id: "d", text: "Ansiedade por decorar o espaço" },
      ],
      correctOptionId: "c",
    },
    {
      id: "domingo_q3",
      text: "Depois de libertar os israelitas do Egito, qual foi uma das primeiras providências que Deus tomou?",
      options: [
        { id: "a", text: "Ensinar-lhes a agricultura" },
        { id: "b", text: "Construir uma casa para Si mesmo (o santuário)" },
        { id: "c", text: "Estabelecer um sistema político" },
        { id: "d", text: "Criar um exército" },
      ],
      correctOptionId: "b",
    },
    {
      id: "domingo_q4",
      text: "Por quanto tempo os israelitas estiveram escravizados no Egito antes da libertação?",
      options: [
        { id: "a", text: "40 anos" },
        { id: "b", text: "100 anos" },
        { id: "c", text: "400 anos" },
        { id: "d", text: "1000 anos" },
      ],
      correctOptionId: "c",
    },
    {
      id: "domingo_q5",
      text: "Qual o paralelo que a lição estabelece entre a experiência do autor e a de Deus com os israelitas?",
      options: [
        { id: "a", text: "Ambos precisaram economizar recursos" },
        { id: "b", text: "Ambos tiveram que viajar longas distâncias" },
        { id: "c", text: "Ambos buscavam um lugar para chamar de lar" },
        { id: "d", text: "Ambos enfrentaram oposição de vizinhos" },
      ],
      correctOptionId: "c",
    },
    {
      id: "domingo_q6",
      text: "Qual capítulo de Patriarcas e Profetas é recomendado para aprofundamento sobre o tema do santuário?",
      options: [
        { id: "a", text: "Capítulo 12: 'Abraão em Canaã'" },
        { id: "b", text: "Capítulo 30: 'O tabernáculo e seus serviços'" },
        { id: "c", text: "Capítulo 22: 'Moisés'" },
        { id: "d", text: "Capítulo 35: 'A rebelião de Coré'" },
      ],
      correctOptionId: "b",
    },
    {
      id: "domingo_q7",
      text: "Qual necessidade humana a lição destaca tanto para as pessoas quanto para Deus?",
      options: [
        { id: "a", text: "Necessidade de acumulação de riquezas" },
        { id: "b", text: "Necessidade de conexão e pertencimento" },
        { id: "c", text: "Necessidade de poder e controle" },
        { id: "d", text: "Necessidade de conhecimento" },
      ],
      correctOptionId: "b",
    },
    {
      id: "domingo_q8",
      text: "O que o santuário simbolizava além de uma estrutura física?",
      options: [
        { id: "a", text: "O poder militar de Israel" },
        { id: "b", text: "O desejo divino de estabelecer Sua presença permanente entre Seu povo" },
        { id: "c", text: "A superioridade de Israel sobre outras nações" },
        { id: "d", text: "A riqueza e prosperidade do povo" },
      ],
      correctOptionId: "b",
    },
    {
      id: "segunda_q1",
      text: "Após libertar os israelitas, qual foi um dos primeiros atos de Deus para reconstruir a vida espiritual deles?",
      options: [
        { id: "a", text: "Estabelecer um sistema tributário" },
        { id: "b", text: "Entregar os Dez Mandamentos a Moisés" },
        { id: "c", text: "Nomear Arão como sacerdote" },
        { id: "d", text: "Dividir a terra entre as tribos" },
      ],
      correctOptionId: "b",
    },
    {
      id: "segunda_q2",
      text: "O que Deus pediu que fosse trazido para a construção do santuário?",
      options: [
        { id: "a", text: "Apenas ouro e prata" },
        { id: "b", text: "Apenas materiais importados" },
        { id: "c", text: "Ofertas voluntárias de todo coração" },
        { id: "d", text: "Uma quantia específica de cada família" },
      ],
      correctOptionId: "c",
    },
    {
      id: "segunda_q3",
      text: "Qual era o propósito do santuário, segundo Êxodo 25:8?",
      options: [
        { id: "a", text: "Para que os sacerdotes tivessem um lugar para trabalhar" },
        { id: "b", text: "Para que Deus pudesse habitar no meio do povo" },
        { id: "c", text: "Para impressionar as nações vizinhas" },
        { id: "d", text: "Para guardar a arca da aliança apenas" },
      ],
      correctOptionId: "b",
    },
    {
      id: "segunda_q4",
      text: "Segundo o texto, o que é surpreendente na decisão de Deus de viver entre os israelitas?",
      options: [
        { id: "a", text: "Que Ele escolheu habitar com pessoas espiritualmente infiéis" },
        { id: "b", text: "Que Ele preferiu Israel em vez de outras nações" },
        { id: "c", text: "Que Ele não exigiu um templo mais grandioso" },
        { id: "d", text: "Que Ele aceitou materiais de baixo valor" },
      ],
      correctOptionId: "a",
    },
    {
      id: "segunda_q5",
      text: "O que o posicionamento do santuário no centro do acampamento israelita simbolizava?",
      options: [
        { id: "a", text: "A proteção contra inimigos" },
        { id: "b", text: "A acessibilidade para todas as tribos" },
        { id: "c", text: "Que adorar a Deus deve ser o centro da vida" },
        { id: "d", text: "A autoridade de Moisés e Arão" },
      ],
      correctOptionId: "c",
    },
    {
      id: "segunda_q6",
      text: "Que elemento especial Êxodo 40:34 menciona sobre a presença de Deus no santuário?",
      options: [
        { id: "a", text: "Anjos visíveis" },
        { id: "b", text: "A presença visível do Deus invisível" },
        { id: "c", text: "Altares de ouro" },
        { id: "d", text: "Vozes celestiais" },
      ],
      correctOptionId: "b",
    },
    {
      id: "segunda_q7",
      text: "Além de querer habitar entre os israelitas, o que mais Deus fez que demonstra Seu amor?",
      options: [
        { id: "a", text: "Deu-lhes todas as riquezas do Egito" },
        { id: "b", text: "Convidou seres humanos pecadores para ajudarem na construção do santuário" },
        { id: "c", text: "Revelou todos os segredos do universo" },
        { id: "d", text: "Eliminou todos os seus inimigos" },
      ],
      correctOptionId: "b",
    },
    {
      id: "segunda_q8",
      text: "O que a casa de Deus (santuário) proporcionaria ao povo, segundo o texto?",
      options: [
        { id: "a", text: "Apenas proteção física contra inimigos" },
        { id: "b", text: "Um lugar para reconciliação, perdão e experimentar vida plena" },
        { id: "c", text: "Um local para comércio de sacrifícios" },
        { id: "d", text: "Um portal para outras dimensões" },
      ],
      correctOptionId: "b",
    },
    {
      id: "terca_q1",
      text: "De acordo com Hebreus 8:2, o que era o santuário terrestre?",
      options: [
        { id: "a", text: "Uma invenção humana" },
        { id: "b", text: "Uma cópia do santuário celestial" },
        { id: "c", text: "O local definitivo de adoração" },
        { id: "d", text: "Apenas um local de reuniões" },
      ],
      correctOptionId: "b",
    },
    {
      id: "terca_q2",
      text: "Qual era a função do altar de holocaustos no pátio externo do santuário?",
      options: [
        { id: "a", text: "Local para cozinhar alimentos" },
        { id: "b", text: "Local para sacrifícios pelo pecado" },
        { id: "c", text: "Local de reunião dos sacerdotes" },
        { id: "d", text: "Local para guardar as ofertas" },
      ],
      correctOptionId: "b",
    },
    {
      id: "terca_q3",
      text: "O que simbolizava a bacia de bronze no santuário?",
      options: [
        { id: "a", text: "A riqueza de Israel" },
        { id: "b", text: "O cuidado com saúde física" },
        { id: "c", text: "A purificação necessária para se aproximar de Deus (o batismo)" },
        { id: "d", text: "A abundância de água no deserto" },
      ],
      correctOptionId: "c",
    },
    {
      id: "terca_q4",
      text: "O que representava a mesa dos pães da proposição no Lugar Santo?",
      options: [
        { id: "a", text: "As refeições comunais do povo" },
        { id: "b", text: "A Palavra de Deus, pela qual devemos viver" },
        { id: "c", text: "A abundância de alimentos" },
        { id: "d", text: "Os doze tribos de Israel" },
      ],
      correctOptionId: "b",
    },
    {
      id: "terca_q5",
      text: "O que simbolizava o candelabro de ouro com seus sete castiçais?",
      options: [
        { id: "a", text: "A luz da verdade compartilhada pelo poder do Espírito Santo" },
        { id: "b", text: "Os sete dias da criação" },
        { id: "c", text: "A necessidade de iluminação física" },
        { id: "d", text: "As sete nações a serem conquistadas" },
      ],
      correctOptionId: "a",
    },
    {
      id: "terca_q6",
      text: "O que o altar de incenso representava no santuário?",
      options: [
        { id: "a", text: "A fragrância agradável das ofertas" },
        { id: "b", text: "A intercessão de Cristo que se mistura com as orações do povo" },
        { id: "c", text: "A purificação do ar no santuário" },
        { id: "d", text: "A riqueza e luxo do tabernáculo" },
      ],
      correctOptionId: "b",
    },
    {
      id: "terca_q7",
      text: "O que estava contido na arca da aliança no Lugar Santíssimo?",
      options: [
        { id: "a", text: "Os livros de Moisés" },
        { id: "b", text: "As tábuas de pedra com os Dez Mandamentos" },
        { id: "c", text: "O cajado de Arão" },
        { id: "d", text: "Um pote de maná" },
      ],
      correctOptionId: "b",
    },
    {
      id: "terca_q8",
      text: "Qual era a relação entre o propiciatório e as tábuas da lei na arca da aliança?",
      options: [
        { id: "a", text: "Não havia relação entre eles" },
        { id: "b", text: "O propiciatório escondia as tábuas dos olhos do povo" },
        { id: "c", text: "Representavam a harmonia entre justiça (a lei) e misericórdia divinas" },
        { id: "d", text: "Eram de materiais diferentes para mostrar seu contraste" },
      ],
      correctOptionId: "c",
    },
    {
      id: "quarta_q1",
      text: "Segundo a lição de quarta-feira, o que o texto nos convida a imaginar?",
      options: [
        { id: "a", text: "Jesus caminhando em Jerusalém" },
        { id: "b", text: "A construção do tabernáculo" },
        { id: "c", text: "Jesus comunicando que passará um tempo em nossa casa" },
        { id: "d", text: "A criação do mundo" },
      ],
      correctOptionId: "c",
    },
    {
      id: "quarta_q2",
      text: "Qual afirmação importante o texto faz sobre a habitação de Deus?",
      options: [
        { id: "a", text: "Deus só pode habitar em templos" },
        { id: "b", text: "Deus sempre quis habitar conosco e pode habitar em nós" },
        { id: "c", text: "Deus habita apenas no céu" },
        { id: "d", text: "Deus não habita mais entre os humanos" },
      ],
      correctOptionId: "b",
    },
    {
      id: "quarta_q3",
      text: "Qual versículo em Êxodo 25 é citado como fundamental para entender o propósito do santuário?",
      options: [
        { id: "a", text: "Êxodo 25:1" },
        { id: "b", text: "Êxodo 25:22" },
        { id: "c", text: "Êxodo 25:40" },
        { id: "d", text: "Êxodo 25:30" },
      ],
      correctOptionId: "b",
    },
    {
      id: "quarta_q4",
      text: "Qual texto de Hebreus é mencionado em relação ao santuário celestial?",
      options: [
        { id: "a", text: "Hebreus 4:16" },
        { id: "b", text: "Hebreus 8:1-2" },
        { id: "c", text: "Hebreus 1:1-3" },
        { id: "d", text: "Hebreus 13:8" },
      ],
      correctOptionId: "b",
    },
    {
      id: "quarta_q5",
      text: "Qual texto de João é citado em relação a Jesus sendo revelado no santuário?",
      options: [
        { id: "a", text: "João 3:16" },
        { id: "b", text: "João 1:29" },
        { id: "c", text: "João 14:6" },
        { id: "d", text: "João 10:10" },
      ],
      correctOptionId: "b",
    },
    {
      id: "quarta_q6",
      text: "Qual pergunta reflexiva a lição faz sobre nossa relação com Deus?",
      options: [
        { id: "a", text: "Quanto tempo dedicamos à oração?" },
        { id: "b", text: "Quantas vezes frequentamos a igreja?" },
        { id: "c", text: "Que tipo de casa temos sido para Deus?" },
        { id: "d", text: "Quanto conhecemos sobre o santuário?" },
      ],
      correctOptionId: "c",
    },
    {
      id: "quarta_q7",
      text: "Em que categorias os textos bíblicos sobre o santuário são agrupados na lição?",
      options: [
        { id: "a", text: "Antigo e Novo Testamento" },
        { id: "b", text: "As bênçãos do santuário, Jesus revelado no santuário e o santuário celestial" },
        { id: "c", text: "Profetas maiores e menores" },
        { id: "d", text: "Históricos e proféticos" },
      ],
      correctOptionId: "b",
    },
    {
      id: "quarta_q8",
      text: "Qual é a abordagem metodológica utilizada nesta lição para estudar o santuário?",
      options: [
        { id: "a", text: "Análise cronológica" },
        { id: "b", text: "Estudo de caso" },
        { id: "c", text: "Abordagem de 'hipertexto', conectando diversos textos bíblicos" },
        { id: "d", text: "Comparação com outras religiões" },
      ],
      correctOptionId: "c",
    },
    {
      id: "quinta_q1",
      text: "Segundo a lição de quinta-feira, qual outro significado pode ter a palavra 'santuário'?",
      options: [
        { id: "a", text: "Hospital" },
        { id: "b", text: "Escola" },
        { id: "c", text: "Lugar de refúgio" },
        { id: "d", text: "Centro de lazer" },
      ],
      correctOptionId: "c",
    },
    {
      id: "quinta_q2",
      text: "Qual exemplo de santuário pessoal é dado pelo autor?",
      options: [
        { id: "a", text: "Um quarto de oração" },
        { id: "b", text: "Uma igreja" },
        { id: "c", text: "A casa de seus pais" },
        { id: "d", text: "Um retiro espiritual" },
      ],
      correctOptionId: "c",
    },
    {
      id: "quinta_q3",
      text: "Além de um lugar de refúgio, o que mais o santuário de Deus era?",
      options: [
        { id: "a", text: "Um lugar dedicado à adoração e comunhão íntima" },
        { id: "b", text: "Um centro político e administrativo" },
        { id: "c", text: "Um museu de artefatos sagrados" },
        { id: "d", text: "Um local para comércio" },
      ],
      correctOptionId: "a",
    },
    {
      id: "quinta_q4",
      text: "Segundo o texto, que efeito a oração pode ter sobre pessoas com depressão e ansiedade?",
      options: [
        { id: "a", text: "Nenhum efeito significativo" },
        { id: "b", text: "Pode piorar os sintomas" },
        { id: "c", text: "Pode melhorar significativamente os sintomas" },
        { id: "d", text: "Só funciona com acompanhamento médico" },
      ],
      correctOptionId: "c",
    },
    {
      id: "quinta_q5",
      text: "O que a lição indica sobre pessoas que frequentam regularmente reuniões religiosas?",
      options: [
        { id: "a", text: "Têm mais problemas financeiros" },
        { id: "b", text: "Têm menores taxas de mortalidade e níveis menores de depressão" },
        { id: "c", text: "Não apresentam diferenças em relação aos não frequentadores" },
        { id: "d", text: "Têm mais problemas de relacionamento" },
      ],
      correctOptionId: "b",
    },
    {
      id: "quinta_q6",
      text: "Que resposta fisiológica a adoração pode diminuir, segundo os especialistas citados?",
      options: [
        { id: "a", text: "Resposta imunológica" },
        { id: "b", text: "Resposta digestiva" },
        { id: "c", text: "Resposta de luta ou fuga" },
        { id: "d", text: "Resposta hormonal de crescimento" },
      ],
      correctOptionId: "c",
    },
    {
      id: "quinta_q7",
      text: "Para que fomos projetados, segundo a lição?",
      options: [
        { id: "a", text: "Para o trabalho" },
        { id: "b", text: "Para a adoração" },
        { id: "c", text: "Para o estudo" },
        { id: "d", text: "Para o lazer" },
      ],
      correctOptionId: "b",
    },
    {
      id: "quinta_q8",
      text: "O que a lição sugere que façamos para criar nosso próprio santuário?",
      options: [
        { id: "a", text: "Construir um espaço físico dedicado" },
        { id: "b", text: "Estabelecer diariamente um tempo para se encontrar com Deus" },
        { id: "c", text: "Frequentar apenas igrejas bonitas" },
        { id: "d", text: "Comprar objetos religiosos" },
      ],
      correctOptionId: "b",
    },
    {
      id: "sexta_q1",
      text: "Segundo a citação de Ellen White, quantos compartimentos tinha o santuário terrestre?",
      options: [
        { id: "a", text: "Um" },
        { id: "b", text: "Dois" },
        { id: "c", text: "Três" },
        { id: "d", text: "Quatro" },
      ],
      correctOptionId: "b",
    },
    {
      id: "sexta_q2",
      text: "De acordo com o texto citado, qual a relação entre o santuário terrestre e o celestial?",
      options: [
        { id: "a", text: "Não há relação entre eles" },
        { id: "b", text: "O terrestre era uma figura (representação) do celestial" },
        { id: "c", text: "O celestial é menor que o terrestre" },
        { id: "d", text: "O celestial foi construído depois do terrestre" },
      ],
      correctOptionId: "b",
    },
    {
      id: "sexta_q3",
      text: "Com que frequência o sacerdote entrava no Lugar Santíssimo do santuário terrestre?",
      options: [
        { id: "a", text: "Diariamente" },
        { id: "b", text: "Semanalmente" },
        { id: "c", text: "Mensalmente" },
        { id: "d", text: "Uma vez ao ano" },
      ],
      correctOptionId: "d",
    },
    {
      id: "sexta_q4",
      text: "O que Jesus ofereceu ao entrar no santuário celestial, segundo Ellen White?",
      options: [
        { id: "a", text: "Ouro e prata" },
        { id: "b", text: "Seu próprio sangue" },
        { id: "c", text: "As orações dos santos" },
        { id: "d", text: "Incenso aromático" },
      ],
      correctOptionId: "b",
    },
    {
      id: "sexta_q5",
      text: "O que aconteceu com o véu do templo quando Jesus morreu?",
      options: [
        { id: "a", text: "Foi retirado pelos sacerdotes" },
        { id: "b", text: "Foi roubado pelos romanos" },
        { id: "c", text: "Se partiu de alto a baixo" },
        { id: "d", text: "Foi preservado como relíquia" },
      ],
      correctOptionId: "c",
    },
    {
      id: "sexta_q6",
      text: "Segundo Ellen White, quando Jesus entrou no Lugar Santíssimo do santuário celestial?",
      options: [
        { id: "a", text: "No dia de Sua ascensão" },
        { id: "b", text: "No fim dos 2.300 dias de Daniel 8, em 1844" },
        { id: "c", text: "No Pentecostes" },
        { id: "d", text: "No momento da crucificação" },
      ],
      correctOptionId: "b",
    },
    {
      id: "sexta_q7",
      text: "Para que Jesus entrou no Lugar Santíssimo celestial, segundo o texto?",
      options: [
        { id: "a", text: "Para descansar de Seu ministério" },
        { id: "b", text: "Para fazer uma expiação final e purificar o santuário" },
        { id: "c", text: "Para preparar novos mundos" },
        { id: "d", text: "Para recriar o universo" },
      ],
      correctOptionId: "b",
    },
    {
      id: "sexta_q8",
      text: "Qual é uma das perguntas para discussão em classe sugeridas ao final da lição?",
      options: [
        { id: "a", text: "Quando Jesus retornará à Terra?" },
        { id: "b", text: "Qual objeto do santuário mais fala ao seu coração e por quê?" },
        { id: "c", text: "Quanto tempo durará o milênio?" },
        { id: "d", text: "Qual a data exata da criação do mundo?" },
      ],
      correctOptionId: "b",
    },
  ],
};

const StudyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("content");
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [quizEnabled, setQuizEnabled] = useState(false);
  const [formattedDate, setFormattedDate] = useState("");
  const [impressions, setImpressions] = useState("");
  const [isBibleTextOpen, setIsBibleTextOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const anonymousUser = { id: 'anonymous-user' };

  const { data: userProgressData, isLoading } = useQuery({
    queryKey: ['lessonProgress', id],
    queryFn: async () => {
      if (!id) return null;
      
      try {
        const allProgress = JSON.parse(localStorage.getItem('local_user_progress') || '[]');
        const lessonProgress = allProgress.find(p => p.lesson_id === id && p.user_id === anonymousUser.id);
        return lessonProgress || null;
      } catch (e) {
        console.error("Erro ao buscar progresso:", e);
        return null;
      }
    },
    enabled: !!id,
  });

  const { data: lessonComments = [], refetch: refetchComments } = useQuery({
    queryKey: ['lessonComments', id],
    queryFn: () => id ? getCommentsByLessonId(id) : Promise.resolve([]),
    enabled: !!id
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ progress, completed, pointsEarned }: { 
      progress: number; 
      completed: boolean;
      pointsEarned: number;
    }) => {
      if (!id) return;
      return updateUserProgress(anonymousUser.id, id, progress, completed, pointsEarned);
    },
    onSuccess: () => {
      console.log("Progress updated successfully");
    },
    onError: (error) => {
      console.error("Error updating progress:", error);
    }
  });

  const saveCommentMutation = useMutation({
    mutationFn: async (comment: Omit<Comment, 'id' | 'created_at'>) => {
      return saveComment(comment);
    },
    onSuccess: () => {
      setNewComment("");
      refetchComments();
      toast({
        title: "Comentário enviado",
        description: "Seu comentário foi adicionado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao salvar comentário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar seu comentário. Por favor, tente novamente.",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (id) {
      setFormattedDate(getFormattedDate(id));
      setDescription(id === "sabado" ? "Um lugar para Mim" : "");
    }
    
    if (userProgressData) {
      setProgress(userProgressData.progress);
      setIsCompleted(userProgressData.completed);
      setQuizEnabled(id !== "sabado" && userProgressData.progress >= 50);
    }
  }, [id, userProgressData]);
  
  useEffect(() => {
    if (!id) return;
    
    const contentElement = document.getElementById('lesson-content');
    if (!contentElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = contentElement;
      const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
      
      const newProgress = Math.max(
        Math.min(Math.round(scrolled), 100),
        isCompleted ? 100 : (progress < 50 ? 0 : progress)
      );
      
      if (newProgress > progress && !isCompleted) {
        setProgress(newProgress);
        
        if (newProgress >= 50) {
          setQuizEnabled(true);
        }
        
        updateProgressMutation.mutate({ 
          progress: newProgress, 
          completed: false,
          pointsEarned: 0
        });
      }
    };
    
    contentElement.addEventListener('scroll', handleScroll);
    return () => contentElement.removeEventListener('scroll', handleScroll);
  }, [id, progress, isCompleted, updateProgressMutation]);

  const enhancedQuestions = id === "domingo" 
    ? lessonData.questions.filter(q => q.id.startsWith("domingo_"))
    : id === "segunda"
    ? lessonData.questions.filter(q => q.id.startsWith("segunda_"))
    : id === "terca"
    ? lessonData.questions.filter(q => q.id.startsWith("terca_"))
    : id === "quarta"
    ? lessonData.questions.filter(q => q.id.startsWith("quarta_"))
    : id === "quinta"
    ? lessonData.questions.filter(q => q.id.startsWith("quinta_"))
    : id === "sexta"
    ? lessonData.questions.filter(q => q.id.startsWith("sexta_"))
    : [];

  const handleQuizComplete = (score: number) => {
    const totalQuestions = 8;
    const percentage = Math.round((score / totalQuestions) * 100);
    const completed = percentage >= 70;
    setIsCompleted(completed);
    setProgress(100);
    
    if (id) {
      updateProgressMutation.mutate({
        progress: 100,
        completed,
        pointsEarned: lessonData.points
      });
    }
    
    toast({
      title: completed ? "Lição concluída!" : "Quiz finalizado",
      description: completed 
        ? "Parabéns! Você completou esta lição com sucesso." 
        : `Você acertou ${score} de ${totalQuestions} questões.`,
    });
  };

  const enableQuiz = () => {
    setQuizEnabled(true);
    setActiveTab("quiz");
  };

  const handleSubmitComment = () => {
    if (!id || !newComment.trim()) return;
    
    saveCommentMutation.mutate({
      user_id: anonymousUser.id,
      lesson_id: id,
      author: 'Visitante',
      text: newComment.trim()
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="seven-container">
          <div className="mb-6">
            <Link to="/estudos" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar para Estudos
            </Link>
            
            <div className="bg-card rounded-lg border border-border p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-accent">
                    <Calendar className="h-5 w-5" />
                    <span className="font-medium capitalize">{formattedDate}</span>
                  </div>
                  <h1 className="text-3xl font-bold mb-3 font-serif">{
                    id === "domingo" ? "Encontrando um lar" : 
                    id === "segunda" ? "Quero morar com vocês" :
                    id === "terca" ? "Adoração em tipos e símbolos" :
                    id === "quarta" ? "Momento hipertexto" :
                    id === "quinta" ? "Cura na adoração" :
                    id === "sexta" ? "No santuário celestial" :
                    lessonData.title
                  }</h1>
                  <p className="text-muted-foreground mb-4 font-sans">{description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>Lição jovem</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  {/* Botão Salvar offline removido */}
                </div>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={`grid ${id === "sabado" ? "grid-cols-2" : "grid-cols-3"} mb-6`}>
              <TabsTrigger value="content" className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" /> Conteúdo
              </TabsTrigger>
              {id !== "sabado" && (
              <TabsTrigger 
                value="quiz" 
                disabled={!quizEnabled} 
                className="flex items-center gap-1"
              >
                <CheckCircle className="h-4 w-4" /> Quiz
              </TabsTrigger>
              )}
              <TabsTrigger value="comments" className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" /> Discussão
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="content">
              <div 
                id="lesson-content" 
                className="bg-card p-6 rounded-lg shadow-sm border border-border overflow-y-auto max-h-[600px] font-sans"
              >
                {id === "sabado" && (
                  <div className="mb-6">
                    <div className="rounded-lg overflow-hidden mb-6">
                      <img 
                        src="/tirinhas/02.png" 
                        alt="Tirinha Bíblica da Semana" 
                        className="w-full object-cover sm:object-contain max-w-full h-auto sm:min-h-[500px] transform scale-130"
                        style={{ transformOrigin: 'center' }}
                      />
                    </div>

                    
                    <div className="mb-6">
                      <p className="mb-4 font-sans">A partir da tirinha, do texto-chave e do título, anote suas primeiras impressões sobre o que trata a lição:</p>
                      <textarea 
                        className="w-full p-3 border-0 border-b-2 border-[#a37fb9]/30 bg-background/50 focus:outline-none focus:border-[#a37fb9] transition-colors duration-300 rounded-none resize-none"
                        rows={4}
                        placeholder="Digite suas impressões aqui..."
                        value={impressions}
                        onChange={(e) => setImpressions(e.target.value)}
                      ></textarea>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-2 font-serif">Leia o texto bíblico desta semana:</h3>
                      <Button 
                        variant="outline" 
                        className="p-4 bg-muted rounded-lg w-full text-left flex justify-between items-center"
                        onClick={() => setIsBibleTextOpen(true)}
                      >
                        <span>Êx 25</span>
                        <span className="text-sm text-muted-foreground">Clique para ler</span>
                      </Button>
                      
                      <Dialog open={isBibleTextOpen} onOpenChange={setIsBibleTextOpen}>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Êxodo 25</DialogTitle>
                            <DialogDescription>Versão Almeida Revista e Atualizada</DialogDescription>
                          </DialogHeader>
                          <div className="mt-4 text-lg space-y-4">
                            <p><strong>1</strong> Disse o SENHOR a Moisés:</p>
                            <p><strong>2</strong> Dize aos filhos de Israel que me tragam oferta; de todo homem cujo coração o mover para isso, dele recebereis a minha oferta.</p>
                            <p><strong>3</strong> Esta é a oferta que recebereis deles: ouro, prata, bronze,</p>
                            <p><strong>4</strong> azul-celeste, púrpura, carmesim, linho fino, pêlos de cabras,</p>
                            <p><strong>5</strong> peles de carneiros tingidas de vermelho, peles finas, madeira de acácia,</p>
                            <p><strong>6</strong> azeite para a luz, especiarias para o óleo da unção e para o incenso aromático,</p>
                            <p><strong>7</strong> pedras de ônix e pedras de engaste para o éfode e para o peitoral.</p>
                            <p><strong>8</strong> E me farão um santuário, para que eu possa habitar no meio deles.</p>
                            <p><strong>9</strong> Segundo tudo o que eu te mostrar para modelo do tabernáculo e para modelo de todos os seus móveis, assim mesmo o fareis.</p>
                            <p><strong>10</strong> Também farão uma arca de madeira de acácia; o seu comprimento será de dois côvados e meio, e a sua largura, de um côvado e meio, e de um côvado e meio, a sua altura.</p>
                            <p><strong>11</strong> Com ouro puro a cobrirás, por dentro e por fora a cobrirás; e farás sobre ela uma moldura de ouro ao redor.</p>
                            <p><strong>12</strong> Fundirás para ela quatro argolas de ouro e as porás nos seus quatro cantos; duas argolas num lado dela e duas argolas no outro lado.</p>
                            <p><strong>13</strong> Farás também varais de madeira de acácia e os cobrirás com ouro.</p>
                            <p><strong>14</strong> Meterás os varais nas argolas, nos lados da arca, para se levar por eles a arca.</p>
                            <p><strong>15</strong> Os varais estarão nas argolas da arca, não se tirarão dela.</p>
                            <p><strong>16</strong> E porás na arca o Testemunho, que eu te darei.</p>
                            <p><strong>17</strong> Também farás um propiciatório de ouro puro; o seu comprimento será de dois côvados e meio, e a sua largura, de um côvado e meio.</p>
                            <p><strong>18</strong> Farás também dois querubins de ouro; de ouro batido os farás, nas duas extremidades do propiciatório.</p>
                            <p><strong>19</strong> Farás um querubim na extremidade de uma parte e o outro querubim na extremidade da outra parte; de uma só peça com o propiciatório, fareis os querubins nas duas extremidades dele.</p>
                            <p><strong>20</strong> Os querubins estenderão as asas por cima, cobrindo com elas o propiciatório; as faces deles, uma defronte da outra; as faces dos querubins estarão voltadas para o propiciatório.</p>
                            <p><strong>21</strong> Porás o propiciatório em cima da arca, depois de haver posto na arca o Testemunho que eu te darei.</p>
                            <p><strong>22</strong> Ali, virei a ti e, de cima do propiciatório, do meio dos dois querubins que estão sobre a arca do Testemunho, falarei contigo acerca de tudo o que eu te ordenar para os filhos de Israel.</p>
                            <p><strong>23</strong> Também farás uma mesa de madeira de acácia; o seu comprimento será de dois côvados, a sua largura, de um côvado, e a sua altura, de um côvado e meio.</p>
                            <p><strong>24</strong> Com ouro puro a cobrirás e lhe farás uma moldura de ouro ao redor.</p>
                            <p><strong>25</strong> Far-lhe-ás também ao redor uma guarnição da largura de quatro dedos; também farás uma moldura de ouro ao redor da guarnição.</p>
                            <p><strong>26</strong> Também lhe farás quatro argolas de ouro e as porás nos quatro cantos, que estão nos seus quatro pés.</p>
                            <p><strong>27</strong> As argolas estarão juntas à guarnição, como lugares para os varais que hão de sustentar a mesa.</p>
                            <p><strong>28</strong> Farás os varais de madeira de acácia e os cobrirás com ouro; e será, por eles, conduzida a mesa.</p>
                            <p><strong>29</strong> Também farás os seus pratos, e as suas colheres, e os seus copos, e as suas bacias com que se hão de oferecer libações; de ouro puro os farás.</p>
                            <p><strong>30</strong> E sobre a mesa porás o pão da Presença perante mim perpetuamente.</p>
                            <p><strong>31</strong> Também farás um candelabro de ouro puro; de ouro batido se fará este candelabro; o seu pedestal, a sua haste, os seus cálices, as suas maçanetas e as suas flores formarão com ele uma só peça.</p>
                            <p><strong>32</strong> Seis hastes sairão dos seus lados; três hastes do candelabro, de um lado, e três hastes do candelabro, do outro lado.</p>
                            <p><strong>33</strong> Três cálices a modo de flor de amêndoa, uma maçaneta e uma flor numa haste; e três cálices a modo de flor de amêndoa na outra haste, com maçaneta e uma flor; assim serão as seis hastes que saem do candelabro.</p>
                            <p><strong>34</strong> No candelabro mesmo, haverá quatro cálices a modo de flor de amêndoa, com as suas maçanetas e com as suas flores.</p>
                            <p><strong>35</strong> Haverá uma maçaneta embaixo de duas hastes saídas dele; outra maçaneta, embaixo de duas hastes, saídas dele; mais uma maçaneta, embaixo de duas hastes, saídas dele; assim se fará com as seis hastes que saem do candelabro.</p>
                            <p><strong>36</strong> As suas maçanetas e as suas hastes serão do mesmo; tudo será de ouro puro batido.</p>
                            <p><strong>37</strong> Também lhe farás sete lâmpadas e as acenderás para que iluminem defronte dele.</p>
                            <p><strong>38</strong> Os seus espevitadores e os seus apagadores serão de ouro puro.</p>
                            <p><strong>39</strong> De um talento de ouro puro se fará, com todos estes utensílios.</p>
                            <p><strong>40</strong> Atenta, pois, que as faças segundo o seu modelo, que te foi mostrado no monte.</p>
                          </div>
                          <DialogClose asChild>
                            <Button variant="outline" className="mt-4">Fechar</Button>
                          </DialogClose>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-2 font-serif">Pesquise em comentários bíblicos, livros denominacionais e de Ellen G. White sobre temas contidos neste texto:</h3>
                      <p className="p-4 bg-muted rounded-lg font-sans">Êxodo 25</p>
                    </div>
                    
                    <div className="bg-accent/15 p-6 rounded-lg mt-6 border-l-4 border-accent">
                      <h3 className="text-xl font-bold mb-2 font-serif">Nosso resumo</h3>
                      <p>A tirinha bíblica desta semana ilustra o desejo de Deus de habitar entre Seu povo através do santuário. Êxodo 25 revela a instrução divina a Moisés para construir um lugar santo onde Deus pudesse morar no meio dos israelitas. O texto destaca que a construção deste santuário deveria ser financiada por ofertas voluntárias do povo, demonstrando que a adoração genuína envolve generosidade e sacrifício pessoal. O versículo 8 contém a promessa central: "E me farão um santuário, para que eu possa habitar no meio deles." O capítulo descreve em detalhes os mobiliários do santuário, incluindo a arca da aliança, o propiciatório, a mesa dos pães da presença e o candelabro, cada um com significado simbólico. O título "Um lugar para Mim" enfatiza o desejo divino de proximidade e comunhão com Seu povo. Esta passagem nos convida a refletir sobre como podemos preparar um lugar para Deus em nossa vida, não apenas em templos físicos, mas em nosso coração, permitindo que Ele habite em nossa vida cotidiana.</p>
                    </div>
                  </div>
                )}
                {id === "domingo" && (
                  <div className="mb-6">
                    <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-p:font-sans">
                      <h2 className="text-2xl font-bold mb-4 font-serif">Encontrando um lar</h2>
                      
                      <p>Quando minha esposa e eu nos casamos, compramos alguns jornais e começamos a procurar o lugar mais barato que pudéssemos encontrar para alugar. Planejamos economizar ao máximo para comprar uma casa o quanto antes. Nosso plano estava avançando com sucesso quando encontramos um apartamento com um quarto totalmente mobiliado por um preço bastante acessível. Assinamos o contrato de aluguel e nos preparamos para a mudança.</p>
                      
                      <p>Não demorou muito para entendermos que "totalmente mobiliado" não significava necessariamente que a mobília fosse boa. Os sofás eram velhos e gastos, a cama afundava e todos os apartamentos do prédio compartilhavam o mesmo sistema de arcondicionado central. Isso pode parecer insignificante, mas era incrivelmente incômodo. Podíamos sentir o cheiro de cigarro e até mesmo de algumas refeições. Logo percebemos que aquele apartamento não era nosso lar.</p>
                      
                      <p>Morar naquele pequeno apartamento imperfeito nos ajudou a economizar mais. Em apenas seis meses, Deus nos ajudou a comprar nossa primeira casa. Um novo empreendimento surgiu, e tivemos a sorte de conseguir uma das pequenas casas iniciais do bairro. Nunca esquecerei o dia em que nos mudamos. Não tínhamos muito, então a mudança foi fácil. Ao contrário do apartamento, nossa nova casa não tinha móveis, nem cortinas para cobrir as janelas, nem comida na geladeira, mas nosso coração saltava de alegria. <span className="bg-yellow-100 p-1 rounded font-medium">Tudo o que tínhamos eram nossas roupas e um colchão, mas estávamos em casa.</span></p>
                      
                      <p><span className="bg-yellow-100 p-1 rounded font-medium">Após 400 anos de escravidão no Egito, Deus ansiava por tornar livres os filhos de Abraão e levá-los para casa. No entanto, uma das primeiras coisas que Ele fez depois de libertar os israelitas foi construir uma habitação. Sim, Deus encomendou uma casa para Si mesmo.</span></p>
                      
                      <div className="bg-muted p-4 rounded-lg mt-6">
                        <h3 className="text-xl font-semibold mb-2">Mergulhe + fundo</h3>
                        <p>Leia, de Ellen G. White, Patriarcas e Profetas, capítulo 30: "O tabernáculo e seus serviços".</p>
                      </div>
                      
                      <div className="bg-accent/15 p-6 rounded-lg mt-6 border-l-4 border-accent">
                        <h3 className="text-xl font-bold mb-2 font-serif">Nosso resumo</h3>
                        <p>A lição de domingo introduz o tema do santuário através de uma experiência pessoal do autor sobre encontrar um verdadeiro lar. Assim como o casal descobriu que um apartamento alugado e mobiliado não era realmente seu lar, e depois experimentou a alegria de ter uma casa própria mesmo sem móveis, Deus também desejava um lugar que pudesse chamar de Seu entre o povo que havia libertado. Após 400 anos de escravidão no Egito, uma das primeiras providências divinas foi estabelecer uma habitação no meio do Seu povo. O paralelo entre a experiência humana de ter um lar e o desejo divino de habitar entre os israelitas ilustra a profunda necessidade de conexão e pertencimento tanto para nós quanto para Deus em Sua relação conosco. Esta lição nos convida a refletir sobre o significado do tabernáculo não apenas como uma estrutura física, mas como o símbolo do desejo divino de estabelecer Sua presença permanente entre Seu povo.</p>
                      </div>
                    </div>
                  </div>
                )}
                {id === "segunda" && (
                  <div className="mb-6">
                    <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-p:font-sans">
                      <h2 className="text-2xl font-bold mb-4 font-serif">Quero morar com vocês</h2>
                      
                      <p>Depois que os israelitas foram libertados da escravidão do Egito, Deus sabia que tinha muito a fazer para reconstruir a vida espiritual de Seu povo. Para começar, Ele convocou Moisés ao Monte Sinai e lhe entregou os Dez Mandamentos, que continham as instruções que deveriam guiar a vida deles (Êx 20). Além disso, deu leis sobre senhores e servos, violência e animais (Êx 21). O Senhor descreveu como lidar com a propriedade (Êx 22), como administrar justiça e como guardar os sábados e dias de festas religiosas (Êx 23) – e apresentou as bênçãos que aguardavam aqueles que fossem fiéis à aliança. Êxodo 24 descreve que Moisés construiu um altar, no qual Israel confirmou solenemente a aliança com Deus.</p>
                      
                      <p><span className="bg-yellow-100 p-1 rounded font-medium">Depois de estabelecer um relacionamento de aliança com Israel, Deus fez algo inesperado: encomendou um projeto de construção no meio daquela jornada pelo deserto (Êx 25). Ele disse a Moisés que os israelitas deveriam trazer ofertas, mas apenas aqueles que fizessem isso de todo o coração (Êx 25:2). Então deu instruções específicas sobre as ofertas que seriam aceitáveis (v. 3-7). Depois disso, declarou: "E farão para Mim um santuário, para que Eu possa habitar no meio deles" (v. 8).</span></p>
                      
                      <p>O primeiro e mais surpreendente elemento dessa instrução de Deus é Sua decisão de viver entre pessoas que eram espiritualmente infiéis. A "grande multidão de estrangeiros" (Êx 12:38, NVI) que saiu do Egito com os israelitas não conhecia Deus nem sabia como viver em relacionamento com Ele. O que Deus anunciou em Êxodo 25:8 e 9 era um tipo diferente de presença. <span className="bg-yellow-100 p-1 rounded font-medium">Ele iria armar Sua tenda no meio das tendas israelitas para que a presença visível do Deus invisível estivesse com eles (Êx 40:34).</span></p>
                      
                      <p>Quando Deus escolheu viver entre os israelitas, Sua presença garantiu que teriam Sua proteção e provisão. O fato de que o santuário estava no centro do acampamento israelita transmitia uma mensagem inconfundível: adorar a Deus é o centro da vida. A casa de Deus seria um lugar para reconciliar relacionamentos com Ele, receber perdão de pecados e experimentar uma vida plena.</p>
                      
                      <p><span className="bg-yellow-100 p-1 rounded font-medium">Ao inaugurar esse projeto de construção sagrada, Deus fez outra coisa incrível: Ele convidou seres humanos pecadores e imperfeitos para ajudá-Lo a construir Seu santuário. Deus queria que os israelitas soubessem que sempre seriam bem-vindos em Sua casa, não importa o que tivessem feito. Que Deus maravilhoso!</span></p>
                      
                      <div className="bg-muted p-4 rounded-lg mt-6">
                        <h3 className="text-xl font-semibold mb-2">Pense</h3>
                        <p>Como você acha que era viver tendo Deus constantemente no meio do acampamento? Desenvolva essa ideia.</p>
                      </div>
                      
                      <div className="bg-accent/15 p-6 rounded-lg mt-6 border-l-4 border-accent">
                        <h3 className="text-xl font-bold mb-2 font-serif">Nosso resumo</h3>
                        <p>A lição de segunda-feira descreve como, após libertar os israelitas do Egito e estabelecer Sua aliança com eles, Deus tomou uma decisão surpreendente: habitar no meio deles através de um santuário. Este pedido inesperado demonstra o profundo desejo de Deus de manter uma presença visível e constante entre Seu povo, mesmo sabendo de suas infidelidades espirituais. O texto destaca três aspectos importantes desse projeto: 1) a solicitação de ofertas voluntárias para a construção, indicando a importância de uma adoração sincera; 2) o posicionamento do santuário no centro do acampamento, simbolizando que Deus deve estar no centro de nossa vida; e 3) o convite para que os próprios israelitas participassem da construção, revelando que Deus quer incluir seres humanos imperfeitos em Seus planos divinos. Esta lição nos ensina que Deus não apenas deseja estar presente em nossa vida, mas quer que participemos ativamente na construção de um relacionamento com Ele, garantindo-nos Sua proteção, provisão e a reconciliação necessária para uma vida plena.</p>
                      </div>
                    </div>
                  </div>
                )}
                {id === "terca" && (
                  <div className="mb-6">
                    <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-p:font-sans">
                      <h2 className="text-2xl font-bold mb-4 font-serif">Adoração em tipos e símbolos</h2>
                      
                      <p><span className="bg-yellow-100 p-1 rounded font-medium">O santuário terrestre que Deus encomendou continha vários itens bastante valiosos, e cada um deles tinha um significado especial. O tabernáculo terrestre deveria ser uma cópia do santuário celestial (Hb 8:2), apontando para Jesus Cristo e Seu ministério de salvar seres humanos perdidos.</span> Cada objeto do santuário ilustra um aspecto diferente de adoração e devoção a Deus.</p>
                      
                      <p>O pátio externo do santuário continha o altar de holocaustos, onde eram realizados os sacrifícios pelo pecado (Êx 27:1-8).</p>
                      
                      <p>Logo depois havia a bacia de bronze, que era usada pelos sacerdotes para lavar as mãos e os pés antes de entrar no tabernáculo (Êx 30:17-21). <span className="bg-yellow-100 p-1 rounded font-medium">Nós também devemos ser batizados pela água e pelo Espírito se desejamos entrar no reino do céu (Jo 3:5).</span></p>
                      
                      <p>Ao entrar no Lugar Santo, a primeira "sala" do santuário, o que se via era a mesa dos pães da proposição (Êx 25:23-30), que representavam a Palavra de Deus, pela qual devemos viver todos os dias (Mt 4:4). O Lugar Santo também continha o candelabro de ouro com seus sete castiçais (Êx 25:31-40), que simbolizava a luz da verdade compartilhada pelo povo de Deus pelo poder do Espírito Santo (Zc 4:2-6). Mais próximo do Lugar Santíssimo, o espaço mais sagrado do tabernáculo, estava o altar de incenso (Êx 30:1-10), representando a intercessão de Cristo que se mistura com as orações do povo de Deus (Ef 5:1; Ap 8:3). <span className="bg-yellow-100 p-1 rounded font-medium">A fumaça do incenso queimado seria levada para o Lugar Santíssimo – a própria presença de Deus.</span></p>
                      
                      <p>Por último, o Lugar Santíssimo abrigava a arca da aliança, que continha a santa lei de Deus – as tábuas de pedra nas quais Ele escreveu os Dez Mandamentos (Êx 34:1). O propiciatório, sobre o qual a presença de Deus se revelava, era uma espécie de trono e cobria essas tábuas. <span className="bg-yellow-100 p-1 rounded font-medium">Aqueles que desenvolvem um relacionamento de amor com Deus observam Seus mandamentos (as tábuas da lei) e recebem Sua misericórdia quando vão até Ele em arrependimento (o propiciatório).</span></p>
                      
                      <p>Observe que cada objeto do santuário representa um aspecto da adoração a Deus: aceitar o sacrifício de Jesus, ser purificado, alimentar-se da Palavra de Deus, compartilhar a luz da verdade, orar e observar os mandamentos. Quando Deus pediu a construção do santuário terrestre, Ele deu um modelo de como os pecadores podem se reconciliar e construir um relacionamento íntimo com Ele.</p>
                      
                      <div className="bg-muted p-4 rounded-lg mt-6">
                        <h3 className="text-xl font-semibold mb-2">Pense</h3>
                        <p>Qual objeto do santuário simboliza algo que você deseja fortalecer em sua vida? Quais são algumas maneiras de começar?</p>
                      </div>
                      
                      <div className="bg-accent/15 p-6 rounded-lg mt-6 border-l-4 border-accent">
                        <h3 className="text-xl font-bold mb-2 font-serif">Nosso resumo</h3>
                        <p>A lição de terça-feira explora o significado simbólico do santuário terrestre e seus objetos, revelando como cada elemento representa um aspecto da adoração e do relacionamento com Deus. O texto destaca que o tabernáculo foi projetado como uma cópia do santuário celestial, apontando para o ministério salvífico de Jesus. Cada objeto tem um propósito espiritual: o altar de holocaustos simboliza o sacrifício expiatório, a bacia de bronze representa a purificação pelo batismo, a mesa dos pães da proposição nos lembra da Palavra de Deus que sustenta nossa vida espiritual, o candelabro representa a luz da verdade compartilhada pelo Espírito Santo, o altar de incenso reflete a intercessão de Cristo unida às nossas orações, e a arca da aliança com o propiciatório demonstra a harmonia entre a justiça (a lei) e a misericórdia divinas. Este estudo nos ajuda a compreender como Deus estabeleceu um sistema visual completo para ensinar aos israelitas (e a nós) o caminho de reconciliação e relacionamento íntimo com Ele, convidando-nos a fortalecer os aspectos de nossa adoração simbolizados por esses objetos sagrados.</p>
                      </div>
                    </div>
                  </div>
                )}
                {id === "quarta" && (
                  <div className="mb-6">
                    <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-p:font-sans">
                      <h2 className="text-2xl font-bold mb-4 font-serif">Momento hipertexto</h2>
                      
                      <p><span className="bg-yellow-100 p-1 rounded font-medium">Imagine agora Jesus comunicando você e sua família de que passará um tempo na sua casa. Imaginou? O que você faria para recebê-Lo? Que tipo de rotina e hábitos deveria manter ou abandonar a fim de que Seu hóspede fosse bem recebido?</span></p>
                      
                      <p>Normalmente, criamos um cenário caprichado quando esperamos visitas que vão passar algumas horas apenas, ou quem sabe dias, semanas.</p>
                      
                      <p>Procuramos ser uma versão melhor de nós mesmos a fim de deixar uma boa impressão. Até arrumamos tempo para interagir com o hóspede.</p>
                      
                      <p>Por mais que esse texto pareça fictício, isso é real. Ainda que não tenhamos o sentido necessário para ver o invisível, sabemos que dividimos espaço com outros seres e realidades.</p>
                      
                      <p><span className="bg-yellow-100 p-1 rounded font-medium">Acima de tudo, sabemos que Deus sempre quis habitar conosco. Mais do que isso, Ele pode habitar em nós.</span></p>
                      
                      <p>Que tipo de casa temos sido?</p>
                      
                      <p><span className="bg-yellow-100 p-1 rounded font-medium">Como os versículos a seguir ajudam você a entender por que o santuário é tão importante?</span></p>
                      
                      <div className="mt-4 space-y-4">
                        <div>
                          <h4 className="font-semibold">As bênçãos do santuário:</h4>
                          <p>Êx 15:17; 25:22</p>
                          <p>Sl 20:2; 63:1, 2</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold">Jesus revelado no santuário:</h4>
                          <p>Is 53:6, 7, 10-12</p>
                          <p>Jo 1:29; 6:35; 8:12</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold">O santuário celestial:</h4>
                          <p>Sl 102:19</p>
                          <p>Hb 8:1, 2; 9:23-25</p>
                        </div>
                      </div>
                      
                      <div className="bg-accent/15 p-6 rounded-lg mt-6 border-l-4 border-accent">
                        <h3 className="text-xl font-bold mb-2 font-serif">Nosso resumo</h3>
                        <p>A lição de quarta-feira nos convida a uma reflexão pessoal sobre como receberíamos Jesus em nossa casa, fazendo um paralelo com a realidade espiritual de Deus habitando em nós. O texto usa a metáfora de preparar nossa casa para uma visita especial para nos fazer pensar sobre o tipo de "casa espiritual" que temos sido para Deus. Através de uma série de referências bíblicas organizadas em três categorias - as bênçãos do santuário, Jesus revelado no santuário e o santuário celestial - somos convidados a explorar a importância deste tema em diferentes perspectivas. Esta abordagem de "hipertexto" nos permite conectar diversos textos bíblicos para formar uma compreensão mais completa do significado do santuário: um lugar de bênção e encontro com Deus (Êx 25:22), uma revelação do ministério sacrificial e salvador de Jesus (Jo 1:29), e um modelo do santuário celestial onde Cristo ministra em nosso favor (Hb 8:1, 2). A lição nos desafia a considerar que tipo de "santuário" nosso coração tem sido para a habitação de Deus.</p>
                      </div>
                    </div>
                  </div>
                )}
                {id === "quinta" && (
                  <div className="mb-6">
                    <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-p:font-sans">
                      <h2 className="text-2xl font-bold mb-4 font-serif">Cura na adoração</h2>
                      
                      <p><span className="bg-yellow-100 p-1 rounded font-medium">Existe um santuário que adoro visitar. Não consigo ir lá com a frequência que gostaria, mas, quando vou, o tempo parece parar. Parece que tudo no mundo está perfeito. Posso comer meus alimentos favoritos, e todos lá me amam. Eles sempre ficam felizes em me ver, e tristes em me ver partir. Esse lugar especial é a casa dos meus pais.</span></p>
                      
                      <p>A palavra "santuário" pode ter vários significados; um deles é lugar de refúgio. Por exemplo, um santuário ecológico protege o habitat natural das ameaças da civilização humana e preserva sua beleza nativa.</p>
                      
                      <p>O santuário de Deus também é um lugar de refúgio, mas é muito mais do que isso; é um lugar dedicado à adoração. <span className="bg-yellow-100 p-1 rounded font-medium">Deus queria que Israel construísse um santuário de segurança, adoração e comunhão íntima com Ele.</span></p>
                      
                      <p>Adorar a Deus tem incríveis efeitos benéficos. Pesquisas científicas mostram que a oração pode melhorar significativamente os sintomas de depressão e ansiedade. Pessoas que frequentam regularmente reuniões religiosas têm menores taxas de mortalidade e níveis menores de depressão. <span className="bg-yellow-100 p-1 rounded font-medium">Estudos mostram que a adoração diminui o que os especialistas chamam de "resposta de luta ou fuga", reduzindo assim a frequência cardíaca, pressão arterial, níveis de glicose, depressão, ansiedade e dor crônica. Você não quer adorar agora mesmo?</span></p>
                      
                      <p>Deus nos projetou para a adoração. Mesmo depois da devastação causada pelo pecado, Ele tem um lugar de refúgio para nós. Deus construiu um santuário, e nós também devemos fazer isso. Estabeleça diariamente um tempo para se encontrar com Ele. O lugar não precisa ser sempre o mesmo, mas uma coisa é certa: quando você entrar na presença do Senhor, Ele o encontrará lá, e esse lugar se tornará seu santuário – um lugar de proteção, cura e bênção.</p>
                      
                      <div className="bg-muted p-4 rounded-lg mt-6">
                        <h3 className="text-xl font-semibold mb-2">Pense</h3>
                        <p>Como você entende que será o cidadão do Céu? Como já ser parte disso hoje?</p>
                      </div>
                      
                      <div className="bg-accent/15 p-6 rounded-lg mt-6 border-l-4 border-accent">
                        <h3 className="text-xl font-bold mb-2 font-serif">Nosso resumo</h3>
                        <p>A lição de quinta-feira explora o conceito de santuário como um lugar de refúgio, adoração e cura. O texto começa com a metáfora pessoal da casa dos pais como um santuário de amor e segurança, passando então para uma análise mais ampla do significado de santuário como refúgio. A aplicação espiritual revela que o santuário de Deus vai além de apenas um refúgio - é um lugar dedicado à adoração e comunhão íntima. Um aspecto fascinante destacado é a conexão entre adoração e bem-estar físico e mental, apresentando evidências científicas de como a prática religiosa regular pode reduzir sintomas de depressão, ansiedade, e melhorar indicadores físicos como pressão arterial e níveis de glicose. A lição conclui com um convite prático para estabelecermos nosso próprio "santuário" diário para encontros com Deus, independentemente do local físico, enfatizando que o encontro com o Senhor transforma qualquer espaço em um lugar de proteção, cura e bênção. Esta perspectiva nos ajuda a entender o santuário não apenas como um conceito histórico-bíblico, mas como uma realidade terapêutica e restauradora para nossa vida hoje.</p>
                      </div>
                    </div>
                  </div>
                )}
                {id === "sexta" && (
                  <div className="mb-6">
                    <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-p:font-sans">
                      <h2 className="text-2xl font-bold mb-4 font-serif">No santuário celestial</h2>
                      
                      <div className="bg-muted/40 p-5 rounded-lg border-l-4 border-[#a37fb9] mb-6">
                        <blockquote className="not-italic text-slate-700 dark:text-slate-300">
                          <p className="font-serif"><span className="bg-yellow-100 p-1 rounded font-medium">"Foi-me também mostrado um santuário sobre a terra contendo dois compartimentos. Parecia-se com o do Céu, e foi-me dito que era uma figura do celestial. Os objetos do primeiro compartimento do santuário terrestre eram semelhantes aos do primeiro compartimento do celestial. O véu ergueu-se e eu olhei para o santo dos santos, e vi que a mobília era a mesma do lugar santíssimo do santuário celestial. O sacerdote ministrava em ambos os compartimentos do terrestre. Ia diariamente ao primeiro compartimento, mas entrava no lugar santíssimo apenas uma vez ao ano, para purificá-lo dos pecados que tinham sido levados ali.</span></p>
                          
                          <p className="font-serif">"Vi que Jesus ministrava em ambos os compartimentos do santuário celestial. Os sacerdotes entravam no terrestre com sangue de um animal como oferta para o pecado. Cristo entrou no santuário celestial oferecendo Seu sangue. Os sacerdotes terrestres eram removidos pela morte, portanto não podiam continuar por muito tempo; mas Jesus foi Sacerdote para sempre. Mediante os sacrifícios e ofertas trazidas ao santuário terrestre, os filhos de Israel deveriam apossar-se dos méritos de um Salvador que havia de vir. E na sabedoria de Deus os pormenores dessa obra nos foram dados para que pudéssemos, volvendo um olhar para eles, compreender a obra de Jesus no santuário celestial.</p>
                          
                          <p className="font-serif"><span className="bg-yellow-100 p-1 rounded font-medium">"Ao morrer Jesus no Calvário, clamou: 'Está consumado!' (Jo 19:30), e o véu do templo partiu-se de alto a baixo. Isso deveria mostrar que o serviço no santuário terrestre estava para sempre concluído, e que Deus não mais Se encontraria com os sacerdotes em seu templo terrestre, para aceitar seus sacrifícios. O sangue de Jesus foi então derramado, o qual deveria ser oferecido por Ele mesmo no santuário nos Céus. Assim como o sacerdote entrava no lugar santíssimo uma vez ao ano para purificar o santuário terrestre, Jesus entrou no lugar santíssimo do celestial, no fim dos 2.300 dias de Daniel 8, em 1844, para fazer uma expiação final por todos os que pudessem ser beneficiados por Sua mediação, e assim purificar o santuário"</span> (Ellen G. White, Primeiros Escritos [CPB, 2022], p. 232, 233).</p>
                        </blockquote>
                      </div>
                      
                      <div className="mt-4 space-y-3">
                        <h3 className="text-xl font-semibold mb-2">Discuta em classe</h3>
                        <ol className="list-decimal pl-5 space-y-3">
                          <li>Qual objeto do santuário mais fala ao seu coração? Por quê?</li>
                          <li>Como Deus nos transforma quando O adoramos?</li>
                          <li>Onde fica seu santuário para se encontrar com Deus? O que há de especial nesse lugar? Se você ainda não tem um santuário, como pode criar um?</li>
                          <li>Como você compartilharia o que entende sobre o santuário com alguém que não sabe nada sobre ele?</li>
                        </ol>
                      </div>
                      
                      <div className="bg-accent/15 p-6 rounded-lg mt-6 border-l-4 border-accent">
                        <h3 className="text-xl font-bold mb-2 font-serif">Nosso resumo</h3>
                        <p>A lição de sexta-feira apresenta, através de uma citação de Ellen G. White, uma visão esclarecedora sobre a relação entre o santuário terrestre e o celestial. O texto explica que o santuário terrestre, com seus dois compartimentos, era uma representação exata do santuário celestial, onde Jesus Cristo ministra como nosso Sumo Sacerdote eterno. A autora destaca três aspectos fundamentais desta doutrina: 1) a continuidade entre o sistema sacrificial do Antigo Testamento e o sacrifício de Cristo; 2) a transição do ministério terrestre para o celestial, marcada pela morte de Jesus e o rasgar do véu do templo; e 3) o início do julgamento investigativo em 1844, quando Jesus entrou no Lugar Santíssimo celestial para a expiação final. As perguntas para discussão nos convidam a refletir sobre aplicações práticas deste tema, considerando como os objetos do santuário falam à nossa experiência pessoal, como a adoração nos transforma, e como podemos criar nossos próprios "santuários" para encontros com Deus. Esta compreensão mais profunda do ministério atual de Cristo no santuário celestial nos conecta com a realidade mais ampla do grande conflito e do plano da salvação, dando-nos segurança no processo de julgamento que ocorre agora no céu.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="quiz">
              {id && enhancedQuestions.length > 0 && (
                <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
                  <QuizComponent 
                    lessonId={id}
                    questions={enhancedQuestions} 
                    onComplete={handleQuizComplete} 
                  />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="comments">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Deixe seu comentário</h3>
                  <textarea
                    className="w-full p-3 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent mb-3"
                    rows={3}
                    placeholder="Compartilhe seus pensamentos sobre esta lição..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  ></textarea>
                  <Button 
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim()}
                  >
                    Enviar comentário
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-between items-center mt-8">
            <Progress value={progress} className="w-full max-w-3xl" />
            <div className="ml-4">
              {id !== "sabado" && !quizEnabled && progress < 50 && (
                <p className="text-sm text-muted-foreground mr-4">
                  Continue lendo para desbloquear o quiz
                </p>
              )}
              {id !== "sabado" && !quizEnabled && progress >= 50 && (
                <Button onClick={enableQuiz}>
                  Fazer quiz
                </Button>
              )}
              {isCompleted && (
                <div className="flex items-center text-green-500">
                  <CheckCircle className="h-5 w-5 mr-1" />
                  <span>Concluído</span>
                </div>
              )}
            </div>
          </div>

          {/* Botão de ir para o quiz no final do estudo */}
          {id !== "sabado" && progress >= 50 && (
            <div className="mt-8 flex justify-center">
              <Button 
                variant="modern" 
                size="lg"
                onClick={enableQuiz}
                className="w-full max-w-md"
              >
                Ir para o Quiz
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudyDetailPage;
