export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      bottles: {
        Row: {
          id: string
          name: string
          size_ml: number
          cost_per_unit: number
          stock: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          size_ml: number
          cost_per_unit?: number
          stock?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          size_ml?: number
          cost_per_unit?: number
          stock?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      car_requests: {
        Row: {
          id: string
          ticket_id: string | null
          status: string
          request_time: string | null
        }
        Insert: {
          id?: string
          ticket_id?: string | null
          status: string
          request_time?: string | null
        }
        Update: {
          id?: string
          ticket_id?: string | null
          status?: string
          request_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "car_requests_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          }
        ]
      }
      passwords: {
        Row: {
          id: string
          key: string
          value: string
          description: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          key: string
          value: string
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          key?: string
          value?: string
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tickets: {
        Row: {
          id: string
          ticket_number: string
          price: number
          company_name: string
          is_paid: boolean | null
          issue_date: string | null
          instructions: string | null
          ticket_type: string | null
          payment_method: string | null
        }
        Insert: {
          id?: string
          ticket_number: string
          price: number
          company_name: string
          is_paid?: boolean | null
          issue_date?: string | null
          instructions?: string | null
          ticket_type?: string | null
          payment_method?: string | null
        }
        Update: {
          id?: string
          ticket_number?: string
          price?: number
          company_name?: string
          is_paid?: boolean | null
          issue_date?: string | null
          instructions?: string | null
          ticket_type?: string | null
          payment_method?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      transaction_type: "sale" | "purchase" | "adjustment"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
