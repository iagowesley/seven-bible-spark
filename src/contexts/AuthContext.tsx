import React, { createContext, useContext } from 'react';

interface SimplifiedContextProps {
  // Valores necessários para manter compatibilidade com componentes existentes
  user: { id: string }; // Usuário fictício sempre "logado"
  profile: any;
  loading: boolean;
  loadingProfile: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
}

// Criando um contexto simplificado
const SimplifiedContext = createContext<SimplifiedContextProps>({
  user: { id: 'anonymous-user' },
  profile: { name: 'Visitante' },
  loading: false,
  loadingProfile: false,
  signIn: async () => {},
  signUp: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Valores fictícios que simulam um usuário sempre logado
  const value = {
    user: { id: 'anonymous-user' },
    profile: { name: 'Visitante' },
    loading: false,
    loadingProfile: false,
    signIn: async (email: string, password: string) => {
      console.log('Login simulado com:', email);
      // Não faz nada, apenas simula
    },
    signUp: async (email: string, password: string, userData: any) => {
      console.log('Cadastro simulado com:', email, userData);
      // Não faz nada, apenas simula
    },
  };

  return <SimplifiedContext.Provider value={value}>{children}</SimplifiedContext.Provider>;
};

export const useAuth = (): SimplifiedContextProps => {
  return useContext(SimplifiedContext);
};
