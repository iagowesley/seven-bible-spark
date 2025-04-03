
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        variant: "destructive",
        title: "E-mail inválido",
        description: "Por favor, insira um endereço de e-mail válido.",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check if email already exists
      const { data: existingSubscriber, error: checkError } = await supabase
        .from('newsletter_subscribers')
        .select('id')
        .eq('email', email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingSubscriber) {
        toast({
          title: "E-mail já cadastrado",
          description: "Você já está inscrito em nossa newsletter.",
        });
        return;
      }
      
      // Store the email in newsletter_subscribers
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert({ email });
        
      if (insertError) throw insertError;
      
      // Call the edge function to send a welcome email
      const { error: emailError } = await supabase.functions.invoke('send-newsletter-welcome', {
        body: { email },
      });
      
      if (emailError) throw emailError;
      
      toast({
        title: "Inscrição confirmada!",
        description: "Você receberá nossas novidades em breve. Verifique sua caixa de entrada.",
      });
      
      setEmail("");
    } catch (error: any) {
      console.error("Error subscribing to newsletter:", error);
      toast({
        variant: "destructive",
        title: "Erro ao se inscrever",
        description: error.message || "Ocorreu um erro ao processar sua inscrição. Por favor, tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
      <Input
        type="email"
        placeholder="Seu e-mail"
        className="rounded-full"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isSubmitting}
      />
      <Button 
        type="submit" 
        className="rounded-full" 
        disabled={isSubmitting}
      >
        {isSubmitting ? "Enviando..." : "Inscrever-se"}
      </Button>
    </form>
  );
}
