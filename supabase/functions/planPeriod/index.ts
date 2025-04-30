
// deno: edge runtime
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Helper function for JSON error responses
const jsonError = (message: string, status: number) => {
  return new Response(
    JSON.stringify({ error: message }), 
    { status: status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    let input;
    
    try {
      input = JSON.parse(body);
    } catch (e) {
      return jsonError("Invalid JSON body", 400);
    }
    
    // Extract userId and period from request body
    const { userId, period } = input;
    
    if (!userId) {
      return jsonError("userId required", 400);
    }
    
    if (!period || !["week", "month"].includes(period)) {
      return jsonError("Valid period (week/month) required", 400);
    }
    
    // Special handling for dev mode
    const isDevUser = userId === "0000-preview-user";
    
    // Only verify authentication for non-dev users
    if (!isDevUser) {
      // Get authentication token from request header
      const authHeader = req.headers.get('Authorization');
      
      if (!authHeader) {
        return jsonError("Authentication required", 401);
      }
      
      const token = authHeader.replace('Bearer ', '');
      
      // Verify the token and get user info
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return jsonError("Invalid token or user not found", 401);
      }
      
      // Ensure the userId matches the authenticated user
      if (userId !== user.id) {
        return jsonError("Unauthorized: User ID mismatch", 403);
      }
    } else {
      console.log("Development mode: Using preview user");
    }
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profile")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
      
    if (profileError && profileError.code !== 'PGRST116') {
      return jsonError(`Failed to fetch profile: ${profileError.message}`, 500);
    }
    
    if (!profile) {
      return jsonError("Profile not found. Please complete your profile first.", 400);
    }

    // Generate a dummy plan ID for demonstration
    const planId = crypto.randomUUID();
    
    // Return the plan ID
    return new Response(
      JSON.stringify({ planId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in planPeriod function:", error);
    return jsonError(`Internal server error: ${error.message}`, 500);
  }
});
