import { createContext, useContext, useState, ReactNode } from 'react';

export interface ExcelData {
  id: string;
  filename: string;
  uploadDate: string;
  data: Record<string, any>[];
  columns: string[];
  userId: string;
}

export interface ChartConfig {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | '3d-column';
  xAxis: string;
  yAxis: string;
  dataId: string;
  createdAt: string;
}

interface DataContextType {
  uploadedFiles: ExcelData[];
  charts: ChartConfig[];
  addUploadedFile: (file: ExcelData) => void;
  addChart: (chart: ChartConfig) => void;
  removeChart: (chartId: string) => void;
  getFileById: (id: string) => ExcelData | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider = ({ children }: DataProviderProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<ExcelData[]>([]);
  const [charts, setCharts] = useState<ChartConfig[]>([]);

  const addUploadedFile = (file: ExcelData) => {
    setUploadedFiles(prev => [...prev, file]);
  };

  const addChart = (chart: ChartConfig) => {
    setCharts(prev => [...prev, chart]);
  };

  const removeChart = (chartId: string) => {
    setCharts(prev => prev.filter(chart => chart.id !== chartId));
  };

  const getFileById = (id: string) => {
    return uploadedFiles.find(file => file.id === id);
  };

  return (
    <DataContext.Provider value={{
      uploadedFiles,
      charts,
      addUploadedFile,
      addChart,
      removeChart,
      getFileById
    }}>
      {children}
    </DataContext.Provider>
  );
};