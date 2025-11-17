// app/components/machine/views/modelstepview.tsx
"use client"
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, Target, TrendingUp } from "lucide-react";
import Preview from "@/components/machine/views/preview";
import VariableSelection from "@/components/machine/views/variable-selection";
import Results from "@/components/machine/views/results";
import { useModel } from "@/app/context";

interface ModelStepViewProps {
  modelId: string;
}

const ModelStepView = ({ modelId }: ModelStepViewProps) => {
  const { modelId: contextModelId, dataset, isLoading, currentView, setCurrentView } = useModel();
  const router = useRouter();

  useEffect(() => {
    console.log("URL modelId:", modelId);
    console.log("Context modelId:", contextModelId);
    console.log("Dataset:", dataset);
    console.log("Is Loading:", isLoading);

    if (!dataset && !isLoading) {
      console.warn("No dataset found in context, redirecting to upload page");
      router.push("/app");
    }
  }, [modelId, contextModelId, dataset, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-woodsmoke-50 font-space-grotesk">Loading dataset...</p>
      </div>
    );
  }

  if (!dataset) {
    return null;
  }

  // Get title and subtitle based on current view
  const getViewTitle = () => {
    switch (currentView) {
      case "preview":
        return { stepNumber: "01", subtitle: "Let's begin with", title: "Data previsualization" };
      case "train":
      case "selection":
        return { stepNumber: "02", subtitle: "Now we proceed to", title: "Variable Selection" };
      case "results":
        return { stepNumber: "03", subtitle: "Finally, let's review", title: "Model Results" };
      default:
        return { stepNumber: "01", subtitle: "Let's begin with", title: "Data previsualization" };
    }
  };

  const { stepNumber, subtitle, title } = getViewTitle();

  // Render content based on current view
  const renderContent = () => {
    switch (currentView) {
      case "selection":
        return <VariableSelection />;
      case "results":
        return <Results />;
      case "preview":
      default:
        return <Preview />;
    }
  };

  return (
    <div className="h-full overflow-y-auto hextech-scroll pr-2">
      <div className="w-full h-fit flex flex-col lg:flex-row justify-between lg:items-center gap-3 lg:gap-0">
        <div id="TitleContainer" className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-portage-400 font-tanker text-3xl md:text-4xl opacity-60">{stepNumber}</span>
            <h4 className="font-tanker text-woodsmoke-300">{subtitle}</h4>
          </div>
          <h1 className="font-tanker text-2xl text-woodsmoke-50 ml-[calc(3rem+0.75rem)]">
            {title}
          </h1>

          {/* Descriptive text - Mobile/Tablet: below title */}
          <div className="lg:hidden mt-2">
            {currentView === "preview" && (
              <p className="text-portage-400/70 text-sm font-space-grotesk">
                If everything looks good with your data, proceed to variable selection
              </p>
            )}
            {currentView === "selection" && (
              <p className="text-portage-400/70 text-sm font-space-grotesk">
                Select your outcome variable and predictors for the model
              </p>
            )}
            {currentView === "results" && (
              <p className="text-portage-400/70 text-sm font-space-grotesk">
                Review the model results and performance metrics
              </p>
            )}
          </div>
        </div>

        {/* Desktop navigation - hidden on mobile */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Descriptive text based on current view */}
          {currentView === "preview" && (
            <p className="text-portage-400/70 text-sm font-space-grotesk text-right">
              If everything looks good with your data, <br /> proceed to variable selection
            </p>
          )}
          {currentView === "selection" && (
            <p className="text-portage-400/70 text-sm font-space-grotesk text-right">
              Select your outcome variable <br /> and predictors for the model
            </p>
          )}
          {currentView === "results" && (
            <p className="text-portage-400/70 text-sm font-space-grotesk text-right">
              Review the model results <br /> and performance metrics
            </p>
          )}

          {/* Navigation Bar */}
          <div className="relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/20 backdrop-blur-sm group">
            {/* Hextech corners */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2 border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
            <div className="absolute -top-1 -right-1 w-3 h-3 border-r-2 border-t-2 border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-l-2 border-b-2 border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />

            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-portage-500/0 via-portage-400/10 to-portage-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative flex items-center gap-0 h-10">
              <button
                onClick={() => setCurrentView("preview")}
                className={`relative px-4 h-full flex items-center transition-all duration-300 ${
                  currentView === "preview"
                    ? "text-portage-300"
                    : "text-portage-400/70 hover:text-portage-300"
                }`}
              >
                <Eye className="w-4 h-4" />
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-portage-400 transition-transform duration-300 ${
                  currentView === "preview" ? "scale-x-100" : "scale-x-0"
                }`} />
              </button>

              {/* Divider */}
              <div className="w-px h-5 bg-portage-500/30" />

              <button
                onClick={() => setCurrentView("selection")}
                className={`relative px-4 h-full flex items-center transition-all duration-300 ${
                  currentView === "selection"
                    ? "text-portage-300"
                    : "text-portage-400/70 hover:text-portage-300"
                } ${currentView === "preview" ? "pulse-glow-button" : ""}`}
              >
                <Target className="w-4 h-4" />
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-portage-400 transition-transform duration-300 ${
                  currentView === "selection" ? "scale-x-100" : "scale-x-0"
                }`} />
                {/* Pulsating glow hint when in preview */}
                {currentView === "preview" && (
                  <div className="absolute inset-0 animate-pulse-glow pointer-events-none" />
                )}
              </button>

              {/* Divider */}
              <div className="w-px h-5 bg-portage-500/30" />

              <button
                onClick={() => setCurrentView("results")}
                className={`relative px-4 h-full flex items-center transition-all duration-300 ${
                  currentView === "results"
                    ? "text-portage-300"
                    : "text-portage-400/70 hover:text-portage-300"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-portage-400 transition-transform duration-300 ${
                  currentView === "results" ? "scale-x-100" : "scale-x-0"
                }`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        {/* Render current view */}
        {renderContent()}
      </div>

      <style jsx>{`
        .hextech-scroll::-webkit-scrollbar {
          width: 8px;
        }

        .hextech-scroll::-webkit-scrollbar-track {
          background: var(--color-woodsmoke-950);
          border-left: 1px solid rgba(66, 83, 233, 0.15);
        }

        .hextech-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(
            to bottom,
            var(--color-portage-400),
            var(--color-portage-500)
          );
          border-radius: 4px;
          border: 1px solid var(--color-portage-500);
          opacity: 0.7;
        }

        .hextech-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            to bottom,
            var(--color-portage-400),
            var(--color-portage-500)
          );
          box-shadow: 0 0 12px rgba(96, 123, 244, 0.5);
          opacity: 1;
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 8px rgba(96, 123, 244, 0.3), 0 0 16px rgba(96, 123, 244, 0.15);
            background: rgba(96, 123, 244, 0.08);
          }
          50% {
            box-shadow: 0 0 16px rgba(96, 123, 244, 0.5), 0 0 24px rgba(96, 123, 244, 0.25);
            background: rgba(96, 123, 244, 0.15);
          }
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .pulse-glow-button {
          position: relative;
        }
      `}</style>
    </div>
  );
};

export default ModelStepView;