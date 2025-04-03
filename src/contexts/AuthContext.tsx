
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Database } from '@/integrations/supabase/types';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  profile: any | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: { full_name: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadingProfile: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const navigate = useNavigate();

  const fetchUserProfile = async (userId: string) => {
    setLoadingProfile(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        throw error;
      }
      
      setProfile(data);
    } catch (error: any) {
      console.error('Erro ao buscar perfil:', error.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    console.log("AuthProvider useEffect running");

    // Handle auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state change event:", event, "with session:", currentSession ? "exists" : "null");
        
        if (!mounted) return;

        if (event === 'SIGNED_IN') {
          console.log("User signed in - setting session");
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          if (currentSession?.user) {
            // Use setTimeout to avoid potential Supabase deadlock
            setTimeout(() => {
              if (mounted) fetchUserProfile(currentSession.user.id);
            }, 0);
          }
        } else if (event === 'TOKEN_REFRESHED') {
          console.log("Token refreshed - updating session");
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
        } else if (event === 'SIGNED_OUT') {
          console.log("User explicitly signed out");
          setSession(null);
          setUser(null);
          setProfile(null);
          navigate('/auth');
        } else if (event === 'USER_UPDATED') {
          console.log("User updated - updating user and session");
          if (currentSession) {
            setUser(currentSession.user);
            setSession(currentSession);
          }
        }
      }
    );

    // Initialize the session
    const initializeSession = async () => {
      try {
        console.log("Initializing session");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        const currentSession = data.session;
        
        if (!mounted) return;
        
        if (currentSession) {
          console.log("Initial session found", currentSession.user.id);
          setSession(currentSession);
          setUser(currentSession.user);
          
          if (currentSession.user) {
            await fetchUserProfile(currentSession.user.id);
          }
        } else {
          console.log("No initial session");
        }
      } catch (error: any) {
        console.error('Error fetching session:', error.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeSession();

    return () => {
      console.log("Cleanup auth provider");
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signUp = async (email: string, password: string, userData?: { full_name: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Cadastro realizado!",
        description: "Verifique seu e-mail para confirmar o registro.",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: error.message,
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting sign in with:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      console.log("Sign in successful, session:", data.session ? "exists" : "null");

      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo de volta!",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Sign in error:", error.message);
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: error.message,
      });
    }
  };

  const signOut = async () => {
    try {
      console.log("Attempting sign out");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      console.log("Sign out successful");
      toast({
        title: "Desconectado",
        description: "Você saiu da sua conta com sucesso.",
      });
      
      navigate('/');
    } catch (error: any) {
      console.error("Sign out error:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: error.message,
      });
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    loadingProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
