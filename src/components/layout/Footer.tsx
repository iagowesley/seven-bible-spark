import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#a37fb9] dark:bg-[#a37fb9] border-t text-white">
      <div className="seven-container py-8 flex flex-col md:flex-row justify-between items-center">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <Link to="/" className="flex items-center justify-center md:justify-start">
            <img 
              src="/LOGO_LIÇÃO_JOVEM-removebg-preview (1).png" 
              alt="Lição Jovem" 
              className="h-24"
            />
          </Link>
          <p className="text-sm mt-2">
            Estudos bíblicos para jovens adventistas
          </p>
        </div>
        
        <div className="text-sm">
          © {currentYear} Lição Jovem. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
