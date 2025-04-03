
import React from "react";
import { Link } from "react-router-dom";
import NewsletterForm from "@/components/home/NewsletterForm";

const Footer: React.FC = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="seven-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo e descrição */}
          <div className="flex flex-col">
            <Link to="/" className="mb-4 inline-block">
              <span className="text-2xl font-bold text-seven-purple">Lição</span>{" "}
              <span className="text-2xl font-bold text-seven-blue">Seven</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Estudos bíblicos para jovens adventistas do sétimo dia.
            </p>
          </div>

          {/* Links rápidos */}
          <div className="flex flex-col">
            <h3 className="font-semibold mb-4">Links Rápidos</h3>
            <div className="flex flex-col space-y-2">
              <Link
                to="/estudos"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Estudos
              </Link>
              <Link
                to="/dashboard"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Meu Perfil
              </Link>
            </div>
          </div>

          {/* Contato */}
          <div className="flex flex-col">
            <h3 className="font-semibold mb-4">Contato</h3>
            <div className="flex flex-col space-y-2 text-muted-foreground">
              <a
                href="mailto:contato@licaoseven.com"
                className="hover:text-foreground transition-colors"
              >
                contato@licaoseven.com
              </a>
              <span>Sábados: 9h às 10h30</span>
              <span>Escola Sabatina Jovem</span>
            </div>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col">
            <h3 className="font-semibold mb-4">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Receba novos estudos e conteúdos exclusivos no seu e-mail
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Lição Seven. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
