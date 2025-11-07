// app/context/ModelContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from "react";

/**
 * Interface representing the dataset information returned by the upload API
 */
export interface DatasetInfo {
  success: boolean;
  message: string;
  filename: string;
  rows: number;
  columns: number;
  column_names: string[];
  preview: Array<Record<string, string | number | boolean | null>>;
  encoding: string;
  separator: string;
  // Backend data summary structure
  data_summary?: {
    shape: { rows: number; columns: number };
    columns: string[];
    data_types: Record<string, string>;
    memory_usage_mb: number;
    missing_values_percent: string;
    numeric_columns_count: number;
    categorical_columns_count: number;
    preview: Array<Record<string, any>>;
    columns_summary: Array<{
      column: string;
      dtype: string;
      non_null_count: number;
      missing_percent: string;
      unique_values: number;
      nan_percentage: string;
      mean?: number;
      std?: number;
      min?: number;
      max?: number;
      "25%"?: number;
      "50%"?: number;
      "75%"?: number;
      outliers_detection?: {
        method: string;
        lower_bound: number;
        upper_bound: number;
        outliers_count: number;
        outliers_percentage: number;
        has_outliers: boolean;
      };
      normality_test?: {
        test_name: string;
        statistic: number;
        p_value: number;
        is_normal: boolean;
        interpretation: string;
        alpha: number;
      };
      histogram_data?: {
        n_bins: number;
        bin_edges: number[];
        frequencies: number[];
        bin_width: number;
      };
      top_categories?: {
        top_n: number;
        values: Array<{
          value: string;
          count: number;
          percentage: number;
        }>;
      };
      top?: string;
      freq?: number;
    }>;
  };
  file_info?: {
    filename: string;
    encoding: string;
    separator: string;
    uploaded_at: string;
  };
}

export type ViewMode = "preview" | "selection" | "results";

/**
 * Interface for model training configuration
 */
export interface ModelTrainingConfig {
  outcomeVariable: string;
  predictors: string[];
  selectedModel: string;
  handleOutliers: boolean;
}

/**
 * Interface for correlation data from backend
 */
export interface CorrelationData {
  success: boolean;
  message: string;
  methods: string[];
  n_variables: number;
  variables: string[];
  total_correlations: number;
  samples_used: number;
  top_correlations: Array<{
    variable_1: string;
    variable_2: string;
    pearson: {
      correlation: number | null;
      p_value: number | null;
    };
    spearman: {
      correlation: number | null;
      p_value: number | null;
    };
    kendall: {
      correlation: number | null;
      p_value: number | null;
    };
    average_abs_correlation: number;
  }>;
  all_correlations: Array<{
    variable_1: string;
    variable_2: string;
    pearson: {
      correlation: number | null;
      p_value: number | null;
    };
    spearman: {
      correlation: number | null;
      p_value: number | null;
    };
    kendall: {
      correlation: number | null;
      p_value: number | null;
    };
    average_abs_correlation: number;
  }>;
  correlation_matrices: Record<string, Record<string, Record<string, {
    correlation: number | null;
    p_value: number | null;
  }>>>;
}

/**
 * Interface for model results
 */
export interface ModelResults {
  metrics: {
    r2?: number;
    accuracy?: number;
    mse?: number;
    [key: string]: number | undefined;
  };
  predictions?: Array<{ actual: number; predicted: number }>;
  featureImportance?: Array<{ index: number; importance: number; name: string }>;
  timestamp: string;
}

/**
 * Interface for the Model Context value
 */
export interface ModelContextType {
  modelId: string | null;
  setModelId: (id: string | null) => void;
  dataset: DatasetInfo | null;
  setDataset: (data: DatasetInfo | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  modelConfig: Record<string, unknown>;
  setModelConfig: (config: Record<string, unknown>) => void;
  results: Record<string, unknown> | null;
  setResults: (results: Record<string, unknown> | null) => void;
  clearDataset: () => void;
  isTraining: boolean;
  setIsTraining: (training: boolean) => void;
  trainingProgress: number;
  setTrainingProgress: Dispatch<SetStateAction<number>>;
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  hasCompletedTraining: boolean;
  setHasCompletedTraining: (completed: boolean) => void;
  trainingConfig: ModelTrainingConfig | null;
  setTrainingConfig: (config: ModelTrainingConfig | null) => void;
  modelResults: ModelResults | null;
  setModelResults: (results: ModelResults | null) => void;
  correlationData: CorrelationData | null;
  setCorrelationData: (data: CorrelationData | null) => void;
  isAnalyzingOutliers: boolean;
  setIsAnalyzingOutliers: (analyzing: boolean) => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

/**
 * Provider component for the Model Context
 * Manages global state for dataset, model configuration, and training results
 */
export function ModelProvider({ children }: { children: ReactNode }) {
  const [modelId, setModelId] = useState<string | null>(null);
  const [dataset, setDataset] = useState<DatasetInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modelConfig, setModelConfig] = useState<Record<string, unknown>>({});
  const [results, setResults] = useState<Record<string, unknown> | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [currentView, setCurrentView] = useState<ViewMode>("preview");
  const [hasCompletedTraining, setHasCompletedTraining] = useState(false);
  const [trainingConfig, setTrainingConfig] = useState<ModelTrainingConfig | null>(null);
  const [modelResults, setModelResults] = useState<ModelResults | null>(null);
  const [correlationData, setCorrelationData] = useState<CorrelationData | null>(null);
  const [isAnalyzingOutliers, setIsAnalyzingOutliers] = useState(false);

  const clearDataset = () => {
    setModelId(null);
    setDataset(null);
    setModelConfig({});
    setResults(null);
    setIsTraining(false);
    setTrainingProgress(0);
    setCurrentView("preview");
    setHasCompletedTraining(false);
    setTrainingConfig(null);
    setModelResults(null);
    setCorrelationData(null);
  };

  return (
    <ModelContext.Provider
      value={{
        modelId,
        setModelId,
        dataset,
        setDataset,
        isLoading,
        setIsLoading,
        modelConfig,
        setModelConfig,
        results,
        setResults,
        clearDataset,
        isTraining,
        setIsTraining,
        trainingProgress,
        setTrainingProgress,
        currentView,
        setCurrentView,
        hasCompletedTraining,
        setHasCompletedTraining,
        trainingConfig,
        setTrainingConfig,
        modelResults,
        setModelResults,
        correlationData,
        setCorrelationData,
        isAnalyzingOutliers,
        setIsAnalyzingOutliers,
      }}
    >
      {children}
    </ModelContext.Provider>
  );
}

/**
 * Custom hook to access the Model Context
 * @throws Error if used outside of ModelProvider
 */
export function useModel() {
  const context = useContext(ModelContext);

  if (context === undefined) {
    throw new Error("useModel must be used within a ModelProvider");
  }

  return context;
}

/**
 * Custom hook to optionally access the Model Context
 * Returns null if used outside of ModelProvider
 */
export function useModelOptional() {
  const context = useContext(ModelContext);
  return context;
}