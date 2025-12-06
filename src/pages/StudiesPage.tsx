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
        <section className="w-full pt-72 pb-24 bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="flex flex-col items-center text-center space-y-8">
              <Badge className="bg-[#003366] hover:bg-[#003366]/90 text-white px-5 py-2 text-sm rounded-full shadow-md">
                Estudos Bíblicos
              </Badge>

              <h1 className="text-5xl md:text-6xl font-sans font-bold text-neutral-900 dark:text-white max-w-3xl leading-tight">
                Lições <span className="text-[#003366]">disponíveis</span>
              </h1>

              <p className="text-neutral-600 dark:text-neutral-300 max-w-2xl text-xl font-light leading-relaxed">
                Explore nossos estudos bíblicos organizados por trimestre.
              </p>
            </div>
          </div>
        </section>

        {/* Lista de trimestres */}
        <section className="pt-6 pb-12 bg-neutral-50 dark:bg-neutral-900">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            {/* Card container horizontal */}
            <div className="bg-white dark:bg-neutral-800 rounded-[20px] shadow-lg p-12 border border-neutral-200 dark:border-neutral-700">
              {/* Mobile: grid vertical, Desktop: horizontal scroll */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:overflow-x-auto gap-8 lg:gap-0">
                <div className="lg:flex lg:gap-8 lg:pb-4">
                  {trimestres.map((trimestre) => {
                    const semanasComLicoes = trimestre.semanas.filter((semana) => semana.completa);

                    if (semanasComLicoes.length === 0) {
                      return null;
                    }

                    return (
                      <div key={trimestre.id} className="w-full lg:flex-shrink-0 lg:w-[280px] group">
                        {/* Imagem da lição */}
                        <Link to={`/trimestre/${trimestre.id}/semanas`} className="block mb-4">
                          {trimestre.img_url ? (
                            <img
                              src={trimestre.img_url}
                              alt={trimestre.nome}
                              className="w-full aspect-[3/4] object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full aspect-[3/4] flex items-center justify-center bg-[#003366] text-white">
                              <BookMarked className="h-16 w-16 opacity-50" />
                            </div>
                          )}
                        </Link>

                        {/* Conteúdo do trimestre */}
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <Badge className="bg-[#003366] text-white hover:bg-[#003366]/90 rounded-full text-xs px-3 py-1">
                              {trimestre.ano} / {trimestre.trimestre}º
                            </Badge>
                          </div>
                          <h3 className="text-lg font-bold text-neutral-800 dark:text-white line-clamp-2 mb-2">
                            {trimestre.nome}
                          </h3>
                          <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-4">
                            {getMesesDeTrimestre(trimestre.trimestre)}
                          </p>
                          <a
                            href="https://loja-dev.cpb.com.br/produto/5868/comtexto-biblico-jovens-aluno-avulsa-2-trimestre-2025-licao-da-escola-sabatina"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs flex items-center text-[#003366] hover:text-blue-600 hover:underline font-medium transition-colors"
                          >
                            <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                            Obter lição física na CPB
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {trimestres.filter(t => t.semanas.some(s => s.completa)).length === 0 && (
              <div className="mt-12">
                <Alert className="max-w-lg mx-auto bg-white border-white/20">
                  <AlertTitle className="font-medium text-[#337945]">Nenhum estudo disponível</AlertTitle>
                  <AlertDescription className="text-neutral-600">
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
