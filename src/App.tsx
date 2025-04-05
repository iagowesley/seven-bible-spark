
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import StudiesPage from "./pages/StudiesPage";
import StudyDetailPage from "./pages/StudyDetailPage";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";
import AboutPage from "./pages/AboutPage";
import EmailConfirmationPage from "./pages/EmailConfirmationPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route 
              path="/" 
              element={<Navigate to="/sobre" replace />}  
            />
            <Route path="/sobre" element={<AboutPage />} />
            <Route path="/confirmar-email" element={<EmailConfirmationPage />} />
            <Route 
              path="/estudos" 
              element={
                <ProtectedRoute>
                  <StudiesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/estudos/:id" 
              element={
                <ProtectedRoute>
                  <StudyDetailPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
