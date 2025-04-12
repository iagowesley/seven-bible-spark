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
    "sabado": new Date(2024, 3, 12),  
    "domingo": new Date(2024, 3, 13), 
    "segunda": new Date(2024, 3, 14), 
    "terca": new Date(2024, 3, 15),   
    "quarta": new Date(2024, 3, 16),  
    "quinta": new Date(2024, 3, 17), 
    "sexta": new Date(2024, 3, 18)  
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
  title: "Altares para recordar",
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
      text: "Qual era o problema que o autor enfrentava ao tentar se lembrar de orar por Derwyn?",
      options: [
        { id: "a", text: "Falta de tempo" },
        { id: "b", text: "Sua mente vivia distraída" },
        { id: "c", text: "Não gostava de Derwyn" },
        { id: "d", text: "Não acreditava que a oração funcionaria" },
      ],
      correctOptionId: "b",
    },
    {
      id: "domingo_q2",
      text: "Qual solução o autor encontrou para lembrar de orar por Derwyn?",
      options: [
        { id: "a", text: "Pediu para alguém lembrá-lo" },
        { id: "b", text: "Escreveu um bilhete em sua Bíblia" },
        { id: "c", text: "Criou um lembrete no smartphone" },
        { id: "d", text: "Amarrou um fio no dedo" },
      ],
      correctOptionId: "c",
    },
    {
      id: "domingo_q3",
      text: "Por quanto tempo o autor continuou orando por Derwyn?",
      options: [
        { id: "a", text: "Apenas durante uma semana" },
        { id: "b", text: "Durante um mês" },
        { id: "c", text: "Por vários anos" },
        { id: "d", text: "Até hoje, mas em horários diferentes" },
      ],
      correctOptionId: "c",
    },
    {
      id: "domingo_q4",
      text: "O que as pessoas nos tempos bíblicos usavam para se lembrarem de coisas importantes?",
      options: [
        { id: "a", text: "Escreviam em papiros" },
        { id: "b", text: "Altares de recordação" },
        { id: "c", text: "Contavam para seus vizinhos" },
        { id: "d", text: "Memorizavam canções" },
      ],
      correctOptionId: "b",
    },
    {
      id: "domingo_q5",
      text: "Segundo o texto, o que os altares representavam na Bíblia?",
      options: [
        { id: "a", text: "Locais de sacrifício somente" },
        { id: "b", text: "Lugares de consagração e comemoração" },
        { id: "c", text: "Simples pilhas de pedras sem significado" },
        { id: "d", text: "Fronteiras territoriais" },
      ],
      correctOptionId: "b",
    },
    {
      id: "domingo_q6",
      text: "Quando as pessoas geralmente construíam altares, segundo o texto?",
      options: [
        { id: "a", text: "Apenas nos tempos de crise" },
        { id: "b", text: "Como punição por seus pecados" },
        { id: "c", text: "Quando Deus fazia algo sobrenatural ou muito especial" },
        { id: "d", text: "Apenas em datas religiosas específicas" },
      ],
      correctOptionId: "c",
    },
    {
      id: "domingo_q7",
      text: "Qual era a principal função dos altares como memória?",
      options: [
        { id: "a", text: "Lugares para se recordar das vezes em que viram Deus agir" },
        { id: "b", text: "Depósitos de ofertas e sacrifícios" },
        { id: "c", text: "Símbolos de riqueza e prosperidade" },
        { id: "d", text: "Locais de punição por pecados" },
      ],
      correctOptionId: "a",
    },
    {
      id: "domingo_q8",
      text: "Qual capítulo de Patriarcas e Profetas é recomendado para leitura adicional?",
      options: [
        { id: "a", text: "Capítulo 10: 'A torre de Babel'" },
        { id: "b", text: "Capítulo 13: 'A prova da fé'" },
        { id: "c", text: "Capítulo 4: 'O plano da redenção'" },
        { id: "d", text: "Capítulo 7: 'O dilúvio'" },
      ],
      correctOptionId: "b",
    },
    {
      id: "segunda_q1",
      text: "Com qual pedido surpreendente Deus se dirigiu a Abrão em Gênesis 12?",
      options: [
        { id: "a", text: "Que oferecesse seu filho como sacrifício" },
        { id: "b", text: "Que construísse uma arca" },
        { id: "c", text: "Que arrumasse sua família e pertences para ir a um lugar desconhecido" },
        { id: "d", text: "Que construísse um templo para adoração" },
      ],
      correctOptionId: "c",
    },
    {
      id: "segunda_q2",
      text: "Quantos anos Abrão tinha quando saiu de Harã?",
      options: [
        { id: "a", text: "60 anos" },
        { id: "b", text: "75 anos" },
        { id: "c", text: "90 anos" },
        { id: "d", text: "100 anos" },
      ],
      correctOptionId: "b",
    },
    {
      id: "segunda_q3",
      text: "Qual foi a resposta de Abrão ao chamado de Deus?",
      options: [
        { id: "a", text: "Obediência imediata" },
        { id: "b", text: "Pediu para Deus reconsiderar" },
        { id: "c", text: "Procrastinou por vários meses" },
        { id: "d", text: "Obedeceu parcialmente, deixando familiares para trás" },
      ],
      correctOptionId: "a",
    },
    {
      id: "segunda_q4",
      text: "O que Abrão fez ao chegar em Canaã, após Deus lhe prometer a terra?",
      options: [
        { id: "a", text: "Construiu uma casa" },
        { id: "b", text: "Plantou uma árvore" },
        { id: "c", text: "Construiu um altar" },
        { id: "d", text: "Abriu um poço" },
      ],
      correctOptionId: "c",
    },
    {
      id: "segunda_q5",
      text: "Segundo o texto, o que simbolizavam os altares que Abrão construiu?",
      options: [
        { id: "a", text: "Seu medo dos habitantes locais" },
        { id: "b", text: "Seu compromisso de seguir a Deus onde quer que Ele o levasse" },
        { id: "c", text: "Uma forma de marcar território" },
        { id: "d", text: "Apenas um ritual religioso comum" },
      ],
      correctOptionId: "b",
    },
    {
      id: "segunda_q6",
      text: "Que detalhe interessante a Bíblia menciona ao descrever o segundo altar de Abrão?",
      options: [
        { id: "a", text: "Era feito de pedras especiais" },
        { id: "b", text: "Foi construído durante uma tempestade" },
        { id: "c", text: "Abrão não apenas construiu o altar, mas invocou o nome do Senhor" },
        { id: "d", text: "Era maior que o primeiro altar" },
      ],
      correctOptionId: "c",
    },
    {
      id: "segunda_q7",
      text: "O que o segundo altar sugere sobre o relacionamento de Abrão com Deus?",
      options: [
        { id: "a", text: "Que Abrão tinha dúvidas sobre as promessas divinas" },
        { id: "b", text: "Que Abrão buscava um relacionamento mais profundo com Deus" },
        { id: "c", text: "Que Abrão queria impressionar os cananeus" },
        { id: "d", text: "Que Abrão estava insatisfeito com o primeiro altar" },
      ],
      correctOptionId: "b",
    },
    {
      id: "segunda_q8",
      text: "Como é descrita a vida devocional de Abrão na conclusão do texto?",
      options: [
        { id: "a", text: "Estática e baseada em tradições" },
        { id: "b", text: "Irregular e esporádica" },
        { id: "c", text: "Crescendo a cada dia - um altar de adoração por vez" },
        { id: "d", text: "Declinando devido às dificuldades" },
      ],
      correctOptionId: "c",
    },
    {
      id: "terca_q1",
      text: "O que Gênesis 12:6 relata sobre a situação da Terra Prometida?",
      options: [
        { id: "a", text: "Era uma terra desabitada" },
        { id: "b", text: "Os cananeus habitavam essa terra" },
        { id: "c", text: "Era habitada por israelitas" },
        { id: "d", text: "Era governada pelos egípcios" },
      ],
      correctOptionId: "b",
    },
    {
      id: "terca_q2",
      text: "Como são descritos os cananeus no texto?",
      options: [
        { id: "a", text: "Um povo pacífico e hospitaleiro" },
        { id: "b", text: "Um povo bastante cruel e perverso" },
        { id: "c", text: "Um povo que adorava o mesmo Deus de Abrão" },
        { id: "d", text: "Nômades que logo deixariam a terra" },
      ],
      correctOptionId: "b",
    },
    {
      id: "terca_q3",
      text: "O que Abrão havia trocado ao deixar Harã?",
      options: [
        { id: "a", text: "Riquezas por sabedoria" },
        { id: "b", text: "Família por fama" },
        { id: "c", text: "Paz e segurança por uma terra cheia de problemas e ameaças" },
        { id: "d", text: "Adoração a ídolos por adoração ao Deus verdadeiro" },
      ],
      correctOptionId: "c",
    },
    {
      id: "terca_q4",
      text: "Qual garantia Deus deu a Abrão, segundo Gênesis 15:1?",
      options: [
        { id: "a", text: "\"Eu derrotarei todos os seus inimigos\"" },
        { id: "b", text: "\"Não tenha medo, Abrão, Eu sou o seu escudo\"" },
        { id: "c", text: "\"Você terá muitas riquezas\"" },
        { id: "d", text: "\"Os cananeus logo partirão desta terra\"" },
      ],
      correctOptionId: "b",
    },
    {
      id: "terca_q5",
      text: "De acordo com o texto, o que Deus sabe sobre nossa jornada de fé?",
      options: [
        { id: "a", text: "Que nunca enfrentaremos dificuldades" },
        { id: "b", text: "Que devemos sempre depender de nossa própria força" },
        { id: "c", text: "Que é difícil andar somente pela fé quando enfrentamos situações difíceis" },
        { id: "d", text: "Que a fé é apenas um sentimento" },
      ],
      correctOptionId: "c",
    },
    {
      id: "terca_q6",
      text: "Por que Abrão foi chamado de \"amigo de Deus\", segundo Tiago 2:23?",
      options: [
        { id: "a", text: "Por sua riqueza" },
        { id: "b", text: "Por sua íntima conexão espiritual com Deus" },
        { id: "c", text: "Porque Deus lhe deu muitos filhos" },
        { id: "d", text: "Porque não questionou Deus" },
      ],
      correctOptionId: "b",
    },
    {
      id: "terca_q7",
      text: "Segundo Ellen White, o que acontecia com os altares de Abrão quando ele removia sua tenda?",
      options: [
        { id: "a", text: "Eram destruídos" },
        { id: "b", text: "Eram levados com ele" },
        { id: "c", text: "O altar ficava no local" },
        { id: "d", text: "Eram entregues aos cananeus" },
      ],
      correctOptionId: "c",
    },
    {
      id: "terca_q8",
      text: "O que os cananeus errantes faziam ao chegar aos altares deixados por Abrão?",
      options: [
        { id: "a", text: "Destruíam os altares" },
        { id: "b", text: "Sabiam quem havia estado ali, consertavam o altar e adoravam o Deus vivo" },
        { id: "c", text: "Ignoravam completamente" },
        { id: "d", text: "Transformavam em monumentos para seus deuses" },
      ],
      correctOptionId: "b",
    },
    {
      id: "quarta_q1",
      text: "Segundo o texto, o que cada altar levantado por Abrão representava?",
      options: [
        { id: "a", text: "Uma forma de proteção contra inimigos" },
        { id: "b", text: "Um memorial da bondade, cuidado e providência divinos" },
        { id: "c", text: "Um local para sacrifícios apenas" },
        { id: "d", text: "Uma marca territorial" },
      ],
      correctOptionId: "b",
    },
    {
      id: "quarta_q2",
      text: "Por que Deus ordenou a Moisés que registrasse os acontecimentos em um hino?",
      options: [
        { id: "a", text: "Para entretenimento do povo" },
        { id: "b", text: "Para criar a primeira obra literária" },
        { id: "c", text: "Para que os pais pudessem ensiná-lo aos filhos e não esquecessem a história" },
        { id: "d", text: "Para demonstrar o talento musical de Moisés" },
      ],
      correctOptionId: "c",
    },
    {
      id: "quarta_q3",
      text: "De acordo com o texto de Ellen White citado, o que deveria ser conservado na lembrança?",
      options: [
        { id: "a", text: "As leis e mandamentos apenas" },
        { id: "b", text: "As genealogias do povo" },
        { id: "c", text: "O procedimento providencial de Deus, Sua bondade, misericórdia e cuidado" },
        { id: "d", text: "Os nomes dos líderes e sacerdotes" },
      ],
      correctOptionId: "c",
    },
    {
      id: "quarta_q4",
      text: "Qual texto bíblico é citado para lembrarmos \"dos dias anteriores\"?",
      options: [
        { id: "a", text: "João 3:16" },
        { id: "b", text: "Salmos 23:1" },
        { id: "c", text: "Hebreus 10:32" },
        { id: "d", text: "Apocalipse 1:8" },
      ],
      correctOptionId: "c",
    },
    {
      id: "quarta_q5",
      text: "Quais passagens bíblicas são mencionadas sobre os altares de Abrão?",
      options: [
        { id: "a", text: "Gênesis 13:4, 14-18; 22:9-14" },
        { id: "b", text: "Êxodo, 20:1-17" },
        { id: "c", text: "Levítico 1:1-7" },
        { id: "d", text: "Deuteronômio 6:4-9" },
      ],
      correctOptionId: "a",
    },
    {
      id: "quarta_q6",
      text: "Quais textos bíblicos são citados em relação à promessa da aliança repetida a Abrão?",
      options: [
        { id: "a", text: "Gênesis 1:1-3; 2:1-3" },
        { id: "b", text: "Gênesis 15:17-21; 17:1-8" },
        { id: "c", text: "Êxodo 12:1-14" },
        { id: "d", text: "Números 6:22-27" },
      ],
      correctOptionId: "b",
    },
    {
      id: "quarta_q7",
      text: "Qual texto em Romanos é citado em relação à fé de Abrão?",
      options: [
        { id: "a", text: "Romanos 1:16" },
        { id: "b", text: "Romanos 3:23" },
        { id: "c", text: "Romanos 4:20" },
        { id: "d", text: "Romanos 6:23" },
      ],
      correctOptionId: "c",
    },
    {
      id: "quarta_q8",
      text: "Qual texto em Hebreus é referenciado sobre a fé de Abrão?",
      options: [
        { id: "a", text: "Hebreus 11:8-11" },
        { id: "b", text: "Hebreus 1:1-3" },
        { id: "c", text: "Hebreus 4:12" },
        { id: "d", text: "Hebreus 13:8" },
      ],
      correctOptionId: "a",
    },
    {
      id: "quinta_q1",
      text: "O que Gênesis 13:1-18 confirma sobre Abrão?",
      options: [
        { id: "a", text: "Que ele era o homem mais rico de Canaã" },
        { id: "b", text: "Que ele tinha muitos inimigos" },
        { id: "c", text: "Que a construção de altares se tornou a marca da sua vida" },
        { id: "d", text: "Que ele estava arrependido de ter saído de Harã" },
      ],
      correctOptionId: "c",
    },
    {
      id: "quinta_q2",
      text: "Como Abrão resolveu o conflito com seu sobrinho Ló?",
      options: [
        { id: "a", text: "Expulsou Ló da terra" },
        { id: "b", text: "Permitiu que Ló escolhesse onde morar, concordando em ficar com o que restasse" },
        { id: "c", text: "Dividiu a terra em partes iguais" },
        { id: "d", text: "Escolheu para si a melhor parte da terra" },
      ],
      correctOptionId: "b",
    },
    {
      id: "quinta_q3",
      text: "O que Abrão fez após resolver o conflito com Ló?",
      options: [
        { id: "a", text: "Partiu para outra terra" },
        { id: "b", text: "Construiu uma cidade" },
        { id: "c", text: "Construiu em Manre um altar celebrando a paz" },
        { id: "d", text: "Enviou mensageiros para buscar mais familiares" },
      ],
      correctOptionId: "c",
    },
    {
      id: "quinta_q4",
      text: "Qual foi a maior crise na vida de Abraão, mencionada em Gênesis 22?",
      options: [
        { id: "a", text: "A fome na terra de Canaã" },
        { id: "b", text: "O pedido de Deus para sacrificar Isaque" },
        { id: "c", text: "A separação de Ló" },
        { id: "d", text: "A esterilidade de Sara" },
      ],
      correctOptionId: "b",
    },
    {
      id: "quinta_q5",
      text: "O que Deus providenciou no lugar de Isaque?",
      options: [
        { id: "a", text: "Uma visão" },
        { id: "b", text: "Um carneiro" },
        { id: "c", text: "Um anjo" },
        { id: "d", text: "Outro filho" },
      ],
      correctOptionId: "b",
    },
    {
      id: "quinta_q6",
      text: "Como Abraão chamou o lugar onde Deus providenciou o substituto para Isaque?",
      options: [
        { id: "a", text: "Betel - Casa de Deus" },
        { id: "b", text: "Peniel - Face de Deus" },
        { id: "c", text: "Yahweh Iré - O Senhor Proverá" },
        { id: "d", text: "Eben-Ezer - Pedra de Ajuda" },
      ],
      correctOptionId: "c",
    },
    {
      id: "quinta_q7",
      text: "Segundo o texto, qual é uma das melhores maneiras de manter a bondade de Deus em mente?",
      options: [
        { id: "a", text: "Fazer peregrinações anuais" },
        { id: "b", text: "Dar um nome ao lugar em que Deus fez algo especial por você" },
        { id: "c", text: "Usar roupas especiais" },
        { id: "d", text: "Fazer longas orações" },
      ],
      correctOptionId: "b",
    },
    {
      id: "quinta_q8",
      text: "De acordo com o texto, o que aprofunda a memória da bondade de Deus em nossa mente?",
      options: [
        { id: "a", text: "Ler a Bíblia diariamente" },
        { id: "b", text: "Verbalizar nossa gratidão" },
        { id: "c", text: "Memorizar versículos" },
        { id: "d", text: "Fazer penitências" },
      ],
      correctOptionId: "b",
    },
    {
      id: "sexta_q1",
      text: "Onde Abraão morava quando recebeu o primeiro chamado do Céu?",
      options: [
        { id: "a", text: "Ur dos Caldeus" },
        { id: "b", text: "Harã" },
        { id: "c", text: "Canaã" },
        { id: "d", text: "Betel" },
      ],
      correctOptionId: "a",
    },
    {
      id: "sexta_q2",
      text: "Quem acompanhou Abraão em sua jornada até Harã?",
      options: [
        { id: "a", text: "Apenas Sara" },
        { id: "b", text: "Apenas Ló" },
        { id: "c", text: "A família de seu pai" },
        { id: "d", text: "Ninguém, ele viajou sozinho" },
      ],
      correctOptionId: "c",
    },
    {
      id: "sexta_q3",
      text: "Qual evento motivou Abraão a seguir de Harã para Canaã?",
      options: [
        { id: "a", text: "A fome severa em Harã" },
        { id: "b", text: "A morte de seu pai Terá" },
        { id: "c", text: "Um conflito com habitantes locais" },
        { id: "d", text: "O nascimento de Isaque" },
      ],
      correctOptionId: "b",
    },
    {
      id: "sexta_q4",
      text: "Além de Sara, quem mais preferiu partilhar da vida peregrina de Abraão?",
      options: [
        { id: "a", text: "Seu irmão Naor" },
        { id: "b", text: "Seus servos apenas" },
        { id: "c", text: "Ló, filho de Harã" },
        { id: "d", text: "Ismael" },
      ],
      correctOptionId: "c",
    },
    {
      id: "sexta_q5",
      text: "Como é descrito o território onde Abraão montou seu primeiro acampamento em Canaã?",
      options: [
        { id: "a", text: "Terra árida e improdutiva" },
        { id: "b", text: "Terra de ribeiros de água, fontes, trigo, cevada, vides..." },
        { id: "c", text: "Uma região desértica" },
        { id: "d", text: "Um local montanhoso de difícil acesso" },
      ],
      correctOptionId: "b",
    },
    {
      id: "sexta_q6",
      text: "Qual era a \"densa sombra\" que estava sobre a terra prometida?",
      options: [
        { id: "a", text: "Uma tempestade se aproximando" },
        { id: "b", text: "A presença de animais selvagens" },
        { id: "c", text: "Os cananeus habitavam essa terra" },
        { id: "d", text: "As montanhas bloqueavam o sol" },
      ],
      correctOptionId: "c",
    },
    {
      id: "sexta_q7",
      text: "O que fortaleceu a fé de Abraão quando estava em Canaã?",
      options: [
        { id: "a", text: "A certeza de que a presença divina estava com ele" },
        { id: "b", text: "A descoberta de ouro na região" },
        { id: "c", text: "O apoio dos habitantes locais" },
        { id: "d", text: "A chegada de mais familiares" },
      ],
      correctOptionId: "a",
    },
    {
      id: "sexta_q8",
      text: "Como Ellen White descreve a vida de oração de Abraão?",
      options: [
        { id: "a", text: "Esporádica e inconsistente" },
        { id: "b", text: "Onde armasse a tenda, construía o altar para sacrifícios matinais e vespertinos" },
        { id: "c", text: "Apenas em momentos de crise" },
        { id: "d", text: "Focada apenas em pedidos e súplicas" },
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
      setDescription(id === "sabado" ? "Altares para recordar" : "");
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
                    id === "domingo" ? "Mente distraída" : 
                    id === "segunda" ? "Promessa para não esquecer" :
                    id === "terca" ? "Promessa ameaçada" :
                    id === "quarta" ? "Momento hipertexto" :
                    id === "quinta" ? "Auxílio divino" :
                    id === "sexta" ? "Amigo de Deus" :
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
                        className="w-full object-contain min-h-[680px] sm:min-h-[500px]"
                        style={{ maxHeight: "auto" }}
                      />
                    </div>

                    <h2 className="text-2xl font-bold mb-4 font-serif">Altares para recordar</h2>
                    
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
                        <span>Gn 12:1-9</span>
                        <span className="text-sm text-muted-foreground">Clique para ler</span>
                      </Button>
                      
                      <Dialog open={isBibleTextOpen} onOpenChange={setIsBibleTextOpen}>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Gênesis 12:1-9</DialogTitle>
                            <DialogDescription>Versão Almeida Revista e Atualizada</DialogDescription>
                          </DialogHeader>
                          <div className="mt-4 text-lg space-y-4">
                            <p><strong>1</strong> Ora, disse o SENHOR a Abrão: Sai da tua terra, da tua parentela e da casa de teu pai e vai para a terra que te mostrarei;</p>
                            <p><strong>2</strong> de ti farei uma grande nação, e te abençoarei, e te engrandecerei o nome. Sê tu uma bênção!</p>
                            <p><strong>3</strong> Abençoarei os que te abençoarem e amaldiçoarei os que te amaldiçoarem; em ti serão benditas todas as famílias da terra.</p>
                            <p><strong>4</strong> Partiu, pois, Abrão, como lho ordenara o SENHOR, e Ló foi com ele. Tinha Abrão setenta e cinco anos quando saiu de Harã.</p>
                            <p><strong>5</strong> Levou Abrão consigo a Sarai, sua mulher, e a Ló, filho de seu irmão, e todos os bens que haviam adquirido, e as pessoas que lhes acresceram em Harã. Partiram para a terra de Canaã; e à terra de Canaã chegaram.</p>
                            <p><strong>6</strong> Atravessou Abrão a terra até Siquém, até ao carvalho de Moré. Nesse tempo os cananeus habitavam essa terra.</p>
                            <p><strong>7</strong> Apareceu o SENHOR a Abrão e lhe disse: Darei à tua descendência esta terra. Ali edificou Abrão um altar ao SENHOR, que lhe aparecera.</p>
                            <p><strong>8</strong> Passando dali para o monte ao oriente de Betel, armou a sua tenda, ficando Betel ao ocidente e Ai ao oriente; ali edificou um altar ao SENHOR e invocou o nome do SENHOR.</p>
                            <p><strong>9</strong> Depois, seguiu Abrão dali, indo sempre para o Neguebe.</p>
                          </div>
                          <DialogClose asChild>
                            <Button variant="outline" className="mt-4">Fechar</Button>
                          </DialogClose>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-2 font-serif">Pesquise em comentários bíblicos, livros denominacionais e de Ellen G. White sobre temas contidos neste texto:</h3>
                      <p className="p-4 bg-muted rounded-lg font-sans">Gênesis 12:1-9                      </p>
                    </div>
                    
                    <div className="bg-accent/15 p-6 rounded-lg mt-6 border-l-4 border-accent">
                      <h3 className="text-xl font-bold mb-2 font-serif">Nosso resumo</h3>
                      <p>A tirinha bíblica desta semana ilustra um momento crucial na jornada de Abraão, que atendeu ao chamado de Deus para deixar sua terra natal e seguir para um território desconhecido, confiando apenas na promessa divina. Gênesis 12:1-9 marca o início da aliança de Deus com Abraão, através da qual todas as nações seriam abençoadas. O texto destaca que, ao chegar em Canaã, Abraão não apenas ocupou o território, mas ergueu altares para adorar a Deus (versículos 7 e 8), estabelecendo marcos de sua fé e gratidão. Estes altares representavam seu compromisso com Deus e serviam como memória das promessas divinas. O título "Altares para recordar" nos ensina que, assim como Abraão, devemos construir "altares espirituais" em nossa jornada de fé - momentos e lugares onde reconhecemos a presença e as promessas de Deus em nossa vida.</p>
                    </div>
                  </div>
                )}
                {id === "domingo" && (
                  <div className="mb-6">
                    <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-p:font-sans">
                      <h2 className="text-2xl font-bold mb-4 font-serif">Mente distraída</h2>
                      
                      <p>Certo sábado, o pastor associado de minha igreja fez um apelo especial. Ele pediu que todos tirassem uma selfie com alguém, se comprometessem a orar juntos todos os dias da semana seguinte e depois postassem esse compromisso nas redes sociais – marcando a página da igreja. Fiz parceria com um adolescente chamado Derwyn. Mas havia um problema: minha mente vivia distraída.</p>
                      
                      <p>Com uma infinidade de coisas passando pela minha cabeça a qualquer momento, eu não confiava em mim mesmo para me lembrar de orar por Derwyn todos os dias. Quando voltei para meu banco, fiz algo que sabia que me ajudaria a não me esquecer do compromisso diário com Derwyn: peguei meu smartphone e criei um lembrete. Todos os dias, às 5 horas da manhã, ele me lembraria de orar por Derwyn. Vários anos se passaram e ainda oro por Derwyn no mesmo horário, porque meu celular me ajuda a não esquecer.</p>
                      
                      <p>Embora as pessoas nos tempos bíblicos não tivessem dispositivos eletrônicos para ajudá-las a se lembrarem das coisas, elas tinham outras maneiras de fazer isso. Naquela cultura, quando as informações eram passadas oralmente, as pessoas eram melhores do que nós em lembrar eventos importantes, mas também tinham recursos que as ajudavam a se lembrar daquilo que não queriam esquecer. <span className="bg-yellow-100 p-1 rounded font-medium">Elas tinham altares de recordação.</span></p>
                      
                      <p><span className="bg-yellow-100 p-1 rounded font-medium">Na Bíblia, os altares a Deus representam lugares de consagração e comemoração. Eram símbolos externos da experiência pessoal com Ele, do reconhecimento e da adoração do Deus vivo e verdadeiro.</span> Eles eram frequentemente construídos para comemorar encontros com Deus que tinham profundo impacto na vida de alguém. Quando o Senhor fazia algo sobrenatural ou muito especial, quem tinha vivido esses atos poderosos construía altares para lembrar e celebrar essas experiências. Eram lugares para se recordar das vezes em que viram Deus agir e ouviram Sua voz.</p>
                      
                      <div className="bg-muted p-4 rounded-lg mt-6">
                        <h3 className="text-xl font-semibold mb-2">Mergulhe + fundo</h3>
                        <p>Leia, de Ellen G. White, Patriarcas e Profetas, capítulo 13: "A prova da fé".</p>
                      </div>
                      
                      <div className="bg-accent/15 p-6 rounded-lg mt-6 border-l-4 border-accent">
                        <h3 className="text-xl font-bold mb-2 font-serif">Nosso resumo</h3>
                        <p>A lição de domingo aborda nossa tendência à distração e esquecimento, contrastando com a necessidade de recordar o que Deus faz em nossa vida. Através da história do autor criando um lembrete digital para orar por Derwyn, o texto introduz o conceito de "altares de recordação" usados no tempo bíblico. Estes altares serviam como símbolos externos das experiências pessoais com Deus, marcos físicos que ajudavam as pessoas a lembrar e celebrar encontros significativos com o Divino. Mais do que simples estruturas de pedra, os altares representavam lugares de consagração, reconhecimento e adoração, funcionando como memoriais dos momentos em que viram Deus agir ou ouviram Sua voz. Esta lição nos convida a criar nossos próprios "altares" - práticas ou símbolos que nos ajudem a recordar e celebrar a presença de Deus em nossa jornada.</p>
                      </div>
                    </div>
                  </div>
                )}
                {id === "segunda" && (
                  <div className="mb-6">
                    <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-p:font-sans">
                      <h2 className="text-2xl font-bold mb-4 font-serif">Promessa para não esquecer</h2>
                      
                      <p>Gênesis 12 começa com um pedido surpreendente de Deus a Abrão: "Arrume sua família e tudo o que você possui, e vá para um lugar que Eu lhe mostrarei." Gênesis 11 nos informa que Abrão era filho de Terá, um homem que havia começado uma jornada para Canaã. Mas ele acabou se estabelecendo, com sua família, a mais de 600 quilômetros de distância de sua cidade de origem, em um lugar chamado Harã. <span className="bg-yellow-100 p-1 rounded font-medium">Algum tempo depois da morte de Terá, Deus apareceu a Abrão (mais tarde chamado Abraão) para fazer uma aliança com ele. O Senhor prometeu fazer de seus descendentes uma grande nação.</span> Além disso, iria engrandecer o nome de Abrão (Gn 12:2) e torná-lo uma bênção para o mundo inteiro.</p>
                      
                      <p>Abrão, aos 75 anos de idade, vivendo confortavelmente da herança deixada por seu pai, imediatamente fez as malas, e, com sua esposa Sara, toda a sua família, a família de seu sobrinho Ló e todas as suas posses partiu para a terra de Canaã (Gn 12:4-6). <span className="bg-yellow-100 p-1 rounded font-medium">A resposta de Abrão foi obediência imediata!</span> E, quando chegou a Canaã, Deus disse: "Darei esta terra à sua descendência" (v. 7).</p>
                      
                      <p>Abrão ficou tão comovido pela graça e pela bênção surpreendente de Deus para com ele, um simples andarilho do deserto, que seu próximo ato foi construir um altar para lembrar o local em que havia se encontrado com Deus. Esse altar indicava o local no qual Deus lhe havia aparecido (e para onde ele retornaria mais tarde, em Gênesis 13:4). Quando Abrão partiu daquele local e armou sua tenda perto de Betel, construiu outro altar.</p>
                      
                      <p><span className="bg-yellow-100 p-1 rounded font-medium">Pense por um momento sobre esses dois altares que ele construiu em um período relativamente curto depois que Deus havia falado com ele. Esses altares simbolizavam o compromisso de Abrão de seguir a Deus aonde quer que Ele o levasse, mesmo longe da família e dos amigos.</span> A Bíblia menciona um detalhe interessante ao descrever o segundo altar de Abrão: ele não apenas foi construído em "nome do Senhor", mas Abrão "invocou o nome do Senhor" (Gn 12:8).</p>
                      
                      <p>Talvez a importância da promessa de Deus tenha começado a pesar sobre Abrão enquanto ele viajava por Canaã. O segundo altar sugere que Abrão buscava um relacionamento mais profundo com Deus. O patriarca queria viver uma vida completamente dedicada a Ele. Queria se lembrar de Deus, de Suas promessas e de Sua presença em todos os lugares que fosse. Se Abrão passasse por ali novamente, queria ter um lembrete de tudo o que Deus tinha feito e estava fazendo por ele. <span className="bg-yellow-100 p-1 rounded font-medium">A vida devocional de Abrão estava crescendo a cada dia enquanto ele viajava com Deus – um altar de adoração por vez.</span></p>
                      
                      <div className="bg-muted p-4 rounded-lg mt-6">
                        <h3 className="text-xl font-semibold mb-2">Pense</h3>
                        <p>De que maneiras práticas você pode construir "altares" para recordar as promessas de Deus?</p>
                      </div>
                      
                      <div className="bg-accent/15 p-6 rounded-lg mt-6 border-l-4 border-accent">
                        <h3 className="text-xl font-bold mb-2 font-serif">Nosso resumo</h3>
                        <p>A lição de segunda-feira explora o início da jornada de fé de Abrão, destacando sua obediência imediata ao chamado divino para deixar Harã aos 75 anos e partir para uma terra desconhecida. O texto revela como Abrão, movido pela graça de Deus, construiu altares como marcos de sua experiência com o Senhor, começando em Siquém e depois perto de Betel. Estes altares não eram meras estruturas físicas, mas símbolos do compromisso do patriarca de seguir a Deus, independentemente do custo pessoal. O detalhe de que Abrão não apenas construiu um altar, mas "invocou o nome do Senhor" demonstra sua busca por um relacionamento mais profundo com Deus. Os altares representavam memórias tangíveis das promessas divinas e serviam como pontos de referência espirituais em sua jornada. Esta prática de Abrão nos ensina a importância de criar marcos espirituais que nos ajudem a lembrar e celebrar a fidelidade de Deus em nossa vida.</p>
                      </div>
                    </div>
                  </div>
                )}
                {id === "terca" && (
                  <div className="mb-6">
                    <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-p:font-sans">
                      <h2 className="text-2xl font-bold mb-4 font-serif">Promessa ameaçada</h2>
                      
                      <p>Gênesis 12:6 relata que quando Abrão chegou perto da Terra Prometida, <span className="bg-yellow-100 p-1 rounded font-medium">"nesse tempo os cananeus habitavam essa terra"</span>. Esse fato por si só deve ter enchido Abrão de pavor. Os cananeus eram um povo bastante cruel e perverso. Mesmo com a promessa que Deus havia feito, Abrão havia trocado a paz e a segurança de Harã por uma terra cheia de problemas e ameaças.</p>
                      
                      <p>Esse lugar no qual Deus havia prometido conceder bênçãos espirituais estava cheio de problemas que Abrão seria incapaz de resolver. Mas nessa terra de perigo Abrão aprenderia a confiar nas promessas de Deus. Ao longo do caminho, no entanto, o Senhor sabia que Abrão precisava de uma garantia, então Ele disse: "Não tenha medo, Abrão, Eu sou o seu escudo" (Gn 15:1). Essa declaração simples e poderosa revela a disposição de Deus de nos encontrar exatamente onde estamos.</p>
                      
                      <p><span className="bg-yellow-100 p-1 rounded font-medium">Os planos de Deus para o futuro são certos, mas Ele sabe o quão difícil pode ser andar somente pela fé quando encontramos coisas com as quais sabemos que não podemos lidar com nossas próprias forças.</span> Ele quer nos dar o encorajamento e a capacitação necessária de que precisamos.</p>
                      
                      <p>Abrão não entendia completamente tudo o que estaria envolvido nessa aliança, mas sabia que precisava de um relacionamento mais próximo com Deus. Ao olhar para o mundo corrompido ao seu redor, ele decidiu passar mais tempo em oração, mais tempo em adoração – mais tempo com Deus. As pessoas ao seu redor perceberam a íntima conexão espiritual que ele cultivava. Por isso, Abrão "foi chamado amigo de Deus" (Tg 2:23).</p>
                      
                      <p><span className="bg-yellow-100 p-1 rounded font-medium">"A vida de Abraão, o amigo de Deus, era de oração. Onde quer que armasse sua tenda, junto dela construía um altar sobre o qual oferecia os sacrifícios da manhã e da tarde. Ao remover sua tenda, o altar ficava. E o cananeu errante, ao chegar àquele altar, sabia quem havia estado ali; e quando armou sua tenda, consertou o altar e adorou o Deus vivo"</span> (Testemunhos Para a Igreja [CPB, 2021], v. 7, p. 40).</p>
                      
                      <p>Os altares de Abrão eram uma das maneiras de Deus evangelizar o povo do qual Abrão tinha medo. Nossa caminhada devocional com Deus deve levar outras pessoas a adorá-Lo.</p>
                      
                      <p>Talvez Abrão fosse tentado a esconder seus altares para que pudesse se misturar melhor com seus vizinhos cananeus, mas, em vez disso, ele tornou esses altares sinais visíveis de que era fiel ao Deus do Céu, mesmo que a idolatria fosse tão popular em Canaã.</p>
                      
                      <div className="bg-muted p-4 rounded-lg mt-6">
                        <h3 className="text-xl font-semibold mb-2">Pense</h3>
                        <p>Você já foi impactado pela vida devocional de outras pessoas? Como?</p>
                      </div>
                      
                      <div className="bg-accent/15 p-6 rounded-lg mt-6 border-l-4 border-accent">
                        <h3 className="text-xl font-bold mb-2 font-serif">Nosso resumo</h3>
                        <p>A lição de terça-feira aborda as dificuldades que Abrão enfrentou ao chegar em Canaã, uma terra habitada por povos cruéis e perversos. O texto destaca que, mesmo diante de circunstâncias ameaçadoras, Deus fortaleceu Abrão com Sua promessa: "Não tenha medo, Eu sou o seu escudo". Esta experiência nos ensina que os planos divinos não nos isentam de desafios, mas nos equipam para enfrentá-los pela fé. Em vez de se esconder ou tentar se misturar com os cananeus idólatras, Abrão construía altares que serviam não apenas para sua adoração pessoal, mas também como testemunho público de sua fé no Deus verdadeiro. Segundo Ellen White, esses altares permaneciam mesmo quando Abrão seguia viagem, tornando-se pontos de referência espiritual para os nômades cananeus, que reconheciam quem havia estado naquele lugar e, por vezes, até restauravam os altares para adorar o mesmo Deus. Esta prática nos ensina que nossa devoção pessoal pode ter um impacto evangelístico muito além do que imaginamos.</p>
                      </div>
                    </div>
                  </div>
                )}
                {id === "quarta" && (
                  <div className="mb-6">
                    <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-p:font-sans">
                      <h2 className="text-2xl font-bold mb-4 font-serif">Momento hipertexto</h2>
                      
                      <p><span className="bg-yellow-100 p-1 rounded font-medium">Cada altar levantado por Abrão era um memorial da bondade, do cuidado e da providência divinos. Do mesmo modo, não podemos deixar cair no esquecimento todas as etapas em que Deus nos tem conduzido desde que começou Sua obra em nós.</span> Preste atenção no trecho a seguir:</p>
                      
                      <div className="bg-muted/40 p-5 rounded-lg border-l-4 border-[#a37fb9] mb-6">
                        <blockquote className="not-italic text-slate-700 dark:text-slate-300">
                          <p className="font-serif">"O procedimento de Deus com Seu povo deve ser lembrado frequentemente. Como são frequentes as provas de Sua providência em relação ao Israel antigo! Para que este não esquecesse a história do passado, Deus ordenou a Moisés que pusesse esses acontecimentos em um hino, para que os pais pudessem ensiná-lo aos filhos. Deveriam reunir memórias e conservá-las bem vívidas, para que, quando os filhos perguntassem a respeito, toda a história lhes fosse repetida. Desse modo, o procedimento providencial de Deus para com Seu povo, Sua bondade, misericórdia e Seu cuidado, deveriam ser conservados na lembrança. Somos exortados a lembrar "dos dias anteriores, em que, depois de iluminados, sustentastes grande luta e sofrimentos" (Hb 10:32). "Necessitamos rememorar frequentemente a bondade do Senhor e louvá-Lo por Suas maravilhas"</p>
                          <p className="text-right font-medium">(Ellen G. White, Testemunhos Para a Igreja [CPB, 2021], v. 6, p. 289)</p>
                        </blockquote>
                      </div>
                      
                      <p><span className="bg-yellow-100 p-1 rounded font-medium">Como os versículos a seguir se relacionam com a promessa da aliança de Deus e a resposta de Abrão em Gênesis 12:1-9?</span></p>
                      
                      <div className="mt-4 space-y-4">
                        <div>
                          <h4 className="font-semibold">Os altares de Abrão:</h4>
                          <p>Gn 13:4, 14-18; 22:9-14</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold">A promessa da aliança é repetida:</h4>
                          <p>Gn 15:17-21; 17:1-8</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold">A fé de Abrão:</h4>
                          <p>Rm 4:20</p>
                          <p>Hb 11:8-11</p>
                        </div>
                      </div>
                      
                      <div className="bg-accent/15 p-6 rounded-lg mt-6 border-l-4 border-accent">
                        <h3 className="text-xl font-bold mb-2 font-serif">Nosso resumo</h3>
                        <p>A lição de quarta-feira desenvolve o conceito dos altares de Abraão como memoriais permanentes da bondade e providência divinas. O texto enfatiza a importância de recordar as intervenções de Deus em nossa história, citando como Ellen White destaca que Deus orientou Israel a preservar essas memórias vívidas através de hinos e narrativas transmitidas de geração a geração. A lição nos convida a fazer conexões entre diversas passagens bíblicas - os altares construídos por Abraão em diferentes momentos (Gn 13:4, 14-18; 22:9-14), as repetições da aliança divina (Gn 15:17-21; 17:1-8) e os testemunhos sobre a fé do patriarca (Rm 4:20; Hb 11:8-11). Este exercício de "hipertexto" nos ajuda a perceber como cada altar construído por Abraão estava conectado à promessa original de Gênesis 12:1-9, formando um testemunho contínuo da fidelidade divina através da sua jornada. A lição nos ensina a importância de construir nossos próprios memoriais e de estudar as Escrituras de forma interconectada, reconhecendo os padrões da atuação de Deus.</p>
                      </div>
                    </div>
                  </div>
                )}
                {id === "quinta" && (
                  <div className="mb-6">
                    <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-p:font-sans">
                      <h2 className="text-2xl font-bold mb-4 font-serif">Auxílio divino</h2>
                      
                      <p>Gênesis 13:1-18 confirma que a construção de altares se tornou a marca da vida de Abrão. Diante do crescente conflito entre seus pastores e os de seu sobrinho Ló, Abrão permitiu que Ló escolhesse onde iria morar, concordando em ficar com o que restasse (Gn 13:9). <span className="bg-yellow-100 p-1 rounded font-medium">Quando a questão foi resolvida, Abrão construiu em Manre um altar celebrando a paz que Deus restaurou (v. 18). O altar de Abrão se tornou um memorial de como Deus o havia ajudado.</span></p>
                      
                      <p>Em Gênesis 22, Abraão enfrentou a maior crise de sua vida. O Senhor pediu que ele sacrificasse Isaque – exatamente o filho por meio do qual a promessa se realizaria. Surpreendentemente, Abraão respondeu a esse teste extremo de fé com extrema obediência. Ele construiu um altar e colocou seu filho nele. Quando o anjo do Senhor interrompeu Abraão, <span className="bg-yellow-100 p-1 rounded font-medium">Deus providenciou um carneiro para ser sacrificado no lugar de Isaque (Gn 22:13) – prefigurando Jesus, o Cordeiro de Deus, que daria Sua vida por seres humanos pecadores</span> (Jo 1:29).</p>
                      
                      <p>Abraão chamou o lugar de Yahweh Iré, "O Senhor Proverá" (Gn 22:14), pois Deus havia feito novamente uma provisão miraculosa para ele. Abraão aprendeu a confiar em Deus como seu Ajudador em tempos de terrível crise. O altar no Monte Moriá lembraria Abraão para sempre de como, no momento certo, Deus havia providenciado um sacrifício como substituto para Isaque.</p>
                      
                      <p><span className="bg-yellow-100 p-1 rounded font-medium">Muitas vezes, adoramos a Deus sem realmente pensar em tudo o que Ele fez e está fazendo por nós</span> (Sl 103:2). Uma das melhores maneiras de manter a bondade de Deus sempre em mente é dar um nome ao lugar em que Deus fez algo especial por você. Aqueles que possuem talentos musicais ou poéticos escrevem canções para comemorar a bondade de Deus. Minha mãe, uma excelente cozinheira, prepara pratos saborosos para pessoas necessitadas sempre que Deus a abençoa.</p>
                      
                      <p>Muitas pessoas registram suas experiências com Deus ou testemunham delas a fim de manterem na memória os atos poderosos que Ele realizou em favor delas.</p>
                      
                      <p>Quando verbalizamos nossa gratidão, isso aprofunda a memória da bondade de Deus em nossa própria mente. Os métodos podem variar, mas a chave para desenvolver uma amizade vibrante com Deus é sempre recordar aquilo que Ele fez por nós.</p>
                      
                      <div className="bg-accent/15 p-6 rounded-lg mt-6 border-l-4 border-accent">
                        <h3 className="text-xl font-bold mb-2 font-serif">Nosso resumo</h3>
                        <p>A lição de quinta-feira demonstra como os altares de Abraão serviam como testemunhos da intervenção divina em momentos críticos. Dois episódios marcantes são destacados: o altar em Manre, construído após a resolução pacífica do conflito com Ló, e o altar no Monte Moriá, onde Deus providenciou um carneiro em substituição a Isaque. Este último altar recebeu um nome especial - "Yahweh Iré" (O Senhor Proverá) - marcando para sempre o local onde Deus demonstrou Sua providência nos momentos de maior provação. A lição nos convida a desenvolver práticas pessoais para recordar as intervenções divinas em nossa vida: alguns compõem músicas, outros preparam refeições para os necessitados, muitos registram testemunhos por escrito. O texto enfatiza que, independentemente do método escolhido, verbalizar nossa gratidão aprofunda a memória da bondade de Deus e fortalece nossa amizade com Ele. O carneiro providenciado no Monte Moriá prefigura o sacrifício de Jesus, o Cordeiro de Deus, revelando o padrão divino de provisão e cuidado que continua se manifestando em nossa vida hoje.</p>
                      </div>
                    </div>
                  </div>
                )}
                {id === "sexta" && (
                  <div className="mb-6">
                    <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-p:font-sans">
                      <h2 className="text-2xl font-bold mb-4 font-serif">Amigo de Deus</h2>
                      
                      <div className="bg-muted/40 p-5 rounded-lg border-l-4 border-[#a37fb9] mb-6">
                        <blockquote className="not-italic text-slate-700 dark:text-slate-300">
                          <p className="font-serif"><span className="bg-yellow-100 p-1 rounded font-medium">"A primeira vez que o chamado do Céu veio a Abraão foi enquanto ele morava em 'Ur dos Caldeus' (Gn 11:31). Em obediência a esse chamado, ele se mudou para Harã. Até ali a família de seu pai o acompanhou, pois, juntamente com sua idolatria, participavam do culto ao verdadeiro Deus. E ali Abraão permaneceu até a morte de Terá. Após o sepultamento de seu pai, a voz divina mandou que ele prosseguisse.</span> Seu irmão Naor, com a família, apegaram-se ao seu lar e seus ídolos. Além de Sara, mulher de Abraão, apenas Ló, filho de Harã – falecido muito tempo antes –, preferiu partilhar da vida peregrina do patriarca.</p>
                          
                          <p className="font-serif">Mesmo assim, foi grande a multidão que partiu da Mesopotâmia. Abraão já possuía extensos rebanhos e gado – o que representava riqueza no Oriente – e estava cercado de numeroso grupo de servos e agregados. Estava saindo da terra de seus pais para nunca mais retornar, por isso levou consigo tudo o que tinha, 'todos os bens que haviam adquirido, e as pessoas que lhe acresceram em Harã'. Entre essas pessoas estavam muitos por razões superiores ao trabalho ou interesse particular. Durante sua permanência em Harã, tanto Abraão quanto Sara haviam levado outros à adoração e ao culto ao verdadeiro Deus. [...]</p>
                          
                          <p className="font-serif">O lugar em que se detiveram a princípio foi Siquém. À sombra dos carvalhos de Moré, em um vale extenso, coberto de relva, com seus bosques de oliveiras e fontes a jorrar, entre o monte Ebal de um lado e o monte Gerizim do outro, Abraão montou seu acampamento. O patriarca havia entrado em um ótimo território – 'terra de ribeiros de água, de fontes, de mananciais profundos, que saem dos vales e das montanhas; terra de trigo cevada, de vides, figueiras e romeiras; terra oliveiras, de azeite e mel' (Dt 8:7, 8). No entanto, para o adorador de Jeová, uma densa sombra estava sobre a colina coberta de árvores e fértil planície. 'Nesse tempo os cananeus habitavam essa terra' (Gn 12:6).</p>
                          
                          <p className="font-serif">Abraão atingira o alvo de suas esperanças de encontrar um país ocupado por uma raça estranha, entre a qual estava propagada a idolatria. Os altares dos deuses falsos estavam erigidos nos bosques, e sacrifícios humanos eram oferecidos nos lugares altos que ficavam próximos. Conquanto ele se apegasse à promessa divina, não foi sem angustiantes pressentimentos que armou sua tenda.</p>
                          
                          <p className="font-serif">Então 'apareceu o Senhor a Abrão e lhe disse: Darei à tua descendência esta terra (Gn 12:7). Sua fé se fortaleceu pela certeza de que a presença divina estava com ele, de que não fora abandonado nas mãos dos ímpios. 'Ali edificou Abraão um altar ao Senhor, que lhe aparecera' (Gn 12:7). Como um peregrino, logo se mudou para um local próximo de Betel, e de novo construiu um altar e invocou o nome do Senhor.</p>
                          
                          <p className="font-serif"><span className="bg-yellow-100 p-1 rounded font-medium">Abraão, o amigo de Deus, nos dá um digno exemplo. Sua vida foi uma vida de oração. Onde quer que ele armasse a tenda, junto construía o altar, convocando todos os que faziam parte de seu acampamento para o sacrifício da manhã e da tarde"</span></p>
                          <p className="text-right font-medium">(Ellen G. White, Patriarcas e Profetas [CPB, 2022], p. 97, 98)</p>
                        </blockquote>
                      </div>
                      
                      <div className="mt-4 space-y-3">
                        <h3 className="text-xl font-semibold mb-2">Discuta em classe</h3>
                        <ol className="list-decimal pl-5 space-y-3">
                          <li>Como você pode fortalecer sua conexão pessoal com Deus?</li>
                          <li>O que lhe chama mais a atenção no compromisso de Abraão com a adoração?</li>
                          <li>Que exemplo Abraão estava dando para sua família por meio de sua caminhada devocional com Deus?</li>
                          <li>Quais práticas ajudam você a se lembrar do amor e da bondade de Deus?</li>
                          <li>Como a adoração diária ajuda você a crescer em sua caminhada com Deus?</li>
                        </ol>
                      </div>
                      
                      <div className="bg-accent/15 p-6 rounded-lg mt-6 border-l-4 border-accent">
                        <h3 className="text-xl font-bold mb-2 font-serif">Nosso resumo</h3>
                        <p>A lição de sexta-feira, baseada em trechos de Patriarcas e Profetas, apresenta detalhes significativos da jornada de Abraão desde seu chamado em Ur dos Caldeus até seu estabelecimento em Canaã. O texto destaca três aspectos fundamentais da experiência de Abraão: 1) Sua obediência progressiva ao chamado divino - primeiro a Harã e depois a Canaã, mesmo após a morte de seu pai; 2) Os desafios encontrados na terra prometida - um território fértil, mas habitado pelos cananeus idólatras que praticavam até sacrifícios humanos; 3) Sua constante prática de construir altares e invocar o nome do Senhor. Ellen White enfatiza que Abraão era chamado "amigo de Deus" porque sua vida "foi uma vida de oração" - onde quer que armasse sua tenda, construía um altar para o sacrifício matinal e vespertino, convocando todo seu acampamento para a adoração. As perguntas para discussão nos convidam a refletir sobre como podemos, à semelhança de Abraão, fortalecer nossa conexão pessoal com Deus através de práticas devocionais regulares que influenciam não apenas nossa vida, mas também a de todos ao nosso redor.</p>
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
