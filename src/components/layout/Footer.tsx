
import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t">
      <div className="seven-container py-8 flex flex-col md:flex-row justify-between items-center">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <Link to="/" className="text-2xl font-bold text-seven-blue">
            Lição Seven
          </Link>
          <p className="text-sm text-muted-foreground mt-2">
            Estudos bíblicos para jovens adventistas
          </p>
        </div>
        
        <div className="text-sm text-muted-foreground">
          © {currentYear} Lição Seven. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
