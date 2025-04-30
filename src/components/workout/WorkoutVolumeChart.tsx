
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

interface VolumeData {
  wk: string;
  volume: number;
}

interface WorkoutVolumeChartProps {
  volumeData: VolumeData[];
}

const WorkoutVolumeChart = ({ volumeData }: WorkoutVolumeChartProps) => {
  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={volumeData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="wk" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            label={{ 
              value: 'Volume (weight × reps)', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle' }
            }}
            width={80}
          />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="volume" 
            name="Weekly Volume"
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WorkoutVolumeChart;
