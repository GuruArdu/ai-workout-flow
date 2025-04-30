
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { ProfileFormValues } from "../ProfileForm";

interface ActivityLevelFieldProps {
  control: Control<ProfileFormValues>;
}

export const ActivityLevelField = ({ control }: ActivityLevelFieldProps) => {
  return (
    <FormField
      control={control}
      name="activity_level"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Activity Level</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || undefined}>
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
  );
};
