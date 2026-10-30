export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "user" | "admin";
export type RideStatus = "open" | "full" | "cancelled" | "completed";
export type BookingStatus = "pending" | "accepted" | "rejected" | "cancelled" | "completed";
export type RiderVerification = "none" | "pending" | "approved" | "rejected";
export type ReportStatus = "open" | "reviewed" | "dismissed" | "actioned";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          bio: string | null;
          phone: string | null;
          preferred_language: "en" | "hi" | "mr";
          role: UserRole;
          is_banned: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id: string;
          full_name: string;
          avatar_url?: string | null;
          bio?: string | null;
          phone?: string | null;
          preferred_language?: "en" | "hi" | "mr";
          role?: UserRole;
          is_banned?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      rider_profiles: {
        Row: {
          user_id: string;
          bike_model: string;
          registration_number: string;
          licence_number: string;
          helmet_available: boolean;
          bike_photo_path: string | null;
          licence_doc_path: string | null;
          rc_doc_path: string | null;
          verification: RiderVerification;
          verification_note: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          bike_model: string;
          registration_number: string;
          licence_number: string;
          helmet_available?: boolean;
          bike_photo_path?: string | null;
          licence_doc_path?: string | null;
          rc_doc_path?: string | null;
          verification?: RiderVerification;
          verification_note?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["rider_profiles"]["Insert"]>;
      };
      rides: {
        Row: {
          id: string;
          rider_id: string;
          from_place: string;
          to_place: string;
          from_lat: number;
          from_lng: number;
          to_lat: number;
          to_lng: number;
          depart_at: string;
          seats_total: number;
          seats_available: number;
          contribution_inr: number;
          distance_km: number;
          notes: string | null;
          helmet_available: boolean;
          status: RideStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          rider_id: string;
          from_place: string;
          to_place: string;
          from_lat: number;
          from_lng: number;
          to_lat: number;
          to_lng: number;
          depart_at: string;
          seats_total: number;
          seats_available: number;
          contribution_inr: number;
          distance_km: number;
          notes?: string | null;
          helmet_available?: boolean;
          status?: RideStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["rides"]["Insert"]>;
      };
      bookings: {
        Row: {
          id: string;
          ride_id: string;
          passenger_id: string;
          status: BookingStatus;
          helmet_confirmed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ride_id: string;
          passenger_id: string;
          status?: BookingStatus;
          helmet_confirmed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
      };
      messages: {
        Row: {
          id: string;
          ride_id: string;
          sender_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          ride_id: string;
          sender_id: string;
          body: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          payload: Json;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          payload?: Json;
          read_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
      emergency_contacts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          phone: string;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          phone: string;
          email?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["emergency_contacts"]["Insert"]>;
      };
    };
    Views: {
      public_profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          bio: string | null;
          preferred_language: string;
        };
      };
      public_rider_profiles: {
        Row: {
          user_id: string;
          bike_model: string;
          helmet_available: boolean;
          is_verified: boolean;
        };
      };
    };
  };
}
