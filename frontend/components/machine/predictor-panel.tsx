// components/machine/predictor-panel.tsx
"use client";
import { useState } from "react";
import { Plus, X, ChevronDown } from "lucide-react";
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

interface PredictorPanelProps {
  predictors: string[];
  availablePredictors: string[];
  onAddPredictor: (value: string) => void;
  onRemovePredictor: (value: string) => void;
}

export const PredictorPanel = ({
  predictors,
  availablePredictors,
  onAddPredictor,
  onRemovePredictor,
}: PredictorPanelProps) => {
  const [addPredictorOpen, setAddPredictorOpen] = useState(false);
  const [predictorsPanelOpen, setPredictorsPanelOpen] = useState(true);

  const handleAddPredictor = (value: string) => {
    onAddPredictor(value);
    setAddPredictorOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <button
          onClick={() => setPredictorsPanelOpen(!predictorsPanelOpen)}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <span className="text-portage-400 font-tanker text-2xl sm:text-3xl opacity-60">02</span>
          <h3 className="text-portage-300 font-space-grotesk text-xs sm:text-sm uppercase tracking-[0.2em] group-hover:text-portage-200 transition-colors">
            Predictor Panel
          </h3>
          <div className="h-px flex-1 bg-gradient-to-r from-portage-500/50 via-portage-400/30 to-transparent" />
          <ChevronDown className={`w-4 h-4 text-portage-400 transition-transform duration-300 ${predictorsPanelOpen ? 'rotate-180' : ''}`} />
        </button>

        {predictorsPanelOpen && (
          <p className="text-woodsmoke-100 font-space-grotesk text-base leading-relaxed">
            Click on any variable to remove it from the predictor selection. These are the features your model will use to make predictions.
          </p>
        )}
      </div>

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
                  onClick={() => onRemovePredictor(predictor)}
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
                <p className="text-portage-400/50 font-space-grotesk text-xs sm:text-sm">
                  Click &quot;Add Predictor&quot; to select predictor variables
                </p>
              </div>
            )}
          </div>

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
      )}
    </div>
  );
};
