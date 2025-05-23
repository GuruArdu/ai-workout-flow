
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database.types';

const SUPABASE_URL = "https://iaycwyrtkkzltzmwubja.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlheWN3eXJ0a2t6bHR6bXd1YmphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NTU0OTUsImV4cCI6MjA2MTEzMTQ5NX0.Wp-xgFZwsoSQral_MDAw6INjwu-HuQarzKlkgOUijEY";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
