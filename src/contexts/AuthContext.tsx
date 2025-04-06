import React, { createContext, useContext } from 'react';

interface SimplifiedContextProps {
  // Valores necessários para manter compatibilidade com componentes existentes
  user: { id: string }; // Usuário fictício sempre "logado"
  profile: any;
  loading: boolean;
  loadingProfile: boolean;
}

// Criando um contexto simplificado
const SimplifiedContext = createContext<SimplifiedContextProps>({
  user: { id: 'anonymous-user' },
  profile: { name: 'Visitante' },
  loading: false,
  loadingProfile: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Valores fictícios que simulam um usuário sempre logado
  const value = {
    user: { id: 'anonymous-user' },
    profile: { name: 'Visitante' },
    loading: false,
    loadingProfile: false,
  };

  return <SimplifiedContext.Provider value={value}>{children}</SimplifiedContext.Provider>;
};

export const useAuth = (): SimplifiedContextProps => {
  return useContext(SimplifiedContext);
};
