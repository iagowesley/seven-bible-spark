import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronRight, AlertTriangle, Clock, BookMarked } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { listarTrimestres, Trimestre } from "@/models/trimestreService";
import { obterSemanasDeTrimestre_ComAlgumaLicao } from "@/models/licaoService";
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
      
      // Para cada trimestre, buscar as semanas que têm pelo menos uma lição
      const trimestresComSemanas = await Promise.all(
        trimestresList.map(async (trimestre) => {
          const semanas = await obterSemanasDeTrimestre_ComAlgumaLicao(trimestre.id);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#337945]"></div>
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
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="flex flex-col items-center text-center space-y-6">
              <Badge className="bg-[#337945] hover:bg-[#337945]/90 text-white px-3 py-1 text-xs">
                Estudos Bíblicos
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-serif font-medium text-neutral-900 dark:text-white max-w-2xl leading-tight">
                Lições <span className="text-[#337945]">disponíveis</span>
              </h1>
              
              <p className="text-neutral-600 dark:text-neutral-300 max-w-xl text-lg font-light leading-relaxed">
                Explore nossos estudos bíblicos organizados por trimestre. Cada semana contém 7 lições diárias 
                para aprofundar seu conhecimento espiritual.
              </p>
              
              <Separator className="w-12 bg-[#337945] h-0.5 mt-4" />
              
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <Clock className="h-4 w-4 text-[#337945]" />
                  <span>7 dias de estudo por semana</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <BookOpen className="h-4 w-4 text-[#337945]" />
                  <span>Conteúdo inspirador</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Lista de trimestres */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
              {trimestres.map((trimestre) => {
                // Filtrar apenas semanas que têm pelo menos uma lição
                const semanasComLicoes = trimestre.semanas.filter((semana) => semana.completa);
                
                if (semanasComLicoes.length === 0) {
                  return null; // Não exibir trimestres sem semanas com lições
                }
                
                return (
                  <div key={trimestre.id} className="flex flex-col">
                    {/* Card no formato de livro */}
                    <div className="book-card relative mx-auto">
                      {/* Badge do trimestre */}
                      <div className="mb-2 text-center">
                        <Badge className="bg-[#337945] shadow-md">
                          {trimestre.ano} - {trimestre.trimestre}º Trim
                        </Badge>
                      </div>
                      
                      {/* Imagem da lição */}
                      <div className="aspect-[3/4] overflow-hidden shadow-md">
                        <Link to={`/trimestre/${trimestre.id}/semanas`}>
                          {trimestre.img_url ? (
                            <img 
                              src={trimestre.img_url} 
                              alt={trimestre.nome} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
                              <BookMarked className="h-16 w-16 text-[#337945]/60" />
                            </div>
                          )}
                        </Link>
                      </div>
                    </div>
                    
                    {/* Conteúdo do trimestre */}
                    <Card className="mt-4 bg-white dark:bg-neutral-800 border-none shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl font-bold text-[#337945] dark:text-[#337945]">{trimestre.nome}</CardTitle>
                        <CardDescription className="text-neutral-600 dark:text-neutral-400 text-sm">
                          {getMesesDeTrimestre(trimestre.trimestre)}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <Separator className="bg-neutral-200 dark:bg-neutral-700" />
                        
                        <div className="pt-2">
                          <a 
                            href="https://loja-dev.cpb.com.br/produto/5868/comtexto-biblico-jovens-aluno-avulsa-2-trimestre-2025-licao-da-escola-sabatina" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs flex items-center text-[#337945] hover:underline"
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
                <Alert className="max-w-lg mx-auto bg-white dark:bg-neutral-800 border-[#337945]/20">
                  <AlertTitle className="font-medium text-[#337945]">Nenhum estudo disponível</AlertTitle>
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
