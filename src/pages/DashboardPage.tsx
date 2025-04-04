import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProgressCard from "@/components/study/ProgressCard";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getTotalCompletedLessons } from "@/models/userProgress";

const DashboardPage = () => {
  const { user } = useAuth();

  // Obter total de lições completadas
  const { data: completedLessons = 0, isLoading } = useQuery({
    queryKey: ['completedLessons', user?.id],
    queryFn: () => user ? getTotalCompletedLessons(user.id) : Promise.resolve(0),
    enabled: !!user
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="seven-container px-4 sm:px-6">
          {/* Cabeçalho */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Seu dashboard</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Acompanhe seu progresso nos estudos
            </p>
          </div>
          
          {/* Card de Progresso */}
          <div className="max-w-xl mx-auto">
            {isLoading ? (
              <div className="h-56 bg-muted animate-pulse rounded-md"></div>
            ) : (
              <ProgressCard 
                completedLessons={completedLessons} 
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
