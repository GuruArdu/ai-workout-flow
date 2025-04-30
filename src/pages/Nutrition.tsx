
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { NutritionSummary } from "@/components/nutrition/NutritionSummary";
import { MealList } from "@/components/nutrition/MealList";
import { AddFoodModal } from "@/components/nutrition/AddFoodModal";
import { ActionButtons } from "@/components/nutrition/ActionButtons";
import { useNutritionData } from "@/hooks/useNutritionData";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

// Add TypeScript declaration for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

// Define the SpeechRecognition interface since TypeScript doesn't include it by default
interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

const Nutrition = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [transcript, setTranscript] = useState("");
  const { user } = useAuth();
  const { isSpeechSupported } = useSpeechRecognition();
  
  const { 
    nutritionData,
    groupedByMeal,
    isLoadingNutrition,
    isLoadingFoodLogs,
    refreshData
  } = useNutritionData(user?.id);
  
  const handleFoodAdded = () => {
    refreshData();
  };
  
  return (
    <div className="container mx-auto p-4 max-w-6xl pb-20">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Nutrition Tracker</h1>
        <p className="text-gray-500">Monitor your daily nutrition and track your goals</p>
      </header>
      
      {/* Summary Card */}
      <div className="mb-6">
        {isLoadingNutrition ? (
          <Card>
            <CardContent className="pt-6 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </CardContent>
          </Card>
        ) : nutritionData ? (
          <NutritionSummary 
            current={nutritionData.todayNutrition.current} 
            target={nutritionData.todayNutrition.target}
            recommendations={nutritionData.recommendations}
          />
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p>No nutrition data available. Add some food to get started!</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Meal Grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {['breakfast', 'lunch', 'dinner', 'snacks'].map(meal => (
          <MealList 
            key={meal}
            title={meal.charAt(0).toUpperCase() + meal.slice(1)} 
            items={groupedByMeal[meal] || []} 
            loading={isLoadingFoodLogs}
            onUpdate={handleFoodAdded}
          />
        ))}
      </div>
      
      {/* Action Buttons */}
      <ActionButtons 
        userId={user?.id}
        isSpeechSupported={isSpeechSupported}
        onOpenModal={() => setModalOpen(true)}
        onFoodLogged={handleFoodAdded}
        transcript={transcript}
        onTranscriptChange={setTranscript}
      />
      
      {/* Add Food Modal */}
      <AddFoodModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onFoodAdded={handleFoodAdded}
      />
    </div>
  );
};

export default Nutrition;
