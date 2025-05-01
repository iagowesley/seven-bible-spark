import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Calendar, ListChecks, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { adminSignOut, profile } = useAuth();
  
  const handleLogout = () => {
    adminSignOut();
    toast({
      title: "Logout realizado",
      description: "Você saiu do painel administrativo com sucesso.",
    });
    navigate('/admin/login');
  };
  
  const adminModules = [
    {
      title: 'Trimestres',
      description: 'Gerencie os trimestres do ano',
      icon: <Calendar className="h-8 w-8 mb-2" />,
      action: () => navigate('/admin/trimestres'),
    },
    {
      title: 'Semanas',
      description: 'Cadastre e gerencie as semanas de cada trimestre',
      icon: <BookOpen className="h-8 w-8 mb-2" />,
      action: () => navigate('/admin/trimestres'),
    },
    {
      title: 'Lições',
      description: 'Adicione lições diárias para cada semana',
      icon: <ListChecks className="h-8 w-8 mb-2" />,
      action: () => navigate('/admin/trimestres'),
    },
    {
      title: 'Configurações',
      description: 'Configure preferências do sistema',
      icon: <Settings className="h-8 w-8 mb-2" />,
      action: () => navigate('/admin/configuracoes'),
      disabled: true,
    },
  ];
  
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
          <p className="text-muted-foreground">
            Gerencie todo o conteúdo do estudo semanal neste painel.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-right">
            <p className="font-medium">Logado como</p>
            <p className="text-muted-foreground">{profile.name}</p>
          </div>
          <Button 
            variant="outline" 
            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminModules.map((module, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center">{module.icon}</div>
              <CardTitle>{module.title}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow"></CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={module.action}
                disabled={module.disabled}
              >
                Acessar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-12 bg-muted p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Guia Rápido</h2>
        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="font-medium">Crie um trimestre</h3>
              <p className="text-sm text-muted-foreground">
                Comece criando um trimestre, que organizará suas semanas de estudo.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 items-start">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="font-medium">Adicione semanas ao trimestre</h3>
              <p className="text-sm text-muted-foreground">
                Para cada trimestre, cadastre até 13 semanas com seus respectivos títulos e subtítulos.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 items-start">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="font-medium">Cadastre lições para cada dia da semana</h3>
              <p className="text-sm text-muted-foreground">
                Em cada semana, adicione lições para os 7 dias (domingo a sábado).
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 items-start">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
              4
            </div>
            <div>
              <h3 className="font-medium">Visualize no site</h3>
              <p className="text-sm text-muted-foreground">
                Depois de cadastradas, as lições estarão disponíveis para visualização no site.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage; 