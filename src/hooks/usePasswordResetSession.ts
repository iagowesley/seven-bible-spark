
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function usePasswordResetSession() {
  const navigate = useNavigate();
  const [isValidSession, setIsValidSession] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      console.log("Checking session...");
      const { data, error } = await supabase.auth.getSession();
      console.log("Session data:", data);
      console.log("Session error:", error);
      
      if (error) {
        console.error("Erro ao verificar sessão:", error);
        toast({
          variant: "destructive",
          title: "Sessão inválida",
          description: "O link de redefinição de senha expirou ou é inválido. Por favor, solicite um novo.",
        });
        setTimeout(() => navigate("/auth"), 3000);
        setIsLoading(false);
        return;
      }

      if (data.session) {
        console.log("Valid session found");
        setIsValidSession(true);
        setIsLoading(false);
      } else {
        // Check for hash parameters indicating password reset
        const hash = window.location.hash;
        if (hash && hash.includes('type=recovery')) {
          console.log("Recovery hash found:", hash);
          // If hash exists, we're coming from a recovery email
          // Supabase will handle this automatically, just wait for session
          const unsubscribe = supabase.auth.onAuthStateChange((event, session) => {
            console.log("Auth state change:", event);
            if (event === 'PASSWORD_RECOVERY') {
              console.log("Password recovery event detected");
              setIsValidSession(true);
              setIsLoading(false);
              unsubscribe.data.subscription.unsubscribe();
            }
          });
          return;
        }
        
        console.log("No valid session found");
        toast({
          variant: "destructive",
          title: "Sessão inválida",
          description: "O link de redefinição de senha expirou ou é inválido. Por favor, solicite um novo.",
        });
        setTimeout(() => navigate("/auth"), 3000);
        setIsLoading(false);
      }
    };

    checkSession();
  }, [navigate]);

  return { isValidSession, resetComplete, setResetComplete, isLoading };
}
