import React from "react";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-muted py-12 mt-16">
      <div className="seven-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Sobre - Updated */}
          <div className="col-span-1 md:col-span-1">
            <div className="mb-4">
              <span className="font-bold text-lg">
                <span className="text-seven-gold">Lição Seven</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Uma plataforma moderna para o estudo interativo da lição da Escola Sabatina Jovem.
            </p>
          </div>
          
          {/* Links Rápidos */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/estudos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Estudos
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Sobre nós
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Suporte */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Suporte</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contato" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contato
                </Link>
              </li>
              <li>
                <Link to="/privacidade" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/termos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Redes Sociais */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Redes Sociais</h3>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-9 h-9 circle-button bg-muted-foreground/10 hover:bg-muted-foreground/20">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-9 h-9 circle-button bg-muted-foreground/10 hover:bg-muted-foreground/20">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-9 h-9 circle-button bg-muted-foreground/10 hover:bg-muted-foreground/20">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Inscreva-se para receber atualizações
            </p>
            <div className="mt-2 flex">
              <input 
                type="email" 
                placeholder="Seu e-mail" 
                className="rounded-l-full px-3 py-2 text-sm bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary" 
              />
              <button className="bg-primary text-white rounded-r-full px-4 py-2 text-sm">
                Enviar
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Lição Seven. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
