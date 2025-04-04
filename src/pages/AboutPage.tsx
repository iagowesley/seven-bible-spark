import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Instagram, BookOpen, Award, MessageSquare, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gradient-to-b from-white to-purple-50">
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-r from-[#a37fb9] to-[#7957a0] text-white py-16">
          <div className="seven-container px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:w-2/3 space-y-6">
                <Badge className="bg-white/20 hover:bg-white/30 text-white px-4 py-1 text-sm">Conheça nosso projeto</Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                  Lição Jovem 7: <br /> Estudo diário de forma <span className="text-yellow-200">interativa</span>
                </h1>
                <p className="text-lg md:text-xl opacity-90 max-w-2xl">
                  Um projeto inovador para ajudar jovens adventistas a estudar diariamente a lição 
                  com explicações detalhadas e quizzes para fixar melhor o conteúdo.
                </p>
                <div className="flex items-center gap-4 flex-wrap">
                  <Button asChild size="lg" className="rounded-full font-medium bg-white text-[#a37fb9] hover:bg-white/90">
                    <Link to="/auth">Comece agora</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-full border-white text-white hover:bg-white/10 font-medium">
                    <a href="https://instagram.com/licaojovem7" target="_blank" rel="noopener noreferrer">
                      <Instagram className="h-4 w-4 mr-2" />
                      Siga-nos no Instagram
                    </a>
                  </Button>
                </div>
              </div>
              <div className="md:w-1/3 max-w-xs">
                <div className="relative">
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-[#a37fb9]/30 to-transparent blur-lg"></div>
                  <img 
                    src="/cover.png" 
                    alt="Lição Jovem - Adoração" 
                    className="w-full h-auto rounded-lg shadow-2xl relative z-10 transform transition-all hover:scale-105 duration-300"
                  />
                  <div className="absolute -bottom-4 -right-4 bg-yellow-400 text-[#a37fb9] font-bold px-4 py-2 rounded-lg shadow-lg z-20">
                    2º Trimestre
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="seven-container px-4 sm:px-6 lg:px-8 py-16">
          {/* O que é a Lição Jovem 7 */}
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1 w-16 bg-[#a37fb9]"></div>
              <h2 className="text-sm font-medium text-[#a37fb9] uppercase tracking-wider">Nossa missão</h2>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">O que é a Lição Jovem 7?</h2>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 text-gray-700">
                <p className="text-lg">
                  A <span className="font-semibold text-[#a37fb9]">Lição Jovem 7</span> é um projeto dedicado a oferecer estudos bíblicos 
                  interativos e relevantes para jovens adventistas do sétimo dia. Nosso objetivo é tornar o estudo da Bíblia
                  mais acessível, envolvente e aplicável ao dia a dia dos jovens.
                </p>
                <p>
                  Cada lição semanal é dividida em sete partes - uma para cada dia da semana - permitindo 
                  um estudo aprofundado e consistente. O conteúdo é cuidadosamente elaborado para conectar os ensinamentos
                  bíblicos com os desafios contemporâneos enfrentados pelos jovens.
                </p>
                <p>
                  <span className="font-semibold">Nossa presença no Instagram:</span> Diariamente, compartilhamos resumos 
                  das lições em nossa página do Instagram, criando uma comunidade ativa que estuda e reflete
                  juntos sobre os temas propostos.
                </p>
                <p>
                  Este novo site foi desenvolvido para ajudar todos os jovens a manterem uma rotina de estudos
                  bíblicos consistente, com ferramentas que facilitam a compreensão e a aplicação prática
                  dos ensinamentos.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <Card className="p-6 flex flex-col items-center text-center hover:shadow-lg transition-all hover:-translate-y-1 bg-gradient-to-b from-white to-purple-50/50">
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-[#a37fb9]" />
                  </div>
                  <h3 className="font-semibold mb-2">Estudos Diários</h3>
                  <p className="text-sm text-gray-600">Conteúdo relevante para cada dia da semana</p>
                </Card>
                
                <Card className="p-6 flex flex-col items-center text-center hover:shadow-lg transition-all hover:-translate-y-1 bg-gradient-to-b from-white to-purple-50/50">
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                    <Award className="h-6 w-6 text-[#a37fb9]" />
                  </div>
                  <h3 className="font-semibold mb-2">Quizzes</h3>
                  <p className="text-sm text-gray-600">Teste seus conhecimentos e fixe o conteúdo</p>
                </Card>
                
                <Card className="p-6 flex flex-col items-center text-center hover:shadow-lg transition-all hover:-translate-y-1 bg-gradient-to-b from-white to-purple-50/50">
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-[#a37fb9]" />
                  </div>
                  <h3 className="font-semibold mb-2">Discussões</h3>
                  <p className="text-sm text-gray-600">Compartilhe insights com outros jovens</p>
                </Card>
                
                <Card className="p-6 flex flex-col items-center text-center hover:shadow-lg transition-all hover:-translate-y-1 bg-gradient-to-b from-white to-purple-50/50">
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                    <Calendar className="h-6 w-6 text-[#a37fb9]" />
                  </div>
                  <h3 className="font-semibold mb-2">Progresso</h3>
                  <p className="text-sm text-gray-600">Acompanhe sua jornada de estudos</p>
                </Card>
              </div>
            </div>
          </div>
          
          {/* Lição atual */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1 w-16 bg-[#a37fb9]"></div>
              <h2 className="text-sm font-medium text-[#a37fb9] uppercase tracking-wider">Conteúdo atual</h2>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Lição do trimestre: Adoração</h2>
            
            <Card className="p-0 overflow-hidden mb-10">
              <div className="bg-[#7957a0] text-white p-8">
                <h3 className="text-2xl font-bold mb-2">Adoração</h3>
                <p className="opacity-90 mb-2">
                  Uma profunda exploração do que significa adorar a Deus em espírito e verdade.
                </p>
                <p className="text-sm opacity-80">
                  A adoração é mais do que um ritual semanal; é uma expressão de nosso relacionamento com 
                  Deus que permeia todos os aspectos de nossa vida.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-y">
                <div className="p-6 hover:bg-purple-50 transition-colors">
                  <h4 className="font-semibold text-[#a37fb9] mb-2">O início do altar</h4>
                  <p className="text-sm text-gray-600">
                    Como a adoração começou no Éden e evoluiu ao longo da história bíblica.
                  </p>
                </div>
                
                <div className="p-6 hover:bg-purple-50 transition-colors">
                  <h4 className="font-semibold text-[#a37fb9] mb-2">Adoração autêntica</h4>
                  <p className="text-sm text-gray-600">
                    A diferença entre adoração verdadeira e meros rituais.
                  </p>
                </div>
                
                <div className="p-6 hover:bg-purple-50 transition-colors">
                  <h4 className="font-semibold text-[#a37fb9] mb-2">Adoração na vida diária</h4>
                  <p className="text-sm text-gray-600">
                    Como viver uma vida de adoração em nossas escolhas diárias.
                  </p>
                </div>
                
                <div className="p-6 hover:bg-purple-50 transition-colors">
                  <h4 className="font-semibold text-[#a37fb9] mb-2">Adoração na eternidade</h4>
                  <p className="text-sm text-gray-600">
                    Uma visão da adoração celestial e como nos preparamos para ela.
                  </p>
                </div>
              </div>
            </Card>
            
            <div className="flex justify-center">
              <Button asChild size="lg" className="rounded-full bg-[#a37fb9] hover:bg-[#7957a0] font-medium">
                <Link to="/auth">
                  Começar a estudar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Seção Instagram */}
          <div className="mt-20 border-t border-purple-100 pt-16">
            <div className="flex flex-col md:flex-row items-center justify-between gap-10 bg-purple-50 p-8 rounded-xl">
              <div className="md:w-2/3">
                <Badge className="bg-[#a37fb9] mb-4">@licaojovem7</Badge>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Siga-nos no Instagram</h3>
                <p className="text-gray-700 mb-6">
                  Todos os dias compartilhamos resumos das lições, reflexões inspiradoras 
                  e conteúdos exclusivos para ajudar na sua jornada espiritual.
                </p>
                <Button asChild variant="outline" className="rounded-full border-[#a37fb9] text-[#a37fb9] hover:bg-[#a37fb9]/10">
                  <a href="https://instagram.com/licaojovem7" target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-4 w-4 mr-2" />
                    Seguir agora
                  </a>
                </Button>
              </div>
              <div className="md:w-1/3 relative">
                <img 
                  src="/instagram-preview.png" 
                  alt="Instagram Lição Jovem 7" 
                  className="rounded-lg shadow-xl"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/300x300?text=Instagram+Preview";
                  }}
                />
                <div className="absolute -bottom-3 -right-3 bg-white p-2 rounded-full shadow-lg">
                  <Instagram className="h-8 w-8 text-[#a37fb9]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage; 