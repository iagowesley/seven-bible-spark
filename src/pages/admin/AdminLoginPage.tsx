import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ShieldAlert, LogIn } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const AdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { adminSignIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const success = await adminSignIn(username, password);
      if (success) {
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo ao painel administrativo.",
          variant: "default",
        });
        navigate('/admin');
      } else {
        setError('Credenciais inválidas. Tente novamente.');
        toast({
          title: "Falha no login",
          description: "Usuário ou senha incorretos.",
          variant: "destructive",
        });
      }
    } catch (err) {
      setError('Ocorreu um erro ao tentar fazer login.');
      toast({
        title: "Erro",
        description: "Não foi possível processar o login.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <CardHeader className="space-y-1 text-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-t-lg">
          <div className="flex justify-center mb-2">
            <ShieldAlert className="h-10 w-10 text-[#337945]" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#337945]">
            Acesso Administrativo
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Informe suas credenciais para acessar o painel de administração
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-6">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Nome de usuário</Label>
              <Input
                id="username"
                placeholder="Digite seu nome de usuário"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="border-primary/20"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
              </div>
              <Input
                id="password"
                placeholder="Digite sua senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-primary/20"
              />
            </div>
          </CardContent>
          
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#337945] to-[#337945] hover:from-[#337945] hover:to-[#337945]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" /> Entrar
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminLoginPage; 