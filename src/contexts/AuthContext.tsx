import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: 'google' | 'apple' | 'facebook') => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ 
  children,
  experimentalBypass = false 
}: { 
  children: React.ReactNode;
  experimentalBypass?: boolean;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Determine if we should use experimental bypass
  const shouldBypass = experimentalBypass || 
    import.meta.env.DEV || 
    window.location.hostname.endsWith(".lovable.app");

  useEffect(() => {
    if (shouldBypass) {
      const mockUser = {
        id: 'preview-user',
        email: 'preview@example.com',
        role: 'authenticated',
      };
      setUser(mockUser as User);
      setSession({ user: mockUser } as Session);
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          navigate('/dashboard');
        } else if (event === 'SIGNED_OUT') {
          navigate('/');
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session) {
        navigate('/dashboard');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, shouldBypass]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in."
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account."
      });
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const signInWithProvider = async (provider: 'google' | 'apple' | 'facebook') => {
    try {
      toast({
        title: "Development Mode",
        description: "Social login is in development. Proceeding to dashboard..."
      });
      
      navigate('/dashboard');
      
    } catch (error: any) {
      console.log("Social login error (development):", error);
      navigate('/dashboard');
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You've been successfully logged out."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to log out: " + error.message,
        variant: "destructive"
      });
    }
  };

  const contextValue = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithProvider,
    isAuthenticated: shouldBypass ? true : !!user
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
