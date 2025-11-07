// components/machine/model-selection.tsx
"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { selectFeatures, recommendTask } from "@/lib/api";
import type { ModelInfo } from "@/lib/types";

interface ModelSelectionProps {
  outcomeVariable: string;
  predictors: string[];
  selectedModel: string | null;
  onModelSelect: (modelId: string) => void;
}

export const ModelSelection = ({
  outcomeVariable,
  predictors,
  selectedModel,
  onModelSelect,
}: ModelSelectionProps) => {
  const [showModels, setShowModels] = useState(false);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleViewRecommendedModels = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First, send the selected features and label
      await selectFeatures({
        features: predictors,
        label: outcomeVariable,
      });

      // Then, get the recommended models
      const recommendedData = await recommendTask();

      setModels(recommendedData.available_models);
      setShowModels(true);
    } catch (err) {
      console.error("Error fetching recommended models:", err);
      setError(err instanceof Error ? err.message : "Failed to load models");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h3 className="text-portage-300 font-space-grotesk text-sm uppercase tracking-[0.2em]">
          Model Selection
        </h3>
        <div className="h-px flex-1 bg-gradient-to-r from-portage-500/50 via-portage-400/30 to-transparent" />
      </div>

      {!showModels ? (
        <div className="flex flex-col gap-2">
          <button
            onClick={handleViewRecommendedModels}
            disabled={isLoading}
            className="relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/20 backdrop-blur-sm transition-all duration-300 hover:border-portage-400/40 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Hextech glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-portage-500/5 via-portage-400/10 to-portage-500/5 pointer-events-none" />

            <div className="relative px-5 py-3 flex items-center justify-center gap-2">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin text-portage-400" />}
              <span className="text-portage-300 font-space-grotesk text-sm uppercase tracking-[0.15em] group-hover:text-portage-200 transition-colors">
                {isLoading ? "Loading Models..." : "View Recommended Models"}
              </span>
            </div>
          </button>

          {error && (
            <p className="text-red-400 font-space-grotesk text-xs text-center">
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map((model) => (
            <button
              key={model.model_type}
              onClick={() => onModelSelect(model.model_type)}
              className="relative group text-left"
            >
              {/* Hextech corners */}
              <div className="absolute -top-1 -left-1 w-2 h-2 border-l border-t border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
              <div className="absolute -top-1 -right-1 w-2 h-2 border-r border-t border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 border-l border-b border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 border-r border-b border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />

              <div className={`relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border transition-all duration-300 ${
                selectedModel === model.model_type
                  ? "border-portage-400/60 brightness-110"
                  : "border-portage-500/20 group-hover:border-portage-400/40"
              }`}>
                {/* Hextech glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-portage-500/5 via-portage-400/10 to-portage-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Selected indicator bar */}
                {selectedModel === model.model_type && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-portage-400" />
                )}

                <div className="relative p-3 sm:p-4">
                  <h4 className="text-portage-200 font-space-grotesk font-medium text-sm sm:text-base mb-1">
                    {model.name}
                  </h4>
                  <p className="text-portage-400/70 font-space-grotesk text-xs leading-relaxed">
                    {model.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
