import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextProps {
  user: { id: string; isAdmin?: boolean } | null;
  profile: any;
  loading: boolean;
  loadingProfile: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  adminSignIn: (username: string, password: string) => Promise<boolean>;
  adminSignOut: () => void;
  isAdmin: boolean;
}

// Criando o contexto de autenticação
const AuthContext = createContext<AuthContextProps>({
  user: { id: 'anonymous-user' },
  profile: { name: 'Visitante' },
  loading: false,
  loadingProfile: false,
  signIn: async () => {},
  signUp: async () => {},
  adminSignIn: async () => false,
  adminSignOut: () => {},
  isAdmin: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  // Verificar se há um token de admin no localStorage ao iniciar
  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
      setIsAdmin(true);
    }
  }, []);
  
  // Login de administrador (simples, usando credenciais fixas para demonstração)
  const adminSignIn = async (username: string, password: string): Promise<boolean> => {
    // Em um sistema real, você verificaria contra um backend
    // IMPORTANTE: Em produção, use um sistema seguro de autenticação!
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('admin_token', 'admin-session-token');
      setIsAdmin(true);
      return true;
    }
    return false;
  };
  
  // Logout de administrador
  const adminSignOut = () => {
    localStorage.removeItem('admin_token');
    setIsAdmin(false);
  };
  
  // Valores fictícios que simulam um usuário sempre logado para o app normal
  const value = {
    user: { id: 'anonymous-user', isAdmin },
    profile: { name: isAdmin ? 'Administrador' : 'Visitante' },
    loading: false,
    loadingProfile: false,
    isAdmin,
    signIn: async (email: string, password: string) => {
      console.log('Login simulado com:', email);
      // Não faz nada, apenas simula
    },
    signUp: async (email: string, password: string, userData: any) => {
      console.log('Cadastro simulado com:', email, userData);
      // Não faz nada, apenas simula
    },
    adminSignIn,
    adminSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextProps => {
  return useContext(AuthContext);
};
