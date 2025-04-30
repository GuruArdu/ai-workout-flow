
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { UserProfile, HeightUnit, WeightUnit } from "@/types/profile";
import { useProfile } from "@/hooks/useProfile";
import { UsernameField } from "./form-fields/UsernameField";
import { GenderField } from "./form-fields/GenderField";
import { MeasurementField } from "./form-fields/MeasurementField";
import { AgeField } from "./form-fields/AgeField";
import { ActivityLevelField } from "./form-fields/ActivityLevelField";
import { FitnessLevelField } from "./form-fields/FitnessLevelField";
import { SubmitButton } from "./form-fields/SubmitButton";
import { useEffect } from "react";

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
  goal: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  initialData?: Partial<UserProfile>;
  isDev?: boolean;
}

const heightUnitOptions = [
  { value: "cm", label: "cm" },
  { value: "in", label: "inches" },
];

const weightUnitOptions = [
  { value: "kg", label: "kg" },
  { value: "lbs", label: "lbs" },
];

const ProfileForm = ({ isDev = false }: ProfileFormProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { userId, getProfile, saveProfile } = useProfile();

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
      goal: undefined,
    },
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const p = await getProfile();
        if (p) form.reset({
          username: p.username ?? "",
          gender: p.gender as any ?? undefined,
          height: p.height?.toString() ?? "",
          height_unit: p.height_unit ?? "cm",
          weight: p.weight?.toString() ?? "",
          weight_unit: p.weight_unit ?? "kg",
          age: p.age?.toString() ?? "",
          activity_level: p.activity_level as any ?? undefined,
          fitness_level: p.fitness_level as any ?? undefined,
          goal: p.goal ?? undefined,
        });
      } catch(e) { 
        console.error(e); 
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive"
        });
      }
      setLoading(false);
    })();
  }, [userId, form, getProfile]);

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
      await saveProfile({
        username: values.username || null,
        gender: values.gender || null,
        height: values.height ? Number(values.height) : null,
        height_unit: values.height_unit,
        weight: values.weight ? Number(values.weight) : null,
        weight_unit: values.weight_unit,
        age: values.age ? Number(values.age) : null,
        activity_level: values.activity_level || null,
        fitness_level: values.fitness_level || null,
        goal: values.goal || null,
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings {isDev ? "(Development Mode)" : ""}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <UsernameField control={form.control} />
            <GenderField control={form.control} />
            
            <MeasurementField 
              control={form.control} 
              measurementName="height" 
              label="Height" 
              unitName="height_unit"
              unitOptions={heightUnitOptions}
            />
            
            <MeasurementField 
              control={form.control} 
              measurementName="weight" 
              label="Weight" 
              unitName="weight_unit"
              unitOptions={weightUnitOptions}
            />
            
            <AgeField control={form.control} />
            <ActivityLevelField control={form.control} />
            <FitnessLevelField control={form.control} />
            
            <SubmitButton isSaving={isSaving} />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
