
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: "E-mail inválido" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || ""
    );
    
    // Send newsletter welcome email
    const { error } = await supabaseClient.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        data: {
          subject: "Bem-vindo à Newsletter da Lição Seven",
          template_data: {
            user_name: email.split('@')[0],
            app_name: "Lição Seven",
            welcome_message: "Obrigado por se inscrever na nossa newsletter. Você receberá regularmente conteúdos exclusivos e novos estudos bíblicos diretamente no seu e-mail."
          }
        }
      }
    });
    
    if (error) {
      throw error;
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error sending welcome email:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Ocorreu um erro ao enviar o e-mail de boas-vindas" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
