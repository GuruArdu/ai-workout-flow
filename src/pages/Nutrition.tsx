
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Mic, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { NutritionSummary } from "@/components/nutrition/NutritionSummary";
import { MealList } from "@/components/nutrition/MealList";
import { AddFoodModal } from "@/components/nutrition/AddFoodModal";
import { useQuery } from "@tanstack/react-query";

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
    current: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    target: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  };
  recommendations: string[];
}

interface FoodLog {
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

const Nutrition = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const { user } = useAuth();
  
  // Fetch nutrition data
  const { data: nutritionData, isLoading: isLoadingNutrition, refetch: refetchNutrition } = useQuery({
    queryKey: ["nutritionAnalysis", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase.functions.invoke("analyze_nutrition", {
        body: { userId: user.id }
      });
      
      if (error) throw new Error(error.message);
      return data as NutritionData;
    },
    enabled: !!user?.id
  });
  
  // Fetch food logs for today
  const { data: foodLogs, isLoading: isLoadingFoodLogs, refetch: refetchFoodLogs } = useQuery({
    queryKey: ["foodLogs", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('food_log')
        .select(`
          id, meal, date, grams,
          food:food_id (id, name, kcal, protein, carbs, fat)
        `)
        .eq('user_id', user.id)
        .eq('date', today);
        
      if (error) throw new Error(error.message);
      return data as FoodLog[];
    },
    enabled: !!user?.id
  });
  
  const groupedByMeal = foodLogs ? foodLogs.reduce((acc, log) => {
    const meal = log.meal.toLowerCase();
    if (!acc[meal]) acc[meal] = [];
    acc[meal].push(log);
    return acc;
  }, {} as Record<string, FoodLog[]>) : {};
  
  const handleVoiceInput = async () => {
    try {
      if (isListening) {
        setIsListening(false);
        return;
      }
      
      setIsListening(true);
      setTranscript("");
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];
      
      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
      });
      
      mediaRecorder.addEventListener("stop", async () => {
        setIsListening(false);
        setIsProcessingVoice(true);
        
        try {
          // For browser-based speech recognition
          const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
          recognition.lang = 'en-US';
          
          // Create audio URL for potential playback
          const audioBlob = new Blob(audioChunks);
          const audioUrl = URL.createObjectURL(audioBlob);
          
          recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            setTranscript(transcript);
            
            // Process the transcript with our edge function
            if (user?.id) {
              const { data, error } = await supabase.functions.invoke("classify_food_recordings", {
                body: { 
                  userId: user.id,
                  transcript 
                }
              });
              
              if (error) {
                toast({
                  title: "Error",
                  description: "Failed to process voice input",
                  variant: "destructive"
                });
              } else {
                toast({
                  title: "Food items logged",
                  description: `Successfully logged ${data.logged} food items`,
                });
                refetchFoodLogs();
                refetchNutrition();
              }
            }
            
            setIsProcessingVoice(false);
          };
          
          recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            toast({
              title: "Error",
              description: "Speech recognition failed. Please try again.",
              variant: "destructive"
            });
            setIsProcessingVoice(false);
          };
          
          recognition.start();
          
        } catch (error) {
          console.error("Error processing audio:", error);
          toast({
            title: "Error",
            description: "Failed to process audio. Please try again.",
            variant: "destructive"
          });
          setIsProcessingVoice(false);
        }
      });
      
      // Record for 5 seconds
      mediaRecorder.start();
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
          stream.getTracks().forEach(track => track.stop());
        }
      }, 5000);
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Error",
        description: "Failed to access microphone. Please check permissions.",
        variant: "destructive"
      });
      setIsListening(false);
    }
  };
  
  const handleFoodAdded = () => {
    refetchFoodLogs();
    refetchNutrition();
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
      <div className="fixed bottom-20 md:bottom-8 right-8 flex flex-col gap-2">
        <Button 
          size="lg" 
          className="rounded-full w-14 h-14 p-0 shadow-lg"
          variant={isListening ? "destructive" : (isProcessingVoice ? "outline" : "default")}
          onClick={handleVoiceInput}
          disabled={isProcessingVoice}
        >
          {isProcessingVoice ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>
        
        <Button 
          size="lg" 
          className="rounded-full w-14 h-14 p-0 shadow-lg"
          onClick={() => setModalOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Voice Input Feedback */}
      {transcript && (
        <div className="fixed bottom-36 md:bottom-28 right-8 max-w-xs bg-white p-4 rounded-lg shadow-lg border">
          <p className="font-medium">Transcript:</p>
          <p className="text-sm text-gray-600">{transcript}</p>
        </div>
      )}
      
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
