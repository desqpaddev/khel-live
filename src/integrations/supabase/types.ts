export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      discounts: {
        Row: {
          affiliate_source: string | null
          code: string | null
          created_at: string
          description: string | null
          discount_type: string
          discount_unit: string
          discount_value: number
          event_id: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          min_group_size: number | null
          min_past_events: number | null
          name: string
          ticket_id: string | null
          updated_at: string
          used_count: number
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          affiliate_source?: string | null
          code?: string | null
          created_at?: string
          description?: string | null
          discount_type: string
          discount_unit?: string
          discount_value?: number
          event_id?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_group_size?: number | null
          min_past_events?: number | null
          name: string
          ticket_id?: string | null
          updated_at?: string
          used_count?: number
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          affiliate_source?: string | null
          code?: string | null
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_unit?: string
          discount_value?: number
          event_id?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_group_size?: number | null
          min_past_events?: number | null
          name?: string
          ticket_id?: string | null
          updated_at?: string
          used_count?: number
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discounts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discounts_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          age_groups: string[]
          category: string
          city: string
          created_at: string
          created_by: string | null
          description: string | null
          event_date: string
          event_time: string
          featured: boolean | null
          id: string
          price: number
          sport: string
          status: string
          title: string
          total_spots: number
          updated_at: string
          venue: string
        }
        Insert: {
          age_groups?: string[]
          category: string
          city: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date: string
          event_time: string
          featured?: boolean | null
          id?: string
          price?: number
          sport: string
          status?: string
          title: string
          total_spots?: number
          updated_at?: string
          venue: string
        }
        Update: {
          age_groups?: string[]
          category?: string
          city?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date?: string
          event_time?: string
          featured?: boolean | null
          id?: string
          price?: number
          sport?: string
          status?: string
          title?: string
          total_spots?: number
          updated_at?: string
          venue?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_group: string | null
          avatar_url: string | null
          board: string | null
          city: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          school: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age_group?: string | null
          avatar_url?: string | null
          board?: string | null
          city?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          school?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age_group?: string | null
          avatar_url?: string | null
          board?: string | null
          city?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          school?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      registrations: {
        Row: {
          address: string | null
          age_group: string | null
          airport_transfer: string | null
          bib_number: string | null
          blood_group: string | null
          board: string | null
          breakfast_preference: string | null
          checked_in: boolean
          checked_in_at: string | null
          child_name: string | null
          city: string | null
          club_organization: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          event_id: string
          event_tshirt: string | null
          first_name: string | null
          first_time_participation: string | null
          gender: string | null
          hotel_accommodation: string | null
          id: string
          id_number: string | null
          last_name: string | null
          parent_name: string | null
          payment_status: string
          phone: string
          photo_id_type: string | null
          pincode: string | null
          registration_number: string | null
          school: string | null
          state_country: string | null
          status: string
          swimming_expertise: string | null
          terms_accepted: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          age_group?: string | null
          airport_transfer?: string | null
          bib_number?: string | null
          blood_group?: string | null
          board?: string | null
          breakfast_preference?: string | null
          checked_in?: boolean
          checked_in_at?: string | null
          child_name?: string | null
          city?: string | null
          club_organization?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          event_id: string
          event_tshirt?: string | null
          first_name?: string | null
          first_time_participation?: string | null
          gender?: string | null
          hotel_accommodation?: string | null
          id?: string
          id_number?: string | null
          last_name?: string | null
          parent_name?: string | null
          payment_status?: string
          phone: string
          photo_id_type?: string | null
          pincode?: string | null
          registration_number?: string | null
          school?: string | null
          state_country?: string | null
          status?: string
          swimming_expertise?: string | null
          terms_accepted?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          age_group?: string | null
          airport_transfer?: string | null
          bib_number?: string | null
          blood_group?: string | null
          board?: string | null
          breakfast_preference?: string | null
          checked_in?: boolean
          checked_in_at?: string | null
          child_name?: string | null
          city?: string | null
          club_organization?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          event_id?: string
          event_tshirt?: string | null
          first_name?: string | null
          first_time_participation?: string | null
          gender?: string | null
          hotel_accommodation?: string | null
          id?: string
          id_number?: string | null
          last_name?: string | null
          parent_name?: string | null
          payment_status?: string
          phone?: string
          photo_id_type?: string | null
          pincode?: string | null
          registration_number?: string | null
          school?: string | null
          state_country?: string | null
          status?: string
          swimming_expertise?: string | null
          terms_accepted?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      results: {
        Row: {
          certificate_url: string | null
          created_at: string
          distance_recorded: string | null
          event_id: string
          id: string
          medal: string | null
          notes: string | null
          position: number | null
          registration_id: string
          score: number | null
          time_recorded: string | null
          updated_at: string
        }
        Insert: {
          certificate_url?: string | null
          created_at?: string
          distance_recorded?: string | null
          event_id: string
          id?: string
          medal?: string | null
          notes?: string | null
          position?: number | null
          registration_id: string
          score?: number | null
          time_recorded?: string | null
          updated_at?: string
        }
        Update: {
          certificate_url?: string | null
          created_at?: string
          distance_recorded?: string | null
          event_id?: string
          id?: string
          medal?: string | null
          notes?: string | null
          position?: number | null
          registration_id?: string
          score?: number | null
          time_recorded?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "results_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          attendee_message: string | null
          created_at: string
          description: string | null
          event_id: string
          id: string
          price: number
          quantity: number
          sale_end: string | null
          sale_start: string | null
          status: string
          ticket_type: string
          updated_at: string
        }
        Insert: {
          attendee_message?: string | null
          created_at?: string
          description?: string | null
          event_id: string
          id?: string
          price?: number
          quantity?: number
          sale_end?: string | null
          sale_start?: string | null
          status?: string
          ticket_type: string
          updated_at?: string
        }
        Update: {
          attendee_message?: string | null
          created_at?: string
          description?: string | null
          event_id?: string
          id?: string
          price?: number
          quantity?: number
          sale_end?: string | null
          sale_start?: string | null
          status?: string
          ticket_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_event_spots_left: { Args: { event_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
