
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { format, isValid, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface WorkoutSession {
  id: string;
  date: string;
  goal: string;
  style: string;
  primary_muscles: string[];
}

interface WorkoutCalendarProps {
  sessions: WorkoutSession[];
}

const goalColors: Record<string, string> = {
  'strength': 'bg-red-500',
  'hypertrophy': 'bg-blue-500',
  'endurance': 'bg-green-500',
  'power': 'bg-purple-500',
  'weight loss': 'bg-orange-500',
  'overall fitness': 'bg-teal-500',
};

const WorkoutCalendar = ({ sessions }: WorkoutCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  // Group sessions by date
  const sessionsByDate: Record<string, WorkoutSession[]> = {};
  sessions.forEach(session => {
    if (!session.date) return;
    
    const dateStr = format(parseISO(session.date), 'yyyy-MM-dd');
    if (!sessionsByDate[dateStr]) {
      sessionsByDate[dateStr] = [];
    }
    sessionsByDate[dateStr].push(session);
  });
  
  // Function to get sessions for a selected date
  const getSessionsForDate = (date: Date | undefined): WorkoutSession[] => {
    if (!date) return [];
    const dateStr = format(date, 'yyyy-MM-dd');
    return sessionsByDate[dateStr] || [];
  };
  
  // Get selected date sessions
  const selectedSessions = getSessionsForDate(selectedDate);
  
  // Custom day renderer to show workout indicators
  const renderDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayHasSessions = sessionsByDate[dateStr]?.length > 0;
    
    if (!dayHasSessions) return <div className="h-7 w-7"></div>;
    
    // Get all goals for the day
    const goals = sessionsByDate[dateStr].map(s => s.goal.toLowerCase());
    const primaryGoal = goals[0]; // Just use the first goal for coloring
    const colorClass = goalColors[primaryGoal] || 'bg-gray-400';
    
    return (
      <div className="relative h-7 w-7 flex items-center justify-center">
        <div 
          className={cn(
            "h-1.5 w-1.5 rounded-full absolute bottom-0.5",
            colorClass
          )}
        />
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border"
          components={{
            DayContent: ({ date }) => renderDay(date),
          }}
        />
      </div>
      
      {selectedDate && selectedSessions.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-2">
              Workouts on {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            <div className="space-y-4">
              {selectedSessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge 
                        className={cn(
                          goalColors[session.goal.toLowerCase()] || 'bg-gray-400',
                          'text-white border-none mb-2'
                        )}
                      >
                        {session.goal}
                      </Badge>
                      <div className="text-sm">Style: {session.style}</div>
                      <div className="text-sm">
                        Focus: {session.primary_muscles.join(', ')}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {isValid(parseISO(session.date)) 
                        ? format(parseISO(session.date), 'h:mm a')
                        : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkoutCalendar;
