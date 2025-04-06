import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  LayoutDashboardIcon, 
  BookOpenIcon, 
  MenuIcon,
  XIcon,
  InfoIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Links de navegação - agora disponíveis para todos
  const navLinks = [
    { 
      icon: <BookOpenIcon className="h-5 w-5 mr-2" />, 
      label: "Estudos", 
      href: "/estudos" 
    },
    { 
      icon: <LayoutDashboardIcon className="h-5 w-5 mr-2" />, 
      label: "Dashboard", 
      href: "/dashboard" 
    },
    { 
      icon: <InfoIcon className="h-5 w-5 mr-2" />, 
      label: "Sobre", 
      href: "/sobre" 
    }
  ];

  const navbarClass = isScrolled
    ? "navbar-floating bg-white dark:bg-slate-900 border-b border-transparent"
    : "bg-white dark:bg-slate-900 border-b";

  return (
    <>
      {/* Espaço para compensar a navbar fixa */}
      {isScrolled && <div className="h-20"></div>}
      
      <nav className={navbarClass}>
        <div className="seven-container flex items-center justify-between py-4">
          <Link to="/sobre" className="flex items-center">
            <img 
              src="/LOGO_LIÇÃO_JOVEM-removebg-preview (1).png" 
              alt="Lição Jovem" 
              className="h-16"
            />
          </Link>
          
          {/* Menu desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Button 
                key={link.href} 
                variant="ghost" 
                className="flex items-center text-[#a37fb9] hover:text-white hover:bg-[#a37fb9] font-medium text-base"
                asChild
              >
                <Link to={link.href}>
                  {link.icon}
                  {link.label}
                </Link>
              </Button>
            ))}
          </div>

          {/* Botão de menu mobile */}
          <Button 
            variant="ghost" 
            size="icon"
            className="md:hidden" 
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <XIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden px-4 pb-4 bg-white dark:bg-slate-900 border-t">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Button
                  key={link.href}
                  variant="ghost"
                  className="flex items-center justify-start text-[#a37fb9] hover:text-white hover:bg-[#a37fb9] font-medium text-base"
                  asChild
                >
                  <Link 
                    to={link.href}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
