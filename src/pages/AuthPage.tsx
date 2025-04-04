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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#a37fb9] p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img 
            src="/LOGO_LIÇÃO_JOVEM-removebg-preview (1).png" 
            alt="Lição Jovem" 
            className="h-24 mb-4"
          />
        </div>

        <Tabs
          defaultValue="login"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white">
            <TabsTrigger 
              value="login" 
              className="data-[state=active]:bg-[#a37fb9] data-[state=active]:text-white"
            >
              Entrar
            </TabsTrigger>
            <TabsTrigger 
              value="register"
              className="data-[state=active]:bg-[#a37fb9] data-[state=active]:text-white"
            >
              Cadastrar
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="bg-white border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
              <CardHeader>
                <CardTitle className="text-[#a37fb9] font-bold">Login</CardTitle>
                <CardDescription className="text-gray-600">
                  Entre com sua conta para acessar os estudos
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                          <FormLabel className="text-gray-800 font-medium">Senha</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="******"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-[#a37fb9] hover:bg-[#8a6aa0] text-white"
                    >
                      Entrar
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col items-center">
                <p className="text-sm text-muted-foreground">
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
            <Card className="bg-white border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
              <CardHeader>
                <CardTitle className="text-[#a37fb9] font-bold">Cadastro</CardTitle>
                <CardDescription className="text-gray-600">
                  Crie uma nova conta para acessar os estudos
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-[#a37fb9] hover:bg-[#8a6aa0] text-white"
                    >
                      Cadastrar
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col items-center">
                <p className="text-sm text-muted-foreground">
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
  );
}
