// components/machine/training-loading-screen.tsx
"use client";
import { FileText, AlertCircle } from "lucide-react";

interface TrainingLoadingScreenProps {
  trainingProgress: number;
  currentMessage: string;
  onViewResults: () => void;
  hasError?: boolean;
}

export const TrainingLoadingScreen = ({
  trainingProgress,
  currentMessage,
  onViewResults,
  hasError = false,
}: TrainingLoadingScreenProps) => {
  const prevProgress = Math.max(trainingProgress - 1, 0);
  const nextProgress = Math.min(trainingProgress + 1, 100);
  const isComplete = trainingProgress >= 100 && !hasError;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 sm:gap-12 px-4">
      {/* Loading Counter */}
      <div className="relative flex items-center justify-center">
        <div className="relative text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-tanker tracking-wide">
          {/* Main text (100% opacity) - ACTUAL */}
          <span className="relative z-50 text-portage-200">
            {String(trainingProgress).padStart(2, "0")}%
          </span>

          {/* Previous value (actual - 1) - con espaciado negativo */}
          <span className="absolute top-0 left-0 z-40 text-portage-300 opacity-20 blur-[2px] -translate-x-[15%]">
            {String(prevProgress).padStart(2, "0")}%
          </span>

          {/* Next value (actual + 1) - con espaciado negativo */}
          <span className="absolute top-0 left-0 z-40 text-portage-300 opacity-20 blur-[2px] translate-x-[15%]">
            {String(nextProgress).padStart(2, "0")}%
          </span>

          {/* Random echoes - capas aleatorias bien difuminadas */}
          {/* Echo 1: actual - aleatorio más difuminado */}
          <span className="absolute top-0 left-0 z-30 text-portage-300 opacity-12 blur-[3px] -translate-x-[25%]">
            {String(Math.max(trainingProgress - 2, 0)).padStart(2, "0")}%
          </span>

          {/* Echo 2: actual + aleatorio más difuminado */}
          <span className="absolute top-0 left-0 z-30 text-portage-300 opacity-12 blur-[3px] translate-x-[25%]">
            {String(Math.min(trainingProgress + 2, 100)).padStart(2, "0")}%
          </span>

          {/* Echo 3: muy difuminado izquierda */}
          <span className="absolute top-0 left-0 z-20 text-portage-300 opacity-8 blur-[4px] -translate-x-[35%]">
            {String(Math.max(trainingProgress - 3, 0)).padStart(2, "0")}%
          </span>

          {/* Echo 4: muy difuminado derecha */}
          <span className="absolute top-0 left-0 z-20 text-portage-300 opacity-8 blur-[4px] translate-x-[35%]">
            {String(Math.min(trainingProgress + 3, 100)).padStart(2, "0")}%
          </span>

          {/* Echo 5: súper difuminado izquierda */}
          <span className="absolute top-0 left-0 z-10 text-portage-300 opacity-5 blur-[5px] -translate-x-[45%]">
            {String(Math.max(trainingProgress - 4, 0)).padStart(2, "0")}%
          </span>

          {/* Echo 6: súper difuminado derecha */}
          <span className="absolute top-0 left-0 z-10 text-portage-300 opacity-5 blur-[5px] translate-x-[45%]">
            {String(Math.min(trainingProgress + 4, 100)).padStart(2, "0")}%
          </span>
        </div>
      </div>

      {/* Progress message */}
      {hasError ? (
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="w-12 h-12 text-red-400 animate-pulse" />
          <div className="text-red-300 font-space-grotesk text-sm sm:text-base md:text-lg tracking-wide text-center max-w-md">
            {currentMessage}
          </div>
        </div>
      ) : !isComplete ? (
        <div className="text-portage-300 font-space-grotesk text-sm sm:text-base md:text-lg tracking-wide animate-pulse text-center">
          {currentMessage}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="text-portage-200 font-tanker text-2xl sm:text-3xl tracking-wide">
            Model Ready
          </div>

          {/* View Results Button */}
          <button
            onClick={onViewResults}
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
            <div className="relative px-6 py-3 flex items-center gap-3">
              <FileText className="w-4 h-4 text-portage-400 group-hover:text-portage-300 transition-colors" />
              <span className="text-portage-300 font-space-grotesk text-sm uppercase tracking-[0.15em] group-hover:text-portage-200 transition-colors">
                View Results
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
