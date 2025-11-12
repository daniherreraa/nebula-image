// components/machine/categoricalvariablestats.tsx
"use client";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Cell } from "recharts";
import { Tag, TrendingUp } from "lucide-react";
import { useMemo } from "react";

interface TopCategory {
  value: string;
  count: number;
  percentage: number;
}

interface TopCategoriesData {
  top_n: number;
  values: TopCategory[];
}

interface ColumnSummary {
  column: string;
  dtype: string;
  unique_values?: number;
  missing_percent?: string;
  top_categories?: TopCategoriesData;
  top?: string;
  freq?: number;
}

interface CategoricalVariableStatsProps {
  variableName: string;
  data: Array<string | number | boolean | null>;
  columnSummary?: ColumnSummary;
}

const CategoricalVariableStats = ({ variableName, data, columnSummary }: CategoricalVariableStatsProps) => {
  // Use backend data if available, otherwise calculate from raw data
  const { topCategories, uniqueCount, mostFrequent, totalCount } = useMemo(() => {
    if (columnSummary?.top_categories) {
      const categories = columnSummary.top_categories.values;
      return {
        topCategories: categories,
        uniqueCount: columnSummary.unique_values ?? 0,
        mostFrequent: categories[0],
        totalCount: categories.reduce((sum, cat) => sum + cat.count, 0),
      };
    }

    // Fallback: calculate from raw data
    const validData = data.filter(val => val !== null && val !== undefined);
    const frequencyMap = new Map<string, number>();

    validData.forEach(val => {
      const key = String(val);
      frequencyMap.set(key, (frequencyMap.get(key) || 0) + 1);
    });

    const frequencies = Array.from(frequencyMap.entries())
      .map(([value, count]) => ({ value, count, percentage: (count / validData.length) * 100 }))
      .sort((a, b) => b.count - a.count);

    return {
      topCategories: frequencies.slice(0, 8),
      uniqueCount: frequencies.length,
      mostFrequent: frequencies[0],
      totalCount: validData.length,
    };
  }, [columnSummary, data]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return topCategories.map(item => ({
      category: item.value.length > 15 ? item.value.substring(0, 15) + '...' : item.value,
      fullCategory: item.value,
      count: item.count,
      percentage: item.percentage,
    }));
  }, [topCategories]);

  const chartConfig = {
    count: {
      label: "Count",
      color: "hsl(var(--color-portage-500))",
    },
  };

  const COLORS = ['#607BF4', '#89A6FB', '#5E6DD3', '#7D94F2', '#4C5DC2', '#6B7FE8', '#3D4FB1', '#5A6ED7'];

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/20 backdrop-blur-sm">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-portage-500/5 via-portage-400/10 to-portage-500/5 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-portage-400/40 to-transparent" />

      <div className="relative p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-lg shadow-amber-400/50" />
            <h3 className="text-portage-300 font-space-grotesk text-lg font-medium tracking-wide">
              {variableName}
            </h3>
          </div>
          <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-space-grotesk uppercase tracking-wider">
            Categorical
          </span>
        </div>

        {/* Summary Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard icon={Tag} label="Unique" value={uniqueCount.toString()} />
          <StatCard icon={TrendingUp} label="Total" value={totalCount.toString()} />
          <div className="col-span-2 sm:col-span-1">
            <div className="relative group bg-woodsmoke-900/50 border border-portage-500/20 p-3 hover:border-portage-400/40 transition-all duration-300 h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-portage-500/5 via-portage-400/10 to-portage-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative space-y-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-amber-400" />
                  <span className="text-portage-400/70 text-xs font-space-grotesk uppercase tracking-wider">Top Value</span>
                </div>
                <div className="text-portage-200 font-space-grotesk text-sm font-bold truncate">
                  {mostFrequent?.value || 'N/A'}
                </div>
                <div className="text-portage-400/60 text-xs font-space-grotesk tabular-nums">
                  {mostFrequent?.percentage.toFixed(1)}% ({mostFrequent?.count || 0})
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Categories List */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-portage-400 animate-pulse shadow-lg shadow-portage-400/50" />
            <h4 className="text-portage-400/80 font-space-grotesk text-xs sm:text-sm uppercase tracking-wider">
              Top Categories
            </h4>
          </div>

          <div className="space-y-2">
            {topCategories.slice(0, 6).map((category, idx) => (
              <div key={idx} className="relative group bg-woodsmoke-900/50 border border-portage-500/20 hover:border-portage-400/30 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-portage-500/5 via-portage-400/10 to-portage-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative p-3 flex items-center gap-3">
                  {/* Rank Badge */}
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-portage-500/20 border border-portage-500/30 text-portage-300 text-xs font-space-grotesk font-bold">
                    {idx + 1}
                  </div>

                  {/* Category Name */}
                  <div className="flex-1 min-w-0">
                    <div className="text-portage-200 font-space-grotesk text-sm font-medium truncate">
                      {category.value}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex-1 min-w-0 max-w-[200px]">
                    <div className="relative h-5 bg-woodsmoke-950/50 border border-portage-500/20 overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 transition-all duration-500"
                        style={{
                          width: `${category.percentage}%`,
                          background: `linear-gradient(to right, ${COLORS[idx % COLORS.length]}, ${COLORS[(idx + 1) % COLORS.length]})`
                        }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-portage-200 font-space-grotesk text-sm font-bold tabular-nums">
                      {category.percentage.toFixed(1)}%
                    </div>
                    <div className="text-portage-400/60 text-xs font-space-grotesk tabular-nums">
                      {category.count.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-portage-400 animate-pulse shadow-lg shadow-portage-400/50" />
            <h4 className="text-portage-400/80 font-space-grotesk text-xs sm:text-sm uppercase tracking-wider">
              Distribution
            </h4>
          </div>
          <div className="relative h-[12vh] bg-woodsmoke-900/50 border border-portage-500/20 p-2">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barGap={2} barCategoryGap="5%" layout="horizontal">
                <defs>
                  {COLORS.map((color, idx) => (
                    <linearGradient key={idx} id={`categoryGradient${idx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity="1" />
                      <stop offset="100%" stopColor={color} stopOpacity="0.4" />
                    </linearGradient>
                  ))}
                </defs>
                <XAxis dataKey="category" hide />
                <YAxis hide />
                <Bar dataKey="count" radius={0} maxBarSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#categoryGradient${index % COLORS.length})`} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </div>

      {/* Bottom border accent */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-portage-500/40 to-transparent" />
    </div>
  );
};

// StatCard component
const StatCard = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="relative group bg-woodsmoke-900/50 border border-portage-500/20 p-3 hover:border-portage-400/40 transition-all duration-300">
    <div className="absolute inset-0 bg-gradient-to-r from-portage-500/5 via-portage-400/10 to-portage-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative space-y-1">
      <div className="flex items-center gap-2">
        <Icon className="w-3 h-3 text-portage-400" />
        <span className="text-portage-400/70 text-xs font-space-grotesk uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-portage-200 font-space-grotesk text-lg font-bold tabular-nums">
        {value}
      </div>
    </div>
  </div>
);

export default CategoricalVariableStats;
