import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/lib/ThemeProvider";
import { Suspense, lazy, useState } from "react";
import StudiesPage from "./pages/StudiesPage";
import NotFound from "./pages/NotFound";
import AboutPage from "./pages/AboutPage";

// Loading component
const LoadingFallback = () => (
  <div className="flex flex-col justify-center items-center min-h-screen text-center p-4">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#a37fb9] mb-4"></div>
    <h2 className="text-xl font-medium text-[#a37fb9] mb-2">Carregando conteúdo...</h2>
    <p className="text-gray-500 max-w-md">
      Estamos buscando seus dados, isso deve levar apenas alguns segundos.
      Se o carregamento persistir, verifique sua conexão com a internet.
    </p>
  </div>
);

// Componente para lidar com erros de carregamento
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Algo deu errado</h2>
        <p className="mb-6 text-gray-600 max-w-md">
          Tivemos um problema ao carregar a página. Tente atualizar ou voltar para a página inicial.
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-[#a37fb9] text-white rounded hover:bg-[#8a63a8] transition-colors"
          >
            Atualizar página
          </button>
          <button 
            onClick={() => {
              setHasError(false);
              window.location.href = '/';
            }} 
            className="px-4 py-2 border border-[#a37fb9] text-[#a37fb9] rounded hover:bg-[#a37fb9]/10 transition-colors"
          >
            Voltar para início
          </button>
        </div>
      </div>
    );
  }

  try {
    return <>{children}</>;
  } catch (error) {
    console.error('Erro na renderização:', error);
    setHasError(true);
    return null;
  }
};

// Lazy load rotas que podem ser problemáticas
const StudyDetailPage = lazy(() => import("./pages/StudyDetailPage"));
const DailyLessonPage = lazy(() => import("./pages/DailyLessonPage"));
const QuizPage = lazy(() => import("./pages/QuizPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const SemanasTrimestrePage = lazy(() => import("./pages/SemanasTrimestrePage"));

// Importar páginas de administração
const AdminPage = lazy(() => import("./pages/admin/AdminPage"));
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));
const TrimestreList = lazy(() => import("./pages/admin/TrimestreList"));
const SemanaList = lazy(() => import("./pages/admin/SemanaList"));
const LicaoList = lazy(() => import("./pages/admin/LicaoList"));

// Importar componente de proteção de rota
import RequireAdmin from "./components/admin/RequireAdmin";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000, // 10 minutos
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <BrowserRouter basename="/">
          <AuthProvider>
            <Toaster />
            <Sonner />
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Navigate to="/sobre" replace />} />
                <Route path="/sobre" element={<AboutPage />} />
                <Route path="/estudos" element={<StudiesPage />} />
                
                {/* Nova rota para página de semanas do trimestre */}
                <Route path="/trimestre/:trimestreId/semanas" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <SemanasTrimestrePage />
                  </Suspense>
                } />
                
                {/* Rotas de estudos */}
                <Route path="/estudos/:id" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <StudyDetailPage />
                  </Suspense>
                } />
                {/* Redirecionar para o sábado quando acessar diretamente uma semana */}
                <Route 
                  path="/estudos/:semanaId/licao" 
                  element={<Navigate to="sabado" replace />} 
                />
                {/* Página de lição diária */}
                <Route path="/estudos/:semanaId/licao/:dia" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <DailyLessonPage />
                  </Suspense>
                } />
                {/* Página de quiz da lição */}
                <Route path="/estudos/:semanaId/quiz" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <QuizPage />
                  </Suspense>
                } />
                
                <Route path="/dashboard" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <DashboardPage />
                  </Suspense>
                } />
                
                {/* Página de login de administração */}
                <Route path="/admin/login" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminLoginPage />
                  </Suspense>
                } />
                
                {/* Rotas Administrativas Protegidas */}
                <Route path="/admin" element={
                  <RequireAdmin>
                    <Suspense fallback={<LoadingFallback />}>
                      <AdminPage />
                    </Suspense>
                  </RequireAdmin>
                } />
                <Route path="/admin/trimestres" element={
                  <RequireAdmin>
                    <Suspense fallback={<LoadingFallback />}>
                      <TrimestreList />
                    </Suspense>
                  </RequireAdmin>
                } />
                <Route path="/admin/trimestres/:trimestreId/semanas" element={
                  <RequireAdmin>
                    <Suspense fallback={<LoadingFallback />}>
                      <SemanaList />
                    </Suspense>
                  </RequireAdmin>
                } />
                <Route path="/admin/semanas/:semanaId/licoes" element={
                  <RequireAdmin>
                    <Suspense fallback={<LoadingFallback />}>
                      <LicaoList />
                    </Suspense>
                  </RequireAdmin>
                } />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
