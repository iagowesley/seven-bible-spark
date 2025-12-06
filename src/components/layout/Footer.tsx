import React from "react";
import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#003366] dark:bg-slate-900 border-t border-white/10 shadow-sm text-white">
      <div className="seven-container py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Logo e Descrição */}
          <div className="flex flex-col items-start">
            <Link to="/" className="mb-4">
              <img
                src="/LOGO_LIÇÃO_JOVEM__7_-removebg-preview.png"
                alt="Lição Jovem"
                className="h-20"
              />
            </Link>
            <p className="text-sm text-white/80 font-light">
              Estudos para jovens adventistas
            </p>
          </div>

          {/* Links Úteis */}
          <div className="flex flex-col items-start">
            <h3 className="text-lg font-normal mb-4 text-white">Links úteis</h3>
            <div className="flex flex-col space-y-2 items-start">
              <Link to="/estudos" className="text-white/80 hover:text-white transition-colors text-base">
                Estudos
              </Link>
              <Link to="/sobre" className="text-white/80 hover:text-white transition-colors text-base">
                Sobre
              </Link>
            </div>
          </div>

          {/* Redes Sociais e Copyright */}
          <div className="flex flex-col items-start md:items-end">
            <h3 className="text-lg font-normal mb-4 text-white">Nos siga</h3>
            <a
              href="https://instagram.com/licaojovem7"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-white/80 hover:text-white transition-colors duration-300 mb-4 group"
            >
              <Instagram className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              <span className="text-base font-light">Instagram</span>
            </a>
            <p className="text-xs text-white/60 font-light mt-4">
              © {currentYear} Lição Jovem 7. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
