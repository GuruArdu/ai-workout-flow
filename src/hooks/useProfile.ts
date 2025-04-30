
import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useDevUser, DEV_ID } from "@/hooks/useDevUser";
import { UserProfile } from "@/types/profile";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext"; 

export const useProfile = () => {
  const { user } = useAuth();
  const devUser = useDevUser();
  const userId = user?.id ?? devUser?.id ?? null;
  const [loading, setLoading] = useState(false);

  /** Loads profile row; creates blank row if none (dev mode or first login) */
  const getProfile = useCallback(async () => {
    if (!userId) return null;
    
    setLoading(true);
    try {
      // Try to get the profile
      let { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("user_id", userId)
        .single();
        
      if (error && error.code === "PGRST116") {
        // Create empty row if not found
        const { error: insertError } = await supabase
          .from("profile")
          .insert({ user_id: userId });
          
        if (insertError) throw insertError;
        
        // Fetch the newly created profile
        const { data: newData, error: fetchError } = await supabase
          .from("profile")
          .select("*")
          .eq("user_id", userId)
          .single();
          
        if (fetchError) throw fetchError;
        data = newData;
      } else if (error) {
        throw error;
      }
      
      return data as UserProfile;
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /** Upsert profile fields and refresh */
  const saveProfile = useCallback(async (fields: Partial<UserProfile>) => {
    if (!userId) throw new Error("No user_id");
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profile")
        .upsert({ 
          user_id: userId, 
          ...fields, 
          updated_at: new Date().toISOString() 
        });
        
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully saved"
      });
      
      return await getProfile();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile data",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId, getProfile]);

  return { 
    userId, 
    getProfile, 
    saveProfile,
    loading
  };
};
