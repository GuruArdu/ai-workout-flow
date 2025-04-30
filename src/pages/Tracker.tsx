
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTrackerData } from "@/hooks/useTrackerData";
import { toast } from "@/components/ui/use-toast";
import WorkoutCalendarTab from "@/components/workout/tracker/WorkoutCalendarTab";
import WorkoutVolumeTab from "@/components/workout/tracker/WorkoutVolumeTab";
import WorkoutRecordsTab from "@/components/workout/tracker/WorkoutRecordsTab";
import TrackerTabNav, { TrackerTab } from "@/components/workout/tracker/TrackerTabNav";

const Tracker = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TrackerTab>("calendar");
  
  const {
    workoutSessions,
    isLoadingSessions,
    volumeData,
    isLoadingVolume,
    exerciseNames,
    isLoadingExercises,
    exerciseData,
    isLoadingExerciseData,
    selectedExercise,
    setSelectedExercise
  } = useTrackerData(activeTab);

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
      
      <TrackerTabNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {activeTab === "calendar" && (
        <WorkoutCalendarTab 
          isLoading={isLoadingSessions}
          sessions={workoutSessions}
        />
      )}
      
      {activeTab === "volume" && (
        <WorkoutVolumeTab 
          isLoading={isLoadingVolume}
          volumeData={volumeData}
        />
      )}
      
      {activeTab === "records" && (
        <WorkoutRecordsTab 
          isLoadingExercises={isLoadingExercises}
          isLoadingExerciseData={isLoadingExerciseData}
          exerciseNames={exerciseNames}
          exerciseData={exerciseData}
          selectedExercise={selectedExercise}
          setSelectedExercise={setSelectedExercise}
        />
      )}
    </div>
  );
};

export default Tracker;
