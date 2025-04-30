
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { ProfileFormValues } from "../ProfileForm";

interface AgeFieldProps {
  control: Control<ProfileFormValues>;
}

export const AgeField = ({ control }: AgeFieldProps) => {
  return (
    <FormField
      control={control}
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
  );
};
