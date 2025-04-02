
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-seven-blue/20 to-seven-purple/20 z-0"></div>
      
      <div className="seven-container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Transforme sua experiência de estudo bíblico hoje
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Junte-se a milhares de jovens que já estão aproveitando os recursos interativos do Lição Jovem Seven para aprofundar seu conhecimento bíblico.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="rounded-full text-lg px-8 py-6 bg-gradient-to-r from-seven-blue to-seven-purple hover:opacity-90 transition-opacity"
              asChild
            >
              <Link to="/cadastro">Crie sua conta grátis</Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-full text-lg px-8 py-6"
              asChild
            >
              <Link to="/estudos">Explorar lições</Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Círculos decorativos */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-seven-purple/10 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-seven-blue/10 rounded-full filter blur-3xl translate-y-1/2"></div>
    </section>
  );
};

export default CTASection;
