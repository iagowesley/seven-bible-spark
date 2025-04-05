
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, LogInIcon, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

const registerSchema = z.object({
  full_name: z.string().min(3, "O nome completo deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não correspondem",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = async (values: LoginFormValues) => {
    await signIn(values.email, values.password);
  };

  const onRegisterSubmit = async (values: RegisterFormValues) => {
    await signUp(values.email, values.password, {
      full_name: values.full_name,
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo - Imagem da lição */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#a37fb9] to-[#7957a0] items-center justify-center p-6 relative">
        <div className="max-w-sm">
          <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-sm py-2 px-4 rounded-full text-white font-medium">
            Lição Jovem 7
          </div>
          
          <img 
            src="/cover.png" 
            alt="Lição Jovem - Adoração" 
            className="w-full object-contain rounded-lg z-10"
          />
          
         
        </div>
      </div>
      
      {/* Lado direito - Formulários */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-6">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {activeTab === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
            </h2>
            <p className="text-gray-600">
              {activeTab === "login" 
                ? "Entre com suas credenciais para continuar" 
                : "Cadastre-se para começar sua jornada de estudos"
              }
            </p>
          </div>

          <Tabs
            defaultValue="login"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-[#a37fb9] data-[state=active]:text-white"
              >
                <LogInIcon className="h-4 w-4 mr-2" />
                Entrar
              </TabsTrigger>
              <TabsTrigger 
                value="register"
                className="data-[state=active]:bg-[#a37fb9] data-[state=active]:text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Cadastrar
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card className="border-none shadow-none">
                <CardContent className="p-0">
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-800 font-medium">E-mail</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="seu@email.com"
                                className="rounded-md border-gray-300 focus:border-[#a37fb9] focus:ring-[#a37fb9]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between items-center">
                              <FormLabel className="text-gray-800 font-medium">Senha</FormLabel>
                              <Link 
                                to="/esqueci-senha" 
                                className="text-sm text-[#a37fb9] hover:text-[#8a6aa0]"
                              >
                                Esqueceu?
                              </Link>
                            </div>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="******"
                                className="rounded-md border-gray-300 focus:border-[#a37fb9] focus:ring-[#a37fb9]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full bg-[#a37fb9] hover:bg-[#8a6aa0] text-white h-11 rounded-md mt-6"
                      >
                        Entrar
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col items-center pt-6 pb-0 px-0">
                  <p className="text-sm text-gray-600">
                    Não tem uma conta?{" "}
                    <Button
                      variant="link"
                      className="p-0 text-[#a37fb9] hover:text-[#8a6aa0]"
                      onClick={() => setActiveTab("register")}
                    >
                      Cadastre-se
                    </Button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card className="border-none shadow-none">
                <CardContent className="p-0">
                  <Form {...registerForm}>
                    <form
                      onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={registerForm.control}
                        name="full_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-800 font-medium">Nome completo</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Seu nome completo"
                                className="rounded-md border-gray-300 focus:border-[#a37fb9] focus:ring-[#a37fb9]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-800 font-medium">E-mail</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="seu@email.com"
                                className="rounded-md border-gray-300 focus:border-[#a37fb9] focus:ring-[#a37fb9]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-800 font-medium">Senha</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="******"
                                className="rounded-md border-gray-300 focus:border-[#a37fb9] focus:ring-[#a37fb9]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-800 font-medium">Confirmar senha</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="******"
                                className="rounded-md border-gray-300 focus:border-[#a37fb9] focus:ring-[#a37fb9]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full bg-[#a37fb9] hover:bg-[#8a6aa0] text-white h-11 rounded-md mt-6"
                      >
                        Criar conta
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col items-center pt-6 pb-0 px-0">
                  <p className="text-sm text-gray-600">
                    Já tem uma conta?{" "}
                    <Button
                      variant="link"
                      className="p-0 text-[#a37fb9] hover:text-[#8a6aa0]"
                      onClick={() => setActiveTab("login")}
                    >
                      Entre aqui
                    </Button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
