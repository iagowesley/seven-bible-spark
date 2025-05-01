import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/lib/ThemeProvider";
import StudiesPage from "./pages/StudiesPage";
import StudyDetailPage from "./pages/StudyDetailPage";
import DailyLessonPage from "./pages/DailyLessonPage";
import QuizPage from "./pages/QuizPage";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";
import AboutPage from "./pages/AboutPage";

// Importar páginas de administração
import AdminPage from "./pages/admin/AdminPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import TrimestreList from "./pages/admin/TrimestreList";
import SemanaList from "./pages/admin/SemanaList";
import LicaoList from "./pages/admin/LicaoList";

// Importar componente de proteção de rota
import RequireAdmin from "./components/admin/RequireAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Navigate to="/sobre" replace />} />
              <Route path="/sobre" element={<AboutPage />} />
              <Route path="/estudos" element={<StudiesPage />} />
              
              {/* Rotas de estudos */}
              <Route path="/estudos/:id" element={<StudyDetailPage />} />
              {/* Redirecionar para o sábado quando acessar diretamente uma semana */}
              <Route 
                path="/estudos/:semanaId/licao" 
                element={<Navigate to="sabado" replace />} 
              />
              {/* Página de lição diária */}
              <Route path="/estudos/:semanaId/licao/:dia" element={<DailyLessonPage />} />
              {/* Página de quiz da lição */}
              <Route path="/estudos/:semanaId/quiz" element={<QuizPage />} />
              
              <Route path="/dashboard" element={<DashboardPage />} />
              
              {/* Página de login de administração */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              
              {/* Rotas Administrativas Protegidas */}
              <Route path="/admin" element={
                <RequireAdmin>
                  <AdminPage />
                </RequireAdmin>
              } />
              <Route path="/admin/trimestres" element={
                <RequireAdmin>
                  <TrimestreList />
                </RequireAdmin>
              } />
              <Route path="/admin/trimestres/:trimestreId/semanas" element={
                <RequireAdmin>
                  <SemanaList />
                </RequireAdmin>
              } />
              <Route path="/admin/semanas/:semanaId/licoes" element={
                <RequireAdmin>
                  <LicaoList />
                </RequireAdmin>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
