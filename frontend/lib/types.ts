export type FileInputProps = {
  file: File | null;
  setFile: (file: File | null) => void;
}

export interface PreviewData {
  header: string[];
  first_rows: Record<string, string | number | null>[];
}

// Feature Selection Types
export interface SelectFeaturesRequest {
  features: string[];
  label: string;
}

export interface SelectFeaturesResponse {
  success: boolean;
  message: string;
  features: string[];
  label: string;
  features_count: number;
  all_columns_exist: boolean;
}

// Model Recommendation Types
export interface ModelInfo {
  model_type: string;
  name: string;
  description: string;
}

export interface RecommendTaskResponse {
  problem_type: string;
  data_type: string;
  unique_values: number;
  total_values: number;
  null_values: number;
  unique_samples: number[];
  recommendation: string;
  available_models: ModelInfo[];
  valid_models: string[];
}

// Outliers Analysis Types
export interface OutliersAnalysisParams {
  iqr_k: number;
  clean_data: boolean;
  n_neighbors: number;
}

export interface OutliersAnalysisResponse {
  // Add actual response type based on your backend
  success: boolean;
  message?: string;
  [key: string]: any;
}

// Encode Categorical Types
export interface EncodeCategoricalResponse {
  success: boolean;
  message: string;
  columns_encoded: string[];
  encoders: Record<string, any>;
}

// Prepare Data Types
export interface PrepareDataResponse {
  success: boolean;
  message: string;
  train_shape: [number, number];
  test_shape: [number, number];
}

// Training Types
export interface TrainModelRequest {
  model_type: string;
}

export interface TrainModelResponse {
  success: boolean;
  message?: string;
  metrics?: any;
  predictions?: Array<{actual: number; predicted: number}>;
  feature_importance?: any[];
  model_type?: string;
  training_info?: any;
  [key: string]: any;
}
