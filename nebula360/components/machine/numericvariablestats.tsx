// components/machine/numericvariablestats.tsx
"use client";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis } from "recharts";

interface NumericVariableStatsProps {
  variableName: string;
  data: Array<string | number | boolean | null>;
}

const NumericVariableStats = ({
  variableName,
  data,
}: NumericVariableStatsProps) => {
  // Filter out null/undefined values and ensure we only have numbers
  const validData = data.filter(
    (val): val is number => typeof val === 'number' && !isNaN(val)
  );

  // Calculate statistics
  const sortedData = [...validData].sort((a, b) => a - b);
  const min = sortedData[0] || 0;
  const max = sortedData[sortedData.length - 1] || 0;
  const median = sortedData[Math.floor(sortedData.length / 2)] || 0;
  const mean =
    validData.reduce((sum, val) => sum + val, 0) / validData.length || 0;
  const range = max - min;

  // Calculate standard deviation
  const variance =
    validData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    validData.length;
  const stdDev = Math.sqrt(variance);

  // Create histogram bins
  const numBins = 30;
  const binWidth = range / numBins;
  const bins = Array(numBins).fill(0);

  validData.forEach((val) => {
    const binIndex = Math.min(Math.floor((val - min) / binWidth), numBins - 1);
    bins[binIndex]++;
  });

  const maxBinCount = Math.max(...bins);

  // Prepare chart data
  const chartData = bins.map((count, idx) => ({
    bin: idx,
    count: count,
  }));

  const chartConfig = {
    count: {
      label: "Frequency",
      color: "hsl(var(--color-portage-500))",
    },
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/20 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-r from-portage-500/5 via-portage-400/10 to-portage-500/5 pointer-events-none" />

      <div className="relative p-6 space-y-4">
        {/* Header with inline stats */}
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

          {/* Inline stats */}
          <div className="flex flex-wrap items-center gap-3 text-sm font-space-grotesk ml-auto">
            <span className="text-portage-400/70">
              median:{" "}
              <span className="text-portage-200 font-bold tabular-nums">
                {median.toFixed(2)}
              </span>
            </span>
            <span className="text-portage-400/70">
              mean:{" "}
              <span className="text-portage-200 font-bold tabular-nums">
                {mean.toFixed(2)}
              </span>
            </span>
            <span className="text-portage-400/70">
              range:{" "}
              <span className="text-portage-200 font-bold tabular-nums">
                {min.toFixed(2)} <span className="text-portage-400">↔</span>{" "}
                {max.toFixed(2)}
              </span>
            </span>
            <span className="text-portage-400/70">
              σ:{" "}
              <span className="text-portage-200 font-bold tabular-nums">
                {stdDev.toFixed(2)}
              </span>
            </span>
          </div>
        </div>

        {/* Distribution Chart */}
        <div>
          <h4 className="text-portage-400/80 font-space-grotesk text-sm uppercase tracking-wider mb-2">
            Distribution
          </h4>
          <div className="relative h-[12vh]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart
                data={chartData}
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                barGap={3}
                barCategoryGap="0%"
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="rgb(96, 123, 244)"
                      stopOpacity="1"
                    />
                    <stop
                      offset="100%"
                      stopColor="rgb(96, 123, 244)"
                      stopOpacity="0"
                    />
                  </linearGradient>
                  <linearGradient
                    id="borderGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="rgb(96, 123, 244)"
                      stopOpacity="1"
                    />
                    <stop
                      offset="80%"
                      stopColor="rgb(96, 123, 244)"
                      stopOpacity="0.3"
                    />
                    <stop
                      offset="100%"
                      stopColor="rgb(96, 123, 244)"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>
                <XAxis dataKey="bin" hide />
                <YAxis hide />
                <Bar
                  dataKey="count"
                  fill="url(#barGradient)"
                  radius={0}
                  maxBarSize={50}
                  stroke="url(#borderGradient)"
                  strokeWidth={1.5}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumericVariableStats;
