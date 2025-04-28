
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    // Extract the session ID from the URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication required" }), { 
        status: 401,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    
    // Extract the JWT token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Create a Supabase client using the API URL and anon key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://iaycwyrtkkzltzmwubja.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlheWN3eXJ0a2t6bHR6bXd1YmphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NTU0OTUsImV4cCI6MjA2MTEzMTQ5NX0.Wp-xgFZwsoSQral_MDAw6INjwu-HuQarzKlkgOUijEY';
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });
    
    // Get the user ID from the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token or user not found" }), { 
        status: 401,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }

    const userId = user.id;
    console.log("Fetching workout session:", id);

    // Fetch the workout session from the database
    const { data: session, error } = await supabase
      .from('workout_session')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: "Workout session not found" }), { 
        status: 404,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }

    console.log("Found workout session:", session);

    return new Response(JSON.stringify(session), { 
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    console.error("Error fetching workout session:", err);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
});
