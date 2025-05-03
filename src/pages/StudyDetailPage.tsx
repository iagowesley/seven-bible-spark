import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { BookOpenText, ArrowLeft, BookOpen, Calendar, Clock, Hash } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import QuizComponent from "@/components/study/QuizComponent";
import { obterSemana } from "@/models/semanaService";
import { Licao, listarLicoesPorSemana } from "@/models/licaoService";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

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

const StudyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [semana, setSemana] = useState<SemanaDetalhes | null>(null);
  const [licoes, setLicoes] = useState<Licao[]>([]);
  const [diaAtivo, setDiaAtivo] = useState<string>("sabado");
  const [showQuiz, setShowQuiz] = useState(false);
  
  // Questões do quiz - mockadas por enquanto
  const questions = [
    {
      id: "q1",
      text: "Qual é o tema principal abordado na lição desta semana?",
      options: [
        { id: "a", text: "A criação" },
        { id: "b", text: "O amor de Deus" },
        { id: "c", text: "O plano da salvação" },
        { id: "d", text: "Os dez mandamentos" },
      ],
      correctOptionId: "b",
    },
    {
      id: "q2",
      text: "O que a lição de sexta-feira nos ensina?",
      options: [
        { id: "a", text: "Como ser paciente" },
        { id: "b", text: "Como amar os inimigos" },
        { id: "c", text: "Como preparar-se para o sábado" },
        { id: "d", text: "Como pregar o evangelho" },
      ],
      correctOptionId: "c",
    },
    {
      id: "q3",
      text: "Qual dos seguintes versículos foi mencionado na lição de quarta-feira?",
      options: [
        { id: "a", text: "João 3:16" },
        { id: "b", text: "Romanos 8:28" },
        { id: "c", text: "Salmos 23:1" },
        { id: "d", text: "Mateus 5:44" },
      ],
      correctOptionId: "a",
    },
  ];
  
  useEffect(() => {
    const carregarDados = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Buscar detalhes da semana
        const semanaData = await obterSemana(id);
        
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
        
        // Buscar lições da semana
        const licoesData = await listarLicoesPorSemana(id);
        
        if (licoesData.length === 0) {
          setError("Nenhuma lição encontrada para esta semana");
          return;
        }
        
        setLicoes(licoesData);
        
        // Definir o dia ativo como sábado por padrão
        setDiaAtivo("sabado");
        
      } catch (err) {
        console.error("Erro ao carregar detalhes do estudo:", err);
        setError("Não foi possível carregar os detalhes deste estudo");
        
        toast({
          title: "Erro ao carregar estudo",
          description: "Ocorreu um problema ao buscar as informações deste estudo.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    carregarDados();
  }, [id]);

  const handleQuizComplete = (score: number) => {
    const percentage = Math.round((score / questions.length) * 100);
    toast({
      title: `Quiz concluído! Pontuação: ${percentage}%`,
      description: `Você acertou ${score} de ${questions.length} questões.`,
    });
    setShowQuiz(false);
  };

  
  const getLicaoAtiva = () => {
    return licoes.find((licao) => licao.dia === diaAtivo);
  };
  
  const getDiaLabel = (valor: string): string => {
    const dia = diasSemana.find((d) => d.valor === valor);
    return dia ? dia.label : valor;
  };
  
  const voltar = () => {
    navigate("/estudos");
  };
  
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-10 px-4 max-w-4xl">
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  if (error || !semana) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-10 px-4 max-w-4xl">
          <Button variant="ghost" onClick={voltar} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Estudos
          </Button>
          
          <Alert variant="destructive">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error || "Estudo não encontrado"}</AlertDescription>
          </Alert>
        </div>
        <Footer />
      </>
    );
  }
  
  const licaoAtiva = getLicaoAtiva();

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        <Button variant="ghost" onClick={voltar} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Estudos
        </Button>
        
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-grow">
            <h1 className="text-3xl font-bold mb-2">{semana.titulo}</h1>
            <p className="text-lg text-muted-foreground mb-4">{semana.resumo}</p>
            
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center text-sm">
                <BookOpen className="mr-2 h-4 w-4" />
                <span>7 lições</span>
                  </div>
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4" />
                <span>Uma semana de estudo</span>
              </div>
            </div>
          </div>
          
          {semana.img_sabado_url && (
            <div className="w-full md:w-1/3 lg:w-1/4">
              <div className="rounded-lg overflow-hidden border">
                <img
                  src={semana.img_sabado_url}
                  alt={semana.titulo}
                  className="w-full h-auto object-cover"
                      />
                    </div>
                  </div>
                )}
                      </div>
                      
        <Separator className="my-6" />
        
        {showQuiz ? (
          <div>
            <h2 className="text-2xl font-bold mb-6">Quiz da Semana</h2>
            <QuizComponent 
              questions={questions} 
              onComplete={handleQuizComplete} 
              lessonId={semana.id} 
            />
            <Button variant="outline" onClick={() => setShowQuiz(false)} className="mt-6">
              Voltar para as lições
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Lições do dia</h2>
              <Button variant="outline" onClick={() => setShowQuiz(true)}>
                Fazer Quiz da Semana
              </Button>
            </div>
            
            {/* Lição do Sábado - Destacada */}
            {licoes.find(licao => licao.dia === "sabado") && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-[#a37fb9] mb-4">Lição do Sábado</h3>
                <Card className="border border-[#a37fb9]/30">
                  <CardHeader className="border-b border-[#a37fb9]/20 pb-4">
                    <CardTitle className="text-2xl text-[#a37fb9] text-center">
                      {semana.titulo}
                    </CardTitle>
                    <CardDescription className="text-center text-base">
                      {semana.texto_biblico_chave}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-6 px-6 space-y-6">
                    {/* Imagem da capa do sábado */}
                    {semana.img_sabado_url && (
                      <div className="flex items-center justify-center">
                        <div className="relative w-full max-w-2xl h-[300px] overflow-hidden border border-[#a37fb9]/20">
                          <img 
                            src={semana.img_sabado_url} 
                            alt="Imagem da lição do sábado" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Texto Bíblico Chave */}
                    <div className="flex flex-col items-center">
                      <h4 className="text-lg font-medium text-center mb-2">Texto bíblico chave</h4>
                      <div className="bg-[#a37fb9]/10 p-6 border-l-4 border-[#a37fb9] max-w-2xl w-full">
                        <p className="text-base italic text-center">
                          {licoes.find(l => l.dia === "sabado")?.texto_biblico_chave || 
                           licoes.find(l => l.dia === "sabado")?.texto1}
                        </p>
                      </div>
                    </div>
                    
                    {/* Resumo da Lição */}
                    <div className="max-w-2xl mx-auto">
                      <h4 className="text-lg font-medium mb-3">Nosso resumo</h4>
                      <div className="prose max-w-none">
                        <p className="text-base">
                          {licoes.find(l => l.dia === "sabado")?.resumo}
                        </p>
                        {licoes.find(l => l.dia === "sabado")?.texto2 && (
                          <p className="text-base">
                            {licoes.find(l => l.dia === "sabado")?.texto2}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Hashtags */}
                    {licoes.find(l => l.dia === "sabado")?.hashtags && (
                      <div className="flex flex-wrap gap-2 justify-center pt-4">
                        {licoes.find(l => l.dia === "sabado")?.hashtags.split(/\s+/).filter(Boolean).map((tag, index) => (
                          <div
                            key={index}
                            className="bg-muted px-3 py-1 text-sm font-medium"
                          >
                            #{tag}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Tabs para os dias da semana (exceto sábado) */}
            <h3 className="text-xl font-bold mb-4">Dias da Semana</h3>
            <Tabs 
              value={diaAtivo === "sabado" ? "domingo" : diaAtivo} 
              onValueChange={setDiaAtivo} 
              className="w-full"
            >
              <TabsList className="grid grid-cols-6 w-full">
                {licoes
                  .filter(licao => licao.dia !== "sabado")
                  .map((licao) => (
                    <TabsTrigger key={licao.dia} value={licao.dia}>
                      {getDiaLabel(licao.dia).split("-")[0]}
                    </TabsTrigger>
                  ))
                }
              </TabsList>
              
              {licoes
                .filter(licao => licao.dia !== "sabado")
                .map((licao) => (
                  <TabsContent key={licao.dia} value={licao.dia}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <BookOpenText className="mr-2 h-5 w-5" />
                          {getDiaLabel(licao.dia)}
                        </CardTitle>
                        <CardDescription>
                          {licao.resumo}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="font-medium">Texto Principal</div>
                          <div className="text-sm whitespace-pre-line">{licao.texto1}</div>
                        </div>
                        
                        {licao.texto2 && (
                          <div className="space-y-2">
                            <div className="font-medium">Texto Secundário</div>
                            <div className="text-sm whitespace-pre-line">{licao.texto2}</div>
                          </div>
                        )}
                        
                        {licao.hashtags && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Hash className="h-3 w-3 mr-1" />
                            </div>
                            {licao.hashtags.split(/\s+/).filter(Boolean).map((tag, index) => (
                              <div
                                key={index}
                                className="bg-muted px-2 py-1 rounded-md text-xs font-medium"
                              >
                                {tag}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))
              }
            </Tabs>
          </div>
        )}
        </div>
      <Footer />
    </>
  );
};

export default StudyDetailPage;
