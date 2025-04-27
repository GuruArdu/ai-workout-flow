
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, LineChart, TrendingUp } from "lucide-react";

type Tab = "calendar" | "volume" | "records";

const Tracker = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("calendar");

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-2"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Workout Tracker</h1>
      </div>
      
      <div className="flex space-x-1 rounded-lg bg-muted p-1 mb-6">
        <Button
          variant={activeTab === "calendar" ? "default" : "ghost"}
          className="flex-1 flex items-center justify-center gap-2"
          onClick={() => setActiveTab("calendar")}
        >
          <Calendar className="h-4 w-4" />
          Calendar
        </Button>
        <Button
          variant={activeTab === "volume" ? "default" : "ghost"}
          className="flex-1 flex items-center justify-center gap-2"
          onClick={() => setActiveTab("volume")}
        >
          <LineChart className="h-4 w-4" />
          Volume
        </Button>
        <Button
          variant={activeTab === "records" ? "default" : "ghost"}
          className="flex-1 flex items-center justify-center gap-2"
          onClick={() => setActiveTab("records")}
        >
          <TrendingUp className="h-4 w-4" />
          1RM Estimates
        </Button>
      </div>
      
      {activeTab === "calendar" && (
        <Card>
          <CardHeader>
            <CardTitle>Workout Calendar</CardTitle>
            <CardDescription>
              View your workout history
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-gray-500 mb-4">Complete your first workout to see your calendar!</p>
              <Button onClick={() => navigate("/start-workout")}>
                Start Workout
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {activeTab === "volume" && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Volume</CardTitle>
            <CardDescription>
              Track your total volume (weight × reps) over time
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-gray-500 mb-4">Complete workouts to generate your volume chart!</p>
              <Button onClick={() => navigate("/start-workout")}>
                Start Workout
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {activeTab === "records" && (
        <Card>
          <CardHeader>
            <CardTitle>Estimated One-Rep Maxes</CardTitle>
            <CardDescription>
              Track your strength progress over time
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-gray-500 mb-4">Log strength workouts to generate 1RM estimates!</p>
              <Button onClick={() => navigate("/start-workout")}>
                Start Workout
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Tracker;
