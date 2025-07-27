import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { FileUpload } from '../upload/FileUpload';
import { FileHistory } from './FileHistory';
import { ChartBuilder } from '../charts/ChartBuilder';
import { ChartGallery } from './ChartGallery';
import { StatsOverview } from './StatsOverview';
import { Upload, BarChart3, History, TrendingUp } from 'lucide-react';

export const Dashboard = () => {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'upload' | 'history' | 'charts' | 'gallery'>('upload');
  const { user } = useAuth();
  const { uploadedFiles, charts } = useData();

  const userFiles = uploadedFiles.filter(file => 
    user?.role === 'admin' || file.userId === user?.id
  );

  const userCharts = charts.filter(chart => {
    const file = uploadedFiles.find(f => f.id === chart.dataId);
    return user?.role === 'admin' || file?.userId === user?.id;
  });

  const sections = [
    { id: 'upload', label: 'Upload Files', icon: Upload, count: null },
    { id: 'history', label: 'File History', icon: History, count: userFiles.length },
    { id: 'charts', label: 'Create Charts', icon: BarChart3, count: null },
    { id: 'gallery', label: 'Chart Gallery', icon: TrendingUp, count: userCharts.length },
  ] as const;

  const renderContent = () => {
    switch (activeSection) {
      case 'upload':
        return <FileUpload />;
      case 'history':
        return <FileHistory onSelectFile={setSelectedFileId} />;
      case 'charts':
        return <ChartBuilder selectedFileId={selectedFileId} />;
      case 'gallery':
        return <ChartGallery />;
      default:
        return <FileUpload />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted-foreground">
            Transform your Excel data into powerful insights and beautiful visualizations
          </p>
        </div>

        {/* Stats Overview */}
        <StatsOverview />

        {/* Navigation Tabs */}
        <Card className="shadow-elegant">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <Button
                    key={section.id}
                    variant={isActive ? "default" : "outline"}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-2 ${
                      isActive 
                        ? "bg-gradient-primary shadow-glow" 
                        : "hover:bg-muted border-border"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {section.label}
                    {section.count !== null && (
                      <Badge 
                        variant={isActive ? "secondary" : "default"}
                        className={isActive ? "bg-white/20 text-white" : ""}
                      >
                        {section.count}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected File Indicator */}
        {selectedFileId && (
          <Card className="border-l-4 border-l-primary shadow-elegant">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium text-primary">
                    Selected File for Analysis
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {uploadedFiles.find(f => f.id === selectedFileId)?.filename}
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedFileId(null)}
                >
                  Clear Selection
                </Button>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Main Content */}
        <div className="animate-fade-in">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};