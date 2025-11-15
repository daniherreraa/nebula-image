// components/machine/views/variable-selection.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useModel } from "@/app/context";
import type { RecommendTaskResponse } from "@/lib/types";
import { OutcomeVariableSelector } from "@/components/machine/outcome-variable-selector";
import { PredictorPanel } from "@/components/machine/predictor-panel";
import { OutlierAnalysisSection } from "@/components/machine/outlier-analysis-section";
import { ModelSelection } from "@/components/machine/model-selection";
import { TrainingSection } from "@/components/machine/training-section";
import { TrainingLoadingScreen } from "@/components/machine/training-loading-screen";
import { selectFeatures, encodeCategorical, analyzeOutliers, recommendTask, prepareData, trainModel } from "@/lib/api";
import { saveModel } from "@/lib/api/models";
import { v4 as uuidv4 } from "uuid";

const VariableSelection = () => {
  const {
    dataset,
    isTraining,
    setIsTraining,
    trainingProgress,
    setTrainingProgress,
    setCurrentView,
    hasCompletedTraining,
    setHasCompletedTraining,
    trainingConfig,
    setTrainingConfig,
    setModelResults,
    isAnalyzingOutliers,
    setIsAnalyzingOutliers,
    correlationData,
    modelId,
    setModelId,
    isSavingModel,
    setIsSavingModel
  } = useModel();

  const [outcomeVariable, setOutcomeVariable] = useState<string>(trainingConfig?.outcomeVariable || "");
  const [predictors, setPredictors] = useState<string[]>(trainingConfig?.predictors || []);
  const [hasAnalyzedOutliers, setHasAnalyzedOutliers] = useState(false);
  const [cleanData, setCleanData] = useState(true);
  const [iqrK, setIqrK] = useState<number>(1.5);
  const [nNeighbors, setNNeighbors] = useState<number>(5);

  // Model selection states
  const [recommendedModels, setRecommendedModels] = useState<RecommendTaskResponse | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(trainingConfig?.selectedModel || null);

  // Training states
  const [currentMessage, setCurrentMessage] = useState("");
  const [hasTrainingError, setHasTrainingError] = useState(false);

  // Retry handlers
  const handleRetryTraining = () => {
    // Reset error state and retry training with same configuration
    setHasTrainingError(false);
    setTrainingProgress(0);
    setCurrentMessage("");
    // Start training again with same settings
    startTraining();
  };

  const handleNewModel = () => {
    // Reset everything and go back to beginning
    setHasTrainingError(false);
    setIsTraining(false);
    setTrainingProgress(0);
    setCurrentMessage("");
    setHasCompletedTraining(false);
    setSelectedModel(null);
    setHasAnalyzedOutliers(false);
    // Scroll to top (outcome selection)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Refs for smooth scrolling
  const predictorsSectionRef = useRef<HTMLDivElement>(null);
  const outliersSectionRef = useRef<HTMLDivElement>(null);
  const modelsSectionRef = useRef<HTMLDivElement>(null);
  const trainingSectionRef = useRef<HTMLDivElement>(null);

  // Reset model selection when model changes
  const handleModelSelect = (modelId: string) => {
    if (selectedModel !== modelId) {
      setHasCompletedTraining(false);
      setIsTraining(false);
      setTrainingProgress(0);
    }
    setSelectedModel(modelId);
  };

  // Analyze outliers and automatically recommend models
  const handleAnalyzeOutliers = async () => {
    setIsAnalyzingOutliers(true);

    try {
      // Step 1: Select features and label
      await selectFeatures({
        features: predictors,
        label: outcomeVariable,
      });

      // Step 2: Analyze and clean outliers FIRST (on original data)
      await analyzeOutliers({
        iqr_k: iqrK,
        clean_data: cleanData,
        n_neighbors: nNeighbors,
      });

      // Step 3: Get recommendations (after outlier analysis)
      const recommendations = await recommendTask();
      setRecommendedModels(recommendations);

      setHasAnalyzedOutliers(true);

    } catch (error: unknown) {
      console.error("Outlier analysis error:", error);
      alert(error instanceof Error ? error.message : "Error during outlier analysis");
    } finally {
      setIsAnalyzingOutliers(false);
    }
  };

  // Training process with real API calls in correct order
  const startTraining = async () => {
    if (!selectedModel) return;

    // Save training configuration to context
    setTrainingConfig({
      outcomeVariable,
      predictors,
      selectedModel,
      handleOutliers: cleanData // keeping for compatibility
    });

    setIsTraining(true);
    setTrainingProgress(0);
    setHasTrainingError(false);

    try {
      // Step 1: Encode categorical variables
      setCurrentMessage("Codificando variables categóricas...");
      setTrainingProgress(10);

      await encodeCategorical();

      setTrainingProgress(30);

      // Step 2: Prepare data (split train/test)
      setCurrentMessage("Preparando datos (train/test split)...");
      setTrainingProgress(40);

      await prepareData();

      setTrainingProgress(60);

      // Step 3: Train model
      setCurrentMessage("Entrenando modelo...");
      setTrainingProgress(70);

      const trainingResult = await trainModel({
        model_type: selectedModel,
      });

      // Log the result for debugging/graphics
      console.log("Training result:", trainingResult);

      setCurrentMessage("Procesando resultados...");
      setTrainingProgress(90);

      // Step 4: Save results from API response
      if (trainingResult.success) {
        const results = {
          metrics: trainingResult.metrics,
          predictions: trainingResult.predictions || [],
          featureImportance: trainingResult.metrics?.feature_importance
            ? Object.entries(trainingResult.metrics.feature_importance).map(([feature, importance]) => ({
                feature,
                importance: importance as number
              }))
            : [],
          timestamp: new Date().toISOString(),
          model_type: trainingResult.model_type,
          training_info: trainingResult.training_info
        };

        setModelResults(results);

        setCurrentMessage("¡Entrenamiento completado!");
        setTrainingProgress(100);

        // Navigate to results immediately BEFORE marking as completed
        // This prevents the brief flash of the selection view
        setCurrentView("results");

        // Mark as completed after navigation starts
        setHasCompletedTraining(true);

        // Step 5: Save model to database
        try {
          setIsSavingModel(true);
          setCurrentMessage("Guardando modelo en base de datos...");

          // Validate required data before saving
          if (!selectedModel) {
            console.error("❌ Cannot save model: selectedModel is null/undefined");
            throw new Error("Cannot save model: selected model is required");
          }

          console.log("✅ Validation passed - selectedModel:", selectedModel);

          const newModelId = modelId || uuidv4();

          const modelData = {
            id: newModelId,
            user_id: undefined, // TODO: Add when auth is implemented
            model_name: `Model ${new Date().toLocaleDateString()}`,
            preview: {
              filename: dataset?.filename || "unknown",
              rows: dataset?.rows || 0,
              columns: dataset?.columns || 0,
              column_names: dataset?.column_names || [],
              preview_data: dataset?.preview || [],
              data_summary: dataset?.data_summary
            },
            correlation_data: correlationData,
            variable_selection: {
              outcome_variable: outcomeVariable,
              predictor_variables: predictors
            },
            training_config: {
              selected_model: selectedModel,
              clean_data: cleanData,
              iqr_k: iqrK,
              n_neighbors: nNeighbors
            },
            results: {
              r2_score: trainingResult.metrics.r2_score,
              accuracy: trainingResult.metrics.accuracy,
              mse: trainingResult.metrics.mse,
              results_data: trainingResult
            }
          };

          console.log("🔍 Frontend - Sending model data:", {
            selectedModel,
            training_config: modelData.training_config,
            full_data: modelData
          });

          const savedModel = await saveModel(modelData);
          setModelId(savedModel.id);

          console.log("✅ Model saved to database:", savedModel.id);
        } catch (saveError) {
          console.error("❌ Error saving model to database:", saveError);
          // Don't fail the entire training process if save fails
        } finally {
          setIsSavingModel(false);
        }

        // Navigation to results already happened earlier to prevent flash
        // Reset training state after a brief delay to ensure smooth transition
        setTimeout(() => {
          setIsTraining(false);
        }, 500);
      }

    } catch (error: unknown) {
      console.error("Training error:", error);

      // Parse error message - Convert to friendly English
      let errorMessage = "Training failed. Please try again or select a different model.";
      if (error instanceof Error) {
        if (error.message.includes("timeout") || error.message.includes("504")) {
          errorMessage = "Training took too long and timed out. This can happen with very large datasets. Please try again.";
        } else if (error.message.includes("valores nulos") || error.message.includes("null")) {
          errorMessage = "Your data contains missing values. Please enable 'Clean Data' in the Outlier Analysis section.";
        } else if (error.message.includes("categóricas") || error.message.includes("categorical")) {
          errorMessage = "Error processing categorical variables. Please check your data and try again.";
        } else if (error.message.includes("empty") || error.message.includes("insufficient")) {
          errorMessage = "Not enough data remaining after cleaning. Try adjusting outlier settings or using a different dataset.";
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
          errorMessage = "Network error. Please check your connection and try again.";
        }
      }

      setCurrentMessage(errorMessage);
      setHasTrainingError(true);
      // Keep training state active but in error mode - do NOT auto-reset
      // User must manually retry or start a new model
    }
  };

  const availableColumns = dataset?.column_names || [];
  const availablePredictors = availableColumns.filter(
    (col) => col !== outcomeVariable && !predictors.includes(col)
  );

  const handleOutcomeSelect = (value: string) => {
    setOutcomeVariable(value);
    // Auto-populate all other columns as predictors
    const otherColumns = availableColumns.filter((col) => col !== value);
    setPredictors(otherColumns);
  };

  const handleAddPredictor = (value: string) => {
    if (!predictors.includes(value)) {
      setPredictors([...predictors, value]);
    }
  };

  const handleRemovePredictor = (value: string) => {
    setPredictors(predictors.filter((p) => p !== value));
  };

  // Smooth scroll when outcome variable is selected (predictors panel appears)
  useEffect(() => {
    if (outcomeVariable && predictorsSectionRef.current) {
      setTimeout(() => {
        predictorsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [outcomeVariable]);

  // Smooth scroll when outliers section appears
  useEffect(() => {
    if (predictors.length > 0 && outliersSectionRef.current) {
      setTimeout(() => {
        outliersSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [predictors.length]);

  // Smooth scroll when models section appears
  useEffect(() => {
    if (hasAnalyzedOutliers && recommendedModels && modelsSectionRef.current) {
      setTimeout(() => {
        modelsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [hasAnalyzedOutliers, recommendedModels]);

  // Smooth scroll when training section appears
  useEffect(() => {
    if (selectedModel && trainingSectionRef.current) {
      setTimeout(() => {
        trainingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [selectedModel]);

  if (!dataset) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-woodsmoke-400">No dataset available</p>
      </div>
    );
  }

  // If training, show loading screen
  if (isTraining) {
    return (
      <TrainingLoadingScreen
        trainingProgress={trainingProgress}
        currentMessage={currentMessage}
        onViewResults={() => setCurrentView("results")}
        hasError={hasTrainingError}
        onRetryTraining={handleRetryTraining}
        onNewModel={handleNewModel}
      />
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 py-6">
      {/* Outcome Variable Selector */}
      <OutcomeVariableSelector
        outcomeVariable={outcomeVariable}
        availableColumns={availableColumns}
        onSelect={handleOutcomeSelect}
      />

      {/* Predictors Panel - Only show if outcome variable is selected */}
      {outcomeVariable && (
        <div ref={predictorsSectionRef}>
          <PredictorPanel
            predictors={predictors}
            availablePredictors={availablePredictors}
            onAddPredictor={handleAddPredictor}
            onRemovePredictor={handleRemovePredictor}
          />
        </div>
      )}

      {/* Outlier Analysis Section - Only show if outcome and predictors are set */}
      {outcomeVariable && predictors.length > 0 && (
        <div ref={outliersSectionRef}>
          <OutlierAnalysisSection
            cleanData={cleanData}
            iqrK={iqrK}
            nNeighbors={nNeighbors}
            isAnalyzing={isAnalyzingOutliers}
            onCleanDataChange={setCleanData}
            onIqrKChange={setIqrK}
            onNNeighborsChange={setNNeighbors}
            onAnalyze={handleAnalyzeOutliers}
          />
        </div>
      )}

      {/* Model Selection Section - Only show after outlier analysis is complete */}
      {hasAnalyzedOutliers && recommendedModels && (
        <div ref={modelsSectionRef}>
          <ModelSelection
            outcomeVariable={outcomeVariable}
            predictors={predictors}
            selectedModel={selectedModel}
            onModelSelect={handleModelSelect}
          />
        </div>
      )}

      {/* Training Section - Only show if model is selected */}
      {selectedModel && hasAnalyzedOutliers && (
        <div ref={trainingSectionRef}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <h3 className="text-portage-300 font-space-grotesk text-xs sm:text-sm uppercase tracking-[0.2em]">
                Start Training
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-portage-500/50 via-portage-400/30 to-transparent" />
            </div>

            {/* Start Training Button */}
            <div className="relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/20 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-portage-500/5 via-portage-400/10 to-portage-500/5" />

              <div className="relative px-4 sm:px-5 py-4 flex justify-end">
                <button
                  onClick={startTraining}
                  className="relative group overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/20 backdrop-blur-sm transition-all duration-300 hover:border-portage-400/40"
                >
                  {/* Hextech corners */}
                  <div className="absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2 border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 border-r-2 border-t-2 border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 border-l-2 border-b-2 border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />

                  {/* Background glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-portage-500/0 via-portage-400/10 to-portage-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Button content */}
                  <div className="relative px-8 py-4 flex items-center gap-3">
                    <svg className="w-6 h-6 text-portage-400 group-hover:text-portage-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-portage-300 font-space-grotesk text-sm sm:text-base uppercase tracking-[0.15em] group-hover:text-portage-200 transition-colors">
                      Start Training
                    </span>
                  </div>
                </button>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-portage-500/40 to-transparent" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VariableSelection;
