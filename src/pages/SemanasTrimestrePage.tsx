import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, BookOpen, ChevronRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { obterTrimestre, Trimestre } from "@/models/trimestreService";
import { listarSemanasPorTrimestre } from "@/models/semanaService";

interface Semana {
  id: string;
  numero: number;
  titulo: string;
  resumo: string;
  texto_biblico_chave: string;
  trimestre_id: string;
}

const SemanasTrimestrePage: React.FC = () => {
  const { trimestreId } = useParams<{ trimestreId: string }>();
  const [trimestre, setTrimestre] = useState<Trimestre | null>(null);
  const [semanas, setSemanas] = useState<Semana[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const carregarDados = async () => {
      if (!trimestreId) {
        setError("ID do trimestre não fornecido");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Carregar dados do trimestre
        const trimestreData = await obterTrimestre(trimestreId);
        setTrimestre(trimestreData);

        // Carregar semanas do trimestre
        const semanasData = await listarSemanasPorTrimestre(trimestreId);
        setSemanas(semanasData);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setError("Ocorreu um erro ao carregar os dados do trimestre.");
        toast({
          title: "Erro",
          description: "Não foi possível carregar as informações do trimestre.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [trimestreId]);

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

  // Função para obter o tema e descrição baseado no trimestre
  const getTemaTrimestre = (nomeTrimsetre: string, numeroTrimestre: string) => {
    // Verificar pelo nome do trimestre primeiro
    if (nomeTrimsetre?.toLowerCase().includes('êxodo') || nomeTrimsetre?.toLowerCase().includes('exodo')) {
      return {
        titulo: "Êxodo",
        descricao: "O livro de Êxodo revela o poder libertador de Deus e Sua fidelidade às promessas feitas ao Seu povo. Este trimestre nos convida a descobrir as lições de fé, obediência e esperança encontradas na jornada do povo de Israel rumo à Terra Prometida."
      };
    }

    if (nomeTrimsetre?.toLowerCase().includes('adoração') || nomeTrimsetre?.toLowerCase().includes('adoracao')) {
      return {
        titulo: "Adoração",
        descricao: "A verdadeira adoração ocorre quando reconhecemos a grandeza de Deus e respondemos com todo o nosso ser. Este trimestre nos convida a explorar o significado profundo da adoração e como ela transforma nossa vida espiritual."
      };
    }

    // Fallback baseado no número do trimestre se não conseguir identificar pelo nome
    switch (numeroTrimestre) {
      case "2":
        return {
          titulo: "Adoração",
          descricao: "A verdadeira adoração ocorre quando reconhecemos a grandeza de Deus e respondemos com todo o nosso ser. Este trimestre nos convida a explorar o significado profundo da adoração e como ela transforma nossa vida espiritual."
        };
      case "3":
        return {
          titulo: "Êxodo",
          descricao: "O livro de Êxodo revela o poder libertador de Deus e Sua fidelidade às promessas feitas ao Seu povo. Este trimestre nos convida a descobrir as lições de fé, obediência e esperança encontradas na jornada do povo de Israel rumo à Terra Prometida."
        };
      default:
        return {
          titulo: "Estudo Bíblico",
          descricao: "Este trimestre nos convida a aprofundar nosso conhecimento das Escrituras e fortalecer nossa caminhada espiritual através do estudo da Palavra de Deus."
        };
    }
  };

  // Função para obter as datas da semana baseado no número da semana
  const getDatasSemana = (numeroSemana: number): string => {
    switch (numeroSemana) {
      case 1:
        return "28 Jun - 04 Jul";
      case 2:
        return "05 Jul - 11 Jul";
      case 3:
        return "12 Jul - 18 Jul";
      case 4:
        return "19 Jul - 25 Jul";
      case 5:
        return "26 Jul - 01 Ago";
      case 6:
        return "02 Ago - 08 Ago";
      case 7:
        return "09 Ago - 15 Ago";
      case 8:
        return "16 Ago - 22 Ago";
      case 9:
        return "23 Ago - 29 Ago";
      case 10:
        return "30 Ago - 05 Set";
      case 11:
        return "06 Set - 12 Set";
      case 12:
        return "13 Set - 19 Set";
      case 13:
        return "20 Set - 26 Set";
      default:
        return "28 Jun - 04 Jul"; // Data padrão se nenhuma corresponder
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366]"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !trimestre) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
          <Alert variant="destructive" className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error || "Trimestre não encontrado"}</AlertDescription>
          </Alert>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Cabeçalho */}
        <section className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="flex flex-col items-center text-center space-y-8">
              <Badge className="bg-[#003366] hover:bg-[#003366]/90 text-white px-5 py-2 text-sm rounded-full shadow-md">
                {trimestre.ano} - {trimestre.trimestre}º Trimestre
              </Badge>

              <h1 className="text-5xl md:text-6xl font-sans font-bold text-neutral-900 dark:text-white max-w-3xl leading-tight">
                <span className="text-[#003366]">{trimestre.nome}</span>
              </h1>

              <p className="text-neutral-600 dark:text-neutral-300 max-w-2xl text-xl font-light leading-relaxed">
                {getMesesDeTrimestre(trimestre.trimestre)}
              </p>

              <div className="mt-4 flex items-center justify-center w-full">
                <div className="bg-white dark:bg-neutral-800 p-12 rounded-[25px] max-w-3xl border border-neutral-200 dark:border-neutral-700 shadow-lg">
                  {(() => {
                    const tema = getTemaTrimestre(trimestre.nome, trimestre.trimestre);
                    return (
                      <>
                        <h2 className="text-2xl font-bold text-[#003366] mb-4">{tema.titulo}</h2>
                        <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                          {tema.descricao}
                        </p>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Lista de semanas */}
        <section className="pt-6 pb-20 bg-neutral-50 dark:bg-neutral-900">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-10 text-center">
              Semanas de Estudo
            </h2>

            <div className="space-y-6">
              {semanas.length > 0 ? (
                semanas.map((semana) => (
                  <Card key={semana.id} className="overflow-hidden bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-md hover:shadow-xl transition-all duration-300 rounded-[25px] hover:-translate-y-1">
                    <Link to={`/estudos/${semana.id}/licao/sabado`} className="block">
                      <div className="p-10">
                        <div className="flex items-start gap-6">
                          <div className="flex-shrink-0 w-20 h-20 flex items-center justify-center bg-[#003366] rounded-[20px]">
                            <span className="text-4xl font-bold text-white">{semana.numero}</span>
                          </div>
                          <div className="flex-grow">
                            <div className="mb-3">
                              <h3 className="text-2xl text-[#003366] font-bold mb-2">{semana.titulo}</h3>
                              <p className="text-sm text-neutral-500 font-medium">{getDatasSemana(semana.numero)}</p>
                            </div>
                            <p className="text-neutral-700 dark:text-neutral-300 text-base line-clamp-2 mb-4">
                              {semana.resumo}
                            </p>
                            <div className="flex items-center text-[#003366] text-base font-semibold">
                              <span>Estudar agora</span>
                              <ChevronRight className="h-5 w-5 ml-1" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Card>
                ))
              ) : (
                <Alert className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-[25px]">
                  <AlertTitle className="text-[#003366]">Nenhuma semana disponível</AlertTitle>
                  <AlertDescription>
                    Não há semanas cadastradas para este trimestre ainda.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default SemanasTrimestrePage; 