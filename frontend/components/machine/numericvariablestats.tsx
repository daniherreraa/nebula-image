// components/machine/numericvariablestats.tsx
"use client";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis } from "recharts";
import { AlertCircle, CheckCircle2, TrendingUp, Activity } from "lucide-react";
import { useMemo } from "react";

interface OutliersDetection {
  method: string;
  lower_bound: number;
  upper_bound: number;
  outliers_count: number;
  outliers_percentage: number;
  has_outliers: boolean;
}

interface NormalityTest {
  test_name: string;
  statistic: number;
  p_value: number;
  is_normal: boolean;
  interpretation: string;
  alpha: number;
}

interface HistogramData {
  n_bins: number;
  bin_edges: number[];
  frequencies: number[];
  bin_width: number;
}

interface ColumnSummary {
  column: string;
  dtype: string;
  mean?: number;
  std?: number;
  min?: number;
  max?: number;
  "25%"?: number;
  "50%"?: number;
  "75%"?: number;
  outliers_detection?: OutliersDetection;
  normality_test?: NormalityTest;
  histogram_data?: HistogramData;
  unique_values?: number;
  missing_percent?: string;
}

interface NumericVariableStatsProps {
  variableName: string;
  data: Array<string | number | boolean | null>;
  columnSummary?: ColumnSummary;
}

const NumericVariableStats = ({
  variableName,
  data,
  columnSummary,
}: NumericVariableStatsProps) => {
  // Use backend data if available, otherwise calculate from raw data
  const stats = useMemo(() => {
    if (columnSummary) {
      return {
        mean: columnSummary.mean ?? 0,
        std: columnSummary.std ?? 0,
        min: columnSummary.min ?? 0,
        max: columnSummary.max ?? 0,
        median: columnSummary["50%"] ?? 0,
        q25: columnSummary["25%"] ?? 0,
        q75: columnSummary["75%"] ?? 0,
        range: (columnSummary.max ?? 0) - (columnSummary.min ?? 0),
      };
    }

    // Fallback: calculate from raw data
    const validData = data.filter(
      (val): val is number => typeof val === 'number' && !isNaN(val)
    );
    const sortedData = [...validData].sort((a, b) => a - b);
    const min = sortedData[0] || 0;
    const max = sortedData[sortedData.length - 1] || 0;
    const mean = validData.reduce((sum, val) => sum + val, 0) / validData.length || 0;
    const variance = validData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / validData.length;
    const std = Math.sqrt(variance);

    return {
      mean,
      std,
      min,
      max,
      median: sortedData[Math.floor(sortedData.length / 2)] || 0,
      q25: sortedData[Math.floor(sortedData.length * 0.25)] || 0,
      q75: sortedData[Math.floor(sortedData.length * 0.75)] || 0,
      range: max - min,
    };
  }, [columnSummary, data]);

  // Prepare chart data from backend histogram or calculate
  const chartData = useMemo(() => {
    if (columnSummary?.histogram_data) {
      const { frequencies } = columnSummary.histogram_data;
      return frequencies.map((count, idx) => ({
        bin: idx,
        count: count,
      }));
    }

    // Fallback: calculate histogram from raw data
    const validData = data.filter(
      (val): val is number => typeof val === 'number' && !isNaN(val)
    );
    const numBins = 18;
    const binWidth = stats.range / numBins;
    const bins = Array(numBins).fill(0);

    validData.forEach((val) => {
      const binIndex = Math.min(Math.floor((val - stats.min) / binWidth), numBins - 1);
      bins[binIndex]++;
    });

    return bins.map((count, idx) => ({ bin: idx, count }));
  }, [columnSummary, data, stats]);

  const chartConfig = {
    count: {
      label: "Frequency",
      color: "hsl(var(--color-portage-500))",
    },
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/20 backdrop-blur-sm">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-portage-500/5 via-portage-400/10 to-portage-500/5 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-portage-400/40 to-transparent" />

      <div className="relative p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-portage-400 animate-pulse shadow-lg shadow-portage-400/50" />
            <h3 className="text-portage-300 font-space-grotesk text-lg font-medium tracking-wide">
              {variableName}
            </h3>
          </div>
          <span className="px-2 py-0.5 bg-portage-500/20 border border-portage-500/30 text-portage-300 text-xs font-space-grotesk uppercase tracking-wider">
            Numeric
          </span>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={TrendingUp} label="Mean" value={stats.mean.toFixed(2)} />
          <StatCard icon={Activity} label="Std Dev" value={stats.std.toFixed(2)} />
          <StatCard icon={TrendingUp} label="Median" value={stats.median.toFixed(2)} />
          <StatCard icon={Activity} label="Range" value={`${stats.min.toFixed(2)} - ${stats.max.toFixed(2)}`} mini />
        </div>

        {/* Percentiles */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-portage-400 animate-pulse shadow-lg shadow-portage-400/50" />
            <h4 className="text-portage-400/80 font-space-grotesk text-xs sm:text-sm uppercase tracking-wider">
              Quartiles
            </h4>
          </div>
          <div className="relative bg-woodsmoke-900/50 border border-portage-500/20 p-4">
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <div className="text-portage-400/60 text-xs font-space-grotesk uppercase mb-1">Q1 (25%)</div>
                <div className="text-portage-200 font-space-grotesk text-lg font-bold tabular-nums">{stats.q25.toFixed(2)}</div>
              </div>
              <div className="w-px h-12 bg-portage-500/30" />
              <div className="text-center flex-1">
                <div className="text-portage-400/60 text-xs font-space-grotesk uppercase mb-1">Q2 (50%)</div>
                <div className="text-portage-200 font-space-grotesk text-lg font-bold tabular-nums">{stats.median.toFixed(2)}</div>
              </div>
              <div className="w-px h-12 bg-portage-500/30" />
              <div className="text-center flex-1">
                <div className="text-portage-400/60 text-xs font-space-grotesk uppercase mb-1">Q3 (75%)</div>
                <div className="text-portage-200 font-space-grotesk text-lg font-bold tabular-nums">{stats.q75.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Distribution Chart */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-portage-400 animate-pulse shadow-lg shadow-portage-400/50" />
            <h4 className="text-portage-400/80 font-space-grotesk text-xs sm:text-sm uppercase tracking-wider">
              Distribution
            </h4>
          </div>
          <div className="relative h-[12vh] bg-woodsmoke-900/50 border border-portage-500/20 p-2">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart
                data={chartData}
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                barGap={1}
                barCategoryGap="0%"
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(96, 123, 244)" stopOpacity="1" />
                    <stop offset="100%" stopColor="rgb(96, 123, 244)" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="bin" hide />
                <YAxis hide />
                <Bar dataKey="count" fill="url(#barGradient)" radius={0} maxBarSize={50} />
              </BarChart>
            </ChartContainer>
          </div>
        </div>

        {/* Normality Test */}
        {columnSummary?.normality_test && (
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-portage-400 animate-pulse shadow-lg shadow-portage-400/50" />
              <h4 className="text-portage-400/80 font-space-grotesk text-xs sm:text-sm uppercase tracking-wider">
                Normality Test
              </h4>
            </div>
            <div className="relative bg-woodsmoke-900/50 border border-portage-500/20 p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {columnSummary.normality_test.is_normal ? (
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-amber-400" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-portage-300 font-space-grotesk text-sm font-medium">
                      {columnSummary.normality_test.test_name}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-space-grotesk uppercase tracking-wider ${
                      columnSummary.normality_test.is_normal
                        ? 'bg-green-500/20 border border-green-500/30 text-green-300'
                        : 'bg-amber-500/20 border border-amber-500/30 text-amber-300'
                    }`}>
                      {columnSummary.normality_test.interpretation}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs font-space-grotesk">
                    <div>
                      <span className="text-portage-400/60">Statistic: </span>
                      <span className="text-portage-200 tabular-nums">{columnSummary.normality_test.statistic.toFixed(4)}</span>
                    </div>
                    <div>
                      <span className="text-portage-400/60">p-value: </span>
                      <span className="text-portage-200 tabular-nums">{columnSummary.normality_test.p_value.toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Outliers Detection */}
        {columnSummary?.outliers_detection && (
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-portage-400 animate-pulse shadow-lg shadow-portage-400/50" />
              <h4 className="text-portage-400/80 font-space-grotesk text-xs sm:text-sm uppercase tracking-wider">
                Outliers Detection
              </h4>
            </div>
            <div className="relative bg-woodsmoke-900/50 border border-portage-500/20 p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {columnSummary.outliers_detection.has_outliers ? (
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  ) : (
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-portage-300 font-space-grotesk text-sm font-medium">
                      {columnSummary.outliers_detection.method} Method
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-space-grotesk uppercase tracking-wider ${
                      columnSummary.outliers_detection.has_outliers
                        ? 'bg-red-500/20 border border-red-500/30 text-red-300'
                        : 'bg-green-500/20 border border-green-500/30 text-green-300'
                    }`}>
                      {columnSummary.outliers_detection.has_outliers ? 'Detected' : 'None'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-woodsmoke-950/50 p-2 border border-portage-500/10">
                      <div className="text-portage-400/60 text-xs font-space-grotesk uppercase mb-1">Lower Bound</div>
                      <div className="text-portage-200 font-space-grotesk text-sm tabular-nums">{columnSummary.outliers_detection.lower_bound.toFixed(2)}</div>
                    </div>
                    <div className="bg-woodsmoke-950/50 p-2 border border-portage-500/10">
                      <div className="text-portage-400/60 text-xs font-space-grotesk uppercase mb-1">Upper Bound</div>
                      <div className="text-portage-200 font-space-grotesk text-sm tabular-nums">{columnSummary.outliers_detection.upper_bound.toFixed(2)}</div>
                    </div>
                  </div>

                  {columnSummary.outliers_detection.has_outliers && (
                    <div className="bg-red-500/10 border border-red-500/20 p-3">
                      <div className="flex items-center justify-between text-sm font-space-grotesk">
                        <span className="text-red-300">Outliers Count:</span>
                        <span className="text-red-200 font-bold tabular-nums">{columnSummary.outliers_detection.outliers_count}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-space-grotesk mt-1">
                        <span className="text-red-300">Percentage:</span>
                        <span className="text-red-200 font-bold tabular-nums">{columnSummary.outliers_detection.outliers_percentage.toFixed(2)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom border accent */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-portage-500/40 to-transparent" />
    </div>
  );
};

// StatCard component
const StatCard = ({ icon: Icon, label, value, mini = false }: { icon: React.ElementType; label: string; value: string; mini?: boolean }) => (
  <div className="relative group bg-woodsmoke-900/50 border border-portage-500/20 p-3 hover:border-portage-400/40 transition-all duration-300">
    <div className="absolute inset-0 bg-gradient-to-r from-portage-500/5 via-portage-400/10 to-portage-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative space-y-1">
      <div className="flex items-center gap-2">
        <Icon className="w-3 h-3 text-portage-400" />
        <span className="text-portage-400/70 text-xs font-space-grotesk uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-portage-200 font-space-grotesk font-bold tabular-nums ${mini ? 'text-sm' : 'text-lg'}`}>
        {value}
      </div>
    </div>
  </div>
);

export default NumericVariableStats;
