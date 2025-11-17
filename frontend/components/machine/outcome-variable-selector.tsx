// components/machine/outcome-variable-selector.tsx
"use client";
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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

interface OutcomeVariableSelectorProps {
  outcomeVariable: string;
  availableColumns: string[];
  onSelect: (value: string) => void;
}

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

export const OutcomeVariableSelector = ({
  outcomeVariable,
  availableColumns,
  onSelect,
}: OutcomeVariableSelectorProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (value: string) => {
    onSelect(value);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-3 overflow-hidden">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="text-portage-400 font-tanker text-2xl sm:text-3xl opacity-60">01</span>
          <h3 className="text-portage-300 font-space-grotesk text-sm uppercase tracking-[0.2em]">
            Target Variable
          </h3>
          <div className="h-px flex-1 bg-gradient-to-r from-portage-500/50 via-portage-400/30 to-transparent" />
        </div>

        <p className="text-woodsmoke-100 font-space-grotesk text-base leading-relaxed">
          Select the variable you want to predict. This is the outcome your model will learn to forecast based on the predictor variables.
        </p>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            role="combobox"
            aria-expanded={open}
            className="relative w-full justify-between text-left font-space-grotesk text-portage-200 hover:text-portage-100 transition-all flex items-center gap-2 group cursor-pointer px-4 py-3 overflow-hidden border border-portage-500/20 hover:border-portage-400/40 bg-gradient-to-r from-woodsmoke-950/40 via-woodsmoke-950/60 to-woodsmoke-950/40 hover:from-portage-500/10 hover:via-portage-400/20 hover:to-portage-500/10"
          >
            {/* Energy glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-portage-500/0 via-portage-400/20 to-portage-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer pointer-events-none" />

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
                <span>Select target variable...</span>
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
                      onSelect={handleSelect}
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

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        :global(.animate-shimmer) {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
