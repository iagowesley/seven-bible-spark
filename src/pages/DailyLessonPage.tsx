import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Calendar, BookOpen, CheckSquare, CheckCircle, Award, Share2, MessageSquare, Send, ChevronLeft, ChevronRight, Volume2, Pause, Highlighter, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { obterSemana } from "@/models/semanaService";
import { Licao, listarLicoesPorSemana, obterLicaoPorDiaSemana } from "@/models/licaoService";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getUserProgress, updateUserProgress } from "@/models/userProgress";
import { verificarConexaoSupabase } from "@/integrations/supabase/client";
import { listarComentarios, adicionarComentario, curtirComentario } from "@/models/comentariosService";
import { verificarQuizRespondido, salvarQuizResultado } from "@/models/quizService";
import QuizAvisoUnico from "@/components/quiz/QuizAvisoUnico";
import QuizResultado from "@/components/quiz/QuizResultado";
import QuizRanking from "@/components/quiz/QuizRanking";
import QuizRankingPage from "@/pages/QuizRankingPage";

// Importando a biblioteca AOS para animações de scroll
import AOS from 'aos';
import 'aos/dist/aos.css';

const diasSemana = [
  { valor: "domingo", label: "Domingo" },
  { valor: "segunda", label: "Segunda-feira" },
  { valor: "terca", label: "Terça-feira" },
  { valor: "quarta", label: "Quarta-feira" },
  { valor: "quinta", label: "Quinta-feira" },
  { valor: "sexta", label: "Sexta-feira" },
  { valor: "sabado", label: "Sábado" },
];

// Função para obter a data formatada para cada dia da semana
const obterDataDoDia = (diaValor: string): string => {
  // Mapear valores de dia para números (0 = domingo, 1 = segunda, etc.)
  const indicesDias: Record<string, number> = {
    "domingo": 0,
    "segunda": 1, 
    "terca": 2,
    "quarta": 3,
    "quinta": 4,
    "sexta": 5,
    "sabado": 6
  };
  
  // Datas fixas para a semana (maio de 2025)
  const datasSemana: Record<string, string> = {
    "sabado": "10/05/2025",
    "domingo": "11/05/2025",
    "segunda": "12/05/2025",
    "terca": "13/05/2025",
    "quarta": "14/05/2025",
    "quinta": "15/05/2025",
    "sexta": "16/05/2025"
  };
  
  // Retorna a data fixa para o dia correspondente
  return datasSemana[diaValor] || "";
};

type SemanaDetalhes = {
  id: string;
  titulo: string;
  texto_biblico_chave: string;
  resumo: string;
  img_sabado_url: string | null;
};

const DailyLessonPage: React.FC = () => {
  const { semanaId, dia = "sabado" } = useParams<{ semanaId: string; dia: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [semana, setSemana] = useState<SemanaDetalhes | null>(null);
  const [licao, setLicao] = useState<Licao | null>(null);
  const [todasLicoes, setTodasLicoes] = useState<Licao[]>([]);
  const [bibleModalOpen, setBibleModalOpen] = useState(false);
  const [bibleText, setBibleText] = useState<{ reference: string; text: string; version: string } | null>(null);
  const [loadingBibleText, setLoadingBibleText] = useState(false);
  const [desafioModalOpen, setDesafioModalOpen] = useState(false);
  const [desafioSemanal, setDesafioSemanal] = useState<{titulo: string; descricao: string; dicas: string[]} | null>(null);
  const [comentarios, setComentarios] = useState<{
    id: string;
    nome: string;
    localidade: string;
    texto: string;
    data_criacao: string;
    curtidas?: number;
    curtido_pelo_usuario?: boolean;
  }[]>([]);
  const [novoComentario, setNovoComentario] = useState({
    nome: '',
    localidade: '',
    texto: ''
  });
  const [carregandoComentarios, setCarregandoComentarios] = useState(false);
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  
  // Estados para o Text-to-Speech
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechUtterance, setSpeechUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Estado para o Highlighter
  const [highlighterActive, setHighlighterActive] = useState(false);
  const [highlightColor, setHighlightColor] = useState('#ffeb3b'); // Amarelo por padrão
  
  // Inicializar AOS (Animate On Scroll)
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      mirror: true,
      offset: 100,
    });
    
    // Atualizar animações AOS quando a página rolar
    const handleScroll = () => {
      AOS.refresh();
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Atualizar AOS quando o conteúdo da página mudar
  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        AOS.refresh();
      }, 200);
    }
  }, [loading, licao, semana]);
  
  // Função para extrair o texto puro da lição para o Text-to-Speech
  const extractTextContent = (): string => {
    if (!licao && !semana) return '';
    
    let textContent = '';
    
    // Adicionar título da lição
    if (licao?.titulo_dia) {
      textContent += `${licao.titulo_dia}. `;
    }
    
    // Adicionar subtítulo
    if (licao?.subtitulo_dia) {
      textContent += `${licao.subtitulo_dia}. `;
    }
    
    // Adicionar texto principal
    if (licao?.texto1) {
      // Remover marcações de formato como **texto** ou ==texto==
      textContent += licao.texto1.replace(/\*\*(.*?)\*\*/g, '$1')
                               .replace(/__([^_]+)__/g, '$1')
                               .replace(/==(.*?)==/g, '$1') + '. ';
    }
    
    if (licao?.texto2) {
      textContent += licao.texto2.replace(/\*\*(.*?)\*\*/g, '$1')
                               .replace(/__([^_]+)__/g, '$1')
                               .replace(/==(.*?)==/g, '$1') + '. ';
    }
    
    // Se for a página de sábado e não tiver licao
    if (dia === 'sabado' && semana && !textContent) {
      textContent = `${semana.titulo}. ${semana.resumo.replace(/\*\*(.*?)\*\*/g, '$1')
                                                  .replace(/__([^_]+)__/g, '$1')
                                                  .replace(/==(.*?)==/g, '$1')}`;
    }
    
    return textContent;
  };
  
  // Função para iniciar/pausar a leitura do texto
  const toggleSpeech = () => {
    if (!window.speechSynthesis) {
      toast({
        title: "Recurso não suportado",
        description: "Seu navegador não suporta o recurso de leitura de texto.",
        variant: "destructive",
      });
      return;
    }
    
    // Se já estiver falando, pausar
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    
    // Iniciar leitura
    const text = extractTextContent();
    if (!text) {
      toast({
        title: "Sem conteúdo para ler",
        description: "Não há texto disponível para leitura.",
        variant: "destructive",
      });
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    // Evento para quando terminar de falar
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    // Evento para erros
    utterance.onerror = (event) => {
      console.error('Erro na síntese de fala:', event);
      setIsSpeaking(false);
      toast({
        title: "Erro na leitura",
        description: "Ocorreu um erro durante a leitura do texto.",
        variant: "destructive",
      });
    };
    
    setSpeechUtterance(utterance);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };
  
  // Limpar a síntese de fala quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  
  // Função para destacar texto selecionado
  const handleTextHighlight = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.toString().trim() === '') return;
    
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.backgroundColor = highlightColor;
    span.style.padding = '0 2px';
    span.style.borderRadius = '2px';
    span.classList.add('highlighted-text');
    
    try {
      range.surroundContents(span);
      // Salvar o highlight na localStorage
      const highlightData = JSON.parse(localStorage.getItem('highlightedTexts') || '[]');
      highlightData.push({
        text: selection.toString(),
        color: highlightColor,
        date: new Date().toISOString(),
        licaoId: `${semanaId}-${dia}`
      });
      localStorage.setItem('highlightedTexts', JSON.stringify(highlightData));
      
      // Limpar a seleção
      selection.removeAllRanges();
      
      toast({
        title: "Texto destacado",
        description: "O texto selecionado foi destacado com sucesso.",
      });
    } catch (e) {
      console.error('Erro ao destacar texto:', e);
      toast({
        title: "Erro ao destacar",
        description: "Não foi possível destacar o texto selecionado.",
        variant: "destructive",
      });
    }
  };
  
  // Alternar o modo highlighter
  const toggleHighlighter = () => {
    setHighlighterActive(!highlighterActive);
    
    toast({
      title: !highlighterActive ? "Marcador ativado" : "Marcador desativado",
      description: !highlighterActive ? "Selecione o texto que deseja destacar." : "Modo de destaque desativado.",
    });
  };
  
  // Escolher a cor do highlighter
  const changeHighlightColor = (color: string) => {
    setHighlightColor(color);
    toast({
      title: "Cor alterada",
      description: "A cor do marcador foi alterada com sucesso.",
    });
  };
  
  // Função para carregar comentários
  const carregarComentarios = async () => {
    if (!semanaId || !dia) return;
    
    try {
      setCarregandoComentarios(true);
      const comentariosData = await listarComentarios(semanaId, dia);
      setComentarios(comentariosData);
    } catch (error) {
      console.error("Erro ao carregar comentários:", error);
    } finally {
      setCarregandoComentarios(false);
    }
  };
  
  // Função para enviar um novo comentário
  const enviarComentario = async () => {
    if (!semanaId || !dia) return;
    if (!novoComentario.nome.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe seu nome para comentar.",
        variant: "destructive",
      });
      return;
    }
    
    if (!novoComentario.localidade.trim()) {
      toast({
        title: "Localidade obrigatória",
        description: "Por favor, informe sua cidade/estado para comentar.",
        variant: "destructive",
      });
      return;
    }
    
    if (!novoComentario.texto.trim()) {
      toast({
        title: "Comentário vazio",
        description: "Por favor, escreva seu comentário antes de enviar.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setEnviandoComentario(true);
      
      await adicionarComentario({
        semana_id: semanaId,
        licao_dia: dia,
        nome: novoComentario.nome,
        localidade: novoComentario.localidade,
        texto: novoComentario.texto,
      });
      
      // Limpar apenas o texto do comentário, mantendo nome e localidade
      setNovoComentario({
        ...novoComentario,
        texto: ''
      });
      
      // Recarregar comentários
      await carregarComentarios();
      
      toast({
        title: "Comentário enviado",
        description: "Seu comentário foi adicionado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
      toast({
        title: "Erro ao enviar comentário",
        description: "Não foi possível enviar seu comentário. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setEnviandoComentario(false);
    }
  };
  
  // Carregar comentários quando a lição mudar
  useEffect(() => {
    if (semanaId && dia && !loading) {
      carregarComentarios();
    }
  }, [semanaId, dia, loading]);
  
  // Função para curtir/descurtir um comentário
  const toggleCurtida = async (comentarioId: string) => {
    try {
      const curtido = await curtirComentario(comentarioId);
      
      // Atualizar o estado local imediatamente para feedback instantâneo
      setComentarios((prevComentarios) => 
        prevComentarios.map((comentario) => {
          if (comentario.id === comentarioId) {
            return {
              ...comentario,
              curtidas: (comentario.curtidas || 0) + (curtido ? 1 : -1),
              curtido_pelo_usuario: curtido
            };
          }
          return comentario;
        })
      );
      
      toast({
        title: curtido ? "Você curtiu este comentário" : "Você removeu sua curtida",
        variant: "default",
      });
    } catch (error) {
      console.error("Erro ao curtir comentário:", error);
      toast({
        title: "Erro ao curtir comentário",
        description: "Não foi possível processar sua curtida. Tente novamente.",
        variant: "destructive",
      });
    }
  };
  
  useEffect(() => {
    const carregarDados = async (tentativas = 0) => {
      if (!semanaId) {
        setLoading(false);
        setError("ID da semana não encontrado. Redirecionando para a página de estudos...");
        // Redireciona para a página de estudos após um breve atraso
        setTimeout(() => {
          navigate("/estudos");
        }, 1500);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Verificar primeiro se a conexão com o Supabase está funcionando
        const conexaoOk = await verificarConexaoSupabase();
        if (!conexaoOk) {
          console.error("Conexão com Supabase indisponível");
          // Se for a última tentativa, mostra o erro
          if (tentativas >= 2) {
            setError("Não foi possível conectar ao banco de dados. Verifique sua conexão com a internet.");
            setLoading(false);
            return;
          }
          
          // Caso contrário, tenta novamente
          setTimeout(() => {
            carregarDados(tentativas + 1);
          }, 1500);
          return;
        }
        
        // Buscar detalhes da semana
        const semanaData = await obterSemana(semanaId);
        
        if (!semanaData) {
          setError("Semana não encontrada");
          setLoading(false);
          // Redireciona para a página de estudos após um breve atraso
          setTimeout(() => {
            navigate("/estudos");
          }, 1500);
          return;
        }
        
        setSemana({
          id: semanaData.id,
          titulo: semanaData.titulo,
          texto_biblico_chave: semanaData.texto_biblico_chave,
          resumo: semanaData.resumo,
          img_sabado_url: semanaData.img_sabado_url,
        });
        
        // Buscar todas as lições da semana
        const licoesData = await listarLicoesPorSemana(semanaId);
        setTodasLicoes(licoesData);
        
        // Buscar lição do dia específico
        const licaoDia = await obterLicaoPorDiaSemana(semanaId, dia);
        
        // Tratamento especial para o sábado: se não existir lição, continua mesmo assim
        if (!licaoDia && dia !== "sabado") {
          setError("Lição não encontrada para este dia");
          setLoading(false);
          return;
        }
        
        setLicao(licaoDia);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao carregar detalhes da lição:", err);
        
        // Se houver erro de conexão e menos de 3 tentativas, tenta novamente
        if (tentativas < 2) {
          console.log(`Tentando reconectar... Tentativa ${tentativas + 1}`);
          // Aguarda 1.5 segundos antes de tentar novamente
          setTimeout(() => {
            carregarDados(tentativas + 1);
          }, 1500);
          return;
        }
        
        setError("Não foi possível carregar os detalhes desta lição. Verifique sua conexão com a internet.");
        setLoading(false);
        
        toast({
          title: "Erro ao carregar lição",
          description: "Ocorreu um problema ao buscar as informações desta lição.",
          variant: "destructive",
        });
      }
    };
    
    carregarDados();
  }, [semanaId, dia, navigate]);

  const getDiaLabel = (valor: string): string => {
    const diaInfo = diasSemana.find((d) => d.valor === valor);
    const dataFormatada = obterDataDoDia(valor);
    return diaInfo ? `${diaInfo.label}(${dataFormatada})` : valor;
  };
  
  const navegarParaProximoDia = () => {
    if (!semanaId) return;
    
    // Encontrar o índice do dia atual
    const diaIndex = diasSemana.findIndex((d) => d.valor === dia);
    
    // Se for o último dia ou não encontrou, voltar para estudos
    if (diaIndex === -1 || diaIndex === diasSemana.length - 1) {
      navigate(`/estudos`);
      return;
    }
    
    // Se for sexta-feira, navegar para o quiz
    if (dia === "sexta") {
      navigate(`/estudos/${semanaId}/quiz`);
      return;
    }
    
    // Caso contrário, ir para o próximo dia
    const proximoDia = diasSemana[diaIndex + 1].valor;
    navigate(`/estudos/${semanaId}/licao/${proximoDia}`);
  };
  
  const navegarParaDiaAnterior = () => {
    if (!semanaId) return;
    
    // Encontrar o índice do dia atual
    const diaIndex = diasSemana.findIndex((d) => d.valor === dia);
    
    // Se for o primeiro dia ou não encontrou, voltar para estudos
    if (diaIndex === -1 || diaIndex === 0) {
      navigate(`/estudos`);
      return;
    }
    
    // Caso contrário, ir para o dia anterior
    const diaAnterior = diasSemana[diaIndex - 1].valor;
    navigate(`/estudos/${semanaId}/licao/${diaAnterior}`);
  };
  
  const voltar = () => {
    navigate("/estudos");
  };
  
  // Função para buscar o texto bíblico da API
  const fetchBibleText = async (reference: string) => {
    try {
      setLoadingBibleText(true);
      
      // Limpar a referência para adequar à API
      const cleanReference = reference.trim().replace(/\s+/g, "+");
      
      // Fazer requisição para a API da Bíblia 
      // Usando a versão Almeida que é suportada pela API
      const response = await fetch(`https://bible-api.com/${cleanReference}?translation=almeida`);
      
      if (!response.ok) {
        throw new Error("Não foi possível carregar o texto bíblico");
      }
      
      const data = await response.json();
      
      setBibleText({
        reference: data.reference,
        text: data.text,
        version: "Almeida Revista e Atualizada" // Versão disponível na API
      });
    } catch (error) {
      console.error("Erro ao buscar texto bíblico:", error);
      toast({
        title: "Erro ao buscar texto bíblico",
        description: "Não foi possível carregar o texto bíblico completo.",
        variant: "destructive",
      });
      
      // Definir um texto genérico em caso de erro
      setBibleText({
        reference: reference,
        text: "Texto bíblico não disponível. Por favor, consulte sua Bíblia.",
        version: "N/A"
      });
    } finally {
      setLoadingBibleText(false);
    }
  };
  
  // Função para abrir o modal com o texto bíblico
  const openBibleModal = (reference: string) => {
    setBibleModalOpen(true);
    fetchBibleText(reference);
  };

  // Função para processar o texto e aplicar destaques
  const processText = (text: string): React.ReactNode => {
    if (!text) return null;
    
    // Processa marcações para textos em negrito usando **texto**
    const boldPattern = /\*\*(.*?)\*\*/g;
    
    // Processa marcações para textos sublinhados usando __texto__
    const underlinePattern = /__([^_]+)__/g;
    
    // Processa marcações para textos com fundo destacado usando ==texto==
    const highlightPattern = /==(.*?)==/g;
    
    // Primeiro substitui marcações de destaque
    let processedText = text
      .replace(highlightPattern, '<span class="bg-yellow-100 dark:bg-yellow-900/30 px-1 py-0.5 rounded">$1</span>')
      .replace(boldPattern, '<strong class="font-semibold">$1</strong>')
      .replace(underlinePattern, '<span class="underline decoration-2 underline-offset-2">$1</span>');
    
    // Divide por parágrafos para melhor formatação
    const paragraphs = processedText.split('\n');
    
    if (paragraphs.length === 1) {
      return <div dangerouslySetInnerHTML={{ __html: processedText }} />;
    }
    
    return (
      <div className="space-y-4">
        {paragraphs.map((paragraph, index) => 
          paragraph ? 
            <div key={index} dangerouslySetInnerHTML={{ __html: paragraph }} /> 
            : <div key={index} className="h-4" />
        )}
      </div>
    );
  };
  
  // Função para gerar um desafio semanal baseado no conteúdo da lição
  const gerarDesafioSemanal = () => {
    if (!semana) return null;
    
    // Desafios baseados no título da lição e no texto bíblico
    const tituloLicao = semana.titulo || "";
    const textoBiblico = semana.texto_biblico_chave || "";
    
    // Estrutura básica do desafio
    const desafio = {
      titulo: `Desafio da semana: ${tituloLicao.split(':')[0]}`,
      descricao: `Com base no estudo desta semana sobre "${tituloLicao}", seu desafio é aplicar os princípios bíblicos estudados na prática. Durante esta semana, dedique-se a viver intencionalmente o que aprendeu.`,
      dicas: [
        "Compartilhe suas reflexões com pelo menos uma pessoa",
        "Faça uma pequena mudança em sua rotina baseada na lição",
        "Memorize o versículo-chave da semana",
        "Ore diariamente sobre como aplicar este princípio"
      ]
    };
    
    // Personaliza o desafio com base no texto bíblico ou título
    if (textoBiblico.toLowerCase().includes("amor")) {
      desafio.dicas.push("Pratique um ato de amor intencional para alguém necessitado");
    } else if (textoBiblico.toLowerCase().includes("fé") || tituloLicao.toLowerCase().includes("fé")) {
      desafio.dicas.push("Identifique uma área onde você precisa exercitar sua fé e dê um passo concreto");
    } else if (tituloLicao.toLowerCase().includes("esperança")) {
      desafio.dicas.push("Escreva uma carta de encorajamento para alguém que esteja passando por dificuldades");
    }
    
    return desafio;
  };
  
  // Função para compartilhar o desafio via WhatsApp
  const compartilharWhatsApp = () => {
    if (!desafioSemanal || !semanaId) return;
    
    const titulo = encodeURIComponent(desafioSemanal.titulo);
    const descricao = encodeURIComponent(desafioSemanal.descricao);
    const link = encodeURIComponent(`${window.location.origin}/estudos/${semanaId}/desafio`);
    
    const mensagem = `*${titulo}*\n\n${descricao}\n\nAcesse o desafio completo: ${link}`;
    
    // Detectar se é dispositivo móvel
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    try {
      if (isMobile) {
        // Para dispositivos móveis usar o esquema URI do WhatsApp
        window.location.href = `whatsapp://send?text=${mensagem}`;
      } else {
        // Para desktop, tentar abrir o compartilhamento nativo se disponível
        if (navigator.share) {
          navigator.share({
            title: desafioSemanal.titulo,
            text: `${desafioSemanal.descricao}\n\nAcesse o desafio completo:`,
            url: `${window.location.origin}/estudos/${semanaId}/desafio`
          }).catch(() => {
            // Fallback se o compartilhamento falhar
            window.open(`https://wa.me/?text=${mensagem}`, '_blank');
          });
        } else {
          // Fallback para navegadores sem API de compartilhamento
          window.open(`https://wa.me/?text=${mensagem}`, '_blank');
        }
      }
      
      toast({
        title: "Preparando compartilhamento",
        description: "O WhatsApp está sendo aberto para compartilhamento.",
      });
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      
      // Última tentativa - copiar para área de transferência
      try {
        navigator.clipboard.writeText(
          `${desafioSemanal.titulo}\n\n${desafioSemanal.descricao}\n\nAcesse o desafio completo: ${window.location.origin}/estudos/${semanaId}/desafio`
        );
        
        toast({
          title: "Link copiado!",
          description: "Texto copiado para a área de transferência. Cole no WhatsApp para compartilhar.",
        });
      } catch (clipboardError) {
        toast({
          title: "Não foi possível compartilhar",
          description: "Tente copiar o link manualmente e compartilhar no WhatsApp.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Função para compartilhar via Facebook
  const compartilharFacebook = () => {
    if (!semanaId) return;
    
    const url = encodeURIComponent(`${window.location.origin}/estudos/${semanaId}/desafio`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    
    toast({
      title: "Compartilhando no Facebook",
      description: "O desafio está sendo compartilhado no Facebook.",
    });
  };
  
  // Função para compartilhar via Twitter/X
  const compartilharTwitter = () => {
    if (!desafioSemanal || !semanaId) return;
    
    const titulo = encodeURIComponent(desafioSemanal.titulo);
    const url = encodeURIComponent(`${window.location.origin}/estudos/${semanaId}/desafio`);
    
    window.open(`https://twitter.com/intent/tweet?text=${titulo}&url=${url}`, '_blank');
    
    toast({
      title: "Compartilhando no Twitter",
      description: "O desafio está sendo compartilhado no Twitter.",
    });
  };
  
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-12 px-4 max-w-5xl">
          <div className="flex flex-col justify-center items-center py-32">
            <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-[#a37fb9] mb-6"></div>
            <p className="text-[#8a63a8] text-lg">Carregando lição...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  if (error || !semana || (!licao && dia !== "sabado")) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-12 px-4 max-w-7xl">
          <Button 
            variant="ghost" 
            onClick={voltar} 
            className="mb-8 hover:bg-[#a37fb9]/10 transition-colors"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Voltar
          </Button>
          
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl p-6 shadow-sm">
            <div className="flex items-start">
              <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-2 mr-4">
                <AlertCircle className="h-6 w-6 text-red-500 dark:text-red-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">Erro</h3>
                <p className="text-red-600 dark:text-red-300">{error || "Lição não encontrada"}</p>
                <Button 
                  className="mt-6 bg-red-600 hover:bg-red-700 text-white"
                  onClick={voltar}
                >
                  Voltar para Estudos
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  // Se for sábado, exibir layout especial
  if (dia === "sabado") {
    // Encontrar o primeiro dia com lição cadastrada para navegação
    const proximoDiaCadastrado = todasLicoes.length > 0 
      ? todasLicoes[0].dia 
      : "domingo";

    return (
      <>
        <Navbar />
        <div className="container mx-auto py-12 px-4 max-w-7xl relative">
          <div className="flex justify-between items-center mb-10">
            <Button variant="ghost" onClick={voltar} className="text-xs sm:text-sm hover:bg-[#a37fb9]/10 transition-colors">
              <ChevronLeft className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
              Voltar
            </Button>
            
            <div className="flex items-center gap-2 bg-[#a37fb9]/10 px-3 py-1.5 rounded-full">
              <span className="text-xs sm:text-sm font-medium text-[#8a63a8]">{getDiaLabel(dia)}</span>
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-[#a37fb9]" />
            </div>
          </div>

          {/* Botão de navegação lateral direita - destaque para o próximo dia */}
          <button 
            onClick={() => navigate(`/estudos/${semanaId}/licao/${proximoDiaCadastrado}`)}
            className="hidden md:flex fixed right-[calc((100%-1400px)/2-28px)] top-1/2 transform -translate-y-1/2 w-14 h-14 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl justify-center items-center hover:bg-[#f8f4ff] dark:hover:bg-gray-700 transition-all z-10"
            aria-label="Próxima lição"
          >
            <ChevronRight className="h-7 w-7 text-[#a37fb9]" />
          </button>

          {/* Botão de navegação lateral esquerda - para o dia anterior */}
          <button 
            onClick={navegarParaDiaAnterior}
            className="hidden md:flex fixed left-[calc((100%-1400px)/2-28px)] top-1/2 transform -translate-y-1/2 w-14 h-14 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl justify-center items-center hover:bg-[#f8f4ff] dark:hover:bg-gray-700 transition-all z-10"
            aria-label="Lição anterior"
          >
            <ChevronLeft className="h-7 w-7 text-[#a37fb9]" />
          </button>

          {/* Cabeçalho com título e texto bíblico chave */}
          <div className="mb-12" data-aos="fade-up">
            <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 text-[#a37fb9] tracking-tight">{semana.titulo}</h1>
            <div className="text-center bg-gradient-to-r from-[#f8f4ff] to-white dark:from-gray-800/60 dark:to-gray-900 py-6 px-8 rounded-2xl border border-[#a37fb9]/20 shadow-sm">
              <h2 className="text-base font-medium text-[#8a63a8] mb-3">Texto bíblico chave</h2>
              <button 
                onClick={() => openBibleModal(semana.texto_biblico_chave || (licao?.texto_biblico_chave || ''))}
                className="text-xl font-serif italic text-[#8a63a8] hover:text-[#a37fb9] hover:underline flex items-center justify-center mx-auto gap-2 transition-colors"
              >
                {semana.texto_biblico_chave || (licao?.texto_biblico_chave || '')}
                <BookOpen className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Botão do Desafio Semanal */}
          <div className="relative w-full my-8 flex justify-center" data-aos="zoom-in" data-aos-delay="200">
            <button
              onClick={() => {
                setDesafioSemanal(gerarDesafioSemanal());
                setDesafioModalOpen(true);
              }}
              className="absolute -top-6 right-4 sm:right-12 md:right-16 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#a37fb9] to-[#8a63a8] shadow-xl flex flex-col items-center justify-center hover:scale-110 transition-all duration-300 z-10 animate-[pulse-beat_8s_infinite]"
              style={{ color: 'white' }}
            >
              <Award className="h-10 w-10 sm:h-12 sm:w-12 mb-1 text-white drop-shadow-md" />
              <span className="text-[10px] sm:text-[12px] font-bold text-white drop-shadow-md">DESAFIO!</span>
            </button>
            
            {/* Estilos para keyframes da animação */}
            <style>{`
              @keyframes pulse-beat {
                0% { transform: scale(1); box-shadow: 0 10px 15px -3px rgba(163, 127, 185, 0.3), 0 4px 6px -4px rgba(163, 127, 185, 0.3); }
                50% { transform: scale(1.1); box-shadow: 0 20px 25px -5px rgba(163, 127, 185, 0.4), 0 8px 10px -6px rgba(163, 127, 185, 0.4); }
                100% { transform: scale(1); box-shadow: 0 10px 15px -3px rgba(163, 127, 185, 0.3), 0 4px 6px -4px rgba(163, 127, 185, 0.3); }
              }
            `}</style>
            
            {/* Tirinha do sábado */}
            {semana.img_sabado_url && (
              <div className="w-full max-w-3xl mx-auto">
                <img
                  src={semana.img_sabado_url}
                  alt={semana.titulo}
                  className="w-full h-auto object-contain rounded-xl shadow-md hover:shadow-lg transition-shadow transform scale-110"
                />
              </div>
            )}
          </div>
          
          {/* Área para anotações - estilo caderno */}
          <div className="my-10" data-aos="fade-up" data-aos-delay="300">
            <div className="mb-3">
              <p className="text-base font-medium text-[#8a63a8]">A partir da tirinha, do texto-chave e do título, anote suas primeiras impressões:</p>
            </div>
            <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 transition-all hover:shadow-md">
              <textarea 
                className="w-full min-h-[120px] bg-[linear-gradient(transparent,transparent_calc(1.5rem_-_1px),#e5e7eb_calc(1.5rem_-_1px),#e5e7eb_1.5rem,transparent_1.5rem)] bg-[size:100%_1.5rem] leading-[1.5rem] pt-0 border-0 outline-none resize-y focus:ring-1 focus:ring-[#a37fb9]" 
                style={{lineHeight: "1.5rem", backgroundAttachment: "local"}}
                placeholder="Digite suas anotações aqui..."
              />
            </div>
          </div>
          
          {/* Título do dia para o sábado, se existir */}
          {licao?.titulo_dia && (
            <div className="my-8 text-center" data-aos="fade-up" data-aos-delay="400">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#8a63a8]">{licao.titulo_dia}</h2>
            </div>
          )}
          
          {/* Resumo */}
          <div className="my-10 bg-gradient-to-br from-[#f8f4ff] to-white dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl border border-[#a37fb9]/20 dark:border-purple-800/30 shadow-sm hover:shadow-md transition-all" data-aos="fade-up" data-aos-delay="500">
            <h2 className="text-xl font-bold mb-6 text-[#8a63a8] dark:text-purple-300 flex items-center">
              <span className="w-8 h-8 rounded-full bg-[#a37fb9] flex items-center justify-center text-white mr-3 shadow-sm">R</span>
              Nosso resumo
            </h2>
            <div className="prose dark:prose-invert max-w-none dark:text-gray-200 leading-relaxed">
              {processText(semana.resumo)}
            </div>
          </div>
          
          {/* Conteúdo da lição, se existir */}
          {licao && (
            <Card className="mt-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
              {/* Barra de ferramentas flutuante */}
              <div className="sticky top-4 z-30 flex justify-end px-4 py-2">
                <div className="bg-white dark:bg-gray-800 rounded-full shadow-md p-1 flex gap-1">
                  {/* Botão Text-to-Speech */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-full h-9 w-9 ${isSpeaking ? 'bg-primary/20 text-primary' : ''}`}
                    onClick={toggleSpeech}
                    title={isSpeaking ? "Pausar leitura" : "Ler texto em voz alta"}
                  >
                    {isSpeaking ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  
                  {/* Botão Highlighter */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-full h-9 w-9 ${highlighterActive ? 'bg-primary/20 text-primary' : ''}`}
                    onClick={toggleHighlighter}
                    title="Destacar texto"
                  >
                    <Highlighter className="h-4 w-4" />
                  </Button>
                  
                  {/* Cores do highlighter - mostrar apenas quando o highlighter estiver ativo */}
                  {highlighterActive && (
                    <div className="flex gap-1 pl-1 items-center">
                      {['#ffeb3b', '#4caf50', '#2196f3', '#f44336', '#9c27b0'].map((color) => (
                        <button
                          key={color}
                          className={`w-5 h-5 rounded-full border-2 ${highlightColor === color ? 'border-black dark:border-white' : 'border-transparent'}`}
                          style={{ backgroundColor: color }}
                          onClick={() => changeHighlightColor(color)}
                          title={`Cor ${color}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <CardContent className="pt-6 px-6">
                <div className="prose max-w-none dark:prose-invert" ref={contentRef} onClick={highlighterActive ? handleTextHighlight : undefined}>
                  {licao.texto1 && (
                    <div className="mb-6" data-aos="fade-up" data-aos-delay="100">
                      <div className="prose dark:prose-invert max-w-none dark:text-gray-200">
                        {processText(licao.texto1)}
                      </div>
                    </div>
                  )}
                  
                  {licao.texto2 && (
                    <div className="mt-6 pt-4 border-t dark:border-gray-700" data-aos="fade-up" data-aos-delay="200">
                      <div className="prose dark:prose-invert max-w-none dark:text-gray-200">
                        {processText(licao.texto2)}
                      </div>
                    </div>
                  )}
                  
                  {/* Hashtags */}
                  {licao.hashtags && (
                    <div className="mt-6 flex flex-wrap gap-2" data-aos="fade-up" data-aos-delay="500">
                      {licao.hashtags.split(' ').map((tag, i) => (
                        <span 
                          key={i} 
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full text-xs font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Botão para marcar como concluído */}
          <div className="mt-8 flex justify-center" data-aos="zoom-in" data-aos-delay="600">
            <CompleteButton lessonId={dia} />
          </div>
          
          {/* Navegação para próximo dia (apenas em dispositivos móveis) */}
          <div className="mt-4 flex justify-center md:hidden" data-aos="fade-up" data-aos-delay="700">
            <Button 
              onClick={() => navigate(`/estudos/${semanaId}/licao/${proximoDiaCadastrado}`)}
              size="default"
              className="bg-[#a37fb9] hover:bg-[#8a63a8] text-white text-base sm:text-lg py-6 px-8 rounded-lg shadow-lg animate-pulse w-full max-w-xs font-bold"
            >
              Próxima: {getDiaLabel(proximoDiaCadastrado).split('(')[0]}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          {/* Seção de comentários */}
          <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#a37fb9] flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Comentários da Comunidade
              </h2>
              
              <div className="text-sm text-gray-500">
                {comentarios.length} {comentarios.length === 1 ? 'comentário' : 'comentários'}
              </div>
            </div>
            
            {/* Lista de comentários */}
            <div className="space-y-6 mb-8">
              {carregandoComentarios ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a37fb9]"></div>
                </div>
              ) : comentarios.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Seja o primeiro a comentar sobre esta lição!</p>
                </div>
              ) : (
                comentarios.map((comentario) => (
                  <div key={comentario.id} className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-[#8a63a8]">{comentario.nome}</div>
                      <div className="text-xs text-gray-500">{new Date(comentario.data_criacao).toLocaleDateString('pt-BR')}</div>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {comentario.localidade}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{comentario.texto}</p>
                    
                    {/* Botão de curtir */}
                    <div className="mt-3 flex items-center">
                      <button 
                        onClick={() => toggleCurtida(comentario.id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                          comentario.curtido_pelo_usuario 
                            ? 'bg-[#a37fb9]/20 text-[#a37fb9]' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        } hover:bg-[#a37fb9]/30 transition-colors`}
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="14" 
                          height="14" 
                          viewBox="0 0 24 24" 
                          fill={comentario.curtido_pelo_usuario ? "#a37fb9" : "none"} 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        <span>{comentario.curtidas || 0}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Formulário de novo comentário */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4 text-[#a37fb9]">Deixe seu comentário</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Seu nome</label>
                    <Input 
                      placeholder="Digite seu nome" 
                      value={novoComentario.nome}
                      onChange={(e) => setNovoComentario({...novoComentario, nome: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">De onde você é</label>
                    <Input 
                      placeholder="Ex: São Paulo/SP" 
                      value={novoComentario.localidade}
                      onChange={(e) => setNovoComentario({...novoComentario, localidade: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium">Seu comentário</label>
                  <Textarea 
                    placeholder="Compartilhe sua reflexão sobre esta lição..." 
                    className="min-h-[100px]"
                    value={novoComentario.texto}
                    onChange={(e) => setNovoComentario({...novoComentario, texto: e.target.value})}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={enviarComentario}
                    disabled={enviandoComentario}
                    className="bg-[#a37fb9] hover:bg-[#8a63a8] text-white"
                  >
                    {enviandoComentario ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Enviar comentário
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Modal do texto bíblico */}
          <Dialog open={bibleModalOpen} onOpenChange={setBibleModalOpen}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] rounded-xl border-[#a37fb9]/20">
              <DialogHeader className="pb-2">
                <DialogTitle className="text-center text-xl font-serif text-[#8a63a8] font-bold">
                  {bibleText?.reference || "Texto Bíblico"}
                </DialogTitle>
                <p className="text-center text-sm text-[#8a63a8]/70 italic">
                  {bibleText?.version || "Almeida Revista e Atualizada"}
                </p>
              </DialogHeader>
              
              <Separator className="my-2 bg-[#a37fb9]/10" />
              
              <div className="py-4 overflow-y-auto max-h-[50vh] px-2">
                {loadingBibleText ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#a37fb9]"></div>
                  </div>
                ) : (
                  <div className="prose prose-lg max-w-none">
                    <div className="prose dark:prose-invert max-w-none dark:text-gray-200 leading-relaxed text-lg font-serif">
                      {processText(bibleText?.text || '')}
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button className="bg-[#a37fb9] hover:bg-[#8a63a8] text-white">Fechar</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Modal do Desafio Semanal */}
          <Dialog open={desafioModalOpen} onOpenChange={setDesafioModalOpen}>
            <DialogContent className="sm:max-w-2xl w-[95%] max-h-[90vh] overflow-y-auto rounded-xl border-[#a37fb9]/20">
              <DialogHeader className="pb-3">
                <DialogTitle className="text-center text-2xl text-[#a37fb9] flex items-center justify-center gap-2 font-bold">
                  <Award className="h-6 w-6" />
                  {desafioSemanal?.titulo || "Desafio da Semana"}
                </DialogTitle>
                <DialogDescription className="text-center mt-1 text-[#8a63a8]/80 text-base">
                  Coloque em prática o que você aprendeu!
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-800 dark:text-gray-200 text-base sm:text-lg leading-relaxed">
                    {desafioSemanal?.descricao}
                  </p>
                  
                  <div className="mt-6 bg-gradient-to-r from-[#f8f4ff] to-white dark:from-gray-800/60 dark:to-gray-900 p-5 sm:p-6 rounded-xl border border-[#a37fb9]/20 dark:border-[#a37fb9]/30 shadow-sm">
                    <h3 className="text-lg sm:text-xl font-bold text-[#a37fb9] dark:text-[#a37fb9] mb-4 flex items-center">
                      <span className="w-8 h-8 rounded-full bg-[#a37fb9] flex items-center justify-center text-white mr-3 shadow-sm text-sm">!</span>
                      Como realizar este desafio:
                    </h3>
                    <ul className="space-y-3">
                      {desafioSemanal?.dicas.map((dica, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm sm:text-base">
                          <span className="text-[#a37fb9] dark:text-[#a37fb9] flex-shrink-0 mt-0.5 text-xl">•</span>
                          <span className="leading-relaxed">{dica}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <p className="text-sm text-[#8a63a8] mb-3">
                      Compartilhe este desafio com seus amigos:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1.5 sm:gap-2 bg-[#a37fb9] hover:bg-[#8a63a8] text-white border-[#8a63a8] text-xs sm:text-sm py-2 px-3 sm:py-2.5 sm:px-4 h-auto shadow-sm hover:shadow transition-all" 
                        onClick={compartilharWhatsApp}
                      >
                        <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        WhatsApp
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1.5 sm:gap-2 bg-[#a37fb9] hover:bg-[#8a63a8] text-white border-[#8a63a8] text-xs sm:text-sm py-2 px-3 sm:py-2.5 sm:px-4 h-auto shadow-sm hover:shadow transition-all" 
                        onClick={compartilharFacebook}
                      >
                        <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Facebook
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1.5 sm:gap-2 bg-[#a37fb9] hover:bg-[#8a63a8] text-white border-[#8a63a8] text-xs sm:text-sm py-2 px-3 sm:py-2.5 sm:px-4 h-auto shadow-sm hover:shadow transition-all" 
                        onClick={compartilharTwitter}
                      >
                        <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Twitter
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 pt-2">
                <Button 
                  onClick={() => setDesafioModalOpen(false)}
                  className="bg-[#a37fb9] hover:bg-[#8a63a8] text-white w-full sm:w-auto shadow-sm hover:shadow transition-all py-2.5 px-6 h-auto text-base"
                >
                  Aceitar Desafio
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <Footer />
      </>
    );
  }
  
  // Layout padrão para outros dias
  return (
    <>
      <Navbar />
      <div className="container mx-auto py-12 px-4 max-w-7xl relative">
        <div className="flex justify-between items-center mb-10">
          <Button 
            variant="ghost" 
            onClick={navegarParaDiaAnterior} 
            className="text-xs sm:text-sm hover:bg-[#a37fb9]/10 transition-colors"
          >
            <ChevronLeft className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="whitespace-nowrap">Anterior</span>
          </Button>
          
          <div className="flex items-center gap-2 bg-[#a37fb9]/10 px-3 py-1.5 rounded-full">
            <span className="font-medium text-xs sm:text-sm text-[#8a63a8]">{getDiaLabel(dia)}</span>
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-[#a37fb9]" />
          </div>
          
          <Button 
            variant="ghost" 
            onClick={navegarParaProximoDia} 
            className="text-xs sm:text-sm hover:bg-[#a37fb9]/10 transition-colors"
          >
            {dia === "sexta" ? (
              <>
                <span className="whitespace-nowrap">Quiz</span>
                <CheckSquare className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
              </>
            ) : (
              <>
                <span className="whitespace-nowrap">Próximo</span>
                <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
              </>
            )}
          </Button>
        </div>
        
        {/* Botões de navegação laterais */}
        <div className="hidden md:block">
          <button 
            onClick={navegarParaDiaAnterior}
            className="fixed left-[calc((100%-1400px)/2-28px)] top-1/2 transform -translate-y-1/2 w-14 h-14 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl flex justify-center items-center hover:bg-[#f8f4ff] dark:hover:bg-gray-700 transition-all z-10"
            aria-label="Lição anterior"
          >
            <ChevronLeft className="h-7 w-7 text-[#a37fb9]" />
          </button>
          
          <button 
            onClick={navegarParaProximoDia}
            className="fixed right-[calc((100%-1400px)/2-28px)] top-1/2 transform -translate-y-1/2 w-14 h-14 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl flex justify-center items-center hover:bg-[#f8f4ff] dark:hover:bg-gray-700 transition-all z-10"
            aria-label={dia === "sexta" ? "Quiz" : "Próxima lição"}
          >
            {dia === "sexta" ? (
              <CheckSquare className="h-7 w-7 text-[#a37fb9]" />
            ) : (
              <ChevronRight className="h-7 w-7 text-[#a37fb9]" />
            )}
          </button>
        </div>
        
        {/* Título e subtítulo do dia */}
        {licao.titulo_dia && (
          <div className="mb-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#8a63a8] mb-2">{licao.titulo_dia}</h2>
            {licao.subtitulo_dia && (
              <p className="text-lg text-[#8a63a8]/80 font-serif italic">{licao.subtitulo_dia}</p>
            )}
          </div>
        )}
        
        {/* Texto bíblico chave se houver */}
        {licao.texto_biblico_chave && (
          <div className="mb-8 text-center bg-gradient-to-r from-[#f8f4ff] to-white dark:from-gray-800/60 dark:to-gray-900 py-5 px-6 rounded-xl border border-[#a37fb9]/20 shadow-sm">
            <h2 className="text-sm font-medium text-[#8a63a8] mb-2">Texto bíblico chave</h2>
            <button 
              onClick={() => openBibleModal(licao.texto_biblico_chave)}
              className="text-lg font-serif italic text-[#8a63a8] hover:text-[#a37fb9] hover:underline flex items-center justify-center mx-auto gap-2 transition-colors"
            >
              {licao.texto_biblico_chave}
              <BookOpen className="h-5 w-5" />
            </button>
          </div>
        )}
        
        {/* Conteúdo da lição */}
        <Card className="mb-8 shadow-sm dark:bg-gray-900 dark:border-gray-800 overflow-hidden rounded-xl border-[#a37fb9]/20">
          {/* Barra de ferramentas flutuante */}
          <div className="sticky top-4 z-30 flex justify-end px-4 py-2">
            <div className="bg-white dark:bg-gray-800 rounded-full shadow-md p-1 flex gap-1">
              {/* Botão Text-to-Speech */}
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full h-9 w-9 ${isSpeaking ? 'bg-[#a37fb9]/20 text-[#a37fb9]' : ''}`}
                onClick={toggleSpeech}
                title={isSpeaking ? "Pausar leitura" : "Ler texto em voz alta"}
              >
                {isSpeaking ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              
              {/* Botão Highlighter */}
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full h-9 w-9 ${highlighterActive ? 'bg-[#a37fb9]/20 text-[#a37fb9]' : ''}`}
                onClick={toggleHighlighter}
                title="Destacar texto"
              >
                <Highlighter className="h-4 w-4" />
              </Button>
              
              {/* Cores do highlighter - mostrar apenas quando o highlighter estiver ativo */}
              {highlighterActive && (
                <div className="flex gap-1 pl-1 items-center">
                  {['#ffeb3b', '#4caf50', '#2196f3', '#f44336', '#9c27b0'].map((color) => (
                    <button
                      key={color}
                      className={`w-5 h-5 rounded-full border-2 ${highlightColor === color ? 'border-black dark:border-white' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => changeHighlightColor(color)}
                      title={`Cor ${color}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <CardContent className="pt-6 px-8">
            <div className="prose max-w-none dark:prose-invert" ref={contentRef} onClick={highlighterActive ? handleTextHighlight : undefined}>
              {licao.texto1 && (
                <div className="mb-8" data-aos="fade-up" data-aos-delay="100">
                  <div className="prose dark:prose-invert max-w-none dark:text-gray-200 leading-relaxed">
                    {processText(licao.texto1)}
                  </div>
                </div>
              )}
              
              {licao.texto2 && (
                <div className="mt-8 pt-6 border-t dark:border-gray-700" data-aos="fade-up" data-aos-delay="200">
                  <div className="prose dark:prose-invert max-w-none dark:text-gray-200 leading-relaxed">
                    {processText(licao.texto2)}
                  </div>
                </div>
              )}

              {/* Perguntas - apenas para dias diferentes de sábado */}
              {licao.perguntas && dia !== "sabado" && (
                <div className="mt-8 p-6 bg-gradient-to-r from-[#f8f4ff] to-white dark:from-gray-800/60 dark:to-gray-900 rounded-xl border border-[#a37fb9]/20 dark:border-purple-800/30 shadow-sm" data-aos="fade-up" data-aos-delay="300">
                  <h3 className="text-lg font-bold mb-4 text-[#8a63a8] dark:text-purple-300 flex items-center">
                    <span className="w-7 h-7 rounded-full bg-[#a37fb9] flex items-center justify-center text-white mr-2 shadow-sm text-sm">?</span>
                    Para refletir
                  </h3>
                  <p className="text-base whitespace-pre-line dark:text-gray-300 leading-relaxed">{licao.perguntas}</p>
                </div>
              )}
              
              {/* Resumo - movido para depois das perguntas */}
              {licao.resumo && (
                <div className="mt-8 p-6 bg-[#f8f4ff] dark:bg-gray-800/50 rounded-xl border border-[#a37fb9]/10 dark:border-gray-700 shadow-sm" data-aos="fade-up" data-aos-delay="400">
                  <h3 className="text-lg font-bold mb-4 text-[#8a63a8] dark:text-gray-200 flex items-center">
                    <span className="w-7 h-7 rounded-full bg-[#a37fb9] flex items-center justify-center text-white mr-2 shadow-sm text-sm">R</span>
                    Resumo
                  </h3>
                  <div className="prose dark:prose-invert max-w-none dark:text-gray-200 leading-relaxed">
                    {processText(licao.resumo)}
                  </div>
                </div>
              )}
              
              {/* Hashtags */}
              {licao.hashtags && (
                <div className="mt-8 flex flex-wrap gap-2" data-aos="fade-up" data-aos-delay="500">
                  {licao.hashtags.split(' ').map((tag, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1.5 bg-[#f8f4ff] dark:bg-gray-800/80 text-[#8a63a8] dark:text-purple-300 rounded-full text-xs font-medium hover:bg-[#a37fb9]/20 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Botão "Lição concluída" para todos os dias */}
        <div className="mt-8 flex justify-center" data-aos="zoom-in" data-aos-delay="300">
          <CompleteButton lessonId={dia} />
        </div>
        
        {/* Navegação para dias anteriores/próximos (apenas em dispositivos móveis) */}
        <div className="mt-6 flex justify-between md:hidden" data-aos="fade-up" data-aos-delay="400">
          <Button 
            onClick={navegarParaDiaAnterior}
            variant="outline"
            className="text-xs sm:text-sm border-[#a37fb9]/30 text-[#8a63a8] hover:bg-[#f8f4ff] transition-colors"
          >
            <ChevronLeft className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
            Anterior
          </Button>
          
          <Button 
            onClick={navegarParaProximoDia}
            className="bg-[#a37fb9] hover:bg-[#8a63a8] text-white text-xs sm:text-sm shadow-sm hover:shadow transition-all"
          >
            {dia === "sexta" ? (
              <>
                Quiz
                <CheckSquare className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
              </>
            )}
          </Button>
        </div>
        
        {/* Seção de comentários - também para dias normais */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-[#a37fb9] flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Comentários da Comunidade
            </h2>
            
            <div className="text-sm text-gray-500 bg-[#f8f4ff] dark:bg-gray-800 px-3 py-1 rounded-full">
              {comentarios.length} {comentarios.length === 1 ? 'comentário' : 'comentários'}
            </div>
          </div>
          
          {/* Lista de comentários */}
          <div className="space-y-6 mb-8">
            {carregandoComentarios ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a37fb9]"></div>
              </div>
            ) : comentarios.length === 0 ? (
              <div className="text-center py-16 text-gray-500 bg-[#f8f4ff]/50 dark:bg-gray-800/20 rounded-xl border border-dashed border-[#a37fb9]/20">
                <p className="text-[#8a63a8]">Seja o primeiro a comentar sobre esta lição!</p>
              </div>
            ) : (
              comentarios.map((comentario) => (
                <div key={comentario.id} className="bg-[#f8f4ff]/50 dark:bg-gray-800/40 p-6 rounded-xl border border-[#a37fb9]/10 hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium text-[#8a63a8] text-lg">{comentario.nome}</div>
                    <div className="text-xs text-gray-500 bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
                      {new Date(comentario.data_criacao).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mb-3 italic">
                    {comentario.localidade}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{comentario.texto}</p>
                  
                  {/* Botão de curtir */}
                  <div className="mt-4 flex items-center">
                    <button 
                      onClick={() => toggleCurtida(comentario.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs ${
                        comentario.curtido_pelo_usuario 
                          ? 'bg-[#a37fb9]/20 text-[#a37fb9]' 
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                      } hover:bg-[#a37fb9]/30 transition-colors shadow-sm`}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="14" 
                        height="14" 
                        viewBox="0 0 24 24" 
                        fill={comentario.curtido_pelo_usuario ? "#a37fb9" : "none"} 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                      <span>{comentario.curtidas || 0}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Formulário de novo comentário */}
          <Card className="border-[#a37fb9]/20 shadow-sm rounded-xl overflow-hidden">
            <CardContent className="pt-6 px-8">
              <h3 className="text-lg font-bold mb-6 text-[#a37fb9] flex items-center">
                <Send className="h-4 w-4 mr-2" />
                Deixe seu comentário
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#8a63a8]">Seu nome</label>
                  <Input 
                    placeholder="Digite seu nome" 
                    value={novoComentario.nome}
                    onChange={(e) => setNovoComentario({...novoComentario, nome: e.target.value})}
                    className="border-[#a37fb9]/20 focus:border-[#a37fb9] focus:ring-[#a37fb9]/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#8a63a8]">De onde você é</label>
                  <Input 
                    placeholder="Ex: São Paulo/SP" 
                    value={novoComentario.localidade}
                    onChange={(e) => setNovoComentario({...novoComentario, localidade: e.target.value})}
                    className="border-[#a37fb9]/20 focus:border-[#a37fb9] focus:ring-[#a37fb9]/20"
                  />
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium text-[#8a63a8]">Seu comentário</label>
                <Textarea 
                  placeholder="Compartilhe sua reflexão sobre esta lição..." 
                  className="min-h-[120px] border-[#a37fb9]/20 focus:border-[#a37fb9] focus:ring-[#a37fb9]/20"
                  value={novoComentario.texto}
                  onChange={(e) => setNovoComentario({...novoComentario, texto: e.target.value})}
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={enviarComentario}
                  disabled={enviandoComentario}
                  className="bg-[#a37fb9] hover:bg-[#8a63a8] text-white shadow-sm hover:shadow transition-all"
                >
                  {enviandoComentario ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Enviar comentário
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

// Adicione o componente CompleteButton antes da linha export default DailyLessonPage;

// Componente para marcar a lição como concluída
const CompleteButton: React.FC<{ lessonId: string }> = ({ lessonId }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Buscar status atual de conclusão
  useEffect(() => {
    const checkCompletionStatus = async () => {
      setIsLoading(true);
      try {
        const progressData = await getUserProgress();
        const lesson = progressData.find((p) => p.lesson_id === lessonId);
        setIsCompleted(lesson?.completed || false);
      } catch (error) {
        console.error("Erro ao verificar status de conclusão:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkCompletionStatus();
  }, [lessonId]);
  
  // Função para alternar status de conclusão
  const toggleCompletion = async () => {
    setIsLoading(true);
    try {
      // Atualizar progresso - 100% se marcado como concluído, 50% se desmarcado
      await updateUserProgress(
        'anonymous-user',
        lessonId,
        isCompleted ? 50 : 100,
        !isCompleted,
        !isCompleted ? 10 : 0
      );
      setIsCompleted(!isCompleted);
      
      toast({
        title: !isCompleted ? "Lição concluída!" : "Lição marcada como não concluída",
        description: !isCompleted 
          ? "Seu progresso foi salvo e atualizado na dashboard." 
          : "O status da lição foi atualizado.",
        variant: "default",
      });
    } catch (error) {
      console.error("Erro ao atualizar status de conclusão:", error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível salvar seu progresso. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      onClick={toggleCompletion}
      disabled={isLoading}
      variant={isCompleted ? "outline" : "default"}
      className={`flex items-center gap-2 transition-all px-6 py-2 h-auto ${
        isCompleted 
          ? "border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10" 
          : "bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow"
      }`}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      ) : isCompleted ? (
        <>
          <CheckCircle className="h-5 w-5" /> Lição concluída
        </>
      ) : (
        "Marcar como concluída"
      )}
    </Button>
  );
};

export default DailyLessonPage; 