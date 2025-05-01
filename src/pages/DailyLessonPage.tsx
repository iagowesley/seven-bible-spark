import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Calendar, BookOpen, CheckSquare, CheckCircle } from "lucide-react";
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
import { obterSemana } from "@/models/semanaService";
import { Licao, listarLicoesPorSemana, obterLicaoPorDiaSemana } from "@/models/licaoService";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getUserProgress, updateUserProgress } from "@/models/userProgress";

const diasSemana = [
  { valor: "domingo", label: "Domingo" },
  { valor: "segunda", label: "Segunda-feira" },
  { valor: "terca", label: "Terça-feira" },
  { valor: "quarta", label: "Quarta-feira" },
  { valor: "quinta", label: "Quinta-feira" },
  { valor: "sexta", label: "Sexta-feira" },
  { valor: "sabado", label: "Sábado" },
];

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
  const [bibleText, setBibleText] = useState<{ reference: string; text: string } | null>(null);
  const [loadingBibleText, setLoadingBibleText] = useState(false);
  
  useEffect(() => {
    const carregarDados = async () => {
      if (!semanaId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Buscar detalhes da semana
        const semanaData = await obterSemana(semanaId);
        
        if (!semanaData) {
          setError("Semana não encontrada");
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
          return;
        }
        
        setLicao(licaoDia);
      } catch (err) {
        console.error("Erro ao carregar detalhes da lição:", err);
        setError("Não foi possível carregar os detalhes desta lição");
        
        toast({
          title: "Erro ao carregar lição",
          description: "Ocorreu um problema ao buscar as informações desta lição.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    carregarDados();
  }, [semanaId, dia]);

  const getDiaLabel = (valor: string): string => {
    const diaInfo = diasSemana.find((d) => d.valor === valor);
    return diaInfo ? diaInfo.label : valor;
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
      
      // Fazer requisição para a API da Bíblia (exemplo: Bible API)
      const response = await fetch(`https://bible-api.com/${cleanReference}?translation=almeida`);
      
      if (!response.ok) {
        throw new Error("Não foi possível carregar o texto bíblico");
      }
      
      const data = await response.json();
      
      setBibleText({
        reference: data.reference,
        text: data.text
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
        text: "Texto bíblico não disponível. Por favor, consulte sua Bíblia."
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
            <Button variant="ghost" onClick={voltar}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Estudos
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{getDiaLabel(dia)}</span>
              <Calendar className="h-4 w-4 text-muted-foreground" />
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
          
          {/* Tirinha do sábado */}
          {semana.img_sabado_url && (
            <div className="w-full my-6 flex justify-center">
              <div className="w-[88%]">
                <img
                  src={semana.img_sabado_url}
                  alt={semana.titulo}
                  className="w-full h-auto object-contain rounded-lg shadow-md"
                />
              </div>
            </div>
          )}
          
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
            <h2 className="text-xl font-bold mb-4 text-[#8a63a8] dark:text-purple-300">Resumo da Semana</h2>
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
          
          {/* Navegação para próximo dia */}
          <div className="mt-8 flex justify-center">
            <Button 
              onClick={() => navigate(`/estudos/${semanaId}/licao/${proximoDiaCadastrado}`)}
              size="default"
              className="bg-[#a37fb9] hover:bg-[#8a63a8] text-white"
            >
              Próxima lição: {getDiaLabel(proximoDiaCadastrado)}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          {/* Modal do texto bíblico */}
          <Dialog open={bibleModalOpen} onOpenChange={setBibleModalOpen}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle className="text-center text-xl text-[#8a63a8]">
                  {bibleText?.reference || "Texto Bíblico"}
                </DialogTitle>
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
          <Button variant="ghost" onClick={navegarParaDiaAnterior} className="text-base">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Dia anterior
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl">{getDiaLabel(dia)}</span>
            <Calendar className="h-5 w-5" />
          </div>
          
          <Button variant="ghost" onClick={navegarParaProximoDia} className="text-base">
            {dia === "sexta" ? (
              <>
                Responder quiz da lição
                <CheckSquare className="ml-2 h-5 w-5" />
              </>
            ) : (
              <>
                Próximo dia
                <ArrowRight className="ml-2 h-5 w-5" />
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

        {/* No final da seção para outros dias (não o sábado), vou adicionar o botão "Lição concluída" */}
        {dia !== "sabado" && (
          <div className="mt-6 flex justify-center">
            <CompleteButton lessonId={dia} />
          </div>
        )}
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