import React from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Componente simplificado que apenas renderiza as crianças sem verificar autenticação
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  return <>{children}</>;
};

export default ProtectedRoute;
