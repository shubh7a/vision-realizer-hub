import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Calendar, Database, BarChart3, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface FileHistoryProps {
  onSelectFile: (fileId: string) => void;
}

export const FileHistory = ({ onSelectFile }: FileHistoryProps) => {
  const { uploadedFiles } = useData();
  const { user } = useAuth();

  const userFiles = uploadedFiles.filter(file => 
    user?.role === 'admin' || file.userId === user?.id
  );

  if (userFiles.length === 0) {
    return (
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Upload History
          </CardTitle>
          <CardDescription>
            Your uploaded files will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No files uploaded yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Upload your first Excel file to get started with data analysis
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Upload History
        </CardTitle>
        <CardDescription>
          Manage and analyze your uploaded files
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {userFiles.map((file) => (
            <div
              key={file.id}
              className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="bg-gradient-primary p-2 rounded-lg shadow-glow">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{file.filename}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(file.uploadDate), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Database className="h-3 w-3" />
                        {file.data.length} rows
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {file.columns.length} columns
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => onSelectFile(file.id)}
                    className="bg-gradient-primary hover:opacity-90 shadow-glow"
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Analyze
                  </Button>
                  {user?.role === 'admin' && (
                    <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Column headers:</p>
                <div className="flex flex-wrap gap-1">
                  {file.columns.slice(0, 6).map((column, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {column}
                    </Badge>
                  ))}
                  {file.columns.length > 6 && (
                    <Badge variant="outline" className="text-xs">
                      +{file.columns.length - 6} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};