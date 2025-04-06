import React from "react";
import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-[#a37fb9]/20 shadow-sm">
      <div className="seven-container py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Logo e Descrição */}
          <div className="flex flex-col items-center md:items-start">
            <Link to="/" className="mb-4">
              <img 
                src="/LOGO_LIÇÃO_JOVEM-removebg-preview (1).png" 
                alt="Lição Jovem" 
                className="h-20"
              />
            </Link>
            <p className="text-sm text-muted-foreground font-light">
              Estudos para jovens adventistas
            </p>
          </div>
          
          {/* Links Úteis */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-normal mb-4 text-[#a37fb9]">Links Úteis</h3>
            <div className="flex flex-col space-y-2 items-center md:items-start">
              <Link to="/estudos" className="text-sm text-muted-foreground hover:text-[#a37fb9] font-light">
                Estudos
              </Link>
              <Link to="/sobre" className="text-sm text-muted-foreground hover:text-[#a37fb9] font-light">
                Sobre
              </Link>
              
            </div>
          </div>
          
          {/* Redes Sociais e Copyright */}
          <div className="flex flex-col items-center md:items-end">
            <h3 className="text-lg font-normal mb-4 text-[#a37fb9]">Nos Siga</h3>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center p-2 bg-[#a37fb9]/10 hover:bg-[#a37fb9] hover:text-white text-[#a37fb9] transition-colors duration-300 mb-4"
            >
              <Instagram className="h-5 w-5 mr-2" />
              <span className="text-sm font-light">Instagram</span>
            </a>
            <p className="text-xs text-muted-foreground font-light mt-4">
              © {currentYear} Lição Jovem. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
