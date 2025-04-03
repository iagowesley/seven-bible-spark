
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut, profile } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const renderProfileMenu = () => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            {profile?.full_name || user?.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/dashboard")}>
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/profile")}>
            Meu Perfil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/estudos")}>
            Estudos
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>Sair</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <header className="bg-background border-b border-border">
      <div className="seven-container">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center">
              <span className="text-xl font-bold text-seven-purple">Lição</span>{" "}
              <span className="text-xl font-bold text-seven-blue ml-1">Seven</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-4">
            {!user && (
              <Link
                to="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
            )}
            <Link
              to="/estudos"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Estudos
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                {renderProfileMenu()}
              </>
            ) : (
              <Button asChild variant="default" className="rounded-full">
                <Link to="/auth">Entrar</Link>
              </Button>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile nav */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              {!user && (
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-foreground py-2 transition-colors"
                  onClick={toggleMenu}
                >
                  Home
                </Link>
              )}
              <Link
                to="/estudos"
                className="text-muted-foreground hover:text-foreground py-2 transition-colors"
                onClick={toggleMenu}
              >
                Estudos
              </Link>
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-muted-foreground hover:text-foreground py-2 transition-colors"
                    onClick={toggleMenu}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="text-muted-foreground hover:text-foreground py-2 transition-colors"
                    onClick={toggleMenu}
                  >
                    Meu Perfil
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleSignOut();
                      toggleMenu();
                    }}
                    className="justify-start px-0 hover:bg-transparent"
                  >
                    Sair
                  </Button>
                </>
              ) : (
                <Button
                  asChild
                  variant="default"
                  className="rounded-full w-full"
                  onClick={toggleMenu}
                >
                  <Link to="/auth">Entrar</Link>
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
