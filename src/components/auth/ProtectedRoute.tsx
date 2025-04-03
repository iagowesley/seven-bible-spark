
import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, session } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Add additional check to redirect if session becomes null after loading
    if (!loading && !session) {
      console.log("No session in protected route, redirecting");
    }
  }, [session, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-seven-blue"></div>
      </div>
    );
  }

  if (!user || !session) {
    console.log("Protected route: unauthorized access, redirecting to auth page");
    return <Navigate to="/auth" replace />;
  }

  console.log("Protected route: authorized access");
  return <>{children}</>;
};

export default ProtectedRoute;
