"""
Endpoints de FastAPI para Nebula
"""
from fastapi import APIRouter, File, UploadFile, HTTPException, status
from fastapi.responses import StreamingResponse, JSONResponse
from typing import List, Optional
import io   
import logging

from core.ml_functions import (
    load_csv,
    get_data_summary,
    analyze_correlations,
    detect_iqr_bounds,
    clean_and_impute,
    handle_categorical_features,
    check_classification_or_regression,
    prepare_data_for_ml,
    train_model,
    create_download_response
)
from services.state_manager import state_manager
from models.schemas import (
    UploadResponse,
    SummaryResponse,
    OutliersRequest,
    OutliersResponse,
    CleanDataRequest,
    CleanDataResponse,
    SelectFeaturesRequest,
    SelectFeaturesResponse,
    EncodeCategoricalResponse,
    RecommendationResponse,
    PrepareDataResponse,
    TrainModelRequest,
    TrainModelResponse,
    DownloadModelResponse,
    ErrorResponse
)

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/upload")
async def loading_csv(file: UploadFile = File(...)):
    """
    Endpoint para cargar un archivo CSV y generar su resumen estadístico.
    Detecta automáticamente encoding y separador, carga los datos y retorna
    un análisis completo con estadísticas descriptivas, detección de outliers,
    tests de normalidad y análisis de variables categóricas.
    """
    try:
        logger.info(f"Recibiendo archivo: {file.filename}")

        # Validar tipo de archivo
        if not file.filename.endswith('.csv'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El archivo debe ser un CSV"
            )

        # Leer contenido del archivo
        contents = await file.read()
        file_obj = io.BytesIO(contents)

        # Cargar CSV usando la función del core
        df = load_csv(file_obj)

        # Guardar en el state manager
        state_manager.set_dataframe(
            df=df,
            filename=file.filename,
            encoding="utf-8",  # load_csv maneja esto internamente
            separator=","  # load_csv maneja esto internamente
        )

        logger.info(f"Archivo cargado exitosamente: {df.shape[0]} filas x {df.shape[1]} columnas")

        # Generar resumen estadístico completo
        summary = get_data_summary(df, preview_rows=10, top_n_categorical=10)

        if "error" in summary:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=summary["error"]
            )

        state_manager.set_summary(summary)
        logger.info("Resumen estadístico generado exitosamente")

        # Construir respuesta unificada
        response = {
            "success": True,
            "message": "Archivo cargado y analizado exitosamente",
            "file_info": {
                "filename": file.filename,
                "encoding": "utf-8",
                "separator": ",",
                "uploaded_at": state_manager.created_at.isoformat() if state_manager.created_at else None
            },
            "data_summary": summary
        }

        return JSONResponse(content=response)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al cargar archivo: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar el archivo: {str(e)}"
        )


@router.get("/correlations")
async def get_correlations(top_n: int = 5):
    """
    Endpoint para obtener análisis de correlaciones entre variables numéricas.
    Calcula correlaciones Pearson, Spearman y Kendall con sus p-valores.
    Retorna el top N de correlaciones más fuertes por defecto.

    Args:
        top_n: Número de correlaciones top a retornar (por defecto 5)
    """
    try:
        if not state_manager.has_dataframe():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No hay ningún archivo cargado. Por favor, carga un archivo CSV primero."
            )

        df = state_manager.get_dataframe()

        # Analizar correlaciones
        correlation_results = analyze_correlations(df)

        if "error" in correlation_results:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=correlation_results["error"]
            )

        logger.info(f"Análisis de correlaciones completado: {correlation_results['total_correlations']} correlaciones encontradas")

        # Construir respuesta con top N correlaciones
        response = {
            "success": True,
            "message": f"Análisis de correlaciones completado exitosamente",
            "methods": correlation_results["methods"],
            "n_variables": correlation_results["n_variables"],
            "variables": correlation_results["variables"],
            "total_correlations": correlation_results["total_correlations"],
            "samples_used": correlation_results["samples_used"],
            "top_correlations": correlation_results["correlations_list"][:top_n],
            "all_correlations": correlation_results["correlations_list"],
            "correlation_matrices": correlation_results["correlation_matrices"]
        }

        return JSONResponse(content=response)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al analizar correlaciones: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al analizar correlaciones: {str(e)}"
        )


@router.post("/outliers-analysis")
async def outliers_analysis(
    iqr_k: float = 1.5,
    clean_data: bool = False,
    n_neighbors: int = 5
):
    """
    Endpoint unificado para análisis y limpieza de outliers.

    Este endpoint detecta outliers usando el método IQR y opcionalmente
    limpia los datos reemplazándolos mediante KNN imputation.

    Args:
        iqr_k: Factor K para método IQR (por defecto 1.5)
        clean_data: Si es True, limpia los outliers detectados (por defecto False)
        n_neighbors: Número de vecinos para KNN imputation si clean_data=True (por defecto 5)

    Returns:
        Análisis de outliers y resultados de limpieza si se solicitó
    """
    try:
        if not state_manager.has_dataframe():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No hay ningún archivo cargado"
            )

        # Verificar que se hayan seleccionado features y label
        if not state_manager.has_features_and_label():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Debe seleccionar features y label primero usando el endpoint /select-features"
            )

        df = state_manager.get_dataframe()
        features, label = state_manager.get_features_and_label()
        rows_initial = df.shape[0]

        # Usar las columnas seleccionadas (features + label)
        all_selected_columns = features + [label]

        # Filtrar solo las columnas numéricas de las seleccionadas
        columns = []
        for col in all_selected_columns:
            # Filtrar columnas con nombres vacíos o solo espacios
            if not col or col.strip() == "":
                continue
            dtype = str(df[col].dtype)
            if dtype.startswith(("Int", "UInt", "Float")):
                columns.append(col)

        if len(columns) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No hay columnas numéricas para analizar"
            )

        # Detectar outliers por columna
        outliers_by_column = {}
        total_outliers_before = 0

        for col in columns:
            lower, upper = detect_iqr_bounds(df, col, k=iqr_k)
            outliers_mask = (df[col] < lower) | (df[col] > upper)
            outliers_count = outliers_mask.sum()
            total_outliers_before += outliers_count

            outliers_by_column[col] = {
                "lower_bound": float(lower),
                "upper_bound": float(upper),
                "outliers_count": int(outliers_count),
                "outliers_percentage": round((outliers_count / df.shape[0]) * 100, 2)
            }

        logger.info(f"Outliers detectados: {total_outliers_before} en total")

        # Construir respuesta base
        response = {
            "success": True,
            "features_and_label_used": {
                "features": features,
                "label": label,
                "total_selected": len(all_selected_columns),
                "numeric_analyzed": len(columns)
            },
            "outliers_detection": {
                "method": "IQR",
                "iqr_k": iqr_k,
                "columns_analyzed": columns,
                "total_columns": len(columns),
                "outliers_by_column": outliers_by_column,
                "total_outliers_before": int(total_outliers_before),
                "rows_analyzed": rows_initial
            }
        }

        # Si se solicita limpieza, limpiar datos
        if clean_data:
            logger.info(f"Limpiando datos con KNN imputation (k={n_neighbors})...")

            # Limpiar e imputar (reemplaza outliers con None y luego imputa con KNN)
            df_cleaned = clean_and_impute(
                df=df,
                cols=columns,
                iqr_k=iqr_k,
                n_neighbors=n_neighbors
            )

            # Detectar outliers después de limpiar
            total_outliers_after = 0
            for col in columns:
                lower, upper = detect_iqr_bounds(df_cleaned, col, k=iqr_k)
                outliers_mask = (df_cleaned[col] < lower) | (df_cleaned[col] > upper)
                total_outliers_after += outliers_mask.sum()

            rows_final = df_cleaned.shape[0]

            state_manager.set_cleaned_dataframe(df_cleaned)
            logger.info(f"Datos limpiados: {total_outliers_before} outliers iniciales → {total_outliers_after} outliers finales")

            response["cleaning_applied"] = True
            response["cleaning_results"] = {
                "method": "KNN Imputation",
                "n_neighbors": n_neighbors,
                "columns_cleaned": columns,
                "total_outliers_before": int(total_outliers_before),
                "total_outliers_after": int(total_outliers_after),
                "outliers_cleaned": int(total_outliers_before - total_outliers_after),
                "rows_before": rows_initial,
                "rows_after": rows_final,
                "rows_removed": rows_initial - rows_final
            }
            response["message"] = f"Outliers detectados y limpiados exitosamente. {total_outliers_before} outliers iniciales → {total_outliers_after} outliers finales mediante KNN imputation."
        else:
            response["cleaning_applied"] = False
            response["cleaning_results"] = None
            response["message"] = f"Se detectaron {total_outliers_before} outliers en total. Use clean_data=true para limpiarlos."

        return JSONResponse(content=response)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en análisis de outliers: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en análisis de outliers: {str(e)}"
        )


@router.post("/select-features")
async def select_features(request: SelectFeaturesRequest):
    """
    Endpoint para seleccionar features y label para el entrenamiento.
    """
    try:
        if not state_manager.has_dataframe():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No hay ningún archivo cargado"
            )

        df = state_manager.get_dataframe()
        available_columns = df.columns

        # Validar que todas las columnas existen
        all_columns = request.features + [request.label]
        missing_columns = [col for col in all_columns if col not in available_columns]

        if missing_columns:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Columnas no encontradas: {missing_columns}"
            )

        # Validar que label no esté en features
        if request.label in request.features:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La columna label no puede estar en la lista de features"
            )

        # Guardar selección
        state_manager.set_features_and_label(request.features, request.label)
        logger.info(f"Features seleccionadas: {len(request.features)}, Label: {request.label}")

        return SelectFeaturesResponse(
            success=True,
            message="Features y label seleccionados exitosamente",
            features=request.features,
            label=request.label,
            features_count=len(request.features),
            all_columns_exist=True
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al seleccionar features: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al seleccionar features: {str(e)}"
        )


@router.post("/encode-categorical")
async def encode_categorical():
    """
    Endpoint para codificar variables categóricas automáticamente.
    """
    try:
        if not state_manager.has_dataframe():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No hay ningún archivo cargado"
            )

        if not state_manager.has_features_and_label():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Debe seleccionar features y label primero"
            )

        df = state_manager.get_dataframe()
        features, label = state_manager.get_features_and_label()
        all_columns = features + [label]

        # Codificar variables categóricas
        df_encoded, encoders = handle_categorical_features(df, all_columns)

        state_manager.update_dataframe(df_encoded)
        state_manager.set_categorical_encoders(encoders)

        logger.info(f"Variables categóricas codificadas: {len(encoders)} columnas")

        return EncodeCategoricalResponse(
            success=True,
            message=f"Se codificaron {len(encoders)} variables categóricas",
            columns_encoded=list(encoders.keys()),
            encoders=encoders
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al codificar variables categóricas: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al codificar variables categóricas: {str(e)}"
        )


@router.get("/recommend-task")
async def recommend_task():
    """
    Endpoint para obtener recomendación de tarea ML (clasificación vs regresión).
    """
    try:
        if not state_manager.has_dataframe():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No hay ningún archivo cargado"
            )

        if not state_manager.has_features_and_label():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Debe seleccionar features y label primero"
            )

        df = state_manager.get_dataframe()
        _, label = state_manager.get_features_and_label()

        # Obtener recomendación
        recommendation = check_classification_or_regression(df, label)

        if "error" in recommendation:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=recommendation["error"]
            )

        state_manager.set_task_recommendation(recommendation)
        logger.info(f"Recomendación: {recommendation['problem_type']}")

        return JSONResponse(content=recommendation)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al generar recomendación: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al generar recomendación: {str(e)}"
        )


@router.post("/prepare-data")
async def prepare_data():
    """
    Endpoint para preparar los datos para machine learning (split y scaling).
    """
    try:
        if not state_manager.has_dataframe():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No hay ningún archivo cargado"
            )

        if not state_manager.has_features_and_label():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Debe seleccionar features y label primero"
            )

        df = state_manager.get_dataframe()
        features, label = state_manager.get_features_and_label()

        # Preparar datos
        X, y, clean_data = prepare_data_for_ml(df, features, label)

        from sklearn.model_selection import train_test_split
        from sklearn.preprocessing import StandardScaler

        # Split train/test
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        # Scaling
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)

        # Guardar en state manager
        state_manager.set_training_data(X_train_scaled, X_test_scaled, y_train, y_test, scaler)

        logger.info(f"Datos preparados: {len(X_train)} train, {len(X_test)} test")

        return PrepareDataResponse(
            success=True,
            message="Datos preparados exitosamente",
            training_samples=len(X_train),
            test_samples=len(X_test),
            features_shape=list(X_train.shape),
            label_shape=list(y_train.shape)
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al preparar datos: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al preparar datos: {str(e)}"
        )


@router.post("/train")
async def train_ml_model(request: TrainModelRequest):
    """
    Endpoint para entrenar un modelo de machine learning.
    """
    try:
        if not state_manager.has_dataframe():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No hay ningún archivo cargado"
            )

        if not state_manager.has_features_and_label():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Debe seleccionar features y label primero"
            )

        df = state_manager.get_dataframe()
        features, label = state_manager.get_features_and_label()

        # Entrenar modelo usando la función del core
        logger.info(f"Entrenando modelo: {request.model_type}")
        results = train_model(df, features, label, request.model_type)

        if "error" in results:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=results["error"]
            )

        # Guardar resultados
        state_manager.set_model_results(results)

        logger.info(f"Modelo entrenado exitosamente: {request.model_type}")

        return TrainModelResponse(
            success=results.get("success", True),
            message=results.get("message", "Modelo entrenado exitosamente"),
            model_type=results["training_info"]["model_type"],
            metrics=results["metrics"],
            training_info=results["training_info"],
            feature_importance=results.get("metrics", {}).get("feature_importance")
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al entrenar modelo: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al entrenar modelo: {str(e)}"
        )


@router.get("/download-model")
async def download_model():
    """
    Endpoint para descargar el modelo entrenado como archivo .joblib.
    """
    try:
        if not state_manager.has_trained_model():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No hay ningún modelo entrenado para descargar"
            )

        model_results = state_manager.get_model_results()

        # Crear archivo de descarga
        download_data = create_download_response(model_results)

        if "error" in download_data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=download_data["error"]
            )

        logger.info(f"Descargando modelo: {download_data['filename']}")

        # Crear respuesta de streaming
        return StreamingResponse(
            io.BytesIO(download_data["file_bytes"]),
            media_type="application/octet-stream",
            headers={
                "Content-Disposition": f"attachment; filename={download_data['filename']}"
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al descargar modelo: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al descargar modelo: {str(e)}"
        )


@router.get("/state")
async def get_state():
    """
    Endpoint para obtener información del estado actual del sistema.
    """
    try:
        state_info = state_manager.get_state_info()
        return JSONResponse(content=state_info)
    except Exception as e:
        logger.error(f"Error al obtener estado: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener estado: {str(e)}"
        )


@router.post("/reset")
async def reset_state():
    """
    Endpoint para reiniciar todo el estado del sistema.
    """
    try:
        state_manager.reset()
        logger.info("Estado del sistema reiniciado")
        return JSONResponse(content={
            "success": True,
            "message": "Estado del sistema reiniciado exitosamente"
        })
    except Exception as e:
        logger.error(f"Error al reiniciar estado: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al reiniciar estado: {str(e)}"
        )
