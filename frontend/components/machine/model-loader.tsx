// components/machine/model-loader.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useModel } from "@/app/context/ModelContext";
import { getModel, MLModelResponse } from "@/lib/api/models";
import FileUploader from "@/components/machine/file-uploader";
import ModelReport from "@/components/machine/model-report";

const ModelLoader = () => {
  const searchParams = useSearchParams();
  const modelIdFromUrl = searchParams.get("modelId");

  const {
    setDataset,
    setCorrelationData,
    setTrainingConfig,
    setModelResults,
    setModelId,
    setIsLoadedModel,
    isLoadedModel,
    modelId
  } = useModel();

  const [loadedModelData, setLoadedModelData] = useState<MLModelResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModelFromUrl = async () => {
      if (!modelIdFromUrl) {
        // No model ID in URL, show regular FileUploader
        setIsLoadedModel(false);
        setLoadedModelData(null);
        return;
      }

      // Check if we already loaded this model
      if (isLoadedModel && modelId === modelIdFromUrl && loadedModelData) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const model = await getModel(modelIdFromUrl);

        // Populate context with loaded model data
        setModelId(model.id);
        setIsLoadedModel(true);

        // Set dataset from preview
        setDataset({
          success: true,
          message: "Model loaded from database",
          filename: model.preview.filename,
          rows: model.preview.rows,
          columns: model.preview.columns,
          column_names: model.preview.column_names,
          preview: model.preview.preview_data,
          data_summary: model.preview.data_summary,
          encoding: "utf-8",
          separator: ","
        });

        // Set correlations if available
        if (model.correlation_data) {
          setCorrelationData(model.correlation_data);
        }

        // Set training config
        setTrainingConfig({
          outcomeVariable: model.variable_selection.outcome_variable,
          predictors: model.variable_selection.predictor_variables,
          selectedModel: model.training_config.selected_model,
          handleOutliers: model.training_config.clean_data
        });

        // Set results if available
        if (model.results) {
          setModelResults({
            metrics: {
              r2_score: model.results.r2_score,
              accuracy: model.results.accuracy,
              mse: model.results.mse
            },
            predictions: model.results.results_data?.predictions || [],
            featureImportance: model.results.results_data?.feature_importance?.map((item, index) => ({
              index,
              importance: item.importance,
              name: item.feature
            })) || [],
            timestamp: model.created_at
          });
        }

        // Store complete model data for report view
        setLoadedModelData(model);

      } catch (err: unknown) {
        console.error("Error loading model:", err);
        setError(err instanceof Error ? err.message : "Failed to load model");
        setIsLoadedModel(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadModelFromUrl();
  }, [modelIdFromUrl]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-center space-y-4">
          <div className="inline-block w-12 h-12 border-4 border-portage-400/20 border-t-portage-400 rounded-full animate-spin" />
          <p className="text-portage-400 font-space-grotesk text-sm">
            Loading model...
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-center space-y-4 max-w-md">
          <div className="p-6 bg-woodsmoke-950/60 border border-red-500/20 backdrop-blur-sm rounded-sm">
            <p className="text-red-400 font-space-grotesk text-sm mb-2">
              Error loading model
            </p>
            <p className="text-portage-400/70 font-space-grotesk text-xs">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show ModelReport if a model is loaded
  if (isLoadedModel && loadedModelData) {
    return <ModelReport modelData={loadedModelData} />;
  }

  // Default: show FileUploader for new models
  return <FileUploader />;
};

export default ModelLoader;
