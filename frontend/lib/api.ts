import {
  PreviewData,
  SelectFeaturesRequest,
  SelectFeaturesResponse,
  RecommendTaskResponse,
  OutliersAnalysisParams,
  OutliersAnalysisResponse,
  EncodeCategoricalResponse,
  PrepareDataResponse,
  TrainModelRequest,
  TrainModelResponse
} from "@/lib/types";
import { getApiUrl } from "@/lib/config";

export async function getDataPreview(): Promise<PreviewData> {
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/data-preview`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch data preview');
    }

    return response.json();
}

export async function selectFeatures(data: SelectFeaturesRequest): Promise<SelectFeaturesResponse> {
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/api/select-features`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Failed to select features');
    }

    return response.json();
}

export async function recommendTask(): Promise<RecommendTaskResponse> {
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/api/recommend-task`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to get model recommendations');
    }

    return response.json();
}

export async function encodeCategorical(): Promise<EncodeCategoricalResponse> {
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/api/encode-categorical`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        // Try to parse error detail from backend
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.message || 'Failed to encode categorical variables';
        throw new Error(errorMessage);
    }

    return response.json();
}

export async function analyzeOutliers(params: OutliersAnalysisParams): Promise<OutliersAnalysisResponse> {
    const apiUrl = getApiUrl();
    const queryParams = new URLSearchParams({
        iqr_k: params.iqr_k.toString(),
        clean_data: params.clean_data.toString(),
        n_neighbors: params.n_neighbors.toString(),
    });

    const response = await fetch(`${apiUrl}/api/outliers-analysis?${queryParams}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        // Try to parse error detail from backend
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.message || 'Failed to analyze outliers';
        throw new Error(errorMessage);
    }

    return response.json();
}

export async function prepareData(): Promise<PrepareDataResponse> {
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/api/prepare-data`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        // Try to parse error detail from backend
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.message || 'Failed to prepare data';
        throw new Error(errorMessage);
    }

    return response.json();
}

export async function trainModel(data: TrainModelRequest): Promise<TrainModelResponse> {
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/api/train`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        // Try to parse error detail from backend
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.message || 'Failed to train model';
        throw new Error(errorMessage);
    }

    return response.json();
}