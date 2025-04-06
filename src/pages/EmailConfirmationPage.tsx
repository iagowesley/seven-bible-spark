import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MailCheck, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const EmailConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const navigate = useNavigate();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const token = searchParams.get("confirmation_token");
        if (!token) {
          setStatus("error");
          toast({
            variant: "destructive",
            title: "Link inválido",
            description: "O link de confirmação está incompleto ou inválido.",
          });
          return;
        }

        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "signup",
        });

        if (error) {
          console.error("Erro ao confirmar email:", error);
          setStatus("error");
          toast({
            variant: "destructive",
            title: "Falha na confirmação",
            description: error.message || "Não foi possível confirmar seu email.",
          });
        } else {
          setStatus("success");
          toast({
            title: "Email confirmado!",
            description: "Seu email foi confirmado com sucesso.",
          });
        }
      } catch (error: any) {
        console.error("Erro inesperado:", error);
        setStatus("error");
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
        });
      }
    };

    confirmEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#a37fb9] to-[#7957a0] p-4">
      <Card className="w-full max-w-md bg-white shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 flex items-center justify-center mb-4 rounded-full bg-[#f5f0fa]">
            {status === "loading" && (
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#a37fb9] border-t-transparent"></div>
            )}
            {status === "success" && <CheckCircle className="h-10 w-10 text-green-500" />}
            {status === "error" && <AlertCircle className="h-10 w-10 text-red-500" />}
          </div>
          <CardTitle className="text-2xl font-semibold">
            {status === "loading" && "Confirmando seu email..."}
            {status === "success" && "Email confirmado com sucesso!"}
            {status === "error" && "Falha na confirmação"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">
            {status === "loading" && "Estamos processando sua confirmação. Isso levará apenas alguns segundos."}
            {status === "success" && "Obrigado por confirmar seu email. Sua conta está agora completamente ativada."}
            {status === "error" && "Não foi possível confirmar seu email. O link pode ter expirado ou ser inválido."}
          </p>
          
          {status === "success" && (
            <Button 
              onClick={() => navigate("/estudos")} 
              className="w-full bg-[#a37fb9] hover:bg-[#8a6aa0] text-white"
            >
              Ir para os Estudos
            </Button>
          )}
          
          {status === "error" && (
            <div className="flex flex-col space-y-2">
              <Button
                onClick={() => navigate("/auth")}
                className="w-full bg-[#a37fb9] hover:bg-[#8a6aa0] text-white"
              >
                Voltar para o Login
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Tentar novamente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmationPage;
