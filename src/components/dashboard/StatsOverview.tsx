import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, BarChart3, Database, TrendingUp } from 'lucide-react';

export const StatsOverview = () => {
  const { uploadedFiles, charts } = useData();
  const { user } = useAuth();

  const userFiles = uploadedFiles.filter(file => 
    user?.role === 'admin' || file.userId === user?.id
  );

  const userCharts = charts.filter(chart => {
    const file = uploadedFiles.find(f => f.id === chart.dataId);
    return user?.role === 'admin' || file?.userId === user?.id;
  });

  const totalRows = userFiles.reduce((sum, file) => sum + file.data.length, 0);
  const totalColumns = userFiles.reduce((sum, file) => sum + file.columns.length, 0);

  const stats = [
    {
      title: 'Uploaded Files',
      value: userFiles.length,
      description: 'Excel and CSV files processed',
      icon: FileText,
      color: 'text-chart-1',
      bgColor: 'bg-chart-1/10',
    },
    {
      title: 'Generated Charts',
      value: userCharts.length,
      description: 'Visual representations created',
      icon: BarChart3,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
    },
    {
      title: 'Data Rows',
      value: totalRows.toLocaleString(),
      description: 'Total data points analyzed',
      icon: Database,
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10',
    },
    {
      title: 'Column Headers',
      value: totalColumns,
      description: 'Different data dimensions',
      icon: TrendingUp,
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="shadow-elegant hover:shadow-glow transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <CardDescription className="text-xs">
                {stat.description}
              </CardDescription>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};