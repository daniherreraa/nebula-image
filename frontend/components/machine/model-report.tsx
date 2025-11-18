// components/machine/model-report.tsx
"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, BarChart3, Settings, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { CorrelationData } from "@/app/context/ModelContext";

interface ModelReportProps {
  modelData: {
    id: string;
    model_name?: string;
    created_at: string;
    preview: {
      filename: string;
      rows: number;
      columns: number;
      column_names: string[];
      preview_data: Array<Record<string, string | number | null>>;
    };
    correlation_data?: CorrelationData;
    variable_selection: {
      outcome_variable: string;
      predictor_variables: string[];
    };
    training_config: {
      selected_model: string;
      clean_data: boolean;
      iqr_k: number;
      n_neighbors: number;
    };
    results?: {
      r2_score?: number;
      accuracy?: number;
      mse?: number;
      results_data?: Record<string, unknown>;
    };
  };
}

const ModelReport = ({ modelData }: ModelReportProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCorrelationsOpen, setIsCorrelationsOpen] = useState(false);

  const formatValue = (value: unknown) => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "number") {
      return value.toFixed(4);
    }
    return String(value);
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-6 space-y-6">
      {/* Header - Model ID and Info */}
      <div className="relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/20 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-portage-500/5 via-portage-400/10 to-portage-500/5" />

        <div className="relative p-6 space-y-3">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-portage-400" />
            <h2 className="text-portage-200 font-tanker text-2xl tracking-wide">
              Model Report
            </h2>
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-portage-400/50 font-space-grotesk text-xs uppercase tracking-wider">
                Model ID
              </p>
              <p className="text-portage-300 font-mono text-sm">
                {modelData.id}
              </p>
            </div>

            {modelData.model_name && (
              <div>
                <p className="text-portage-400/50 font-space-grotesk text-xs uppercase tracking-wider">
                  Model Name
                </p>
                <p className="text-portage-300 font-space-grotesk text-base">
                  {modelData.model_name}
                </p>
              </div>
            )}

            <div>
              <p className="text-portage-400/50 font-space-grotesk text-xs uppercase tracking-wider">
                Created
              </p>
              <p className="text-portage-300 font-space-grotesk text-sm">
                {new Date(modelData.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-portage-500/40 to-transparent" />
      </div>

      {/* Variable Selection - Read-only */}
      <div className="relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/20 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-portage-500/5 via-portage-400/10 to-portage-500/5" />

        <div className="relative p-6 space-y-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-portage-400" />
            <h3 className="text-portage-300 font-space-grotesk text-sm uppercase tracking-[0.2em]">
              Variables
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-portage-400/50 font-space-grotesk text-xs uppercase tracking-wider mb-2">
                Outcome Variable
              </p>
              <div className="px-4 py-2 bg-woodsmoke-950/50 border border-portage-500/20 rounded-sm">
                <p className="text-portage-300 font-space-grotesk text-sm">
                  {modelData.variable_selection.outcome_variable}
                </p>
              </div>
            </div>

            <div>
              <p className="text-portage-400/50 font-space-grotesk text-xs uppercase tracking-wider mb-2">
                Predictor Variables ({modelData.variable_selection.predictor_variables.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {modelData.variable_selection.predictor_variables.map((predictor) => (
                  <div
                    key={predictor}
                    className="px-3 py-1.5 bg-woodsmoke-950/50 border border-portage-500/20 rounded-sm"
                  >
                    <p className="text-portage-300 font-space-grotesk text-xs">
                      {predictor}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-portage-500/40 to-transparent" />
      </div>

      {/* Model Configuration - Read-only */}
      <div className="relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/20 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-portage-500/5 via-portage-400/10 to-portage-500/5" />

        <div className="relative p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-portage-400" />
            <h3 className="text-portage-300 font-space-grotesk text-sm uppercase tracking-[0.2em]">
              Model Configuration
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-portage-400/50 font-space-grotesk text-xs uppercase tracking-wider mb-1">
                Selected Model
              </p>
              <p className="text-portage-300 font-space-grotesk text-sm">
                {modelData.training_config.selected_model}
              </p>
            </div>

            <div>
              <p className="text-portage-400/50 font-space-grotesk text-xs uppercase tracking-wider mb-1">
                Clean Data
              </p>
              <p className="text-portage-300 font-space-grotesk text-sm">
                {modelData.training_config.clean_data ? "Yes" : "No"}
              </p>
            </div>

            <div>
              <p className="text-portage-400/50 font-space-grotesk text-xs uppercase tracking-wider mb-1">
                IQR K-factor
              </p>
              <p className="text-portage-300 font-space-grotesk text-sm">
                {modelData.training_config.iqr_k}
              </p>
            </div>

            <div>
              <p className="text-portage-400/50 font-space-grotesk text-xs uppercase tracking-wider mb-1">
                N Neighbors
              </p>
              <p className="text-portage-300 font-space-grotesk text-sm">
                {modelData.training_config.n_neighbors}
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-portage-500/40 to-transparent" />
      </div>

      {/* Results */}
      {modelData.results && (
        <div className="relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/20 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-portage-500/5 via-portage-400/10 to-portage-500/5" />

          <div className="relative p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-portage-400" />
              <h3 className="text-portage-300 font-space-grotesk text-sm uppercase tracking-[0.2em]">
                Training Results
              </h3>
            </div>

            {/* Check if any metric is available */}
            {(modelData.results.r2_score !== undefined && modelData.results.r2_score !== null) ||
             (modelData.results.accuracy !== undefined && modelData.results.accuracy !== null) ||
             (modelData.results.mse !== undefined && modelData.results.mse !== null) ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {modelData.results.r2_score !== undefined && modelData.results.r2_score !== null && (
                <div className="p-4 bg-woodsmoke-950/50 border border-portage-500/20 rounded-sm">
                  <p className="text-portage-400/50 font-space-grotesk text-xs uppercase tracking-wider mb-1">
                    R² Score
                  </p>
                  <p className="text-portage-300 font-space-grotesk text-2xl font-bold tabular-nums">
                    {modelData.results.r2_score.toFixed(4)}
                  </p>
                </div>
              )}

              {modelData.results.accuracy !== undefined && modelData.results.accuracy !== null && (
                <div className="p-4 bg-woodsmoke-950/50 border border-portage-500/20 rounded-sm">
                  <p className="text-portage-400/50 font-space-grotesk text-xs uppercase tracking-wider mb-1">
                    Accuracy
                  </p>
                  <p className="text-portage-300 font-space-grotesk text-2xl font-bold tabular-nums">
                    {(modelData.results.accuracy * 100).toFixed(2)}%
                  </p>
                </div>
              )}

              {modelData.results.mse !== undefined && modelData.results.mse !== null && (
                <div className="p-4 bg-woodsmoke-950/50 border border-portage-500/20 rounded-sm">
                  <p className="text-portage-400/50 font-space-grotesk text-xs uppercase tracking-wider mb-1">
                    MSE
                  </p>
                  <p className="text-portage-300 font-space-grotesk text-2xl font-bold tabular-nums">
                    {modelData.results.mse.toFixed(4)}
                  </p>
                </div>
              )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-portage-400/50 font-space-grotesk text-sm">
                  No training metrics available
                </p>
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-portage-500/40 to-transparent" />
        </div>
      )}

      {/* Collapsible Preview Table */}
      <div className="relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/20 backdrop-blur-sm">
        <button
          onClick={() => setIsPreviewOpen(!isPreviewOpen)}
          className="w-full"
        >
          <div className="relative p-4 flex items-center justify-between hover:bg-portage-500/5 transition-colors">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-portage-400" />
              <h3 className="text-portage-300 font-space-grotesk text-sm uppercase tracking-[0.2em]">
                Dataset Preview
              </h3>
              <span className="text-portage-400/50 font-space-grotesk text-xs">
                ({modelData.preview.rows} rows × {modelData.preview.columns} cols)
              </span>
            </div>
            {isPreviewOpen ? (
              <ChevronUp className="w-5 h-5 text-portage-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-portage-400" />
            )}
          </div>
        </button>

        <AnimatePresence>
          {isPreviewOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 border-t border-portage-500/20">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-portage-500/20">
                        {modelData.preview.column_names.map((col) => (
                          <th
                            key={col}
                            className="px-3 py-2 text-left text-portage-400 font-space-grotesk text-xs uppercase tracking-wider"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {modelData.preview.preview_data.slice(0, 5).map((row, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-portage-500/10 hover:bg-portage-500/5 transition-colors"
                        >
                          {modelData.preview.column_names.map((col) => (
                            <td
                              key={col}
                              className="px-3 py-2 text-portage-300 font-space-grotesk text-xs"
                            >
                              {formatValue(row[col])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapsible Correlations */}
      {modelData.correlation_data && modelData.correlation_data.columns && modelData.correlation_data.correlations && (
        <div className="relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/20 backdrop-blur-sm">
          <button
            onClick={() => setIsCorrelationsOpen(!isCorrelationsOpen)}
            className="w-full"
          >
            <div className="relative p-4 flex items-center justify-between hover:bg-portage-500/5 transition-colors">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-portage-400" />
                <h3 className="text-portage-300 font-space-grotesk text-sm uppercase tracking-[0.2em]">
                  Correlations
                </h3>
              </div>
              {isCorrelationsOpen ? (
                <ChevronUp className="w-5 h-5 text-portage-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-portage-400" />
              )}
            </div>
          </button>

          <AnimatePresence>
            {isCorrelationsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-4 border-t border-portage-500/20 space-y-4">
                  <p className="text-woodsmoke-100 font-space-grotesk text-sm leading-relaxed">
                    Correlation matrix showing relationships between variables. Values range from -1 (negative correlation) to +1 (positive correlation).
                  </p>

                  {/* Correlation Matrix Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="sticky left-0 bg-woodsmoke-950/90 backdrop-blur-sm p-2 text-left border border-portage-500/20">
                            <span className="text-portage-400 font-space-grotesk text-xs font-semibold uppercase tracking-wider">
                              Variable
                            </span>
                          </th>
                          {modelData.correlation_data!.columns.map((col, idx) => (
                            <th
                              key={idx}
                              className="p-2 text-left border border-portage-500/20 min-w-[100px]"
                            >
                              <span className="text-portage-400 font-space-grotesk text-xs font-semibold uppercase tracking-wider">
                                {col}
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {modelData.correlation_data!.correlations.map((row, rowIdx) => (
                          <tr key={rowIdx} className="hover:bg-portage-500/5 transition-colors">
                            <td className="sticky left-0 bg-woodsmoke-950/90 backdrop-blur-sm p-2 border border-portage-500/20">
                              <span className="text-portage-300 font-space-grotesk text-sm font-medium">
                                {modelData.correlation_data!.columns[rowIdx]}
                              </span>
                            </td>
                            {row.map((value, colIdx) => {
                              const absValue = Math.abs(value);
                              const isStrong = absValue > 0.7;
                              const isModerate = absValue > 0.4 && absValue <= 0.7;
                              const bgColor = isStrong
                                ? value > 0
                                  ? "bg-portage-500/30"
                                  : "bg-carnation-500/30"
                                : isModerate
                                ? value > 0
                                  ? "bg-portage-500/15"
                                  : "bg-carnation-500/15"
                                : "bg-transparent";

                              return (
                                <td
                                  key={colIdx}
                                  className={`p-2 border border-portage-500/20 text-center ${bgColor} transition-colors`}
                                >
                                  <span className="text-woodsmoke-100 font-mono text-sm">
                                    {value.toFixed(3)}
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-portage-500/30 border border-portage-500/40" />
                      <span className="text-woodsmoke-100 font-space-grotesk text-xs">
                        Strong Positive (&gt;0.7)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-portage-500/15 border border-portage-500/30" />
                      <span className="text-woodsmoke-100 font-space-grotesk text-xs">
                        Moderate Positive (0.4-0.7)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-carnation-500/15 border border-carnation-500/30" />
                      <span className="text-woodsmoke-100 font-space-grotesk text-xs">
                        Moderate Negative (-0.4 to -0.7)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-carnation-500/30 border border-carnation-500/40" />
                      <span className="text-woodsmoke-100 font-space-grotesk text-xs">
                        Strong Negative (&lt;-0.7)
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ModelReport;
