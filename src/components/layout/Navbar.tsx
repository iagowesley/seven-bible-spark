import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  UserIcon, 
  LayoutDashboardIcon, 
  BookOpenIcon, 
  LogOutIcon,
  MenuIcon,
  XIcon 
} from "lucide-react";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          icon: <UserIcon className="h-5 w-5 mr-2" />, 
          label: "Perfil", 
          href: "/profile" 
        },
        { 
          icon: <BookOpenIcon className="h-5 w-5 mr-2" />, 
          label: "Sobre", 
          href: "/sobre" 
        }
      ]
    : [
        { 
          icon: <BookOpenIcon className="h-5 w-5 mr-2" />, 
          label: "Sobre", 
          href: "/sobre" 
        }
      ];

  return (
    <nav className="bg-[#a37fb9] dark:bg-[#a37fb9] border-b">
      <div className="seven-container flex items-center justify-between py-4">
        <Link to={user ? "/estudos" : "/"} className="flex items-center">
          <img 
            src="/LOGO_LIÇÃO_JOVEM-removebg-preview (1).png" 
            alt="Lição Jovem" 
            className="h-20"
          />
        </Link>
        
        {/* Menu desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {navLinks.map((link) => (
            <Button 
              key={link.href} 
              variant="ghost" 
              className="flex items-center text-white hover:text-white hover:bg-[#8a6aa0] text-lg"
              asChild
            >
              <Link to={link.href}>
                {link.icon}
                {link.label}
              </Link>
            </Button>
          ))}
          
          {user && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={signOut}
              className="flex items-center bg-white text-[#a37fb9] hover:bg-gray-100 hover:text-[#8a6aa0] text-lg"
            >
              <LogOutIcon className="h-5 w-5 mr-2" />
              Sair
            </Button>
          )}
        </div>

        {/* Botão de menu mobile */}
        {user && (
          <button 
            className="md:hidden p-2 rounded-md hover:bg-[#8a6aa0] focus:outline-none text-white"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <XIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
        )}
      </div>

      {/* Menu mobile */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#a37fb9] dark:bg-[#a37fb9] border-t border-white/20">
          <div className="seven-container py-3 flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                to={link.href}
                className="flex items-center p-3 rounded-md hover:bg-[#8a6aa0] text-white text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            
            {user && (
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => {
                  signOut();
                  setIsMenuOpen(false);
                }}
                className="flex items-center mt-4 w-full justify-center bg-white text-[#a37fb9] hover:bg-gray-100 hover:text-[#8a6aa0] text-lg"
              >
                <LogOutIcon className="h-5 w-5 mr-2" />
                Sair
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
