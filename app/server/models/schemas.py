"""
Pydantic schemas para validación de requests y responses
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class UploadResponse(BaseModel):
    """Response del endpoint de upload"""
    success: bool
    message: str
    filename: str
    rows: int
    columns: int
    column_names: List[str]
    preview: List[Dict[str, Any]]
    encoding: str
    separator: str


class SummaryResponse(BaseModel):
    """Response del endpoint de resumen estadístico"""
    shape: Dict[str, int]
    columns: List[str]
    data_types: Dict[str, str]
    memory_usage_mb: float
    missing_values_percent: str
    numeric_columns_count: int
    categorical_columns_count: int
    preview: List[Dict[str, Any]]
    columns_summary: List[Dict[str, Any]]


class OutliersRequest(BaseModel):
    """Request para detección de outliers"""
    columns: Optional[List[str]] = Field(None, description="Columnas a analizar (None para todas las numéricas)")
    methods: List[str] = Field(
        default=["iqr"],
        description="Métodos a usar: iqr, zscore, isolation_forest"
    )
    iqr_k: float = Field(default=1.5, description="Factor K para método IQR")


class OutliersResponse(BaseModel):
    """Response de detección de outliers"""
    success: bool
    columns_analyzed: List[str]
    methods_used: List[str]
    outliers_by_column: Dict[str, Any]
    message: str


class CleanDataRequest(BaseModel):
    """Request para limpieza de datos"""
    columns: Optional[List[str]] = Field(None, description="Columnas a limpiar (None para todas)")
    iqr_k: float = Field(default=1.5, description="Factor K para detección de outliers")
    n_neighbors: int = Field(default=5, description="Número de vecinos para KNN imputation")


class CleanDataResponse(BaseModel):
    """Response de limpieza de datos"""
    success: bool
    message: str
    columns_cleaned: List[str]
    rows_before: int
    rows_after: int
    outliers_removed: int


class SelectFeaturesRequest(BaseModel):
    """Request para seleccionar features y label"""
    features: List[str] = Field(..., description="Lista de columnas a usar como features")
    label: str = Field(..., description="Columna a usar como label/target")


class SelectFeaturesResponse(BaseModel):
    """Response de selección de features"""
    success: bool
    message: str
    features: List[str]
    label: str
    features_count: int
    all_columns_exist: bool


class EncodeCategoricalResponse(BaseModel):
    """Response de codificación categórica"""
    success: bool
    message: str
    columns_encoded: List[str]
    encoders: Dict[str, Any]


class RecommendationResponse(BaseModel):
    """Response de recomendación de tarea ML"""
    problem_type: str
    data_type: str
    unique_values: int
    total_values: int
    null_values: int
    unique_samples: List[Any]
    recommendation: str
    available_models: List[Dict[str, str]]
    valid_models: List[str]


class PrepareDataResponse(BaseModel):
    """Response de preparación de datos"""
    success: bool
    message: str
    training_samples: int
    test_samples: int
    features_shape: List[int]
    label_shape: List[int]


class TrainModelRequest(BaseModel):
    """Request para entrenar modelo"""
    model_type: str = Field(..., description="Tipo de modelo a entrenar")


class TrainModelResponse(BaseModel):
    """Response de entrenamiento"""
    success: bool
    message: str
    model_type: str
    metrics: Dict[str, Any]
    training_info: Dict[str, Any]
    feature_importance: Optional[Dict[str, float]] = None


class DownloadModelResponse(BaseModel):
    """Response para descarga de modelo"""
    success: bool
    filename: str
    file_size_mb: float
    message: str


class ErrorResponse(BaseModel):
    """Response estándar de error"""
    success: bool = False
    error: str
    detail: Optional[str] = None
