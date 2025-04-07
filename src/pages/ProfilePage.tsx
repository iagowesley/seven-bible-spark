
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Camera, User, Globe, Mail } from "lucide-react";

const profileSchema = z.object({
  username: z.string().min(3, "Nome de usuário deve ter pelo menos 3 caracteres"),
  full_name: z.string().min(3, "Nome completo deve ter pelo menos 3 caracteres"),
  website: z.string().url("URL inválida").optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const ProfilePage = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      full_name: "",
      website: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        username: profile.username || "",
        full_name: profile.full_name || "",
        website: profile.website || "",
      });
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: values.username,
          full_name: values.full_name,
          website: values.website || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar perfil",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) return;
    if (!user) return;

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `avatars/${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    setUploading(true);

    try {
      // Fazer o upload para o bucket 'img'
      const { error: uploadError } = await supabase.storage
        .from('img')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obter a URL pública do arquivo
      const { data } = supabase.storage
        .from('img')
        .getPublicUrl(filePath);

      // Atualizar o perfil do usuário com a nova URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: data.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Atualizar o estado local
      setAvatarUrl(data.publicUrl);

      toast({
        title: "Foto atualizada",
        description: "Sua foto de perfil foi atualizada com sucesso.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar foto",
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (name: string = "") => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow seven-container py-6 px-4 sm:py-10 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">Meu perfil</h1>

          <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
            <div className="w-full lg:w-1/3">
              <Card className="text-center overflow-hidden">
                <CardHeader className="pb-0 px-4">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-3">
                      <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                        <AvatarImage src={avatarUrl || undefined} alt="Foto de perfil" />
                        <AvatarFallback className="text-xl bg-gradient-to-r from-seven-purple to-seven-blue text-white">
                          {getInitials(profile?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 -right-2">
                        <label
                          htmlFor="avatar-upload"
                          className="w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer shadow-md"
                        >
                          <Camera className="h-4 w-4 text-white" />
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={uploadAvatar}
                            disabled={uploading}
                          />
                        </label>
                      </div>
                    </div>
                    <CardTitle className="text-lg sm:text-xl truncate w-full max-w-full">
                      {profile?.full_name || "Usuário"}
                    </CardTitle>
                    <CardDescription className="mt-1 truncate w-full max-w-full">
                      @{profile?.username || "usuário"}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-3 pb-4 px-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground break-all">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm truncate">{profile?.email || "Email não disponível"}</span>
                    </div>
                    {profile?.website && (
                      <div className="flex items-center gap-2 text-muted-foreground break-all">
                        <Globe className="h-4 w-4 flex-shrink-0" />
                        <a 
                          href={profile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm truncate hover:text-primary max-w-full"
                          title={profile.website}
                        >
                          {profile.website}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="w-full lg:w-2/3">
              <Card>
                <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                  <CardTitle className="text-lg sm:text-xl">Editar informações</CardTitle>
                  <CardDescription>Atualize suas informações de perfil</CardDescription>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <User className="h-4 w-4" /> Nome de usuário
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Seu nome de usuário" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <User className="h-4 w-4" /> Nome completo
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Seu nome completo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Globe className="h-4 w-4" /> Site
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="https://seu-site.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" disabled={loading || uploading} className="w-full">
                        {loading ? "Salvando..." : "Salvar alterações"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
