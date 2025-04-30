
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

const ProfileForm = ({ initialData, isDev = false }: ProfileFormProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const { userId, saveProfile } = useProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: initialData?.username || "",
      height: initialData?.height?.toString() || "",
      weight: initialData?.weight?.toString() || "",
      age: initialData?.age?.toString() || "",
      fitness_level: initialData?.fitness_level as "beginner" | "intermediate" | "advanced" | undefined,
      activity_level: initialData?.activity_level as "sedentary" | "light" | "moderate" | "very_active" | "extra_active" | undefined,
      gender: initialData?.gender as "male" | "female" | "other" | undefined,
      height_unit: (initialData?.height_unit as HeightUnit) || "cm",
      weight_unit: (initialData?.weight_unit as WeightUnit) || "kg",
    },
  });

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
        height: values.height ? Number(values.height) : null,
        weight: values.weight ? Number(values.weight) : null,
        age: values.age ? Number(values.age) : null,
        fitness_level: values.fitness_level || null,
        activity_level: values.activity_level || null,
        gender: values.gender || null,
        height_unit: values.height_unit,
        weight_unit: values.weight_unit,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
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
