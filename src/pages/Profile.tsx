
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDevUser } from "@/hooks/useDevUser";
import { useNavigate } from "react-router-dom";

const profileFormSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  height: z.string().refine((val) => !val || (Number(val) > 0 && Number(val) < 300), {
    message: "Height must be between 0 and 300 cm",
  }).optional(),
  weight: z.string().refine((val) => !val || (Number(val) > 0 && Number(val) < 500), {
    message: "Weight must be between 0 and 500 kg",
  }).optional(),
  age: z.string().refine((val) => !val || (Number(val) >= 13 && Number(val) < 120), {
    message: "Age must be between 13 and 120",
  }).optional(),
  fitness_level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  activity_level: z.enum(["sedentary", "light", "moderate", "very_active", "extra_active"]).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  height_unit: z.enum(["cm", "in"]).default("cm"),
  weight_unit: z.enum(["kg", "lbs"]).default("kg"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const Profile = () => {
  const { user, loadUserProfile } = useAuth();
  const devUser = useDevUser();
  const navigate = useNavigate();
  
  // Get either authenticated user or dev user ID
  const userId = user?.id || (devUser?.id || null);
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      height: "",
      weight: "",
      age: "",
      fitness_level: undefined,
      activity_level: undefined,
      gender: undefined,
      height_unit: "cm",
      weight_unit: "kg",
    },
  });

  // Redirect if no user (real or dev)
  useEffect(() => {
    if (!loading && !userId) {
      navigate("/auth");
    }
  }, [loading, userId, navigate]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try {
        // For dev user, first check if a profile already exists
        if (devUser) {
          const { data: existingProfile } = await supabase
            .from('profile')
            .select('*')
            .eq('user_id', devUser.id)
            .maybeSingle();
            
          if (existingProfile) {
            form.reset({
              username: existingProfile.username || "",
              height: existingProfile.height?.toString() || "",
              weight: existingProfile.weight?.toString() || "",
              age: existingProfile.age?.toString() || "",
              fitness_level: existingProfile.fitness_level as "beginner" | "intermediate" | "advanced" | undefined,
              activity_level: existingProfile.activity_level as "sedentary" | "light" | "moderate" | "very_active" | "extra_active" | undefined,
              gender: existingProfile.gender as "male" | "female" | "other" | undefined,
              height_unit: existingProfile.height_unit || "cm",
              weight_unit: existingProfile.weight_unit || "kg",
            });
            setLoading(false);
            return;
          }
          
          // If no row, insert one for the dev user so upsert doesn't break
          await supabase.from("profile").insert({ user_id: devUser.id });
          setLoading(false);
          return;
        } else {
          // Normal user flow with auth context
          const profile = await loadUserProfile(userId);
          
          if (profile) {
            form.reset({
              username: profile.username || "",
              height: profile.height?.toString() || "",
              weight: profile.weight?.toString() || "",
              age: profile.age?.toString() || "",
              fitness_level: profile.fitness_level as "beginner" | "intermediate" | "advanced" | undefined,
              activity_level: profile.activity_level as "sedentary" | "light" | "moderate" | "very_active" | "extra_active" | undefined,
              gender: profile.gender as "male" | "female" | "other" | undefined,
              height_unit: profile.height_unit || "cm",
              weight_unit: profile.weight_unit || "kg",
            });
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
  }, [userId, form, loadUserProfile, devUser]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('profile')
        .upsert({
          user_id: userId,
          username: values.username || null,
          height: values.height ? Number(values.height) : null,
          weight: values.weight ? Number(values.weight) : null,
          age: values.age ? Number(values.age) : null,
          fitness_level: values.fitness_level || null,
          activity_level: values.activity_level || null,
          gender: values.gender || null,
          height_unit: values.height_unit,
          weight_unit: values.weight_unit,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // Show form only if we have a userId (real or dev)
  if (!userId) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings {devUser ? "(Development Mode)" : ""}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter height" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="height_unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cm">cm</SelectItem>
                          <SelectItem value="in">inches</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter weight" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight_unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="lbs">lbs</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter age" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="activity_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your activity level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="very_active">Very Active</SelectItem>
                        <SelectItem value="extra_active">Extra Active</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fitness_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fitness Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your fitness level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
