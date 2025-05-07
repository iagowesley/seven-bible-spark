import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronRight, AlertTriangle, Clock, BookMarked } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { listarTrimestres, Trimestre } from "@/models/trimestreService";
import { obterSemanasDeTrimestre } from "@/models/licaoService";
import { Semana } from "@/models/semanaService";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Interfaces
type SemanaComStatus = {
  id: string;
  titulo: string;
  completa: boolean;
  numero: number;
};

type TrimestreComSemanas = Trimestre & {
  semanas: SemanaComStatus[];
};

const StudiesPage: React.FC = () => {
  const [trimestres, setTrimestres] = useState<TrimestreComSemanas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar todos os trimestres
      const trimestresList = await listarTrimestres();
      
      // Para cada trimestre, buscar as semanas que têm lições completas
      const trimestresComSemanas = await Promise.all(
        trimestresList.map(async (trimestre) => {
          const semanas = await obterSemanasDeTrimestre(trimestre.id);
          // Adicionar a propriedade numero para as semanas que não têm
          const semanasComNumero = semanas.map(semana => ({
            ...semana,
            numero: semana.numero || 0
          }));
          return {
            ...trimestre,
            semanas: semanasComNumero,
          };
        })
      );
      
      setTrimestres(trimestresComSemanas);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Não foi possível carregar os estudos. Tente novamente mais tarde.");
      toast({
        title: "Erro ao carregar estudos",
        description: "Ocorreu um problema ao buscar os estudos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    carregarDados();
  }, []);
  
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a37fb9]"></div>
        </div>
        <Footer />
      </>
    );
  }
  
  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
          <Alert variant="destructive" className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        {/* Cabeçalho */}
        <section className="w-full py-24 bg-white dark:bg-neutral-800">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="flex flex-col items-center text-center space-y-6">
              <Badge className="bg-[#a37fb9] hover:bg-[#a37fb9]/90 text-white px-3 py-1 text-xs">
                Estudos Bíblicos
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-serif font-medium text-neutral-900 dark:text-white max-w-2xl leading-tight">
                Lições <span className="text-[#a37fb9]">disponíveis</span>
              </h1>
              
              <p className="text-neutral-600 dark:text-neutral-300 max-w-xl text-lg font-light leading-relaxed">
                Explore nossos estudos bíblicos organizados por trimestre. Cada semana contém 7 lições diárias 
                para aprofundar seu conhecimento espiritual.
              </p>
              
              <Separator className="w-12 bg-[#a37fb9] h-0.5 mt-4" />
              
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <Clock className="h-4 w-4 text-[#a37fb9]" />
                  <span>7 dias de estudo por semana</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <BookOpen className="h-4 w-4 text-[#a37fb9]" />
                  <span>Conteúdo inspirador</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Lista de trimestres */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {trimestres.map((trimestre) => {
                // Filtrar apenas semanas completas
                const semanasCompletas = trimestre.semanas.filter((semana) => semana.completa);
                
                if (semanasCompletas.length === 0) {
                  return null; // Não exibir trimestres sem semanas completas
                }
                
                return (
                  <div key={trimestre.id} className="flex flex-col">
                    {/* Card no formato de livro */}
                    <div className="book-card relative mx-auto">
                      {/* Sombra do livro */}
                      <div className="absolute -right-2 top-2 bottom-4 w-[calc(100%-10px)] bg-black/20 rounded-r-sm dark:bg-black/40 z-0"></div>
                      
                      {/* Livro */}
                      <div className="book relative bg-white dark:bg-neutral-800 shadow-md hover:shadow-lg transition-all duration-500 rounded-sm z-10 overflow-hidden transform hover:-translate-y-1 hover:translate-x-1">
                        {/* Lombada do livro */}
                        <div className="absolute left-0 top-0 bottom-0 w-[12px] bg-[#a37fb9] dark:bg-[#8a63a8] rounded-l-sm shadow-inner z-20">
                          <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-white/10"></div>
                        </div>
                        
                        {/* Capa do livro */}
                        <div className="ml-[12px]">
                          <div className="aspect-[3/4] relative overflow-hidden">
                            {trimestre.img_url ? (
                              <img 
                                src={trimestre.img_url} 
                                alt={trimestre.nome} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#a37fb9]/20 to-[#a37fb9]/5">
                                <BookMarked className="h-16 w-16 text-[#a37fb9]/60" />
                              </div>
                            )}
                            
                            {/* Overlay para garantir que o texto seja legível */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30"></div>
                            
                            {/* Badge do trimestre */}
                            <div className="absolute top-3 right-3">
                              <Badge className="bg-[#a37fb9] shadow-md">
                                {trimestre.ano} - {trimestre.trimestre}º Trim
                              </Badge>
                            </div>
                            
                            {/* Título do livro */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                              <h2 className="text-white font-bold text-lg leading-tight shadow-text">
                                {trimestre.nome}
                              </h2>
                              <p className="text-white/90 text-xs mt-1 font-medium shadow-text">
                                {getMesesDeTrimestre(trimestre.trimestre)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Conteúdo do trimestre */}
                    <Card className="mt-4 bg-white dark:bg-neutral-800 border-none shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-neutral-900 dark:text-white">{trimestre.nome}</CardTitle>
                        <CardDescription className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                          <BookOpen className="h-3.5 w-3.5" />
                          {semanasCompletas.length} semana(s) de estudo
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <Separator className="bg-neutral-200 dark:bg-neutral-700" />
                        
                        <div className="space-y-3">
                          <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                            Semanas disponíveis:
                          </h3>
                          
                          <div className="space-y-2">
                            {semanasCompletas.map((semana) => (
                              <Link 
                                to={`/estudos/${semana.id}/licao`}
                                key={semana.id}
                                className="group flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-md hover:bg-[#a37fb9]/10 transition-colors"
                              >
                                <span className="text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-[#a37fb9] transition-colors">
                                  Semana {semana.numero}: {semana.titulo}
                                </span>
                                <ChevronRight className="h-4 w-4 text-neutral-400 dark:text-neutral-500 group-hover:text-[#a37fb9] group-hover:translate-x-1 transition-all" />
                              </Link>
                            ))}
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <a 
                            href="https://loja-dev.cpb.com.br/produto/5868/comtexto-biblico-jovens-aluno-avulsa-2-trimestre-2025-licao-da-escola-sabatina" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs flex items-center text-[#a37fb9] hover:underline"
                          >
                            <BookOpen className="h-3 w-3 mr-1" />
                            Obter lição física na CPB
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
            
            {trimestres.filter(t => t.semanas.some(s => s.completa)).length === 0 && (
              <div className="mt-12">
                <Alert className="max-w-lg mx-auto bg-white dark:bg-neutral-800 border-[#a37fb9]/20">
                  <AlertTitle className="font-medium text-[#a37fb9]">Nenhum estudo disponível</AlertTitle>
                  <AlertDescription className="text-neutral-600 dark:text-neutral-400">
                    Não há estudos disponíveis no momento. Por favor, volte mais tarde para novidades.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

// Adicionar função para determinar os meses do trimestre
const getMesesDeTrimestre = (trimestre: string): string => {
  switch (trimestre) {
    case "1":
      return "Janeiro - Fevereiro - Março";
    case "2":
      return "Abril - Maio - Junho";
    case "3":
      return "Julho - Agosto - Setembro";
    case "4":
      return "Outubro - Novembro - Dezembro";
    default:
      return "";
  }
};

export default StudiesPage;
