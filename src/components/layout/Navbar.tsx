import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  LayoutDashboardIcon, 
  BookOpenIcon, 
  MenuIcon,
  XIcon,
  InfoIcon,
  SunIcon,
  MoonIcon,
  Sparkles,
  BookOpenCheck,
  Lightbulb,
  Stars,
  BookText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/ThemeProvider";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

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
      hoverIcon: <BookOpenCheck className="h-5 w-5 mr-2 text-white" />,
      label: "Estudos", 
      href: "/estudos",
      color: "from-pink-500 to-purple-500" 
    },
    { 
      icon: <LayoutDashboardIcon className="h-5 w-5 mr-2" />, 
      hoverIcon: <LayoutDashboardIcon className="h-5 w-5 mr-2 text-white" />,
      label: "Dashboard", 
      href: "/dashboard",
      color: "from-blue-500 to-cyan-500"
    },
    { 
      icon: <InfoIcon className="h-5 w-5 mr-2" />, 
      hoverIcon: <Lightbulb className="h-5 w-5 mr-2 text-white" />,
      label: "Sobre", 
      href: "/sobre",
      color: "from-yellow-400 to-orange-500"
    }
  ];

  const navbarClass = isScrolled
    ? "navbar-floating bg-white dark:bg-slate-900 border-b border-transparent shadow-lg backdrop-blur-sm"
    : "bg-white dark:bg-slate-900 border-b border-border";

  return (
    <>
      {/* Espaço para compensar a navbar fixa */}
      {isScrolled && <div className="h-20"></div>}
      
      <nav className={`${navbarClass} sticky top-0 z-50 transition-all duration-300`}>
        {/* Decoração superior - linha gradiente animada */}
        <div className="h-1 w-full bg-gradient-to-r from-[#a37fb9] via-blue-500 to-[#a37fb9] bg-[length:200%_auto] animate-gradient"></div>
        
        <div className="seven-container flex items-center justify-between py-4 relative">
          {/* Elementos decorativos de fundo removidos */}
          
          <Link to="/" className="flex items-center relative z-10">
            <img 
              src="/LOGO_LIÇÃO_JOVEM-removebg-preview (1).png" 
              alt="Lição Jovem" 
              className="h-16 relative z-10"
            />
          </Link>
          
          {/* Menu desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Button 
                key={link.href} 
                variant="ghost" 
                className="flex items-center relative group overflow-hidden"
                asChild
              >
                <Link to={link.href} className="relative z-10 flex items-center text-[#a37fb9] dark:text-[#c4a6df] hover:text-white font-medium text-base transition-colors duration-300">
                  {/* Fundo gradiente animado no hover */}
                  <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 rounded-md bg-[#a37fb9]"></div>
                  {/* Ícone com transição */}
                  <span className="flex items-center justify-center overflow-hidden">
                    <span className="block group-hover:hidden transition-all duration-300">
                  {link.icon}
                    </span>
                    <span className="hidden group-hover:block transition-all duration-300">
                      {link.hoverIcon}
                    </span>
                  </span>
                  {link.label}
                </Link>
              </Button>
            ))}
            
            {/* Toggle de tema */}
            <div className="flex items-center ml-4 relative z-10">
              <div className="bg-gray-100 dark:bg-slate-800 p-1 rounded-full flex items-center transition-colors duration-300">
                <button 
                  onClick={toggleTheme}
                  className="relative focus:outline-none"
                >
                  <div className="w-12 h-6 rounded-full p-1 flex items-center bg-gray-200 dark:bg-gray-700 transition-colors duration-300">
                    <div className={`absolute left-0.5 bg-white dark:bg-gray-300 w-5 h-5 rounded-full shadow transform transition-transform duration-300 flex items-center justify-center ${isDark ? 'translate-x-6' : 'translate-x-0'}`}>
                      {isDark ? (
                        <MoonIcon size={14} className="text-indigo-700" />
                      ) : (
                        <SunIcon size={14} className="text-yellow-500" />
                      )}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Botão de menu mobile */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Toggle de tema mobile */}
            <button 
              onClick={toggleTheme}
              className="focus:outline-none p-1.5 rounded-full bg-gray-100 dark:bg-slate-800 relative z-10"
            >
              {isDark ? (
                <MoonIcon size={18} className="text-indigo-700" />
              ) : (
                <SunIcon size={18} className="text-yellow-500" />
              )}
            </button>
            
          <Button 
            variant="ghost" 
            size="icon"
              className="relative z-10" 
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <XIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </Button>
          </div>
        </div>

        {/* Menu mobile */}
        <AnimatePresence>
        {isMenuOpen && (
            <motion.div 
              className="md:hidden px-4 pb-4 bg-white dark:bg-slate-900 border-t"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Button
                  key={link.href}
                  variant="ghost"
                    className="flex items-center justify-start text-[#a37fb9] hover:text-white hover:bg-[#a37fb9] font-medium text-base relative overflow-hidden group dark:text-[#c4a6df]"
                  asChild
                >
                  <Link 
                    to={link.href}
                    onClick={() => setIsMenuOpen(false)}
                      className="relative z-10"
                  >
                      <span className="flex items-center">
                        <span className="block group-hover:hidden">
                    {link.icon}
                        </span>
                        <span className="hidden group-hover:block">
                          {link.hoverIcon}
                        </span>
                    {link.label}
                      </span>
                      
                      {/* Onda decorativa animada */}
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transition-opacity"></div>
                  </Link>
                </Button>
              ))}
            </div>
            </motion.div>
        )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
