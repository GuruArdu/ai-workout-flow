
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, LineChart, ArrowRight, Calendar, TrendingUp, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChartContainer, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart";
import { Line, LineChart as RechartsLineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Bar, BarChart } from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [selectedTimeframe, setSelectedTimeframe] = useState<"week" | "month">("week");

  // Fetch workout volume data
  const { data: workoutData, isLoading: isLoadingWorkout } = useQuery({
    queryKey: ["workoutVolume", user?.id, selectedTimeframe],
    queryFn: async () => {
      if (!user?.id) return [];

      // Calculate date range based on selected timeframe
      const endDate = new Date();
      const startDate = new Date();
      if (selectedTimeframe === "week") {
        startDate.setDate(endDate.getDate() - 7);
      } else {
        startDate.setDate(endDate.getDate() - 30);
      }

      // Fetch exercise logs
      const { data: logs, error } = await supabase
        .from('exercise_log')
        .select('date, sets')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString())
        .order('date', { ascending: true });

      if (error) {
        console.error("Error fetching workout data:", error);
        return [];
      }

      // Process data for chart
      const volumeByDate: Record<string, { date: string; volume: number }> = {};
      
      logs.forEach(log => {
        const date = log.date.split('T')[0];
        if (!volumeByDate[date]) {
          volumeByDate[date] = {
            date: date,
            volume: 0
          };
        }

        // Calculate volume from sets (assuming sets has weight and reps)
        if (log.sets && Array.isArray(log.sets)) {
          log.sets.forEach((set: any) => {
            if (set.weight && set.reps) {
              volumeByDate[date].volume += set.weight * set.reps;
            }
          });
        }
      });

      return Object.values(volumeByDate);
    },
    enabled: !!user?.id
  });

  // Fetch nutrition data
  const { data: nutritionData, isLoading: isLoadingNutrition } = useQuery({
    queryKey: ["nutritionData", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase.functions.invoke("analyze_nutrition", {
        body: { userId: user.id }
      });
      
      if (error) {
        console.error("Error fetching nutrition data:", error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id
  });

  const chartConfig = {
    calories: {
      label: "Calories",
      theme: {
        light: "#0284C7",
        dark: "#38BDF8"
      }
    },
    target: {
      label: "Target",
      theme: {
        light: "#D1D5DB",
        dark: "#6B7280"
      }
    },
    volume: {
      label: "Volume (kg)",
      theme: {
        light: "#6D28D9",
        dark: "#A78BFA"
      }
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome to FitFlow AI</h1>
          <p className="text-gray-500">
            {user?.email ? `Logged in as ${user.email}` : 'Your personalized workout companion'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={signOut} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </header>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Start Workout Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Start a Workout
            </CardTitle>
            <CardDescription className="text-blue-100">
              Generate a custom workout plan
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>Create a personalized workout based on:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
              <li>Target muscle groups</li>
              <li>Available equipment</li>
              <li>Your fitness level</li>
              <li>Time available</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full flex justify-between items-center"
              onClick={() => navigate("/start-workout")}
            >
              Create Workout
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
        
        {/* Nutrition Tracker Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="bg-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Nutrition Tracker
            </CardTitle>
            <CardDescription className="text-indigo-100">
              Track your meals and macros
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>Monitor your nutrition with:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
              <li>Daily calorie tracking</li>
              <li>Macro breakdown</li>
              <li>Voice input for logging meals</li>
              <li>Personalized recommendations</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full flex justify-between items-center"
              onClick={() => navigate("/nutrition")}
            >
              Track Nutrition
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Progress Charts */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Workout Volume Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Training Volume</CardTitle>
              <CardDescription>Total weight lifted (kg)</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoadingWorkout ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : workoutData && workoutData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-64">
                  <BarChart data={workoutData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="volume" name="Volume" fill="var(--color-volume)" barSize={20} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <p className="text-gray-500 mb-4">No workout data available yet</p>
                  <Button variant="outline" onClick={() => navigate("/start-workout")}>
                    Start Your First Workout
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Nutrition Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Calorie Balance</CardTitle>
              <CardDescription>Daily calories vs your target</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoadingNutrition ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : nutritionData && nutritionData.dailyTotals && nutritionData.dailyTotals.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-64">
                  <RechartsLineChart data={nutritionData.dailyTotals.slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="calories" 
                      name="Calories" 
                      stroke="var(--color-calories)" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="targetCalories" 
                      name="Target" 
                      stroke="var(--color-target)" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </RechartsLineChart>
                </ChartContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <p className="text-gray-500 mb-4">No nutrition data available yet</p>
                  <Button variant="outline" onClick={() => navigate("/nutrition")}>
                    Start Tracking Nutrition
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="h-auto flex-col py-6 gap-2"
            onClick={() => navigate("/start-workout")}
          >
            <Dumbbell className="h-6 w-6" />
            <span>Workouts</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto flex-col py-6 gap-2"
            onClick={() => navigate("/nutrition")}
          >
            <LineChart className="h-6 w-6" />
            <span>Nutrition</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto flex-col py-6 gap-2"
            onClick={() => navigate("/tracker")}
          >
            <TrendingUp className="h-6 w-6" />
            <span>Progress</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto flex-col py-6 gap-2"
            onClick={() => navigate("/profile")}
          >
            <Calendar className="h-6 w-6" />
            <span>Profile</span>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
