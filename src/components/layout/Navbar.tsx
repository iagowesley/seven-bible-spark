
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, X, BookOpen, User, LogOut } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="seven-container flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-circle bg-gradient-to-br from-seven-blue to-seven-purple flex items-center justify-center">
            <BookOpen className="text-white h-5 w-5" />
          </div>
          <span className="font-bold text-lg hidden sm:inline-block">
            <span className="text-seven-purple">Lição</span>{" "}
            <span className="text-seven-blue">Jovem</span>{" "}
            <span className="text-seven-gold">Seven</span>
          </span>
        </Link>

        {/* Menu de navegação - desktop */}
        <div className="hidden md:flex items-center space-x-6">
          {!user && (
            <Link to="/" className="animated-link font-medium">
              Home
            </Link>
          )}
          <Link to="/estudos" className="animated-link font-medium">
            Estudos
          </Link>
          <Link to="/dashboard" className="animated-link font-medium">
            Dashboard
          </Link>
          <Link to="/sobre" className="animated-link font-medium">
            Sobre
          </Link>
        </div>

        {/* Ações */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-circle"
          >
            {isDarkMode ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
            <span className="sr-only">Toggle dark mode</span>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>
                      {getInitials(profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="outline"
              className="hidden sm:flex items-center gap-1 rounded-full"
              onClick={() => navigate("/auth")}
            >
              <User className="h-4 w-4" />
              <span>Entrar</span>
            </Button>
          )}

          {/* Menu mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-circle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Menu mobile dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b border-border animate-fade-in">
          <div className="seven-container py-4 space-y-3">
            {!user && (
              <Link
                to="/"
                className="block px-3 py-2 rounded-lg hover:bg-muted"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
            )}
            <Link
              to="/estudos"
              className="block px-3 py-2 rounded-lg hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              Estudos
            </Link>
            <Link
              to="/dashboard"
              className="block px-3 py-2 rounded-lg hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/sobre"
              className="block px-3 py-2 rounded-lg hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              Sobre
            </Link>
            {!user && (
              <Button
                className="w-full rounded-full mt-3"
                onClick={() => {
                  navigate("/auth");
                  setIsMenuOpen(false);
                }}
              >
                Entrar
              </Button>
            )}
            {user && (
              <Button
                variant="destructive"
                className="w-full mt-3"
                onClick={() => {
                  signOut();
                  setIsMenuOpen(false);
                }}
              >
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
