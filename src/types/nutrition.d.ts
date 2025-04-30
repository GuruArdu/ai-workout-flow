
export interface NutritionMacro {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionData {
  dailyTotals: {
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    targetCalories: number;
  }[];
  todayNutrition: {
    current: NutritionMacro;
    target: NutritionMacro;
  };
  recommendations: string[];
}

export interface FoodLog {
  id: string;
  meal: string;
  date: string;
  grams: number;
  food: {
    id: number;
    name: string;
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}
