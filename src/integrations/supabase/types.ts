export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed: boolean
          id: string
          last_accessed: string
          lesson_id: string
          points_earned: number
          progress: number
          user_id: string
        }
        Insert: {
          completed?: boolean
          id?: string
          last_accessed?: string
          lesson_id: string
          points_earned?: number
          progress?: number
          user_id: string
        }
        Update: {
          completed?: boolean
          id?: string
          last_accessed?: string
          lesson_id?: string
          points_earned?: number
          progress?: number
          user_id?: string
        }
        Relationships: []
      }
      trimestres: {
        Row: {
          id: string
          nome: string
          ano: number
          trimestre: string
          created_at: string
          img_url: string | null
        }
        Insert: {
          id?: string
          nome: string
          ano: number
          trimestre: string
          created_at?: string
          img_url?: string | null
        }
        Update: {
          id?: string
          nome?: string
          ano?: number
          trimestre?: string
          created_at?: string
          img_url?: string | null
        }
        Relationships: []
      }
      semanas: {
        Row: {
          id: string
          trimestre_id: string
          numero: number
          titulo: string
          texto_biblico_chave: string
          resumo: string
          img_sabado_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trimestre_id: string
          numero: number
          titulo: string
          texto_biblico_chave: string
          resumo: string
          img_sabado_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trimestre_id?: string
          numero?: number
          titulo?: string
          texto_biblico_chave?: string
          resumo?: string
          img_sabado_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "semanas_trimestre_id_fkey"
            columns: ["trimestre_id"]
            referencedRelation: "trimestres"
            referencedColumns: ["id"]
          }
        ]
      }
      licoes: {
        Row: {
          id: string
          semana_id: string
          dia: string
          texto1: string
          texto2: string
          resumo: string
          hashtags: string
          created_at: string
          texto_biblico_chave: string | null
          titulo_dia: string | null
          subtitulo_dia: string | null
          perguntas: string | null
        }
        Insert: {
          id?: string
          semana_id: string
          dia: string
          texto1: string
          texto2: string
          resumo: string
          hashtags: string
          created_at?: string
          texto_biblico_chave?: string | null
          titulo_dia?: string | null
          subtitulo_dia?: string | null
          perguntas?: string | null
        }
        Update: {
          id?: string
          semana_id?: string
          dia?: string
          texto1?: string
          texto2?: string
          resumo?: string
          hashtags?: string
          created_at?: string
          texto_biblico_chave?: string | null
          titulo_dia?: string | null
          subtitulo_dia?: string | null
          perguntas?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "licoes_semana_id_fkey"
            columns: ["semana_id"]
            referencedRelation: "semanas"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
