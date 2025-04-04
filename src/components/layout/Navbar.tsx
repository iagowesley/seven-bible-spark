import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  UserIcon, 
  LayoutDashboardIcon, 
  BookOpenIcon, 
  LogOutIcon,
  MenuIcon,
  XIcon,
  InfoIcon,
  LogInIcon
} from "lucide-react";

const Navbar = () => {
  const { user, signOut } = useAuth();
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

  const navLinks = user 
    ? [
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
        },
        { 
          icon: <UserIcon className="h-5 w-5 mr-2" />, 
          label: "Perfil", 
          href: "/profile" 
        }
      ]
    : [
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
          <Link to={user ? "/estudos" : "/"} className="flex items-center">
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
                className="flex items-center text-[#a37fb9] hover:bg-[#a37fb9]/10 font-light"
                asChild
              >
                <Link to={link.href}>
                  {link.icon}
                  {link.label}
                </Link>
              </Button>
            ))}
            
            {user ? (
              <Button 
                variant="default" 
                size="sm" 
                onClick={signOut}
                className="flex items-center bg-[#a37fb9] hover:bg-[#8a6aa0] text-white font-light"
              >
                <LogOutIcon className="h-5 w-5 mr-2" />
                Sair
              </Button>
            ) : (
              <Button 
                variant="default" 
                size="sm" 
                className="flex items-center bg-[#a37fb9] hover:bg-[#8a6aa0] text-white font-light"
                asChild
              >
                <Link to="/auth">
                  <LogInIcon className="h-5 w-5 mr-2" />
                  Entrar
                </Link>
              </Button>
            )}
          </div>

          {/* Botão de menu mobile */}
          <button 
            className="md:hidden p-2 rounded-none focus:outline-none text-[#a37fb9]"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <XIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-t">
            <div className="seven-container py-3 flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  to={link.href}
                  className="flex items-center p-3 hover:bg-[#a37fb9]/10 text-[#a37fb9] font-light"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              
              {user ? (
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center mt-4 w-full justify-center bg-[#a37fb9] hover:bg-[#8a6aa0] text-white font-light"
                >
                  <LogOutIcon className="h-5 w-5 mr-2" />
                  Sair
                </Button>
              ) : (
                <Button 
                  variant="default" 
                  size="sm" 
                  asChild
                  className="flex items-center mt-4 w-full justify-center bg-[#a37fb9] hover:bg-[#8a6aa0] text-white font-light"
                >
                  <Link 
                    to="/auth"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogInIcon className="h-5 w-5 mr-2" />
                    Entrar
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
