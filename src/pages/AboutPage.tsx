import React, { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Instagram, BookOpen, Award, MessageSquare, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AboutPage = () => {
  
  // Adicionar useEffect para carregar o script do Instagram
  useEffect(() => {
    // Função para carregar o script do Instagram
    const loadInstagramEmbed = () => {
      const script = document.createElement('script');
      script.async = true;
      script.src = '//www.instagram.com/embed.js';
      document.body.appendChild(script);
      
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    };
    
    // Carregar o script
    const cleanup = loadInstagramEmbed();
    
    // Limpar o script quando o componente for desmontado
    return cleanup;
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gradient-to-b from-white to-purple-50">
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-r from-[#a37fb9] to-[#7957a0] text-white py-16">
          <div className="seven-container px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:w-2/3 space-y-6">
                <Badge className="bg-white/20 hover:bg-white/30 text-white px-4 py-1 text-sm rounded-none">Conheça nosso projeto</Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                  Lição Jovem 7: <br /> Estudo diário de forma <span className="text-yellow-200">interativa</span>
                </h1>
                <p className="text-lg md:text-xl opacity-90 max-w-2xl">
                  Um projeto para ajudar jovens adventistas a estudar diariamente a lição 
                  com explicações e quizzes para fixar melhor o conteúdo abordado.
                </p>
                <div className="flex items-center gap-4 flex-wrap">
                  <Button asChild size="lg" className="rounded-none font-medium bg-white text-[#a37fb9] hover:bg-white/90">
                    <Link to="/auth">Comece agora</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-none border-white text-white hover:bg-white/10 font-medium">
                    <a href="https://instagram.com/licaojovem7" target="_blank" rel="noopener noreferrer">
                      <Instagram className="h-4 w-4 mr-2" />
                      Siga-nos no Instagram
                    </a>
                  </Button>
                </div>
              </div>
              <div className="md:w-1/3 max-w-xs">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#a37fb9]/30 to-transparent blur-lg"></div>
                  <img 
                    src="/cover.png" 
                    alt="Lição Jovem - Adoração" 
                    className="w-full h-auto rounded-none shadow-2xl relative z-10 transform transition-all hover:scale-105 duration-300"
                  />
                  <div className="absolute -bottom-4 -right-4 bg-yellow-400 text-[#a37fb9] font-bold px-4 py-2 rounded-none shadow-lg z-20">
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
                  A <span className="font-semibold text-[#a37fb9]">Lição Jovem 7</span> é um projeto dedicado a oferecer estudos diários 
                  interativos e relevantes para jovens adventistas do sétimo dia. Nosso objetivo é tornar o estudo da lição da escola sabatina
                  mais acessível, envolvente e aplicável ao dia a dia dos jovens.
                </p>
                <p>
                  Cada lição semanal é dividida em sete partes - uma para cada dia da semana - permitindo 
                  um estudo aprofundado e consistente. O conteúdo é elaborado para conectar os ensinamentos
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
                <Card className="p-6 flex flex-col items-center text-center hover:shadow-lg transition-all hover:-translate-y-1 bg-gradient-to-b from-white to-purple-50/50 rounded-none">
                  <div className="h-12 w-12 bg-purple-100 flex items-center justify-center mb-4 rounded-none">
                    <BookOpen className="h-6 w-6 text-[#a37fb9]" />
                  </div>
                  <h3 className="font-semibold mb-2">Estudos Diários</h3>
                  <p className="text-sm text-gray-600">Conteúdo relevante para cada dia da semana</p>
                </Card>
                
                <Card className="p-6 flex flex-col items-center text-center hover:shadow-lg transition-all hover:-translate-y-1 bg-gradient-to-b from-white to-purple-50/50 rounded-none">
                  <div className="h-12 w-12 bg-purple-100 flex items-center justify-center mb-4 rounded-none">
                    <Award className="h-6 w-6 text-[#a37fb9]" />
                  </div>
                  <h3 className="font-semibold mb-2">Quizzes</h3>
                  <p className="text-sm text-gray-600">Teste seus conhecimentos e fixe o conteúdo</p>
                </Card>
                
                <Card className="p-6 flex flex-col items-center text-center hover:shadow-lg transition-all hover:-translate-y-1 bg-gradient-to-b from-white to-purple-50/50 rounded-none">
                  <div className="h-12 w-12 bg-purple-100 flex items-center justify-center mb-4 rounded-none">
                    <MessageSquare className="h-6 w-6 text-[#a37fb9]" />
                  </div>
                  <h3 className="font-semibold mb-2">Discussões</h3>
                  <p className="text-sm text-gray-600">Compartilhe insights com outros jovens</p>
                </Card>
                
                <Card className="p-6 flex flex-col items-center text-center hover:shadow-lg transition-all hover:-translate-y-1 bg-gradient-to-b from-white to-purple-50/50 rounded-none">
                  <div className="h-12 w-12 bg-purple-100 flex items-center justify-center mb-4 rounded-none">
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
            
            <Card className="p-0 overflow-hidden mb-10 rounded-none">
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
              <Button asChild size="lg" className="rounded-none bg-[#a37fb9] hover:bg-[#7957a0] font-medium">
                <Link to="/auth">
                  Começar a estudar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Seção Instagram */}
          <div className="mt-20 border-t border-purple-100 pt-16">
            <div className="flex flex-col md:flex-row items-center justify-between gap-10 bg-purple-50 p-8 rounded-none">
              <div className="md:w-1/2">
                <Badge className="bg-[#a37fb9] mb-4 rounded-none">@licaojovem7</Badge>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Siga-nos no Instagram</h3>
                <p className="text-gray-700 mb-6">
                  Todos os dias compartilhamos resumos das lições, reflexões inspiradoras 
                  e conteúdos exclusivos para ajudar na sua jornada espiritual.
                </p>
                <Button asChild variant="outline" className="rounded-none border-[#a37fb9] text-[#a37fb9] hover:bg-[#a37fb9]/10">
                  <a href="https://instagram.com/licaojovem7" target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-4 w-4 mr-2" />
                    Seguir agora
                  </a>
                </Button>
              </div>
              <div className="md:w-1/2">
                {/* Incorporação do Instagram */}
                <div className="instagram-container w-full sm:w-4/5 md:w-full mx-auto" style={{ maxWidth: "90%", margin: "0 auto" }}>
                  <div className="overflow-hidden" dangerouslySetInnerHTML={{ __html: `
                    <blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/DHyeSeMxBM3/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style="background:#FFF; border:0; border-radius:0; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:100%; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"><div style="padding:16px;"> <a href="https://www.instagram.com/p/DHyeSeMxBM3/?utm_source=ig_embed&amp;utm_campaign=loading" style="background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank"> <div style="display: flex; flex-direction: row; align-items: center;"> <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;"> <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div> <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div></div></div><div style="padding: 19% 0;"></div> <div style="display:block; height:50px; margin:0 auto 12px; width:50px;"><svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-511.000000, -20.000000)" fill="#000000"><g><path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path></g></g></g></svg></div><div style="padding-top: 8px;"> <div style="color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">Ver essa foto no Instagram</div></div><div style="padding: 12.5% 0;"></div> <div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;"><div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div> <div style="background-color: #F4F4F4; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;"></div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div></div><div style="margin-left: 8px;"> <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div> <div style="width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #f4f4f4; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg)"></div></div><div style="margin-left: auto;"> <div style="width: 0px; border-top: 8px solid #F4F4F4; border-right: 8px solid transparent; transform: translateY(16px);"></div> <div style="background-color: #F4F4F4; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div> <div style="width: 0; height: 0; border-top: 8px solid #F4F4F4; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div></div></div></a></div></blockquote>
                  `}} />
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