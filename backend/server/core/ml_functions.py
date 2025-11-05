"""
Funciones principales de nebula para Machine Learning

"""
import polars as pl
import numpy as np
import chardet
import joblib
import io
import base64
import logging
from datetime import datetime
from typing import List, Dict
import json

logger = logging.getLogger(__name__)

# Sklearn imports
from sklearn.impute import KNNImputer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet, LogisticRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVR, SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeClassifier
from xgboost import XGBRegressor, XGBClassifier
from sklearn.metrics import (
    mean_squared_error, mean_absolute_error, r2_score,
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix
)

# Scipy imports for statistical tests
from scipy import stats

import polars as pl
import chardet
import io

def load_csv(file_obj, **kwargs):
    """
    Carga un archivo CSV desde un objeto file (upload) usando Polars.
    Detecta automáticamente encoding, separador y maneja comentarios.

    Args:
        file_obj: Objeto file de Streamlit/Flask/etc (con método .read())
        **kwargs: Parámetros adicionales para pl.read_csv()

    Returns:
        pl.DataFrame
    """
    try:
        # 1. LEER CONTENIDO
        content = file_obj.read()
        file_obj.seek(0)  # Resetear por si acaso

        # 2. DETECTAR ENCODING
        result = chardet.detect(content[:50000])
        encoding = result['encoding'] or 'utf-8'

        # 3. DECODIFICAR Y ANALIZAR MUESTRA
        try:
            text_content = content.decode(encoding, errors='replace')
        except:
            text_content = content.decode('utf-8', errors='replace')

        # Obtener primeras líneas (sin comentarios)
        lines = []
        for line in text_content.split('\n'):
            if not line.strip().startswith('#'):
                lines.append(line)
            if len(lines) >= 10:
                break

        # 4. DETECTAR SEPARADOR
        separators = [',', ';', '\t', '|', ' ']
        best_sep = ','
        best_score = 0

        for sep in separators:
            counts = [line.count(sep) for line in lines if line.strip()]
            if counts and max(counts) > 0:
                avg = sum(counts) / len(counts)
                if avg < 1:
                    continue
                std = (sum((c - avg)**2 for c in counts) / len(counts))**0.5
                score = avg / (1 + std)
                if score > best_score:
                    best_score = score
                    best_sep = sep

        # 5. CONFIGURACIÓN POLARS
        config = {
            'separator': best_sep,
            'encoding': encoding,
            'comment_prefix': '#',
            'truncate_ragged_lines': True,
            'ignore_errors': True,
            'infer_schema_length': 1000,
            'null_values': ['', 'NA', 'N/A', 'NULL', 'null', 'None', 'nan', 'NaN'],
        }

        # Override con kwargs del usuario
        config.update(kwargs)

        # 6. CREAR BUFFER Y CARGAR
        csv_buffer = io.BytesIO(content)

        try:
            df = pl.read_csv(csv_buffer, **config)

            # Eliminar columnas con nombres vacíos o solo espacios
            valid_columns = [col for col in df.columns if col and str(col).strip() != ""]
            if len(valid_columns) < len(df.columns):
                print(f" Advertencia: Se eliminaron {len(df.columns) - len(valid_columns)} columnas con nombres vacíos")
                df = df.select(valid_columns)

            print(f" Cargado: {df.shape[0]:,} filas × {df.shape[1]} cols")
            print(f"   Sep: {repr(best_sep)} | Enc: {encoding}")
            return df

        except Exception as e:
            # FALLBACK: Probar otros separadores
            for sep in separators:
                if sep == best_sep:
                    continue
                try:
                    csv_buffer.seek(0)  # Resetear buffer
                    config['separator'] = sep
                    df = pl.read_csv(csv_buffer, **config)

                    # Eliminar columnas con nombres vacíos
                    valid_columns = [col for col in df.columns if col and str(col).strip() != ""]
                    if len(valid_columns) < len(df.columns):
                        print(f" Advertencia: Se eliminaron {len(df.columns) - len(valid_columns)} columnas con nombres vacíos")
                        df = df.select(valid_columns)

                    print(f" Cargado (fallback): {df.shape[0]:,} filas × {df.shape[1]} cols")
                    print(f"   Sep: {repr(sep)} | Enc: {encoding}")
                    return df
                except:
                    continue
            try:
                csv_buffer.seek(0)
                config['separator'] = best_sep
                config['infer_schema_length'] = 0
                df = pl.read_csv(csv_buffer, **config)
                print(f" Cargado (modo string): {df.shape[0]:,} filas × {df.shape[1]} cols")
                return df
            except:
                raise e

    except Exception as e:
        raise Exception(f" Error al cargar CSV: {str(e)}")


# 2. GET DATA SUMMARY
def get_data_summary(df: pl.DataFrame, preview_rows: int = 5, top_n_categorical: int = 10):
    """
    Obtiene un resumen estadístico completo del DataFrame usando Polars.
    Incluye shape, tipos de datos, nulls, memoria, columnas numéricas y categóricas,
    análisis de normalidad, detección de outliers, y top de categorías.

    Args:
        df: DataFrame de Polars
        preview_rows: Número de filas para preview
        top_n_categorical: Número de valores categóricos más frecuentes a mostrar

    Returns:
        dict: Resumen completo del dataset
    """
    try:
        #  Información general
        total_rows, total_cols = df.shape
        null_counts = df.null_count().to_dicts()[0]
        total_cells = total_rows * total_cols
        total_nulls = sum(null_counts.values())
        missing_values_percent = (
            round((total_nulls / total_cells) * 100, 2) if total_cells > 0 else 0
        )

        # Preview de datos (primeras filas) 
        preview_data = df.head(preview_rows).to_dicts()

        # Clasificación de columnas por tipo
        numeric_columns = []
        categorical_columns = []
        for col, dtype in zip(df.columns, df.dtypes):
            # Filtrar columnas con nombres vacíos o solo espacios
            if not col or str(col).strip() == "":
                continue
            dtype_str = str(dtype)
            if dtype_str.startswith(("Int", "UInt", "Float")):
                numeric_columns.append(col)
            else:
                categorical_columns.append(col)

        #  Resumen general del dataset 
        summary = {
            "shape": {"rows": total_rows, "columns": total_cols},
            "columns": df.columns,
            "data_types": {col: str(dtype) for col, dtype in zip(df.columns, df.dtypes)},
            "memory_usage_mb": round(df.estimated_size("mb"), 3),
            "missing_values_percent": f"{missing_values_percent}%",
            "numeric_columns_count": len(numeric_columns),
            "categorical_columns_count": len(categorical_columns),
            "preview": preview_data,
        }

        #  Resumen por columna 
        column_summaries = []
        for col in df.columns:
            # Saltar columnas con nombres vacíos
            if not col or str(col).strip() == "":
                continue
            col_data = df.select(col)
            dtype = str(df[col].dtype)
            non_null_count = total_rows - null_counts[col]
            nan_percent = (
                round((null_counts[col] / total_rows) * 100, 2)
                if total_rows > 0
                else 0
            )
            unique_values = col_data.n_unique()
            col_summary = {
                "column": col,
                "dtype": dtype,
                "non_null_count": non_null_count,
                "missing_percent": f"{nan_percent}%",
                "unique_values": int(unique_values),
                "nan_percentage": f"{nan_percent}%",
            }

            # Si es numérica, agrega estadísticas descriptivas avanzadas
            if dtype.startswith(("Int", "UInt", "Float")):
                try:
                    # Calcular estadísticas manualmente para mayor compatibilidad
                    non_null = col_data.drop_nulls()
                    if len(non_null) > 0:
                        col_summary.update({
                            "mean": float(non_null.mean()[col][0]) if len(non_null) > 0 else None,
                            "std": float(non_null.std()[col][0]) if len(non_null) > 1 else None,
                            "min": float(non_null.min()[col][0]) if len(non_null) > 0 else None,
                            "max": float(non_null.max()[col][0]) if len(non_null) > 0 else None,
                            "25%": float(non_null.quantile(0.25)[col][0]) if len(non_null) > 0 else None,
                            "50%": float(non_null.quantile(0.50)[col][0]) if len(non_null) > 0 else None,
                            "75%": float(non_null.quantile(0.75)[col][0]) if len(non_null) > 0 else None,
                        })
                except Exception as e:
                    logger.warning(f"Error calculando estadísticas para {col}: {e}")
                    col_summary.update({
                        "mean": None,
                        "std": None,
                        "min": None,
                        "max": None,
                        "25%": None,
                        "50%": None,
                        "75%": None,
                    })

                # Detección de outliers usando IQR
                try:
                    non_null_data = df.select(pl.col(col)).drop_nulls()
                    if len(non_null_data) > 0:
                        q1 = non_null_data.select(pl.col(col).quantile(0.25))[col][0]
                        q3 = non_null_data.select(pl.col(col).quantile(0.75))[col][0]
                        iqr = q3 - q1
                        lower_bound = q1 - 1.5 * iqr
                        upper_bound = q3 + 1.5 * iqr

                        outliers_mask = (df[col] < lower_bound) | (df[col] > upper_bound)
                        outliers_count = outliers_mask.sum()

                        col_summary["outliers_detection"] = {
                            "method": "IQR",
                            "lower_bound": float(lower_bound) if lower_bound is not None else None,
                            "upper_bound": float(upper_bound) if upper_bound is not None else None,
                            "outliers_count": int(outliers_count),
                            "outliers_percentage": round((outliers_count / total_rows) * 100, 2),
                            "has_outliers": bool(outliers_count > 0)
                        }
                except Exception:
                    col_summary["outliers_detection"] = None

                # Test de normalidad (Shapiro-Wilk para n < 5000, Anderson-Darling para n >= 5000)
                try:
                    non_null_data = df.select(pl.col(col)).drop_nulls().to_series().to_numpy()
                    if len(non_null_data) > 3:  # Mínimo requerido para test
                        if len(non_null_data) < 5000:
                            # Shapiro-Wilk test
                            statistic, p_value = stats.shapiro(non_null_data)
                            test_name = "Shapiro-Wilk"
                        else:
                            # Anderson-Darling test
                            result = stats.anderson(non_null_data)
                            statistic = result.statistic
                            # Para Anderson, usamos el nivel de significancia del 5% (índice 2)
                            p_value = 0.05 if statistic < result.critical_values[2] else 0.01
                            test_name = "Anderson-Darling"

                        is_normal = p_value > 0.05
                        col_summary["normality_test"] = {
                            "test_name": test_name,
                            "statistic": float(statistic),
                            "p_value": float(p_value) if isinstance(p_value, (int, float)) else 0.05,
                            "is_normal": bool(is_normal),
                            "interpretation": "Distribución normal" if is_normal else "Distribución no normal",
                            "alpha": 0.05
                        }
                except Exception as e:
                    col_summary["normality_test"] = None

                # Información para histogramas
                try:
                    non_null_data = df.select(pl.col(col)).drop_nulls().to_series().to_numpy()
                    if len(non_null_data) > 0:
                        # Calcular bins usando regla de Sturges
                        n_bins = int(np.ceil(np.log2(len(non_null_data)) + 1))
                        n_bins = min(max(n_bins, 5), 50)  # Entre 5 y 50 bins

                        hist, bin_edges = np.histogram(non_null_data, bins=n_bins)

                        col_summary["histogram_data"] = {
                            "n_bins": n_bins,
                            "bin_edges": [float(x) for x in bin_edges],
                            "frequencies": [int(x) for x in hist],
                            "bin_width": float(bin_edges[1] - bin_edges[0]) if len(bin_edges) > 1 else 0
                        }
                except Exception:
                    col_summary["histogram_data"] = None

            else:
                # Para categóricas: top N valores más frecuentes
                try:
                    # Contar valores y obtener los top N
                    value_counts = (
                        df.select(pl.col(col))
                        .drop_nulls()
                        .group_by(col)
                        .agg(pl.count().alias("count"))
                        .sort("count", descending=True)
                        .head(top_n_categorical)
                    )

                    top_values = []
                    for row in value_counts.iter_rows(named=True):
                        top_values.append({
                            "value": row[col],
                            "count": row["count"],
                            "percentage": round((row["count"] / non_null_count) * 100, 2) if non_null_count > 0 else 0
                        })

                    col_summary["top_categories"] = {
                        "top_n": len(top_values),
                        "values": top_values
                    }

                    # Mantener compatibilidad con versión anterior
                    if len(top_values) > 0:
                        col_summary["top"] = top_values[0]["value"]
                        col_summary["freq"] = top_values[0]["count"]

                except Exception:
                    col_summary["top_categories"] = None

            column_summaries.append(col_summary)

        summary["columns_summary"] = column_summaries

        return summary

    except Exception as e:
        return {"error": f"Error al generar resumen de datos: {str(e)}"}


# 3. ANALYZE CORRELATIONS
def safe_float(value):
    """
    Convierte un valor a float, manejando NaN e Infinity.
    Retorna None si el valor no es finito.
    """
    try:
        f = float(value)
        if np.isnan(f) or np.isinf(f):
            return None
        return f
    except (ValueError, TypeError):
        return None


def analyze_correlations(df: pl.DataFrame):
    """
    Analiza las correlaciones entre todas las variables numéricas del DataFrame.
    Detecta automáticamente las variables numéricas y calcula tres tipos de
    correlaciones: Pearson, Spearman y Kendall, con sus p-valores.

    Args:
        df: DataFrame de Polars

    Returns:
        dict: Diccionario con correlaciones y p-valores para los tres métodos
    """
    try:
        # Detectar automáticamente columnas numéricas
        numeric_columns = []
        for col, dtype in zip(df.columns, df.dtypes):
            # Filtrar columnas con nombres vacíos o solo espacios
            if not col or str(col).strip() == "":
                continue
            dtype_str = str(dtype)
            if dtype_str.startswith(("Int", "UInt", "Float")):
                numeric_columns.append(col)

        if len(numeric_columns) < 2:
            return {
                "error": "Se necesitan al menos 2 variables numéricas para calcular correlaciones"
            }

        # Convertir a numpy para cálculos
        df_numeric = df.select(numeric_columns).drop_nulls()
        data_array = df_numeric.to_numpy()

        n_vars = len(numeric_columns)

        # Matrices para cada tipo de correlación
        methods = ["pearson", "spearman", "kendall"]
        correlation_matrices = {}
        p_value_matrices = {}

        for method in methods:
            correlation_matrices[method] = np.zeros((n_vars, n_vars))
            p_value_matrices[method] = np.zeros((n_vars, n_vars))

            # Calcular correlaciones y p-valores
            for i in range(n_vars):
                for j in range(n_vars):
                    if i == j:
                        correlation_matrices[method][i, j] = 1.0
                        p_value_matrices[method][i, j] = 0.0
                    else:
                        if method == "pearson":
                            corr, p_val = stats.pearsonr(data_array[:, i], data_array[:, j])
                        elif method == "spearman":
                            corr, p_val = stats.spearmanr(data_array[:, i], data_array[:, j])
                        elif method == "kendall":
                            corr, p_val = stats.kendalltau(data_array[:, i], data_array[:, j])

                        correlation_matrices[method][i, j] = corr
                        p_value_matrices[method][i, j] = p_val

        # Crear lista de correlaciones con todos los métodos
        correlations_list = []
        for i in range(n_vars):
            for j in range(i + 1, n_vars):  # Solo mitad superior (sin diagonal)
                # Usar safe_float para manejar NaN e Infinity
                pearson_corr = safe_float(correlation_matrices["pearson"][i, j])
                pearson_pval = safe_float(p_value_matrices["pearson"][i, j])
                spearman_corr = safe_float(correlation_matrices["spearman"][i, j])
                spearman_pval = safe_float(p_value_matrices["spearman"][i, j])
                kendall_corr = safe_float(correlation_matrices["kendall"][i, j])
                kendall_pval = safe_float(p_value_matrices["kendall"][i, j])

                corr_entry = {
                    "variable_1": numeric_columns[i],
                    "variable_2": numeric_columns[j],
                    "pearson": {
                        "correlation": pearson_corr,
                        "p_value": pearson_pval,
                    },
                    "spearman": {
                        "correlation": spearman_corr,
                        "p_value": spearman_pval,
                    },
                    "kendall": {
                        "correlation": kendall_corr,
                        "p_value": kendall_pval,
                    }
                }

                # Agregar correlación absoluta promedio para ordenar
                # Solo calcular si todos los valores son válidos
                valid_corrs = [c for c in [pearson_corr, spearman_corr, kendall_corr] if c is not None]
                if valid_corrs:
                    avg_abs_corr = sum(abs(c) for c in valid_corrs) / len(valid_corrs)
                    corr_entry["average_abs_correlation"] = avg_abs_corr
                else:
                    corr_entry["average_abs_correlation"] = 0.0

                correlations_list.append(corr_entry)

        # Ordenar por correlación absoluta promedio (de mayor a menor)
        correlations_list.sort(key=lambda x: x["average_abs_correlation"], reverse=True)

        # Crear matrices de correlación como diccionarios
        correlation_dict = {}
        for method in methods:
            correlation_dict[method] = {}
            for i, col_i in enumerate(numeric_columns):
                correlation_dict[method][col_i] = {}
                for j, col_j in enumerate(numeric_columns):
                    correlation_dict[method][col_i][col_j] = {
                        "correlation": safe_float(correlation_matrices[method][i, j]),
                        "p_value": safe_float(p_value_matrices[method][i, j])
                    }

        return {
            "success": True,
            "methods": methods,
            "n_variables": len(numeric_columns),
            "variables": numeric_columns,
            "correlation_matrices": correlation_dict,
            "correlations_list": correlations_list,
            "total_correlations": len(correlations_list),
            "samples_used": len(df_numeric)
        }

    except Exception as e:
        return {"error": f"Error al analizar correlaciones: {str(e)}"}


# 4. DETECT OUTLIERS AND CLEAN
def detect_iqr_bounds(df: pl.DataFrame, col: str, k: float = 2.5):
    """Calcula límites IQR  usando expresiones Polars"""
    q = df.select([
        pl.col(col).quantile(0.25).alias("q1"),
        pl.col(col).quantile(0.75).alias("q3")
    ])
    q1, q3 = q["q1"][0], q["q3"][0]
    iqr = q3 - q1
    lower = q1 - k * iqr
    upper = q3 + k * iqr
    return lower, upper

def clean_and_impute(
    df: pl.DataFrame,
    cols: list[str],
    iqr_k: float = 1.5,
    n_neighbors: int = 5
) -> pl.DataFrame:
    """Limpieza de outliers e imputación KNN usando Polars + scikit-learn nativo"""

    df_clean = df.clone()

    for col in cols:
        lower, upper = detect_iqr_bounds(df_clean, col, k=iqr_k)
        df_clean = df_clean.with_columns(
            pl.when((pl.col(col) >= lower) & (pl.col(col) <= upper))
              .then(pl.col(col))
              .otherwise(None)
              .alias(col)
        )

    imputer = KNNImputer(n_neighbors=n_neighbors)
    imputed = imputer.fit_transform(df_clean.select(cols))

    imputed_df = pl.DataFrame(imputed, schema=cols)
    df_clean = df_clean.with_columns(imputed_df)

    return df_clean


# 4. HANDLE CATEGORICAL FEATURES
def handle_categorical_features(df: pl.DataFrame, features: list[str]) -> tuple[pl.DataFrame, dict]:
    """
    Codifica variables categóricas usando mapeo numérico eficiente en Polars.
    Retorna el DataFrame transformado y los diccionarios de codificación.
    """
    df_proc = df.clone()
    encoders = {}

    for col in features:
        if str(df[col].dtype) in ["Utf8", "String", "Categorical"]:
            # Obtener valores únicos (sin nulos)
            uniques = df[col].drop_nulls().unique().to_list()

            # Crear mapeo de texto → número
            mapping = {val: i for i, val in enumerate(uniques)}

            # Aplicar mapeo directamente (más rápido que map_elements)
            df_proc = df_proc.with_columns(
                pl.col(col).replace(mapping).alias(col)
            )

            encoders[col] = mapping

    return df_proc, encoders


# 5. CHECK CLASSIFICATION OR REGRESSION
def check_classification_or_regression(df: pl.DataFrame, label_column: str):
    """
    Analiza la variable objetivo para determinar si es clasificación o regresión.
    Incluye una lista más amplia de modelos válidos.
    """
    try:
        #  Información básica de la variable objetivo 
        label_info = df.select(
            [
                pl.col(label_column).n_unique().alias("unique_values"),
                pl.col(label_column).count().alias("total_values"),
                pl.col(label_column).null_count().alias("null_values"),
            ]
        ).to_dicts()[0]

        data_type = str(df[label_column].dtype)
        unique_samples = (
            df.select(pl.col(label_column).unique()).to_series().head(10).to_list()
        )

        unique_count = label_info["unique_values"]
        total_count = label_info["total_values"]
        null_count = label_info["null_values"]

        # === Lista completa de modelos válidos ===
        valid_models = [
            # --- Regresión ---
            "linear_regression",
            "ridge_regression",
            "lasso_regression",
            "elastic_net",
            "random_forest_regression",
            "gradient_boosting_regression",
            "xgboost_regression",
            "svr",
            # --- Clasificación ---
            "logistic_regression",
            "random_forest_classification",
            "gradient_boosting_classification",
            "xgboost_classification",
            "svm_classification",
            "knn_classification",
            "naive_bayes",
            "decision_tree_classification",
        ]

        # === Determinar tipo de problema ===
        if "String" in data_type or "Utf8" in data_type or "Categorical" in data_type:
            problem_type = "classification"
            recommendation = "Variable categórica (texto). Se recomienda clasificación."
            available_models = [
                {"model_type": "logistic_regression", "name": "Logistic Regression", "description": "Linear model for binary/multiclass classification using logistic function"},
                {"model_type": "random_forest_classification", "name": "Random Forest", "description": "Ensemble of decision trees with bagging for robust classification"},
                {"model_type": "xgboost_classification", "name": "XGBoost", "description": "Gradient boosting framework optimized for speed and performance"},
                {"model_type": "gradient_boosting_classification", "name": "Gradient Boosting", "description": "Sequential ensemble method building trees to correct previous errors"},
                {"model_type": "svm_classification", "name": "Support Vector Machine", "description": "Finds optimal hyperplane to separate classes with maximum margin"},
                {"model_type": "decision_tree_classification", "name": "Decision Tree", "description": "Tree-based model using if-then rules for interpretable predictions"},
                {"model_type": "naive_bayes", "name": "Naive Bayes", "description": "Probabilistic classifier based on Bayes theorem with independence assumption"},
                {"model_type": "knn_classification", "name": "K-Nearest Neighbors", "description": "Instance-based learning using majority vote of k closest neighbors"},
            ]

        elif "Boolean" in data_type:
            problem_type = "classification"
            recommendation = "Variable booleana. Se recomienda clasificación binaria."
            available_models = [
                {"model_type": "logistic_regression", "name": "Logistic Regression", "description": "Linear model for binary/multiclass classification using logistic function"},
                {"model_type": "random_forest_classification", "name": "Random Forest", "description": "Ensemble of decision trees with bagging for robust classification"},
                {"model_type": "xgboost_classification", "name": "XGBoost", "description": "Gradient boosting framework optimized for speed and performance"},
                {"model_type": "svm_classification", "name": "Support Vector Machine", "description": "Finds optimal hyperplane to separate classes with maximum margin"},
                {"model_type": "naive_bayes", "name": "Naive Bayes", "description": "Probabilistic classifier based on Bayes theorem with independence assumption"},
            ]

        elif any(
            int_type in data_type
            for int_type in [
                "Int8", "Int16", "Int32", "Int64",
                "UInt8", "UInt16", "UInt32", "UInt64",
            ]
        ):
            if unique_count <= 10:
                problem_type = "classification"
                recommendation = f"Variable entera con pocos valores únicos ({unique_count}). Se recomienda clasificación."
                available_models = [
                    {"model_type": "logistic_regression", "name": "Logistic Regression", "description": "Linear model for binary/multiclass classification using logistic function"},
                    {"model_type": "random_forest_classification", "name": "Random Forest", "description": "Ensemble of decision trees with bagging for robust classification"},
                    {"model_type": "xgboost_classification", "name": "XGBoost", "description": "Gradient boosting framework optimized for speed and performance"},
                    {"model_type": "svm_classification", "name": "Support Vector Machine", "description": "Finds optimal hyperplane to separate classes with maximum margin"},
                    {"model_type": "knn_classification", "name": "K-Nearest Neighbors", "description": "Instance-based learning using majority vote of k closest neighbors"},
                    {"model_type": "decision_tree_classification", "name": "Decision Tree", "description": "Tree-based model using if-then rules for interpretable predictions"},
                ]
            else:
                problem_type = "regression"
                recommendation = f"Variable entera con muchos valores únicos ({unique_count}). Se recomienda regresión."
                available_models = [
                    {"model_type": "linear_regression", "name": "Linear Regression", "description": "Simple linear approach modeling relationship between features and target"},
                    {"model_type": "ridge_regression", "name": "Ridge Regression", "description": "Linear regression with L2 regularization to prevent overfitting"},
                    {"model_type": "lasso_regression", "name": "Lasso Regression", "description": "Linear regression with L1 regularization for feature selection"},
                    {"model_type": "elastic_net", "name": "Elastic Net", "description": "Combines L1 and L2 regularization for balanced feature selection"},
                    {"model_type": "random_forest_regression", "name": "Random Forest", "description": "Ensemble of decision trees with bagging for robust predictions"},
                    {"model_type": "xgboost_regression", "name": "XGBoost", "description": "Gradient boosting framework optimized for speed and performance"},
                    {"model_type": "gradient_boosting_regression", "name": "Gradient Boosting", "description": "Sequential ensemble method building trees to correct previous errors"},
                    {"model_type": "svr", "name": "Support Vector Regressor", "description": "Uses support vectors to find optimal regression hyperplane"},
                ]

        elif any(float_type in data_type for float_type in ["Float32", "Float64"]):
            if unique_count <= 10:
                problem_type = "classification"
                recommendation = f"Variable numérica con pocos valores únicos ({unique_count}). Se recomienda clasificación."
                available_models = [
                    {"model_type": "logistic_regression", "name": "Logistic Regression", "description": "Linear model for binary/multiclass classification using logistic function"},
                    {"model_type": "random_forest_classification", "name": "Random Forest", "description": "Ensemble of decision trees with bagging for robust classification"},
                    {"model_type": "xgboost_classification", "name": "XGBoost", "description": "Gradient boosting framework optimized for speed and performance"},
                    {"model_type": "svm_classification", "name": "Support Vector Machine", "description": "Finds optimal hyperplane to separate classes with maximum margin"},
                ]
            else:
                problem_type = "regression"
                recommendation = "Variable numérica continua. Se recomienda regresión."
                available_models = [
                    {"model_type": "linear_regression", "name": "Linear Regression", "description": "Simple linear approach modeling relationship between features and target"},
                    {"model_type": "ridge_regression", "name": "Ridge Regression", "description": "Linear regression with L2 regularization to prevent overfitting"},
                    {"model_type": "lasso_regression", "name": "Lasso Regression", "description": "Linear regression with L1 regularization for feature selection"},
                    {"model_type": "elastic_net", "name": "Elastic Net", "description": "Combines L1 and L2 regularization for balanced feature selection"},
                    {"model_type": "random_forest_regression", "name": "Random Forest", "description": "Ensemble of decision trees with bagging for robust predictions"},
                    {"model_type": "xgboost_regression", "name": "XGBoost", "description": "Gradient boosting framework optimized for speed and performance"},
                    {"model_type": "gradient_boosting_regression", "name": "Gradient Boosting", "description": "Sequential ensemble method building trees to correct previous errors"},
                    {"model_type": "svr", "name": "Support Vector Regressor", "description": "Uses support vectors to find optimal regression hyperplane"},
                ]

        else:
            problem_type = "unknown"
            recommendation = f"Tipo de dato no reconocido ({data_type}). Revisar manualmente."
            available_models = [
                {"model_type": "linear_regression", "name": "Linear Regression", "description": "Simple linear approach modeling relationship between features and target"},
                {"model_type": "logistic_regression", "name": "Logistic Regression", "description": "Linear model for binary/multiclass classification using logistic function"},
                {"model_type": "random_forest_regression", "name": "Random Forest Regression", "description": "Ensemble of decision trees with bagging for robust predictions"},
                {"model_type": "random_forest_classification", "name": "Random Forest Classification", "description": "Ensemble of decision trees with bagging for robust classification"},
            ]

        return {
            "problem_type": problem_type,
            "data_type": data_type,
            "unique_values": unique_count,
            "total_values": total_count,
            "null_values": null_count,
            "unique_samples": unique_samples,
            "recommendation": recommendation,
            "available_models": available_models,
            "valid_models": valid_models,
        }

    except Exception as e:
        return {"error": f"Error al analizar la variable objetivo: {str(e)}"}


# 6. PREPARE DATA FOR ML
def prepare_data_for_ml(df: pl.DataFrame, features: list, label: str):

    try:
        # Seleccionar solo las columnas necesarias (más eficiente con Polars)
        selected_data = df.select(features + [label])

        # Eliminar filas con valores nulos
        clean_data = selected_data.drop_nulls()

        # Separar features y target
        X = clean_data.select(features).to_numpy()
        y = clean_data.select(label).to_numpy().ravel()

        return X, y, clean_data

    except Exception as e:
        raise Exception(f"Error al preparar los datos: {str(e)}")


# 7. TRAIN MODEL (FUNCIÓN COMPLETA DEL NOTEBOOK)
def train_model(df: pl.DataFrame, features: list, label: str, model_type: str):

    try:
        # Modelos de regresión y clasificación disponibles
        valid_models = [
            # Regresión
            "linear_regression",
            "ridge_regression",
            "lasso_regression",
            "elastic_net",
            "random_forest_regression",
            "gradient_boosting_regression",
            "xgboost_regression",
            "svr",
            # Clasificación
            "logistic_regression",
            "random_forest_classification",
            "gradient_boosting_classification",
            "xgboost_classification",
            "svm_classification",
            "knn_classification",
            "naive_bayes",
            "decision_tree_classification",
        ]

        if model_type not in valid_models:
            return {
                "error": f"Tipo de modelo no válido. Opciones disponibles: {valid_models}"
            }

        # Manejar variables categóricas
        processed_df, categorical_encoders = handle_categorical_features(df, features)

        # Preparar datos
        X, y, clean_data = prepare_data_for_ml(processed_df, features, label)

        if len(X) == 0:
            return {
                "error": "No hay datos suficientes después de limpiar valores nulos"
            }

        # División de datos con estratificación para clasificación
        is_classification = any(clf in model_type for clf in ['classification', 'logistic', 'naive_bayes', 'svm_classification', 'knn'])

        if is_classification and len(np.unique(y)) > 1:
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )
        else:
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )

        # Escalamiento de features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)

        # Modelos de regresión

        if model_type == "linear_regression":
            model = LinearRegression()
            model.fit(X_train_scaled, y_train)
            y_pred = model.predict(X_test_scaled)

            metrics = {
                "mse": float(mean_squared_error(y_test, y_pred)),
                "rmse": float(np.sqrt(mean_squared_error(y_test, y_pred))),
                "mae": float(mean_absolute_error(y_test, y_pred)),
                "r2": float(r2_score(y_test, y_pred)),
            }

        elif model_type == "ridge_regression":
            model = Ridge(alpha=1.0, random_state=42)
            model.fit(X_train_scaled, y_train)
            y_pred = model.predict(X_test_scaled)

            metrics = {
                "mse": float(mean_squared_error(y_test, y_pred)),
                "rmse": float(np.sqrt(mean_squared_error(y_test, y_pred))),
                "mae": float(mean_absolute_error(y_test, y_pred)),
                "r2": float(r2_score(y_test, y_pred)),
            }

        elif model_type == "lasso_regression":
            model = Lasso(alpha=0.1, random_state=42, max_iter=2000)
            model.fit(X_train_scaled, y_train)
            y_pred = model.predict(X_test_scaled)

            metrics = {
                "mse": float(mean_squared_error(y_test, y_pred)),
                "rmse": float(np.sqrt(mean_squared_error(y_test, y_pred))),
                "mae": float(mean_absolute_error(y_test, y_pred)),
                "r2": float(r2_score(y_test, y_pred)),
            }

        elif model_type == "elastic_net":
            model = ElasticNet(alpha=0.1, l1_ratio=0.5, random_state=42, max_iter=2000)
            model.fit(X_train_scaled, y_train)
            y_pred = model.predict(X_test_scaled)

            metrics = {
                "mse": float(mean_squared_error(y_test, y_pred)),
                "rmse": float(np.sqrt(mean_squared_error(y_test, y_pred))),
                "mae": float(mean_absolute_error(y_test, y_pred)),
                "r2": float(r2_score(y_test, y_pred)),
            }

        elif model_type == "random_forest_regression":
            model = RandomForestRegressor(
                n_estimators=200,
                max_depth=15,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=-1
            )
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)

            metrics = {
                "mse": float(mean_squared_error(y_test, y_pred)),
                "rmse": float(np.sqrt(mean_squared_error(y_test, y_pred))),
                "mae": float(mean_absolute_error(y_test, y_pred)),
                "r2": float(r2_score(y_test, y_pred)),
                "feature_importance": {
                    feature: float(importance)
                    for feature, importance in zip(features, model.feature_importances_)
                },
            }

        elif model_type == "gradient_boosting_regression":
            model = GradientBoostingRegressor(
                n_estimators=150,
                learning_rate=0.1,
                max_depth=5,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42
            )
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)

            metrics = {
                "mse": float(mean_squared_error(y_test, y_pred)),
                "rmse": float(np.sqrt(mean_squared_error(y_test, y_pred))),
                "mae": float(mean_absolute_error(y_test, y_pred)),
                "r2": float(r2_score(y_test, y_pred)),
                "feature_importance": {
                    feature: float(importance)
                    for feature, importance in zip(features, model.feature_importances_)
                },
            }

        elif model_type == "xgboost_regression":
            model = XGBRegressor(
                n_estimators=150,
                learning_rate=0.1,
                max_depth=6,
                min_child_weight=3,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
                n_jobs=-1
            )
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)

            metrics = {
                "mse": float(mean_squared_error(y_test, y_pred)),
                "rmse": float(np.sqrt(mean_squared_error(y_test, y_pred))),
                "mae": float(mean_absolute_error(y_test, y_pred)),
                "r2": float(r2_score(y_test, y_pred)),
                "feature_importance": {
                    feature: float(importance)
                    for feature, importance in zip(features, model.feature_importances_)
                },
            }

        elif model_type == "svr":
            model = SVR(kernel='rbf', C=1.0, gamma='scale')
            model.fit(X_train_scaled, y_train)
            y_pred = model.predict(X_test_scaled)

            metrics = {
                "mse": float(mean_squared_error(y_test, y_pred)),
                "rmse": float(np.sqrt(mean_squared_error(y_test, y_pred))),
                "mae": float(mean_absolute_error(y_test, y_pred)),
                "r2": float(r2_score(y_test, y_pred)),
            }

        # Modelos de clasificación

        elif model_type == "logistic_regression":
            model = LogisticRegression(
                random_state=42,
                max_iter=2000,
                C=1.0,
                solver='lbfgs'
            )
            model.fit(X_train_scaled, y_train)
            y_pred = model.predict(X_test_scaled)

            metrics = {
                "accuracy": float(accuracy_score(y_test, y_pred)),
                "precision": float(precision_score(y_test, y_pred)),
                "recall": float(recall_score(y_test, y_pred)),
                "f1_score": float(f1_score(y_test, y_pred)),
                "classification_report": classification_report(
                    y_test, y_pred, output_dict=True, zero_division=0
                ),
                "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
            }

        elif model_type == "random_forest_classification":
            model = RandomForestClassifier(
                n_estimators=200,
                max_depth=15,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=-1
            )
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)

            metrics = {
                "accuracy": float(accuracy_score(y_test, y_pred)),
                "precision": float(precision_score(y_test, y_pred)),
                "recall": float(recall_score(y_test, y_pred)),
                "f1_score": float(f1_score(y_test, y_pred)),
                "classification_report": classification_report(
                    y_test, y_pred, output_dict=True, zero_division=0
                ),
                "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
                "feature_importance": {
                    feature: float(importance)
                    for feature, importance in zip(features, model.feature_importances_)
                },
            }

        elif model_type == "gradient_boosting_classification":
            model = GradientBoostingClassifier(
                n_estimators=150,
                learning_rate=0.1,
                max_depth=5,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42
            )
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)

            metrics = {
                "accuracy": float(accuracy_score(y_test, y_pred)),
                "precision": float(precision_score(y_test, y_pred)),
                "recall": float(recall_score(y_test, y_pred)),
                "f1_score": float(f1_score(y_test, y_pred)),
                "classification_report": classification_report(
                    y_test, y_pred, output_dict=True, zero_division=0
                ),
                "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
                "feature_importance": {
                    feature: float(importance)
                    for feature, importance in zip(features, model.feature_importances_)
                },
            }

        elif model_type == "xgboost_classification":
            model = XGBClassifier(
                n_estimators=150,
                learning_rate=0.1,
                max_depth=6,
                min_child_weight=3,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
                n_jobs=-1
            )
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)

            metrics = {
                "accuracy": float(accuracy_score(y_test, y_pred)),
                "precision": float(precision_score(y_test, y_pred)),
                "recall": float(recall_score(y_test, y_pred)),
                "f1_score": float(f1_score(y_test, y_pred)),
                "classification_report": classification_report(
                    y_test, y_pred, output_dict=True, zero_division=0
                ),
                "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
                "feature_importance": {
                    feature: float(importance)
                    for feature, importance in zip(features, model.feature_importances_)
                },
            }

        elif model_type == "svm_classification":
            model = SVC(kernel='rbf', C=1.0, gamma='scale', random_state=42)
            model.fit(X_train_scaled, y_train)
            y_pred = model.predict(X_test_scaled)

            metrics = {
                "accuracy": float(accuracy_score(y_test, y_pred)),
                "precision": float(precision_score(y_test, y_pred)),
                "recall": float(recall_score(y_test, y_pred)),
                "f1_score": float(f1_score(y_test, y_pred)),
                "classification_report": classification_report(
                    y_test, y_pred, output_dict=True, zero_division=0
                ),
                "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
            }

        elif model_type == "knn_classification":
            model = KNeighborsClassifier(n_neighbors=5, weights='distance', n_jobs=-1)
            model.fit(X_train_scaled, y_train)
            y_pred = model.predict(X_test_scaled)

            metrics = {
                "accuracy": float(accuracy_score(y_test, y_pred)),
                "precision": float(precision_score(y_test, y_pred)),
                "recall": float(recall_score(y_test, y_pred)),
                "f1_score": float(f1_score(y_test, y_pred)),
                "classification_report": classification_report(
                    y_test, y_pred, output_dict=True, zero_division=0
                ),
                "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
            }

        elif model_type == "naive_bayes":
            model = GaussianNB()
            model.fit(X_train_scaled, y_train)
            y_pred = model.predict(X_test_scaled)

            metrics = {
                "accuracy": float(accuracy_score(y_test, y_pred)),
                "precision": float(precision_score(y_test, y_pred)),
                "recall": float(recall_score(y_test, y_pred)),
                "f1_score": float(f1_score(y_test, y_pred)),
                "classification_report": classification_report(
                    y_test, y_pred, output_dict=True, zero_division=0
                ),
                "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
            }

        elif model_type == "decision_tree_classification":
            model = DecisionTreeClassifier(
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42
            )
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)

            metrics = {
                "accuracy": float(accuracy_score(y_test, y_pred)),
                "precision": float(precision_score(y_test, y_pred)),
                "recall": float(recall_score(y_test, y_pred)),
                "f1_score": float(f1_score(y_test, y_pred)),
                "classification_report": classification_report(
                    y_test, y_pred, output_dict=True, zero_division=0
                ),
                "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
                "feature_importance": {
                    feature: float(importance)
                    for feature, importance in zip(features, model.feature_importances_)
                },
            }

        # Información adicional sobre el entrenamiento
        training_info = {
            "model_type": model_type,
            "features_used": features,
            "label_column": label,
            "training_samples": len(X_train),
            "test_samples": len(X_test),
            "original_samples": len(clean_data),
            "categorical_encoders": categorical_encoders if categorical_encoders else None,
        }

        return {
            "success": True,
            "metrics": metrics,
            "training_info": training_info,
            "model": model,
            "scaler": scaler,
            "message": f"Modelo {model_type} entrenado exitosamente",
        }

    except Exception as e:
        return {"error": f"Error durante el entrenamiento: {str(e)}"}


# 8. DOWNLOAD MODEL FUNCTIONS
def model_to_bytes(model_results: dict) -> dict:
    """Convierte modelo a base64 para enviar por API"""
    try:
        if not model_results.get("success"):
            return {"error": "Modelo no entrenado exitosamente"}

        model_package = {
            "model": model_results["model"],
            "scaler": model_results["scaler"],
        }

        buffer = io.BytesIO()
        joblib.dump(model_package, buffer)
        buffer.seek(0)

        model_base64 = base64.b64encode(buffer.read()).decode('utf-8')
        size_mb = len(model_base64) / (1024 * 1024 * 1.33)

        return {
            "success": True,
            "model_data": model_base64,
            "model_size_mb": round(size_mb, 2),
            "metrics": model_results["metrics"],
            "training_info": model_results["training_info"],
            "trained_at": datetime.now().isoformat(),
        }
    except Exception as e:
        return {"error": f"Error al serializar modelo: {str(e)}"}


def create_download_response(model_results: dict, filename: str = None) -> dict:
    """Prepara modelo para descarga directa"""
    try:
        if not model_results.get("success"):
            return {"error": "Modelo no entrenado exitosamente"}

        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            model_type = model_results["training_info"]["model_type"]
            label = model_results["training_info"]["label_column"]
            filename = f"{model_type}_{label}_{timestamp}.joblib"

        if not filename.endswith('.joblib'):
            filename += '.joblib'

        model_package = {
            "model": model_results["model"],
            "scaler": model_results["scaler"],
            "metrics": model_results["metrics"],
            "training_info": model_results["training_info"],
            "saved_at": datetime.now().isoformat(),
        }

        buffer = io.BytesIO()
        joblib.dump(model_package, buffer)
        buffer.seek(0)
        file_bytes = buffer.read()

        return {
            "success": True,
            "file_bytes": file_bytes,
            "filename": filename,
            "file_size_mb": round(len(file_bytes) / (1024 * 1024), 2),
        }
    except Exception as e:
        return {"error": f"Error al preparar descarga: {str(e)}"}
