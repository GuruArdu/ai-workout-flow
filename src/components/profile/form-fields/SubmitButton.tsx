
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  isSaving: boolean;
}

export const SubmitButton = ({ isSaving }: SubmitButtonProps) => {
  return (
    <Button type="submit" className="w-full" disabled={isSaving}>
      {isSaving ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
        </>
      ) : (
        "Save Changes"
      )}
    </Button>
  );
};
