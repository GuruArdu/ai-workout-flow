
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { ProfileFormValues } from "../ProfileForm";

interface FitnessLevelFieldProps {
  control: Control<ProfileFormValues>;
}

export const FitnessLevelField = ({ control }: FitnessLevelFieldProps) => {
  return (
    <FormField
      control={control}
      name="fitness_level"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Fitness Level</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || undefined}>
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
  );
};
