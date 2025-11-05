"""
Gestor de estado en memoria para mantener DataFrames y resultados entre requests
"""
import polars as pl
from typing import Optional, Dict, Any
from datetime import datetime


class StateManager:
    """
    Singleton para manejar el estado global de la aplicación.
    Mantiene el DataFrame, selección de features, y resultados de entrenamiento.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(StateManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        self.df: Optional[pl.DataFrame] = None
        self.df_original: Optional[pl.DataFrame] = None
        self.df_cleaned: Optional[pl.DataFrame] = None
        self.filename: Optional[str] = None
        self.encoding: Optional[str] = None
        self.separator: Optional[str] = None

        # Selección de features y label
        self.features: Optional[list] = None
        self.label: Optional[str] = None

        # Resultados de análisis
        self.summary: Optional[Dict[str, Any]] = None
        self.outliers_info: Optional[Dict[str, Any]] = None
        self.categorical_encoders: Optional[Dict[str, Any]] = None
        self.task_recommendation: Optional[Dict[str, Any]] = None

        # Datos de entrenamiento
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        self.scaler = None

        # Modelo entrenado
        self.trained_model = None
        self.model_results: Optional[Dict[str, Any]] = None

        # Metadata
        self.created_at: Optional[datetime] = None
        self.last_updated: Optional[datetime] = None

        self._initialized = True

    def set_dataframe(self, df: pl.DataFrame, filename: str, encoding: str, separator: str):
        """Establece el DataFrame principal"""
        self.df = df.clone()
        self.df_original = df.clone()
        self.filename = filename
        self.encoding = encoding
        self.separator = separator
        self.created_at = datetime.now()
        self.last_updated = datetime.now()

    def get_dataframe(self) -> Optional[pl.DataFrame]:
        """Obtiene el DataFrame actual"""
        return self.df

    def has_dataframe(self) -> bool:
        """Verifica si hay un DataFrame cargado"""
        return self.df is not None

    def update_dataframe(self, df: pl.DataFrame):
        """Actualiza el DataFrame (para después de limpieza, encoding, etc.)"""
        self.df = df.clone()
        self.last_updated = datetime.now()

    def set_cleaned_dataframe(self, df: pl.DataFrame):
        """Guarda el DataFrame limpio"""
        self.df_cleaned = df.clone()
        self.update_dataframe(df)

    def set_features_and_label(self, features: list, label: str):
        """Establece las features y label seleccionadas"""
        self.features = features
        self.label = label
        self.last_updated = datetime.now()

    def get_features_and_label(self):
        """Obtiene features y label"""
        return self.features, self.label

    def has_features_and_label(self) -> bool:
        """Verifica si hay features y label seleccionados"""
        return self.features is not None and self.label is not None

    def set_training_data(self, X_train, X_test, y_train, y_test, scaler):
        """Guarda los datos de entrenamiento"""
        self.X_train = X_train
        self.X_test = X_test
        self.y_train = y_train
        self.y_test = y_test
        self.scaler = scaler
        self.last_updated = datetime.now()

    def get_training_data(self):
        """Obtiene los datos de entrenamiento"""
        return self.X_train, self.X_test, self.y_train, self.y_test, self.scaler

    def has_training_data(self) -> bool:
        """Verifica si hay datos de entrenamiento"""
        return all([
            self.X_train is not None,
            self.X_test is not None,
            self.y_train is not None,
            self.y_test is not None
        ])

    def set_model_results(self, results: Dict[str, Any]):
        """Guarda los resultados del entrenamiento"""
        self.model_results = results
        if results.get("success") and "model" in results:
            self.trained_model = results["model"]
        self.last_updated = datetime.now()

    def get_model_results(self) -> Optional[Dict[str, Any]]:
        """Obtiene los resultados del modelo"""
        return self.model_results

    def has_trained_model(self) -> bool:
        """Verifica si hay un modelo entrenado"""
        return self.trained_model is not None and self.model_results is not None

    def set_summary(self, summary: Dict[str, Any]):
        """Guarda el resumen estadístico"""
        self.summary = summary
        self.last_updated = datetime.now()

    def set_outliers_info(self, outliers_info: Dict[str, Any]):
        """Guarda información de outliers"""
        self.outliers_info = outliers_info
        self.last_updated = datetime.now()

    def set_categorical_encoders(self, encoders: Dict[str, Any]):
        """Guarda los encoders categóricos"""
        self.categorical_encoders = encoders
        self.last_updated = datetime.now()

    def set_task_recommendation(self, recommendation: Dict[str, Any]):
        """Guarda la recomendación de tarea"""
        self.task_recommendation = recommendation
        self.last_updated = datetime.now()

    def reset(self):
        """Reinicia todo el estado"""
        self.__init__()
        self._initialized = True

    def get_state_info(self) -> Dict[str, Any]:
        """Obtiene información del estado actual"""
        return {
            "has_dataframe": self.has_dataframe(),
            "dataframe_shape": self.df.shape if self.df is not None else None,
            "filename": self.filename,
            "has_features_and_label": self.has_features_and_label(),
            "features_count": len(self.features) if self.features else 0,
            "label": self.label,
            "has_training_data": self.has_training_data(),
            "has_trained_model": self.has_trained_model(),
            "model_type": self.model_results.get("model_type") if self.model_results else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_updated": self.last_updated.isoformat() if self.last_updated else None
        }


# Instancia global del gestor de estado
state_manager = StateManager()
