import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Upload, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

export const FileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addUploadedFile } = useData();
  const { user } = useAuth();

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error('Please upload a valid Excel file (.xlsx, .xls) or CSV file');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Read and parse the file
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Get the first worksheet
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length === 0) {
        throw new Error('The file appears to be empty');
      }

      // Extract headers and data
      const headers = jsonData[0] as string[];
      const dataRows = jsonData.slice(1) as any[][];
      
      // Convert to object format
      const data = dataRows.map(row => {
        const obj: Record<string, any> = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });

      // Complete the progress
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Create file record
      const fileRecord = {
        id: Date.now().toString(),
        filename: file.name,
        uploadDate: new Date().toISOString(),
        data,
        columns: headers,
        userId: user!.id,
      };

      // Add to context
      addUploadedFile(fileRecord);

      toast.success(`Successfully uploaded ${file.name} with ${data.length} rows!`);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Upload Excel File
        </CardTitle>
        <CardDescription>
          Upload your Excel (.xlsx, .xls) or CSV files to start analyzing data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          
          {isUploading ? (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
              <div>
                <p className="text-sm font-medium">Uploading and parsing file...</p>
                <Progress value={uploadProgress} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">{uploadProgress}%</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="bg-gradient-primary p-3 rounded-full shadow-glow">
                  <File className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <p className="text-lg font-medium">Drop your Excel file here</p>
                <p className="text-sm text-muted-foreground">or click to browse</p>
              </div>
              <Button variant="outline" className="mt-4">
                Choose File
              </Button>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
          <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium">Supported formats:</p>
            <p className="text-muted-foreground">Excel files (.xlsx, .xls) and CSV files up to 10MB</p>
          </div>
        </div>

        <div className="mt-3 flex items-start gap-3 p-3 bg-accent/10 rounded-lg">
          <AlertCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium">Data requirements:</p>
            <p className="text-muted-foreground">First row should contain column headers for best results</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};