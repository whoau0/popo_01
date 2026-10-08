import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://voiofojgktvmwspnwgdr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvaW9mb2pna3R2bXdzcG53Z2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyNjAwMTEsImV4cCI6MjEwNjgzNjAxMX0.kmIAmNgeGUqzCD7z68oJWl_9WevtAm8CjYdQj3yRv6M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SavedPlanRecord {
  id: string;
  created_at: string;
  family_size: string;
  preset: string;
  plan_data: any;
}

// Helper to save plan to Supabase or fallback to LocalStorage
export async function saveMealPlanToSupabase(plan: any, meta: { familySize: string; preset: string }) {
  try {
    const { data, error } = await supabase
      .from('meal_plans')
      .insert([
        {
          family_size: meta.familySize,
          preset: meta.preset,
          plan_data: plan,
        },
      ])
      .select();

    if (error) {
      console.warn('Supabase save notice (falling back to LocalStorage):', error.message);
    }
    return data;
  } catch (err) {
    console.warn('Supabase offline or table missing, local cache active:', err);
    return null;
  }
}
