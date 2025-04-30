
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { UserProfile, HeightUnit, WeightUnit } from "@/types/profile";
import { toast } from "@/components/ui/use-toast";

export const useProfileData = (userId: string | null, isDevUser: boolean = false) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Partial<UserProfile> | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try {
        // For dev user, first check if a profile already exists
        if (isDevUser) {
          const { data: existingProfile } = await supabase
            .from('profile')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
            
          if (existingProfile) {
            // Use type assertion to ensure height_unit and weight_unit are valid
            const height_unit = (existingProfile.height_unit || "cm") as HeightUnit;
            const weight_unit = (existingProfile.weight_unit || "kg") as WeightUnit;
            
            setProfile({
              ...existingProfile,
              height_unit,
              weight_unit,
            });
            setLoading(false);
            return;
          }
          
          // If no row, insert one for the dev user with a valid UUID format
          await supabase.from("profile").insert({ 
            user_id: userId 
          });
          
          // Fetch the newly created profile
          const { data: newProfile } = await supabase
            .from('profile')
            .select('*')
            .eq('user_id', userId)
            .single();
            
          if (newProfile) {
            setProfile({
              ...newProfile,
              height_unit: (newProfile.height_unit || "cm") as HeightUnit,
              weight_unit: (newProfile.weight_unit || "kg") as WeightUnit,
            });
          }
          setLoading(false);
          return;
        } else {
          // Normal user flow
          const { data, error } = await supabase
            .from('profile')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
          
          if (error) {
            throw error;
          }
          
          if (data) {
            // Use type assertion to ensure height_unit and weight_unit are valid
            const height_unit = (data.height_unit || "cm") as HeightUnit;
            const weight_unit = (data.weight_unit || "kg") as WeightUnit;
            
            setProfile({
              ...data,
              height_unit,
              weight_unit,
            });
          } else {
            // No profile exists, create one
            await supabase.from("profile").insert({ 
              user_id: userId 
            });
            
            // Fetch the newly created profile
            const { data: newProfile } = await supabase
              .from('profile')
              .select('*')
              .eq('user_id', userId)
              .single();
              
            if (newProfile) {
              setProfile({
                ...newProfile,
                height_unit: (newProfile.height_unit || "cm") as HeightUnit,
                weight_unit: (newProfile.weight_unit || "kg") as WeightUnit,
              });
            }
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId, isDevUser]);

  return { profile, loading };
};
