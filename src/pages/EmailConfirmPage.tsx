import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, BookOpen, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const EmailConfirmPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isValidConfirmation, setIsValidConfirmation] = useState(false);

  // Verificar se o usuário está autenticado e se tem o token de confirmação
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const confirmationToken = searchParams.get('confirmation_token');
    
    // Verificar se o usuário está logado e se chegou com um token de confirmação válido
    if (user && confirmationToken) {
      setIsValidConfirmation(true);
    } else {
      // Se não for uma confirmação válida, redirecionar para a página inicial após 3 segundos
      const timer = setTimeout(() => {
        navigate('/auth');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [navigate, location, user]);

  // Se não for uma confirmação válida, mostrar mensagem de erro
  if (!isValidConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-purple-50 p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Lição Jovem 7</h1>
            <p className="text-gray-600">Estudo diário de forma interativa</p>
          </div>

          <Card className="border-none shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-red-400 to-red-600"></div>
            
            <CardHeader className="pb-4 pt-8">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl">Acesso não autorizado</CardTitle>
            </CardHeader>
            
            <CardContent className="text-center pb-6">
              <p className="text-gray-600 mb-6">
                Esta página só pode ser acessada através do link de confirmação de e-mail.
                Você será redirecionado para a página de login em instantes.
              </p>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-3 pb-8">
              <Button 
                asChild 
                className="w-full bg-[#a37fb9] hover:bg-[#8a6aa0] text-white"
              >
                <Link to="/auth">
                  Ir para Login
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-purple-50 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Lição Jovem 7</h1>
          <p className="text-gray-600">Estudo diário de forma interativa</p>
        </div>

        <Card className="border-none shadow-lg overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-[#a37fb9] to-[#7957a0]"></div>
          
          <CardHeader className="pb-4 pt-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">E-mail Confirmado!</CardTitle>
          </CardHeader>
          
          <CardContent className="text-center pb-6">
            <p className="text-gray-600 mb-6">
              Sua conta foi verificada com sucesso. Agora você tem acesso completo à plataforma 
              Lição Jovem 7 e pode começar sua jornada de estudos bíblicos.
            </p>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-[#a37fb9] mr-2" />
                O que você pode fazer agora:
              </h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Acessar o conteúdo completo das lições</li>
                <li>• Acompanhar seu progresso no dashboard</li>
                <li>• Participar de discussões e compartilhar comentários</li>
                <li>• Completar quizzes para fixar o conteúdo</li>
              </ul>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-3 pb-8">
            <Button 
              asChild 
              className="w-full bg-[#a37fb9] hover:bg-[#8a6aa0] text-white"
            >
              <Link to="/dashboard">
                Ir para o Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              className="w-full border-[#a37fb9] text-[#a37fb9] hover:bg-[#a37fb9]/10"
            >
              <Link to="/estudos">
                Começar a Estudar
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>
            Precisa de ajuda? Entre em contato conosco pelo{" "}
            <a 
              href="mailto:ajuda@licaojovem7.com.br" 
              className="text-[#a37fb9] hover:underline"
            >
              ajuda@licaojovem7.com.br
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmPage; 