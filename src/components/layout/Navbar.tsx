import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboardIcon,
  BookOpenIcon,
  BookOpen,
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
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    // Fechar o menu ao clicar fora dele
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Links de navegação - agora disponíveis para todos
  const navLinks = [
    {
      label: "Estudos",
      href: "/estudos",
      color: "hover:text-blue-200"
    },
    {
      label: "Sobre",
      href: "/sobre",
      color: "hover:text-blue-200"
    }
  ];

  const navbarClass = isScrolled
    ? "navbar-floating bg-[#003366]/90 shadow-md backdrop-blur-sm"
    : "bg-[#003366] shadow-md";

  return (
    <>
      {/* Espaço para compensar a navbar fixa */}
      {isScrolled && <div className="h-20"></div>}

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navbarClass}`}
      >
        <div className="seven-container flex items-center justify-between py-6 relative">
          {/* Elementos decorativos de fundo removidos */}

          <Link to="/" className="flex items-center relative z-10">
            <img
              src="/LOGO_LIÇÃO_JOVEM__7_-removebg-preview.png"
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
                <Link
                  to={link.href}
                  className={`relative px-4 py-2 rounded-[15px] text-base font-medium transition-all duration-300 group overflow-hidden flex items-center text-white/90 hover:text-white hover:bg-white/10`}
                >
                  <span className="relative z-10 flex items-center">
                    {link.label}
                  </span>
                </Link>
              </Button>
            ))}
          </div>

          {/* Botão de menu mobile */}
          <div className="md:hidden flex items-center space-x-3">
            <Button
              ref={menuButtonRef}
              variant="ghost"
              size="icon"
              className="relative z-10 text-white hover:bg-white/10"
              onClick={toggleMenu}
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center relative">
                <div className="w-full h-[2px] bg-white rounded-full transition-all duration-300 ease-in-out absolute"
                  style={{
                    transform: isMenuOpen ? 'rotate(45deg)' : 'rotate(0deg) translateY(-4px)',
                  }}
                />
                <div className="w-1/2 h-[2px] bg-white rounded-full transition-all duration-300 ease-in-out absolute"
                  style={{
                    transform: isMenuOpen ? 'rotate(-45deg) scaleX(2)' : 'rotate(0deg) translateY(4px) translateX(6px)',
                    transformOrigin: 'center',
                  }}
                />
              </div>
            </Button>
          </div>
        </div>

        {/* Menu mobile */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              ref={menuRef}
              className={`md:hidden absolute right-4 top-[88px] w-64 ${isScrolled ? 'bg-[#003366]/90' : 'bg-[#003366]'} shadow-xl rounded-lg border border-blue-600 z-50 overflow-hidden backdrop-blur-sm`}
              initial={{ opacity: 0, scale: 0.9, y: -5, transformOrigin: "top right" }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -5 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="px-1 py-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                  >
                    <Button
                      variant="ghost"
                      className="flex items-center justify-start text-white hover:text-white hover:bg-white/10 font-medium text-base relative overflow-hidden group rounded-md w-full my-1"
                      asChild
                    >
                      <Link
                        to={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="relative z-10 w-full px-4 py-2"
                      >
                        <span className="flex items-center">
                          {link.label}
                        </span>
                      </Link>
                    </Button>
                  </motion.div>
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
