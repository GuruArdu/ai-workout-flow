
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

interface Food {
  id: number;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFoodAdded: () => void;
}

export const AddFoodModal = ({ isOpen, onClose, onFoodAdded }: AddFoodModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [meal, setMeal] = useState("breakfast");
  const [grams, setGrams] = useState("100");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const {
    data: foodItems,
    isLoading: isFoodLoading,
    refetch: refetchFoodSearch
  } = useQuery({
    queryKey: ["searchFood", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim() || searchTerm.length < 2) return [];

      const { data, error } = await supabase
        .from('food')
        .select('*')
        .ilike('name', `%${searchTerm}%`)
        .limit(20);

      if (error) throw error;
      return data as Food[];
    },
    enabled: isOpen && searchTerm.length >= 2,
  });

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.length >= 2) {
      refetchFoodSearch();
    }
  };

  const handleSelectFood = (food: Food) => {
    setSelectedFood(food);
    setSearchTerm(food.name);
  };

  const handleSubmit = async () => {
    if (!user || !selectedFood) return;

    setIsSubmitting(true);
    try {
      const parsedGrams = parseFloat(grams);
      if (isNaN(parsedGrams) || parsedGrams <= 0) {
        throw new Error("Please enter a valid amount");
      }

      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase
        .from('food_log')
        .insert({
          user_id: user.id,
          food_id: selectedFood.id,
          meal,
          grams: parsedGrams,
          date: today
        });

      if (error) throw error;

      toast({
        title: "Food added",
        description: `Added ${selectedFood.name} to your ${meal}`,
      });

      onFoodAdded();
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error adding food:", error);
      toast({
        title: "Error",
        description: "Failed to add food item",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSearchTerm("");
    setSelectedFood(null);
    setMeal("breakfast");
    setGrams("100");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Food Item</DialogTitle>
          <DialogDescription>
            Search for a food item and add it to your daily log.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="food">Food</Label>
            <div className="relative">
              <Command className="rounded-lg border shadow-md">
                <CommandInput 
                  placeholder="Search foods..." 
                  value={searchTerm}
                  onValueChange={handleSearch}
                />
                {searchTerm.length >= 2 && (
                  <CommandList>
                    {isFoodLoading ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>No results found</CommandEmpty>
                        <CommandGroup>
                          {(foodItems || []).map((food) => (
                            <CommandItem 
                              key={food.id}
                              value={food.name}
                              onSelect={() => handleSelectFood(food)}
                            >
                              <div className="flex flex-col">
                                <span>{food.name}</span>
                                <span className="text-xs text-gray-500">
                                  {food.kcal} kcal | P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                )}
              </Command>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="meal">Meal</Label>
              <Select value={meal} onValueChange={setMeal}>
                <SelectTrigger>
                  <SelectValue placeholder="Select meal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snacks">Snacks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (grams)</Label>
              <Input
                id="grams"
                type="number"
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
              />
            </div>
          </div>

          {selectedFood && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium mb-1">Nutrition per {grams}g</h4>
              <div className="grid grid-cols-4 gap-2 text-sm">
                <div>
                  <span className="block text-gray-500">Calories</span>
                  <span className="font-medium">
                    {Math.round((selectedFood.kcal * parseFloat(grams || "0")) / 100)} kcal
                  </span>
                </div>
                <div>
                  <span className="block text-gray-500">Protein</span>
                  <span className="font-medium">
                    {Math.round((selectedFood.protein * parseFloat(grams || "0")) / 100)}g
                  </span>
                </div>
                <div>
                  <span className="block text-gray-500">Carbs</span>
                  <span className="font-medium">
                    {Math.round((selectedFood.carbs * parseFloat(grams || "0")) / 100)}g
                  </span>
                </div>
                <div>
                  <span className="block text-gray-500">Fat</span>
                  <span className="font-medium">
                    {Math.round((selectedFood.fat * parseFloat(grams || "0")) / 100)}g
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedFood || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Food"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
