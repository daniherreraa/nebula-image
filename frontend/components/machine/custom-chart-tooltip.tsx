"use client";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number | string;
    dataKey: string;
    payload?: Record<string, unknown>;
  }>;
  label?: string | number;
  labelFormatter?: (label: string | number) => string;
}

export const CustomChartTooltip = ({ active, payload, label, labelFormatter }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const formattedLabel = labelFormatter && label !== undefined ? labelFormatter(label) : label;

  return (
    <div className="relative">
      {/* Hextech micro corners */}
      <div className="absolute -top-0.5 -left-0.5 w-1 h-1 border-l border-t border-portage-400/60" />
      <div className="absolute -top-0.5 -right-0.5 w-1 h-1 border-r border-t border-portage-400/60" />
      <div className="absolute -bottom-0.5 -left-0.5 w-1 h-1 border-l border-b border-portage-400/60" />
      <div className="absolute -bottom-0.5 -right-0.5 w-1 h-1 border-r border-b border-portage-400/60" />

      {/* Main tooltip container */}
      <div className="relative bg-woodsmoke-950/98 border border-portage-500/30 backdrop-blur-md shadow-lg">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-portage-400/50 to-transparent" />

        {/* Content */}
        <div className="relative px-3 py-2 space-y-1.5">
          {/* Label (if provided) */}
          {formattedLabel !== undefined && (
            <>
              <div className="text-portage-300 font-space-grotesk text-xs font-medium tracking-wide">
                {formattedLabel}
              </div>
              <div className="h-px bg-gradient-to-r from-portage-500/30 via-portage-400/50 to-portage-500/30" />
            </>
          )}

          {/* Payload values */}
          <div className="space-y-1">
            {payload.map((entry, index) => {
              // Try to get feature name from payload if available
              const displayName = entry.payload?.name || entry.name;
              const displayValue = typeof entry.value === 'number'
                ? entry.value.toFixed(4)
                : entry.value;

              return (
                <div key={`item-${index}`} className="flex items-center gap-2">
                  {/* Color indicator */}
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: 'rgb(96, 123, 244)' }}
                  />

                  {/* Label and value */}
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-portage-400/70 font-space-grotesk text-[10px] uppercase tracking-wider">
                      {displayName}:
                    </span>
                    <span className="text-portage-200 font-space-grotesk text-xs font-medium tabular-nums">
                      {displayValue}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-portage-400/50 to-transparent" />
      </div>
    </div>
  );
};
