// components/machine/views/results.tsx
"use client";
import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";
import { ScatterChart, Scatter, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useModel } from "@/app/context";

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
  r2: 0.89,
  accuracy: 0.89,
  mse: 65.2
};

interface MetricCardProps {
  label: string;
  value: number;
}

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="relative group">
      {/* Hextech corners like predictor cards */}
      <div className="absolute -top-1 -left-1 w-2 h-2 border-l border-t border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
      <div className="absolute -top-1 -right-1 w-2 h-2 border-r border-t border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
      <div className="absolute -bottom-1 -left-1 w-2 h-2 border-l border-b border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
      <div className="absolute -bottom-1 -right-1 w-2 h-2 border-r border-b border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />

      <div className="relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/20 backdrop-blur-sm transition-all duration-300 hover:border-portage-400/40">
        {/* Hextech glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-portage-500/5 via-portage-400/10 to-portage-500/5 pointer-events-none" />

        <div className="relative p-3 sm:p-4 md:p-6">
          <div className="text-portage-400/70 text-[10px] sm:text-xs font-space-grotesk font-medium mb-1 sm:mb-2 uppercase tracking-[0.15em] sm:tracking-[0.2em]">
            {label}
          </div>
          <div className="text-portage-200 text-2xl sm:text-3xl md:text-4xl font-tanker tabular-nums">
            {typeof value === 'number' ? value.toFixed(2) : value}
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
          <p className="text-xs font-space-grotesk text-portage-400/70 mb-3 sm:mb-4 leading-relaxed">
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
  const { trainingConfig, modelResults } = useModel();
  const [isDownloading, setIsDownloading] = useState(false);

  // Use context data or fallback to mock data
  const selectedModel = trainingConfig?.selectedModel || "Random Forest";
  const metrics = modelResults?.metrics || mockMetrics;
  const predictionsData = modelResults?.predictions || mockPredictionsData;

  // Transform feature importance data for the bar chart
  const importanceData = modelResults?.featureImportance
    ? modelResults.featureImportance
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    const modelData = {
      type: selectedModel,
      outcomeVariable: trainingConfig?.outcomeVariable,
      predictors: trainingConfig?.predictors,
      handleOutliers: trainingConfig?.handleOutliers,
      metrics,
      predictions: predictionsData,
      featureImportance: importanceData,
      timestamp: modelResults?.timestamp || new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(modelData, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedModel.toLowerCase().replace(/\s+/g, "_")}_model.json`;
    a.click();
    URL.revokeObjectURL(url);
    setIsDownloading(false);
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

      {/* Fila de métricas */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <MetricCard label="R²" value={metrics.r2 || 0} />
        <MetricCard label="Accuracy" value={metrics.accuracy || 0} />
        <MetricCard label="MSE" value={metrics.mse || 0} />

        {/* Botón Download Model */}
        <div className="relative group col-span-3 md:col-span-1">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="relative group overflow-hidden w-full h-full bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/20 backdrop-blur-sm transition-all duration-300 hover:border-portage-400/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Hextech corners */}
            <div className="absolute -top-1 -left-1 w-2 h-2 border-l border-t border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
            <div className="absolute -top-1 -right-1 w-2 h-2 border-r border-t border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 border-l border-b border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-r border-b border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />

            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-portage-500/0 via-portage-400/10 to-portage-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Button content */}
            <div className="relative px-3 py-3 sm:px-4 sm:py-4 md:py-6 flex items-center justify-center gap-2">
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-portage-400 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-portage-400 group-hover:text-portage-300 transition-colors" />
              )}
              <span className="text-portage-300 font-space-grotesk text-xs sm:text-sm uppercase tracking-[0.1em] sm:tracking-[0.15em] group-hover:text-portage-200 transition-colors">
                {isDownloading ? "Downloading..." : "Download"}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Fila de gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 flex-1">
        {/* Scatter Plot - 60% (3 columnas) */}
        <ChartCard
          title="Predictions"
          description="Model predictions vs actual values"
          className="lg:col-span-3"
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
                stroke="rgb(137, 166, 251)"
                tick={{ fill: "rgb(137, 166, 251)", fontSize: 11, fontFamily: "var(--font-space-grotesk)" }}
                label={{ value: "Actual", position: "insideBottom", offset: -5, fill: "rgb(137, 166, 251)", fontSize: 11, fontFamily: "var(--font-space-grotesk)" }}
              />
              <YAxis
                dataKey="predicted"
                stroke="rgb(137, 166, 251)"
                tick={{ fill: "rgb(137, 166, 251)", fontSize: 11, fontFamily: "var(--font-space-grotesk)" }}
                label={{ value: "Predicted", angle: -90, position: "insideLeft", fill: "rgb(137, 166, 251)", fontSize: 11, fontFamily: "var(--font-space-grotesk)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(23, 23, 23, 0.95)",
                  border: "1px solid rgba(96, 123, 244, 0.3)",
                  borderRadius: "0",
                  color: "rgb(209, 213, 219)",
                  fontSize: "12px",
                  fontFamily: "var(--font-space-grotesk)"
                }}
              />
              <Scatter data={predictionsData} fill="rgb(96, 123, 244)" />
            </ScatterChart>
          </ChartContainer>
        </ChartCard>

        {/* Bar Chart - 40% (2 columnas) */}
        <ChartCard
          title="Feature Importance"
          description="Most important variables for predictions"
          className="lg:col-span-2"
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
                dataKey="index"
                stroke="rgb(137, 166, 251)"
                tick={{ fill: "rgb(137, 166, 251)", fontSize: 11, fontFamily: "var(--font-space-grotesk)" }}
                label={{ value: "Feature", position: "insideBottom", offset: -5, fill: "rgb(137, 166, 251)", fontSize: 11, fontFamily: "var(--font-space-grotesk)" }}
              />
              <YAxis
                stroke="rgb(137, 166, 251)"
                tick={{ fill: "rgb(137, 166, 251)", fontSize: 11, fontFamily: "var(--font-space-grotesk)" }}
                label={{ value: "Importance", angle: -90, position: "insideLeft", fill: "rgb(137, 166, 251)", fontSize: 11, fontFamily: "var(--font-space-grotesk)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(23, 23, 23, 0.95)",
                  border: "1px solid rgba(96, 123, 244, 0.3)",
                  borderRadius: "0",
                  color: "rgb(209, 213, 219)",
                  fontSize: "12px",
                  fontFamily: "var(--font-space-grotesk)"
                }}
              />
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
      </div>
    </div>
  );
};

export default Results;
