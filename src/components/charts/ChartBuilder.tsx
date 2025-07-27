import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useData, ExcelData, ChartConfig } from '@/contexts/DataContext';
import { toast } from 'sonner';
import { BarChart, LineChart, PieChart, ScatterChart, AreaChart, Box, Download, Save } from 'lucide-react';
import { ChartDisplay } from './ChartDisplay';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ChartBuilderProps {
  selectedFileId: string | null;
}

const chartTypes = [
  { value: 'bar', label: 'Bar Chart', icon: BarChart },
  { value: 'line', label: 'Line Chart', icon: LineChart },
  { value: 'pie', label: 'Pie Chart', icon: PieChart },
  { value: 'scatter', label: 'Scatter Plot', icon: ScatterChart },
  { value: 'area', label: 'Area Chart', icon: AreaChart },
  { value: '3d-column', label: '3D Column Chart', icon: Box },
] as const;

export const ChartBuilder = ({ selectedFileId }: ChartBuilderProps) => {
  const { getFileById, addChart } = useData();
  const [chartTitle, setChartTitle] = useState('');
  const [chartType, setChartType] = useState<ChartConfig['type']>('bar');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentChart, setCurrentChart] = useState<ChartConfig | null>(null);
  const [chartData, setChartData] = useState<any[] | null>(null);

  const selectedFile = selectedFileId ? getFileById(selectedFileId) : null;

  const handleGenerateChart = useCallback(async () => {
    if (!selectedFile || !xAxis || !yAxis || !chartTitle.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 800));

      // Process data based on chart type
      let processedData = selectedFile.data;

      if (chartType === 'pie') {
        // For pie charts, aggregate data by x-axis value
        const aggregated = processedData.reduce((acc, row) => {
          const key = row[xAxis];
          const value = parseFloat(row[yAxis]) || 0;
          if (acc[key]) {
            acc[key] += value;
          } else {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, number>);

        processedData = Object.entries(aggregated).map(([name, value]) => ({
          name,
          value,
          [xAxis]: name,
          [yAxis]: value,
        }));
      } else {
        // For other charts, filter out invalid data
        processedData = processedData.filter(row => 
          row[xAxis] !== undefined && 
          row[xAxis] !== null && 
          row[xAxis] !== '' &&
          (!isNaN(parseFloat(row[yAxis])) || chartType === 'bar')
        );
      }

      const chartConfig: ChartConfig = {
        id: Date.now().toString(),
        title: chartTitle,
        type: chartType,
        xAxis,
        yAxis,
        dataId: selectedFile.id,
        createdAt: new Date().toISOString(),
      };

      setCurrentChart(chartConfig);
      setChartData(processedData);
      addChart(chartConfig);

      toast.success(`${chartTitle} generated successfully!`);
    } catch (error) {
      console.error('Error generating chart:', error);
      toast.error('Failed to generate chart');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedFile, xAxis, yAxis, chartTitle, chartType, addChart]);

  const handleDownloadPNG = async () => {
    if (!currentChart) return;

    try {
      const chartElement = document.getElementById('chart-display');
      if (!chartElement) return;

      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `${currentChart.title.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL();
      link.click();

      toast.success('Chart downloaded as PNG!');
    } catch (error) {
      console.error('Error downloading PNG:', error);
      toast.error('Failed to download chart');
    }
  };

  const handleDownloadPDF = async () => {
    if (!currentChart) return;

    try {
      const chartElement = document.getElementById('chart-display');
      if (!chartElement) return;

      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const pdf = new jsPDF();
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`${currentChart.title.replace(/\s+/g, '_')}.pdf`);

      toast.success('Chart downloaded as PDF!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download chart');
    }
  };

  if (!selectedFile) {
    return (
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>Chart Builder</CardTitle>
          <CardDescription>Select a file from your upload history to create charts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No file selected</p>
            <p className="text-sm text-muted-foreground mt-2">
              Choose a file from your upload history to start creating charts
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get numeric columns for Y-axis
  const numericColumns = selectedFile.columns.filter(col => {
    const sampleValues = selectedFile.data.slice(0, 10).map(row => row[col]);
    return sampleValues.some(val => !isNaN(parseFloat(val)) && isFinite(val));
  });

  return (
    <div className="space-y-6">
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-primary" />
            Chart Builder
          </CardTitle>
          <CardDescription>
            Create interactive charts from {selectedFile.filename}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chart-title">Chart Title</Label>
              <Input
                id="chart-title"
                placeholder="Enter chart title"
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chart-type">Chart Type</Label>
              <Select value={chartType} onValueChange={(value: ChartConfig['type']) => setChartType(value)}>
                <SelectTrigger id="chart-type">
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  {chartTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="x-axis">X-Axis</Label>
              <Select value={xAxis} onValueChange={setXAxis}>
                <SelectTrigger id="x-axis">
                  <SelectValue placeholder="Select X-axis column" />
                </SelectTrigger>
                <SelectContent>
                  {selectedFile.columns.map((column) => (
                    <SelectItem key={column} value={column}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="y-axis">Y-Axis</Label>
              <Select value={yAxis} onValueChange={setYAxis}>
                <SelectTrigger id="y-axis">
                  <SelectValue placeholder="Select Y-axis column" />
                </SelectTrigger>
                <SelectContent>
                  {(chartType === 'pie' ? selectedFile.columns : numericColumns).map((column) => (
                    <SelectItem key={column} value={column}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleGenerateChart}
              disabled={isGenerating || !chartTitle.trim() || !xAxis || !yAxis}
              className="bg-gradient-primary hover:opacity-90 shadow-glow"
            >
              {isGenerating ? (
                <>
                  <Save className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <BarChart className="h-4 w-4 mr-2" />
                  Generate Chart
                </>
              )}
            </Button>

            {currentChart && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleDownloadPNG}>
                  <Download className="h-4 w-4 mr-2" />
                  PNG
                </Button>
                <Button variant="outline" onClick={handleDownloadPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {currentChart && chartData && (
        <ChartDisplay
          chart={currentChart}
          data={chartData}
          file={selectedFile}
        />
      )}
    </div>
  );
};