import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Calendar, BookOpen, CheckSquare, CheckCircle, Award, Share2, MessageSquare, Send } from "lucide-react";
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
import { listarComentarios, adicionarComentario } from "@/models/comentariosService";

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
    "sabado": "03/05/2025",
    "domingo": "04/05/2025",
    "segunda": "05/05/2025",
    "terca": "06/05/2025",
    "quarta": "07/05/2025",
    "quinta": "08/05/2025",
    "sexta": "09/05/2025"
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
  }[]>([]);
  const [novoComentario, setNovoComentario] = useState({
    nome: '',
    localidade: '',
    texto: ''
  });
  const [carregandoComentarios, setCarregandoComentarios] = useState(false);
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  
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
    
    // Abrir WhatsApp em nova aba
    window.open(`https://wa.me/?text=${mensagem}`, '_blank');
    
    toast({
      title: "Link compartilhado",
      description: "O desafio foi aberto no WhatsApp para compartilhamento.",
    });
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
        <div className="container mx-auto py-10 px-4 max-w-6xl">
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
        <div className="container mx-auto py-10 px-4 max-w-6xl">
          <Button variant="ghost" onClick={voltar} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Estudos
          </Button>
          
          <Alert variant="destructive">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error || "Lição não encontrada"}</AlertDescription>
          </Alert>
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
        <div className="container mx-auto py-10 px-4 max-w-6xl">
          <div className="flex justify-between items-center mb-6">
            <Button variant="ghost" onClick={voltar} className="text-xs sm:text-sm">
              <ArrowLeft className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
              Voltar
            </Button>
            
            <div className="flex items-center gap-1">
              <span className="text-xs sm:text-sm text-muted-foreground">{getDiaLabel(dia)}</span>
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Cabeçalho com título e texto bíblico chave */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-center text-[#a37fb9] mb-4">{semana.titulo}</h1>
            <div className="text-center bg-[#a37fb9]/10 py-4 px-6 rounded-lg border border-[#a37fb9]/20">
              <h2 className="text-base font-medium text-[#a37fb9] mb-2">Texto bíblico chave</h2>
              <button 
                onClick={() => openBibleModal(semana.texto_biblico_chave || (licao?.texto_biblico_chave || ''))}
                className="text-lg font-serif italic text-[#8a63a8] hover:underline flex items-center justify-center mx-auto gap-1"
              >
                {semana.texto_biblico_chave || (licao?.texto_biblico_chave || '')}
                <BookOpen className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Botão do Desafio Semanal */}
          <div className="relative w-full my-6 flex justify-center">
            <button
              onClick={() => {
                setDesafioSemanal(gerarDesafioSemanal());
                setDesafioModalOpen(true);
              }}
              className="absolute -top-6 right-4 sm:right-12 md:right-16 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#a37fb9] to-[#8a63a8] shadow-lg flex flex-col items-center justify-center hover:scale-110 transition-all duration-300 z-10 animate-[pulse-beat_2s_infinite]"
              style={{ color: 'white' }}
            >
              <Award className="h-6 w-6 sm:h-8 sm:w-8 mb-1 text-white" />
              <span className="text-[10px] sm:text-xs font-bold text-white">DESAFIO!</span>
            </button>
            
            {/* Estilos para keyframes da animação */}
            <style>{`
              @keyframes pulse-beat {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
              }
            `}</style>
            
            {/* Tirinha do sábado */}
            {semana.img_sabado_url && (
              <div className="w-[88%]">
                <img
                  src={semana.img_sabado_url}
                  alt={semana.titulo}
                  className="w-full h-auto object-contain rounded-lg shadow-md"
                />
              </div>
            )}
          </div>
          
          {/* Área para anotações - estilo caderno */}
          <div className="my-6">
            <div className="mb-2">
              <p className="text-base font-medium text-[#8a63a8]">A partir da tirinha, do texto-chave e do título, anote suas primeiras impressões sobre o que trata a lição:</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-md shadow-sm p-4">
              <textarea 
                className="w-full min-h-[80px] bg-[linear-gradient(transparent,transparent_calc(1.5rem_-_1px),#e5e7eb_calc(1.5rem_-_1px),#e5e7eb_1.5rem,transparent_1.5rem)] bg-[size:100%_1.5rem] leading-[1.5rem] pt-0 border-0 outline-none resize-y" 
                style={{lineHeight: "1.5rem", backgroundAttachment: "local"}}
                placeholder="Digite suas anotações aqui..."
              />
            </div>
          </div>
          
          {/* Título do dia para o sábado, se existir */}
          {licao?.titulo_dia && (
            <div className="my-6 text-center">
              <h2 className="text-2xl font-bold text-[#8a63a8]">{licao.titulo_dia}</h2>
            </div>
          )}
          
          {/* Resumo */}
          <div className="my-6 bg-gradient-to-br from-[#f8f4ff] to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-[#a37fb9]/20 dark:border-purple-800/30 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-[#8a63a8] dark:text-purple-300">Nosso resumo</h2>
            <div className="prose dark:prose-invert max-w-none dark:text-gray-200">
              {processText(semana.resumo)}
            </div>
          </div>
          
          {/* Conteúdo da lição, se existir */}
          {licao && (
            <Card className="mt-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="pt-6 px-6">
                <div className="prose max-w-none dark:prose-invert">
                  {licao.texto1 && (
                    <div className="mb-6">
                      <div className="prose dark:prose-invert max-w-none dark:text-gray-200">
                        {processText(licao.texto1)}
                      </div>
                    </div>
                  )}
                  
                  {licao.texto2 && (
                    <div className="mt-6 pt-4 border-t dark:border-gray-700">
                      <div className="prose dark:prose-invert max-w-none dark:text-gray-200">
                        {processText(licao.texto2)}
                      </div>
                    </div>
                  )}
                  
                  {/* Hashtags */}
                  {licao.hashtags && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {licao.hashtags.split(' ').map((tag, i) => (
                        <span 
                          key={i} 
                          className="px-3 py-1 bg-[#a37fb9]/10 dark:bg-purple-900/40 text-[#a37fb9] dark:text-purple-300 rounded-full text-xs font-medium"
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
          <div className="mt-8 flex justify-center">
            <CompleteButton lessonId={dia} />
          </div>
          
          {/* Navegação para próximo dia */}
          <div className="mt-4 flex justify-center">
            <Button 
              onClick={() => navigate(`/estudos/${semanaId}/licao/${proximoDiaCadastrado}`)}
              size="default"
              className="bg-[#a37fb9] hover:bg-[#8a63a8] text-white text-xs sm:text-sm"
            >
              Próxima: {getDiaLabel(proximoDiaCadastrado).split('(')[0]}
              <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
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
            <DialogContent className="sm:max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle className="text-center text-xl text-[#8a63a8]">
                  {bibleText?.reference || "Texto Bíblico"}
                </DialogTitle>
                <p className="text-center text-sm text-muted-foreground">
                  {bibleText?.version || "Almeida Revista e Atualizada"}
                </p>
              </DialogHeader>
              
              <div className="py-4 overflow-y-auto max-h-[50vh]">
                {loadingBibleText ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="prose prose-lg max-w-none">
                    <div className="prose dark:prose-invert max-w-none dark:text-gray-200">
                      {processText(bibleText?.text || '')}
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Fechar</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Modal do Desafio Semanal */}
          <Dialog open={desafioModalOpen} onOpenChange={setDesafioModalOpen}>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-center text-xl text-[#a37fb9] flex items-center justify-center gap-2">
                  <Award className="h-5 w-5" />
                  {desafioSemanal?.titulo || "Desafio da Semana"}
                </DialogTitle>
                <DialogDescription className="text-center mt-1">
                  Coloque em prática o que você aprendeu!
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-800 dark:text-gray-200">
                    {desafioSemanal?.descricao}
                  </p>
                  
                  <div className="mt-4 bg-[#f8f4ff] dark:bg-[#a37fb9]/10 p-4 rounded-lg border border-[#a37fb9]/20 dark:border-[#a37fb9]/30">
                    <h3 className="text-lg font-bold text-[#a37fb9] dark:text-[#a37fb9] mb-2">Como realizar este desafio:</h3>
                    <ul className="space-y-2">
                      {desafioSemanal?.dicas.map((dica, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-[#a37fb9] dark:text-[#a37fb9] flex-shrink-0 mt-1">•</span>
                          <span>{dica}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Compartilhe este desafio com seus amigos:
                    </p>
                    <div className="flex justify-center gap-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1.5 bg-[#a37fb9] hover:bg-[#8a63a8] text-white border-[#8a63a8]" 
                        onClick={compartilharWhatsApp}
                      >
                        <Share2 className="h-4 w-4" />
                        WhatsApp
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1.5 bg-[#a37fb9] hover:bg-[#8a63a8] text-white border-[#8a63a8]" 
                        onClick={compartilharFacebook}
                      >
                        <Share2 className="h-4 w-4" />
                        Facebook
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1.5 bg-[#a37fb9] hover:bg-[#8a63a8] text-white border-[#8a63a8]" 
                        onClick={compartilharTwitter}
                      >
                        <Share2 className="h-4 w-4" />
                        Twitter
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Fechar</Button>
                </DialogClose>
                <Button 
                  onClick={() => setDesafioModalOpen(false)}
                  className="bg-[#a37fb9] hover:bg-[#8a63a8] text-white"
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
      <div className="container mx-auto py-10 px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={navegarParaDiaAnterior} className="text-xs sm:text-sm">
            <ArrowLeft className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="whitespace-nowrap">Anterior</span>
          </Button>
          
          <div className="flex items-center gap-1">
            <span className="font-bold text-xs sm:text-base">{getDiaLabel(dia)}</span>
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
          </div>
          
          <Button variant="ghost" onClick={navegarParaProximoDia} className="text-xs sm:text-sm">
            {dia === "sexta" ? (
              <>
                <span className="whitespace-nowrap">Quiz</span>
                <CheckSquare className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
              </>
            ) : (
              <>
                <span className="whitespace-nowrap">Próximo</span>
                <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
              </>
            )}
          </Button>
        </div>
        
        {/* Título e subtítulo do dia */}
        {licao.titulo_dia && (
          <div className="mb-6 border-b pb-3">
            <h2 className="text-2xl font-bold text-[#8a63a8] mb-1">{licao.titulo_dia}</h2>
            {licao.subtitulo_dia && (
              <p className="text-lg text-[#8a63a8]/80 font-serif">{licao.subtitulo_dia}</p>
            )}
          </div>
        )}
        
        {/* Conteúdo da lição */}
        <Card className="mb-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="pt-5 px-6">
            <div className="prose max-w-none dark:prose-invert">
              {licao.texto1 && (
                <div className="mb-6">
                  <div className="prose dark:prose-invert max-w-none mb-6 dark:text-gray-200">
                    {processText(licao.texto1)}
                  </div>
                </div>
              )}
              
              {licao.texto2 && (
                <div className="mt-6 pt-4 border-t dark:border-gray-700">
                  <div className="prose dark:prose-invert max-w-none dark:text-gray-200">
                    {processText(licao.texto2)}
                  </div>
                </div>
              )}

              {/* Perguntas - apenas para dias diferentes de sábado */}
              {licao.perguntas && dia !== "sabado" && (
                <div className="mt-6 p-4 bg-[#a37fb9]/5 dark:bg-purple-900/20 rounded-lg border border-[#a37fb9]/20 dark:border-purple-800/30">
                  <h3 className="text-lg font-bold mb-3 text-[#8a63a8] dark:text-purple-300">Para refletir</h3>
                  <p className="text-base whitespace-pre-line dark:text-gray-300">{licao.perguntas}</p>
                </div>
              )}
              
              {/* Resumo - movido para depois das perguntas */}
              {licao.resumo && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                  <h3 className="text-lg font-bold mb-3 dark:text-gray-200">Resumo</h3>
                  <div className="prose dark:prose-invert max-w-none dark:text-gray-200">
                    {processText(licao.resumo)}
                  </div>
                </div>
              )}
              
              {/* Hashtags */}
              {licao.hashtags && (
                <div className="mt-6 flex flex-wrap gap-2">
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

        {/* Botão "Lição concluída" para todos os dias */}
        <div className="mt-6 flex justify-center">
          <CompleteButton lessonId={dia} />
        </div>
        
        {/* Seção de comentários - também para dias normais */}
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
      className={`flex items-center gap-2 transition-all ${
        isCompleted 
          ? "border-green-500 text-green-600" 
          : "bg-green-600 hover:bg-green-700 text-white"
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