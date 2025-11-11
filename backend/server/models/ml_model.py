"""
Pydantic models for ML Model storage
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, UUID4
from datetime import datetime


class PreviewData(BaseModel):
    """Preview data from uploaded file"""
    filename: str
    rows: int
    columns: int
    column_names: List[str]
    preview_data: List[Dict[str, Any]]
    data_summary: Optional[Dict[str, Any]] = None


class CorrelationData(BaseModel):
    """Correlation analysis data"""
    success: bool
    message: str
    methods: List[str]
    n_variables: int
    variables: List[str]
    total_correlations: int
    samples_used: int
    top_correlations: List[Dict[str, Any]]
    all_correlations: List[Dict[str, Any]]
    correlation_matrices: Dict[str, Any]


class TrainingConfig(BaseModel):
    """Model training configuration"""
    selected_model: str
    clean_data: bool = False
    iqr_k: float = 1.5
    n_neighbors: int = 5


class VariableSelection(BaseModel):
    """Selected variables for model training"""
    outcome_variable: str
    predictor_variables: List[str]


class ModelResults(BaseModel):
    """Model training results"""
    r2_score: Optional[float] = None
    accuracy: Optional[float] = None
    mse: Optional[float] = None
    results_data: Optional[Dict[str, Any]] = None


class MLModelCreate(BaseModel):
    """Schema for creating a new ML Model"""
    id: UUID4
    user_id: Optional[UUID4] = None  # Will be set by Auth.js
    model_name: Optional[str] = None

    # Preview data
    preview: PreviewData

    # Correlations
    correlation_data: Optional[CorrelationData] = None

    # Variable selection
    variable_selection: VariableSelection

    # Model configuration
    training_config: TrainingConfig

    # Results
    results: Optional[ModelResults] = None


class MLModelResponse(BaseModel):
    """Schema for ML Model response"""
    id: UUID4
    user_id: Optional[UUID4] = None
    model_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    # Preview data
    preview: PreviewData

    # Correlations
    correlation_data: Optional[CorrelationData] = None

    # Variable selection
    variable_selection: VariableSelection

    # Model configuration
    training_config: TrainingConfig

    # Results
    results: Optional[ModelResults] = None

    # Model file info
    has_model_file: bool = False
    model_file_size: Optional[int] = None

    class Config:
        from_attributes = True


class MLModelListItem(BaseModel):
    """Schema for ML Model in list view (lightweight)"""
    id: UUID4
    model_name: Optional[str] = None
    created_at: datetime
    outcome_variable: str
    selected_model: str
    has_results: bool
    has_model_file: bool

    class Config:
        from_attributes = True
