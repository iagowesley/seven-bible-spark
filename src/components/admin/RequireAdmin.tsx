import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RequireAdminProps {
  children: React.ReactNode;
}

const RequireAdmin: React.FC<RequireAdminProps> = ({ children }) => {
  const { isAdmin } = useAuth();
  const location = useLocation();

  // Se não for admin, redireciona para página de login administrativo
  if (!isAdmin) {
    // Salva a localização atual para redirecionar depois do login
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Se for admin, renderiza os componentes filhos normalmente
  return <>{children}</>;
};

export default RequireAdmin; 