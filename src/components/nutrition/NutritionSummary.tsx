
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface NutritionMacro {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionSummaryProps {
  current: NutritionMacro;
  target: NutritionMacro;
  recommendations: string[];
}

export const NutritionSummary = ({ current, target, recommendations }: NutritionSummaryProps) => {
  const caloriePercentage = Math.min(Math.round((current.calories / target.calories) * 100), 100);
  const proteinPercentage = Math.min(Math.round((current.protein / target.protein) * 100), 100);
  const carbsPercentage = Math.min(Math.round((current.carbs / target.carbs) * 100), 100);
  const fatPercentage = Math.min(Math.round((current.fat / target.fat) * 100), 100);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Daily Nutrition Summary</CardTitle>
        <CardDescription>Today's intake compared to your goals</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">Calories</span>
              <span>{current.calories} / {target.calories} kcal</span>
            </div>
            <Progress value={caloriePercentage} className="h-2" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium">Protein</span>
                <span>{current.protein}g / {target.protein}g</span>
              </div>
              <Progress value={proteinPercentage} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium">Carbs</span>
                <span>{current.carbs}g / {target.carbs}g</span>
              </div>
              <Progress value={carbsPercentage} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium">Fat</span>
                <span>{current.fat}g / {target.fat}g</span>
              </div>
              <Progress value={fatPercentage} className="h-2" />
            </div>
          </div>
        </div>
      </CardContent>
      {recommendations.length > 0 && (
        <CardFooter className="flex-col items-start border-t pt-4">
          <h4 className="font-semibold text-sm mb-2">Recommendations:</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            {recommendations.map((recommendation, index) => (
              <li key={index}>{recommendation}</li>
            ))}
          </ul>
        </CardFooter>
      )}
    </Card>
  );
};
