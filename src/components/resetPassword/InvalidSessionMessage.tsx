
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";

export default function InvalidSessionMessage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Link inválido</CardTitle>
          <CardDescription className="text-center">
            O link de redefinição de senha expirou ou é inválido.
            Você será redirecionado para a página de login.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center pt-2">
          <Button onClick={() => navigate("/auth")}>
            Ir para login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
