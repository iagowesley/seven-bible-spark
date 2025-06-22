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
  
  // Função para obter as datas da semana baseado no número da semana
  const getDatasSemana = (numeroSemana: number): string => {
    switch (numeroSemana) {
      case 1:
        return "Apr 05 - Apr 11";
      case 2:
        return "Apr 12 - Apr 18";
      case 3:
        return "Apr 19 - Apr 25";
      case 4:
        return "Apr 26 - May 02";
      case 5:
        return "May 03 - May 09";
      case 6:
        return "May 03 - May 09";
      case 7:
        return "May 10 - May 16";
      case 8:
        return "May 17 - May 23";
      case 9:
        return "May 24 - May 30";
      case 10:
        return "May 31 - Jun 06";
      case 11:
        return "Jun 07 - Jun 13";
      case 12:
        return "Jun 14 - Jun 20";
      case 13:
        return "Jun 21 - Jun 27";
      default:
        return "May 03 - May 09"; // Data padrão se nenhuma corresponder
    }
  };
  
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
      <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        {/* Cabeçalho */}
        <section className="w-full py-24 bg-white dark:bg-neutral-800">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="flex flex-col items-center text-center space-y-6">
              <Badge className="bg-[#337945] hover:bg-[#337945]/90 text-white px-3 py-1 text-xs">
                {trimestre.ano} - {trimestre.trimestre}º Trimestre
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-serif font-medium text-neutral-900 dark:text-white max-w-2xl leading-tight">
                <span className="text-[#337945]">{trimestre.nome}</span>
              </h1>
              
              <p className="text-neutral-600 dark:text-neutral-300 max-w-xl text-lg font-light leading-relaxed">
                {getMesesDeTrimestre(trimestre.trimestre)}
              </p>
              
              <div className="mt-4 flex items-center justify-center">
                <div className="bg-neutral-100 dark:bg-neutral-700 p-6 rounded-lg max-w-2xl">
                  <h2 className="text-xl font-medium text-[#337945] mb-3">Adoração</h2>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    A verdadeira adoração ocorre quando reconhecemos a grandeza de Deus e respondemos com todo o nosso ser. 
                    Este trimestre nos convida a explorar o significado profundo da adoração e como ela transforma nossa vida espiritual.
                  </p>
                </div>
              </div>
              
              <Separator className="w-12 bg-[#337945] h-0.5 mt-4" />
              
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <BookOpen className="h-4 w-4 text-[#337945]" />
                  <span>Autor: Pr. Fernando Dias</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <Clock className="h-4 w-4 text-[#337945]" />
                  <span>7 dias de estudo por semana</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Lista de semanas */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-8 text-center">
              Semanas de Estudo
            </h2>
            
            <div className="space-y-4">
              {semanas.length > 0 ? (
                semanas.map((semana) => (
                  <Card key={semana.id} className="overflow-hidden bg-white dark:bg-neutral-800 border-none shadow-md hover:shadow-lg transition-all">
                    <Link to={`/estudos/${semana.id}/licao/sabado`} className="block">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center">
                          <span className="text-5xl font-bold text-[#337945]">{semana.numero}</span>
                        </div>
                        <div className="flex-grow">
                          <div className="bg-neutral-50 dark:bg-neutral-900 p-4">
                            <h3 className="text-xl text-[#2c62af] font-bold mb-1">{semana.titulo}</h3>
                            <p className="text-sm text-neutral-500">{getDatasSemana(semana.numero)}</p>
                          </div>
                        </div>
                      </div>
                      
                      <CardContent className="pt-4">
                        <p className="text-neutral-700 dark:text-neutral-300 text-sm line-clamp-2">
                          {semana.resumo}
                        </p>
                        
                        <div className="flex justify-end items-center mt-4 text-[#337945] text-sm font-medium">
                          <span>Estudar agora</span>
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))
              ) : (
                <Alert className="bg-white dark:bg-neutral-800">
                  <AlertTitle>Nenhuma semana disponível</AlertTitle>
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