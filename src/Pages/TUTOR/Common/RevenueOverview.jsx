import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const RevenueOverview = ({ revenueData, theme }) => {
  // Format revenue data to ensure all months are represented
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const formattedData = months.map(month => {
    const monthData = revenueData.find(d => d.month === month);
    return {
      month,
      revenue: monthData ? monthData.revenue : 0
    };
  });

  console.log(formattedData,"gfdfgfd")

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-2 rounded-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border border-green-200 shadow-lg`}>
          <p className="text-sm font-medium">{`Month: ${label}`}</p>
          <p className="text-sm text-green-600">{`Revenue: ₹${payload[0].value.toLocaleString()}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      <h2 className="text-xl font-bold mb-4">Revenue Overview</h2>
      <div className="w-full h-[300px]">
        <ResponsiveContainer>
          <BarChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
            <XAxis 
              dataKey="month" 
              stroke={theme === 'dark' ? '#D1D5DB' : '#374151'}
            />
            <YAxis 
              stroke={theme === 'dark' ? '#D1D5DB' : '#374151'}
              tickFormatter={(value) => `₹${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="revenue" 
              name="Monthly Revenue" 
              fill={theme === 'dark' ? '#4ADE80' : '#22C55E'} 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueOverview;