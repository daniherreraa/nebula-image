/**
 * API client for ML Models endpoints
 */

const API_BASE_URL = typeof window !== 'undefined'
  ? 'http://localhost:8000'
  : process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000';

export interface MLModelCreate {
  id: string;
  user_id?: string;
  model_name?: string;
  preview: {
    filename: string;
    rows: number;
    columns: number;
    column_names: string[];
    preview_data: Array<Record<string, any>>;
    data_summary?: any;
  };
  correlation_data?: any;
  variable_selection: {
    outcome_variable: string;
    predictor_variables: string[];
  };
  training_config: {
    selected_model: string;
    clean_data: boolean;
    iqr_k: number;
    n_neighbors: number;
  };
  results?: {
    r2_score?: number;
    accuracy?: number;
    mse?: number;
    results_data?: any;
  };
}

export interface MLModelResponse extends MLModelCreate {
  created_at: string;
  updated_at: string;
  has_model_file: boolean;
  model_file_size?: number;
}

export interface MLModelListItem {
  id: string;
  model_name?: string;
  created_at: string;
  outcome_variable: string;
  selected_model: string;
  has_results: boolean;
  has_model_file: boolean;
}

/**
 * Save a complete ML model to the database
 */
export async function saveModel(model: MLModelCreate): Promise<MLModelResponse> {
  try {
    console.log("🚀 saveModel - Input model:", model);
    console.log("🚀 saveModel - training_config.selected_model:", model.training_config.selected_model);

    const jsonBody = JSON.stringify(model);
    console.log("🚀 saveModel - JSON body:", jsonBody.substring(0, 500));

    const response = await fetch(`${API_BASE_URL}/api/models`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Send cookies for authentication
      body: jsonBody,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to save model');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving model:', error);
    throw error;
  }
}

/**
 * Get all models for the current user
 */
export async function listModels(userId?: string): Promise<MLModelListItem[]> {
  try {
    const url = new URL(`${API_BASE_URL}/api/models`);
    // Note: userId parameter is ignored by backend for security
    // Backend always uses authenticated user from cookies

    const response = await fetch(url.toString(), {
      credentials: 'include', // Send cookies for authentication
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch models');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
}

/**
 * Get a specific model by ID
 */
export async function getModel(modelId: string): Promise<MLModelResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/models/${modelId}`, {
      credentials: 'include', // Send cookies for authentication
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch model');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching model:', error);
    throw error;
  }
}

/**
 * Delete a model by ID
 */
export async function deleteModel(modelId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/models/${modelId}`, {
      method: 'DELETE',
      credentials: 'include', // Send cookies for authentication
    });

    if (!response.ok && response.status !== 204) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete model');
    }
  } catch (error) {
    console.error('Error deleting model:', error);
    throw error;
  }
}

/**
 * Download a trained model file
 */
export async function downloadModel(modelId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/download-model/${modelId}`, {
      credentials: 'include', // Send cookies for authentication
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to download model');
    }

    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `model_${modelId}.joblib`;

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    // Create blob and download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading model:', error);
    throw error;
  }
}
