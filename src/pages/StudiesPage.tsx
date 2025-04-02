
import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LessonCard from "@/components/study/LessonCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Dados para os dias da semana
const weekDays = [
  {
    id: "domingo",
    title: "Domingo",
    description: "A origem do mal e o grande conflito: por que existe o sofrimento?",
    duration: "20 min",
    points: 100,
    progress: 0,
  },
  {
    id: "segunda",
    title: "Segunda-feira",
    description: "O plano da salvação: como Deus resolveu o problema do pecado através de Jesus.",
    duration: "15 min",
    points: 80,
    progress: 65,
  },
  {
    id: "terca",
    title: "Terça-feira",
    description: "A lei de Deus e o seu amor: como os mandamentos revelam o caráter divino.",
    duration: "25 min",
    points: 120,
    progress: 0,
  },
  {
    id: "quarta",
    title: "Quarta-feira",
    description: "O sábado e sua importância na adoração a Deus e descanso do ser humano.",
    duration: "30 min",
    points: 150,
    progress: 100,
  },
  {
    id: "quinta",
    title: "Quinta-feira",
    description: "A oração e o estudo da Bíblia: como desenvolver um relacionamento com Deus.",
    duration: "40 min",
    points: 200,
    progress: 25,
  },
  {
    id: "sexta",
    title: "Sexta-feira",
    description: "Vida cristã e testemunho: como viver e compartilhar a fé no dia a dia.",
    duration: "35 min",
    points: 180,
    progress: 0,
  },
  {
    id: "sabado",
    title: "Sábado",
    description: "Resumo da semana: revisão e aplicação prática das lições aprendidas.",
    duration: "45 min",
    points: 220,
    progress: 0,
  },
];

const StudiesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLessons = weekDays.filter(lesson => 
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="seven-container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Lição da Semana</h1>
            <p className="text-muted-foreground">
              Escolha o dia da semana para estudar a lição correspondente
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
            {/* Barra de pesquisa */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar lições..."
                className="pl-10 rounded-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Lista de lições por dia da semana */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.length > 0 ? (
              filteredLessons.map((day) => (
                <LessonCard
                  key={day.id}
                  id={day.id}
                  title={day.title}
                  description={day.description}
                  duration={day.duration}
                  points={day.points}
                  progress={day.progress}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <p className="text-muted-foreground">
                  Nenhum dia da semana encontrado para "{searchTerm}"
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudiesPage;
