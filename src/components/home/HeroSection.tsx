
import React from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-background to-muted pt-10 pb-16 sm:pb-24">
      <div className="seven-container relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <div 
              className="w-20 h-20 rounded-circle bg-gradient-to-br from-seven-blue to-seven-purple flex items-center justify-center animate-pulse-slow"
            >
              <BookOpen className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            <span className="block bg-gradient-to-r from-seven-blue via-seven-purple to-seven-gold bg-clip-text text-transparent">
              Lição Jovem Seven
            </span>
          </h1>
          <p className="mt-6 text-xl sm:text-2xl text-foreground/80 max-w-2xl mx-auto">
            Uma nova forma de estudar a Bíblia: interativa, envolvente e adaptada para a geração atual.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="rounded-full text-lg px-8 py-6 bg-gradient-to-r from-seven-blue to-seven-purple hover:opacity-90 transition-opacity animate-fade-in"
              asChild
            >
              <Link to="/estudos">Começar Estudos</Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-full text-lg px-8 py-6 animate-fade-in"
              asChild
            >
              <Link to="/sobre">Saiba Mais</Link>
            </Button>
          </div>
          
          <button 
            onClick={scrollToFeatures} 
            className="mt-16 inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            Descubra os recursos
            <ChevronDown className="h-4 w-4 animate-bounce" />
          </button>
        </div>
      </div>
      
      {/* Circles decorativos */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-seven-purple/10 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-seven-blue/10 rounded-full filter blur-3xl translate-x-1/3 translate-y-1/3"></div>
    </div>
  );
};

export default HeroSection;
