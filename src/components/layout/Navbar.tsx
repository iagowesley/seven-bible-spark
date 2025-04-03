
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  UserIcon, 
  LayoutDashboardIcon, 
  BookOpenIcon, 
  LogOutIcon 
} from "lucide-react";

const Navbar = () => {
  const { user, signOut } = useAuth();

  const navLinks = user 
    ? [
        { 
          icon: <BookOpenIcon className="h-4 w-4 mr-2" />, 
          label: "Estudos", 
          href: "/estudos" 
        },
        { 
          icon: <LayoutDashboardIcon className="h-4 w-4 mr-2" />, 
          label: "Dashboard", 
          href: "/dashboard" 
        },
        { 
          icon: <UserIcon className="h-4 w-4 mr-2" />, 
          label: "Perfil", 
          href: "/profile" 
        }
      ]
    : [];

  return (
    <nav className="bg-white dark:bg-gray-900 border-b">
      <div className="seven-container flex items-center justify-between py-4">
        <Link to={user ? "/estudos" : "/"} className="text-2xl font-bold text-seven-blue">
          Lição Seven
        </Link>
        
        <div className="flex items-center space-x-4">
          {navLinks.map((link) => (
            <Button 
              key={link.href} 
              variant="ghost" 
              className="flex items-center"
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
              variant="destructive" 
              size="sm" 
              onClick={signOut}
              className="flex items-center"
            >
              <LogOutIcon className="h-4 w-4 mr-2" />
              Sair
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
