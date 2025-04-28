
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const isDevEnvironment = Deno.env.get('NODE_ENV') === 'development';
  
  if (!isDevEnvironment) {
    return new Response(
      JSON.stringify({ error: 'This endpoint is only available in development' }), 
      { 
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  // Set mock session for development
  const mockSession = {
    user: {
      id: 'dev-user',
      email: 'dev@example.com',
      role: 'authenticated',
    },
    expires_at: Date.now() + 3600000 // 1 hour from now
  };

  return new Response(
    JSON.stringify({ session: mockSession }), 
    { 
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Set-Cookie': `sb-auth-token=${JSON.stringify(mockSession)}; Path=/; HttpOnly`
      }
    }
  );
});
