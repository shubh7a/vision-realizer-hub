import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { BarChart3, Trash2, Download, Eye, Calendar, Database } from 'lucide-react';
import { ChartDisplay } from '../charts/ChartDisplay';
import { useState } from 'react';

export const ChartGallery = () => {
  const { charts, uploadedFiles, removeChart } = useData();
  const { user } = useAuth();
  const [selectedChart, setSelectedChart] = useState<string | null>(null);

  const userCharts = charts.filter(chart => {
    const file = uploadedFiles.find(f => f.id === chart.dataId);
    return user?.role === 'admin' || file?.userId === user?.id;
  });

  if (userCharts.length === 0) {
    return (
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Chart Gallery
          </CardTitle>
          <CardDescription>
            Your created charts will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No charts created yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Upload a file and create your first chart to see it here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedChartData = selectedChart ? userCharts.find(c => c.id === selectedChart) : null;
  const selectedFile = selectedChartData ? uploadedFiles.find(f => f.id === selectedChartData.dataId) : null;

  if (selectedChartData && selectedFile) {
    return (
      <div className="space-y-4">
        <Card className="shadow-elegant">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Chart Gallery
                </CardTitle>
                <CardDescription>Viewing: {selectedChartData.title}</CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setSelectedChart(null)}
              >
                Back to Gallery
              </Button>
            </div>
          </CardHeader>
        </Card>
        
        <ChartDisplay
          chart={selectedChartData}
          data={selectedFile.data}
          file={selectedFile}
        />
      </div>
    );
  }

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Chart Gallery
        </CardTitle>
        <CardDescription>
          Browse and manage your created charts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userCharts.map((chart) => {
            const file = uploadedFiles.find(f => f.id === chart.dataId);
            return (
              <Card key={chart.id} className="border border-border hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold truncate">
                        {chart.title}
                      </CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {file?.filename}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {chart.type}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Database className="h-3 w-3" />
                        <span>X: {chart.xAxis} • Y: {chart.yAxis}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(chart.createdAt), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-2">
                      <Button 
                        size="sm" 
                        onClick={() => setSelectedChart(chart.id)}
                        className="flex-1 bg-gradient-primary hover:opacity-90 shadow-glow text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      
                      {user?.role === 'admin' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => removeChart(chart.id)}
                          className="text-destructive hover:text-destructive text-xs"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};