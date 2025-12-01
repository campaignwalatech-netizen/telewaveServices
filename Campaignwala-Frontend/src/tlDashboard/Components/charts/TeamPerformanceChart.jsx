import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart
} from "recharts";

/**
 * Team Performance Chart Component
 */
export default function TeamPerformanceChart() {
  // Sample data - replace with actual data from API
  const data = useMemo(() => [
    { week: 'Week 1', leads: 42, completed: 30, target: 35 },
    { week: 'Week 2', leads: 38, completed: 28, target: 35 },
    { week: 'Week 3', leads: 45, completed: 32, target: 35 },
    { week: 'Week 4', leads: 52, completed: 40, target: 35 },
    { week: 'Week 5', leads: 48, completed: 35, target: 35 },
    { week: 'Week 6', leads: 55, completed: 42, target: 35 },
  ], []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 mt-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {entry.name}:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e5e7eb" 
            strokeOpacity={0.3}
          />
          <XAxis 
            dataKey="week" 
            stroke="#9ca3af"
            tick={{ fill: '#6b7280' }}
          />
          <YAxis 
            stroke="#9ca3af"
            tick={{ fill: '#6b7280' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="leads" 
            name="Total Leads" 
            fill="#3b82f6" 
            radius={[4, 4, 0, 0]}
            barSize={30}
          />
          <Bar 
            dataKey="completed" 
            name="Completed Leads" 
            fill="#10b981" 
            radius={[4, 4, 0, 0]}
            barSize={30}
          />
          <Line 
            type="monotone" 
            dataKey="target" 
            name="Target" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            dot={{ stroke: '#8b5cf6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}