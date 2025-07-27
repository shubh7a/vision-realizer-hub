import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ExcelData } from '@/contexts/DataContext';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Chart3D } from './Chart3D';

interface ChartDisplayProps {
  chart: ChartConfig;
  data: any[];
  file: ExcelData;
}

const colors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export const ChartDisplay = ({ chart, data, file }: ChartDisplayProps) => {
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chart.type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey={chart.xAxis} 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 10px 30px -10px hsl(var(--primary) / 0.1)',
              }}
            />
            <Legend />
            <Bar 
              dataKey={chart.yAxis} 
              fill="hsl(var(--chart-1))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey={chart.xAxis} 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 10px 30px -10px hsl(var(--primary) / 0.1)',
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={chart.yAxis} 
              stroke="hsl(var(--chart-2))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey={chart.xAxis} 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 10px 30px -10px hsl(var(--primary) / 0.1)',
              }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey={chart.yAxis} 
              stroke="hsl(var(--chart-3))"
              fill="hsl(var(--chart-3))"
              fillOpacity={0.6}
            />
          </AreaChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey={chart.xAxis} 
              type="number"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              dataKey={chart.yAxis}
              type="number"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 10px 30px -10px hsl(var(--primary) / 0.1)',
              }}
            />
            <Scatter 
              name="Data Points" 
              fill="hsl(var(--chart-4))"
            />
          </ScatterChart>
        );

      case 'pie':
        return (
          <PieChart width={400} height={400}>
            <Pie
              data={data}
              cx={200}
              cy={200}
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="hsl(var(--chart-1))"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 10px 30px -10px hsl(var(--primary) / 0.1)',
              }}
            />
          </PieChart>
        );

      case '3d-column':
        return <Chart3D data={data} xAxis={chart.xAxis} yAxis={chart.yAxis} />;

      default:
        return null;
    }
  };

  return (
    <Card id="chart-display" className="shadow-elegant animate-slide-up">
      <CardHeader>
        <CardTitle>{chart.title}</CardTitle>
        <CardDescription>
          {chart.type.charAt(0).toUpperCase() + chart.type.slice(1)} chart from {file.filename} • 
          X: {chart.xAxis} • Y: {chart.yAxis} • {data.length} data points
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[400px] flex items-center justify-center">
          {chart.type === 'pie' ? (
            renderChart()
          ) : chart.type === '3d-column' ? (
            <div className="w-full h-full">
              {renderChart()}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};