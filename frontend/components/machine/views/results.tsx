// components/machine/views/results.tsx
"use client";
import { useState, useMemo } from "react";
import { Download, Loader2, Info, Plus } from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";
import { ScatterChart, Scatter, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useModel } from "@/app/context";
import { getClientApiUrl } from "@/lib/config";
import { CustomChartTooltip } from "@/components/machine/custom-chart-tooltip";
import { toast } from "sonner";

// Mock data - será reemplazado con datos reales del modelo
const mockPredictionsData = [
  { actual: 100, predicted: 105 },
  { actual: 150, predicted: 145 },
  { actual: 200, predicted: 210 },
  { actual: 250, predicted: 240 },
  { actual: 300, predicted: 305 },
  { actual: 350, predicted: 340 },
  { actual: 400, predicted: 410 },
  { actual: 450, predicted: 445 },
  { actual: 500, predicted: 495 },
  { actual: 180, predicted: 175 },
  { actual: 220, predicted: 230 },
  { actual: 380, predicted: 375 },
  { actual: 420, predicted: 430 },
  { actual: 280, predicted: 275 },
  { actual: 320, predicted: 330 },
];

const mockImportanceData = [
  { index: 0, importance: 2.1, name: "Feature 0" },
  { index: 1, importance: 5.8, name: "Feature 1" },
  { index: 2, importance: 4.9, name: "Feature 2" },
  { index: 3, importance: 3.7, name: "Feature 3" },
  { index: 4, importance: 5.2, name: "Feature 4" },
  { index: 5, importance: 1.3, name: "Feature 5" },
  { index: 6, importance: 4.1, name: "Feature 6" },
  { index: 7, importance: 3.2, name: "Feature 7" },
];

const mockMetrics = {
  r2_score: 0.89,
  accuracy: 0.89,
  mse: 65.2,
  rmse: 8.07,
  mae: 6.45
};

interface MetricCardProps {
  label: string;
  value: number;
  description?: string;
  infoUrl?: string;
}

function MetricCard({ label, value, description, infoUrl }: MetricCardProps) {
  return (
    <div className="relative group">
      {/* Hextech corners */}
      <div className="absolute -top-1 -left-1 w-2 h-2 border-l border-t border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
      <div className="absolute -top-1 -right-1 w-2 h-2 border-r border-t border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
      <div className="absolute -bottom-1 -left-1 w-2 h-2 border-l border-b border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
      <div className="absolute -bottom-1 -right-1 w-2 h-2 border-r border-b border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />

      <div className="relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/20 backdrop-blur-sm transition-all duration-300 hover:border-portage-400/40">
        {/* Hextech glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-portage-500/5 via-portage-400/10 to-portage-500/5 pointer-events-none" />

        <div className="relative p-3 sm:p-4 flex flex-col gap-2">
          {/* Title and Description */}
          <div className="flex-1">
            <div className="text-portage-400/70 text-xs font-space-grotesk font-medium uppercase tracking-[0.2em] mb-1">
              {label}
            </div>
            {description && (
              <div className="text-woodsmoke-100 text-xs font-space-grotesk leading-relaxed">
                {description}
              </div>
            )}
          </div>

          {/* Value and Info Button */}
          <div className="flex items-center justify-between">
            {infoUrl && (
              <a
                href={infoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-portage-400 hover:text-portage-300 transition-colors"
                title="Learn more"
              >
                <Info className="w-4 h-4" />
              </a>
            )}
            <div className="text-portage-200 text-2xl md:text-3xl font-tanker tabular-nums ml-auto">
              {typeof value === 'number' ? value.toFixed(2) : value}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

function ChartCard({ title, description, children, className = "" }: ChartCardProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Hextech corners like predictor cards */}
      <div className="absolute -top-1 -left-1 w-2 h-2 border-l border-t border-portage-500/40 z-10" />
      <div className="absolute -top-1 -right-1 w-2 h-2 border-r border-t border-portage-500/40 z-10" />
      <div className="absolute -bottom-1 -left-1 w-2 h-2 border-l border-b border-portage-500/40 z-10" />
      <div className="absolute -bottom-1 -right-1 w-2 h-2 border-r border-b border-portage-500/40 z-10" />

      <div className="relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/20 backdrop-blur-sm h-full">
        {/* Hextech glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-portage-500/5 via-portage-400/10 to-portage-500/5 pointer-events-none" />

        <div className="relative p-3 sm:p-4 md:p-6">
          <h3 className="text-base sm:text-lg font-space-grotesk font-medium text-portage-300 mb-1 tracking-wide">
            {title}
          </h3>
          <p className="text-xs font-space-grotesk text-woodsmoke-100 mb-3 sm:mb-4 leading-relaxed">
            {description}
          </p>
          <div className="mt-3 sm:mt-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

const Results = () => {
  const { trainingConfig, modelResults, setCurrentView } = useModel();
  const [isDownloading, setIsDownloading] = useState(false);

  // Use context data or fallback to mock data
  const selectedModel = trainingConfig?.selectedModel || "Random Forest";
  const metrics = modelResults?.metrics || mockMetrics;

  // Sort predictions data by actual value to ensure proper X-axis ordering
  const predictionsData = useMemo(() => {
    const data = modelResults?.predictions || mockPredictionsData;
    return [...data].sort((a, b) => a.actual - b.actual);
  }, [modelResults?.predictions]);

  // Calculate errors for error chart
  const errorData = useMemo(() => {
    return predictionsData.map((point, index) => ({
      index: index + 1,
      error: point.predicted - point.actual,
    }));
  }, [predictionsData]);

  // Transform feature importance data for the bar chart
  // Sort by importance in descending order (highest to lowest)
  const importanceData = modelResults?.featureImportance
    ? [...modelResults.featureImportance].sort((a, b) => b.importance - a.importance)
    : mockImportanceData;

  // Format model name with special characters having reduced opacity
  const formatModelName = (name: string) => {
    const specialChars = /[_/\-@]/g;
    const parts = name.split(specialChars);
    const matches = name.match(specialChars) || [];

    return (
      <>
        {parts.map((part, i) => (
          <span key={i}>
            {part.toUpperCase()}
            {matches[i] && <span className="opacity-30">{matches[i]}</span>}
          </span>
        ))}
      </>
    );
  };

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      // Call the backend download-model endpoint
      const backendUrl = getClientApiUrl();
      const response = await fetch(`${backendUrl}/api/download-model`, {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication if needed
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Failed to download model' }));
        throw new Error(error.detail || 'Failed to download model');
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${selectedModel.toLowerCase().replace(/\s+/g, "_")}_model.joblib`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename=(.+)/);
        if (filenameMatch) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      // Create download link and trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error downloading model:', error);
      toast.error('Failed to download model', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCreateNewModel = () => {
    // Navigate back to variable selection view
    setCurrentView("train");
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scatterChartConfig = {
    predicted: {
      label: "Predicted",
      color: "hsl(var(--color-portage-500))",
    },
  };

  const barChartConfig = {
    importance: {
      label: "Importance",
      color: "hsl(var(--color-portage-500))",
    },
  };

  const errorChartConfig = {
    error: {
      label: "Error",
      color: "hsl(var(--color-portage-500))",
    },
  };

  // Metrics in a row - filter only available ones
  const availableMetrics = [
    metrics.mse !== undefined && metrics.mse !== null && {
      label: "MSE",
      value: metrics.mse,
      description: "Mean Squared Error. Average of squared differences (lower is better).",
      infoUrl: "https://en.wikipedia.org/wiki/Mean_squared_error"
    },
    metrics.rmse !== undefined && metrics.rmse !== null && {
      label: "RMSE",
      value: metrics.rmse,
      description: "Root Mean Squared Error. Square root of MSE in original units (lower is better).",
      infoUrl: "https://en.wikipedia.org/wiki/Root-mean-square_deviation"
    },
    metrics.mae !== undefined && metrics.mae !== null && {
      label: "MAE",
      value: metrics.mae,
      description: "Mean Absolute Error. Average absolute difference (lower is better).",
      infoUrl: "https://en.wikipedia.org/wiki/Mean_absolute_error"
    },
  ].filter(Boolean) as MetricCardProps[];

  return (
    <div className="h-full flex flex-col gap-6 py-6">
      {/* Título con modelo */}
      <div className="flex items-center gap-3">
        <h2 className="text-portage-300 font-tanker text-2xl tracking-wide">
          Model Results
        </h2>
        <span className="text-portage-400/50 font-tanker text-2xl tracking-wide">/</span>
        <span className="text-portage-300 font-space-grotesk text-xl tracking-wide">
          {formatModelName(selectedModel)}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-portage-500/50 via-portage-400/30 to-transparent" />
      </div>

      {/* Metrics - In same row (max 3) */}
      {availableMetrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {availableMetrics.map((metric, idx) => (
            <MetricCard key={idx} {...metric} />
          ))}
        </div>
      )}

      {/* R² and Accuracy if available */}
      {((metrics.r2_score !== undefined && metrics.r2_score !== null) ||
        (metrics.accuracy !== undefined && metrics.accuracy !== null)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {(metrics.r2_score !== undefined && metrics.r2_score !== null) && (
            <MetricCard
              label="R²"
              value={metrics.r2_score}
              description="Coefficient of Determination. How well predictions fit actual values (0-1, higher is better)."
              infoUrl="https://en.wikipedia.org/wiki/Coefficient_of_determination"
            />
          )}
          {(metrics.accuracy !== undefined && metrics.accuracy !== null) && (
            <MetricCard
              label="Accuracy"
              value={metrics.accuracy}
              description="Percentage of correct predictions. Overall model correctness (0-1, higher is better)."
              infoUrl="https://en.wikipedia.org/wiki/Accuracy_and_precision"
            />
          )}
        </div>
      )}

      {/* Download and Create New Model Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="relative group overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/20 backdrop-blur-sm transition-all duration-300 hover:border-portage-400/40 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* Hextech corners */}
          <div className="absolute -top-1 -left-1 w-2 h-2 border-l border-t border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
          <div className="absolute -top-1 -right-1 w-2 h-2 border-r border-t border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 border-l border-b border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 border-r border-b border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />

          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-portage-500/0 via-portage-400/10 to-portage-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Button content */}
          <div className="relative px-4 py-3 flex items-center justify-center gap-2">
            {isDownloading ? (
              <Loader2 className="w-4 h-4 text-portage-400 animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-portage-400 group-hover:text-portage-300 transition-colors" />
            )}
            <span className="text-portage-300 font-space-grotesk text-sm uppercase tracking-[0.15em] group-hover:text-portage-200 transition-colors">
              {isDownloading ? "Downloading..." : "Download Model"}
            </span>
          </div>
        </button>

        <button
          onClick={handleCreateNewModel}
          className="relative group overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/20 backdrop-blur-sm transition-all duration-300 hover:border-portage-400/40"
        >
          {/* Hextech corners */}
          <div className="absolute -top-1 -left-1 w-2 h-2 border-l border-t border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
          <div className="absolute -top-1 -right-1 w-2 h-2 border-r border-t border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 border-l border-b border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 border-r border-b border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />

          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-portage-500/0 via-portage-400/10 to-portage-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Button content */}
          <div className="relative px-4 py-3 flex items-center justify-center gap-2">
            <Plus className="w-4 h-4 text-portage-400 group-hover:text-portage-300 transition-colors" />
            <span className="text-portage-300 font-space-grotesk text-sm uppercase tracking-[0.15em] group-hover:text-portage-200 transition-colors">
              Create Another Model
            </span>
          </div>
        </button>
      </div>

      {/* Main Charts Row - Predictions 40%, Feature Importance 60% */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Predictions Chart - 40% (2 columns) */}
        <ChartCard
          title="Predictions vs Actual"
          description="Comparison between model predictions and actual values. Points closer to a diagonal line indicate better predictions."
          className="lg:col-span-2"
        >
          <ChartContainer config={scatterChartConfig} className="h-[350px] w-full">
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <defs>
                <linearGradient id="scatterGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(96, 123, 244)" stopOpacity="1" />
                  <stop offset="100%" stopColor="rgb(96, 123, 244)" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(96, 123, 244)" opacity={0.1} />
              <XAxis
                dataKey="actual"
                stroke="rgb(237, 242, 247)"
                tick={{ fill: "rgb(237, 242, 247)", fontSize: 11, fontFamily: "var(--font-space-grotesk)" }}
                label={{ value: "Actual", position: "insideBottom", offset: -5, fill: "rgb(237, 242, 247)", fontSize: 11, fontFamily: "var(--font-space-grotesk)" }}
              />
              <YAxis
                dataKey="predicted"
                stroke="rgb(237, 242, 247)"
                tick={{ fill: "rgb(237, 242, 247)", fontSize: 11, fontFamily: "var(--font-space-grotesk)" }}
                label={{ value: "Predicted", angle: -90, position: "insideLeft", fill: "rgb(237, 242, 247)", fontSize: 11, fontFamily: "var(--font-space-grotesk)" }}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Scatter data={predictionsData} fill="rgb(96, 123, 244)" />
            </ScatterChart>
          </ChartContainer>
        </ChartCard>

        {/* Feature Importance - 60% (3 columns) - Only show if data exists */}
        {importanceData && importanceData.length > 0 && (
          <ChartCard
            title="Feature Importance"
            description="Variables ranked by their influence on predictions. Higher values indicate features that contribute more to the model's decisions."
            className="lg:col-span-3"
          >
            <ChartContainer config={barChartConfig} className="h-[350px] w-full">
              <BarChart data={importanceData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <defs>
                  <linearGradient id="barGradientResults" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(96, 123, 244)" stopOpacity="1" />
                    <stop offset="100%" stopColor="rgb(96, 123, 244)" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="borderGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(96, 123, 244)" stopOpacity="1" />
                    <stop offset="80%" stopColor="rgb(96, 123, 244)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="rgb(96, 123, 244)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(96, 123, 244)" opacity={0.1} />
                <XAxis
                  dataKey="name"
                  stroke="rgb(237, 242, 247)"
                  tick={{ fill: "rgb(237, 242, 247)", fontSize: 11, fontFamily: "var(--font-space-grotesk)" }}
                  label={{ value: "Feature", position: "insideBottom", offset: -5, fill: "rgb(237, 242, 247)", fontSize: 11, fontFamily: "var(--font-space-grotesk)" }}
                />
                <YAxis
                  stroke="rgb(237, 242, 247)"
                  tick={{ fill: "rgb(237, 242, 247)", fontSize: 11, fontFamily: "var(--font-space-grotesk)" }}
                  label={{ value: "Importance", angle: -90, position: "insideLeft", fill: "rgb(237, 242, 247)", fontSize: 11, fontFamily: "var(--font-space-grotesk)" }}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar
                  dataKey="importance"
                  fill="url(#barGradientResults)"
                  radius={0}
                  maxBarSize={50}
                  stroke="url(#borderGradient)"
                  strokeWidth={1.5}
                />
              </BarChart>
            </ChartContainer>
          </ChartCard>
        )}
      </div>

      {/* Second Row: Error Chart + Training Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Error Chart - 60% (3 columns) */}
        <ChartCard
          title="Prediction Errors"
          description="Difference between predicted and actual values for each data point. Values near zero indicate accurate predictions."
          className="lg:col-span-3"
        >
          <ChartContainer config={errorChartConfig} className="h-[200px] w-full">
            <LineChart data={errorData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <defs>
                <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(96, 123, 244)" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="rgb(96, 123, 244)" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(96, 123, 244)" opacity={0.1} />
              <XAxis
                dataKey="index"
                stroke="rgb(237, 242, 247)"
                tick={{ fill: "rgb(237, 242, 247)", fontSize: 11, fontFamily: "var(--font-space-grotesk)" }}
                label={{ value: "Sample", position: "insideBottom", offset: -5, fill: "rgb(237, 242, 247)", fontSize: 11, fontFamily: "var(--font-space-grotesk)" }}
              />
              <YAxis
                stroke="rgb(237, 242, 247)"
                tick={{ fill: "rgb(237, 242, 247)", fontSize: 11, fontFamily: "var(--font-space-grotesk)" }}
                label={{ value: "Error", angle: -90, position: "insideLeft", fill: "rgb(237, 242, 247)", fontSize: 11, fontFamily: "var(--font-space-grotesk)" }}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Line
                type="monotone"
                dataKey="error"
                stroke="rgb(96, 123, 244)"
                strokeWidth={2}
                dot={{ fill: "rgb(96, 123, 244)", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ChartContainer>
        </ChartCard>

        {/* Training Parameters - 40% (2 columns) */}
        <ChartCard
          title="Training Configuration"
          description="Parameters used during model training"
          className="lg:col-span-2"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-woodsmoke-900/30 border border-portage-500/20">
              <span className="text-portage-400/70 text-xs font-space-grotesk uppercase tracking-wider">Model Type</span>
              <span className="text-portage-200 text-sm font-space-grotesk">{selectedModel}</span>
            </div>
            {trainingConfig?.targetVariable && (
              <div className="flex items-center justify-between p-2 bg-woodsmoke-900/30 border border-portage-500/20">
                <span className="text-portage-400/70 text-xs font-space-grotesk uppercase tracking-wider">Target Variable</span>
                <span className="text-portage-200 text-sm font-space-grotesk">{trainingConfig.targetVariable}</span>
              </div>
            )}
            {trainingConfig?.predictors && (
              <div className="flex items-center justify-between p-2 bg-woodsmoke-900/30 border border-portage-500/20">
                <span className="text-portage-400/70 text-xs font-space-grotesk uppercase tracking-wider">Predictors</span>
                <span className="text-portage-200 text-sm font-space-grotesk">{trainingConfig.predictors.length}</span>
              </div>
            )}
            {trainingConfig?.handleOutliers !== undefined && (
              <div className="flex items-center justify-between p-2 bg-woodsmoke-900/30 border border-portage-500/20">
                <span className="text-portage-400/70 text-xs font-space-grotesk uppercase tracking-wider">Data Cleaning</span>
                <span className="text-portage-200 text-sm font-space-grotesk">{trainingConfig.handleOutliers ? "Enabled" : "Disabled"}</span>
              </div>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default Results;
