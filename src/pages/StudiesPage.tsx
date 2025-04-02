
import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LessonCard from "@/components/study/LessonCard";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

// Dados fictícios para as lições
const lessons = [
  {
    id: "1",
    title: "O Propósito da Vida",
    description: "Descubra o que a Bíblia diz sobre o propósito de Deus para sua vida e como você pode viver esse propósito diariamente.",
    duration: "20 min",
    points: 100,
    progress: 0,
  },
  {
    id: "2",
    title: "Fé e Obras",
    description: "Um estudo sobre a relação entre fé e obras na vida cristã, baseado nas cartas de Tiago e Paulo.",
    duration: "15 min",
    points: 80,
    progress: 65,
  },
  {
    id: "3",
    title: "O Poder da Oração",
    description: "Aprenda princípios bíblicos sobre oração eficaz e como desenvolver uma vida de intimidade com Deus através da oração.",
    duration: "25 min",
    points: 120,
    progress: 0,
  },
  {
    id: "4",
    title: "Os Dons Espirituais",
    description: "Entenda o que são os dons espirituais, como descobrir seus dons e usá-los para edificação da igreja e glória de Deus.",
    duration: "30 min",
    points: 150,
    progress: 100,
  },
  {
    id: "5",
    title: "Criação vs. Evolução",
    description: "Uma análise crítica e bíblica sobre o debate entre criacionismo e evolucionismo, e como defender nossa fé.",
    duration: "40 min",
    points: 200,
    progress: 25,
  },
  {
    id: "6",
    title: "O Santuário",
    description: "Explore o significado e a importância do santuário bíblico e suas lições para a vida cristã hoje.",
    duration: "35 min",
    points: 180,
    progress: 0,
  },
];

const categories = ["Todas", "Doutrinas", "Profecias", "Vida Cristã", "Testemunho", "Família"];

const StudiesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");

  const filteredLessons = lessons.filter(lesson => 
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="seven-container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Lições para Estudo</h1>
            <p className="text-muted-foreground">
              Explore nossas lições interativas e cresça em seu conhecimento bíblico
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

            {/* Categorias */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              {categories.map((category) => (
                <button
                  key={category}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de lições */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.length > 0 ? (
              filteredLessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  id={lesson.id}
                  title={lesson.title}
                  description={lesson.description}
                  duration={lesson.duration}
                  points={lesson.points}
                  progress={lesson.progress}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <p className="text-muted-foreground">
                  Nenhuma lição encontrada para "{searchTerm}"
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
