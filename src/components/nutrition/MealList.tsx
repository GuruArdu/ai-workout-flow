
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface FoodItem {
  id: string;
  food: {
    name: string;
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  grams: number;
}

interface MealListProps {
  title: string;
  items: FoodItem[];
  loading: boolean;
  onUpdate: () => void;
}

export const MealList = ({ title, items, loading, onUpdate }: MealListProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  
  const handleDelete = async () => {
    if (!deletingId || !user) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('food_log')
        .delete()
        .eq('id', deletingId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      toast({
        title: "Food item removed",
        description: "The food item has been removed from your log",
      });
      
      onUpdate();
    } catch (error) {
      console.error("Error deleting food log:", error);
      toast({
        title: "Error",
        description: "Failed to remove food item",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };
  
  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-4 text-center text-gray-500">
              <p>No items yet</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{item.food.name}</p>
                    <div className="text-xs text-gray-500">
                      {Math.round(item.food.kcal * item.grams / 100)} kcal • {item.grams}g
                    </div>
                    <div className="text-xs text-gray-500">
                      P: {Math.round(item.food.protein * item.grams / 100)}g • 
                      C: {Math.round(item.food.carbs * item.grams / 100)}g • 
                      F: {Math.round(item.food.fat * item.grams / 100)}g
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setDeletingId(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove food item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this item from your food log?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
