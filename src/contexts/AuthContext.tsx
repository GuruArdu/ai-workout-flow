import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { getVerifyRedirect } from '@/utils/getVerifyRedirect';
import { UserProfile } from '@/types/profile';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{error?: Error}>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: 'google' | 'apple' | 'facebook') => Promise<void>;
  isAuthenticated: boolean;
  loadUserProfile: (userId: string) => Promise<UserProfile | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user?.email_confirmed_at) {
            navigate('/dashboard');
          } else if (session?.user) {
            navigate('/verify-prompt');
          }
        } else if (event === 'SIGNED_OUT') {
          navigate('/');
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user?.email_confirmed_at) {
        navigate('/dashboard');
      } else if (session?.user) {
        navigate('/verify-prompt');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

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
      localStorage.setItem("pending_signup_email", email);
      
      const { error } = await supabase.auth.signUp({ 
        email, 
        password, 
        options: { emailRedirectTo: getVerifyRedirect() } 
      });
      
      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }
      
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account."
      });
      return {};
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive"
      });
      return { error };
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

  const loadUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data: row, error } = await supabase
        .from("profile")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
        return null;
      }
      
      // If no profile exists yet, create one
      if (!row || error?.code === 'PGRST116') {
        const { data: inserted, error: insertError } = await supabase
          .from("profile")
          .insert({ user_id: userId })
          .select()
          .single();
          
        if (insertError) {
          console.error("Error creating profile:", insertError);
          toast({
            title: "Error",
            description: "Failed to create profile",
            variant: "destructive"
          });
          return null;
        }
        
        return inserted as UserProfile;
      }
      
      return row as UserProfile;
    } catch (error) {
      console.error("Error in loadUserProfile:", error);
      return null;
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
    isAuthenticated: !!user,
    loadUserProfile
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
