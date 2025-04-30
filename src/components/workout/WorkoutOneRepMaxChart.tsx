
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface ExerciseSession {
  exercise_name: string;
  date: string;
  sets: {
    weight: string;
    reps: string;
  }[];
}

interface OneRepMaxData {
  date: string;
  displayDate: string;
  oneRepMax: number;
  bestSet: string;
}

interface WorkoutOneRepMaxChartProps {
  exerciseData: ExerciseSession[];
}

const WorkoutOneRepMaxChart = ({ exerciseData }: WorkoutOneRepMaxChartProps) => {
  // Calculate one-rep max for each session
  const oneRepMaxData: OneRepMaxData[] = exerciseData.map(session => {
    // Find the set with the highest estimated 1RM
    let maxEstimate = 0;
    let bestSet = '';
    
    session.sets.forEach(set => {
      const weight = parseFloat(set.weight);
      const reps = parseInt(set.reps);
      
      if (!isNaN(weight) && !isNaN(reps) && weight > 0 && reps > 0) {
        // Brzycki formula: 1RM = weight × (36 / (37 - reps))
        const oneRepMax = reps < 37 ? weight * (36 / (37 - reps)) : weight;
        
        if (oneRepMax > maxEstimate) {
          maxEstimate = oneRepMax;
          bestSet = `${weight} × ${reps}`;
        }
      }
    });
    
    const displayDate = format(parseISO(session.date), 'MMM d');
    
    return {
      date: session.date,
      displayDate,
      oneRepMax: Math.round(maxEstimate),
      bestSet
    };
  });
  
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={oneRepMaxData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="displayDate" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            label={{ 
              value: 'Estimated 1RM (kg/lbs)', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle' }
            }}
            width={80}
          />
          <Tooltip 
            formatter={(value, name) => [`${value} kg/lbs`, 'Est. 1RM']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          <Bar 
            dataKey="oneRepMax" 
            name="Estimated 1RM"
            fill="#8884d8"
            barSize={30}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WorkoutOneRepMaxChart;
