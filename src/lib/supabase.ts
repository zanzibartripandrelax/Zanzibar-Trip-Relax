import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://mvmomzmgdnwwibwoznqk.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12bW9tem1nZG53d2lid296bnFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0ODYwNjAsImV4cCI6MjA5NzA2MjA2MH0.Nead2DiWsYm5ae4P64fbYuqEYrR4BNqZQY31oMuRCkU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadToSupabaseStorage(file: File, folder = 'media'): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${folder}/${Date.now()}_${cleanFileName}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.warn('Supabase storage bucket upload notice:', error.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('media')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.warn('Supabase storage fallback:', err);
    return null;
  }
}

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
