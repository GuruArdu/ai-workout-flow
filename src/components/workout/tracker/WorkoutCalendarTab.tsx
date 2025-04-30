
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WorkoutSession } from "@/types/workout-tracking";
import WorkoutCalendar from "@/components/workout/WorkoutCalendar";

interface WorkoutCalendarTabProps {
  isLoading: boolean;
  sessions: WorkoutSession[] | undefined;
}

const WorkoutCalendarTab = ({ isLoading, sessions }: WorkoutCalendarTabProps) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workout Calendar</CardTitle>
        <CardDescription>
          View your workout history
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[400px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-80">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : sessions?.length ? (
          <WorkoutCalendar sessions={sessions} />
        ) : (
          <div className="text-center">
            <p className="text-gray-500 mb-4">Complete your first workout to see your calendar!</p>
            <Button onClick={() => navigate("/start-workout")}>
              Start Workout
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkoutCalendarTab;
