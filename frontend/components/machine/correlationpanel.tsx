"use client";
import { useEffect, useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useModel } from "@/app/context";
import { getClientApiUrl } from "@/lib/config";

interface CorrelationItem {
  variable1: string;
  variable2: string;
  correlation: number | null;
  pValue: number | null;
}

interface CorrelationPanelProps {
  columns: string[];
}

const CorrelationPanel = ({ columns }: CorrelationPanelProps) => {
  const { correlationData, setCorrelationData } = useModel();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch correlation data when component mounts or columns change
    const fetchCorrelations = async () => {
      if (columns.length < 2) return;

      setIsLoading(true);
      setError(null);

      try {
        const apiUrl = getClientApiUrl();

        const response = await fetch(`${apiUrl}/api/correlations?top_n=10`);

        if (!response.ok) {
          throw new Error(`Failed to fetch correlations: ${response.statusText}`);
        }

        const data = await response.json();
        setCorrelationData(data);
      } catch (err) {
        console.error("Error fetching correlations:", err);
        setError("Failed to load correlations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCorrelations();
  }, [columns, setCorrelationData]);

  const getMethodCorrelations = (method: string): CorrelationItem[] => {
    if (!correlationData || !correlationData.all_correlations) {
      return [];
    }

    return correlationData.all_correlations
      .map((corr) => {
        const methodData = corr[method as 'pearson' | 'spearman' | 'kendall'];
        return {
          variable1: corr.variable_1,
          variable2: corr.variable_2,
          correlation: methodData?.correlation ?? null,
          pValue: methodData?.p_value ?? null,
        };
      })
      .filter((item) => item.correlation !== null)
      .sort((a, b) => Math.abs(b.correlation!) - Math.abs(a.correlation!))
      .slice(0, 10);
  };

  const CorrelationList = ({ method }: { method: string }) => {
    const topCorrelations = useMemo(() => getMethodCorrelations(method), [method, correlationData]);

    if (isLoading) {
      return (
        <div className="relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border-x border-b border-portage-500/20 backdrop-blur-sm h-full flex flex-col items-center justify-center">
          {/* Hextech loading animation */}
          <div className="relative flex items-center justify-center mb-4">
            {/* Rotating hexagon */}
            <svg className="w-16 h-16 text-portage-400 animate-spin-slow" viewBox="0 0 100 100">
              <polygon
                points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="opacity-60"
              />
              <polygon
                points="50,15 80,32.5 80,67.5 50,85 20,67.5 20,32.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="opacity-40"
              />
            </svg>
            {/* Pulsing core */}
            <div className="absolute w-3 h-3 rounded-full bg-portage-400 animate-pulse" />
            <div className="absolute w-6 h-6 rounded-full bg-portage-400/30 animate-ping" />
          </div>

          {/* Loading text */}
          <div className="text-portage-300 font-space-grotesk text-sm tracking-wider animate-pulse">
            Calculating correlations...
          </div>
          <div className="text-portage-400/60 font-space-grotesk text-xs mt-1">
            Analyzing data patterns
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border-x border-b border-portage-500/20 backdrop-blur-sm h-full flex flex-col items-center justify-center">
          <div className="text-red-400 font-space-grotesk text-sm">{error}</div>
        </div>
      );
    }

    if (topCorrelations.length === 0) {
      return (
        <div className="relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border-x border-b border-portage-500/20 backdrop-blur-sm h-full flex flex-col items-center justify-center">
          <div className="text-portage-400 font-space-grotesk text-sm">No correlations available</div>
        </div>
      );
    }

    return (
      <div className="relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border-x border-b border-portage-500/20 backdrop-blur-sm h-full flex flex-col">
        {/* Background pattern - hextech lines */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hextech-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 0 20 L 40 20 M 20 0 L 20 40" stroke="currentColor" strokeWidth="0.5" className="text-portage-400" fill="none"/>
                <circle cx="20" cy="20" r="1.5" fill="currentColor" className="text-portage-400"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hextech-grid)"/>
          </svg>
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-portage-500/5 via-portage-400/10 to-portage-500/5 pointer-events-none" />
        
        <div className="relative flex-1 flex flex-col p-6 overflow-hidden">
          {/* Header con engranaje decorativo */}
          <div className="flex items-center gap-3 mb-6 flex-shrink-0">
            <div className="relative">
              {/* Engranaje animado */}
              <svg className="w-6 h-6 text-portage-400 animate-spin-slow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.5 6.5L12 7L10.5 6.5L12 2Z" fill="currentColor"/>
                <path d="M12 22L13.5 17.5L12 17L10.5 17.5L12 22Z" fill="currentColor"/>
                <path d="M2 12L6.5 10.5L7 12L6.5 13.5L2 12Z" fill="currentColor"/>
                <path d="M22 12L17.5 10.5L17 12L17.5 13.5L22 12Z" fill="currentColor"/>
                <path d="M4.93 4.93L8.64 8.64L8 9.5L7 8.5L4.93 4.93Z" fill="currentColor"/>
                <path d="M19.07 19.07L15.36 15.36L16 14.5L17 15.5L19.07 19.07Z" fill="currentColor"/>
                <path d="M4.93 19.07L8.64 15.36L9.5 16L8.5 17L4.93 19.07Z" fill="currentColor"/>
                <path d="M19.07 4.93L15.36 8.64L14.5 8L15.5 7L19.07 4.93Z" fill="currentColor"/>
                <circle cx="12" cy="12" r="4" fill="currentColor"/>
                <circle cx="12" cy="12" r="2" fill="currentColor" className="text-woodsmoke-950"/>
              </svg>
              <div className="absolute inset-0 bg-portage-400/30 blur-md animate-pulse" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-portage-300 font-space-grotesk text-sm uppercase tracking-[0.2em] flex items-center gap-2">
                Strongest Correlations
              </h3>
              <div className="h-px bg-gradient-to-r from-portage-500/50 via-portage-400/30 to-transparent mt-1.5" />
              <p className="text-woodsmoke-100 font-space-grotesk text-base mt-2 leading-relaxed">
                Top 10 {method === 'pearson' ? "Pearson's" : method === 'spearman' ? "Spearman's" : "Kendall's"} correlations.
                {method === 'pearson' && " Pearson is known for detecting linear relationships between variables."}
                {method === 'spearman' && " Spearman measures monotonic relationships, ideal for ranked data."}
                {method === 'kendall' && " Kendall assesses ordinal associations, robust against outliers."}
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-3 sm:space-y-4 overflow-auto hextech-scroll pr-2 max-h-[50vh] sm:max-h-[60vh]">
            {topCorrelations.map((corr, idx) => (
              <div
                key={idx}
                className="relative group"
              >
                {/* Esquinas decorativas estilo hextech */}
                <div className="absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2 border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
                <div className="absolute -top-1 -right-1 w-3 h-3 border-r-2 border-t-2 border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-l-2 border-b-2 border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />

                {/* Línea vertical decorativa lateral */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-full h-full bg-gradient-to-b from-transparent via-portage-400 to-transparent" />
                </div>

                <div className="relative p-3 sm:p-4 bg-woodsmoke-900/80 backdrop-blur-sm border border-portage-500/30 clip-corners">
                  {/* Background glow en hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-portage-500/0 via-portage-400/5 to-portage-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Responsive layout: column on mobile, row on desktop */}
                  <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">
                    {/* Variables con conector */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 px-1.5 sm:px-2 py-1 bg-woodsmoke-950/50 border border-portage-500/20">
                        <div className="w-1 h-1 rounded-full bg-portage-400" />
                        <span className="text-portage-200 font-space-grotesk text-xs sm:text-sm truncate">
                          {corr.variable1}
                        </span>
                      </div>

                      {/* Conector hextech simple */}
                      <svg className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-portage-400 flex-shrink-0" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="1"/>
                        <circle cx="6" cy="6" r="0.5" fill="currentColor"/>
                      </svg>

                      <div className="flex items-center gap-1.5 px-1.5 sm:px-2 py-1 bg-woodsmoke-950/50 border border-portage-500/20">
                        <div className="w-1 h-1 rounded-full bg-portage-400" />
                        <span className="text-portage-200 font-space-grotesk text-xs sm:text-sm truncate">
                          {corr.variable2}
                        </span>
                      </div>
                    </div>

                    {/* P-value and correlation container - row on mobile, separate on desktop */}
                    <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-6">
                      {/* P-value */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <div className="w-px h-3 bg-portage-500/50" />
                          <div className="w-1 h-1 bg-portage-500/50" />
                        </div>
                        <span className="text-portage-400/80 font-space-grotesk text-xs sm:text-sm whitespace-nowrap">
                          p: {corr.pValue !== null ? corr.pValue.toFixed(4) : 'N/A'}
                        </span>
                      </div>

                      {/* Valor de correlación centrado en hexágono - smaller on mobile */}
                      <div className="flex flex-col items-center gap-1.5 sm:gap-2 flex-shrink-0">
                        <div className="relative flex items-center justify-center">
                          {/* Hexágono de fondo - responsive size */}
                          <svg className="absolute w-12 h-12 sm:w-16 sm:h-16 text-portage-500/20" viewBox="0 0 100 100">
                            <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" fill="currentColor" stroke="currentColor" strokeWidth="1"/>
                          </svg>

                          <div className={`relative text-base sm:text-lg font-space-grotesk font-bold tabular-nums ${
                            corr.correlation !== null && Math.abs(corr.correlation) > 0.7 ? 'text-portage-300' : 'text-portage-400'
                          }`}
                          style={{
                            textShadow: corr.correlation !== null && Math.abs(corr.correlation) > 0.7
                              ? '0 0 0.625rem rgba(137, 166, 251, 0.6), 0 0 1.25rem rgba(137, 166, 251, 0.3)'
                              : 'none'
                          }}>
                            {corr.correlation !== null ? corr.correlation.toFixed(3) : 'N/A'}
                          </div>
                        </div>

                        {/* Indicador de fuerza - smaller bars on mobile */}
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-1 sm:w-1.5 h-1.5 sm:h-2 ${
                                corr.correlation !== null && i < Math.abs(corr.correlation) * 5
                                  ? 'bg-portage-400'
                                  : 'bg-woodsmoke-800'
                              } transition-colors duration-300`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex flex-col w-full h-full overflow-hidden">
      <Tabs defaultValue="pearson" className="w-full flex flex-col h-full">
        <TabsList className="w-full h-auto bg-woodsmoke-900/90 backdrop-blur-sm border-t border-x border-portage-500/20 p-0 gap-0 rounded-none grid grid-cols-3 flex-shrink-0 relative">
          {/* Líneas decorativas superiores */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-portage-400/50 to-transparent" />
          
          <TabsTrigger 
            value="pearson"
            className="rounded-none font-space-grotesk text-xs uppercase tracking-[0.15em] transition-all duration-300 relative
              data-[state=inactive]:text-portage-400/60 data-[state=inactive]:bg-transparent
              data-[state=active]:text-portage-300 data-[state=active]:bg-woodsmoke-950/50
              border-r border-portage-500/10 py-3 group"
          >
            <div className="flex items-center gap-2">
              <svg className="w-2 h-2 text-portage-400 group-data-[state=active]:animate-pulse" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="3" stroke="currentColor" strokeWidth="1" fill="none"/>
                <circle cx="4" cy="4" r="1" fill="currentColor"/>
              </svg>
              Pearson
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-portage-400 scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
          </TabsTrigger>
          
          <TabsTrigger 
            value="kendall"
            className="rounded-none font-space-grotesk text-xs uppercase tracking-[0.15em] transition-all duration-300 relative
              data-[state=inactive]:text-portage-400/60 data-[state=inactive]:bg-transparent
              data-[state=active]:text-portage-300 data-[state=active]:bg-woodsmoke-950/50
              border-r border-portage-500/10 py-3 group"
          >
            <div className="flex items-center gap-2">
              <svg className="w-2 h-2 text-portage-400 group-data-[state=active]:animate-pulse" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="3" stroke="currentColor" strokeWidth="1" fill="none"/>
                <circle cx="4" cy="4" r="1" fill="currentColor"/>
              </svg>
              Kendall
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-portage-400 scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
          </TabsTrigger>
          
          <TabsTrigger 
            value="spearman"
            className="rounded-none font-space-grotesk text-xs uppercase tracking-[0.15em] transition-all duration-300 relative
              data-[state=inactive]:text-portage-400/60 data-[state=inactive]:bg-transparent
              data-[state=active]:text-portage-300 data-[state=active]:bg-woodsmoke-950/50
              py-3 group"
          >
            <div className="flex items-center gap-2">
              <svg className="w-2 h-2 text-portage-400 group-data-[state=active]:animate-pulse" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="3" stroke="currentColor" strokeWidth="1" fill="none"/>
                <circle cx="4" cy="4" r="1" fill="currentColor"/>
              </svg>
              Spearman
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-portage-400 scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="pearson" className="h-full m-0">
            <CorrelationList method="pearson" />
          </TabsContent>
          <TabsContent value="kendall" className="h-full m-0">
            <CorrelationList method="kendall" />
          </TabsContent>
          <TabsContent value="spearman" className="h-full m-0">
            <CorrelationList method="spearman" />
          </TabsContent>
        </div>
      </Tabs>

      <style jsx>{`
        .hextech-scroll::-webkit-scrollbar {
          width: 0.375rem;
        }
        
        .hextech-scroll::-webkit-scrollbar-track {
          background: var(--color-woodsmoke-950);
          border-left: 1px solid rgba(137, 166, 251, 0.1);
        }
        
        .hextech-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, var(--color-portage-600), var(--color-portage-500));
          border-radius: 0;
          border-left: 1px solid var(--color-portage-400);
        }
        
        .hextech-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, var(--color-portage-500), var(--color-portage-400));
          box-shadow: 0 0 0.5rem rgba(137, 166, 251, 0.4);
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }

        .clip-corners {
          clip-path: polygon(
            0 4px, 4px 0,
            calc(100% - 4px) 0, 100% 4px,
            100% calc(100% - 4px), calc(100% - 4px) 100%,
            4px 100%, 0 calc(100% - 4px)
          );
        }
      `}</style>
    </div>
  );
};

export default CorrelationPanel;