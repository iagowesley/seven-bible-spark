
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LockKeyhole, CheckCircle } from "lucide-react";

const resetPasswordSchema = z.object({
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não correspondem",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);

  // Check if we have a valid session from the password reset link
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Erro ao verificar sessão:", error);
        toast({
          variant: "destructive",
          title: "Sessão inválida",
          description: "O link de redefinição de senha expirou ou é inválido. Por favor, solicite um novo.",
        });
        setTimeout(() => navigate("/auth"), 3000);
        return;
      }

      if (data.session) {
        setIsValidSession(true);
      } else {
        toast({
          variant: "destructive",
          title: "Sessão inválida",
          description: "O link de redefinição de senha expirou ou é inválido. Por favor, solicite um novo.",
        });
        setTimeout(() => navigate("/auth"), 3000);
      }
    };

    checkSession();
  }, [navigate]);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!isValidSession) {
      toast({
        variant: "destructive",
        title: "Sessão inválida",
        description: "Por favor, solicite um novo link de redefinição de senha.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        throw error;
      }

      // Reset password successful
      setResetComplete(true);
      toast({
        title: "Senha redefinida com sucesso",
        description: "Sua senha foi alterada. Você será redirecionado para fazer login.",
      });

      // Redirect to login after a delay
      setTimeout(() => {
        navigate("/auth");
      }, 3000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao redefinir senha",
        description: error.message || "Ocorreu um erro ao redefinir sua senha. Por favor, tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isValidSession && !resetComplete) {
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
            <div className="text-center py-6">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <p className="text-sm text-gray-600">
                Sua senha foi alterada com sucesso. Você será redirecionado para a página de login em instantes.
              </p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                          <Input
                            type="password"
                            placeholder="******"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar nova senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                          <Input
                            type="password"
                            placeholder="******"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-[#a37fb9] hover:bg-[#8a6aa0]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Redefinindo..." : "Redefinir senha"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
