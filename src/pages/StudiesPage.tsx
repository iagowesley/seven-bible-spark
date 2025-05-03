import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronRight, AlertTriangle, Sparkles, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { listarTrimestres, Trimestre } from "@/models/trimestreService";
import { obterSemanasDeTrimestre } from "@/models/licaoService";
import { Semana } from "@/models/semanaService";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

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
        <div className="container mx-auto py-16 px-4 max-w-6xl">
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  if (error) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-16 px-4 max-w-6xl">
          <Alert variant="destructive">
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
      <div className="min-h-screen bg-gradient-to-b from-[#f8f4ff] via-white to-[#f8f4ff] dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 relative overflow-hidden">
        {/* Elementos decorativos de fundo */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#a37fb9]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-purple-300/10 rounded-full blur-2xl"></div>
        
        {/* Partículas decorativas */}
        <div className="absolute top-1/4 left-1/4 animate-pulse">
          <Sparkles className="h-6 w-6 text-[#a37fb9]/30" />
        </div>
        <div className="absolute bottom-1/3 right-1/3 animate-bounce animation-delay-1000">
          <Sparkles className="h-5 w-5 text-blue-400/30" />
        </div>
        
        <div className="container mx-auto py-16 px-4 max-w-6xl relative z-10">
          <div className="text-center mb-12 relative">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-20 h-1.5 rounded-full bg-gradient-to-r from-[#a37fb9] to-[#8a63a8]"></div>
            <h1 className="text-5xl font-bold mb-5 text-transparent bg-clip-text bg-gradient-to-r from-[#a37fb9] to-[#8a63a8] inline-block">
              Lições disponíveis
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg">
              Explore nossos estudos bíblicos organizados por trimestre. Cada semana contém 7 lições diárias 
              com resumos para aprofundar seu conhecimento espiritual.
            </p>
            
            <div className="mt-8 flex justify-center gap-4 opacity-70">
              <div className="flex items-center bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
                <Clock className="h-4 w-4 mr-2 text-[#a37fb9]" />
                <span className="text-sm">7 dias de estudo por semana</span>
              </div>
              <div className="flex items-center bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
                <BookOpen className="h-4 w-4 mr-2 text-[#a37fb9]" />
                <span className="text-sm">Conteúdo inspirador</span>
              </div>
            </div>
          </div>
          
          {/* Trimestres */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12 mb-12 justify-items-center">
            {trimestres.map((trimestre) => {
              // Filtrar apenas semanas completas
              const semanasCompletas = trimestre.semanas.filter((semana) => semana.completa);
              
              if (semanasCompletas.length === 0) {
                return null; // Não exibir trimestres sem semanas completas
              }
              
              return (
                <Card 
                  key={trimestre.id} 
                  className="overflow-hidden border border-[#a37fb9]/20 hover:shadow-lg transition-all duration-500 hover:border-[#a37fb9]/40 w-full max-w-sm group hover:translate-y-[-5px] bg-white/70 backdrop-blur-sm dark:bg-gray-900/70"
                >
                  <div className="relative book-cover-container overflow-hidden">
                    {trimestre.img_url ? (
                      <div className="book-wrapper group-hover:scale-105 transition-transform duration-500">
                        <div className="book-spine bg-[#8a63a8]"></div>
                        <div className="book-cover relative">
                          <img 
                            src={trimestre.img_url} 
                            alt={trimestre.nome} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#a37fb9]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                        
                        {/* Meses da lição em formato vertical */}
                        <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 bg-[#8a63a8] text-white text-xs py-2 px-1 rounded-l-md shadow-md origin-center -rotate-90 whitespace-nowrap">
                          {getMesesDeTrimestre(trimestre.trimestre)}
                        </div>
                      </div>
                    ) : (
                      <div className="book-wrapper bg-gradient-to-br from-[#a37fb9]/20 to-purple-400/20 group-hover:scale-105 transition-transform duration-500">
                        <div className="book-spine bg-[#8a63a8]"></div>
                        <div className="book-cover flex items-center justify-center">
                          <BookOpen className="h-16 w-16 text-[#a37fb9] group-hover:scale-110 transition-transform" />
                        </div>
                        
                        {/* Meses da lição em formato vertical para o caso sem imagem */}
                        <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 bg-[#8a63a8] text-white text-xs py-2 px-1 rounded-l-md shadow-md origin-center -rotate-90 whitespace-nowrap">
                          {getMesesDeTrimestre(trimestre.trimestre)}
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute top-4 right-4 bg-[#a37fb9] text-white text-xs px-3 py-1 rounded-full shadow-md">
                      {trimestre.ano} - {trimestre.trimestre}º Trim
                    </div>
                  </div>
                  <CardHeader className="border-b border-[#a37fb9]/10 bg-gradient-to-r from-[#a37fb9]/5 to-transparent">
                    <CardTitle className="text-xl text-[#a37fb9] font-bold">{trimestre.nome}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {semanasCompletas.length} semana(s) de estudo
                    </CardDescription>
                    
                    {/* Link para obter lição física */}
                    <div className="mt-3 pt-3 border-t border-[#a37fb9]/10">
                      <a 
                        href="https://loja-dev.cpb.com.br/produto/5868/comtexto-biblico-jovens-aluno-avulsa-2-trimestre-2025-licao-da-escola-sabatina" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs flex items-center text-[#8a63a8] hover:text-[#a37fb9] transition-colors"
                      >
                        <BookOpen className="h-3 w-3 mr-1" />
                        Obter lição física na CPB
                      </a>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h3 className="font-medium flex items-center text-[#8a63a8]">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Semanas disponíveis:
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        {semanasCompletas.map((semana, index) => (
                          <Link 
                            to={`/estudos/${semana.id}/licao`}
                            key={semana.id}
                            className="flex items-center justify-between p-3.5 bg-gradient-to-r from-[#a37fb9]/5 to-[#a37fb9]/10 hover:from-[#a37fb9]/10 hover:to-[#a37fb9]/20 rounded-md transition-all duration-300 group/link border border-transparent hover:border-[#a37fb9]/20 shadow-sm"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <span className="font-medium text-sm group-hover/link:text-[#8a63a8] transition-colors">
                              Semana {semana.numero}: {semana.titulo}
                            </span>
                            <ChevronRight className="h-4 w-4 text-[#a37fb9] group-hover/link:translate-x-1 transition-transform" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {trimestres.filter(t => t.semanas.some(s => s.completa)).length === 0 && (
            <Alert className="bg-white/80 backdrop-blur-sm shadow-md border-[#a37fb9]/20 max-w-2xl mx-auto">
              <AlertTitle className="font-semibold text-[#a37fb9]">Nenhum estudo disponível</AlertTitle>
              <AlertDescription className="mt-2">
                Não há estudos disponíveis no momento. Por favor, volte mais tarde para novidades.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
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
