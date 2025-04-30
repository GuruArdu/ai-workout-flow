
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WeeklyVolumeData } from "@/types/workout-tracking";
import WorkoutVolumeChart from "@/components/workout/WorkoutVolumeChart";

interface WorkoutVolumeTabProps {
  isLoading: boolean;
  volumeData: WeeklyVolumeData[] | undefined;
}

const WorkoutVolumeTab = ({ isLoading, volumeData }: WorkoutVolumeTabProps) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Volume</CardTitle>
        <CardDescription>
          Track your total volume (weight × reps) over time
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[400px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-80">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : volumeData?.length ? (
          <WorkoutVolumeChart volumeData={volumeData} />
        ) : (
          <div className="text-center">
            <p className="text-gray-500 mb-4">Complete workouts to generate your volume chart!</p>
            <Button onClick={() => navigate("/start-workout")}>
              Start Workout
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkoutVolumeTab;
