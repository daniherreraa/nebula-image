// components/machine/training-section.tsx
"use client";
import { Play } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TrainingSectionProps {
  handleOutliers: boolean;
  iqrK: number;
  nNeighbors: number;
  onHandleOutliersChange: (value: boolean) => void;
  onIqrKChange: (value: number) => void;
  onNNeighborsChange: (value: number) => void;
  onStartTraining: () => void;
}

export const TrainingSection = ({
  handleOutliers,
  iqrK,
  nNeighbors,
  onHandleOutliersChange,
  onIqrKChange,
  onNNeighborsChange,
  onStartTraining,
}: TrainingSectionProps) => {
  return (
    <div className="mt-8 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h3 className="text-portage-300 font-space-grotesk text-sm uppercase tracking-[0.2em]">
          Training Configuration
        </h3>
        <div className="h-px flex-1 bg-gradient-to-r from-portage-500/50 via-portage-400/30 to-transparent" />
      </div>

      {/* Configuration Panel - Similar to StatusBar aesthetic */}
      <div className="relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/20 backdrop-blur-sm">
        {/* Subtle hextech glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-portage-500/5 via-portage-400/10 to-portage-500/5" />

        {/* Content */}
        <div className="relative px-4 sm:px-5 py-4 flex flex-col gap-4">
          {/* Handle Outliers Switch */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-portage-400 animate-pulse shadow-lg shadow-portage-500/50" />
              <label
                htmlFor="outliers-switch"
                className="text-portage-300 font-space-grotesk text-sm cursor-pointer select-none"
              >
                Handle Outliers & NaNs
              </label>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-portage-400/60 font-space-grotesk text-xs">
                {handleOutliers ? "Enabled" : "Disabled"}
              </span>
              <Switch
                checked={handleOutliers}
                onCheckedChange={onHandleOutliersChange}
                id="outliers-switch"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-portage-500/30" />

          {/* Outliers Configuration - Only show when enabled */}
          {handleOutliers && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* IQR K Parameter */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-portage-400 animate-pulse shadow-lg shadow-portage-500/50" style={{ animationDelay: "0.3s" }} />
                    <span className="text-portage-300/70 text-xs font-space-grotesk uppercase tracking-wider">
                      IQR Multiplier
                    </span>
                  </div>
                  <Select
                    value={iqrK.toString()}
                    onValueChange={(value) => onIqrKChange(parseFloat(value))}
                  >
                    <SelectTrigger className="w-full bg-woodsmoke-900/50 border-portage-500/30 text-portage-200 font-space-grotesk text-sm hover:border-portage-400/40 focus:ring-portage-500/50 focus:ring-offset-0 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-woodsmoke-950 border-portage-500/30">
                      <SelectItem value="1.0" className="text-portage-200 font-space-grotesk hover:bg-portage-500/20 focus:bg-portage-500/20">
                        1.0 (Aggressive)
                      </SelectItem>
                      <SelectItem value="1.5" className="text-portage-200 font-space-grotesk hover:bg-portage-500/20 focus:bg-portage-500/20">
                        1.5 (Standard)
                      </SelectItem>
                      <SelectItem value="2.0" className="text-portage-200 font-space-grotesk hover:bg-portage-500/20 focus:bg-portage-500/20">
                        2.0 (Conservative)
                      </SelectItem>
                      <SelectItem value="2.5" className="text-portage-200 font-space-grotesk hover:bg-portage-500/20 focus:bg-portage-500/20">
                        2.5 (Very Conservative)
                      </SelectItem>
                      <SelectItem value="3.0" className="text-portage-200 font-space-grotesk hover:bg-portage-500/20 focus:bg-portage-500/20">
                        3.0 (Minimal)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* N Neighbors Parameter */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-portage-400 animate-pulse shadow-lg shadow-portage-500/50" style={{ animationDelay: "0.6s" }} />
                    <span className="text-portage-300/70 text-xs font-space-grotesk uppercase tracking-wider">
                      N Neighbors
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={nNeighbors}
                    onChange={(e) => onNNeighborsChange(parseInt(e.target.value) || 5)}
                    className="w-full px-3 py-2 bg-woodsmoke-900/50 border border-portage-500/30 text-portage-200 font-space-grotesk text-sm hover:border-portage-400/40 focus:border-portage-500/50 focus:ring-1 focus:ring-portage-500/50 focus:outline-none transition-colors rounded-md"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-portage-500/30" />
            </>
          )}

          {/* Start Training Button */}
          <div className="flex justify-end">
            <button
              onClick={onStartTraining}
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
              <div className="relative px-6 py-3 flex items-center gap-3">
                <Play className="w-5 h-5 text-portage-400 group-hover:text-portage-300 transition-colors" />
                <span className="text-portage-300 font-space-grotesk text-sm uppercase tracking-[0.15em] group-hover:text-portage-200 transition-colors">
                  Start Training
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Bottom hextech accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-portage-500/40 to-transparent" />
      </div>
    </div>
  );
};
