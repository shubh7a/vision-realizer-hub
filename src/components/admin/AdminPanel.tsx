import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Shield, Users, FileText, BarChart3, Database, TrendingUp, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';

export const AdminPanel = () => {
  const { uploadedFiles, charts } = useData();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'charts' | 'users'>('overview');

  if (user?.role !== 'admin') {
    return (
      <Card className="shadow-elegant">
        <CardContent className="text-center py-8">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
        </CardContent>
      </Card>
    );
  }

  const totalUsers = new Set([...uploadedFiles.map(f => f.userId), user.id]).size;
  const totalRows = uploadedFiles.reduce((sum, file) => sum + file.data.length, 0);

  const adminStats = [
    {
      title: 'Total Users',
      value: totalUsers,
      description: 'Active platform users',
      icon: Users,
      color: 'text-chart-1',
      bgColor: 'bg-chart-1/10',
    },
    {
      title: 'Total Files',
      value: uploadedFiles.length,
      description: 'Files across all users',
      icon: FileText,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
    },
    {
      title: 'Total Charts',
      value: charts.length,
      description: 'Charts generated platform-wide',
      icon: BarChart3,
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10',
    },
    {
      title: 'Data Volume',
      value: totalRows.toLocaleString(),
      description: 'Total rows processed',
      icon: Database,
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'files', label: 'All Files', icon: FileText },
    { id: 'charts', label: 'All Charts', icon: BarChart3 },
    { id: 'users', label: 'User Activity', icon: Users },
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {adminStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="shadow-elegant">
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

      case 'files':
        return (
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>All Uploaded Files</CardTitle>
              <CardDescription>Platform-wide file management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uploadedFiles.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No files uploaded yet</p>
                  </div>
                ) : (
                  uploadedFiles.map((file) => (
                    <div key={file.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="bg-gradient-primary p-2 rounded-lg shadow-glow">
                            <FileText className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{file.filename}</h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span>User ID: {file.userId}</span>
                              <span>{format(new Date(file.uploadDate), 'MMM dd, yyyy')}</span>
                              <Badge variant="secondary">{file.data.length} rows</Badge>
                              <Badge variant="outline">{file.columns.length} columns</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'charts':
        return (
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>All Generated Charts</CardTitle>
              <CardDescription>Platform-wide chart analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {charts.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No charts generated yet</p>
                  </div>
                ) : (
                  charts.map((chart) => {
                    const file = uploadedFiles.find(f => f.id === chart.dataId);
                    return (
                      <div key={chart.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="bg-gradient-chart p-2 rounded-lg shadow-glow">
                              <BarChart3 className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{chart.title}</h3>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                <span>From: {file?.filename}</span>
                                <span>{format(new Date(chart.createdAt), 'MMM dd, yyyy')}</span>
                                <Badge variant="secondary">{chart.type}</Badge>
                                <span>{chart.xAxis} × {chart.yAxis}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'users':
        const userActivity = Array.from(new Set(uploadedFiles.map(f => f.userId))).map(userId => {
          const userFiles = uploadedFiles.filter(f => f.userId === userId);
          const userCharts = charts.filter(chart => {
            const file = uploadedFiles.find(f => f.id === chart.dataId);
            return file?.userId === userId;
          });
          
          return {
            userId,
            fileCount: userFiles.length,
            chartCount: userCharts.length,
            totalRows: userFiles.reduce((sum, file) => sum + file.data.length, 0),
            lastActivity: userFiles.length > 0 ? 
              Math.max(...userFiles.map(f => new Date(f.uploadDate).getTime())) : 0,
          };
        });

        return (
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>Monitor user engagement and usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No user activity yet</p>
                  </div>
                ) : (
                  userActivity.map((activity) => (
                    <div key={activity.userId} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="bg-gradient-primary p-2 rounded-lg shadow-glow">
                            <Users className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">User ID: {activity.userId}</h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <Badge variant="secondary">{activity.fileCount} files</Badge>
                              <Badge variant="outline">{activity.chartCount} charts</Badge>
                              <span>{activity.totalRows.toLocaleString()} rows processed</span>
                              {activity.lastActivity > 0 && (
                                <span>Last: {format(new Date(activity.lastActivity), 'MMM dd, yyyy')}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground">
            Monitor platform usage, manage files, and oversee user activity
          </p>
        </div>

        {/* Navigation Tabs */}
        <Card className="shadow-elegant">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <Button
                    key={tab.id}
                    variant={isActive ? "default" : "outline"}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 ${
                      isActive 
                        ? "bg-gradient-primary shadow-glow" 
                        : "hover:bg-muted border-border"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};