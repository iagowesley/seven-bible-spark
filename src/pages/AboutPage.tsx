import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 bg-gradient-to-b from-white to-purple-50">
        <div className="seven-container px-4 sm:px-6 lg:px-8">
          {/* Seção de cabeçalho com imagem em destaque */}
          <div className="relative mb-16">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#a37fb9] mb-4">
                  Sobre a Lição Jovem
                </h1>
                <p className="text-lg md:text-xl text-gray-600">
                  Estudos bíblicos para jovens adventistas do sétimo dia
                </p>
              </div>
              
              <div className="md:w-1/2 rounded-xl overflow-hidden shadow-2xl max-w-xs mx-auto">
                <img 
                  src="/cover.png" 
                  alt="Lição Jovem - Adoração" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>

          {/* Seção sobre o que é a Lição Jovem */}
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-10 mb-12">
            <h2 className="text-3xl font-bold text-[#a37fb9] mb-6">O que é a Lição Jovem 7?</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                A <span className="font-semibold">Lição Jovem 7</span> é um projeto dedicado a oferecer estudos bíblicos 
                interativos e relevantes para jovens adventistas do sétimo dia. Nosso objetivo é tornar o estudo da Bíblia
                mais acessível, envolvente e aplicável ao dia a dia dos jovens.
              </p>
              <p>
                Cada lição semanal é dividida em sete partes - uma para cada dia da semana - permitindo 
                um estudo aprofundado e consistente. O conteúdo é cuidadosamente elaborado para conectar os ensinamentos
                bíblicos com os desafios contemporâneos enfrentados pelos jovens.
              </p>
              <p>
                Através de nossa plataforma digital, os usuários podem:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Acessar estudos diários com conteúdo relevante</li>
                <li>Acompanhar seu progresso de estudo</li>
                <li>Interagir com os materiais através de quizzes e reflexões</li>
                <li>Compartilhar insights e aprendizados com outros jovens</li>
              </ul>
            </div>
          </div>

          {/* Seção sobre a lição trimestral atual */}
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-10">
            <h2 className="text-3xl font-bold text-[#a37fb9] mb-6">Lição Atual: Adoração</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Neste trimestre, estamos estudando o tema <span className="font-semibold">ADORAÇÃO</span> - 
                uma profunda exploração do que significa adorar a Deus em espírito e verdade.
              </p>
              <p>
                A adoração é mais do que um ritual semanal; é uma expressão de nosso relacionamento com 
                Deus que permeia todos os aspectos de nossa vida. Através deste estudo, exploraremos:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-[#a37fb9] mb-3">O início do altar</h3>
                  <p>
                    Como a adoração começou no Éden e evoluiu ao longo da história bíblica, 
                    explorando os fundamentos espirituais do altar como lugar de encontro com Deus.
                  </p>
                </div>
                
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-[#a37fb9] mb-3">Adoração autêntica</h3>
                  <p>
                    A diferença entre adoração verdadeira e meros rituais, examinando como 
                    podemos oferecer uma adoração que vem do coração.
                  </p>
                </div>
                
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-[#a37fb9] mb-3">Adoração na vida diária</h3>
                  <p>
                    Como viver uma vida de adoração através de nossas escolhas, ações e 
                    relacionamentos cotidianos.
                  </p>
                </div>
                
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-[#a37fb9] mb-3">Adoração na eternidade</h3>
                  <p>
                    Uma visão da adoração celestial e como nosso culto na Terra nos prepara 
                    para a adoração eterna.
                  </p>
                </div>
              </div>

              <p className="mt-6">
                Este trimestre, convidamos você a se aprofundar em sua compreensão da adoração 
                e descobrir novas dimensões em seu relacionamento com Deus.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage; 