import React, { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Instagram, BookOpen, Award, MessageSquare, Calendar, ArrowRight, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

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
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section - Redesigned & Professional */}
        <section className="w-full relative py-32 md:py-48 overflow-hidden bg-[#003366]">
          {/* Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-3xl"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
            <div className="flex flex-col items-center text-center space-y-8">
              <Badge className="bg-blue/10 hover:bg-blue/20 text-white border-none px-4 py-2 text-sm backdrop-blur-sm">
                Conheça nosso projeto
              </Badge>

              <h1 className="text-5xl md:text-7xl font-sans font-bold text-white max-w-4xl leading-tight tracking-tight">
                Estudo bíblico <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">relevante & interativo</span>
              </h1>

              <p className="text-blue-100/80 max-w-2xl text-xl font-light leading-relaxed">
                Um projeto dedicado a conectar jovens adventistas com a Palavra de Deus através de tecnologia, design e profundidade teológica.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                <Button asChild className="bg-white text-[#003366] hover:bg-white/90 text-lg px-8 py-5 rounded-[15px] font-medium shadow-lg hover:shadow-xl transition-all duration-300 h-auto w-full sm:w-auto">
                  <Link to="/estudos">Começar a estudar</Link>
                </Button>

                <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-5 rounded-[15px] backdrop-blur-sm h-auto w-full sm:w-auto">
                  <a href="https://instagram.com/licaojovem7" target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-5 w-5 mr-2" />
                    Instagram
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Nossa missão - Modern & Clean */}
        <section className="py-24 bg-white dark:bg-neutral-900">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="flex flex-col lg:flex-row gap-16 items-center">

              <div className="w-full lg:w-1/2 space-y-8 order-2 lg:order-1">
                <div className="space-y-4">
                  <p className="text-[#003366] text-sm font-bold tracking-widest uppercase mb-2">Nossa missão</p>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                    Transformando o estudo da Bíblia
                  </h2>
                  <div className="w-20 h-1.5 bg-[#003366] rounded-full"></div>
                </div>

                <div className="space-y-6 text-lg text-gray-600 dark:text-gray-300 font-light leading-relaxed">
                  <p>
                    A <span className="font-semibold text-[#003366]">Lição Jovem 7</span> nasceu do desejo de tornar o estudo da Escola Sabatina mais acessível, dinâmico e relevante para a nova geração.
                  </p>
                  <p>
                    Cada lição é estruturada para facilitar a compreensão profunda, conectando os textos antigos com os dilemas modernos que enfrentamos diariamente.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full text-[#003366]">
                        <Heart className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-gray-800 dark:text-gray-200">Feito por jovens</span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full text-[#003366]">
                        <Users className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-gray-800 dark:text-gray-200">Comunidade ativa</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-1/2 order-1 lg:order-2 flex justify-center">
                <div className="relative w-full max-w-xs">
                  {/* Clean Image presentation - No borders */}
                  {/* Clean Image presentation - Blue border */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <img
                      src="/licao-atual.png"
                      alt="Lição - Êxodo"
                      className="w-full h-auto object-contain drop-shadow-2xl relative z-10 transform transition-transform duration-500 group-hover:scale-[1.02] rounded-[15px] border-4 border-dashed border-blue-600"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Nossos recursos - Cards Modernos & Profissionais */}
        <section className="py-24 bg-neutral-50 dark:bg-neutral-800">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="flex flex-col gap-16">
              <div className="flex flex-col space-y-4 text-center items-center">
                <p className="text-[#003366] text-sm font-bold tracking-widest uppercase">Recursos</p>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                  O que oferecemos
                </h2>
                <div className="w-20 h-1.5 bg-[#003366] rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group bg-white dark:bg-neutral-900 rounded-[10px] shadow-lg hover:shadow-xl transition-all duration-300 p-10 flex flex-col items-center text-center border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>

                  <div className="h-20 w-20 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 flex items-center justify-center rounded-full mb-8 shadow-inner relative z-10 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="h-10 w-10 text-[#003366]" />
                  </div>
                  <h3 className="font-bold text-2xl mb-4 text-[#003366] dark:text-white relative z-10">Estudos Diários</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed relative z-10">Conteúdo estruturado e relevante para cada dia da semana, projetado para aprofundar sua conexão com Deus.</p>
                </div>

                <div className="group bg-white dark:bg-neutral-900 rounded-[10px] shadow-lg hover:shadow-xl transition-all duration-300 p-10 flex flex-col items-center text-center border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>

                  <div className="h-20 w-20 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 flex items-center justify-center rounded-full mb-8 shadow-inner relative z-10 group-hover:scale-110 transition-transform duration-300">
                    <MessageSquare className="h-10 w-10 text-[#003366]" />
                  </div>
                  <h3 className="font-bold text-2xl mb-4 text-[#003366] dark:text-white relative z-10">Comunidade e Discussão</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed relative z-10">Compartilhe insights, faça perguntas e cresça junto com outros jovens que buscam conhecimento.</p>
                </div>
              </div>

              <div className="flex justify-center mt-4">
                <div className="bg-white dark:bg-neutral-900 p-8 rounded-[10px] shadow-md border border-gray-100 dark:border-gray-800 max-w-3xl w-full">
                  <div className="flex flex-col sm:flex-row justify-around items-center gap-8">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-[#003366] mb-1">7</p>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">dias de estudo</p>
                    </div>
                    <div className="hidden sm:block w-px h-16 bg-gray-200 dark:bg-gray-700"></div>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-[#003366] mb-1">10k+</p>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">jovens engajados</p>
                    </div>
                    <div className="hidden sm:block w-px h-16 bg-gray-200 dark:bg-gray-700"></div>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-[#003366] mb-1">24h</p>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">acesso livre</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Lição atual - Design Moderno */}
        <section className="py-24 bg-[#003366] text-white">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="flex flex-col gap-16">
              <div className="flex flex-col space-y-4 text-center items-center">
                <p className="text-blue-200 text-sm font-bold tracking-widest uppercase">Trimestre atual</p>
                <h2 className="text-4xl md:text-5xl font-bold text-white">
                  Êxodo: Deus em ação
                </h2>
                <div className="w-20 h-1.5 bg-blue-400 rounded-full"></div>
                <p className="text-blue-100 max-w-2xl text-center text-lg font-light leading-relaxed">
                  Uma jornada profunda através do livro de Êxodo, descobrindo como Deus age na história para libertar, guiar e habitar com Seu povo.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/5 backdrop-blur-md rounded-[10px] p-8 border border-white/10 hover:bg-white/10 transition-colors duration-300">
                  <div className="h-12 w-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 text-blue-300">
                    <span className="text-2xl font-bold">1</span>
                  </div>
                  <h4 className="text-xl font-bold mb-3 text-white">A Libertação</h4>
                  <p className="text-blue-100/80 leading-relaxed">
                    Acompanhe o poder de Deus manifestado nas pragas e na travessia do Mar Vermelho, quebrando as correntes da escravidão.
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-[10px] p-8 border border-white/10 hover:bg-white/10 transition-colors duration-300">
                  <div className="h-12 w-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 text-blue-300">
                    <span className="text-2xl font-bold">2</span>
                  </div>
                  <h4 className="text-xl font-bold mb-3 text-white">O Deserto</h4>
                  <p className="text-blue-100/80 leading-relaxed">
                    Lições de fé e dependência enquanto Deus provê maná, água e direção em meio à aridez da jornada.
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-[10px] p-8 border border-white/10 hover:bg-white/10 transition-colors duration-300">
                  <div className="h-12 w-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 text-blue-300">
                    <span className="text-2xl font-bold">3</span>
                  </div>
                  <h4 className="text-xl font-bold mb-3 text-white">A Aliança</h4>
                  <p className="text-blue-100/80 leading-relaxed">
                    O encontro no Sinai, os Dez Mandamentos e o estabelecimento de um relacionamento formal entre Deus e Israel.
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-[10px] p-8 border border-white/10 hover:bg-white/10 transition-colors duration-300">
                  <div className="h-12 w-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 text-blue-300">
                    <span className="text-2xl font-bold">4</span>
                  </div>
                  <h4 className="text-xl font-bold mb-3 text-white">O Tabernáculo</h4>
                  <p className="text-blue-100/80 leading-relaxed">
                    O propósito divino de habitar entre nós e o significado profundo dos rituais e símbolos do santuário.
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <Button asChild className="bg-blue-700 hover:bg-blue-600 text-white rounded-[15px] px-8 py-5 text-lg font-medium hover:shadow-blue-500/25 h-auto">
                  <Link to="/estudos">
                    Começar a estudar agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Instagram - Design clean */}
        <section className="py-24 bg-white dark:bg-neutral-800">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="md:w-1/2 space-y-6">
                <Badge className="bg-[#003366] text-white hover:bg-[#003366]/90 border-none px-3 py-1 mb-2">
                  @licaojovem7
                </Badge>
                <h2 className="text-4xl font-bold text-neutral-900 dark:text-white">
                  Siga-nos no Instagram
                </h2>
                <p className="text-neutral-600 dark:text-neutral-300 text-lg">
                  Diariamente compartilhamos resumos das lições, reflexões inspiradoras
                  e conteúdos exclusivos para ajudar na sua jornada espiritual.
                </p>
                <Button asChild className="bg-[#003366] hover:bg-blue-800 text-white rounded-[15px] px-8 py-5 text-lg shadow-lg hover:shadow-blue-900/20 transition-all border-none h-auto">
                  <a href="https://instagram.com/licaojovem7" target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-5 w-5 mr-2" />
                    Seguir agora
                  </a>
                </Button>
              </div>

              <div className="md:w-1/2">
                <div className="instagram-container w-full max-w-sm mx-auto">
                  <div className="overflow-hidden rounded-lg shadow-sm" dangerouslySetInnerHTML={{
                    __html: `
                    <blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/DNaiPEzxYWL/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style="background:#FFF; border:0; border-radius:12px; box-shadow:0 0 1px 0 rgba(0,0,0,0.1),0 1px 10px 0 rgba(0,0,0,0.1); margin: 1px; max-width:100%; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"><div style="padding:16px;"> <a href="https://www.instagram.com/p/DNaiPEzxYWL/?utm_source=ig_embed&amp;utm_campaign=loading" style="background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank"> <div style="display: flex; flex-direction: row; align-items: center;"> <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;"> <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div> <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div></div></div><div style="padding: 19% 0;"></div> <div style="display:block; height:50px; margin:0 auto 12px; width:50px;"><svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-511.000000, -20.000000)" fill="#000000"><g><path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path></g></g></g></svg></div><div style="padding-top: 8px;"> <div style="color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">Ver essa foto no Instagram</div></div><div style="padding: 12.5% 0;"></div> <div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;"><div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div> <div style="background-color: #F4F4F4; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;"></div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div></div><div style="margin-left: 8px;"> <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div> <div style="width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #f4f4f4; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg)"></div></div><div style="margin-left: auto;"> <div style="width: 0px; border-top: 8px solid #F4F4F4; border-right: 8px solid transparent; transform: translateY(16px);"></div> <div style="background-color: #F4F4F4; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div> <div style="width: 0; height: 0; border-top: 8px solid #F4F4F4; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div></div></div></a></div></blockquote>
                  `}} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Profissional */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#003366]">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507692049790-de58293a4697?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl -ml-32 -mb-32"></div>
          </div>

          <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Pronto para começar sua jornada?
            </h2>
            <p className="text-blue-100 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Junte-se a milhares de jovens que estão transformando sua vida espiritual através do estudo diário e consistente da Palavra.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-white text-[#003366] hover:bg-gray-100 rounded-[15px] px-8 py-5 text-lg font-bold shadow-xl hover:shadow-2xl transition-all h-auto">
                <Link to="/estudos">
                  Começar agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage; 