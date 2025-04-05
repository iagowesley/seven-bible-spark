
import React, { useState } from "react";
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
import { ArrowLeft, Mail } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });

      if (error) {
        throw error;
      }

      setEmailSent(true);
      toast({
        title: "E-mail enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar e-mail",
        description: error.message || "Ocorreu um erro ao enviar o e-mail de recuperação.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-2 p-0 h-8 w-8" 
              onClick={() => navigate("/auth")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl">Recuperar senha</CardTitle>
          </div>
          <CardDescription>
            {!emailSent 
              ? "Digite seu e-mail para receber um link de recuperação de senha" 
              : "E-mail enviado! Verifique sua caixa de entrada para continuar o processo de recuperação."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!emailSent ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                          <Input
                            placeholder="seu@email.com"
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
                  {isSubmitting ? "Enviando..." : "Enviar link de recuperação"}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="text-center py-4">
              <Mail className="mx-auto h-12 w-12 text-[#a37fb9] mb-4" />
              <p className="text-sm text-gray-600 mb-4">
                Enviamos um e-mail para você com instruções para redefinir sua senha. 
                Por favor, verifique sua caixa de entrada e spam.
              </p>
              <Button 
                variant="outline" 
                className="mt-2" 
                onClick={() => navigate("/auth")}
              >
                Voltar para login
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          {!emailSent && (
            <Button 
              variant="link" 
              onClick={() => navigate("/auth")}
              className="text-[#a37fb9] hover:text-[#8a6aa0]"
            >
              Voltar para login
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
