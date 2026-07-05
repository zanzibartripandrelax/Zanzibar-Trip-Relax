import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://mvmomzmgdnwwibwoznqk.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12bW9tem1nZG53d2lid296bnFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0ODYwNjAsImV4cCI6MjA5NzA2MjA2MH0.Nead2DiWsYm5ae4P64fbYuqEYrR4BNqZQY31oMuRCkU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Booking {
  id?: string;
  full_name: string;
  email?: string;
  whatsapp_number: string;
  number_of_guests: number;
  tour_name: string;
  preferred_date: string;
  pickup_location: string;
  message?: string;
  status?: string;
  created_at?: string;
}
