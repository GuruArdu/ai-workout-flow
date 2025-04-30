
import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { WorkoutSession } from "@/types/workout-tracking";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WorkoutCalendarProps {
  sessions: WorkoutSession[];
}

const WorkoutCalendar = ({ sessions }: WorkoutCalendarProps) => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Convert sessions array to a map for easy lookup
  const sessionsByDate = sessions.reduce((acc, session) => {
    const dateStr = session.date.split('T')[0];
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(session);
    return acc;
  }, {} as Record<string, WorkoutSession[]>);
  
  // Determine what goal colors to use
  const goalColors: Record<string, string> = {
    "Strength": "bg-blue-500",
    "Hypertrophy": "bg-purple-500",
    "Endurance": "bg-green-500",
    "Power": "bg-orange-500",
    "Weight Loss": "bg-pink-500",
    "Flexibility": "bg-cyan-500",
    "Cardio": "bg-red-500",
  };
  
  // Default color for goals not in the predefined list
  const defaultColor = "bg-gray-500";
  
  // Handle day render to show workouts
  const renderDay = (day: Date) => {
    const dateString = format(day, "yyyy-MM-dd");
    const dayWorkouts = sessionsByDate[dateString] || [];
    
    if (dayWorkouts.length === 0) {
      return <div className="h-8 w-8 p-0" />;
    }
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative h-8 w-8 p-0">
              <div className="absolute top-0 right-0 flex flex-wrap gap-1 justify-end">
                {dayWorkouts.map((workout, idx) => (
                  <span 
                    key={idx}
                    className={`h-2 w-2 rounded-full ${workout.goal && goalColors[workout.goal] ? goalColors[workout.goal] : defaultColor} ${workout.planned ? 'ring-1 ring-white' : ''}`} 
                  />
                ))}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              {dayWorkouts.map((workout, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span 
                    className={`h-3 w-3 rounded-full ${workout.goal && goalColors[workout.goal] ? goalColors[workout.goal] : defaultColor} ${workout.planned ? 'ring-1 ring-white' : ''}`} 
                  />
                  <span className="font-medium">
                    {workout.planned ? '(Planned) ' : ''}
                    {workout.style}: {workout.primary_muscles.join(', ')}
                  </span>
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };
  
  // Handle day click to navigate to workout detail
  const handleDayClick = (day: Date | undefined) => {
    if (!day) return;
    
    const dateString = format(day, "yyyy-MM-dd");
    const dayWorkouts = sessionsByDate[dateString] || [];
    
    if (dayWorkouts.length === 1) {
      // If there's only one workout on that day, navigate directly to it
      navigate(`/workout/${dayWorkouts[0].id}`);
    } else if (dayWorkouts.length > 1) {
      // If there are multiple workouts, show them in a dialog or something
      setDate(day);
    } else {
      // No workouts on this day, just update the selected date
      setDate(day);
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDayClick}
          className="rounded-md border"
          components={{
            Day: ({ day, ...props }) => (
              <button {...props} className={props.className}>
                {format(day, "d")}
                {renderDay(day)}
              </button>
            ),
          }}
        />
        
        {date && sessionsByDate[format(date, "yyyy-MM-dd")]?.length > 0 && (
          <div className="p-4 border-t">
            <h3 className="font-medium mb-2">
              Workouts on {format(date, "MMMM d, yyyy")}
            </h3>
            <div className="space-y-2">
              {sessionsByDate[format(date, "yyyy-MM-dd")]?.map((session) => (
                <div 
                  key={session.id}
                  onClick={() => navigate(`/workout/${session.id}`)}
                  className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span 
                        className={`h-3 w-3 rounded-full ${session.goal && goalColors[session.goal] ? goalColors[session.goal] : defaultColor}`} 
                      />
                      <span className="font-medium">{session.style}</span>
                      {session.planned && (
                        <Badge variant="outline" className="text-xs">Planned</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {session.primary_muscles.join(', ')}
                    </div>
                  </div>
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkoutCalendar;
