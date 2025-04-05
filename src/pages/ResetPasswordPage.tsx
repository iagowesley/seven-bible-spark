
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PasswordResetForm from "@/components/resetPassword/PasswordResetForm";
import SuccessMessage from "@/components/resetPassword/SuccessMessage";
import InvalidSessionMessage from "@/components/resetPassword/InvalidSessionMessage";
import { usePasswordResetSession } from "@/hooks/usePasswordResetSession";

export default function ResetPasswordPage() {
  const { isValidSession, resetComplete, setResetComplete, isLoading } = usePasswordResetSession();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Verificando sessão</CardTitle>
            <CardDescription className="text-center">
              Por favor, aguarde enquanto verificamos sua sessão...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!isValidSession && !resetComplete) {
    return <InvalidSessionMessage />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {resetComplete ? "Senha redefinida" : "Criar nova senha"}
          </CardTitle>
          <CardDescription className="text-center">
            {resetComplete 
              ? "Sua senha foi redefinida com sucesso" 
              : "Digite sua nova senha para continuar"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resetComplete ? (
            <SuccessMessage />
          ) : (
            <PasswordResetForm isValidSession={isValidSession} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
