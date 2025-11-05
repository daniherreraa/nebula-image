// components/machine/views/variable-selection.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useModel } from "@/app/context";
import { Check, ChevronsUpDown, Plus, X, Play, ChevronDown, Loader2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

const VariableSelection = () => {
  const {
    dataset,
    isTraining,
    setIsTraining,
    trainingProgress,
    setTrainingProgress,
    setCurrentView,
    hasCompletedTraining,
    setHasCompletedTraining,
    trainingConfig,
    setTrainingConfig,
    setModelResults
  } = useModel();
  const [open, setOpen] = useState(false);
  const [outcomeVariable, setOutcomeVariable] = useState<string>(trainingConfig?.outcomeVariable || "");
  const [predictors, setPredictors] = useState<string[]>(trainingConfig?.predictors || []);
  const [addPredictorOpen, setAddPredictorOpen] = useState(false);
  const [handleOutliers, setHandleOutliers] = useState(trainingConfig?.handleOutliers ?? true);
  const [currentMessage, setCurrentMessage] = useState("");
  const [trainingMessages, setTrainingMessages] = useState<string[]>([]);
  const [predictorsPanelOpen, setPredictorsPanelOpen] = useState(true);
  const [showModels, setShowModels] = useState(!!trainingConfig);
  const [selectedModel, setSelectedModel] = useState<string | null>(trainingConfig?.selectedModel || null);

  // Refs for smooth scrolling
  const predictorsSectionRef = useRef<HTMLDivElement>(null);
  const modelsSectionRef = useRef<HTMLDivElement>(null);
  const trainingSectionRef = useRef<HTMLDivElement>(null);

  // Reset training state when model changes
  const handleModelSelect = (modelId: string) => {
    if (selectedModel !== modelId) {
      // Reset training state for new model
      setHasCompletedTraining(false);
      setIsTraining(false);
      setTrainingProgress(0);
    }
    setSelectedModel(modelId);
  };

  // Update current message based on training progress
  useEffect(() => {
    if (!isTraining || trainingMessages.length === 0) return;

    const progressPerStep = 100 / trainingMessages.length;
    const messageIndex = Math.floor(trainingProgress / progressPerStep);

    if (messageIndex < trainingMessages.length) {
      setCurrentMessage(trainingMessages[messageIndex]);
    }
  }, [trainingProgress, trainingMessages, isTraining]);

  // Helper function to render text with special characters having lower opacity
  const renderTextWithSpecialChars = (text: string) => {
    const specialChars = /[_\/\*\-\.]/g;
    const parts = text.split(specialChars);
    const matches = text.match(specialChars) || [];

    return (
      <>
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {matches[index] && (
              <span className="opacity-30">{matches[index]}</span>
            )}
          </span>
        ))}
      </>
    );
  };

  // Simulate training process
  const startTraining = () => {
    if (!selectedModel) return;

    // Save training configuration to context
    setTrainingConfig({
      outcomeVariable,
      predictors,
      selectedModel,
      handleOutliers
    });

    setIsTraining(true);
    setTrainingProgress(0);

    const messages = handleOutliers
      ? [
          "Revisando datos",
          "Detectando outliers",
          "Eliminando outliers",
          "Encontrando NaNs",
          "Imputando NaNs con modelos de ML",
          "Generando resultados",
        ]
      : [
          "Revisando datos",
          "Preparando features",
          "Entrenando modelo",
          "Generando resultados",
        ];

    // Set messages for useEffect to handle
    setTrainingMessages(messages);

    const interval: NodeJS.Timeout = setInterval(() => {
      setTrainingProgress((prev) => {
        const newProgress = Math.min(prev + 1, 100);

        if (newProgress >= 100) {
          clearInterval(interval);
          setHasCompletedTraining(true);

          // Generate mock results and save to context
          // TODO: Replace with actual API call
          const mockResults = {
            metrics: {
              r2: 0.85 + Math.random() * 0.1,
              accuracy: 0.82 + Math.random() * 0.12,
              mse: 45 + Math.random() * 30
            },
            predictions: Array.from({ length: 15 }, () => ({
              actual: 100 + Math.random() * 400,
              predicted: 100 + Math.random() * 400
            })),
            featureImportance: predictors.slice(0, 8).map((pred, idx) => ({
              index: idx,
              importance: 1 + Math.random() * 5,
              name: pred
            })),
            timestamp: new Date().toISOString()
          };

          setModelResults(mockResults);

          // Navigate to results immediately
          setCurrentView("results");
        }
        return newProgress;
      });
    }, 80); // Update every 80ms for smooth animation
  };

  const availableColumns = dataset?.column_names || [];
  const availablePredictors = availableColumns.filter(
    (col) => col !== outcomeVariable && !predictors.includes(col)
  );

  const handleOutcomeSelect = (value: string) => {
    setOutcomeVariable(value);
    setOpen(false);
    // Auto-populate all other columns as predictors
    const otherColumns = availableColumns.filter((col) => col !== value);
    setPredictors(otherColumns);
  };

  const handleAddPredictor = (value: string) => {
    if (!predictors.includes(value)) {
      setPredictors([...predictors, value]);
    }
    setAddPredictorOpen(false);
  };

  const handleRemovePredictor = (value: string) => {
    setPredictors(predictors.filter((p) => p !== value));
  };

  // Reset isTraining when navigating back to selection view
  useEffect(() => {
    // If we've completed training and we're in the selection view,
    // reset isTraining to show the form again
    if (hasCompletedTraining && isTraining && trainingProgress >= 100) {
      setIsTraining(false);
    }
  }, [hasCompletedTraining, isTraining, trainingProgress, setIsTraining]);

  // Smooth scroll when outcome variable is selected (predictors panel appears)
  useEffect(() => {
    if (outcomeVariable && predictorsSectionRef.current) {
      setTimeout(() => {
        predictorsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [outcomeVariable]);

  // Smooth scroll when models section appears
  useEffect(() => {
    if (showModels && modelsSectionRef.current) {
      setTimeout(() => {
        modelsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [showModels]);

  // Smooth scroll when training section appears
  useEffect(() => {
    if (selectedModel && trainingSectionRef.current) {
      setTimeout(() => {
        trainingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [selectedModel]);

  if (!dataset) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-woodsmoke-400">No dataset available</p>
      </div>
    );
  }

  // If training, show loading screen
  if (isTraining) {
    const prevProgress = Math.max(trainingProgress - 1, 0);
    const nextProgress = Math.min(trainingProgress + 1, 100);
    const isComplete = trainingProgress >= 100;

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
        {!isComplete ? (
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
              onClick={() => setCurrentView("results")}
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
  }

  return (
    <div className="h-full flex flex-col gap-6 py-6">
      {/* Outcome Variable Combobox */}
      <div className="flex flex-col gap-3 overflow-hidden">
        <div className="flex items-center gap-3">
          <h3 className="text-portage-300 font-space-grotesk text-sm uppercase tracking-[0.2em]">
            Outcome Variable
          </h3>
          <div className="h-px flex-1 bg-gradient-to-r from-portage-500/50 via-portage-400/30 to-transparent" />
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between text-left font-space-grotesk text-portage-200 hover:text-portage-100 transition-colors flex items-center gap-2 group"
            >
              {/* Glitch effect with layered text */}
              <div className="relative text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-tanker tracking-wide">
                {outcomeVariable ? (
                  <>
                    {/* Main text (100% opacity) */}
                    <span className="relative z-30">
                      {renderTextWithSpecialChars(outcomeVariable)}
                    </span>

                    {/* Motion trail - subtle traces */}
                    <span
                      className={cn(
                        "absolute top-0 left-0 z-25 opacity-15 blur-[2px] transition-all duration-400 ease-out",
                        open ? "translate-x-0 opacity-0" : "translate-x-[35%]"
                      )}
                    >
                      {renderTextWithSpecialChars(outcomeVariable)}
                    </span>

                    <span
                      className={cn(
                        "absolute top-0 left-0 z-24 opacity-10 blur-[3px] transition-all duration-450 ease-out",
                        open ? "translate-x-0 opacity-0" : "translate-x-[70%]"
                      )}
                    >
                      {renderTextWithSpecialChars(outcomeVariable)}
                    </span>

                    {/* First echo (25% opacity) - appears when not open */}
                    <span
                      className={cn(
                        "absolute top-0 left-0 z-20 opacity-25 blur-[1.5px] transition-all duration-500 ease-out",
                        open ? "translate-x-0 opacity-0 blur-0" : "translate-x-[105%]"
                      )}
                    >
                      {renderTextWithSpecialChars(outcomeVariable)}
                    </span>

                    {/* Trail between first and second echo */}
                    <span
                      className={cn(
                        "absolute top-0 left-0 z-15 opacity-[0.08] blur-[3.5px] transition-all duration-600 ease-out",
                        open ? "translate-x-0 opacity-0" : "translate-x-[157.5%]"
                      )}
                    >
                      {renderTextWithSpecialChars(outcomeVariable)}
                    </span>

                    {/* Second echo (15% opacity) - appears when not open */}
                    <span
                      className={cn(
                        "absolute top-0 left-0 z-10 opacity-15 blur-[2.5px] transition-all duration-700 ease-out",
                        open ? "translate-x-0 opacity-0 blur-0" : "translate-x-[210%]"
                      )}
                    >
                      {renderTextWithSpecialChars(outcomeVariable)}
                    </span>
                  </>
                ) : (
                  <span>Select outcome variable...</span>
                )}
              </div>
              <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 text-portage-400 group-hover:text-portage-300 transition-colors" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[600px] p-0 border-0 shadow-none"
            align="start"
          >
            {/* Custom styled dropdown matching correlation panel tabs content */}
            <div className="relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/20 backdrop-blur-sm">
              {/* Background pattern - hextech lines */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg
                  className="w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern
                      id="hextech-grid-outcome"
                      width="40"
                      height="40"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 0 20 L 40 20 M 20 0 L 20 40"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        className="text-portage-400"
                        fill="none"
                      />
                      <circle
                        cx="20"
                        cy="20"
                        r="1.5"
                        fill="currentColor"
                        className="text-portage-400"
                      />
                    </pattern>
                  </defs>
                  <rect
                    width="100%"
                    height="100%"
                    fill="url(#hextech-grid-outcome)"
                  />
                </svg>
              </div>

              <div className="absolute inset-0 bg-gradient-to-r from-portage-500/5 via-portage-400/10 to-portage-500/5 pointer-events-none" />

              <Command className="relative border-0">
                <CommandInput
                  placeholder="Search variables..."
                  className="font-space-grotesk border-b border-portage-500/20 text-portage-200 placeholder:text-portage-400/50"
                />
                <CommandList className="max-h-[300px] hextech-scroll">
                  <CommandEmpty className="text-portage-400/70 py-6">
                    No variable found.
                  </CommandEmpty>
                  <CommandGroup className="p-2">
                    {availableColumns.map((column) => (
                      <CommandItem
                        key={column}
                        value={column}
                        onSelect={handleOutcomeSelect}
                        className="cursor-pointer px-3 py-2 rounded-none border border-transparent hover:border-portage-500/40 hover:bg-woodsmoke-900/50 data-[selected=true]:bg-woodsmoke-900/80 data-[selected=true]:border-portage-500/60 transition-all"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 text-portage-400",
                            outcomeVariable === column
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <span className="text-portage-200 font-space-grotesk">
                          {column}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Predictors Panel - Only show if outcome variable is selected */}
      {outcomeVariable && (
        <div ref={predictorsSectionRef} className="flex flex-col gap-4">
          <button
            onClick={() => setPredictorsPanelOpen(!predictorsPanelOpen)}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <h3 className="text-portage-300 font-space-grotesk text-sm uppercase tracking-[0.2em] group-hover:text-portage-200 transition-colors">
              Predictor Panel
            </h3>
            <div className="h-px flex-1 bg-gradient-to-r from-portage-500/50 via-portage-400/30 to-transparent" />
            <ChevronDown className={`w-4 h-4 text-portage-400 transition-transform duration-300 ${predictorsPanelOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Predictors Panel with same style as correlation panel content */}
          {predictorsPanelOpen && (
            <div className="relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/20 backdrop-blur-sm">
              {/* Background pattern - hextech lines */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern
                      id="hextech-grid-predictors"
                      width="40"
                      height="40"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 0 20 L 40 20 M 20 0 L 20 40"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        className="text-portage-400"
                        fill="none"
                      />
                      <circle
                        cx="20"
                        cy="20"
                        r="1.5"
                        fill="currentColor"
                        className="text-portage-400"
                      />
                    </pattern>
                  </defs>
                  <rect
                    width="100%"
                    height="100%"
                    fill="url(#hextech-grid-predictors)"
                  />
                </svg>
              </div>

              <div className="absolute inset-0 bg-gradient-to-r from-portage-500/5 via-portage-400/10 to-portage-500/5 pointer-events-none" />

              <div className="relative p-6 min-h-[120px] max-h-[180px] flex flex-col gap-4 overflow-y-auto hextech-scroll">
              {/* Predictor cards grid */}
              <div className="flex flex-wrap gap-3">
                {predictors.map((predictor) => (
                  <div
                    key={predictor}
                    className="relative group cursor-pointer"
                    onClick={() => handleRemovePredictor(predictor)}
                  >
                    {/* Esquinas decorativas estilo hextech */}
                    <div className="absolute -top-1 -left-1 w-2 h-2 border-l border-t border-portage-500/40 group-hover:border-red-400/80 transition-colors duration-300" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 border-r border-t border-portage-500/40 group-hover:border-red-400/80 transition-colors duration-300" />
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 border-l border-b border-portage-500/40 group-hover:border-red-400/80 transition-colors duration-300" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 border-r border-b border-portage-500/40 group-hover:border-red-400/80 transition-colors duration-300" />

                    <div className="relative flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-woodsmoke-900/80 backdrop-blur-sm border border-portage-500/30 group-hover:border-red-400/60 transition-all duration-300">
                      {/* Background glow on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 via-red-400/5 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="w-1 h-1 rounded-full bg-portage-400 group-hover:bg-red-400 transition-colors" />
                      <span className="text-portage-200 font-space-grotesk text-xs sm:text-sm group-hover:text-red-300 transition-colors relative z-10">
                        {predictor}
                      </span>
                      <X className="w-3 h-3 text-portage-400/60 group-hover:text-red-400 transition-colors relative z-10" />
                    </div>
                  </div>
                ))}

                {/* Add predictor button */}
                <Popover
                  open={addPredictorOpen}
                  onOpenChange={setAddPredictorOpen}
                >
                  <PopoverTrigger asChild>
                    <button className="relative group">
                      {/* Esquinas decorativas */}
                      <div className="absolute -top-1 -left-1 w-2 h-2 border-l border-t border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 border-r border-t border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
                      <div className="absolute -bottom-1 -left-1 w-2 h-2 border-l border-b border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
                      <div className="absolute -bottom-1 -right-1 w-2 h-2 border-r border-b border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />

                      <div className="relative flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-woodsmoke-900/80 backdrop-blur-sm border border-portage-500/30 group-hover:border-portage-400/60 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-portage-500/0 via-portage-400/5 to-portage-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-portage-400 group-hover:text-portage-300 transition-colors relative z-10" />
                        <span className="text-portage-400 font-space-grotesk text-xs sm:text-sm group-hover:text-portage-300 transition-colors relative z-10">
                          Add Predictor
                        </span>
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[400px] p-0 border-0 shadow-none"
                    align="start"
                  >
                    {/* Custom styled dropdown */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/20 backdrop-blur-sm">
                      <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <svg
                          className="w-full h-full"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <defs>
                            <pattern
                              id="hextech-grid-add"
                              width="40"
                              height="40"
                              patternUnits="userSpaceOnUse"
                            >
                              <path
                                d="M 0 20 L 40 20 M 20 0 L 20 40"
                                stroke="currentColor"
                                strokeWidth="0.5"
                                className="text-portage-400"
                                fill="none"
                              />
                              <circle
                                cx="20"
                                cy="20"
                                r="1.5"
                                fill="currentColor"
                                className="text-portage-400"
                              />
                            </pattern>
                          </defs>
                          <rect
                            width="100%"
                            height="100%"
                            fill="url(#hextech-grid-add)"
                          />
                        </svg>
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-r from-portage-500/5 via-portage-400/10 to-portage-500/5 pointer-events-none" />

                      <Command className="relative border-0">
                        <CommandInput
                          placeholder="Search variables..."
                          className="border-b border-portage-500/20 text-portage-200 placeholder:text-portage-400/50"
                        />
                        <CommandList className="max-h-[250px] hextech-scroll">
                          <CommandEmpty className="text-portage-400/70 py-6">
                            No variable found.
                          </CommandEmpty>
                          <CommandGroup className="p-2">
                            {availablePredictors.map((column) => (
                              <CommandItem
                                key={column}
                                value={column}
                                onSelect={handleAddPredictor}
                                className="cursor-pointer px-3 py-2 rounded-none border border-transparent hover:border-portage-500/40 hover:bg-woodsmoke-900/50 data-[selected=true]:bg-woodsmoke-900/80 data-[selected=true]:border-portage-500/60 transition-all"
                              >
                                <Plus className="mr-2 h-4 w-4 text-portage-400" />
                                <span className="text-portage-200 font-space-grotesk">
                                  {column}
                                </span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {predictors.length === 0 && (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-portage-400/50 font-space-grotesk text-sm">
                    Click &quot;Add Predictor&quot; to select predictor variables
                  </p>
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      )}

      {/* Model Selection Section - Only show if outcome and predictors are set */}
      {outcomeVariable && predictors.length > 0 && (
        <div ref={modelsSectionRef} className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-portage-300 font-space-grotesk text-sm uppercase tracking-[0.2em]">
              Model Selection
            </h3>
            <div className="h-px flex-1 bg-gradient-to-r from-portage-500/50 via-portage-400/30 to-transparent" />
          </div>

          {!showModels ? (
            <button
              onClick={() => setShowModels(true)}
              className="relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/20 backdrop-blur-sm transition-all duration-300 hover:border-portage-400/40 group"
            >
              {/* Hextech glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-portage-500/5 via-portage-400/10 to-portage-500/5 pointer-events-none" />

              <div className="relative px-5 py-3 flex items-center justify-center gap-2">
                <span className="text-portage-300 font-space-grotesk text-sm uppercase tracking-[0.15em] group-hover:text-portage-200 transition-colors">
                  View Recommended Models
                </span>
              </div>
            </button>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { id: "linear_regression", name: "Linear Regression", description: "Simple, fast model for linear relationships between variables" },
                { id: "random_forest", name: "Random Forest", description: "Powerful ensemble method that handles non-linear patterns well" },
                { id: "decision_tree", name: "Decision Tree", description: "Interpretable model that creates clear decision rules" },
              ].map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelSelect(model.id)}
                  className="relative group text-left"
                >
                  {/* Hextech corners */}
                  <div className="absolute -top-1 -left-1 w-2 h-2 border-l border-t border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 border-r border-t border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 border-l border-b border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 border-r border-b border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />

                  <div className={`relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border transition-all duration-300 ${
                    selectedModel === model.id
                      ? "border-portage-400/60 brightness-110"
                      : "border-portage-500/20 group-hover:border-portage-400/40"
                  }`}>
                    {/* Hextech glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-portage-500/5 via-portage-400/10 to-portage-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    {/* Selected indicator bar */}
                    {selectedModel === model.id && (
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
      )}

      {/* Start Training Section - Only show if outcome, predictors, and model are set */}
      {outcomeVariable && predictors.length > 0 && selectedModel && (
        <div ref={trainingSectionRef} className="mt-8 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-portage-300 font-space-grotesk text-sm uppercase tracking-[0.2em]">
              Training Configuration
            </h3>
            <div className="h-px flex-1 bg-gradient-to-r from-portage-500/50 via-portage-400/30 to-transparent" />
          </div>

          <div className="flex items-center justify-between gap-6">
            {/* Outliers/NaNs treatment switch */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Switch
                  checked={handleOutliers}
                  onCheckedChange={setHandleOutliers}
                  id="outliers-switch"
                />
                <label
                  htmlFor="outliers-switch"
                  className="text-portage-300 font-space-grotesk text-sm cursor-pointer select-none"
                >
                  Handle Outliers & NaNs
                </label>
              </div>
              <div className="text-portage-400/60 font-space-grotesk text-xs">
                {handleOutliers ? "Enabled" : "Disabled"}
              </div>
            </div>

            {/* Start Training Button */}
            <button
              onClick={startTraining}
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
      )}

      <style jsx>{`
        .hextech-scroll::-webkit-scrollbar {
          width: 0.375rem;
        }

        .hextech-scroll::-webkit-scrollbar-track {
          background: var(--color-woodsmoke-950);
          border-left: 1px solid rgba(137, 166, 251, 0.1);
        }

        .hextech-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(
            to bottom,
            var(--color-portage-600),
            var(--color-portage-500)
          );
          border-radius: 0;
          border-left: 1px solid var(--color-portage-400);
        }

        .hextech-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            to bottom,
            var(--color-portage-500),
            var(--color-portage-400)
          );
          box-shadow: 0 0 0.5rem rgba(137, 166, 251, 0.4);
        }
      `}</style>
    </div>
  );
};

export default VariableSelection;
