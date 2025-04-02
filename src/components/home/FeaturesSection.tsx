
import React from "react";
import { BookOpen, Award, MessageSquare, Layout, Download } from "lucide-react";

type FeatureProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
};

const Feature: React.FC<FeatureProps> = ({ icon, title, description, delay }) => {
  return (
    <div 
      className="flex flex-col items-center p-6 text-center card-hover"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-5 w-16 h-16 rounded-circle bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: <BookOpen className="h-8 w-8 text-seven-blue" />,
      title: "Estudos Interativos",
      description: "Lições dinâmicas com questionários, vídeos e material complementar para aprofundar seu conhecimento.",
      delay: 100
    },
    {
      icon: <Award className="h-8 w-8 text-seven-purple" />,
      title: "Sistema de Gamificação",
      description: "Ganhe pontos, conquistas e participe de desafios semanais ao completar seus estudos.",
      delay: 200
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-seven-gold" />,
      title: "Fórum de Discussões",
      description: "Compartilhe ideias e participe de debates sobre os tópicos das lições com outros usuários.",
      delay: 300
    },
    {
      icon: <Layout className="h-8 w-8 text-seven-blue" />,
      title: "Dashboard Personalizado",
      description: "Acompanhe seu progresso, acesse seu histórico de estudos e salve suas lições favoritas.",
      delay: 400
    },
    {
      icon: <Download className="h-8 w-8 text-seven-purple" />,
      title: "Modo Offline",
      description: "Baixe as lições para estudar sem conexão à internet, onde e quando quiser.",
      delay: 500
    }
  ];

  return (
    <section id="features" className="py-16 sm:py-24">
      <div className="seven-container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Recursos do <span className="text-primary">Lição Jovem Seven</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Desenvolvemos ferramentas poderosas para transformar seu estudo bíblico em uma experiência moderna e envolvente.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Feature
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={feature.delay}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
