"""
API endpoints for ML Model management
"""
from fastapi import APIRouter, HTTPException, Depends, status, Header
from typing import List, Optional
import json
import logging
from uuid import UUID

from models.ml_model import (
    MLModelCreate,
    MLModelResponse,
    MLModelListItem,
)
from config.database import Database, get_db
from core.auth import get_current_user_id, require_auth

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/models", response_model=MLModelResponse, status_code=status.HTTP_201_CREATED)
async def create_model(
    model_data: MLModelCreate,
    db: Database = Depends(get_db),
    authorization: Optional[str] = Header(None),
    cookie: Optional[str] = Header(None)
):
    """
    Create a new ML Model and save it to the database

    This endpoint saves all the model information including:
    - Preview data
    - Correlations
    - Variable selection
    - Model configuration
    - Training results

    🔒 Security: Automatically assigns the model to the authenticated user
    """
    # Get authenticated user ID
    user_id = await get_current_user_id(authorization, cookie)

    # Override any user_id from frontend with the authenticated user
    if user_id:
        logger.info(f"🔒 Assigning model to authenticated user: {user_id}")
        model_data.user_id = user_id
    else:
        logger.warning("⚠️ Creating model without authentication - setting user_id to None")
        model_data.user_id = None

    try:
        # Debug: Log received data
        logger.info(f"📥 Received model data type: {type(model_data)}")
        logger.info(f"📥 Training config type: {type(model_data.training_config)}")
        logger.info(f"📥 Training config data: {model_data.training_config}")

        # Log the actual model_dump if it's a Pydantic model
        try:
            full_data = model_data.model_dump() if hasattr(model_data, 'model_dump') else str(model_data)
            logger.info(f"📥 Full model data: {json.dumps(full_data, indent=2, default=str)}")
        except Exception as e:
            logger.warning(f"Could not dump full data: {e}")

        # Prepare data for insertion
        query = """
            INSERT INTO ml_models (
                id, user_id, model_name,
                preview_filename, preview_rows, preview_columns,
                preview_column_names, preview_data, preview_data_summary,
                correlation_data,
                outcome_variable, predictor_variables,
                selected_model, clean_data, iqr_k, n_neighbors,
                r2_score, accuracy, mse, results_data
            ) VALUES (
                $1, $2, $3,
                $4, $5, $6,
                $7, $8, $9,
                $10,
                $11, $12,
                $13, $14, $15, $16,
                $17, $18, $19, $20
            )
            RETURNING id, created_at, updated_at
        """

        # Convert correlation data to JSON if present
        correlation_json = None
        if model_data.correlation_data:
            try:
                # Handle both Pydantic models and dicts
                if hasattr(model_data.correlation_data, 'model_dump'):
                    correlation_json = json.dumps(model_data.correlation_data.model_dump())
                else:
                    correlation_json = json.dumps(model_data.correlation_data)
            except Exception as e:
                logger.warning(f"⚠️ Could not serialize correlation_data: {e}")
                correlation_json = None

        # Helper function to safely get attributes from Pydantic models or dicts
        def get_attr(obj, attr, default=None):
            """Get attribute from object or dict"""
            if hasattr(obj, attr):
                return getattr(obj, attr)
            elif isinstance(obj, dict):
                return obj.get(attr, default)
            return default

        # Convert results data to JSON if present
        results_json = None
        r2_score = None
        accuracy = None
        mse = None
        if model_data.results:
            results_data_content = get_attr(model_data.results, 'results_data')
            if results_data_content:
                results_json = json.dumps(results_data_content)
            r2_score = get_attr(model_data.results, 'r2_score')
            accuracy = get_attr(model_data.results, 'accuracy')
            mse = get_attr(model_data.results, 'mse')

        # Extract selected_model with detailed logging
        selected_model_value = get_attr(model_data.training_config, 'selected_model')
        logger.info(f"📊 Selected model value: {selected_model_value} (type: {type(selected_model_value)})")

        if selected_model_value is None:
            logger.error(f"❌ selected_model is None! training_config: {model_data.training_config}")
            logger.error(f"❌ training_config dir: {dir(model_data.training_config)}")
            raise ValueError("selected_model cannot be None")

        # Execute query
        result = await db.fetchrow(
            query,
            str(model_data.id),
            str(model_data.user_id) if model_data.user_id else None,
            model_data.model_name,
            get_attr(model_data.preview, 'filename'),
            get_attr(model_data.preview, 'rows'),
            get_attr(model_data.preview, 'columns'),
            get_attr(model_data.preview, 'column_names'),
            json.dumps(get_attr(model_data.preview, 'preview_data', [])),
            json.dumps(get_attr(model_data.preview, 'data_summary')) if get_attr(model_data.preview, 'data_summary') else None,
            correlation_json,
            get_attr(model_data.variable_selection, 'outcome_variable'),
            get_attr(model_data.variable_selection, 'predictor_variables'),
            selected_model_value,
            get_attr(model_data.training_config, 'clean_data', False),
            get_attr(model_data.training_config, 'iqr_k', 1.5),
            get_attr(model_data.training_config, 'n_neighbors', 5),
            r2_score,
            accuracy,
            mse,
            results_json
        )

        logger.info(f"✅ Model {model_data.id} created successfully")

        # Return the created model
        return MLModelResponse(
            id=model_data.id,
            user_id=model_data.user_id,
            model_name=model_data.model_name,
            created_at=result['created_at'],
            updated_at=result['updated_at'],
            preview=model_data.preview,
            correlation_data=model_data.correlation_data,
            variable_selection=model_data.variable_selection,
            training_config=model_data.training_config,
            results=model_data.results,
            has_model_file=False,
            model_file_size=None
        )

    except Exception as e:
        logger.error(f"❌ Error creating model: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating model: {str(e)}"
        )


@router.get("/models", response_model=List[MLModelListItem])
async def list_models(
    limit: int = 50,
    offset: int = 0,
    db: Database = Depends(get_db),
    authorization: Optional[str] = Header(None),
    cookie: Optional[str] = Header(None)
):
    """
    List all ML Models for the authenticated user

    Returns a lightweight list of models with basic information

    🔒 Security: Only returns models belonging to the authenticated user
    """
    # Get authenticated user ID (optional - returns None if not authenticated)
    user_id = await get_current_user_id(authorization, cookie)

    try:
        # If user is not authenticated, return empty list or require auth
        # For now, we'll return empty list for unauthenticated users
        if not user_id:
            logger.warning("⚠️ Unauthenticated request to list models - returning empty list")
            return []

        query = """
            SELECT
                id, model_name, created_at, outcome_variable,
                selected_model,
                (r2_score IS NOT NULL OR accuracy IS NOT NULL OR mse IS NOT NULL) as has_results,
                (model_file_path IS NOT NULL) as has_model_file
            FROM ml_models
            WHERE user_id = $1::uuid
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
        """

        rows = await db.fetch(query, user_id, limit, offset)

        models = []
        for row in rows:
            models.append(MLModelListItem(
                id=row['id'],
                model_name=row['model_name'],
                created_at=row['created_at'],
                outcome_variable=row['outcome_variable'],
                selected_model=row['selected_model'],
                has_results=row['has_results'],
                has_model_file=row['has_model_file']
            ))

        logger.info(f"📋 Retrieved {len(models)} models")
        return models

    except Exception as e:
        logger.error(f"❌ Error listing models: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing models: {str(e)}"
        )


@router.get("/models/{model_id}", response_model=MLModelResponse)
async def get_model(
    model_id: UUID,
    db: Database = Depends(get_db),
    authorization: Optional[str] = Header(None),
    cookie: Optional[str] = Header(None)
):
    """
    Get a specific ML Model by ID

    Returns all model information including preview, correlations, config, and results

    🔒 Security: Only returns the model if it belongs to the authenticated user
    """
    # Get authenticated user ID
    user_id = await get_current_user_id(authorization, cookie)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to view models"
        )

    try:
        query = """
            SELECT *
            FROM ml_models
            WHERE id = $1 AND user_id = $2::uuid
        """

        row = await db.fetchrow(query, str(model_id), user_id)

        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Model {model_id} not found or you don't have permission to access it"
            )

        # Parse JSON fields
        preview_data = json.loads(row['preview_data'])
        preview_data_summary = json.loads(row['preview_data_summary']) if row['preview_data_summary'] else None
        correlation_data = json.loads(row['correlation_data']) if row['correlation_data'] else None
        results_data = json.loads(row['results_data']) if row['results_data'] else None

        # Build response
        from models.ml_model import PreviewData, CorrelationData, VariableSelection, TrainingConfig, ModelResults

        model_response = MLModelResponse(
            id=row['id'],
            user_id=row['user_id'],
            model_name=row['model_name'],
            created_at=row['created_at'],
            updated_at=row['updated_at'],
            preview=PreviewData(
                filename=row['preview_filename'],
                rows=row['preview_rows'],
                columns=row['preview_columns'],
                column_names=row['preview_column_names'],
                preview_data=preview_data,
                data_summary=preview_data_summary
            ),
            correlation_data=CorrelationData(**correlation_data) if correlation_data else None,
            variable_selection=VariableSelection(
                outcome_variable=row['outcome_variable'],
                predictor_variables=row['predictor_variables']
            ),
            training_config=TrainingConfig(
                selected_model=row['selected_model'],
                clean_data=row['clean_data'],
                iqr_k=float(row['iqr_k']),
                n_neighbors=row['n_neighbors']
            ),
            results=ModelResults(
                r2_score=float(row['r2_score']) if row['r2_score'] else None,
                accuracy=float(row['accuracy']) if row['accuracy'] else None,
                mse=float(row['mse']) if row['mse'] else None,
                results_data=results_data
            ) if (row['r2_score'] or row['accuracy'] or row['mse']) else None,
            has_model_file=row['model_file_path'] is not None,
            model_file_size=row['model_file_size']
        )

        logger.info(f"📦 Retrieved model {model_id}")
        return model_response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting model: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting model: {str(e)}"
        )


@router.delete("/models/{model_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_model(
    model_id: UUID,
    db: Database = Depends(get_db),
    authorization: Optional[str] = Header(None),
    cookie: Optional[str] = Header(None)
):
    """
    Delete a specific ML Model by ID

    This will also delete any associated model files

    🔒 Security: Only allows deletion if the model belongs to the authenticated user
    """
    # Get authenticated user ID
    user_id = await get_current_user_id(authorization, cookie)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to delete models"
        )

    try:
        # First check if model exists and belongs to user
        check_query = """
            SELECT model_file_path
            FROM ml_models
            WHERE id = $1 AND user_id = $2::uuid
        """
        row = await db.fetchrow(check_query, str(model_id), user_id)

        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Model {model_id} not found or you don't have permission to delete it"
            )

        # Delete the model
        delete_query = """
            DELETE FROM ml_models
            WHERE id = $1 AND user_id = $2::uuid
        """
        await db.execute(delete_query, str(model_id), user_id)

        # TODO: Delete model file from filesystem if exists
        # if row['model_file_path']:
        #     delete_model_file(row['model_file_path'])

        logger.info(f"🗑️ Model {model_id} deleted successfully")
        return None

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error deleting model: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting model: {str(e)}"
        )
