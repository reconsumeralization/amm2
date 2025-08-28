// Simple chart components as placeholders for recharts
import React from 'react';

interface ChartData {
  [key: string]: any;
}

interface SimpleBarChartProps {
  data: ChartData[];
  dataKey: string;
  width?: number;
  height?: number;
}

export function SimpleBarChart({ data, dataKey, width = 400, height = 300 }: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map(item => item[dataKey] || 0));
  
  return (
    <div className="space-y-2" style={{ width, height }}>
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="w-20 text-xs truncate">{item.name || item.query || `Item ${index + 1}`}</div>
          <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
            <div 
              className="bg-blue-500 h-4 rounded-full"
              style={{ width: `${(item[dataKey] / maxValue) * 100}%` }}
            />
            <span className="absolute right-2 top-0 text-xs leading-4">
              {item[dataKey]}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

interface SimplePieChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  width?: number;
  height?: number;
}

export function SimplePieChart({ data, width = 300, height = 300 }: SimplePieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="space-y-2" style={{ width, height }}>
      <div className="grid grid-cols-2 gap-2">
        {data.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color || `hsl(${index * 60}, 70%, 50%)` }}
              />
              <span className="text-xs">
                {item.name}: {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}